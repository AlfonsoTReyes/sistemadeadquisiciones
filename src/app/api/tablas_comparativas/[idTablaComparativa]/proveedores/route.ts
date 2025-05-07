// src/app/api/tablas_comparativas/[idTablaComparativa]/proveedores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarProveedorATabla } from '@/services/tablasComparativasService';
import { AgregarProveedorInput } from '@/types/tablaComparativa';

// interface RouteParams { // Not needed for pathname workaround
//     params: { idTablaComparativa: string };
// }

export const dynamic = 'force-dynamic'; // Recommended for canary versions

export async function POST(
    request: NextRequest
    // { params }: RouteParams // Temporarily remove context for this workaround
) {
    // WORKAROUND: Extract idTablaComparativa from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/tablas_comparativas/[idTablaComparativa]/proveedores
    // Array indices:    0   1           2               3                4
    const idTablaComparativa = pathnameParts[3]; // Adjust index if your base path is different

    if (!idTablaComparativa) {
        console.error("API POST ProveedoresToTabla: Could not extract idTablaComparativa from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'ID de tabla comparativa no encontrado en la ruta.' }, { status: 400 });
    }

    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/proveedores:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido (extraído del pathname).' }, { status: 400 });
    }

    try {
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        const inputData = body as AgregarProveedorInput; // Cast for now, Zod is better

        if (!inputData || typeof inputData !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }

        // Critical: Ensure the id_tabla_comparativa in the body matches the one from the path,
        // or better yet, overwrite it with the one from the path to ensure consistency.
        if (inputData.id_tabla_comparativa !== undefined && inputData.id_tabla_comparativa !== idTabla) {
            console.warn(`${logPrefix} Mismatch: ID de tabla en cuerpo (${inputData.id_tabla_comparativa}) vs ruta (${idTabla}). Usando ID de ruta.`);
            // return NextResponse.json({ message: 'El ID de tabla en el cuerpo no coincide con el ID de la ruta.' }, { status: 400 });
        }
        // Ensure the data passed to the service uses the ID from the path parameter
        const dataForService: AgregarProveedorInput = {
            ...inputData,
            id_tabla_comparativa: idTabla, // Override with ID from path
        };


        if (!dataForService.id_proveedor || typeof dataForService.id_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor inválido o faltante.' }, { status: 400 });
        }
        if (!dataForService.nombre_empresa_snapshot || !dataForService.rfc_snapshot) {
            return NextResponse.json({ message: 'Nombre y RFC del snapshot son requeridos.' }, { status: 400 });
        }
        // Add more specific validations for other snapshot fields as needed

        const nuevoProveedorEnTabla = await agregarProveedorATabla(dataForService);

        return NextResponse.json(nuevoProveedorEnTabla, { status: 201 });

    } catch (error: unknown) { // Changed to unknown
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al agregar el proveedor a la tabla';
        let errorDetail: string | undefined;

        if (error instanceof Error) {
            message = error.message || message;
            errorDetail = error.message;
            if (error.message.includes('duplicate key') || error.message.includes('ya existe')) {
                return NextResponse.json({ message: 'Este proveedor ya ha sido agregado a la tabla.' }, { status: 409 });
            }
            if (error.message.includes('no encontrada') || error.message.includes('not found')) {
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