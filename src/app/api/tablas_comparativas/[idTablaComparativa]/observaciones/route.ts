// src/app/api/tablas_comparativas/[idTablaComparativa]/observaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarObservacion } from '@/services/tablasComparativasService';
import { AgregarObservacionInput } from '@/types/tablaComparativa';

// interface RouteParams { // Not needed for pathname workaround
//     params: { idTablaComparativa: string };
// }

export const dynamic = 'force-dynamic'; // Recommended to try with canary versions

export async function POST(
    request: NextRequest
    // { params }: RouteParams // Temporarily remove context for this workaround
) {
    // WORKAROUND: Extract idTablaComparativa from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/tablas_comparativas/[idTablaComparativa]/observaciones
    // Array indices:    0   1           2               3                4
    const idTablaComparativa = pathnameParts[3]; // Adjust index if your base path is different

    if (!idTablaComparativa) {
        console.error("API POST Observaciones: Could not extract idTablaComparativa from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'ID de tabla comparativa no encontrado en la ruta.' }, { status: 400 });
    }

    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/observaciones:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido (extraído del pathname).' }, { status: 400 });
    }

    try {
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        const inputData = body as AgregarObservacionInput; // Cast for now, consider Zod for robust validation

        if (!inputData || typeof inputData !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }
        // The service should ideally validate if id_tabla_comparativa_proveedor belongs to this idTabla.
        // If you want to add a check here, you could, but it might be redundant if the service does it.
        // For example, if inputData also contained id_tabla_comparativa, you could check:
        // if (inputData.id_tabla_comparativa && inputData.id_tabla_comparativa !== idTabla) {
        //     return NextResponse.json({ message: 'El ID de tabla en el cuerpo no coincide con el ID de la ruta.' }, { status: 400 });
        // }

        if (!inputData.id_tabla_comparativa_proveedor || typeof inputData.id_tabla_comparativa_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor en tabla faltante o inválido.' }, { status: 400 });
        }
        if (!inputData.descripcion_validacion || typeof inputData.descripcion_validacion !== 'string' || !inputData.descripcion_validacion.trim()) {
            return NextResponse.json({ message: 'La descripción de la validación es requerida.' }, { status: 400 });
        }
        if (typeof inputData.cumple !== 'boolean') {
            return NextResponse.json({ message: 'El campo "cumple" debe ser booleano.' }, { status: 400 });
        }

        // Ensure the service receives the correct idTabla if it needs it,
        // though AgregarObservacionInput might not directly have id_tabla_comparativa.
        // The service `agregarObservacion` likely uses `inputData.id_tabla_comparativa_proveedor`
        // to find the parent and implicitly knows the table.
        const nuevaObservacion = await agregarObservacion(inputData);

        return NextResponse.json(nuevaObservacion, { status: 201 });

    } catch (error: unknown) { // Changed to unknown
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al agregar la observación';
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