// app/api/pagos/recibo/route.ts

/**
 * @fileoverview API Route de Next.js que actúa como proxy para obtener
 * la información de un recibo de pago desde el módulo PHP externo.
 * Recibe una referencia o ID de pago y reenvía la solicitud al
 * script `generar_recibo.php` en el servidor PHP.
 * Puede manejar respuestas JSON o PDF.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Fuerza la ejecución dinámica, útil si los recibos pueden actualizarse.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic
 */
export const dynamic = 'force-dynamic';

// --- Variables de Entorno ---
/** URL completa del script generar_recibo.php en el servidor cPanel. */
const PHP_MODULE_RECIBO_URL = process.env.PHP_MODULE_RECIBO_URL;

// Validación inicial de configuración
if (!PHP_MODULE_RECIBO_URL) {
    console.error("CRITICAL CONFIG ERROR: La variable de entorno PHP_MODULE_RECIBO_URL no está definida.");
}

/**
 * Manejador para peticiones GET a /api/pagos/recibo.
 * Obtiene los datos de un recibo llamando al módulo PHP externo.
 * Espera parámetros 'ref' (referencia) o 'id' (pago_id) y opcionalmente 'format' ('json' o 'pdf').
 *
 * @async
 * @function GET
 * @param {NextRequest} request - El objeto de la solicitud entrante, incluyendo los searchParams.
 * @returns {Promise<NextResponse>} Una respuesta JSON con los datos del recibo (si format=json),
 *                                  una respuesta PDF (si format=pdf), o una respuesta de error JSON.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    // Validar configuración en cada request
    if (!PHP_MODULE_RECIBO_URL) {
        console.error("API Error: Configuración de URL de Recibo PHP faltante.");
        return NextResponse.json({ success: false, message: 'Error de configuración del servidor (URL Recibo PHP).' }, { status: 503 });
    }

    // 1. Extraer y Validar Parámetros de la URL
    const { searchParams } = new URL(request.url);
    const referencia = searchParams.get('ref');
    const pagoId = searchParams.get('id');
    // Formato por defecto es 'json' si no se especifica o es inválido
    const format = (searchParams.get('format')?.toLowerCase() === 'pdf') ? 'pdf' : 'json';

    // Se requiere al menos una referencia o un ID
    if (!referencia && !pagoId) {
        console.warn("API /api/pagos/recibo: Parámetros 'ref' o 'id' faltantes.");
        return NextResponse.json({ success: false, message: 'Falta parámetro "ref" (referencia) o "id".' }, { status: 400 });
    }

    // Crear identificador para logs
    const identifier = referencia ? `ref "${referencia}"` : `id "${pagoId}"`;

    try {
        // 2. Construir URL para llamar al PHP
        // Incluir siempre el formato
        let urlConParam = `${PHP_MODULE_RECIBO_URL}?format=${encodeURIComponent(format)}`;
        // Añadir 'ref' o 'id'
        if (referencia) {
            urlConParam += `&ref=${encodeURIComponent(referencia)}`;
        } else {
            // Sabemos que pagoId existe si referencia no
            urlConParam += `&id=${encodeURIComponent(pagoId!)}`;
        }

        console.log(`API Proxy Recibo: Obteniendo recibo para ${identifier} via PHP (${format}) - URL: ${urlConParam}`);

        // 3. Realizar Llamada Fetch al Módulo PHP
        const responsePHP = await fetch(urlConParam, {
            method: 'GET',
            headers: {
                // Indicar qué tipo de respuesta aceptamos
                'Accept': format === 'pdf' ? 'application/pdf' : 'application/json',
            },
            cache: 'no-store', // No cachear respuestas de recibos específicos
        });

        console.log(`API Proxy Recibo: Respuesta PHP Status para ${identifier}: ${responsePHP.status}`);

        // 4. Manejar Respuesta del PHP
        if (!responsePHP.ok) { // Error (4xx, 5xx) desde PHP
            let errorMessage = `Error ${responsePHP.status} del módulo PHP al obtener recibo para ${identifier}.`;
            let errorDetails = null;
            try {
                // Intentar parsear error JSON si el PHP lo envió
                const errorData = await responsePHP.json();
                errorMessage = errorData.message || errorMessage;
                errorDetails = errorData; // Guardar detalles si existen
            } catch (e) {
                // Si no es JSON, intentar leer como texto
                try {
                    const errorText = await responsePHP.text();
                    errorMessage += ` Respuesta: ${errorText.substring(0, 200)}`;
                } catch (readError) { /* Ignorar si falla lectura de texto */ }
            }
            console.error(`API Proxy Recibo: Error desde PHP para ${identifier}: ${errorMessage}`, errorDetails);
            // Devolver el error como JSON
            return NextResponse.json({ success: false, message: errorMessage }, { status: responsePHP.status });
        }

        // 5. Procesar Respuesta Exitosa (PDF o JSON)
        if (format === 'pdf') {
            console.log(`API Proxy Recibo: Reenviando respuesta PDF para ${identifier}...`);
            // Obtener el contenido como Blob (eficiente para binarios)
            const pdfBlob = await responsePHP.blob();
            // Crear nuevas cabeceras para la respuesta
            const headers = new Headers();
            // Establecer el tipo de contenido correcto
            headers.set('Content-Type', 'application/pdf');
            // Opcional: intentar pasar el nombre de archivo sugerido por el PHP
            // const disposition = responsePHP.headers.get('Content-Disposition');
            // if (disposition) headers.set('Content-Disposition', disposition);
            // O establecer uno por defecto
            headers.set('Content-Disposition', `inline; filename="recibo_${referencia || pagoId}.pdf"`);
            // Devolver el Blob PDF con las cabeceras correctas
            return new NextResponse(pdfBlob, { status: 200, headers });
        } else { // format === 'json'
            console.log(`API Proxy Recibo: Procesando respuesta JSON para ${identifier}...`);
            // Reenviar la respuesta JSON directamente
            // Asumimos que si el status es OK, es JSON válido (el PHP debería garantizarlo)
            const responsePHPData = await responsePHP.json(); // Parsear como JSON
            console.log(`API Proxy Recibo: Respuesta JSON de PHP para ${identifier} procesada.`);
            // Opcional: Podrías guardar el recibo en la caché local aquí si quisieras
            // await guardarReciboLocal(referencia, JSON.stringify(responsePHPData));
            return NextResponse.json(responsePHPData, { status: 200 });
        }

    } catch (error: any) {
        console.error(`Error en API /api/pagos/recibo para ${identifier}:`, error);
        const message = error.message || 'Error interno del servidor al obtener el recibo.';
        return NextResponse.json({ success: false, message: message }, { status: 500 });
    }
}

// Asegurarse de que no haya un 'export default'