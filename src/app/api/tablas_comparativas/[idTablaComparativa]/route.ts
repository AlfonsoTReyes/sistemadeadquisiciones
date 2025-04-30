// src/app/api/tablas-comparativas/[idTablaComparativa]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
    getTablaComparativaPorId,
    actualizarTablaComparativa,
    eliminarTablaComparativa,
} from '@/services/tablasComparativasService'; // Ajusta la ruta
import { ActualizarTablaInput } from '@/types/tablaComparativa'; // Ajusta la ruta

interface RouteParams {
    params: {
        idTablaComparativa: string;
    }
}

// --- GET /api/tablas-comparativas/[id] ---
// Obtiene los detalles completos de una tabla comparativa específica.
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa } = params;
    console.log(`API: GET /api/tablas-comparativas/${idTablaComparativa} called`);

    // Validar que el ID es un número válido
    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    try {
        const tablaCompleta = await getTablaComparativaPorId(id);

        if (!tablaCompleta) {
            return NextResponse.json(
                { message: `Tabla comparativa con ID ${id} no encontrada.` },
                { status: 404 } // Not Found
            );
        }

        return NextResponse.json(tablaCompleta, { status: 200 });

    } catch (error: any) {
        console.error(`API ERROR [GET /api/tablas-comparativas/${id}]:`, error);
        return NextResponse.json(
            { message: 'Error al obtener la tabla comparativa', error: error.message },
            { status: 500 }
        );
    }
}

// --- PATCH /api/tablas-comparativas/[id] ---
// Actualiza parcialmente una tabla comparativa existente.
// Usamos PATCH para actualizaciones parciales, PUT requeriría enviar el objeto completo.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa } = params;
    console.log(`API: PATCH /api/tablas-comparativas/${idTablaComparativa} called`);

    // Validar ID
    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    try {
        // 1. Obtener los datos del cuerpo
        const body = await request.json();
        console.log(`API: Request body for PATCH ${id}:`, body);

        // 2. Validar los datos de entrada (Ejemplo básico)
        //    Asegurarse de que los campos a actualizar sean válidos. Zod es ideal aquí.
        const updateData: ActualizarTablaInput = body;
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { message: 'No se proporcionaron datos para actualizar.' },
                { status: 400 }
            );
        }
        // Validar tipos de datos si es necesario (ej. estado debe ser uno de los permitidos)
        if (updateData.estado && !['borrador', 'en_revision', 'aprobada', 'rechazada'].includes(updateData.estado)) {
            return NextResponse.json({ message: 'Valor de estado inválido.' }, { status: 400 });
        }


        // 3. Llamar al servicio para actualizar
        const tablaActualizada = await actualizarTablaComparativa(id, updateData);

        // 4. Devolver la tabla actualizada
        return NextResponse.json(tablaActualizada, { status: 200 });

    } catch (error: any) {
        console.error(`API ERROR [PATCH /api/tablas-comparativas/${id}]:`, error);
        // El servicio puede lanzar un error si el ID no existe o la validación falla
        if (error.message.includes('no encontrada')) { // Ajusta esto según los mensajes de error de tu servicio
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        if (error.message.includes('inválido')) { // Ajusta esto
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        return NextResponse.json(
            { message: 'Error al actualizar la tabla comparativa', error: error.message },
            { status: 500 }
        );
    }
}

// --- DELETE /api/tablas-comparativas/[id] ---
// Elimina una tabla comparativa específica (y sus datos asociados por CASCADE).
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa } = params;
    console.log(`API: DELETE /api/tablas-comparativas/${idTablaComparativa} called`);

    // Validar ID
    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    try {
        await eliminarTablaComparativa(id);

        // Devolver respuesta exitosa sin contenido
        return new NextResponse(null, { status: 204 }); // 204 No Content

    } catch (error: any) {
        console.error(`API ERROR [DELETE /api/tablas-comparativas/${id}]:`, error);
        // Podría haber un error si, por ejemplo, restricciones FK impiden borrar (aunque CASCADE debería manejarlo)
        return NextResponse.json(
            { message: 'Error al eliminar la tabla comparativa', error: error.message },
            { status: 500 }
        );
    }
}