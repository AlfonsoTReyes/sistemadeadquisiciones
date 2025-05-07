// src/app/api/tablas_comparativas/[idTablaComparativa]/firmas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarFirma } from '@/services/tablasComparativasService';
import { AgregarFirmaInput } from '@/types/tablaComparativa';

export const dynamic = 'force-dynamic'; // Recommended to ensure Node.js runtime behavior

export async function POST(
    request: NextRequest
    // context parameter is removed for this workaround
) {
    // WORKAROUND: Extract idTablaComparativa from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/tablas_comparativas/[idTablaComparativa]/firmas
    // Array indices:    0   1           2               3                4
    const idTablaComparativa = pathnameParts[3]; // Adjust index if your base path is different

    if (!idTablaComparativa) {
        console.error("API POST Firmas: Could not extract idTablaComparativa from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'ID de tabla comparativa no encontrado en la ruta.' }, { status: 400 });
    }

    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/firmas:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido (extraído del pathname).' }, { status: 400 });
    }

    // TODO: Implement robust authentication here to get idUsuarioDeSesion
    // const idUsuarioDeSesion = await getUserIdFromSession(request); // Example
    // if (!idUsuarioDeSesion) {
    //     return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    // }

    try {
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        const inputDataFromClient = body as Partial<AgregarFirmaInput>;

        if (!inputDataFromClient || typeof inputDataFromClient !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }
        if (!inputDataFromClient.id_usuario || typeof inputDataFromClient.id_usuario !== 'number') {
            // This should ideally come from session, not client payload
            return NextResponse.json({ message: 'ID de usuario inválido o faltante. (Debe obtenerse de la sesión)' }, { status: 400 });
        }
        if (!inputDataFromClient.tipo_firma || typeof inputDataFromClient.tipo_firma !== 'string' || !inputDataFromClient.tipo_firma.trim()) {
            return NextResponse.json({ message: 'El tipo de firma es requerido.' }, { status: 400 });
        }

        const dataForService: AgregarFirmaInput = {
            id_tabla_comparativa: idTabla, // Uses ID from path
            id_usuario: inputDataFromClient.id_usuario, // TODO: Replace with user ID from session
            tipo_firma: inputDataFromClient.tipo_firma,
            comentario_firma: inputDataFromClient.comentario_firma || null,
        };

        const nuevaFirma = await agregarFirma(dataForService);
        return NextResponse.json(nuevaFirma, { status: 201 });

    } catch (error: unknown) {
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al agregar la firma';
        let errorDetail: string | undefined;

        if (error instanceof Error) {
            message = error.message || message;
            errorDetail = error.message;
            if (error.message.includes('no encontrado')) { // Example of specific error handling
                return NextResponse.json({ message: message }, { status: 404 });
            }
        } else if (typeof error === 'string') {
            message = error;
            errorDetail = error;
        }
        return NextResponse.json(
            { message: message, error: errorDetail },
            { status: 500 }
        );
    }
}