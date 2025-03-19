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
    nomina: string;
    secretaria: string;
    motivo: string;
    monto: number;
    id_adjudicacion: number;
    estatus: string;
    tipo: number;
    usuario: number;
  }) => {
    try {
      const { folio, nomina, secretaria, motivo, monto, id_adjudicacion, estatus, tipo, usuario } = solicitudData;
  
      const result = await sql`
        INSERT INTO solicitud_adquisicion (folio, nomina_solicitante, secretaria, motivo, monto, id_adjudicacion, fecha_solicitud, created_at, estatus, tipo_adquisicion, id_usuario) 
        VALUES (${folio}, ${nomina}, ${secretaria}, ${motivo}, ${monto}, ${tipo}, NOW(), NOW(), ${estatus}, ${id_adjudicacion}, ${usuario}) 
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
  idSolicitud: number,
  solicitudData: {
    folio: string;
    nomina: string;
    secretaria: string;
    motivo: string;
    monto: number;
    id_adjudicacion: number;
    tipo:number;
    usuario: string;
  }
) => {
  try {
    const { folio, nomina, secretaria, motivo, monto, id_adjudicacion, usuario, tipo } = solicitudData;

    const result = await sql`
      UPDATE solicitud_adquisicion 
      SET 
        folio = ${folio}, 
        nomina_solicitante = ${nomina},
        secretaria = ${secretaria},
        motivo = ${motivo},
        monto = ${monto},
        id_adjudicacion = ${tipo},
        tipo_adquisicion = ${id_adjudicacion},
        id_usuario = ${usuario},
        updated_at = NOW()
      WHERE id_solicitud = ${idSolicitud} 
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.log(error);
    console.error("error al actualizar solicitud:", error);
    throw error;
  }
};
