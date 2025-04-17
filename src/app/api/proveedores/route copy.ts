// Importaciones necesarias
import { NextRequest, NextResponse } from 'next/server';
import {
    getProveedorById,
    updateProveedorCompleto,
    createProveedorCompleto,
    getProveedorByUserId
    // Importa también las interfaces si las defines en el service y quieres usarlas aquí para type safety
    // UpdateProveedorData, CreateProveedorData
} from '../../../services/proveedoresservice'; // Ajusta la ruta según tu estructura

// --- GET (Sin cambios necesarios en la lógica del route handler) ---
// La actualización en los servicios getProveedorById y getProveedorByUserId
// ya asegura que los nuevos campos (actividad_sat, proveedor_eventos)
// se incluyan en la respuesta si existen en la base de datos.
export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id_proveedor  = searchParams.get('id_proveedor');
      const id_usuario_proveedor = searchParams.get('id_usuario_proveedor');

      if (id_usuario_proveedor) {
        console.log(`DEBUG API GET: Request for user ID: ${id_usuario_proveedor}`);
        try {
          const userIdNum = parseInt(id_usuario_proveedor, 10);
          if (isNaN(userIdNum)) {
               return NextResponse.json({ message: 'ID de usuario proveedor inválido' }, { status: 400 });
          }
          const proveedor = await getProveedorByUserId(userIdNum);
          if (!proveedor) {
              console.log(`DEBUG API GET: No profile found for user ID: ${userIdNum}`);
              return NextResponse.json({ message: 'Perfil de proveedor no encontrado para este usuario.' }, { status: 404 });
          }
          console.log(`DEBUG API GET: Found profile for user ID: ${userIdNum}, returning data.`);
          return NextResponse.json(proveedor); // Ya incluye actividad_sat y proveedor_eventos desde el servicio
        } catch(err: any) {
             console.error(`Error fetching by user ID ${id_usuario_proveedor}:`, err);
             return NextResponse.json({ message: err.message || 'Error al obtener perfil por usuario' }, { status: 500 });
        }
      } else if (id_proveedor) {
          console.log(`DEBUG API GET: Request for provider ID: ${id_proveedor}`);
          const providerIdNum = parseInt(id_proveedor, 10); // Parse aquí
          if (isNaN(providerIdNum)) { // Validar resultado del parse
              return NextResponse.json({ message: 'ID de proveedor inválido' }, { status: 400 });
          }
          const proveedor = await getProveedorById(providerIdNum); // Usar el número parseado
          if (!proveedor) {
              return NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
          }
          console.log(`DEBUG API GET: Found profile for provider ID: ${providerIdNum}, returning data.`);
          return NextResponse.json(proveedor); // Ya incluye actividad_sat y proveedor_eventos desde el servicio
      } else {
          console.log("DEBUG API GET: No ID provided.");
          return NextResponse.json({ message: 'Se requiere id_proveedor o id_usuario_proveedor' }, { status: 400 });
      }
    } catch (error: any) {
     console.error("GET /api/proveedores Generic Error:", error);
     return NextResponse.json({ message: 'Error general al obtener proveedor', error: error.message }, { status: 500 });
    }
}

// --- PUT (ACTUALIZADO) ---
export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        // Desestructura id_proveedor y el resto de los datos que pueden incluir los nuevos campos
        const { id_proveedor, ...proveedorData } = data;

        console.log(`DEBUG PUT /api/proveedores - Updating ID: ${id_proveedor}`);
        // Log para ver si llegan los nuevos campos
        console.log(`DEBUG PUT /api/proveedores - Received Data:`, proveedorData);
        if (proveedorData.actividadSat !== undefined) {
            console.log(`DEBUG PUT /api/proveedores - Received actividadSat: ${proveedorData.actividadSat}`);
        }
        if (proveedorData.proveedorEventos !== undefined) {
             console.log(`DEBUG PUT /api/proveedores - Received proveedorEventos: ${proveedorData.proveedorEventos} (Type: ${typeof proveedorData.proveedorEventos})`);
        }

        // --- Validación ---
        if (!id_proveedor || typeof id_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor inválido o no proporcionado para actualizar' }, { status: 400 });
        }
        if (!proveedorData.tipoProveedor || (proveedorData.tipoProveedor !== 'moral' && proveedorData.tipoProveedor !== 'fisica')) {
             return NextResponse.json({ message: 'Tipo de proveedor inválido o no proporcionado en los datos de actualización.' }, { status: 400 });
        }
        // Opcional: Validar el tipo de proveedorEventos si se envía
        if (proveedorData.proveedorEventos !== undefined && typeof proveedorData.proveedorEventos !== 'boolean') {
            return NextResponse.json({ message: 'El campo proveedorEventos debe ser un valor booleano (true/false).' }, { status: 400 });
        }

        // Llamar al servicio. proveedorData ya contiene actividadSat y proveedorEventos si fueron enviados por el cliente.
        // El servicio updateProveedorCompleto fue actualizado para manejarlos.
        // Asegúrate de que la interfaz UpdateProveedorData en el servicio coincida o usa 'as any' si es necesario.
        const proveedorActualizado = await updateProveedorCompleto(id_proveedor, proveedorData as any); // O usa: UpdateProveedorData

        console.log(`DEBUG PUT /api/proveedores - Update successful for ID: ${id_proveedor}`);
        return NextResponse.json(proveedorActualizado); // Devuelve el proveedor actualizado

    } catch (error: any) {
        console.error("ERROR PUT /api/proveedores:", error);
        // Mantener manejo de errores específicos del servicio
        if (error.message.includes("Tipo de proveedor inválido")) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        if (error.message.includes("no encontrado para actualizar")) {
             return NextResponse.json({ message: error.message }, { status: 404 });
        }
        // Default error
        return NextResponse.json({ message: 'Error al actualizar el proveedor', error: error.message || 'Error desconocido' }, { status: 500 });
    }
}

