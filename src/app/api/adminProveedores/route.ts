// src/app/api/adminProveedores/route.ts (CON IMPORT sql CORREGIDO)

import { NextRequest, NextResponse } from 'next/server';
import { sql } from "@vercel/postgres"; // <--- IMPORTACIÓN AÑADIDA
import {
  // Servicios existentes
  getAllProveedoresForAdmin,
  getProveedorProfileByIdForAdmin,
  updateProveedorEstatus,
  updateProveedorProfileForAdmin,
  getUsuarioProveedorByProveedorId,
  updateUsuarioProveedor,
  actualizarEstatusRevision
} from '@/services/adminproveedoresservice'; // Ajusta ruta

// Servicio de Notificaciones y Pusher Server
import { enviarNotificacionUnificada } from '@/services/notificaciones/notificacionesService'; // Ajusta ruta
import pusherServer from '@/lib/pusher'; // Tu instancia de Pusher Server

// Lógica de Sesión Server-Side (¡IMPLEMENTA LA TUYA!)
async function obtenerIdAdminDesdeSesion(req: NextRequest): Promise<number | null> {
  console.warn("API Route: obtenerIdAdminDesdeSesion NO IMPLEMENTADA. Usando ID placeholder 1.");
  return 13; // <-- ¡¡¡REEMPLAZA ESTO CON TU LÓGICA REAL!!!
}

// --- Handler GET (Sin cambios necesarios) ---
export async function GET(req: NextRequest) { /* ... código GET ... */
  // Placeholder si no lo tienes implementado aquí
  const { searchParams } = req.nextUrl;
  const idProveedorParam = searchParams.get('id_proveedor');
  const idProveedorUsuarioParam = searchParams.get('id_proveedor_usuario');

  if (idProveedorUsuarioParam) {
    const id = parseInt(idProveedorUsuarioParam, 10);
    if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    try {
      const user = await getUsuarioProveedorByProveedorId(id);
      return user ? NextResponse.json(user) : NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    } catch (e: any) { return NextResponse.json({ message: e.message }, { status: 500 }); }
  }
  else if (idProveedorParam) {
    const id = parseInt(idProveedorParam, 10);
    if (isNaN(id)) return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    try {
      const profile = await getProveedorProfileByIdForAdmin(id);
      return profile ? NextResponse.json(profile) : NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
    } catch (e: any) { return NextResponse.json({ message: e.message }, { status: 500 }); }
  }
  else {
    try {
      const list = await getAllProveedoresForAdmin();
      return NextResponse.json(list);
    } catch (e: any) { return NextResponse.json({ message: e.message }, { status: 500 }); }
  }
}

