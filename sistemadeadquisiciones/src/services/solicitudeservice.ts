// 08 de diciembre de 2024

import { sql } from "@vercel/postgres";

const connectionString = process.env.POSTGRES_URL;

// obtener todas las solicitudes
export const getSolicitudes = async () => {
  try {
    const result = await sql`
      SELECT * FROM solicitud_adquisicion;
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    throw error;
  }
};

// obtener solicitud por id
export const getSolicitudById = async (id: number) => {
  try {
    const result = await sql`
      SELECT * FROM solicitud_adquisicion WHERE id_solicitud = ${id};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al obtener solicitud:", error);
    throw error;
  }
};

// crear una nueva solicitud
export const createSolicitud = async (solicitudData: {
    folio: string;
    nomina_solicitante: string;
    secretaria: string;
    motivo: string;
    monto: number;
    id_adjudicacion: number;
    fecha_solicitud: Date;
    estatus: string;
  }) => {
    try {
      const { folio, nomina_solicitante, secretaria, motivo, monto, id_adjudicacion, fecha_solicitud, estatus } = solicitudData;
  
      const result = await sql`
        INSERT INTO solicitud_adquisicion (folio, nomina_solicitante, secretaria, motivo, monto, id_adjudicacion, fecha_solicitud, estatus) 
        VALUES (${folio}, ${nomina_solicitante}, ${secretaria}, ${motivo}, ${monto}, ${id_adjudicacion}, ${fecha_solicitud.toISOString()}, ${estatus}) 
        RETURNING *;
      `;
      return result.rows[0];
    } catch (error) {
      console.error("error al crear solicitud:", error);
      throw error;
    }
  };
  

// actualizar una solicitud existente
export const updateSolicitud = async (
  id: number,
  solicitudData: {
    folio?: string;
    nomina_solicitante?: string;
    secretaria?: string;
    motivo?: string;
    monto?: number;
    id_adjudicacion?: number;
    estatus?: string;
  }
) => {
  try {
    const { folio, nomina_solicitante, secretaria, motivo, monto, id_adjudicacion, estatus } = solicitudData;

    const result = await sql`
      UPDATE solicitud_adquisicion 
      SET 
        folio = COALESCE(${folio}, folio), 
        nomina_solicitante = COALESCE(${nomina_solicitante}, nomina_solicitante),
        secretaria = COALESCE(${secretaria}, secretaria),
        motivo = COALESCE(${motivo}, motivo),
        monto = COALESCE(${monto}, monto),
        id_adjudicacion = COALESCE(${id_adjudicacion}, id_adjudicacion),
        estatus = COALESCE(${estatus}, estatus),
        updated_at = NOW()
      WHERE id_solicitud = ${id} 
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.error("error al actualizar solicitud:", error);
    throw error;
  }
};
