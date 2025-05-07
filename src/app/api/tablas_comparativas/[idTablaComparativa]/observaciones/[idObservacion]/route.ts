// src/app/api/tablas_comparativas/[idTablaComparativa]/observaciones/[idObservacion]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eliminarObservacion } from '@/services/tablasComparativasService';

// interface RouteParams { // Not needed for pathname workaround
//     params: {
//         idTablaComparativa: string;
//         idObservacion: string;
//     };
// }

export const dynamic = 'force-dynamic'; // Recommended to try with canary versions

export async function DELETE(
    request: NextRequest
    // { params }: RouteParams // Temporarily remove context for this workaround
) {
    // WORKAROUND: Extract parameters from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/tablas_comparativas/[idTablaComparativa]/observaciones/[idObservacion]
    // Array indices:    0   1           2               3                4             5
    const idTablaComparativa = pathnameParts[3]; // Adjust index if your base path is different
    const idObservacion = pathnameParts[5];      // Adjust index if your base path is different

    if (!idTablaComparativa || !idObservacion) {
        console.error("API DELETE Observacion: Could not extract IDs from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'No se pudo determinar los IDs desde la URL.' }, { status: 400 });
    }

    const logPrefix = `API DELETE /tablas-comparativas/${idTablaComparativa}/observaciones/${idObservacion}:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    const observacionId = parseInt(idObservacion, 10);

    if (isNaN(idTabla) || isNaN(observacionId)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta (extraídos del pathname).' }, { status: 400 });
    }

    try {
        // The service `eliminarObservacion` likely only needs `observacionId`.
        // If it also needs `idTabla` for context or security (e.g., to ensure
        // the observation belongs to the correct table before deleting),
        // you would pass it: await eliminarObservacion(observacionId, idTabla);
        await eliminarObservacion(observacionId);

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error: unknown) { // Changed to unknown
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al eliminar la observación';
        let errorDetail: string | undefined;

        if (error instanceof Error) {
            message = error.message || message;
            errorDetail = error.message;
            if (error.message.includes('no encontrado')) { // Check if your service throws this
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