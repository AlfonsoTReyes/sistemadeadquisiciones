// app/api/pagos/confirmar-pago/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Ya no necesitas importar tipos complejos de solicitud/respuesta de procesamiento interno
// Solo necesitas las interfaces para el cuerpo recibido del cliente y lo enviado al PHP
import { ConfirmarPagoClienteBody, WebhookPHPRequestBody, WebhookPHPResponse } from '@/types/pago';
// Ya NO importas 'procesarConfirmacionPago' ni 'pagoLocalService' aquí

export const dynamic = 'force-dynamic';

const PHP_MODULE_WEBHOOK_URL = process.env.PHP_MODULE_WEBHOOK_URL;

if (!PHP_MODULE_WEBHOOK_URL) {
    console.error("FATAL ERROR: PHP_MODULE_WEBHOOK_URL no está definido en .env");
}

export async function POST(request: NextRequest) {
    if (!PHP_MODULE_WEBHOOK_URL) {
        return NextResponse.json({ success: false, message: 'Error de configuración del servidor (URL Webhook PHP).' }, { status: 500 });
    }
    try {
        // 1. Recibir datos del frontend (cliente)
        const body: ConfirmarPagoClienteBody = await request.json();

        if (!body.encryptedRequestData || !body.reference) {
            return NextResponse.json({ success: false, message: 'Faltan datos requeridos (encryptedRequestData, reference).' }, { status: 400 });
        }

        console.log(`Proxy: Confirmando pago para referencia "${body.reference}" via Webhook PHP`);

        // 2. Preparar el cuerpo para el webhook.php real
        const webhookBody: WebhookPHPRequestBody = {
            strResponse: body.encryptedRequestData, // El PHP espera 'strResponse'
            // Añade otros campos aquí si tu webhook.php modificado los lee del JSON
            // ej: referencia_nextjs: body.reference
        };

        // 3. Llamar al webhook.php en cPanel
        const responsePHP = await fetch(PHP_MODULE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(webhookBody),
            cache: 'no-store',
        });

        console.log(`Proxy: Respuesta Webhook PHP Status: ${responsePHP.status}`);
        const responsePHPText = await responsePHP.text();

        let responsePHPData: WebhookPHPResponse; // Usa la interfaz para la respuesta PHP
        try {
            responsePHPData = JSON.parse(responsePHPText);
            if (!responsePHPData || !responsePHPData.status) { // Valida estructura mínima
                throw new Error("Formato de respuesta inesperado del webhook PHP.");
            }
        } catch (e) {
            console.error("Proxy: Respuesta Webhook PHP no es JSON válido:", responsePHPText.substring(0, 500));
            throw new Error("Respuesta inválida del webhook de pago PHP.");
        }

        console.log("Proxy: Respuesta JSON de Webhook PHP:", responsePHPData);

        // 4. Opcional: Actualizar BD local de Next.js (si la usas para rastreo)
        // if (responsePHP.ok && responsePHPData.status === 'success') {
        //     // Llama a una función en pagoLocalService para actualizar el estado
        //     // await marcarPagoConfirmadoLocalmente(body.reference);
        // }

        // 5. Reenviar la respuesta del webhook PHP al frontend
        return NextResponse.json(responsePHPData, { status: responsePHP.status });

    } catch (error: any) {
        console.error("Error en proxy /api/pagos/confirmar-pago:", error);
        const message = error.message.includes("webhook de pago PHP")
            ? error.message
            : 'Error interno del servidor al confirmar el pago.';
        // Devuelve un objeto consistente con success: false
        return NextResponse.json({ success: false, status: 'error', message: message }, { status: 500 });
    }
}