// --- Handler PUT (CON LÓGICA DE NOTIFICACIÓN Y sql IMPORTADO) ---
export async function PUT(req: NextRequest) {
  let requestData;
  try {
    requestData = await req.json();
    console.log("API Route PUT /admin/proveedores received data:", JSON.stringify(requestData, null, 2));
    const data = requestData;

    // --- Caso 1: Actualización de Usuario Proveedor ---
    if ('id_usuario' in data && typeof data.id_usuario === 'number') {
      const usuarioActualizado = await updateUsuarioProveedor(data);
      return NextResponse.json(usuarioActualizado);
    }
    // --- Caso 2: Actualización de Proveedor ---
    else if ('id_proveedor' in data && typeof data.id_proveedor === 'number') {
      const idProveedor = data.id_proveedor;
      const isProfileUpdate = 'tipoProveedor' in data;
      const isStatusUpdateOnly = 'estatus' in data && Object.keys(data).length === 2 && typeof data.estatus === 'boolean';
      const isRevisionStatusUpdate = 'estatus_revision' in data && Object.keys(data).length === 2 && typeof data.estatus_revision === 'string';

      // --- Subcaso 2a: Perfil Completo ---
      if (isProfileUpdate) {
        const proveedorActualizado = await updateProveedorProfileForAdmin(data as any);
        return NextResponse.json(proveedorActualizado);
      }
      // --- Subcaso 2b: Estatus General ---
      else if (isStatusUpdateOnly) {
        const proveedorActualizado = await updateProveedorEstatus(idProveedor, data.estatus);
        return NextResponse.json(proveedorActualizado);
      }
      // --- Subcaso 2c: Estatus de Revisión (CON NOTIFICACIÓN) ---
      else if (isRevisionStatusUpdate) {
        console.log("API Route: Handling Revision Status Update for provider:", idProveedor);
        const nuevoEstatusRevision = data.estatus_revision;
        // ... (validación de nuevoEstatusRevision) ...

        // 1. Actualizar el estado
        const resultadoUpdate = await actualizarEstatusRevision(idProveedor, nuevoEstatusRevision);
        console.log(`API Route: Estado de revisión actualizado para ${idProveedor}.`);

        // --- INICIO LÓGICA DE NOTIFICACIÓN ---
        try {
          // 2. Obtener ID del admin
          const adminUserId = await obtenerIdAdminDesdeSesion(req);

          // 3. Obtener id_usuario asociado (AHORA sql ESTÁ DEFINIDO)
          let idUsuarioProveedor: number | null = null;
          const userResult = await sql<{ id_usuario_proveedor: number }>`
                    SELECT id_usuario_proveedor FROM proveedores WHERE id_proveedor = ${idProveedor};
                `;
          idUsuarioProveedor = userResult.rows[0]?.id_usuario_proveedor ?? null;

          // 4. Enviar notificación
          if (idUsuarioProveedor && adminUserId) {
            const mensajeNotif = `El estado de revisión de su registro cambió a: ${nuevoEstatusRevision.replace(/_/g, ' ')}.`;
            const notifResult = await enviarNotificacionUnificada({
              titulo: "Actualización de Estado",
              mensaje: mensajeNotif,
              id_usuario_origen: adminUserId,
              destino: { tipo: 'usuario', id: idUsuarioProveedor }
            });
            if (!notifResult.success) {
              console.error(`API Route: Falló el envío de notificación para usuario ${idUsuarioProveedor} (Proveedor ${idProveedor}): ${notifResult.error}`);
              // No fallar la respuesta principal por esto, solo loggear
            } else {
              console.log(`API Route: Notificación enviada (ID: ${notifResult.id_notificacion}) a usuario ${idUsuarioProveedor}`);
            }
          } else {
            if (!idUsuarioProveedor) console.warn(`API Route: No se encontró usuario asociado al proveedor ${idProveedor}. No se envió notificación.`);
            if (!adminUserId) console.warn(`API Route: No se pudo identificar al admin. Notificación sin origen correcto.`);
          }

        } catch (notifError: any) {
          console.error(`API Route: Error durante el proceso de notificación para proveedor ${idProveedor}:`, notifError);
          // Loggear pero no interrumpir la respuesta principal
        }
        // --- FIN LÓGICA DE NOTIFICACIÓN ---

        return NextResponse.json(resultadoUpdate ?? { message: "Estado de revisión actualizado" });
      }
      // --- Subcaso 2d: Estructura inválida ---
      else {
        console.error("API Route: Ambiguous PUT request for provider:", data);
        return NextResponse.json({ message: 'Solicitud de actualización para proveedor no válida.' }, { status: 400 });
      }
    }
    // --- Caso 3: Estructura global inválida ---
    else {
      console.error("API Route: Invalid PUT request structure.", data);
      return NextResponse.json({ message: 'Solicitud no válida. Se requiere "id_usuario" o "id_proveedor".' }, { status: 400 });
    }

  } catch (error: any) {
    // --- Manejo de Errores General (Sin cambios) ---
    console.error("API Route PUT /admin/proveedores Error Caught:", error);
    let status = 500;
    let message = error.message || 'Error inesperado procesando la solicitud.';
    // ... (lógica para determinar status code basado en error) ...
    return NextResponse.json({ message: message }, { status });
  }
}