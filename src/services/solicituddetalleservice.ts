// 08 de diciembre de 2024

import { sql } from "@vercel/postgres";

const connectionString = process.env.POSTGRES_URL;

// obtener todas las solicitudes
export const getDetallesSolicitudPorId = async (id: number) => {
  try {
    // Consulta 1: Datos de solicitud_adquisicion
    const solicitud = await sql`
      SELECT sa.*, s.nombre as nombre_secretaria FROM
        solicitud_adquisicion sa
      JOIN 
        public.secretarias s ON sa.id_secretaria = s.id_secretaria 
      WHERE sa.id_solicitud = ${id}
    `;

    const justificacion = await sql`
      SELECT * FROM justificacion_solicitud WHERE id_solicitud = ${id}
    `;

    // Consulta 3: Datos de techo_presupuestal
    const techoPresupuestal = await sql`
      SELECT * FROM solicitud_suficiencia WHERE id_solicitud = ${id}
    `;

    const documentoPresupuestal = await sql`
      SELECT * FROM techo_presupuestal WHERE id_solicitud = ${id}
    `;

    const documentos_adicionales = await sql`
      SELECT * FROM documentos_solicitud WHERE id_solicitud = ${id}
    `;

    // Unificar los resultados en un solo objeto
    return {
      solicitud: solicitud.rows[0] || null,
      justificacion: justificacion.rows[0] || null,
      justificacionDoc: documentoPresupuestal.rows[0] || null,
      techoPresupuestal: techoPresupuestal.rows[0] || null,
      documentos_adicionales: documentos_adicionales.rows || null
    };

  } catch (error) {
    console.error("Error al obtener detalles de la solicitud:", error);
    throw error;
  }
};
