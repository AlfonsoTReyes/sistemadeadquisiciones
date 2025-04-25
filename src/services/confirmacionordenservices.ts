import { sql } from '@vercel/postgres';

export const getConfirmaciones = async () => {
  try {
    const result = await sql`
      SELECT id_confirmacion, id_orden_dia, id_usuario, confirmado, observaciones, fecha_visto, fecha_confirmado, tipo_usuario, created_at, updated_at
      FROM confirmaciones_orden_dia
      ORDER BY id_confirmacion ASC;
    `;
    return result.rows;
  } catch (error) {
    throw error;
  }
};

export const createComentario = async (data: {
  id_origen: number;
  tipo_origen: string;
  comentario: string;
  respuesta_a?: number | null;
  id_usuario?: number;
  id_solicitud: number;
}) => {
    try {
        const { id_origen, tipo_origen, comentario, respuesta_a, id_usuario } = data;

        const result = await sql`
        INSERT INTO comentarios_orden_dia
        (id_origen, tipo_origen, comentario, respuesta_a, id_usuario, created_at)
        VALUES
        (${id_origen}, ${tipo_origen}, ${comentario}, ${respuesta_a || null}, ${id_usuario || null}, NOW())
        RETURNING *;
        `;
        return result.rows[0]; // Retorna el nuevo comentario insertado
    } catch (error) {
        console.error("Error al crear comentario:", error);
        throw error;
    }
};


export const getOrdenDiaPorComentarios = async (id_origen: number, tipo_origen: string) => {
  try {
      const result = await sql`
          SELECT cd.id_comentario,
                  cd.id_origen,
                  cd.tipo_origen,
                  cd.comentario,
                  cd.respuesta_a,
                  cd.created_at,
                  u.nombre AS nombre_usuario
          FROM comentarios_orden_dia AS cd
          LEFT JOIN usuarios AS u ON cd.id_usuario = u.id_usuario 
          WHERE cd.id_origen = ${id_origen} AND cd.tipo_origen = ${tipo_origen}
          ORDER BY cd.created_at ASC;
          `;
      return result.rows;
  } catch (error) {
      console.error("Error al obtener comentarios por solicitud/documento:", error);
      throw error;
  }
};


export const getConfirmacionById = async (id: number) => {
  try {
    const result = await sql`
      SELECT * FROM confirmaciones_orden_dia WHERE id_confirmacion = ${id};
    `;
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const createConfirmacion = async (data: {
  id_orden_dia: number;
  id_usuario: number;
  tipo_usuario: string;
}) => {
  const { id_orden_dia, id_usuario,tipo_usuario  } = data;

  try {
    const result = await sql`
      INSERT INTO confirmaciones_orden_dia 
      (id_orden_dia, id_usuario, tipo_usuario, created_at, updated_at)
      VALUES (
        ${id_orden_dia}, ${id_usuario}, ${tipo_usuario}, NOW(), NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const updateConfirmacion = async (
  id: number,
  data: {
    confirmado?: boolean;
    observaciones?: string;
    fecha_visto?: string;
    fecha_confirmado?: string;
    tipo_usuario?: string;
  }
) => {
  try {
    const {
      confirmado,
      observaciones,
      fecha_visto,
      fecha_confirmado,
      tipo_usuario,
    } = data;

    const result = await sql`
      UPDATE confirmaciones_orden_dia SET
        confirmado = COALESCE(${confirmado}, confirmado),
        observaciones = COALESCE(${observaciones}, observaciones),
        fecha_visto = COALESCE(${fecha_visto}, fecha_visto),
        fecha_confirmado = COALESCE(${fecha_confirmado}, fecha_confirmado),
        tipo_usuario = COALESCE(${tipo_usuario}, tipo_usuario),
        updated_at = NOW()
      WHERE id_confirmacion = ${id}
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const deleteConfirmacion = async (id: number) => {
  try {
    const result = await sql`
      DELETE FROM confirmaciones_orden_dia WHERE id_confirmacion = ${id};
    `;
    return result.rowCount;
  } catch (error) {
    throw error;
  }
};


export const confirmarLecturaOrden = async (id_orden_dia: number, id_usuario: number) => {

  const result = await sql`
    UPDATE confirmaciones_orden_dia
    SET 
      confirmado = true,
      fecha_visto = NOW(),
      fecha_confirmado = NOW(),
      updated_at = NOW()
    WHERE id_orden_dia = ${id_orden_dia} AND id_usuario = ${id_usuario}
    RETURNING *;
  `;
  return result.rows[0];
};  