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
      SELECT * FROM solicitud_suficiencia WHERE id_solicitud = ${id} and tipo='Pre-suficiencia'
    `;

    const techoPresupuestalR = techoPresupuestal.rows[0];

    let documentoPresupuestal = { rows: [] };

    if (techoPresupuestalR) {
      documentoPresupuestal = await sql`
        SELECT 
          ds.id_documento_suficiencia,
          ds.id_suficiencia,
          ds.nombre_original,
          ds.ruta_archivo,
          ds.comentario,
          ds.estatus,
          ds.id_usuario,
          u.nombre || ' ' || u.apellidos AS nombre_usuario,
          ds.tipo,
          ds.created_at,
          ds.updated_at,
          ds.fecha_respuesta
        FROM documento_suficiencia ds
        LEFT JOIN usuarios u ON ds.id_usuario = u.id_usuario
        WHERE ds.id_suficiencia = ${techoPresupuestalR.id_suficiencia}
      `;
    }
  

    const documentos_adicionales = await sql`
      SELECT * FROM documentos_solicitud WHERE id_solicitud = ${id}
    `;

    const techoPresupuestalOficial = await sql`
      SELECT * FROM solicitud_suficiencia WHERE id_solicitud = ${id} and tipo='Suficiencia'
    `;

    const techoPresupuestalROficial = techoPresupuestalOficial.rows[0];

    let documentoPresupuestalOficial = { rows: [] };

    if (techoPresupuestalROficial) {
      documentoPresupuestalOficial = await sql`
        SELECT 
          ds.id_documento_suficiencia,
          ds.id_suficiencia,
          ds.nombre_original,
          ds.ruta_archivo,
          ds.comentario,
          ds.estatus,
          ds.id_usuario,
          u.nombre || ' ' || u.apellidos AS nombre_usuario,
          ds.tipo,
          ds.created_at,
          ds.updated_at,
          ds.fecha_respuesta
        FROM documento_suficiencia ds
        LEFT JOIN usuarios u ON ds.id_usuario = u.id_usuario
        WHERE ds.id_suficiencia = ${techoPresupuestalROficial.id_suficiencia}
      `;
    }
    // Unificar los resultados en un solo objeto
    return {
      solicitud: solicitud.rows[0] || null,
      justificacion: justificacion.rows[0] || null,
      techoPresupuestalRespuesta: documentoPresupuestal.rows[0] || null,
      techoPresupuestal: techoPresupuestal.rows[0] || null,
      documentos_adicionales: documentos_adicionales.rows || null,
      techoPresupuestalOficial: techoPresupuestalOficial.rows[0] || null,
      techoPresupuestalRespuestaOficial: documentoPresupuestalOficial.rows[0] || null,
    };

  } catch (error) {
    console.error("Error al obtener detalles de la solicitud:", error);
    throw error;
  }
};
interface SelectOption {
  id: number;
  label: string;
}

/**
* Obtiene una lista simplificada de solicitudes de adquisición para usar en selects.
* Considera añadir filtros (ej. por estatus) si es necesario.
* @returns Promise<SelectOption[]>
*/
export const getSolicitudesForSelect = async (): Promise<SelectOption[]> => {
  console.log("SERVICE SolicitudAdquisicion: getSolicitudesForSelect called");
  try {
      // Selecciona ID y un label descriptivo. Combina folio, asunto y fecha.
      // Añade un filtro WHERE si solo quieres mostrar solicitudes aprobadas, etc.
      // Ejemplo: WHERE estatus = 'Aprobada'
      const result = await sql`
          SELECT
              id_solicitud AS id,
              CONCAT(
                  COALESCE(folio, 'SF-' || id_solicitud::text), -- Usa folio o un prefijo + ID
                  ' - ',
                  COALESCE(asunto, 'Sin Asunto'),
                  ' (',
                  TO_CHAR(fecha_solicitud, 'DD/MM/YYYY'), -- Formatea fecha
                  ')'
              ) AS label
          FROM solicitud_adquisicion
          -- WHERE estatus = 'Aprobada' -- DESCOMENTA Y AJUSTA SI NECESITAS FILTRAR
          ORDER BY fecha_solicitud DESC, id_solicitud DESC; -- Ordenar por fecha reciente
      `;
      console.log(`SERVICE SolicitudAdquisicion: Found ${result.rows.length} solicitudes for select.`);
      return result.rows as SelectOption[];

  } catch (error) {
      console.error("SERVICE SolicitudAdquisicion: Error fetching solicitudes for select:", error);
      throw new Error('Error al obtener la lista de solicitudes para selección.');
  }
};