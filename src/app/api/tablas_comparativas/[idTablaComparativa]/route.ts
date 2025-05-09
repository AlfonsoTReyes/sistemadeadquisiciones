// src/app/api/tablas-comparativas/[idTablaComparativa]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getTablaComparativaPorId,
    actualizarTablaComparativa,
    eliminarTablaComparativa,
} from '@/services/tablasComparativasService';
import { ActualizarTablaInput } from '@/types/tablaComparativa';

export const dynamic = 'force-dynamic';

// Helper function to extract ID, as it will be repeated
function getIdFromPathname(pathname: string): string | undefined {
    const parts = pathname.split('/');
    // Expected: /api/tablas_comparativas/[idTablaComparativa]
    // Indices:    0   1           2               3
    // Or for /api/tablas_comparativas/[idTablaComparativa]/comentarios
    // Indices:    0   1           2               3                4
    // This needs to be robust or specific to the route structure.
    // For this route, it's index 3.
    return parts[3];
}

// --- GET ---
export async function GET(
    request: NextRequest
    // { params }: { params: { idTablaComparativa: string } } // Temporarily remove
) {
    const idTablaComparativa = getIdFromPathname(request.nextUrl.pathname);

    if (!idTablaComparativa) {
        return NextResponse.json({ message: 'No se pudo determinar el ID de la tabla desde la URL' }, { status: 400 });
    }

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
    } catch (error: unknown) {
        console.error(`API ERROR [GET /api/tablas-comparativas/${id}]:`, error);
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ message: 'Error al obtener la tabla comparativa', error: message }, { status: 500 });
    }
}

// --- PATCH ---
export async function PATCH(
    request: NextRequest
    // { params }: { params: { idTablaComparativa: string } } // Temporarily remove
) {
    const idTablaComparativa = getIdFromPathname(request.nextUrl.pathname);

    if (!idTablaComparativa) {
        return NextResponse.json({ message: 'No se pudo determinar el ID de la tabla desde la URL' }, { status: 400 });
    }

    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }
    try {
        const body = await request.json();
        const updateData: ActualizarTablaInput = body;
        // ... (rest of your PATCH logic)
        if (Object.keys(updateData).length === 0) { /* ... */ }
        if (updateData.estado && !['borrador', 'en_revision', 'aprobada', 'rechazada'].includes(updateData.estado)) { /* ... */ }
        const tablaActualizada = await actualizarTablaComparativa(id, updateData);
        return NextResponse.json(tablaActualizada, { status: 200 });
    } catch (error: unknown) {
        console.error(`API ERROR [PATCH /api/tablas-comparativas/${id}]:`, error);
        const message = error instanceof Error ? error.message : 'Error desconocido';
        // ... (your existing error handling for PATCH)
        if (message.includes('no encontrada')) {
            return NextResponse.json({ message: message }, { status: 404 });
        }
        if (message.includes('inválido')) {
            return NextResponse.json({ message: message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error al actualizar la tabla comparativa', error: message }, { status: 500 });
    }
}

// --- DELETE ---
export async function DELETE(
    request: NextRequest
    // { params }: { params: { idTablaComparativa: string } } // Temporarily remove
) {
    const idTablaComparativa = getIdFromPathname(request.nextUrl.pathname);

    if (!idTablaComparativa) {
        return NextResponse.json({ message: 'No se pudo determinar el ID de la tabla desde la URL' }, { status: 400 });
    }

    const id = parseInt(idTablaComparativa, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }
    try {
        await eliminarTablaComparativa(id);
        return new NextResponse(null, { status: 204 });
    } catch (error: unknown) {
        console.error(`API ERROR [DELETE /api/tablas-comparativas/${id}]:`, error);
        const message = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({ message: 'Error al eliminar la tabla comparativa', error: message }, { status: 500 });
    }
}