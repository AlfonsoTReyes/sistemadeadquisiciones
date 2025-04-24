import { sql } from "@vercel/postgres";

// Crear orden del día
export const crearOrdenDia = async ({
  id_solicitud,
  asunto_general,
  no_oficio,
  lugar,
  hora,
  puntos_tratar,
  id_evento
}: {
  id_solicitud: number;
  asunto_general: string;
  no_oficio: string;
  lugar: string;
  hora: string;
  puntos_tratar: string[];
  id_evento: number;
}) => {
  try {
    const result = await sql`
      INSERT INTO ordenes_dia (
        id_solicitud,
        asunto_general,
        no_oficio,
        lugar,
        hora,
        puntos_tratar,
        created_at,
        updated_at,
        id_evento
      ) VALUES (
        ${id_solicitud},
        ${asunto_general},
        ${no_oficio},
        ${lugar},
        ${hora},
        ${`{${puntos_tratar.join(",")}}`}::text[],
        NOW(),
        NOW(),
        ${id_evento}
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al crear orden del día:", error);
    throw error;
  }
};

// Obtener todas las órdenes del día
export const obtenerOrdenesDia = async () => {
  try {
    const result = await sql`
      SELECT 
        od.id_orden_dia,
        od.id_solicitud,
        od.asunto_general,
        od.no_oficio,
        od.lugar,
        od.hora,
        od.puntos_tratar,
        od.created_at,
        od.updated_at,
        od.id_evento,
        ec.fecha_inicio
      FROM 
        ordenes_dia od
      JOIN 
        eventos_comite ec ON od.id_evento = ec.id_evento;

    `;
    return result.rows;
  } catch (error) {
    console.error("Error al obtener órdenes del día:", error);
    throw error;
  }
};


// Obtener una orden por ID
export const obtenerOrdenDiaPorIdUno = async (id_orden_dia: number) => {
  try {
    const result = await sql`
      SELECT 
        od.id_orden_dia,
        od.id_solicitud,
        od.asunto_general,
        od.no_oficio,
        od.lugar,
        od.hora,
        od.puntos_tratar,
        od.created_at,
        od.updated_at,
        od.id_evento,
        ec.fecha_inicio,
        ec.tipo_evento,

        -- NUEVO: traer id_adjudicacion desde solicitud_adquisicion
        sa.id_adjudicacion,

        json_agg(
          json_build_object(
            'id_confirmacion', c.id_confirmacion,
            'id_usuario', u.id_usuario,
            'nombre', u.nombre,
            'apellidos', u.apellidos,
            'email', u.email,
            'puesto', u.puesto,
            'confirmado', c.confirmado,
            'fecha_visto', c.fecha_visto,
            'fecha_confirmado', c.fecha_confirmado,
            'observaciones', c.observaciones,
            'tipo_usuario', c.tipo_usuario
          )
        ) FILTER (WHERE c.id_confirmacion IS NOT NULL) AS participantes

      FROM 
        ordenes_dia od
      JOIN 
        eventos_comite ec ON od.id_evento = ec.id_evento
      LEFT JOIN 
        solicitud_adquisicion sa ON sa.id_solicitud = od.id_solicitud -- 👈 JOIN para traer adjudicación
      LEFT JOIN 
        confirmaciones_orden_dia c ON od.id_orden_dia = c.id_orden_dia
      LEFT JOIN 
        usuarios u ON u.id_usuario = c.id_usuario

      WHERE 
        od.id_orden_dia = ${id_orden_dia}

      GROUP BY 
        od.id_orden_dia, ec.fecha_inicio, ec.tipo_evento, sa.id_adjudicacion
    `;

    return result.rows[0];
  } catch (error) {
    console.error("Error al obtener orden por ID con participantes:", error);
    throw error;
  }
};



// Obtener una orden por ID
export const obtenerOrdenDiaPorId = async (id_solicitud: number) => {
  try {
    const result = await sql`
    SELECT 
      od.id_orden_dia,
      od.id_solicitud,
      od.asunto_general,
      od.no_oficio,
      od.lugar,
      od.hora,
      od.puntos_tratar,
      od.created_at,
      od.updated_at,
      od.id_evento,
      ec.fecha_inicio
    FROM 
      ordenes_dia od
    JOIN 
      eventos_comite ec ON od.id_evento = ec.id_evento
    WHERE 
      od.id_solicitud = ${id_solicitud};
    `;
    return result.rows;
  } catch (error) {
    console.error("Error al obtener orden por ID:", error);
    throw error;
  }
};

export const obtenerOrdenDiaParticipantesPorId = async (id_orden_dia: number) => {
  try {
    const result = await sql`
    SELECT 
      od.id_orden_dia,
      od.id_solicitud,
      (
        SELECT json_agg(json_build_object(
          'id_usuario', u.id_usuario,
          'nombre', u.nombre,
          'email', u.email,
          'puesto', u.puesto,
          'confirmado', c.confirmado,
          'fecha_visto', c.fecha_visto,
          'fecha_confirmado', c.fecha_confirmado,
          'observaciones', c.observaciones
        ))
        FROM confirmaciones_orden_dia c
        JOIN usuarios u ON u.id_usuario = c.id_usuario
        WHERE c.id_orden_dia = od.id_orden_dia AND c.tipo_usuario = 'base'
      ) AS participantes_base,

      (
        SELECT json_agg(json_build_object(
          'id_usuario', u.id_usuario,
          'nombre', u.nombre,
          'email', u.email,
          'puesto', u.puesto,
          'confirmado', c.confirmado,
          'fecha_visto', c.fecha_visto,
          'fecha_confirmado', c.fecha_confirmado,
          'observaciones', c.observaciones
        ))
        FROM confirmaciones_orden_dia c
        JOIN usuarios u ON u.id_usuario = c.id_usuario
        WHERE c.id_orden_dia = od.id_orden_dia AND c.tipo_usuario = 'invitado'
      ) AS usuarios_invitados

    FROM 
      ordenes_dia od
    JOIN 
      eventos_comite ec ON od.id_evento = ec.id_evento
    WHERE 
      od.id_orden_dia = ${id_orden_dia};
    `;
    return result.rows;
  } catch (error) {
    console.error("Error al obtener orden por ID:", error);
    throw error;
  }
};


export const obtenerOrdenDiaParticipantesConfirmacionPorId = async (id_usuario: number) => {
  try {
    const result = await sql`
      SELECT DISTINCT
        od.id_orden_dia,
        od.id_solicitud,
        od.asunto_general,
        od.no_oficio,
        od.lugar,
        od.hora,
        od.puntos_tratar,
        od.created_at,
        ec.fecha_inicio,
        ec.estatus,
        ec.nomenclatura,
        ec.tipo_evento,
        cb.confirmado
      FROM ordenes_dia od
      JOIN eventos_comite ec ON od.id_evento = ec.id_evento
      LEFT JOIN confirmaciones_orden_dia cb ON cb.id_orden_dia = od.id_orden_dia AND cb.id_usuario = ${id_usuario}
      LEFT JOIN solicitud_adquisicion sa ON sa.id_solicitud = od.id_solicitud
      WHERE
        cb.id_usuario = ${id_usuario}
    `;
    return result.rows;
  } catch (error) {
    console.error("❌ Error al obtener órdenes por usuario:", error);
    throw error;
  }
};

export const obtenerOrdenDiaParticipantesAll = async () => {
  try {
    const result = await sql`
  SELECT 
    od.id_orden_dia,
    od.id_solicitud,
    od.asunto_general,
    od.no_oficio,
    od.lugar,
    od.hora,
    od.puntos_tratar,
    od.created_at,
    ec.fecha_inicio,
    ec.estatus,
    ec.nomenclatura,
    ec.tipo_evento,
    (MAX(CASE WHEN cb.confirmado THEN 1 ELSE 0 END) = 1) as confirmado
  FROM ordenes_dia od
  JOIN eventos_comite ec ON od.id_evento = ec.id_evento
  LEFT JOIN confirmaciones_orden_dia cb ON cb.id_orden_dia = od.id_orden_dia
  LEFT JOIN solicitud_adquisicion sa ON sa.id_solicitud = od.id_solicitud
  GROUP BY 
    od.id_orden_dia,
    od.id_solicitud,
    od.asunto_general,
    od.no_oficio,
    od.lugar,
    od.hora,
    od.puntos_tratar,
    od.created_at,
    ec.fecha_inicio,
    ec.estatus,
    ec.nomenclatura,
    ec.tipo_evento

    `;
    return result.rows;
  } catch (error) {
    console.error("❌ Error al obtener órdenes por usuario:", error);
    throw error;
  }
};


// Actualizar orden del día
export const actualizarOrdenDia = async (
  id_orden_dia: number,
  {
    id_evento,
    no_oficio,
    hora,
    asunto_general
  }: {
    id_evento: number;
    asunto_general: string;
    no_oficio: string;
    hora: string;
  }
) => {
  try {
    const result = await sql`
      UPDATE ordenes_dia SET
        id_evento = ${id_evento},
        asunto_general = ${asunto_general},
        no_oficio = ${no_oficio},
        hora = ${hora},
        updated_at = NOW()
      WHERE id_orden_dia = ${id_orden_dia}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar orden del día:", error);
    throw error;
  }
};


export const actualizarPuntosOrdenDia = async (
  id_orden_dia: number,
  {
    puntos_tratar,
  }: {
    puntos_tratar: string[];
  }
) => {
  try {
    // 🔧 Convertir array a formato PostgreSQL válido: {a,b,c}
    const arrayLiteral = `{${puntos_tratar.map(p => `"${p}"`).join(",")}}`;

    const result = await sql`
      UPDATE ordenes_dia SET
        puntos_tratar = ${arrayLiteral},
        updated_at = NOW()
      WHERE id_orden_dia = ${id_orden_dia}
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("Error al actualizar orden del día:", error);
    throw error;
  }
};




// Eliminar orden del día (opcional: baja lógica)
export const eliminarOrdenDia = async (id_orden_dia: number) => {
  try {
    await sql`
      DELETE FROM ordenes_dia
      WHERE id_orden_dia = ${id_orden_dia};
    `;
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar orden del día:", error);
    throw error;
  }
};



export const eliminarParticipantesOrdenDia = async (id_orden_dia: number) => {
  try {
    await sql`
      DELETE FROM confirmaciones_orden_dia
      WHERE id_orden_dia = ${id_orden_dia};
    `;
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar orden del día:", error);
    throw error;
  }
};

