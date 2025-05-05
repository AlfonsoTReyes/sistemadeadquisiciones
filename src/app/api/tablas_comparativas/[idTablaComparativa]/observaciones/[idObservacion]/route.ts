// src/app/api/tablas-comparativas/[idTablaComparativa]/observaciones/[idObservacion]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eliminarObservacion } from '@/services/tablasComparativasService'; // ¡IMPLEMENTAR ESTA FUNCIÓN!

interface RouteParams {
    params: {
        idTablaComparativa: string;
        idObservacion: string;
    };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa, idObservacion } = params;
    const logPrefix = `API DELETE /tablas-comparativas/${idTablaComparativa}/observaciones/${idObservacion}:`;
    console.log(logPrefix);

    // 1. Validar IDs
    const idTabla = parseInt(idTablaComparativa, 10);
    const observacionId = parseInt(idObservacion, 10);

    if (isNaN(idTabla) || isNaN(observacionId)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta.' }, { status: 400 });
    }

    try {
        // 2. Llamar al Servicio
        // El servicio podría necesitar idTabla para verificar pertenencia
        await eliminarObservacion(observacionId); // Pasar el ID de la observación

        // 3. Devolver Respuesta Exitosa
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        if (error.message.includes('no encontrado')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json(
            { message: 'Error al eliminar la observación', error: error.message },
            { status: 500 }
        );
    }
}