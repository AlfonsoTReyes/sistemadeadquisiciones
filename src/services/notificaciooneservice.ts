import { sql } from '@vercel/postgres';
import pusherServer from '@/lib/pusher';

export interface NotificacionData {
  titulo: string;
  mensaje: string;
  tipo: string;
  id_usuario_origen: number;
  id_usuario_destino?: number | null;
  id_rol_destino?: number | number[] | null;
  destino_tipo: 'usuario' | 'rol';
  estatus?: string;
}

// Insertar y emitir notificación
export const enviarNotificacion = async (data: NotificacionData) => {
  const {
    titulo,
    mensaje,
    tipo,
    id_usuario_origen,
    id_usuario_destino = null,
    id_rol_destino = null,
    destino_tipo,
    estatus = 'true',
  } = data;

  const roles = Array.isArray(id_rol_destino) ? id_rol_destino : [id_rol_destino];

  if (roles.length > 0) {
    // Convertir a sintaxis de array PostgreSQL: '{1, 3}'
    const rolPostgresArray = `{${roles.join(',')}}`;

    await sql`
      INSERT INTO notificaciones (
        titulo, mensaje, tipo, id_usuario_origen, id_usuario_destino, id_rol_destino,
        fue_leida, fecha_creacion, destino_tipo, estatus
      ) VALUES (
        ${titulo},
        ${mensaje},
        ${tipo},
        ${id_usuario_origen},
        ${id_usuario_destino},
        ${rolPostgresArray},
        false,
        NOW(),
        ${destino_tipo},
        ${estatus}
      )
    `;

    // Enviar solo una vez la notificación al canal
    await pusherServer.trigger('canal-notificaciones', 'nueva-notificacion', {
      titulo,
      mensaje,
      tipo,
      destino_tipo,
      id_usuario_destino,
      id_rol_destino: roles,
    });
  }
};


export const enviarNotificacionUsuario = async (data: NotificacionData) => {
  const {
    titulo,
    mensaje,
    tipo,
    id_usuario_origen,
    id_usuario_destino = null,
    destino_tipo,
    estatus = 'true',
  } = data;

  // Validación: si no existe usuario destino, no se envía notificación
  if (!id_usuario_destino) {
    console.error("❌ Error: El ID del usuario destino es obligatorio para enviar una notificación.");
    return;
  }

  await sql`
    INSERT INTO notificaciones (
      titulo, 
      mensaje, 
      tipo, 
      id_usuario_origen, 
      id_usuario_destino, 
      id_rol_destino,
      fue_leida, 
      fecha_creacion, 
      destino_tipo, 
      estatus
    ) VALUES (
      ${titulo},
      ${mensaje},
      ${tipo},
      ${id_usuario_origen},
      ${id_usuario_destino},
      null,           -- Eliminado el array de roles porque es directo al usuario
      false,
      NOW(),
      ${destino_tipo},
      ${estatus}
    )
  `;

  // Enviar solo una vez la notificación al canal
  await pusherServer.trigger('canal-notificaciones', 'nueva-notificacion', {
    titulo,
    mensaje,
    tipo,
    destino_tipo,
    id_usuario_destino,
  });
};
