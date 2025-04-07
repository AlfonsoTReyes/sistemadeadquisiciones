// src/app/api/admin/proveedores/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Ajusta la ruta a tu archivo de servicio
import { updateProveedorEstatus } from '@/services/adminproveedoresservice';

// Usamos PATCH para actualizaciones parciales como el estatus
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const idProveedorStr = params.id;
    console.log(`DEBUG API PATCH /api/admin/proveedores/${idProveedorStr}/status: Request received.`);

    try {
        // Validar ID
        const idProveedor = parseInt(idProveedorStr, 10);
        if (isNaN(idProveedor)) {
            return NextResponse.json({ message: 'ID de proveedor inválido en la URL' }, { status: 400 });
        }

        // Obtener y validar nuevo estatus del cuerpo
        const body = await req.json();
        const { estatus } = body;
        if (typeof estatus !== 'boolean') {
            return NextResponse.json({ message: 'El valor de "estatus" debe ser booleano (true/false)' }, { status: 400 });
        }

        console.log(`DEBUG API PATCH: Calling service updateProveedorEstatus for ID ${idProveedor} to ${estatus}`);
        // Llamar al servicio para actualizar
        const proveedorActualizado = await updateProveedorEstatus(idProveedor, estatus);

        console.log(`DEBUG API PATCH: Service call successful for ID ${idProveedor}.`);
        // Devolver info actualizada
        return NextResponse.json(proveedorActualizado);

    } catch (error: any) {
        console.error(`ERROR PATCH /api/admin/proveedores/${idProveedorStr}/status:`, error);
        // Manejar error si el proveedor no se encontró para actualizar
        if (error.message.includes("no encontrado para actualizar")) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        // Error genérico
        return NextResponse.json(
            { message: error.message || 'Error al actualizar el estatus del proveedor.', error: error.message },
            { status: 500 }
        );
    }
}