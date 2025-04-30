// 29 Abril 2025
import { sql } from '@vercel/postgres';

// Recuperar TODAS las bases
export const getBasesAll = async () => {
  try {
    const result = await sql`
    SELECT 
        b.id_bases, 
        b.id_concurso,
        c.numero_concurso AS numero_procedimiento, 
        c.tipo_concurso AS titulo_contratacion, 
        b.descripcion_programa, 
        b.id_solicitud, 
        b.ejercicio_fiscal, 
        b.fuente_recurso,
        b.fecha_elaboracion_bases, 
        b.lugar_actos_predeterminado, 
        b.monto_minimo_contrato, 
        b.monto_maximo_contrato,
        b.costo_bases_descripcion, 
        b.costo_bases_valor_mn, 
        b.plazo_modificacion_bases_dias, 
        b.requiere_inscripcion_padron,
        b.fecha_limite_inscripcion_padron, 
        b.idioma_documentacion, 
        b.periodo_vigencia_propuesta_dias, 
        b.plazo_maximo_entrega_dias,
        b.plazo_pago_dias, 
        b.aplica_anticipo, 
        b.permite_subcontratacion, 
        b.contacto_aclaraciones_email, 
        b.estatus_bases,
        b.created_at, 
        b.updated_at, 
        b.id_secretaria_convocante
    FROM 
        bases b
    INNER JOIN 
        concurso c ON c.id_concurso = b.id_concurso;

    `;
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Recuperar bases por ID de concurso
export const getBasesByConcurso = async (idConcurso: number) => {
  try {
    const result = await sql`
        SELECT 
            b.id_bases, 
            b.id_concurso,
            c.numero_concurso AS numero_procedimiento, 
            c.tipo_concurso AS titulo_contratacion, 
            b.descripcion_programa, 
            b.id_solicitud, 
            b.ejercicio_fiscal, 
            b.fuente_recurso,
            b.fecha_elaboracion_bases, 
            b.lugar_actos_predeterminado, 
            b.monto_minimo_contrato, 
            b.monto_maximo_contrato,
            b.costo_bases_descripcion, 
            b.costo_bases_valor_mn, 
            b.plazo_modificacion_bases_dias, 
            b.requiere_inscripcion_padron,
            b.fecha_limite_inscripcion_padron, 
            b.idioma_documentacion, 
            b.periodo_vigencia_propuesta_dias, 
            b.plazo_maximo_entrega_dias,
            b.plazo_pago_dias, 
            b.aplica_anticipo, 
            b.permite_subcontratacion, 
            b.contacto_aclaraciones_email, 
            b.estatus_bases,
            b.created_at, 
            b.updated_at, 
            b.id_secretaria_convocante,
            b.uma
        FROM 
            bases b
        INNER JOIN 
            concurso c ON c.id_concurso = b.id_concurso
        WHERE b.id_concurso = ${idConcurso};
    `;

    if (result.rows.length === 0) {
        return null; // 🔥 Muy importante: regresa null si no hay bases
    }
  
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Recuperar bases por ID de bases (opcional)
export const getBasesById = async (idBases: number) => {
  try {
    const result = await sql`
        SELECT 
            b.id_bases, 
            b.id_concurso,
            c.numero_concurso AS numero_procedimiento, 
            c.tipo_concurso AS titulo_contratacion, 
            b.descripcion_programa, 
            b.id_solicitud, 
            b.ejercicio_fiscal, 
            b.fuente_recurso,
            b.fecha_elaboracion_bases, 
            b.lugar_actos_predeterminado, 
            b.monto_minimo_contrato, 
            b.monto_maximo_contrato,
            b.costo_bases_descripcion, 
            b.costo_bases_valor_mn, 
            b.plazo_modificacion_bases_dias, 
            b.requiere_inscripcion_padron,
            b.fecha_limite_inscripcion_padron, 
            b.idioma_documentacion, 
            b.periodo_vigencia_propuesta_dias, 
            b.plazo_maximo_entrega_dias,
            b.plazo_pago_dias, 
            b.aplica_anticipo, 
            b.permite_subcontratacion, 
            b.contacto_aclaraciones_email, 
            b.estatus_bases,
            b.created_at, 
            b.updated_at, 
            b.id_secretaria_convocante,
            b.uma
        FROM 
            bases b
        INNER JOIN 
            concurso c ON c.id_concurso = b.id_concurso
        WHERE b.id_bases = ${idBases};
    `;
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Crear nuevas bases
export const createBases = async (basesData: any) => {
  try {
    const {
      id_concurso, descripcion_programa, id_solicitud, ejercicio_fiscal, fuente_recurso,
      fecha_elaboracion_bases, lugar_actos_predeterminado, monto_minimo_contrato, monto_maximo_contrato,
      costo_bases_descripcion, costo_bases_valor_mn, plazo_modificacion_bases_dias,
      requiere_inscripcion_padron, fecha_limite_inscripcion_padron, idioma_documentacion,
      periodo_vigencia_propuesta_dias, plazo_maximo_entrega_dias, plazo_pago_dias,
      aplica_anticipo, permite_subcontratacion, contacto_aclaraciones_email, estatus_bases,
      id_secretaria_convocante, costoBaseUMA
    } = basesData;

    const result = await sql`
      INSERT INTO bases (
        id_concurso, descripcion_programa, id_solicitud, ejercicio_fiscal, fuente_recurso,
        fecha_elaboracion_bases, lugar_actos_predeterminado, monto_minimo_contrato, monto_maximo_contrato,
        costo_bases_descripcion, costo_bases_valor_mn, plazo_modificacion_bases_dias,
        requiere_inscripcion_padron, fecha_limite_inscripcion_padron, idioma_documentacion,
        periodo_vigencia_propuesta_dias, plazo_maximo_entrega_dias, plazo_pago_dias,
        aplica_anticipo, permite_subcontratacion, contacto_aclaraciones_email, estatus_bases,
        id_secretaria_convocante, created_at, uma
      )
      VALUES (
        ${id_concurso}, ${descripcion_programa}, ${id_solicitud}, ${ejercicio_fiscal}, ${fuente_recurso},
        ${fecha_elaboracion_bases}, ${lugar_actos_predeterminado}, ${monto_minimo_contrato}, ${monto_maximo_contrato},
        ${costo_bases_descripcion}, ${costo_bases_valor_mn}, ${plazo_modificacion_bases_dias},
        ${requiere_inscripcion_padron}, ${fecha_limite_inscripcion_padron}, ${idioma_documentacion},
        ${periodo_vigencia_propuesta_dias}, ${plazo_maximo_entrega_dias}, ${plazo_pago_dias},
        ${aplica_anticipo}, ${permite_subcontratacion}, ${contacto_aclaraciones_email}, ${estatus_bases},
        ${id_secretaria_convocante}, NOW(), ${costoBaseUMA}
      )
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Modificar bases existentes
export const updateBases = async (idBases: number, basesData: any) => {
  try {
    const {
      descripcion_programa, ejercicio_fiscal, fuente_recurso,
      fecha_elaboracion_bases, lugar_actos_predeterminado, monto_minimo_contrato, monto_maximo_contrato,
      costo_bases_descripcion, costo_bases_valor_mn, plazo_modificacion_bases_dias,
      requiere_inscripcion_padron, fecha_limite_inscripcion_padron, idioma_documentacion,
      periodo_vigencia_propuesta_dias, plazo_maximo_entrega_dias, plazo_pago_dias,
      aplica_anticipo, permite_subcontratacion, contacto_aclaraciones_email, estatus_bases
    } = basesData;

    const result = await sql`
      UPDATE bases
      SET
        descripcion_programa = ${descripcion_programa},
        ejercicio_fiscal = ${ejercicio_fiscal},
        fuente_recurso = ${fuente_recurso},
        fecha_elaboracion_bases = ${fecha_elaboracion_bases},
        lugar_actos_predeterminado = ${lugar_actos_predeterminado},
        monto_minimo_contrato = ${monto_minimo_contrato},
        monto_maximo_contrato = ${monto_maximo_contrato},
        costo_bases_descripcion = ${costo_bases_descripcion},
        costo_bases_valor_mn = ${costo_bases_valor_mn},
        plazo_modificacion_bases_dias = ${plazo_modificacion_bases_dias},
        requiere_inscripcion_padron = ${requiere_inscripcion_padron},
        fecha_limite_inscripcion_padron = ${fecha_limite_inscripcion_padron},
        idioma_documentacion = ${idioma_documentacion},
        periodo_vigencia_propuesta_dias = ${periodo_vigencia_propuesta_dias},
        plazo_maximo_entrega_dias = ${plazo_maximo_entrega_dias},
        plazo_pago_dias = ${plazo_pago_dias},
        aplica_anticipo = ${aplica_anticipo},
        permite_subcontratacion = ${permite_subcontratacion},
        contacto_aclaraciones_email = ${contacto_aclaraciones_email},
        estatus_bases = ${estatus_bases},
        updated_at = NOW()
      WHERE id_bases = ${idBases}
      RETURNING *;
    `;

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};
