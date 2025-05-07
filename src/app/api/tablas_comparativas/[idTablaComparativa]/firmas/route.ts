// src/app/api/tablas_comparativas/[idTablaComparativa]/firmas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarFirma } from '@/services/tablasComparativasService';
import { AgregarFirmaInput } from '@/types/tablaComparativa';

// interface RouteParams { // This interface is not needed with the inline type
//     params: { idTablaComparativa: string };
// }

// Add this if you are still encountering runtime "params should be awaited" errors
// export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: { idTablaComparativa: string } } // Standard Next.js App Router signature
) {
    const { idTablaComparativa } = params; // idTablaComparativa is now directly available
    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/firmas:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    // TODO: Implement robust authentication here to get idUsuarioDeSesion
    // const idUsuarioDeSesion = await getUserIdFromSession(request); // Example
    // if (!idUsuarioDeSesion) {
    //     return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    // }

    try {
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        // It's better to construct the inputData for the service carefully
        // rather than just casting, especially when dealing with auth-sensitive data like id_usuario.
        const inputDataFromClient = body as Partial<AgregarFirmaInput>;

        // Validate and construct the data for the service
        if (!inputDataFromClient || typeof inputDataFromClient !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }

        // The id_usuario should ideally come from the session, not the client's payload for security.
        // For now, we'll validate what's sent, but this is a security note.
        if (!inputDataFromClient.id_usuario || typeof inputDataFromClient.id_usuario !== 'number') {
            console.error(`${logPrefix} Error: id_usuario inválido o faltante en el payload del cliente. Implementar obtención desde sesión.`);
            return NextResponse.json({ message: 'ID de usuario inválido o faltante. (Debe obtenerse de la sesión)' }, { status: 400 });
        }
        if (!inputDataFromClient.tipo_firma || typeof inputDataFromClient.tipo_firma !== 'string' || !inputDataFromClient.tipo_firma.trim()) {
            return NextResponse.json({ message: 'El tipo de firma es requerido.' }, { status: 400 });
        }

        // Construct the final data for the service, ensuring id_tabla_comparativa from path
        // and id_usuario (ideally from session, here from client for now)
        const dataForService: AgregarFirmaInput = {
            id_tabla_comparativa: idTabla, // Use ID from path
            id_usuario: inputDataFromClient.id_usuario, // TODO: Replace with user ID from session
            tipo_firma: inputDataFromClient.tipo_firma,
            comentario_firma: inputDataFromClient.comentario_firma || null,
        };

        const nuevaFirma = await agregarFirma(dataForService);
        return NextResponse.json(nuevaFirma, { status: 201 });

    } catch (error: unknown) { // Changed to unknown
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al agregar la firma';
        let errorDetail: string | undefined;

        if (error instanceof Error) {
            message = error.message || message;
            errorDetail = error.message;
            if (error.message.includes('no encontrado')) {
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