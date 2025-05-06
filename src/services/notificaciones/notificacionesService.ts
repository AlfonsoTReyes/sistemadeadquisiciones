// src/services/notificaciones/notificacionService.ts (Revisión/Confirmación)

import { sql } from '@vercel/postgres';
import pusherServer from '@/lib/pusher'; // Tu instancia de Pusher Server

export interface NotificacionInput {
    titulo: string;
    mensaje: string;
    tipo?: string;
    id_usuario_origen: number; // Admin ID
    destino: {
        tipo: 'usuario';
        id: number; // ID del usuario destino (proveedor o admin)
    } | {
        tipo: 'rol';
        ids: number[]; // IDs de rol destino
    };
}

export const enviarNotificacionUnificada = async (data: NotificacionInput): Promise<{ success: boolean; id_notificacion?: number; error?: string }> => {
    const { titulo, mensaje, tipo = 'Informativo', id_usuario_origen, destino } = data;
    let idUsuarioDestino: number | null = null;
    let idRolDestinoSql: string | null = null;
    let rolesArray: number[] | null = null;

    if (destino.tipo === 'usuario') {
        if (typeof destino.id !== 'number' || isNaN(destino.id)) return { success: false, error: "ID de usuario destino inválido." };
        idUsuarioDestino = destino.id;
    } else if (destino.tipo === 'rol') {
        if (!Array.isArray(destino.ids) || destino.ids.length === 0 || destino.ids.some(isNaN)) return { success: false, error: "Se requiere un array válido de IDs de rol." };
        rolesArray = destino.ids;
        idRolDestinoSql = `{${rolesArray.join(',')}}`;
    } else {
        return { success: false, error: "Tipo de destino inválido." };
    }

    try {
        // --- 1. Insertar en Base de Datos ---
        const result = await sql`
      INSERT INTO notificaciones (
        titulo, mensaje, tipo, id_usuario_origen, id_usuario_destino,
        id_rol_destino, destino_tipo, fue_leida, estatus
      ) VALUES (
        ${titulo}, ${mensaje}, ${tipo}, ${id_usuario_origen}, ${idUsuarioDestino},
        ${idRolDestinoSql}, ${destino.tipo}, false, true
      )
      RETURNING id_notificacion, mensaje;
    `;

        if (result.rowCount === 0 || !result.rows[0]?.id_notificacion) throw new Error("No se pudo insertar la notificación.");

        const nuevaNotificacionId = result.rows[0].id_notificacion;
        const mensajeInsertado = result.rows[0].mensaje;
        console.log(`Notificación insertada con ID: ${nuevaNotificacionId}`);

        // --- 2. Disparar Evento Pusher ---
        const eventName = 'nueva-notificacion'; // Evento que escucha el hook del frontend
        const payload = { id_notificacion: nuevaNotificacionId, mensaje: mensajeInsertado };

        if (destino.tipo === 'usuario') {
            const targetChannel = `user-notifications-${idUsuarioDestino}`; // Canal específico del usuario
            console.log(`Disparando Pusher a canal de usuario: ${targetChannel}`);
            await pusherServer.trigger(targetChannel, eventName, payload);
        } else if (destino.tipo === 'rol') {
            // Notificar al canal general de admin (o podrías iterar por roles si prefieres)
            const targetChannel = 'admin-notifications';
            console.log(`Disparando Pusher a canal de admin: ${targetChannel} (para roles: ${rolesArray?.join(',')})`);
            await pusherServer.trigger(targetChannel, eventName, payload);
        }

        return { success: true, id_notificacion: nuevaNotificacionId };

    } catch (error: any) {
        console.error("❌ Error en enviarNotificacionUnificada:", error);
        return { success: false, error: `Error al enviar notificación: ${error.message}` };
    }
};