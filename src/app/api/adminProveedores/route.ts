import { NextRequest, NextResponse } from 'next/server';
import {
  // Funciones del servicio para admin
  getAllProveedoresForAdmin,
  getProveedorProfileByIdForAdmin, // Usada para GET por ID
  updateProveedorEstatus,
  updateProveedorProfileForAdmin, // Usada para PUT de perfil completo
  getUsuarioProveedorByProveedorId,
  updateUsuarioProveedor
} from '@/services/adminproveedoresservice';

// GET: Obtener TODOS los proveedores o UNO específico por ID o Usuario Asociado
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const idProveedorParam = searchParams.get('id_proveedor');
  const idProveedorUsuarioParam = searchParams.get('id_proveedor_usuario'); // Para obtener usuario asociado

  // --- Caso: Obtener Usuario Asociado ---
  if (idProveedorUsuarioParam) {
    // ... (Lógica para obtener usuario asociado - SIN CAMBIOS necesarios para los nuevos campos del proveedor) ...
    const idProveedorUsuario = parseInt(idProveedorUsuarioParam, 10);
    if (isNaN(idProveedorUsuario)) {
      return NextResponse.json({ message: 'ID de proveedor inválido para buscar usuario asociado.' }, { status: 400 });
    }
    try {
      const usuarioProveedor = await getUsuarioProveedorByProveedorId(idProveedorUsuario); // Llama al servicio correcto
      if (!usuarioProveedor) {
        return NextResponse.json({ message: 'Usuario asociado no encontrado para este proveedor.' }, { status: 404 });
      }
      return NextResponse.json(usuarioProveedor);
    } catch (error: any) {
      console.error("API GET Error (Usuario Asociado):", error);
      return NextResponse.json({ message: error.message || 'Error al obtener usuario asociado.' }, { status: 500 });
    }
  }
  // --- Caso: Obtener Perfil Específico de Proveedor ---
  else if (idProveedorParam) {
    const idProveedor = parseInt(idProveedorParam, 10);
    if (isNaN(idProveedor)) {
      return NextResponse.json({ message: 'El parámetro "id_proveedor" debe ser un número válido.' }, { status: 400 });
    }
    try {
      // getProveedorProfileByIdForAdmin ahora selecciona actividad_sat y proveedor_eventos
      const proveedor = await getProveedorProfileByIdForAdmin(idProveedor);
      if (!proveedor) { // Manejar el null devuelto por el servicio
           return NextResponse.json({ message: `Perfil de proveedor con ID ${idProveedor} no encontrado.` }, { status: 404 });
      }
      // La respuesta JSON incluirá automáticamente los nuevos campos
      return NextResponse.json(proveedor);
    } catch (error: any) {
      // El servicio relanza el error, lo capturamos aquí
      console.error("API GET Error (Proveedor por ID):", error);
      // Usar el mensaje del servicio y determinar status
      const status = error.message?.includes("no encontrado") ? 404 : 500;
      return NextResponse.json({ message: error.message || 'Error al obtener el perfil del proveedor.' }, { status });
    }
  }
  // --- Caso: Obtener Lista de Proveedores ---
  else {
    try {
      // getAllProveedoresForAdmin NO fue modificado para incluir los nuevos campos (vista resumida)
      const proveedores = await getAllProveedoresForAdmin();
      return NextResponse.json(proveedores);
    } catch (error: any) {
      console.error("API GET Error (Lista Proveedores):", error);
      return NextResponse.json({ message: error.message || 'Error al obtener la lista de proveedores.' }, { status: 500 });
    }
  }
}

