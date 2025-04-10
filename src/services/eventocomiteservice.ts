import { sql } from "@vercel/postgres";

export const crearEventoComite = async ({
  titulo,
  descripcion,
  tipo_evento,
  fecha_inicio,
  fecha_fin,
  estatus,
  color,
  id_usuario,
}: {
  titulo: string;
  descripcion: string;
  tipo_evento: string;
  fecha_inicio: string;
  fecha_fin: string;
  estatus: string;
  color: string;
  id_usuario: number;
}) => {
  try {
    const result = await sql`
      INSERT INTO eventos_comite (
        titulo,
        descripcion,
        tipo_evento,
        fecha_inicio,
        fecha_fin,
        estatus,
        id_usuario,
        color,
        created_at,
        updated_at
      ) VALUES (
        ${titulo},
        ${descripcion},
        ${tipo_evento},
        ${fecha_inicio},
        ${fecha_fin},
        ${estatus},
        ${id_usuario},
        ${color},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al crear evento del comité:", error);
    throw error;
  }
};

export const obtenerEventos = async () => {
  try {
    const result = await sql`
      SELECT * FROM eventos_comite
      ORDER BY fecha_inicio ASC;
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener eventos del comité:", error);
    throw error;
  }
};



export const obtenerEventoPorId = async (id_evento: number) => {
  try {
    const result = await sql`
      SELECT * FROM eventos_comite
      WHERE id_evento = ${id_evento};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al obtener evento por id:", error);
    throw error;
  }
};

export const actualizarEventoComite = async (
  id_evento: number,
  {
    titulo,
    descripcion,
    tipo_evento,
    fecha_inicio,
    fecha_fin,
    estatus,
    color
  }: {
    titulo: string;
    descripcion: string;
    tipo_evento: string;
    fecha_inicio: string;
    fecha_fin: string;
    estatus: string;
    color: string;
  }
) => {
  try {
    const result = await sql`
      UPDATE eventos_comite SET
        titulo = ${titulo},
        descripcion = ${descripcion},
        tipo_evento = ${tipo_evento},
        fecha_inicio = ${fecha_inicio},
        fecha_fin = ${fecha_fin},
        color=${color},
        estatus = ${estatus},
        updated_at = NOW()
      WHERE id_evento = ${id_evento}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al actualizar evento del comité:", error);
    throw error;
  }
};

export const eliminarEventoComite = async (id: number) => {
  try {

    await sql`
      UPDATE eventos_comite SET
        estatus = 'baja'
      WHERE id_evento = ${id};
    `;
    return { success: true };
  } catch (error) {
    console.error("error al eliminar evento del comité:", error);
    throw error;
  }
};
