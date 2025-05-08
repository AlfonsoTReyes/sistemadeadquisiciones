// app/api/pagos/iniciar/route.ts

/**
 * @fileoverview API Route de Next.js que actúa como proxy para iniciar el proceso de pago.
 * Recibe la solicitud del frontend, llama al módulo PHP externo (`iniciar_pago.php`)
 * pasándole el tipo de trámite y la URL de notificación, registra el intento localmente,
 * y devuelve la respuesta del PHP (con la URL de pago) al frontend.
 */

import { NextRequest, NextResponse } from 'next/server';
// Ajusta las rutas según tu estructura
import { registrarIntentoPago } from '@/services/pago/pagoLocalService';
import { IniciarPagoPHPResponse } from '@/types/pago';
import { TRAMITES_COSTOS_NEXT } from '@/types/pago/constants';

/**
 * Fuerza la ejecución dinámica de esta ruta en cada solicitud, evitando el cacheo estático.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
 */
export const dynamic = 'force-dynamic';

// --- Variables de Entorno ---
/** URL completa del script iniciar_pago.php en el servidor cPanel. */
const PHP_MODULE_INICIAR_URL = process.env.PHP_MODULE_INICIAR_URL;
/** URL completa del endpoint en esta app Next.js que recibirá la notificación del webhook PHP. */
const NEXTJS_RECEIVER_ENDPOINT = process.env.NEXTJS_NOTIFICATION_ENDPOINT ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/pagos/notificacion-externa`;

// Validaciones iniciales de configuración (se ejecutan al cargar el módulo)
if (!PHP_MODULE_INICIAR_URL) {
    console.error("CRITICAL CONFIG ERROR: La variable de entorno PHP_MODULE_INICIAR_URL no está definida.");
    // Podría lanzar un error aquí para detener el build/inicio si es crítico
}
if (!NEXTJS_RECEIVER_ENDPOINT) {
    console.error("CRITICAL CONFIG ERROR: No se pudo determinar NEXTJS_RECEIVER_ENDPOINT. Verifica NEXTJS_NOTIFICATION_ENDPOINT y NEXT_PUBLIC_APP_URL en .env");
}

/**
 * Manejador para peticiones POST a /api/pagos/iniciar.
 * Inicia el flujo de pago llamando al módulo PHP externo.
 *
 * @async
 * @function POST
 * @param {NextRequest} request - El objeto de la solicitud entrante. Se espera un cuerpo JSON con { tramite: string }.
 * @returns {Promise<NextResponse>} Una respuesta JSON que refleja el resultado de la llamada al módulo PHP
 *                                  (incluyendo `success`, `message`, `paymentUrl`, `encryptedRequestData`, `reference`)
 *                                  o una respuesta de error si algo falla.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    // Validar configuración en cada request por si acaso
    if (!PHP_MODULE_INICIAR_URL || !NEXTJS_RECEIVER_ENDPOINT) {
        console.error("API Error: Configuración de servidor incompleta al procesar la solicitud.");
        return NextResponse.json({ success: false, message: 'Error de configuración del servidor.' }, { status: 503 }); // 503 Service Unavailable
    }

    let referenciaGenerada: string | null = null; // Para logging en caso de error posterior

    try {
        // 1. Parsear y Validar Cuerpo de la Solicitud
        let body: { tramite?: string };
        try {
            body = await request.json();
        } catch (parseError) {
            console.warn("API /api/pagos/iniciar: Cuerpo de solicitud no es JSON válido.");
            return NextResponse.json({ success: false, message: 'Cuerpo de solicitud inválido (no es JSON).' }, { status: 400 });
        }

        const { tramite } = body;

        // Validar que 'tramite' existe, es string y está en nuestras constantes
        if (!tramite || typeof tramite !== 'string' || !TRAMITES_COSTOS_NEXT[tramite]) {
            console.warn(`API /api/pagos/iniciar: Trámite inválido o faltante: ${tramite}`);
            return NextResponse.json({ success: false, message: 'Parámetro "tramite" inválido o faltante.' }, { status: 400 });
        }

        // 2. Obtener Monto (Localmente)
        const monto = TRAMITES_COSTOS_NEXT[tramite].costo;

        // 3. Preparar y Realizar Llamada al Módulo PHP
        const params = new URLSearchParams({
            tramite: tramite,
            notify_url: NEXTJS_RECEIVER_ENDPOINT // URL a la que PHP debe notificar
        });
        const urlConParam = `${PHP_MODULE_INICIAR_URL}?${params.toString()}`;


        const responsePHP = await fetch(urlConParam, {
            method: 'GET', // El PHP espera GET
            headers: { 'Accept': 'application/json' },
            cache: 'no-store', // Evitar cacheo de esta llamada
        });

        const responsePHPText = await responsePHP.text();

        // 4. Parsear Respuesta del PHP
        let responsePHPData: IniciarPagoPHPResponse;
        try {
            responsePHPData = JSON.parse(responsePHPText);
        } catch (e) {
            console.error("API /api/pagos/iniciar: Respuesta PHP no es JSON:", responsePHPText.substring(0, 1000)); // Log más largo
            throw new Error("Respuesta inválida (no JSON) del módulo de pago PHP."); // Lanzar error para el catch general
        }


        // 5. Procesar Respuesta del PHP y Registrar Localmente
        if (responsePHP.ok && responsePHPData.success && responsePHPData.reference && responsePHPData.paymentUrl && responsePHPData.encryptedRequestData) {
            // Respuesta exitosa del PHP, proceder a registrar localmente
            referenciaGenerada = responsePHPData.reference;

            const localId = await registrarIntentoPago(
                responsePHPData.reference,
                tramite,
                monto, // Usar el monto obtenido localmente
                responsePHPData.paymentUrl,
                responsePHPData.encryptedRequestData
            );

            if (localId !== null) {
            } else {
                // Fallo en el registro local - Loguear pero NO detener el flujo hacia el usuario
                console.error(`API /api/pagos/iniciar: ¡FALLÓ el registro local para ref: ${referenciaGenerada}! El webhook podría no encontrar el registro para actualizar.`);
            }

            // Devolver la respuesta exitosa del PHP al frontend
            return NextResponse.json(responsePHPData, { status: responsePHP.status }); // Usar status original (probablemente 200)

        } else {
            // Si el PHP devolvió un error lógico (success: false) o una respuesta incompleta/inválida
            const phpErrorMessage = responsePHPData.message || "Respuesta inválida o incompleta del módulo PHP.";
            console.error(`API /api/pagos/iniciar: Error lógico desde PHP para trámite ${tramite}: ${phpErrorMessage}`);
            // Devolver el mensaje de error del PHP al frontend con un status apropiado (ej: 502 Bad Gateway o 400 si fue error de params)
            const errorStatus = responsePHP.ok ? 502 : responsePHP.status; // Si PHP dio OK pero success:false, es un 502
            return NextResponse.json({ success: false, message: phpErrorMessage }, { status: errorStatus });
        }

    } catch (error: any) {
        // Captura errores de fetch, parseo JSON, o errores lanzados explícitamente
        console.error(`Error en API /api/pagos/iniciar (Ref: ${referenciaGenerada ?? 'N/A'}):`, error);
        const message = error.message || 'Error interno del servidor al procesar la solicitud de pago.';
        // Devolver un error 500 genérico
        return NextResponse.json({ success: false, message: message }, { status: 500 });
    }
}