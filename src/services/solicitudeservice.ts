// 08 de diciembre de 2024

import { sql } from "@vercel/postgres";

//const connectionString = process.env.POSTGRES_URL;

// obtener todas las solicitudes
export const getSolicitudes = async (secretaria: number) => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.id_secretaria = ${secretaria};
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    throw error;
  }
};

export const getSolicitudesAdmin = async () => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.estatus IN ('Enviado para revisión', 'En revisión', 'Aprobada', 'Cancelada', 'En pausa')
      AND sa.tipo_adquisicion != '3';
    `;
    return result.rows;
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    throw error;
  }
};


export const getSolicitudesAdminOrden = async () => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.estatus IN ('En comite')
      AND sa.tipo_adquisicion != 3;;
    `;
    return result.rows;
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    throw error;
  }
};


export const getSolicitudesAdminEvento = async () => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.estatus IN ('Enviado para revisión', 'En revisión', 'Aprobada', 'Cancelada', 'En pausa')
      AND sa.tipo_adquisicion='3';
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    throw error;
  }
};

export const getSolicitudesAdminEventoOrden = async () => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.estatus = 'En comite' AND sa.tipo_adquisicion='3';
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    throw error;
  }
};


export const getSolicitudesEvento = async () => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.tipo_adquisicion=3;
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    throw error;
  }
};

export const getSolicitudesAll = async () => {
  try {

    const result = await sql`
    SELECT 
        sa.*, 
        s.nombre AS secretaria, 
        d.nombre AS dependencia
    FROM solicitud_adquisicion sa
    LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
    LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia;
  `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    throw error;
  }
};



export const getSolicitudesFiltradasPorEstatus = async (secretaria: number, estatus: string) => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.id_secretaria = ${secretaria} AND sa.estatus = ${estatus};
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    throw error;
  }
};

export const getSolicitudesAllFiltradasPorEstatus = async (estatus: string) => {
  try {
    const result = await sql`
      SELECT 
          sa.*, 
          s.nombre AS secretaria, 
          d.nombre AS dependencia
      FROM solicitud_adquisicion sa
      LEFT JOIN secretarias s ON sa.id_secretaria = s.id_secretaria
      LEFT JOIN dependencias d ON sa.id_dependencia = d.id_dependencia
      WHERE sa.estatus = ${estatus};
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


export const getSolicitudByConcursos = async () => {
  try {
    const result = await sql`
      SELECT * FROM solicitud_adquisicion WHERE estatus = 'En concurso';
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener solicitud:", error);
    throw error;
  }
};


export const getSolicitudByIdPDF = async (id: number) => {
  try {
    const result = await sql`
      SELECT 
        s.*, 
        sec.nombre AS nombre_secretaria, 
        dep.nombre AS nombre_dependencia,
        u.nombre AS nombre_usuario,
        u.apellidos AS apellido_usuario,
        u.puesto AS puesto_usuario
      FROM solicitud_adquisicion s
      LEFT JOIN secretarias sec ON s.id_secretaria = sec.id_secretaria
      LEFT JOIN dependencias dep ON s.id_dependencia = dep.id_dependencia
      LEFT JOIN usuarios u ON s.id_usuario = u.id_usuario
      WHERE s.id_solicitud = ${id};
    `;

    return result.rows[0];
  } catch (error) {
    console.error("error al obtener solicitud:", error);
    throw error;
  }
};


