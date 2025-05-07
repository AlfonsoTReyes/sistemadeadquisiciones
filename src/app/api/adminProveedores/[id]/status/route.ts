// src/app/api/adminProveedores/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Ensure this path correctly points to your service file
import { updateProveedorEstatus } from '@/services/adminproveedoresservice';

// The second argument for a dynamic route handler should be typed like this:
// { params: { segmentName1: string, segmentName2: string, ... } }
// In your case, the segment is 'id'.

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } } // This is the standard and correct way
) {
    const idProveedorStr = params.id;
    console.log(`DEBUG API PATCH /api/adminProveedores/${idProveedorStr}/status: Request received.`);

    try {
        const idProveedor = parseInt(idProveedorStr, 10);
        if (isNaN(idProveedor)) {
            return NextResponse.json({ message: 'ID de proveedor inválido en la URL' }, { status: 400 });
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

// Example for GET if you need it:
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;
//   // ... your GET logic
//   return NextResponse.json({ message: `GET request for ID: ${id}` });
// }