// PUT: Actualizar ESTATUS o PERFIL COMPLETO de un proveedor o usuario proveedor
export async function PUT(req: NextRequest) {
  let requestData;
  try {
    requestData = await req.json();
    console.log("API Route PUT /admin/proveedores received data:", JSON.stringify(requestData, null, 2));

    const data = requestData;

    // --- Caso: Actualización de Usuario Proveedor ---
    if ('id_usuario' in data && typeof data.id_usuario === 'number') {
        console.log("API Route: Handling User Update for user:", data.id_usuario);
        const usuarioProveedorActualizado = await updateUsuarioProveedor(data);
        return NextResponse.json(usuarioProveedorActualizado);
    }
    // --- Caso: Actualización de Proveedor (Perfil o Estatus) ---
    else if ('id_proveedor' in data && typeof data.id_proveedor === 'number') {
        // Determinar si es actualización de perfil completo o solo estatus
        const isProfileUpdate = 'tipoProveedor' in data; // Asume que el tipo siempre se envía en act. de perfil
        // (Asegúrate que el frontend SIEMPRE envíe tipoProveedor en la actualización de perfil)
        const isStatusUpdateOnly = 'estatus' in data && Object.keys(data).length === 2; // Solo id y estatus

        // --- Subcaso: Actualización de Perfil Completo ---
        if (isProfileUpdate) {
            console.log("API Route: Handling Profile Update for provider:", data.id_proveedor);

            // Validar que tipoProveedor sea válido antes de llamar al servicio
            if (!data.tipoProveedor || (data.tipoProveedor !== 'moral' && data.tipoProveedor !== 'fisica')) {
                 return NextResponse.json({ message: 'El campo "tipoProveedor" es requerido y debe ser "moral" o "fisica" para actualizar el perfil.' }, { status: 400 });
            }
            // Validar que actividadSat exista y no esté vacío si se requiere en update
            // (La validación fuerte puede estar en el servicio, pero una básica aquí es útil)
             if (data.actividadSat !== undefined && (typeof data.actividadSat !== 'string' || data.actividadSat.trim() === '')) {
                 return NextResponse.json({ message: 'Si se incluye "actividadSat", no puede estar vacío.' }, { status: 400 });
             }
            // Validar tipo de proveedorEventos si existe
            if (data.proveedorEventos !== undefined && typeof data.proveedorEventos !== 'boolean') {
                 return NextResponse.json({ message: 'El campo "proveedorEventos" debe ser un valor booleano (true/false).' }, { status: 400 });
            }

            // LLAMA A LA FUNCIÓN DEL SERVICIO QUE YA FUE ACTUALIZADA
            // updateProveedorProfileForAdmin ahora acepta actividadSat y proveedorEventos en `data`
            // y los incluye en el UPDATE SQL.
            // El objeto 'data' ya contiene los nuevos campos si el frontend los envió.
            const proveedorActualizado = await updateProveedorProfileForAdmin(data as any); // Usa interfaz si la importas
            return NextResponse.json(proveedorActualizado); // Devuelve el perfil actualizado (que incluye los nuevos campos)
        }
        else if (isStatusUpdateOnly) {
            console.log("API Route: Handling Estatus Update for provider:", data.id_proveedor);
             if (typeof data.estatus !== 'boolean') { // Forzar booleano aquí
                 return NextResponse.json({ message: 'Valor de "estatus" debe ser booleano (true/false) para actualización de estatus.' }, { status: 400 });
            }
            const proveedorActualizado = await updateProveedorEstatus(data.id_proveedor, data.estatus);
            return NextResponse.json(proveedorActualizado);
        }
        // --- Subcaso: Estructura inválida para actualización de proveedor ---
        else {
             console.error("API Route: Ambiguous or invalid PUT request for provider (has id_proveedor but structure unclear):", data);
             return NextResponse.json({ message: 'Solicitud de actualización para proveedor no válida. Falta "tipoProveedor" para perfil completo o tiene campos extra para actualización de estatus.' }, { status: 400 });
        }
    }
    // --- Caso: Estructura de solicitud inválida ---
    else {
      console.error("API Route: Invalid PUT request structure. Missing valid 'id_usuario' or 'id_proveedor'.", data);
      return NextResponse.json({ message: 'Solicitud de actualización no válida. Se requiere "id_usuario" o "id_proveedor".' }, { status: 400 });
    }

  } catch (error: any) {
     // --- Manejo de Errores (Mantenido, ya es robusto) ---
     console.error("API Route PUT /admin/proveedores Error Caught:", error);
     let status = 500;
     let message = 'Ocurrió un error inesperado al procesar la solicitud.';

     if (error.message) {
         message = error.message;
         if (error.message.includes("no encontrado")) status = 404;
         else if (error.message.includes("ya está en uso")) status = 409;
         else if (error.message.includes("requerido") || error.message.includes("inválido") || error.message.includes("Error al actualizar") || error.message.includes("SQL") || error.message.includes("Error de base de datos")) status = 400;
     }
     if (error instanceof SyntaxError && error.message.includes('JSON')) {
         status = 400;
         message = 'Error: El formato del cuerpo de la solicitud (JSON) es inválido.';
     }

     console.error(`API Route PUT /admin/proveedores Responding with Status: ${status}, Message: "${message}"`);
     return NextResponse.json({ message: message }, { status });
  }
}