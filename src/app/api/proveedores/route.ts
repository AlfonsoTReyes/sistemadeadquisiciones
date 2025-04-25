// Importaciones necesarias
import { NextRequest, NextResponse } from 'next/server';
import {
    getProveedorById,
    updateProveedorCompleto,
    createProveedorCompleto,
    getProveedorByUserId,
    solicitarRevisionProveedor,
    getProveedoresForSelect
} from '../../../services/proveedoresservice'; // Ajusta la ruta

// --- GET ---
export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id_proveedor  = searchParams.get('id_proveedor');
      const id_usuario_proveedor = searchParams.get('id_usuario_proveedor');
      const forSelect = searchParams.get('forSelect'); // <-- LEER NUEVO PARÁMETRO

      // --- CASO 1: Obtener lista para Select ---
      if (forSelect === 'true') {
          console.log("ROUTE GET /proveedores: Request for select options");
          const proveedoresOptions = await getProveedoresForSelect(); // Llama a la nueva función del servicio
          return NextResponse.json(proveedoresOptions); // Devuelve la lista simplificada
      }
      // --- CASO 2: Obtener por ID de Usuario Proveedor ---
      else if (id_usuario_proveedor) {
        // --- Obtener por ID de Usuario ---
        console.log(`ROUTE GET: Request for user ID: ${id_usuario_proveedor}`);
        const userIdNum = parseInt(id_usuario_proveedor, 10);
        if (isNaN(userIdNum)) {
            return NextResponse.json({ message: 'ID de usuario proveedor inválido' }, { status: 400 });
        }
        const proveedor = await getProveedorByUserId(userIdNum);
        if (!proveedor) {
            return NextResponse.json({ message: 'Perfil de proveedor no encontrado para este usuario.' }, { status: 404 });
        }
        console.log(`ROUTE GET: Found profile for user ID: ${userIdNum}`);
        return NextResponse.json(proveedor);

      }
      // --- CASO 3: Obtener por ID de Proveedor ---
      else if (id_proveedor) {
        // --- Obtener por ID de Proveedor ---
          console.log(`ROUTE GET: Request for provider ID: ${id_proveedor}`);
          const providerIdNum = parseInt(id_proveedor, 10);
          if (isNaN(providerIdNum)) {
              return NextResponse.json({ message: 'ID de proveedor inválido' }, { status: 400 });
          }
          const proveedor = await getProveedorById(providerIdNum);
          if (!proveedor) {
              return NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
          }
          console.log(`ROUTE GET: Found profile for provider ID: ${providerIdNum}`);
          return NextResponse.json(proveedor);
      }
      // --- CASO 4: Sin parámetros válidos ---
      else {
          console.log("ROUTE GET: No valid identifier provided (id_proveedor, id_usuario_proveedor, or forSelect=true).");
          // Mensaje de error actualizado para incluir la nueva opción
          return NextResponse.json({ message: 'Se requiere un parámetro válido (forSelect=true, id_proveedor o id_usuario_proveedor)' }, { status: 400 });
      }
    } catch (error: any) {
     console.error("ROUTE GET /api/proveedores Generic Error:", error);
     const status = error.message?.includes("no encontrado") ? 404 : 500;
     return NextResponse.json({ message: error.message || 'Error general al obtener proveedor', error: error.toString() }, { status });
    }
}
// --- PUT ---
export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        console.log(`ROUTE PUT /api/proveedores - Received Data:`, JSON.stringify(data, null, 2)); // Log completo

        // Desestructura ID y el resto
        const { id_proveedor, ...proveedorData } = data;

        // --- Validación Base ---
        if (!id_proveedor || typeof id_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor inválido o no proporcionado para actualizar' }, { status: 400 });
        }
        if (!proveedorData.tipoProveedor || (proveedorData.tipoProveedor !== 'moral' && proveedorData.tipoProveedor !== 'fisica')) {
             return NextResponse.json({ message: 'Tipo de proveedor ("moral" o "fisica") inválido o no proporcionado.' }, { status: 400 });
        }

        // --- Validación Específica para Moral (Array Representantes) ---
        if (proveedorData.tipoProveedor === 'moral') {
            // El array 'representantes' es opcional en la actualización, pero si viene, debe ser un array
            if (proveedorData.representantes !== undefined && !Array.isArray(proveedorData.representantes)) {
                 return NextResponse.json({ message: 'El campo "representantes" debe ser un array si se incluye.' }, { status: 400 });
            }
            // Validación adicional opcional: verificar campos dentro de cada representante si el array existe
            if (Array.isArray(proveedorData.representantes)) {
                 for (const rep of proveedorData.representantes) {
                    if (!rep.nombre_representante || !rep.apellido_p_representante) {
                        return NextResponse.json({ message: 'Cada representante en la lista debe tener al menos nombre y apellido paterno.' }, { status: 400 });
                    }
                    // Validar id_morales si viene (debe ser número)
                    if (rep.id_morales !== undefined && (typeof rep.id_morales !== 'number' || isNaN(rep.id_morales))) {
                         return NextResponse.json({ message: `ID de representante (id_morales=${rep.id_morales}) inválido.` }, { status: 400 });
                    }
                 }
            }
             // Validar razon_social si viene
             if (proveedorData.razon_social !== undefined && (typeof proveedorData.razon_social !== 'string' || proveedorData.razon_social.trim() === '')) {
                 return NextResponse.json({ message: 'Si se incluye "razon_social", no puede estar vacío.' }, { status: 400 });
             }
        } else { // tipoProveedor === 'fisica'
            // Validar campos físicos si vienen
            if (proveedorData.curp !== undefined && (typeof proveedorData.curp !== 'string' || proveedorData.curp.trim().length !== 18 )) {
                 return NextResponse.json({ message: 'Si se incluye "curp", debe ser una cadena de 18 caracteres.' }, { status: 400 });
             }
        }

        // --- Llamada al Servicio ---
        // Se pasa el id_proveedor y el objeto proveedorData que incluye el array 'representantes' si es moral
        const proveedorActualizado = await updateProveedorCompleto(id_proveedor, proveedorData as any); // Usar interfaz si se importa

        console.log(`ROUTE PUT /api/proveedores - Update successful for ID: ${id_proveedor}`);
        return NextResponse.json(proveedorActualizado); // Devuelve el proveedor actualizado con su array de representantes

    } catch (error: any) {
        console.error("ROUTE ERROR PUT /api/proveedores:", error);
        // Manejo de errores mejorado (similar al GET)
        let status = 500;
        let message = error.message || 'Error desconocido al actualizar el proveedor.';
        if (message.includes("requerido") || message.includes("inválido")) status = 400;
        if (message.includes("no encontrado")) status = 404;
        // Añadir más manejo si es necesario
        return NextResponse.json({ message: message, error: error.toString() }, { status });
    }
}

