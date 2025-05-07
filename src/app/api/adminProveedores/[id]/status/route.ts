// src/app/api/adminProveedores/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Ensure this path correctly points to your service file
import { updateProveedorEstatus } from '@/services/adminproveedoresservice';

// Define an interface for the dynamic route parameters
interface RouteParams {
  id: string;
}

// Define an interface for the context object passed as the second argument
interface HandlerContext {
  params: RouteParams;
}

// Usamos PATCH para actualizaciones parciales como el estatus
export async function PATCH(req: NextRequest, context: HandlerContext) {
    // Access 'id' from context.params
    const idProveedorStr = context.params.id;
    console.log(`DEBUG API PATCH /api/adminProveedores/${idProveedorStr}/status: Request received.`);

    try {
        // Validar ID
        const idProveedor = parseInt(idProveedorStr, 10);
        if (isNaN(idProveedor)) {
            return NextResponse.json({ message: 'ID de proveedor inválido en la URL' }, { status: 400 });
        }

        // Obtener y validar nuevo estatus del cuerpo
        const body = await req.json();
        const { estatus } = body; // Assuming 'estatus' is expected in the body
        if (typeof estatus !== 'boolean') {
            return NextResponse.json({ message: 'El valor de "estatus" debe ser booleano (true/false)' }, { status: 400 });
        }

        console.log(`DEBUG API PATCH: Calling service updateProveedorEstatus for ID ${idProveedor} to ${estatus}`);
        // Llamar al servicio para actualizar
        const proveedorActualizado = await updateProveedorEstatus(idProveedor, estatus);

        console.log(`DEBUG API PATCH: Service call successful for ID ${idProveedor}.`);
        // Devolver info actualizada
        return NextResponse.json(proveedorActualizado);

    } catch (error: unknown) { // Changed 'any' to 'unknown' for better type safety
        console.error(`ERROR PATCH /api/adminProveedores/${idProveedorStr}/status:`, error);
        
        let errorMessage = 'Error al actualizar el estatus del proveedor.';
        let statusCode = 500;
        let errorDetails: string | undefined;

        if (error instanceof Error) {
            errorMessage = error.message; // Use the specific error message
            errorDetails = error.message;
            if (error.message.includes("no encontrado para actualizar")) { // Check if this specific message comes from your service
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

// You can also add other HTTP methods (GET, POST, DELETE, etc.) here if needed,
// following a similar signature pattern for their arguments.
// For example:
// export async function GET(req: NextRequest, context: HandlerContext) {
//   const id = context.params.id;
//   // ... your GET logic
//   return NextResponse.json({ message: `GET request for ID: ${id}` });
// }