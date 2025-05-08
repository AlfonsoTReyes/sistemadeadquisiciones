// app/api/pagos/confirmar-pago/route.ts

/**
 * @fileoverview API Route de Next.js (Opción A - Proxy Webhook).
 * Recibe la solicitud del frontend cuando el iframe indica éxito.
 * Su única función es reenviar los datos cifrados al webhook.php real
 * en el servidor PHP externo y devolver la respuesta del PHP al frontend.
 * NO realiza desencriptación ni lógica de negocio aquí.
 */

import { NextRequest, NextResponse } from 'next/server';
// Ajusta las rutas de importación según tu estructura
import { ConfirmarPagoClienteBody, WebhookPHPRequestBody, WebhookPHPResponse } from '@/types/pago';
// NOTA: No se importa pagoLocalService aquí directamente en la Opción A.
// La actualización de la BD local se maneja en la ruta de notificación (Opción B)
// o podría hacerse aquí si se quiere marcar el intento de proxy.

/**
 * Fuerza la ejecución dinámica.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
 */
export const dynamic = 'force-dynamic';

// --- Variables de Entorno ---
/** URL completa del script webhook.php en el servidor cPanel. */
const PHP_MODULE_WEBHOOK_URL = process.env.PHP_MODULE_WEBHOOK_URL;

// Validación inicial de configuración
if (!PHP_MODULE_WEBHOOK_URL) {
    console.error("CRITICAL CONFIG ERROR: La variable de entorno PHP_MODULE_WEBHOOK_URL no está definida.");
}

/**
 * Manejador para peticiones POST a /api/pagos/confirmar-pago.
 * Actúa como proxy para llamar al webhook.php externo.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - El objeto de la solicitud entrante. Se espera un cuerpo JSON
 *                                que cumpla con la interfaz `ConfirmarPagoClienteBody`.
 * @returns {Promise<NextResponse>} Una respuesta JSON que refleja el resultado de la llamada al webhook PHP
 *                                  (según la interfaz `WebhookPHPResponse`) o una respuesta de error.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    // Validar configuración en cada request
    if (!PHP_MODULE_WEBHOOK_URL) {
        console.error("API Error: Configuración de URL de Webhook PHP faltante.");
        return NextResponse.json({ success: false, status: 'error', message: 'Error de configuración del servidor (URL Webhook PHP).' }, { status: 503 });
    }

    let requestReference: string | null = null; // Para logging de errores

    try {
        // 1. Parsear y Validar Cuerpo de la Solicitud del Cliente
        let body: ConfirmarPagoClienteBody;
        try {
            body = await request.json();
        } catch (parseError) {
             console.warn("API /api/pagos/confirmar-pago: Cuerpo de solicitud no es JSON válido.");
             return NextResponse.json({ success: false, status: 'error', message: 'Cuerpo de solicitud inválido (no es JSON).' }, { status: 400 });
        }

        // Validar datos mínimos requeridos del cliente
        if (!body.encryptedRequestData || !body.reference) {
            console.warn("API /api/pagos/confirmar-pago: Faltan datos requeridos del cliente.");
            return NextResponse.json({ success: false, status: 'error', message: 'Faltan datos requeridos (encryptedRequestData, reference).' }, { status: 400 });
        }
        requestReference = body.reference; // Guardar referencia para logs de error


        // 2. Preparar Cuerpo para el Webhook PHP Real
        // El webhook PHP (según el análisis) espera los datos como application/x-www-form-urlencoded
        // con una clave 'strResponse'. NO como JSON.
        // Por lo tanto, NO preparamos un JSON aquí. Preparamos FormData o URLSearchParams.

        // Usaremos URLSearchParams que es más estándar para form-urlencoded
        const webhookBodyParams = new URLSearchParams();
        webhookBodyParams.append('strResponse', body.encryptedRequestData);

        // Si necesitaras enviar otros datos que el webhook PHP espera leer de $_POST:
        // webhookBodyParams.append('referencia_nextjs', body.reference);
        // webhookBodyParams.append('id_ciudadano', String(body.id_ciudadano ?? '')); // Convertir a string


        // 3. Llamar al webhook.php en cPanel usando POST y form-urlencoded
        const responsePHP = await fetch(PHP_MODULE_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                // ---> ¡IMPORTANTE! Cambiar Content-Type a form-urlencoded <---
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json', // Aún esperamos una respuesta JSON del PHP
            },
            // ---> Enviar los datos como string codificado <---
            body: webhookBodyParams.toString(),
            cache: 'no-store',
        });

        const responsePHPText = await responsePHP.text();

        // 4. Parsear Respuesta del Webhook PHP
        let responsePHPData: WebhookPHPResponse; // Interfaz para la respuesta JSON del PHP
        try {
            responsePHPData = JSON.parse(responsePHPText);
            // Validar que la respuesta tenga la estructura mínima esperada
            if (!responsePHPData || typeof responsePHPData.status === 'undefined' || typeof responsePHPData.message === 'undefined') {
                throw new Error("Formato de respuesta JSON inesperado del webhook PHP.");
            }
        } catch (e) {
            console.error(`API Proxy Confirmar: Respuesta Webhook PHP no es JSON válido para ref ${requestReference}:`, responsePHPText.substring(0, 500));
            // Lanzar error para que sea manejado por el catch general
            throw new Error("Respuesta inválida (no JSON) del webhook de pago PHP.");
        }


        // 5. Opcional: Actualizar BD local (si se desea marcar el intento de proxy)
        // if (responsePHP.ok && responsePHPData.status === 'success') {
        //    await marcarProxyWebhookLlamado(requestReference); // Llama a la función del servicio local
        // }

        // 6. Reenviar la respuesta JSON del webhook PHP al frontend
        // Usar el status code original devuelto por el PHP
        return NextResponse.json(responsePHPData, { status: responsePHP.status });

    } catch (error: any) {
        console.error(`Error en API /api/pagos/confirmar-pago (Ref: ${requestReference ?? 'N/A'}):`, error);
        const message = error.message || 'Error interno del servidor al procesar la confirmación del pago.';
        // Devolver un error JSON consistente
        return NextResponse.json({ success: false, status: 'error', message: message }, { status: 500 });
    }
}