// src/app/api/tablas_comparativas/[idTablaComparativa]/proveedores/[idTablaComparativaProveedor]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eliminarProveedorDeTabla } from '@/services/tablasComparativasService';

// interface RouteParams { // Not needed for pathname workaround
//     params: {
//         idTablaComparativa: string;
//         idTablaComparativaProveedor: string;
//     };
// }

export const dynamic = 'force-dynamic'; // Recommended for canary versions

export async function DELETE(
    request: NextRequest
    // { params }: RouteParams // Temporarily remove context for this workaround
) {
    // WORKAROUND: Extract parameters from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/tablas_comparativas/[idTablaComparativa]/proveedores/[idTablaComparativaProveedor]
    // Array indices:    0   1           2               3             4                 5
    const idTablaComparativa = pathnameParts[3];
    const idTablaComparativaProveedor = pathnameParts[5];

    if (!idTablaComparativa || !idTablaComparativaProveedor) {
        console.error("API DELETE ProveedorDeTabla: Could not extract IDs from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'No se pudo determinar los IDs desde la URL.' }, { status: 400 });
    }

    const logPrefix = `API DELETE /tablas-comparativas/${idTablaComparativa}/proveedores/${idTablaComparativaProveedor}:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    const idTablaProv = parseInt(idTablaComparativaProveedor, 10);

    if (isNaN(idTabla) || isNaN(idTablaProv)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta (extraídos del pathname).' }, { status: 400 });
    }

    try {
        // The service function `eliminarProveedorDeTabla` likely needs `idTablaProv`
        // (which is the ID of the entry in the `tabla_comparativa_proveedores` junction table).
        await eliminarProveedorDeTabla(idTablaProv);

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error: unknown) { // Changed to unknown for better type safety
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al eliminar el proveedor de la tabla comparativa';
        let errorDetail: string | undefined;

        if (error instanceof Error) {
            message = error.message || message;
            errorDetail = error.message;
            if (error.message.includes('no encontrado') || error.message.includes('not found')) {
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