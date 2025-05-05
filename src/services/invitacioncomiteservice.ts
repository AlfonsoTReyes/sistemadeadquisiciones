import { sql } from '@vercel/postgres';


export const verificarInvitacion = async (id_concurso: number) => {
  try {
    const eventosRes = await sql`
      SELECT 
        id_evento_calendario,
        acto,
        fecha_inicio,
        fecha_fin,
        hora_inicio,
        hora_fin,
        descripcion_adicional
      FROM calendario_bases
      WHERE id_concurso = ${id_concurso} and estatus=true;
    `;

    const eventos = eventosRes.rows;
    if (eventos.length === 0) {
      return {
        yaFueEnviado: false,
        numero_oficio: null,
        fecha_hora_envio: null,
        participantes: [],
        eventos: []
      };
    }

    const eventoIds = eventos.map(e => e.id_evento_calendario);
    const placeholders = eventoIds.map((_, i) => `$${i + 1}`).join(", ");

    const envioQuery = `
      SELECT 
        numero_oficio,
        fecha_hora_envio
      FROM calendario_bases_participantes
      WHERE id_evento_calendario IN (${placeholders})
      LIMIT 1;
    `;
    const envio = await sql.query(envioQuery, eventoIds);

    const participantesQuery = `
        SELECT DISTINCT ON (u.id_usuario)
            u.id_usuario,
            u.nombre AS nombre,
            cbp.tipo_participante AS tipo
        FROM calendario_bases_participantes cbp
        JOIN usuarios u ON cbp.id_usuario_recibe = u.id_usuario
        WHERE cbp.id_evento_calendario IN (${placeholders});
            `;
    const participantes = await sql.query(participantesQuery, eventoIds);

    const yaFueEnviado = (envio.rowCount ?? 0) > 0;


    return {
      yaFueEnviado,
      numero_oficio: envio.rows[0]?.numero_oficio || null,
      fecha_hora_envio: envio.rows[0]?.fecha_hora_envio || null,
      participantes: participantes.rows,
      eventos: eventos.map(ev => ({
        id_evento_calendario: ev.id_evento_calendario,
        acto: ev.acto,
        fecha_inicio: ev.fecha_inicio,
        fecha_fin: ev.fecha_fin,
        hora_inicio: ev.hora_inicio,
        hora_fin: ev.hora_fin,
        descripcion_adicional: ev.descripcion_adicional
      }))
    };
  } catch (error) {
    console.error("Error en verificarInvitacion:", error);
    throw error;
  }
};



interface InvitacionComite {
  id_evento_calendario: number;
  id_usuario_envio: number;
  id_usuario_recibe: number;
  tipo_participante: string;
  numero_oficio: string;
  fecha_hora_envio: string;
}

export const crearInvitacionesComite = async (invitaciones: InvitacionComite[]) => {
  try {


    const insertPromises = invitaciones.map((invitacion) => {
      return sql`
        INSERT INTO calendario_bases_participantes (
          id_evento_calendario,
          id_usuario_envio,
          id_usuario_recibe,
          tipo_participante,
          numero_oficio,
          fecha_hora_envio,
          visto,
          created_at,
          updated_at
        ) VALUES (
          ${invitacion.id_evento_calendario},
          ${invitacion.id_usuario_envio},
          ${invitacion.id_usuario_recibe},
          ${invitacion.tipo_participante},
          ${invitacion.numero_oficio},
          ${invitacion.fecha_hora_envio},
          false,
          NOW(),
          NOW()
        );
      `;
    });

    await Promise.all(insertPromises);
    return {
    status: "ok",
    message: "Invitaciones registradas correctamente",
    cantidad: insertPromises.length
    };

  } catch (error) {
    console.error("❌ Error en crearInvitacionesComite:", error);
    throw new Error("Error al insertar las invitaciones");
  }
};


export const eliminarInvitacionesDeUsuario = async (id_usuario: number, id_concurso: number) => {
    try {
      const eventos = await sql`
        SELECT id_evento_calendario
        FROM calendario_bases
        WHERE id_concurso = ${id_concurso};
      `;
  
      const eventoIds = eventos.rows.map(row => row.id_evento_calendario);
      if (eventoIds.length === 0) return 0;
  
      const placeholders = eventoIds.map((_, i) => `$${i + 2}`).join(", ");
      const values = [id_usuario, ...eventoIds];
  
      const deleteQuery = `
        DELETE FROM calendario_bases_participantes
        WHERE id_usuario_recibe = $1
        AND id_evento_calendario IN (${placeholders});
      `;
  
      const result = await sql.query(deleteQuery, values);
      return result.rowCount ?? 0;
    } catch (error) {
      console.error("❌ Error al eliminar invitaciones:", error);
      throw new Error("Error al eliminar invitaciones");
    }
  };


  export const actualizarInvitacionComite = async ( id_concurso: number, numero_oficio: string  ) => {
    try {
      const result = await sql`UPDATE calendario_bases_participantes
            SET 
              numero_oficio = ${numero_oficio},
              updated_at = NOW()
            WHERE id_evento_calendario IN (
              SELECT id_evento_calendario
              FROM calendario_bases
              WHERE id_concurso = ${id_concurso}
            )
            RETURNING *;
          `;
  
      if (result.rowCount === 0) {
        throw new Error("No se encontró la invitación a modificar");
      }
  
      return {
        status: "ok",
        message: "Invitación modificada correctamente",
        data: result.rows[0]
      };
    } catch (error) {
      console.error("❌ Error al actualizar la invitación:", error);
      throw new Error("Error al actualizar invitación");
    }
  };
  