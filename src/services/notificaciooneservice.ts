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

  for (const rol of roles) {
    if (rol === null) continue;

    // Convertir a sintaxis de array PostgreSQL: '{1}'
    const rolPostgresArray = `{${rol}}`;

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
        ${rolPostgresArray}, -- <- String con formato '{1}'
        false,
        NOW(),
        ${destino_tipo},
        ${estatus}
      )
    `;

    await pusherServer.trigger('canal-notificaciones', 'nueva-notificacion', {
      titulo,
      mensaje,
      tipo,
      destino_tipo,
      id_usuario_destino,
      id_rol_destino: rol,
    });
  }
};
