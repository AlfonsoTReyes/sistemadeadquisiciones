// src/app/api/tablas_comparativas/[idTablaComparativa]/proveedores/[idTablaComparativaProveedor]/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarItemAProveedor } from '@/services/tablasComparativasService';
import { AgregarItemInput } from '@/types/tablaComparativa';

// interface RouteContext { // Not needed for standard signature or pathname workaround
//     params: {
//         idTablaComparativa: string;
//         idTablaComparativaProveedor: string;
//     };
// }

export const dynamic = 'force-dynamic'; // Recommended for canary versions

export async function POST(
    request: NextRequest
    // Using standard signature first to see if TS error is resolved,
    // then will apply pathname workaround if runtime error persists.
    // { params }: { params: { idTablaComparativa: string; idTablaComparativaProveedor: string } }
) {
    // WORKAROUND: Extract parameters from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/tablas_comparativas/[idTablaComparativa]/proveedores/[idTablaComparativaProveedor]/items
    // Array indices:    0   1           2               3             4                 5                   6
    const idTablaComparativa = pathnameParts[3];
    const idTablaComparativaProveedor = pathnameParts[5];

    if (!idTablaComparativa || !idTablaComparativaProveedor) {
        console.error("API POST Items: Could not extract IDs from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'No se pudo determinar los IDs desde la URL.' }, { status: 400 });
    }

    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/proveedores/${idTablaComparativaProveedor}/items:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    const idTablaProv = parseInt(idTablaComparativaProveedor, 10);

    if (isNaN(idTabla) || isNaN(idTablaProv)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta (extraídos del pathname).' }, { status: 400 });
    }

    try {
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        const inputData = body as AgregarItemInput; // Cast for now, Zod is better for validation

        if (!inputData || typeof inputData !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }

        // Validate that the id_tabla_comparativa_proveedor from the body matches the one from the path
        if (inputData.id_tabla_comparativa_proveedor !== idTablaProv) {
            return NextResponse.json({ message: 'El ID de proveedor en tabla del cuerpo no coincide con el ID de la ruta.' }, { status: 400 });
        }

        if (!inputData.descripcion_item || inputData.cantidad == null || inputData.precio_unitario == null || !inputData.udm) {
            return NextResponse.json({ message: 'Faltan campos requeridos para el ítem (descripción, cantidad, precio, udm).' }, { status: 400 });
        }
        if (typeof inputData.cantidad !== 'number' || inputData.cantidad <= 0 || typeof inputData.precio_unitario !== 'number' || inputData.precio_unitario < 0) {
            return NextResponse.json({ message: 'Cantidad debe ser número positivo, Precio Unitario debe ser número no negativo.' }, { status: 400 });
        }

        // The service `agregarItemAProveedor` expects `AgregarItemInput` which includes `id_tabla_comparativa_proveedor`.
        // We've already validated that `inputData.id_tabla_comparativa_proveedor` matches `idTablaProv` from the path.
        const nuevoItem = await agregarItemAProveedor(inputData);

        return NextResponse.json(nuevoItem, { status: 201 });

    } catch (error: unknown) { // Changed to unknown
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al agregar el ítem';
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