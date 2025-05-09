// src/app/api/tablas_comparativas/[idTablaComparativa]/comentarios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarComentario } from '@/services/tablasComparativasService';
import { AgregarComentarioInput } from '@/types/tablaComparativa';

// interface RouteParams { // Not used with pathname workaround
//     params: { idTablaComparativa: string };
// }

export async function POST(
    request: NextRequest
    // { params }: RouteParams // Temporarily remove/ignore context
) {
    // WORKAROUND: Extract idTablaComparativa from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected: /api/tablas_comparativas/[idTablaComparativa]/comentarios
    // Indices:    0   1           2               3                4
    const idTablaComparativa = pathnameParts[3]; // Adjust if base path is different

    if (!idTablaComparativa) {
        return NextResponse.json({ message: 'Could not extract idTablaComparativa from URL' }, { status: 400 });
    }

    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/comentarios:`;

    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    try {
        const body = await request.json();

        const inputData = body as AgregarComentarioInput;
        if (!inputData || typeof inputData !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }
        if (inputData.id_tabla_comparativa !== idTabla) {
            return NextResponse.json({ message: 'El ID de tabla en el cuerpo no coincide con el ID de la ruta.' }, { status: 400 });
        }
        // El ID de usuario debe venir del backend (sesión)
        // inputData.id_usuario = idUsuarioDeSesion;
        if (!inputData.id_usuario || typeof inputData.id_usuario !== 'number') {
            console.error(`${logPrefix} Error: id_usuario inválido o faltante en datos procesados.`);
            return NextResponse.json({ message: 'Error interno al procesar usuario.' }, { status: 500 });
        }
        if (!inputData.texto_comentario || typeof inputData.texto_comentario !== 'string' || !inputData.texto_comentario.trim()) {
            return NextResponse.json({ message: 'El texto del comentario es requerido.' }, { status: 400 });
        }

        const nuevoComentario = await agregarComentario(inputData);
        return NextResponse.json(nuevoComentario, { status: 201 });

    } catch (error: any) { // Consider 'unknown' and type checking
        console.error(`${logPrefix} Error:`, error);
        if (error.message?.includes('no encontrado')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json(
            { message: 'Error al agregar el comentario', error: error.message },
            { status: 500 }
        );
    }
}