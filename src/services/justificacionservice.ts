import { sql } from "@vercel/postgres";

// obtener todas las justificaciones
export const getJustificaciones = async () => {
  try {
    const result = await sql`
      SELECT * FROM justificacion_solicitud;
    `;
    return result.rows;
  } catch (error) {
    console.error("Error al obtener justificaciones:", error);
    throw error;
  }
};

// obtener justificación por id
export const getJustificacionById = async (id: number) => {
  try {
    const result = await sql`
      SELECT * FROM justificacion_solicitud WHERE id_justificacion = ${id};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al obtener justificación:", error);
    throw error;
  }
};

export const getJustificacionByIdPDF = async (id: number) => {
  try {

    const result = await sql`
      select 
        j.*,
        u.nombre AS nombre_usuario,
        u.apellidos AS apellido_usuario,
        u.puesto AS puesto_usuario
      from justificacion_solicitud j
      join solicitud_adquisicion s on j.id_solicitud = s.id_solicitud
      join usuarios u on s.id_usuario = u.id_usuario
      where j.id_justificacion =
      ${id};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al obtener justificación:", error);
    throw error;
  }
};


// crear nueva justificación
export const createJustificacion = async (data: {
  id_solicitud: number;
  lugar: string;
  fecha_hora: string;
  no_oficio: string;
  asunto: string;
  nombre_dirigido: string;
  planteamiento: string;
  antecedente: string;
  necesidad: string;
  fundamento_legal: string;
  uso: string;
  consecuencias: string;
  historicos_monetarios: string;
  marcas_especificas: string;
  estatus: string;
}) => {
  try {
    const result = await sql`
      INSERT INTO justificacion_solicitud (
        id_solicitud, lugar, fecha_hora, no_oficio, asunto, nombre_dirigido,
        planteamiento, antecedente, necesidad, fundamento_legal, uso,
        consecuencias, historicos_monetarios, marcas_especificas, estatus, created_at
      ) VALUES (
        ${data.id_solicitud}, ${data.lugar}, ${data.fecha_hora}, ${data.no_oficio},
        ${data.asunto}, ${data.nombre_dirigido}, ${data.planteamiento}, ${data.antecedente},
        ${data.necesidad}, ${data.fundamento_legal}, ${data.uso}, ${data.consecuencias},
        ${data.historicos_monetarios}, ${data.marcas_especificas}, ${data.estatus}, NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear justificación:", error);
    throw error;
  }
};

// actualizar justificación existente
export const updateJustificacion = async (
  id: number,
  data: {
    lugar: string;
    fecha_hora: string;
    no_oficio: string;
    asunto: string;
    nombre_dirigido: string;
    planteamiento: string;
    antecedente: string;
    necesidad: string;
    fundamento_legal: string;
    uso: string;
    consecuencias: string;
    historicos_monetarios: string;
    marcas_especificas: string;
    estatus: string;
  }
) => {
  try {
    const result = await sql`
      UPDATE justificacion_solicitud SET
        lugar = ${data.lugar},
        fecha_hora = ${data.fecha_hora},
        no_oficio = ${data.no_oficio},
        asunto = ${data.asunto},
        nombre_dirigido = ${data.nombre_dirigido},
        planteamiento = ${data.planteamiento},
        antecedente = ${data.antecedente},
        necesidad = ${data.necesidad},
        fundamento_legal = ${data.fundamento_legal},
        uso = ${data.uso},
        consecuencias = ${data.consecuencias},
        historicos_monetarios = ${data.historicos_monetarios},
        marcas_especificas = ${data.marcas_especificas},
        estatus = ${data.estatus},
        updated_at = NOW()
      WHERE id_justificacion = ${id}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar justificación:", error);
    throw error;
  }
};

// eliminar justificación
export const deleteJustificacion = async (id: number) => {
  try {
    const result = await sql`
      DELETE FROM justificacion_solicitud WHERE id_justificacion = ${id};
    `;
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error al eliminar justificación:", error);
    throw error;
  }
};




/******** JUSTIFICACION DETALLES **********/

