import { sql } from "@vercel/postgres";

/**
 * Crear acta de sesión
 */
export const guardarActaSesion = async ({
  id_orden_dia,
  fecha_sesion,
  hora_inicio,
  hora_cierre,
  puntos_tratados,
  asuntos_generales,
  estatus = "Pendiente",
}: {
  id_orden_dia: number;
  fecha_sesion: string;
  hora_inicio: string;
  hora_cierre?: string;
  puntos_tratados: string[];
  asuntos_generales: string;
  estatus?: string;
}) => {
  try {
    const puntosArray = `{${puntos_tratados.map(p => `"${p}"`).join(",")}}`;

    const result = await sql`
      INSERT INTO actas_sesion (
        id_orden_dia,
        fecha_sesion,
        hora_inicio,
        hora_cierre,
        puntos_tratados,
        asuntos_generales,
        estatus,
        created_at,
        updated_at
      ) VALUES (
        ${id_orden_dia},
        ${fecha_sesion},
        ${hora_inicio},
        ${hora_cierre || null},
        ${puntosArray}::TEXT[],
        ${asuntos_generales},
        ${estatus},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error al guardar acta de sesión:", error);
    throw error;
  }
};

/**
 * Agregar asistente al acta
 */
export const guardarAsistentesActa = async ({
  id_acta,
  id_usuario,
  tipo_asistente,
  firma = null,
  confirmado = false,
}: {
  id_acta: number;
  id_usuario: number;
  tipo_asistente: string;
  firma?: string | null;
  confirmado?: boolean;
}) => {
  try {
    await sql`
      INSERT INTO asistentes_acta (
        id_acta,
        id_usuario,
        tipo_asistente,
        firma,
        confirmado,
        created_at
      ) VALUES (
        ${id_acta},
        ${id_usuario},
        ${tipo_asistente},
        ${firma},
        ${confirmado},
        NOW()
      );
    `;
    return { success: true };
  } catch (error) {
    console.error("❌ Error al insertar asistente:", error);
    throw error;
  }
};


/**
 * Obtener actas por ID de orden
 */
export const obtenerActaPorOrden = async (id_orden_dia: number) => {
  try {
    const result = await sql`
      SELECT * FROM actas_sesion
      WHERE id_orden_dia = ${id_orden_dia};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error al obtener acta:", error);
    throw error;
  }
};




export const obtenerActaPorActa = async (id_acta: number) => {
  try {
    // 1. Obtener datos del acta y del evento relacionado
    const actaResult = await sql`
      SELECT 
        a.id_acta, 
        a.id_orden_dia, 
        a.fecha_sesion, 
        a.hora_inicio, 
        a.hora_cierre, 
        a.puntos_tratados, 
        a.asuntos_generales, 
        a.estatus, 
        a.created_at AS acta_created_at, 
        a.updated_at AS acta_updated_at,
        ec.titulo AS titulo_evento,
        ec.nomenclatura,
        ec.fecha_inicio AS fecha_evento,
        ec.tipo_evento
      FROM public.actas_sesion a
      LEFT JOIN public.ordenes_dia od ON a.id_orden_dia = od.id_orden_dia
      LEFT JOIN public.eventos_comite ec ON od.id_evento = ec.id_evento
      WHERE a.id_acta = ${id_acta};
    `;

    if (actaResult.rows.length === 0) return null;

    const acta = actaResult.rows[0];

    // 2. Obtener asistentes y unir con datos de usuario
    const asistentesResult = await sql`
      SELECT 
        aa.id_asistente,
        aa.id_acta,
        aa.id_usuario,
        aa.tipo_asistente,
        aa.firma,
        aa.confirmado,
        aa.created_at AS asistente_created_at,
        
        u.nombre,
        u.apellidos,
        u.nomina,
        u.email,
        u.puesto,
        u.rostro,
        u.id_rol,
        u.id_secretaria,
        u.id_dependencia,
        u.sistema,
        u.estatus AS usuario_estatus,
        u.created_at AS usuario_created_at,
        u.updated_at AS usuario_updated_at

      FROM public.asistentes_acta aa
      INNER JOIN public.usuarios u ON u.id_usuario = aa.id_usuario
      WHERE aa.id_acta = ${id_acta};
    `;

    const asistentes = asistentesResult.rows.map(row => ({
      id_asistente: row.id_asistente,
      id_usuario: row.id_usuario,
      tipo_asistente: row.tipo_asistente,
      firma: row.firma,
      confirmado: row.confirmado,
      creado: row.asistente_created_at,
      usuario: {
        nombre: row.nombre,
        apellidos: row.apellidos,
        nomina: row.nomina,
        email: row.email,
        puesto: row.puesto,
        rostro: row.rostro,
        id_rol: row.id_rol,
        id_secretaria: row.id_secretaria,
        id_dependencia: row.id_dependencia,
        sistema: row.sistema,
        estatus: row.usuario_estatus,
        created_at: row.usuario_created_at,
        updated_at: row.usuario_updated_at
      }
    }));

    // 3. Retornar todo junto
    return {
      id_acta: acta.id_acta,
      id_orden_dia: acta.id_orden_dia,
      fecha_sesion: acta.fecha_sesion,
      hora_inicio: acta.hora_inicio,
      hora_cierre: acta.hora_cierre,
      puntos_tratados: acta.puntos_tratados,
      asuntos_generales: acta.asuntos_generales,
      estatus: acta.estatus,
      created_at: acta.acta_created_at,
      updated_at: acta.acta_updated_at,
      evento: {
        titulo: acta.titulo_evento,
        nomenclatura: acta.nomenclatura,
        fecha: acta.fecha_evento,
        tipo: acta.tipo_evento
      },
      asistentes
    };
  } catch (error) {
    console.error("❌ Error al obtener acta con asistentes y usuarios:", error);
    throw error;
  }
};

