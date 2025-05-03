// src/app/api/tablas-comparativas/[idTablaComparativa]/proveedores/[idTablaComparativaProveedor]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eliminarProveedorDeTabla } from '@/services/tablasComparativasService'; // ¡IMPLEMENTAR ESTA FUNCIÓN!

interface RouteParams {
    params: {
        idTablaComparativa: string;
        idTablaComparativaProveedor: string;
    };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa, idTablaComparativaProveedor } = params;
    const logPrefix = `API DELETE /tablas-comparativas/${idTablaComparativa}/proveedores/${idTablaComparativaProveedor}:`;
    console.log(logPrefix);

    // 1. Validar IDs
    const idTabla = parseInt(idTablaComparativa, 10);
    const idTablaProv = parseInt(idTablaComparativaProveedor, 10);

    if (isNaN(idTabla) || isNaN(idTablaProv)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta.' }, { status: 400 });
    }

    try {
        // 2. Llamar al Servicio
        // El servicio podría necesitar idTabla también para verificar pertenencia, aunque idTablaProv es PK
        await eliminarProveedorDeTabla(idTablaProv); // Pasar el ID del registro a eliminar

        // 3. Devolver Respuesta Exitosa (Sin Contenido)
        return new NextResponse(null, { status: 204 });

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        if (error.message.includes('no encontrado')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json(
            { message: 'Error al eliminar el proveedor de la tabla', error: error.message },
            { status: 500 }
        );
    }
}