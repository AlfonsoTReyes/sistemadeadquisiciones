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


export const getSuficienciaByIdPDF = async (id: number) => {
  try {
    const result = await sql`
    SELECT 
      s.id_suficiencia,
      s.id_secretaria,
      sec.nombre AS nombre_secretaria,
      s.oficio,
      s.asunto,
      s.lugar,
      s.fecha,
      s.hora,
      s.cuenta,
      s.cantidad,
      s.motivo,
      s.id_usuario,
      u.nombre AS nombre_usuario,
      u.apellidos AS apellido_usuario,
      u.puesto,
      s.created_at,
      s.updated_at,
      s.id_solicitud,
      s.id_dependencia,
      d.nombre AS nombre_dependencia,
      s.estatus
    FROM 
      public.solicitud_suficiencia s
    JOIN 
      public.secretarias sec ON s.id_secretaria = sec.id_secretaria
    JOIN 
      public.usuarios u ON s.id_usuario = u.id_usuario
    JOIN 
      public.dependencias d ON s.id_dependencia = d.id_dependencia
    WHERE s.id_suficiencia = ${id};
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
  tipo: string;
}) => {
  try {
    const result = await sql`
      INSERT INTO solicitud_suficiencia (
        id_secretaria, id_dependencia, id_usuario, id_solicitud,
        oficio, asunto, lugar, fecha, hora,
        cuenta, cantidad, motivo, estatus, created_at, tipo
      ) VALUES (
        ${data.id_secretaria}, ${data.id_dependencia}, ${data.id_usuario}, ${data.id_solicitud},
        ${data.oficio}, ${data.asunto}, ${data.lugar}, ${data.fecha}, ${data.hora},
        ${data.cuenta}, ${data.cantidad}, ${data.motivo}, ${data.estatus}, NOW(), ${data.tipo}
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




export const getPreSuficienciasPendientes = async () => {
  try {
    const result = await sql`
      SELECT 
        ss.id_suficiencia,
        s.nombre AS nombre_secretaria,
        ss.oficio,
        ss.asunto,
        ss.lugar,
        ss.fecha,
        ss.hora,
        ss.cuenta,
        ss.cantidad,
        ss.motivo,
        u.nombre || ' ' || u.apellidos AS nombre_usuario,
        d.nombre AS nombre_dependencia,
        ss.created_at,
        ss.updated_at,
        ss.id_solicitud,
        ss.estatus,
        ss.tipo
      FROM public.solicitud_suficiencia ss
      LEFT JOIN public.secretarias s ON ss.id_secretaria = s.id_secretaria
      LEFT JOIN public.usuarios u ON ss.id_usuario = u.id_usuario
      LEFT JOIN public.dependencias d ON ss.id_dependencia = d.id_dependencia
      WHERE ss.estatus != 'Pendiente' and ss.tipo='Pre-suficiencia';
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener suficiencias:", error);
    throw error;
  }
};

export const getPreSuficienciasPorSecretaria = async (nombreSecretaria: string) => {
  try {
    const result = await sql`
      SELECT 
        ss.id_suficiencia,
        s.nombre AS nombre_secretaria,
        ss.oficio,
        ss.asunto,
        ss.lugar,
        ss.fecha,
        ss.hora,
        ss.cuenta,
        ss.cantidad,
        ss.motivo,
        u.nombre || ' ' || u.apellidos AS nombre_usuario,
        d.nombre AS nombre_dependencia,
        ss.created_at,
        ss.updated_at,
        ss.id_solicitud,
        ss.estatus,
        ss.tipo
      FROM public.solicitud_suficiencia ss
      LEFT JOIN public.secretarias s ON ss.id_secretaria = s.id_secretaria
      LEFT JOIN public.usuarios u ON ss.id_usuario = u.id_usuario
      LEFT JOIN public.dependencias d ON ss.id_dependencia = d.id_dependencia
      WHERE ss.estatus != 'Pendiente'
        AND ss.tipo = 'Pre-suficiencia'
        AND s.id_secretaria = ${nombreSecretaria};
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener pre-suficiencias por secretaría:", error);
    throw error;
  }
};


export const getSuficienciasPendientes = async () => {
  try {
    const result = await sql`
      SELECT 
        ss.id_suficiencia,
        s.nombre AS nombre_secretaria,
        ss.oficio,
        ss.asunto,
        ss.lugar,
        ss.fecha,
        ss.hora,
        ss.cuenta,
        ss.cantidad,
        ss.motivo,
        u.nombre || ' ' || u.apellidos AS nombre_usuario,
        d.nombre AS nombre_dependencia,
        ss.created_at,
        ss.updated_at,
        ss.id_solicitud,
        ss.estatus,
        ss.tipo
      FROM public.solicitud_suficiencia ss
      LEFT JOIN public.secretarias s ON ss.id_secretaria = s.id_secretaria
      LEFT JOIN public.usuarios u ON ss.id_usuario = u.id_usuario
      LEFT JOIN public.dependencias d ON ss.id_dependencia = d.id_dependencia
      WHERE ss.estatus != 'Pendiente' and ss.tipo='Suficiencia';
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener suficiencias:", error);
    throw error;
  }
};

export const getSuficienciasPorSecretaria = async (nombreSecretaria: string) => {
  try {
    const result = await sql`
      SELECT 
        ss.id_suficiencia,
        s.nombre AS nombre_secretaria,
        ss.oficio,
        ss.asunto,
        ss.lugar,
        ss.fecha,
        ss.hora,
        ss.cuenta,
        ss.cantidad,
        ss.motivo,
        u.nombre || ' ' || u.apellidos AS nombre_usuario,
        d.nombre AS nombre_dependencia,
        ss.created_at,
        ss.updated_at,
        ss.id_solicitud,
        ss.estatus,
        ss.tipo
      FROM public.solicitud_suficiencia ss
      LEFT JOIN public.secretarias s ON ss.id_secretaria = s.id_secretaria
      LEFT JOIN public.usuarios u ON ss.id_usuario = u.id_usuario
      LEFT JOIN public.dependencias d ON ss.id_dependencia = d.id_dependencia
      WHERE ss.estatus != 'Pendiente'
        AND ss.tipo = 'Suficiencia'
        AND s.id_secretaria = ${nombreSecretaria};
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener suficiencias por secretaría:", error);
    throw error;
  }
};


export const obtenerTipoSuficiencia = async (id_suficiencia: number) => {
  try {
    const result = await sql`
      SELECT tipo
      FROM solicitud_suficiencia
      WHERE id_suficiencia = ${id_suficiencia};
    `;

    return result.rows[0]?.tipo || null;
  } catch (error) {
    console.error("error al obtener tipo de suficiencia:", error);
    throw error;
  }
};



/** DOCUMENTO RESPUESTA DE PRE SUFICIENCIA **/

export const guardarDocumentoPreSuficiencia = async ({
  id_suficiencia,
  nombre_original,
  ruta_archivo,
  tipo_documento,
  estatus,
  id_usuario,
}: {
  id_suficiencia: number;
  nombre_original: string;
  ruta_archivo: string;
  tipo_documento: string;
  estatus: string;
  id_usuario: number;
}) => {
  try {
    const result = await sql`
      INSERT INTO documento_suficiencia (
        id_suficiencia,
        nombre_original,
        ruta_archivo,
        estatus,
        id_usuario,
        tipo,
        created_at,
        fecha_respuesta
      ) VALUES (
        ${id_suficiencia},
        ${nombre_original},
        ${ruta_archivo},
        ${estatus},
        ${id_usuario},
        ${tipo_documento},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.error("error al guardar documento en documento_suficiencia:", error);
    throw error;
  }
};


export const updateSuficienciaEstatusAtendido = async (
  id: number, estatus: string
) => {
  try {
    const result = await sql`
      UPDATE solicitud_suficiencia SET
        estatus = ${estatus},
        fecha_contestacion = NOW()
      WHERE id_suficiencia = ${id}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al actualizar suficiencia:", error);
    throw error;
  }
};

export const getSuficienciaRespuesBySolicitud = async (id: number) => {
  try {
    const result = await sql`
      SELECT * FROM documento_suficiencia WHERE id_suficiencia = ${id};
    `;

    return result.rows;
  } catch (error) {
    console.error("error al obtener suficiencia:", error);
    throw error;
  }
};

export const obtenerDocumentoPorId = async (id_doc_solicitud: number) => {
  try {
    const result = await sql`
      SELECT * FROM documento_suficiencia
      WHERE id_documento_suficiencia = ${id_doc_solicitud};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al obtener documentos por solicitud:", error);
    throw error;
  }
};
/*
export const eliminarDocumentoAdicionalPorId = async (id_doc_solicitud: number) => {
  try {
    const result = await sql`
      DELETE FROM documento_suficiencia
      WHERE id_documento_suficiencia = ${id_doc_solicitud};
    `;
    return { success: true };
  } catch (error) {
    console.error("error al obtener documentos por solicitud:", error);
    throw error;
  }
};
*/
export const getSuficienciasBySolicitudID = async (idSolicitud: number) => {
  try {
    const result = await sql`
      SELECT 1 FROM solicitud_suficiencia WHERE id_solicitud = ${idSolicitud} AND tipo= 'Pre-suficiencia' LIMIT 1;
    `;
    return !!result.rowCount;
  } catch (error) {
    console.error("error al obtener suficiencias:", error);
    throw error;
  }
};