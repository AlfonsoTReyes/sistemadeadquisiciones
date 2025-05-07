// src/app/api/tablas_comparativas/[idTablaComparativa]/items/[idItem]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eliminarItem } from '@/services/tablasComparativasService';

// interface RouteParams { // Not needed for pathname workaround
//     params: {
//         idTablaComparativa: string;
//         idItem: string;
//     };
// }

export const dynamic = 'force-dynamic'; // Recommended to try with canary versions

export async function DELETE(
    request: NextRequest
    // { params }: RouteParams // Temporarily remove context for this workaround
) {
    // WORKAROUND: Extract parameters from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/tablas_comparativas/[idTablaComparativa]/items/[idItem]
    // Array indices:    0   1           2               3             4       5
    const idTablaComparativa = pathnameParts[3]; // Adjust index if your base path is different
    const idItem = pathnameParts[5];             // Adjust index if your base path is different

    if (!idTablaComparativa || !idItem) {
        console.error("API DELETE Items: Could not extract IDs from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'No se pudo determinar los IDs desde la URL.' }, { status: 400 });
    }

    const logPrefix = `API DELETE /tablas-comparativas/${idTablaComparativa}/items/${idItem}:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    const itemId = parseInt(idItem, 10);

    if (isNaN(idTabla) || isNaN(itemId)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta (extraídos del pathname).' }, { status: 400 });
    }

    try {
        await eliminarItem(itemId); // Assuming eliminarItem only needs the item's ID
                                    // If it needs idTabla for context/security, you can pass it:
                                    // await eliminarItem(itemId, idTabla);

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error: unknown) { // Changed to unknown
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al eliminar el ítem';
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