export const obtenerAsistentesPorOrdenDia = async (id_orden_dia: number) => {
  try {
    // 🔹 Obtener la información del acta
    const actaResult = await sql`
      SELECT 
        id_acta,
        id_orden_dia,
        fecha_sesion,
        hora_inicio,
        hora_cierre,
        puntos_tratados,
        asuntos_generales,
        estatus,
        created_at,
        updated_at
      FROM actas_sesion
      WHERE id_orden_dia = ${id_orden_dia}
      LIMIT 1
    `;

    if (actaResult.rows.length === 0) return null;

    const acta = actaResult.rows[0];

    // 🔹 Obtener los asistentes de esa acta
    const asistentesResult = await sql`
      SELECT 
        aa.id_asistente,
        aa.id_acta,
        aa.id_usuario,
        u.nombre,
        u.apellidos,
        u.puesto,
        u.email,
        u.rostro,
        aa.tipo_asistente,
        aa.firma,
        aa.confirmado,
        aa.created_at AS fecha_registro
      FROM asistentes_acta aa
      INNER JOIN usuarios u ON aa.id_usuario = u.id_usuario
      WHERE aa.id_acta = ${acta.id_acta}
    `;

    // 🔹 Devolver estructura unificada
    return {
      ...acta,
      puntos_tratados: Array.isArray(acta.puntos_tratados)
        ? acta.puntos_tratados
        : acta.puntos_tratados?.replace(/[{}"]/g, "").split(",") || [],
      asistentes: asistentesResult.rows
    };
    

  } catch (error) {
    console.error("❌ Error al obtener acta y asistentes:", error);
    throw error;
  }
};


/**
 * Obtener asistentes por ID de acta
 */
export const obtenerAsistentesPorActa = async (id_acta: number) => {
  try {
    const result = await sql`
      SELECT * FROM actas_sesion
      WHERE id_acta = ${id_acta};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error al obtener asistentes del acta:", error);
    throw error;
  }
};


export const firmarAsistente = async (id_acta: number, id_usuario: number) => {
  try {
    const result = await sql`
      UPDATE asistentes_acta
      SET firma = NOW()
      WHERE id_acta = ${id_acta} AND id_usuario = ${id_usuario}
      RETURNING *;
    `;

    return result.rows[0]; // o .rows si quieres todo
  } catch (error) {
    console.error("❌ Error al firmar el acta:", error);
    throw error;
  }
};
