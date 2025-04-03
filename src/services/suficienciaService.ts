// servicio para manejar la tabla solicitud_suficiencia
import { sql } from "@vercel/postgres";

/* CRUD DE LA SOLICITUD DE LA SUFICIENCIA */

// obtener todas las suficiencias por id_solicitud
export const getSuficienciasBySolicitud = async (idSolicitud: number) => {
  try {
    const result = await sql`
      SELECT * FROM solicitud_suficiencia WHERE id_solicitud = ${idSolicitud};
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener suficiencias:", error);
    throw error;
  }
};

// obtener suficiencia por id
export const getSuficienciaById = async (id: number) => {
  try {
    const result = await sql`
      SELECT * FROM solicitud_suficiencia WHERE id_suficiencia = ${id};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al obtener suficiencia:", error);
    throw error;
  }
};

// crear nueva suficiencia
export const createSuficiencia = async (data: {
  id_secretaria: number;
  id_dependencia: number;
  id_usuario: number;
  id_solicitud: number;
  oficio: string;
  asunto: string;
  lugar: string;
  fecha: string;
  hora: string;
  cuenta: string;
  cantidad: number;
  motivo: string;
  estatus: string;
}) => {
  try {
    const result = await sql`
      INSERT INTO solicitud_suficiencia (
        id_secretaria, id_dependencia, id_usuario, id_solicitud,
        oficio, asunto, lugar, fecha, hora,
        cuenta, cantidad, motivo, estatus, created_at
      ) VALUES (
        ${data.id_secretaria}, ${data.id_dependencia}, ${data.id_usuario}, ${data.id_solicitud},
        ${data.oficio}, ${data.asunto}, ${data.lugar}, ${data.fecha}, ${data.hora},
        ${data.cuenta}, ${data.cantidad}, ${data.motivo}, ${data.estatus}, NOW()
      ) RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al crear suficiencia:", error);
    throw error;
  }
};

// actualizar suficiencia existente
export const updateSuficiencia = async (
  id: number,
  data: {
    oficio: string;
    asunto: string;
    lugar: string;
    fecha: string;
    cuenta: string;
    cantidad: number;
    motivo: string;
  }
) => {
  try {
    const result = await sql`
      UPDATE solicitud_suficiencia SET
        oficio = ${data.oficio},
        asunto = ${data.asunto},
        lugar = ${data.lugar},
        fecha = ${data.fecha},
        cuenta = ${data.cuenta},
        cantidad = ${data.cantidad},
        motivo = ${data.motivo},
        updated_at = NOW()
      WHERE id_suficiencia = ${id}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al actualizar suficiencia:", error);
    throw error;
  }
};


/* CRUD PARA LA SUFICIENCIA PRE APROBADA QUE SUBIRA FINANZAS */

export const getSuficienciaBySolicitudDocumento = async (idSolicitud: number) => {
  try {
    const result = await sql`
      SELECT * FROM solicitud_suficiencia WHERE id_solicitud = ${idSolicitud};
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener suficiencias:", error);
    throw error;
  }
};


/* CRUD PARA LA SUFICIENCIA APROBADA QUE SUBIRA FINANZAS */

export const updateSuficienciaEstatus = async (
  id: number, estatus: string
) => {
  try {
    const result = await sql`
      UPDATE solicitud_suficiencia SET
        estatus = ${estatus},
        updated_at = NOW()
      WHERE id_suficiencia = ${id}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al actualizar suficiencia:", error);
    throw error;
  }
};
