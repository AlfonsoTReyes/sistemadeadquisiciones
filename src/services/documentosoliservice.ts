import { sql } from "@vercel/postgres";

export const guardarDocumentoAdicional = async ({
  id_solicitud,
  tipo_documento,
  nombre_original,
  ruta_archivo,
  id_usuario,
  estatus
}: {
  id_solicitud: number;
  tipo_documento: string;
  nombre_original: string;
  ruta_archivo: string;
  id_usuario: number;
  estatus: string;
}) => {
  try {
    const result = await sql`
      INSERT INTO documentos_solicitud (
        id_solicitud,
        tipo_documento,
        nombre_original,
        ruta_archivo,
        id_usuario,
        estatus,
        created_at,
        updated_at
      ) VALUES (
        ${id_solicitud},
        ${tipo_documento},
        ${nombre_original},
        ${ruta_archivo},
        ${id_usuario},
        ${estatus},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al guardar documento adicional:", error);
    throw error;
  }
};

export const obtenerDocumentosPorSolicitud = async (id_solicitud: number) => {
  try {
    const result = await sql`
      SELECT * FROM documentos_solicitud
      WHERE id_solicitud = ${id_solicitud}
      ORDER BY created_at ASC;
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener documentos por solicitud:", error);
    throw error;
  }
};
