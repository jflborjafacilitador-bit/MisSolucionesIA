import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as nodeHttps from 'https';

initializeApp();
const db = getFirestore();

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';

/**
 * Webhook de MercadoPago — recibe notificaciones IPN de pagos.
 * URL: https://us-central1-missolucionesia.cloudfunctions.net/mpWebhook
 */
export const mpWebhook = onRequest(
    { region: 'us-central1', cors: false, invoker: 'public' },
    async (req, res): Promise<void> => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
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

            // Consultar MP API
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

            // FORMATO 1: cotizacionId (pago inicial del proyecto)
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
                    console.log(`✅ Cotización ${extRef} marcada como PAGADA`);
                }
            }

            // FORMATO 2: clienteId:mes:anio (mensualidad de mantenimiento)
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
                        const monto = (clienteSnap.data() as Record<string, unknown>)?.['mensualidadMonto'] ?? payment['transaction_amount'] ?? 0;
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
            res.status(200).send('ok');
        }
    }
);
