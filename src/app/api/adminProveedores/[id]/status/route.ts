// src/app/api/adminProveedores/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateProveedorEstatus } from '@/services/adminproveedoresservice';

export async function PATCH(
    req: NextRequest
    // We are removing the second 'context' or '{ params }' argument for this test
) {
    // Attempt to extract 'id' from the URL pathname
    // Pathname will be like: /api/adminProveedores/21/status
    const pathnameParts = req.nextUrl.pathname.split('/');
    // The 'id' should be the second to last part if the route is /api/adminProveedores/[id]/status
    // Example: ['', 'api', 'adminProveedores', '21', 'status']
    // So, id would be at index pathnameParts.length - 2
    const idProveedorStr = pathnameParts[pathnameParts.length - 2];

    console.log(`DEBUG API PATCH (from pathname) /api/adminProveedores/${idProveedorStr}/status: Request received. Pathname: ${req.nextUrl.pathname}`);

    if (!idProveedorStr) {
        console.error("Error: Could not extract ID from pathname.", pathnameParts);
        return NextResponse.json({ message: 'No se pudo determinar el ID del proveedor desde la URL' }, { status: 400 });
    }

    try {
        const idProveedor = parseInt(idProveedorStr, 10);
        if (isNaN(idProveedor)) {
            return NextResponse.json({ message: 'ID de proveedor inválido en la URL (extraído del pathname)' }, { status: 400 });
        }

        const body = await req.json();
        const { estatus } = body;
        if (typeof estatus !== 'boolean') {
            return NextResponse.json({ message: 'El valor de "estatus" debe ser booleano (true/false)' }, { status: 400 });
        }

        console.log(`DEBUG API PATCH: Calling service updateProveedorEstatus for ID ${idProveedor} to ${estatus}`);
        const proveedorActualizado = await updateProveedorEstatus(idProveedor, estatus);

        console.log(`DEBUG API PATCH: Service call successful for ID ${idProveedor}.`);
        return NextResponse.json(proveedorActualizado);

    } catch (error: unknown) {
        console.error(`ERROR PATCH /api/adminProveedores/${idProveedorStr}/status:`, error);
        
        let errorMessage = 'Error al actualizar el estatus del proveedor.';
        let statusCode = 500;
        let errorDetails: string | undefined;

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = error.message;
            if (error.message.includes("no encontrado para actualizar")) {
                statusCode = 404;
            }
        } else if (typeof error === 'string') {
            errorMessage = error;
            errorDetails = error;
        }
        
        return NextResponse.json(
            { message: errorMessage, error: errorDetails },
            { status: statusCode }
        );
    }
}