// crear una nueva solicitud
export const createSolicitud = async (solicitudData: {
    folio: string, motivo: string, monto: number, dependencia: string, nomina: string, secretaria: string,
    id_adjudicacion: number, estatus: string, tipo: number, usuario: number, lugar: string, asunto: string, necesidad: string,
    cotizacion: boolean, compra_servicio: string
  }) => {
    try {
      const { folio, dependencia, nomina, secretaria, motivo, monto, id_adjudicacion, estatus, tipo, usuario, lugar, asunto, necesidad, cotizacion, compra_servicio } = solicitudData;
  
      const result = await sql`
        INSERT INTO solicitud_adquisicion (folio, nomina_solicitante, id_secretaria, motivo, monto, id_adjudicacion, fecha_solicitud, created_at, estatus, tipo_adquisicion, id_usuario, id_dependencia, asunto, lugar, nombre_dirigido, necesidad, cotizacion, compra_servicio) 
        VALUES (${folio}, ${nomina}, ${secretaria}, ${motivo}, ${monto}, ${tipo}, NOW(), NOW(), ${estatus}, ${id_adjudicacion}, ${usuario}, ${dependencia}, ${asunto}, ${lugar}, ${'LCDO. MIGUEL VALENCIA MOLINA'}, ${necesidad}, ${cotizacion}, ${compra_servicio}) 
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
    motivo: string;
    monto: number;
    id_adjudicacion: number;
    tipo:number;
    lugar:string;
    asunto:string;
    necesidad: string;
    cotizacion: boolean;
    compra_servicio:string;
  }
) => {
  try {
    const { folio, lugar, asunto, necesidad, cotizacion, compra_servicio, motivo, monto, id_adjudicacion, tipo } = solicitudData;
    const result = await sql`
      UPDATE solicitud_adquisicion 
      SET 
        folio = ${folio}, 
        lugar = ${lugar},
        asunto = ${asunto},
        necesidad = ${necesidad},
        cotizacion = ${cotizacion},
        compra_servicio = ${compra_servicio},
        motivo = ${motivo},
        monto = ${monto},
        id_adjudicacion = ${tipo},
        tipo_adquisicion = ${id_adjudicacion},
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

export const updateSolicitudEstatus = async (
  idSolicitud: number,
    estatus: string
) => {
  try {
    const result = await sql`
      UPDATE solicitud_adquisicion 
      SET 
        estatus = ${estatus},
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


export const updateSolicitudEstatusFirma = async (
  idSolicitud: number
) => {
  try {
    
    const { rows: solicitudData } = await sql`
      SELECT id_usuario FROM solicitud_adquisicion
      WHERE id_solicitud = ${idSolicitud}
    `;
    const idUsuario = solicitudData[0]?.id_usuario;
    if (!idUsuario) throw new Error("No se encontró id_usuario en solicitud.");

    // 2. Obtener id_secretaria, id_dependencia y nomenclatura del usuario
    const { rows: userData } = await sql`
    SELECT 
      u.id_secretaria, 
      u.id_dependencia, 
      d.nomenclatura AS nom_d,
      s.nomenclatura AS nom_s
    FROM usuarios u
    JOIN dependencias d ON u.id_dependencia = d.id_dependencia
    JOIN secretarias s ON u.id_secretaria = s.id_secretaria
    WHERE u.id_usuario = ${idUsuario}
  `;
    const usuario = userData[0];
    if (!usuario) throw new Error("Usuario no encontrado.");

    const { id_secretaria, nom_s, nom_d } = usuario;

    // 3. Obtener último contador de folio
    const { rows: ultimo } = await sql`
      SELECT contador FROM folio_secretarias
      WHERE id_secretaria = ${id_secretaria}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const contador = (ultimo[0]?.contador || 0) + 1;
    const year = new Date().getFullYear();
    const nuevoFolio = `${nom_s}/${nom_d}/0${contador}/${year}`;

    const result = await sql`
      UPDATE solicitud_adquisicion 
      SET 
        estatus = 'Enviado para revisión',
        folio = ${nuevoFolio},
        updated_at = NOW()
      WHERE id_solicitud = ${idSolicitud} 
      RETURNING *;
    `;
    const descripciona = `Folio generado al firmar solicitud ID ${idSolicitud} para adquisiciones`;

    await sql`
      INSERT INTO folio_secretarias (folio, descripcion, contador, id_secretaria, fecha)
      VALUES (
        ${nuevoFolio},
        ${descripciona},
        ${contador},
        ${id_secretaria},
        NOW()
      )
    `;

    const getNuevoFolio = async () => {
      const { rows: ultimos } = await sql`
        SELECT contador FROM folio_secretarias
        WHERE id_secretaria = ${id_secretaria}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const nuevoContador = (ultimos[0]?.contador || 0) + 1;
      const year = new Date().getFullYear();
      const folioGenerado = `${nom_s}/${nom_d}/0${nuevoContador}/${year}`;
      return { folioGenerado, nuevoContador };
    };

    const { folioGenerado, nuevoContador } = await getNuevoFolio();

    const resultj = await sql`
      UPDATE justificacion_solicitud
      SET 
        estatus = 'Enviado para revisión',
        no_oficio = ${folioGenerado},
        updated_at = NOW()
      WHERE id_solicitud = ${idSolicitud} 
      RETURNING *;
    `;

    const descripcion = `Folio generado al firmar la justificacion de la solicitud con ID ${idSolicitud} para adquisiciones`;

    await sql`
      INSERT INTO folio_secretarias (folio, descripcion, contador, id_secretaria, fecha)
      VALUES (
        ${folioGenerado},
        ${descripcion},
        ${nuevoContador},
        ${id_secretaria},
        NOW()
      )
    `;    

    const resulta = await sql`
      UPDATE documentos_solicitud
      SET 
        estatus = 'Enviado para revisión',
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