// src/app/api/tablas-comparativas/[idTablaComparativa]/comentarios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarComentario } from '@/services/tablasComparativasService'; // ¡IMPLEMENTAR ESTA FUNCIÓN!
import { AgregarComentarioInput } from '@/types/tablaComparativa';
// import { ZodError } from 'zod';

interface RouteParams {
    params: { idTablaComparativa: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa } = params;
    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/comentarios:`;
    console.log(logPrefix);

    // 1. Validar ID de Tabla
    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    // 2. ¡AÑADIR AUTENTICACIÓN AQUÍ! Obtener idUsuario de la sesión

    try {
        // 3. Obtener y Validar Cuerpo
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        // --- Validación (¡Usar Zod!) ---
        const inputData = body as AgregarComentarioInput; // Cast temporal
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
        // --- Fin Validación ---

        // 4. Llamar al Servicio
        const nuevoComentario = await agregarComentario(inputData);

        // 5. Devolver Respuesta Exitosa
        return NextResponse.json(nuevoComentario, { status: 201 });

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        // if (error instanceof ZodError) { ... }
        if (error.message.includes('no encontrado')) { // Ej: idTabla o idUsuario no existen
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json(
            { message: 'Error al agregar el comentario', error: error.message },
            { status: 500 }
        );
    }
}