// obtener todas las justificaciones
export const getJustificacionesDetalles = async () => {
  try {
    const result = await sql`
      SELECT * FROM justificacion_solicitud;
    `;
    return result.rows;
  } catch (error) {
    console.error("Error al obtener justificaciones:", error);
    throw error;
  }
};

// obtener justificación por id
export const getJustificacionDetalleById = async (id: number) => {
  try {
    const result = await sql`
      SELECT * FROM justificacion_solicitud WHERE id_justificacion = ${id};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al obtener justificación:", error);
    throw error;
  }
};

// crear nueva justificación
export const createJustificacionDetalle = async (data: {
  id_solicitud: number;
  lugar: string;
  fecha_hora: string;
  no_oficio: string;
  asunto: string;
  nombre_dirigido: string;
  planteamiento: string;
  antecedente: string;
  necesidad: string;
  fundamento_legal: string;
  uso: string;
  consecuencias: string;
  historicos_monetarios: string;
  marcas_especificas: string;
  estatus: string;
}) => {
  try {
    const result = await sql`
      INSERT INTO justificacion_solicitud (
        id_solicitud, lugar, fecha_hora, no_oficio, asunto, nombre_dirigido,
        planteamiento, antecedente, necesidad, fundamento_legal, uso,
        consecuencias, historicos_monetarios, marcas_especificas, estatus, created_at
      ) VALUES (
        ${data.id_solicitud}, ${data.lugar}, ${data.fecha_hora}, ${data.no_oficio},
        ${data.asunto}, ${data.nombre_dirigido}, ${data.planteamiento}, ${data.antecedente},
        ${data.necesidad}, ${data.fundamento_legal}, ${data.uso}, ${data.consecuencias},
        ${data.historicos_monetarios}, ${data.marcas_especificas}, ${data.estatus}, NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear justificación:", error);
    throw error;
  }
};

// actualizar justificación existente
export const updateJustificacionDtalle = async (
  id: number,
  data: {
    lugar: string;
    fecha_hora: string;
    no_oficio: string;
    asunto: string;
    nombre_dirigido: string;
    planteamiento: string;
    antecedente: string;
    necesidad: string;
    fundamento_legal: string;
    uso: string;
    consecuencias: string;
    historicos_monetarios: string;
    marcas_especificas: string;
    estatus: string;
  }
) => {
  try {
    const result = await sql`
      UPDATE justificacion_solicitud SET
        lugar = ${data.lugar},
        fecha_hora = ${data.fecha_hora},
        no_oficio = ${data.no_oficio},
        asunto = ${data.asunto},
        nombre_dirigido = ${data.nombre_dirigido},
        planteamiento = ${data.planteamiento},
        antecedente = ${data.antecedente},
        necesidad = ${data.necesidad},
        fundamento_legal = ${data.fundamento_legal},
        uso = ${data.uso},
        consecuencias = ${data.consecuencias},
        historicos_monetarios = ${data.historicos_monetarios},
        marcas_especificas = ${data.marcas_especificas},
        estatus = ${data.estatus},
        updated_at = NOW()
      WHERE id_justificacion = ${id}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar justificación:", error);
    throw error;
  }
};

// eliminar justificación
export const deleteJustificacionDetalle = async (id: number) => {
  try {
    const result = await sql`
      DELETE FROM justificacion_solicitud WHERE id_justificacion = ${id};
    `;
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("Error al eliminar justificación:", error);
    throw error;
  }
};


export const updateJustificacionEstatus = async (
  idJustificacion: number,
    nuevoEstatus: string
) => {
  try {
    const result = await sql`
      UPDATE justificacion_solicitud 
      SET 
        estatus = ${nuevoEstatus},
        updated_at = NOW()
      WHERE id_justificacion = ${idJustificacion} 
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.log(error);
    console.error("error al actualizar solicitud:", error);
    throw error;
  }
};

export const getJustificacionBySolicitud = async (idSolicitud: number): Promise<boolean> => {
  try {
    const result = await sql`
      SELECT 1 FROM justificacion_solicitud WHERE id_solicitud = ${idSolicitud} LIMIT 1;
    `;
    return !!result.rowCount;
  } catch (error) {
    console.error("Error al validar justificación:", error);
    throw error;
  }
};
