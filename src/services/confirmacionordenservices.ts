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
