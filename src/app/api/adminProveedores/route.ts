import { NextRequest, NextResponse } from 'next/server';
import {
  // Funciones del servicio para admin
  getAllProveedoresForAdmin,
  getProveedorProfileByIdForAdmin, // Usada para GET por ID
  updateProveedorEstatus,
  updateProveedorProfileForAdmin, // Usada para PUT de perfil completo
  getUsuarioProveedorByProveedorId,
  updateUsuarioProveedor,
  actualizarEstatusRevision
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
// --- PUT (ADAPTADO para diferenciar actualización de ESTATUS REVISIÓN) ---
export async function PUT(req: NextRequest) {
  let requestData;
  try {
    requestData = await req.json();
    console.log("API Route PUT /admin/proveedores received data:", JSON.stringify(requestData, null, 2));

    const data = requestData;

    // --- Caso 1: Actualización de Usuario Proveedor ---
    if ('id_usuario' in data && typeof data.id_usuario === 'number') {
        console.log("API Route: Handling User Update for user:", data.id_usuario);
        // ... (Validación campos usuario si es necesario) ...
        const usuarioActualizado = await updateUsuarioProveedor(data);
        return NextResponse.json(usuarioActualizado);
    }
    // --- Caso 2: Actualización de Proveedor ---
    else if ('id_proveedor' in data && typeof data.id_proveedor === 'number') {
        const idProveedor = data.id_proveedor;

        // Distinguir entre los tipos de actualización para proveedor
        const isProfileUpdate = 'tipoProveedor' in data; // Identifica act. perfil completo
        const isStatusUpdateOnly = 'estatus' in data && Object.keys(data).length === 2 && typeof data.estatus === 'boolean'; // Solo estatus general
        // **NUEVO:** Identificar actualización de estatus de revisión
        const isRevisionStatusUpdate = 'estatus_revision' in data && Object.keys(data).length === 2 && typeof data.estatus_revision === 'string'; // Solo id y estatus_revision (string)

        // --- Subcaso 2a: Actualización de Perfil Completo ---
        if (isProfileUpdate) {
            console.log("API Route: Handling Profile Update for provider:", idProveedor);
            // ... (Validaciones existentes para perfil completo, incluyendo tipoProveedor, actividadSat, proveedorEventos, array representantes si es moral) ...
            if (!data.tipoProveedor || !['moral', 'fisica'].includes(data.tipoProveedor)) return NextResponse.json({ message: 'Tipo inválido.' }, { status: 400 });
            // ... más validaciones ...

            const proveedorActualizado = await updateProveedorProfileForAdmin(data as any);
            return NextResponse.json(proveedorActualizado);
        }
        // --- Subcaso 2b: Actualización de Estatus General (Activo/Inactivo) ---
        else if (isStatusUpdateOnly) {
            console.log("API Route: Handling General Status Update for provider:", idProveedor);
            const proveedorActualizado = await updateProveedorEstatus(idProveedor, data.estatus); // data.estatus ya validado como boolean
            return NextResponse.json(proveedorActualizado);
        }
        // --- **NUEVO Subcaso 2c: Actualización de Estatus de Revisión** ---
        else if (isRevisionStatusUpdate) {
            console.log("API Route: Handling Revision Status Update for provider:", idProveedor);
            const nuevoEstatusRevision = data.estatus_revision;

            // Opcional: Validar que el nuevoEstatusRevision sea uno de los permitidos
            const validRevisionStatuses = ['NO_SOLICITADO', 'PENDIENTE_REVISION', 'EN_REVISION', 'APROBADO', 'RECHAZADO'];
            if (!validRevisionStatuses.includes(nuevoEstatusRevision)) {
                return NextResponse.json({ message: `Valor de 'estatus_revision' (${nuevoEstatusRevision}) inválido.` }, { status: 400 });
            }

            // Llama al nuevo servicio específico del admin
            const resultado = await actualizarEstatusRevision(idProveedor, nuevoEstatusRevision);
            return NextResponse.json(resultado); // Devuelve lo que retorne el servicio
        }
        // --- Subcaso 2d: Estructura inválida para actualización de proveedor ---
        else {
             console.error("API Route: Ambiguous or invalid PUT request for provider (has id_proveedor but structure unclear):", data);
             // Mensaje de error actualizado
             return NextResponse.json({ message: 'Solicitud de actualización para proveedor no válida. Verifique la estructura (perfil completo, solo estatus general, o solo estatus de revisión).' }, { status: 400 });
        }
    }
    // --- Caso 3: Estructura de solicitud global inválida ---
    else {
      console.error("API Route: Invalid PUT request structure. Missing valid 'id_usuario' or 'id_proveedor'.", data);
      return NextResponse.json({ message: 'Solicitud de actualización no válida. Se requiere "id_usuario" o "id_proveedor".' }, { status: 400 });
    }

  } catch (error: any) {
     // --- Manejo de Errores (Sin cambios necesarios aquí, captura errores del servicio) ---
     console.error("API Route PUT /admin/proveedores Error Caught:", error);
     let status = 500;
     let message = error.message || 'Error inesperado procesando la solicitud.';
     if (message.includes("no encontrado")) status = 404;
     else if (message.includes("ya está en uso")) status = 409;
     else if (message.includes("requerido") || message.includes("inválido") || error.code === '23503' || error.code === '22P02') status = 400; // Añadir códigos PG comunes para bad request
     else if (error instanceof SyntaxError && message.includes('JSON')) { status = 400; message = 'Error: Formato JSON inválido.'; }

     console.error(`API Route PUT /admin/proveedores Responding with Status: ${status}, Message: "${message}"`);
     return NextResponse.json({ message: message }, { status });
  }
}