// --- POST (ADAPTADO para recibir array 'representantes') ---
export async function POST(req: NextRequest) {
    try {
        const data = await req.json(); // Contiene todos los campos, incluyendo el array 'representantes' si es moral
        console.log("ROUTE POST /api/proveedores - Received data:", JSON.stringify(data, null, 2));

        // --- Validación Base ---
        if (!data.tipoProveedor || !['moral', 'fisica'].includes(data.tipoProveedor)) {
             return NextResponse.json({ message: 'Tipo de proveedor inválido o no especificado.' }, { status: 400 });
        }
        if (!data.id_usuario_proveedor || typeof data.id_usuario_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de usuario proveedor inválido o no proporcionado.' }, { status: 400 });
        }
        if (!data.rfc || !data.actividadSat /* ... otros campos comunes requeridos ... */) {
             return NextResponse.json({ message: 'Faltan campos generales requeridos (RFC, Actividad SAT, etc.).' }, { status: 400 });
        }

        // --- Validación Específica para Moral ---
        if (data.tipoProveedor === 'moral') {
            if (!data.razon_social || typeof data.razon_social !== 'string' || data.razon_social.trim() === '') {
                 return NextResponse.json({ message: 'Se requiere "razon_social" para proveedor moral.' }, { status: 400 });
            }
            if (!Array.isArray(data.representantes) || data.representantes.length === 0) {
                 return NextResponse.json({ message: 'Se requiere al menos un representante (en el array "representantes") para proveedor moral.' }, { status: 400 });
            }
            // Validar cada objeto representante en el array
            for (const rep of data.representantes) {
                 if (!rep.nombre_representante || !rep.apellido_p_representante) {
                     return NextResponse.json({ message: 'Cada representante debe tener nombre y apellido paterno.' }, { status: 400 });
                 }
                 // No debería haber id_morales al crear
                 if (rep.id_morales !== undefined) {
                      return NextResponse.json({ message: 'No se debe incluir "id_morales" al crear nuevos representantes.' }, { status: 400 });
                 }
            }
        }
        // --- Validación Específica para Física ---
        else if (data.tipoProveedor === 'fisica') {
            if (!data.nombre || !data.apellido_p || !data.curp || data.curp.length !== 18) {
                return NextResponse.json({ message: 'Faltan campos requeridos o CURP inválido para Persona Física.' }, { status: 400 });
            }
        }

        // --- Llamada al Servicio ---
        // Se pasa el objeto 'data' completo, que incluye el array 'representantes' si es moral
        const nuevoProveedor = await createProveedorCompleto(data as any); // Usar interfaz si se importa

        console.log(`ROUTE POST /api/proveedores - Creation successful, new ID: ${nuevoProveedor.id_proveedor}`);
        return NextResponse.json(nuevoProveedor, { status: 201 }); // 201 Created

    } catch (error: any) {
        console.error("ROUTE ERROR POST /api/proveedores:", error);
        // Manejo de errores del servicio (como antes)
         let status = 500;
         let message = error.message || 'Error desconocido al registrar el proveedor.';
         if (message.includes("ya tiene un perfil") || message.includes('registrado')) status = 409; // Conflict
         if (message.includes("Faltan campos") || message.includes("inválido") || message.includes("requerido")) status = 400; // Bad Request
         if (message.includes("referencia") || error.code === '23503') status = 400; // FK violation (e.g., id_usuario_proveedor no existe)

        return NextResponse.json({ message: message, error: error.toString() }, { status });
   }
}
export async function PATCH(req: NextRequest) {
    try {
        // Para esta acción, solo necesitamos el ID del proveedor.
        // Podríamos obtenerlo de la URL (si fuera una ruta dinámica) o del body.
        // Asumamos que viene en el body por simplicidad y consistencia con PUT.
        const data = await req.json();
        const { id_proveedor } = data;

        console.log(`ROUTE PATCH /api/proveedores - Received request to request revision for ID: ${id_proveedor}`);

        // Validar ID
        if (!id_proveedor || typeof id_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor inválido o no proporcionado para solicitar revisión.' }, { status: 400 });
        }

        // Llamar al nuevo servicio específico
        const resultado = await solicitarRevisionProveedor(id_proveedor);

        console.log(`ROUTE PATCH /api/proveedores - Revision request successful for ID: ${id_proveedor}`);
        // Devolver el resultado del servicio (que incluye el nuevo estado)
        return NextResponse.json(resultado);

    } catch (error: any) {
        console.error("ROUTE ERROR PATCH /api/proveedores (solicitarRevision):", error);
        // Manejar errores específicos del servicio 'solicitarRevisionProveedor'
        let status = 500;
        let message = error.message || 'Error desconocido al solicitar la revisión.';
        if (message.includes("no encontrado")) status = 404;
        // Puedes añadir más manejo si el servicio lanza errores específicos
        return NextResponse.json({ message: message }, { status });
    }
}