// --- POST (ACTUALIZADO) ---
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log("DEBUG POST /api/proveedores - Received data:", data);
        // Log específico para los nuevos campos
        console.log(`DEBUG POST /api/proveedores - Received actividadSat: ${data.actividadSat}`);
        console.log(`DEBUG POST /api/proveedores - Received proveedorEventos: ${data.proveedorEventos}`);


        // --- Validación ---
        if (!data.tipoProveedor || !['moral', 'fisica'].includes(data.tipoProveedor)) {
             return NextResponse.json({ message: 'Tipo de proveedor inválido o no especificado.' }, { status: 400 });
        }
        if (!data.id_usuario_proveedor || typeof data.id_usuario_proveedor !== 'number') { // Validar tipo también
            console.error("ERROR POST /api/proveedores: Missing or invalid id_usuario_proveedor.");
            return NextResponse.json({ message: 'ID de usuario proveedor inválido o no proporcionado.' }, { status: 400 });
        }
        // NUEVA VALIDACIÓN: Asegurar que actividadSat (requerido) venga
        if (!data.actividadSat || typeof data.actividadSat !== 'string' || data.actividadSat.trim() === '') {
             console.error("ERROR POST /api/proveedores: Missing or empty actividadSat.");
             return NextResponse.json({ message: 'El campo "Actividad SAT" es requerido y no puede estar vacío.' }, { status: 400 });
        }
         // Opcional: Validar el tipo de proveedorEventos si se envía
         if (data.proveedorEventos !== undefined && typeof data.proveedorEventos !== 'boolean') {
            return NextResponse.json({ message: 'El campo proveedorEventos debe ser un valor booleano (true/false).' }, { status: 400 });
        }

        // Validación de campos requeridos según tipo (mantener la lógica existente)
        if (data.tipoProveedor === 'moral' && (!data.razon_social || !data.nombre_representante || !data.apellido_p_representante)) {
             return NextResponse.json({ message: 'Faltan campos requeridos para Persona Moral (Razón Social, Nombre Rep., Apellido P Rep.).' }, { status: 400 });
        }
        if (data.tipoProveedor === 'fisica' && (!data.nombre || !data.apellido_p || !data.curp)) {
            return NextResponse.json({ message: 'Faltan campos requeridos para Persona Física (Nombre, Apellido P, CURP).' }, { status: 400 });
        }
        // ... añadir más validaciones de campos comunes si son requeridos (RFC, etc.)
        if (!data.rfc || !data.correo /* ... otros campos requeridos ... */) {
             return NextResponse.json({ message: 'Faltan campos generales requeridos (RFC, Correo, etc.).' }, { status: 400 });
        }

        // Llamar al servicio. 'data' ya incluye actividadSat y proveedorEventos.
        // El servicio createProveedorCompleto fue actualizado para manejarlos.
        // Asegúrate de que la interfaz CreateProveedorData coincida o usa 'as any'.
        const nuevoProveedor = await createProveedorCompleto(data as any); // O usa: CreateProveedorData

        console.log(`DEBUG POST /api/proveedores - Creation successful, new ID: ${nuevoProveedor.id_proveedor}`);
        return NextResponse.json(nuevoProveedor, { status: 201 }); // 201 Created

    } catch (error: any) {
        console.error("ERROR POST /api/proveedores:", error);
         // Mantener manejo de errores del servicio
         if (error.message.includes("ya tiene un perfil") || error.message.includes('Este usuario proveedor ya tiene un perfil registrado')) { // Ajusta según el mensaje exacto del servicio
            return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
        }
        // Capturar errores de validación del servicio o de la BD
        if (error.message.startsWith("Faltan campos requeridos") || error.message.startsWith("Tipo de proveedor inválido") || error.message.startsWith("Error al registrar el proveedor") || error.message.includes('requerido y no puede estar vacío')) {
            return NextResponse.json({ message: error.message }, { status: 400 }); // Bad Request
        }
       // Default error
       return NextResponse.json({ message: 'Error al registrar el perfil del proveedor', error: error.message || 'Error desconocido' }, { status: 500 });
   }
}