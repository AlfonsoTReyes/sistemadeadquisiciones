// Importaciones necesarias para Next.js y funciones del servicio.
import { NextRequest, NextResponse } from 'next/server';
//import { getProveedorById, updateProveedorCompleto, createProveedorCompleto } from '../../../services/proveedoresservice'; // Add createProveedorCompleto
import { getProveedorById, updateProveedorCompleto, createProveedorCompleto, getProveedorByUserId } from '../../../services/proveedoresservice';

// --- Existing GET function remains here ---
export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id_proveedor  = searchParams.get('id_proveedor');
      const id_usuario_proveedor = searchParams.get('id_usuario_proveedor'); // New parameter

      // --- PRIORITIZE fetching by USER ID ---
      if (id_usuario_proveedor) {
        console.log(`DEBUG API GET: Received request for user ID: ${id_usuario_proveedor}`);
        try {
          const userIdNum = parseInt(id_usuario_proveedor, 10);
          if (isNaN(userIdNum)) {
               return NextResponse.json({ message: 'ID de usuario proveedor inválido' }, { status: 400 });
          }
          const proveedor = await getProveedorByUserId(userIdNum);
          if (!proveedor) {
              // It's possible the user exists but hasn't finished registration
              console.log(`DEBUG API GET: No profile found for user ID: ${userIdNum}`);
              return NextResponse.json({ message: 'Perfil de proveedor no encontrado para este usuario.' }, { status: 404 });
          }
          console.log(`DEBUG API GET: Found profile for user ID: ${userIdNum}`);
          return NextResponse.json(proveedor);
        } catch(err: any) {
             // Catch errors from getProveedorByUserId specifically
             console.error(`Error fetching by user ID ${id_usuario_proveedor}:`, err);
             return NextResponse.json({ message: err.message || 'Error al obtener perfil por usuario', error: err }, { status: 500 });
        }
    }
    // --- Fallback to original logic if fetching by provider ID ---
    else if (id_proveedor) {
        //console.log(`DEBUG API GET: Received request for provider ID: ${id_proveedor}`);
        if (isNaN(parseInt(id_proveedor))) {
            return NextResponse.json({ message: 'ID de proveedor inválido' }, { status: 400 });
        }
        const proveedor = await getProveedorById(parseInt(id_proveedor));
        if (!proveedor) {
            return NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
        }
        return NextResponse.json(proveedor);
    }
    // --- If neither ID is provided ---
    else {
        console.log("DEBUG API GET: No ID provided in request.");
         return NextResponse.json({ message: 'Se requiere id_proveedor o id_usuario_proveedor' }, { status: 400 });
    }

  } catch (error: any) {
     console.error("GET /api/proveedores Generic Error:", error);
     return NextResponse.json({ message: 'Error general al obtener proveedor', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
        // Expect the full data object in the body now
        const data = await req.json();
        const { id_proveedor, ...proveedorData } = data; // Separate ID from the rest

        console.log(`DEBUG PUT /api/proveedores - Updating ID: ${id_proveedor}`);
        console.log(`DEBUG PUT /api/proveedores - Data:`, proveedorData); // Log if needed

        // --- Validation ---
        if (!id_proveedor || typeof id_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor inválido o no proporcionado para actualizar' }, { status: 400 });
        }
        // CRUCIAL: Validate tipoProveedor exists and is correct
        if (!proveedorData.tipoProveedor || (proveedorData.tipoProveedor !== 'moral' && proveedorData.tipoProveedor !== 'fisica')) {
             return NextResponse.json({ message: 'Tipo de proveedor inválido o no proporcionado en los datos de actualización.' }, { status: 400 });
        }

        // Call the refined service function
        const proveedorActualizado = await updateProveedorCompleto(id_proveedor, proveedorData as any); // Cast to any or use defined interface UpdateProveedorData

        return NextResponse.json(proveedorActualizado); // Return updated data

    } catch (error: any) {
        console.error("ERROR PUT /api/proveedores:", error);
        // Refined error handling based on service errors
        if (error.message.includes("Tipo de proveedor inválido")) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        if (error.message.includes("no encontrado para actualizar")) {
             return NextResponse.json({ message: error.message }, { status: 404 });
        }
        // Handle other potential errors (DB constraints, etc.)
        // ...
        // Default error
        return NextResponse.json({ message: 'Error al actualizar el proveedor', error: error.message || 'Error desconocido' }, { status: 500 });
    }
}
// --- CORRECTED POST FUNCTION ---
export async function POST(req: NextRequest) {
    try {
        // 'data' will contain { ..., id_usuario_proveedor: N, tipoProveedor: '...', ... }
        const data = await req.json();
        console.log("DEBUG POST /api/proveedores - Received data:", data); // Log received data

        // Validation for tipoProveedor
        if (!data.tipoProveedor || !['moral', 'fisica'].includes(data.tipoProveedor)) {
             return NextResponse.json({ message: 'Tipo de proveedor inválido o no especificado.' }, { status: 400 });
        }

        // --- CORRECTED CHECK: Use the correct property name ---
        if (!data.id_usuario_proveedor) {
            console.error("ERROR POST /api/proveedores: Missing id_usuario_proveedor in request body.");
            return NextResponse.json({ message: 'ID de usuario proveedor no proporcionado.' }, { status: 400 });
       }
        // --- END OF CORRECTED CHECK ---

        // Add other crucial validation here (e.g., required fields based on tipoProveedor)
        // Example:
        if (data.tipoProveedor === 'moral' && (!data.razon_social || !data.nombre_representante /* ... */)) {
             return NextResponse.json({ message: 'Faltan campos requeridos para Persona Moral.' }, { status: 400 });
        }
        // Add checks for 'fisica' type as well

        // Call the service function - 'data' already has id_usuario_proveedor
        // The service function createProveedorCompleto expects this property name
        const nuevoProveedor = await createProveedorCompleto(data);

        // Return 201 Created status
        return NextResponse.json(nuevoProveedor, { status: 201 });

    } catch (error: any) {
        console.error("ERROR POST /api/proveedores:", error); // Log the full error
         // Handle specific errors from the service (e.g., duplicates, validation inside service)
         if (error.message.includes("ya existe") || error.message.includes("ya está registrado") || error.message.includes('ya tiene un perfil')) {
            return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
        }
        if (error.message.startsWith("Faltan campos requeridos") || error.message.startsWith("Tipo de proveedor inválido") || error.message.startsWith("Error interno al registrar")) {
            return NextResponse.json({ message: error.message }, { status: 400 }); // Bad Request from service validation
        }
       // Default error
       return NextResponse.json({ message: 'Error al registrar el perfil del proveedor', error: error.message || 'Error desconocido' }, { status: 500 });
   }
}
