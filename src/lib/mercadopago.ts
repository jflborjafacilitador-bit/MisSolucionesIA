const ACCESS_TOKEN = import.meta.env.VITE_MP_ACCESS_TOKEN as string;

export interface MPItem {
    title: string;       // Nombre del proyecto
    quantity: number;    // Siempre 1
    unit_price: number;  // Precio en MXN
    currency_id: 'MXN';
}

export interface CreatePreferenceOptions {
    title: string;
    amount: number;
    clientEmail: string;
    externalRef?: string; // ID de la solicitud en Firestore
}

/**
 * Crea una preferencia de pago en MercadoPago Checkout Pro
 * y devuelve el init_point (link de pago).
 */
export async function createMPPreference(opts: CreatePreferenceOptions): Promise<string> {
    const body = {
        items: [
            {
                title: opts.title,
                quantity: 1,
                unit_price: opts.amount,
                currency_id: 'MXN',
            },
        ],
        payer: {
            email: opts.clientEmail,
        },
        external_reference: opts.externalRef ?? '',
        back_urls: {
            success: 'https://missolucionesia.com/pago-exitoso',
            failure: 'https://missolucionesia.com/pago-fallido',
            pending: 'https://missolucionesia.com/pago-pendiente',
        },
        statement_descriptor: 'MisSolucionesIA',
    };

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `MercadoPago Error ${res.status}`);
    }

    const data = await res.json();
    // init_point  → producción
    // sandbox_init_point → modo prueba (credenciales de sandbox)
    return data.init_point ?? data.sandbox_init_point;
}
