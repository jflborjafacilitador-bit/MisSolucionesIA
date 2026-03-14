"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.mpWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const nodeHttps = __importStar(require("https"));
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? '';
/**
 * Webhook de MercadoPago — recibe notificaciones IPN de pagos.
 * URL: https://us-central1-missolucionesia.cloudfunctions.net/mpWebhook
 */
exports.mpWebhook = (0, https_1.onRequest)({ region: 'us-central1', cors: false, invoker: 'public' }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    try {
        const body = req.body;
        const topic = body.type ?? req.query['topic'] ?? null;
        const paymentId = body.data?.id ?? req.query['data.id'] ?? null;
        if (topic !== 'payment' || !paymentId) {
            res.status(200).send('ok');
            return;
        }
        // Consultar MP API
        const payment = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.mercadopago.com',
                path: `/v1/payments/${paymentId}`,
                method: 'GET',
                headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
            };
            const r = nodeHttps.request(options, (mpRes) => {
                let raw = '';
                mpRes.on('data', (chunk) => { raw += chunk.toString(); });
                mpRes.on('end', () => { try {
                    resolve(JSON.parse(raw));
                }
                catch (e) {
                    reject(e);
                } });
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
                    pagoFecha: firestore_1.FieldValue.serverTimestamp(),
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
                        fechaPago: firestore_1.FieldValue.serverTimestamp(),
                        pagoId: paymentId,
                    });
                }
                else {
                    const clienteSnap = await db.collection('clientes').doc(clienteId).get();
                    const monto = clienteSnap.data()?.['mensualidadMonto'] ?? payment['transaction_amount'] ?? 0;
                    await db.collection('clientes').doc(clienteId).collection('pagos').add({
                        mes, anio, monto, pagado: true,
                        fechaPago: firestore_1.FieldValue.serverTimestamp(),
                        pagoId: paymentId,
                    });
                }
                console.log(`✅ Pago ${mes}/${anio} cliente ${clienteId} PAGADO`);
            }
        }
        res.status(200).send('ok');
    }
    catch (err) {
        console.error('Error en webhook MP:', err);
        res.status(200).send('ok');
    }
});
//# sourceMappingURL=index.js.map