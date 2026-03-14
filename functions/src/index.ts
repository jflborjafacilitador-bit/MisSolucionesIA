import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as nodeHttps from 'https';
import * as crypto from 'crypto';

initializeApp();
const db = getFirestore();

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? '';

/**
 * Verifica la firma HMAC-SHA256 de MercadoPago.
 * Docs: https://www.mercadopago.com/developers/es/docs/your-integrations/notifications/webhooks
 */
function verifySignature(req: { headers: Record<string, string | string[] | undefined>; query: Record<string, string | undefined> }): boolean {
    if (!MP_WEBHOOK_SECRET) return true; // Si no está configurada, no bloquear

    const xSignature = req.headers['x-signature'] as string | undefined;
    const xRequestId = req.headers['x-request-id'] as string | undefined;
    const dataId = req.query['data.id'];

    if (!xSignature || !dataId) return true; // Notificación de prueba / ping

    // Parsear ts y v1 de "ts=...,v1=..."
    const parts: Record<string, string> = {};
    xSignature.split(',').forEach(part => {
        const [k, v] = part.split('=');
        if (k && v) parts[k.trim()] = v.trim();
    });

    const ts = parts['ts'];
    const v1 = parts['v1'];
    if (!ts || !v1) return false;

    // Construir el template para el HMAC
    const template = `id:${dataId};request-id:${xRequestId ?? ''};ts:${ts};`;
    const computed = crypto.createHmac('sha256', MP_WEBHOOK_SECRET).update(template).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(v1, 'hex'));
}

/**
 * Webhook de MercadoPago — recibe notificaciones de pagos.
 * URL: https://us-central1-missolucionesia.cloudfunctions.net/mpWebhook
 */
export const mpWebhook = onRequest(
    { region: 'us-central1', cors: false, invoker: 'public' },
    async (req, res): Promise<void> => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        // Verificar firma de MercadoPago
        if (!verifySignature(req as any)) {
            console.warn('Firma inválida — solicitud rechazada');
            res.status(401).send('Unauthorized');
            return;
        }

        try {
            const body = req.body as { type?: string; data?: { id?: string } };
            const topic = body.type ?? (req.query['topic'] as string | undefined) ?? null;
            const paymentId = body.data?.id ?? (req.query['data.id'] as string | undefined) ?? null;

            if (topic !== 'payment' || !paymentId) {
                res.status(200).send('ok');
                return;
            }

            // Consultar detalle del pago en MP
            const payment: Record<string, unknown> = await new Promise((resolve, reject) => {
                const options = {
                    hostname: 'api.mercadopago.com',
                    path: `/v1/payments/${paymentId}`,
                    method: 'GET',
                    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
                };
                const r = nodeHttps.request(options, (mpRes) => {
                    let raw = '';
                    mpRes.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
                    mpRes.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
                });
                r.on('error', reject);
                r.end();
            });

            console.log(`Pago ${paymentId} status=${payment['status']} ref=${payment['external_reference']}`);

            if (payment['status'] !== 'approved') {
                res.status(200).send('ok');
                return;
            }

            const extRef = String(payment['external_reference'] ?? '');

            // ── FORMATO 1: cotizacionId (pago inicial del proyecto) ──────────
            if (extRef && !extRef.includes(':')) {
                const cotizRef = db.collection('cotizaciones').doc(extRef);
                const cotiz = await cotizRef.get();
                if (cotiz.exists) {
                    await cotizRef.update({
                        pagadoConfirmado: true,
                        pagoFecha: FieldValue.serverTimestamp(),
                        pagoId: paymentId,
                        pagoMonto: payment['transaction_amount'] ?? null,
                    });
                    console.log(`✅ Cotización ${extRef} PAGADA`);
                }
            }

            // ── FORMATO 2: clienteId:mes:anio (mensualidad de mantenimiento) ─
            if (extRef && extRef.includes(':')) {
                const [clienteId, mesStr, anioStr] = extRef.split(':');
                const mes = parseInt(mesStr ?? '', 10);
                const anio = parseInt(anioStr ?? '', 10);

                if (clienteId && !isNaN(mes) && !isNaN(anio)) {
                    const pagosSnap = await db
                        .collection('clientes').doc(clienteId)
                        .collection('pagos')
                        .where('mes', '==', mes)
                        .where('anio', '==', anio)
                        .get();

                    if (!pagosSnap.empty) {
                        await pagosSnap.docs[0].ref.update({
                            pagado: true,
                            fechaPago: FieldValue.serverTimestamp(),
                            pagoId: paymentId,
                        });
                    } else {
                        const clienteSnap = await db.collection('clientes').doc(clienteId).get();
                        const monto = (clienteSnap.data() as Record<string, unknown>)?.['mensualidadMonto']
                            ?? payment['transaction_amount'] ?? 0;
                        await db.collection('clientes').doc(clienteId).collection('pagos').add({
                            mes, anio, monto, pagado: true,
                            fechaPago: FieldValue.serverTimestamp(),
                            pagoId: paymentId,
                        });
                    }
                    console.log(`✅ Pago ${mes}/${anio} cliente ${clienteId} PAGADO`);
                }
            }

            res.status(200).send('ok');
        } catch (err) {
            console.error('Error en webhook MP:', err);
            res.status(200).send('ok'); // Siempre 200 para evitar reintentos infinitos de MP
        }
    }
);
