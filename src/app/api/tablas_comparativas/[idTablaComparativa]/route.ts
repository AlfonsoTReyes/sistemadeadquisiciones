// src/app/api/tablas-comparativas/[idTablaComparativa]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
    getTablaComparativaPorId,
    actualizarTablaComparativa,
    eliminarTablaComparativa,
} from '@/services/tablasComparativasService';
import { ActualizarTablaInput } from '@/types/tablaComparativa';

// Definir el tipo para el contexto, incluyendo params
interface RouteContext {
    params: {
        idTablaComparativa: string;
    }
}

// --- GET ---
// Cambiar la firma para recibir el contexto completo
export async function GET(request: NextRequest, context: RouteContext) {
    // Acceder a params desde el contexto
    const { params } = context;
    const { idTablaComparativa } = params; // Ahora esto debería funcionar
    console.log(`API: GET /api/tablas-comparativas/${idTablaComparativa} called`);

    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }
    try {
        const tablaCompleta = await getTablaComparativaPorId(id);
        if (!tablaCompleta) {
            return NextResponse.json({ message: `Tabla comparativa con ID ${id} no encontrada.` }, { status: 404 });
        }
        return NextResponse.json(tablaCompleta, { status: 200 });
    } catch (error: any) {
        console.error(`API ERROR [GET /api/tablas-comparativas/${id}]:`, error);
        return NextResponse.json({ message: 'Error al obtener la tabla comparativa', error: error.message }, { status: 500 });
    }
}

// --- PATCH ---
// Cambiar la firma para recibir el contexto completo
export async function PATCH(request: NextRequest, context: RouteContext) {
    // Acceder a params desde el contexto
    const { params } = context;
    const { idTablaComparativa } = params;
    console.log(`API: PATCH /api/tablas-comparativas/${idTablaComparativa} called`);

    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }
    // ... resto del código PATCH sin cambios ...
    try {
        const body = await request.json();
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
        const tablaActualizada = await actualizarTablaComparativa(id, updateData);
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
        return NextResponse.json({ message: 'Error al actualizar la tabla comparativa', error: error.message }, { status: 500 });
    }
}

// --- DELETE ---
// Cambiar la firma para recibir el contexto completo
export async function DELETE(request: NextRequest, context: RouteContext) {
    // Acceder a params desde el contexto
    const { params } = context;
    const { idTablaComparativa } = params;
    console.log(`API: DELETE /api/tablas-comparativas/${idTablaComparativa} called`);

    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }
    // ... resto del código DELETE sin cambios ...
    try {
        await eliminarTablaComparativa(id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error(`API ERROR [DELETE /api/tablas-comparativas/${id}]:`, error);
        return NextResponse.json({ message: 'Error al eliminar la tabla comparativa', error: error.message }, { status: 500 });
    }
}