// src/app/api/tablas-comparativas/[idTablaComparativa]/items/[idItem]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eliminarItem } from '@/services/tablasComparativasService'; // ¡IMPLEMENTAR ESTA FUNCIÓN!

interface RouteParams {
    params: {
        idTablaComparativa: string;
        idItem: string;
    };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa, idItem } = params;
    const logPrefix = `API DELETE /tablas-comparativas/${idTablaComparativa}/items/${idItem}:`;
    console.log(logPrefix);

    // 1. Validar IDs
    const idTabla = parseInt(idTablaComparativa, 10);
    const itemId = parseInt(idItem, 10);

    if (isNaN(idTabla) || isNaN(itemId)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta.' }, { status: 400 });
    }

    try {
        // 2. Llamar al Servicio
        // El servicio necesita saber el ID del ítem a eliminar.
        // Podría necesitar idTabla para verificar pertenencia o seguridad.
        await eliminarItem(itemId); // Pasar el ID del ítem

        // 3. Devolver Respuesta Exitosa
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        if (error.message.includes('no encontrado')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        // Capturar errores de transacción si el servicio los lanza
        return NextResponse.json(
            { message: 'Error al eliminar el ítem', error: error.message },
            { status: 500 }
        );
    }
}