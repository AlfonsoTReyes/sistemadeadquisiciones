// src/services/concursosService.ts (o donde corresponda)
import { sql } from '@vercel/postgres';

interface SelectOption {
    id: number;
    label: string;
}
interface ConcursoData {
    id_solicitud: number;
    numero_concurso: string;
    nombre_concurso: string;
    tipo_concurso: string;
    estatus_concurso: string;
    fecha_creacion: string;
    fecha_fin?: string | null;
    id_usuario_alta: number;
}

/**
 * Obtiene una lista simplificada de concursos para usar en selects.
 * Considera filtrar por estatus relevantes (ej. no 'Cancelado').
 * @returns Promise<SelectOption[]>
 */
export const getConcursosForSelect = async (): Promise<SelectOption[]> => {
    console.log("SERVICE Concurso: getConcursosForSelect called");
    try {
        // Selecciona ID y un label combinando número y nombre.
        // Filtrar por estatus puede ser útil: WHERE estatus_concurso != 'Cancelado' AND estatus_concurso != 'Desierto'
        const result = await sql`
            SELECT
                id_concurso AS id,
                CONCAT(
                    numero_concurso,
                    ' - ',
                    COALESCE(nombre_concurso, 'Sin Nombre Asignado')
                ) AS label
            FROM public.concurso
            -- WHERE estatus_concurso NOT IN ('Cancelado', 'Desierto') -- Ejemplo de filtro
            ORDER BY fecha_creacion DESC, id_concurso DESC; -- Ordenar por más reciente
        `;
        console.log(`SERVICE Concurso: Found ${result.rows.length} concursos for select.`);
        return result.rows as SelectOption[];

    } catch (error) {
        console.error("SERVICE Concurso: Error fetching concursos for select:", error);
        throw new Error('Error al obtener la lista de concursos para selección.');
    }
};

export const getConcursos = async () => {
    try {
      
      const result = await sql`
        SELECT
            c.id_concurso,
            c.id_solicitud,
            c.numero_concurso,
            c.nombre_concurso,
            c.tipo_concurso,
            c.estatus_concurso,
            c.fecha_creacion,
            c.fecha_fin,
            s.motivo,
            s.id_adjudicacion,
            s.folio,
            s.monto,
            s.tipo_adquisicion,
            s.id_secretaria,
            c.id_usuario_alta
        FROM
            public.concurso c
        INNER JOIN
            public.solicitud_adquisicion s ON c.id_solicitud = s.id_solicitud;
      `;
      console.log(result.rows);
      return result.rows; 
      
    } catch (error) {
      console.log(error);
      throw error; 
    }
};

export const getConcursosById = async (id: string) => {
    try {
      
      const result = await sql`
        SELECT
            c.id_concurso,
            c.id_solicitud,
            c.numero_concurso,
            c.nombre_concurso,
            c.tipo_concurso,
            c.estatus_concurso,
            c.fecha_creacion,
            c.fecha_fin,
            s.motivo,
            s.id_adjudicacion,
            s.folio,
            s.monto,
            s.tipo_adquisicion,
            s.id_secretaria,
            c.id_usuario_alta
        FROM
            public.concurso c
        INNER JOIN
            public.solicitud_adquisicion s ON c.id_solicitud = s.id_solicitud
            WHERE c.id_concurso=${id};
      `;
      return result.rows[0]; 
      
    } catch (error) {
      console.log(error);
      throw error; 
    }
};


export const crearConcurso = async (nuevoConcurso: ConcursoData) => {
    console.log("SERVICE Concurso: crearConcurso called");
    try {
      await sql`
        INSERT INTO public.concurso (
          numero_concurso,
          nombre_concurso,
          tipo_concurso,
          estatus_concurso,
          fecha_creacion,
          fecha_fin,
          id_usuario_alta
        )
        VALUES (
          ${nuevoConcurso.numero_concurso},
          ${nuevoConcurso.nombre_concurso},
          ${nuevoConcurso.tipo_concurso},
          ${nuevoConcurso.estatus_concurso},
          NOW(),
          ${nuevoConcurso.fecha_fin !== "" ? nuevoConcurso.fecha_fin : null},
          ${nuevoConcurso.id_usuario_alta}
        );
      `;
      console.log("SERVICE Concurso: Concurso creado exitosamente.");
    } catch (error) {
      console.error("SERVICE Concurso: Error creando concurso:", error);
      throw new Error('Error al crear el concurso.');
    }
  };
  

/**
 * 🟡 Modificar un concurso existente
 */
export const modificarConcurso = async (id_concurso: number, concursoActualizado: ConcursoData) => {
  console.log("SERVICE Concurso: modificarConcurso called", id_concurso, concursoActualizado);

  try {
    const fechaFinValor = concursoActualizado.fecha_fin && concursoActualizado.fecha_fin.trim() !== '' 
      ? concursoActualizado.fecha_fin 
      : null;

    await sql`
      UPDATE public.concurso
      SET
        numero_concurso = ${concursoActualizado.numero_concurso},
        nombre_concurso = ${concursoActualizado.nombre_concurso},
        tipo_concurso = ${concursoActualizado.tipo_concurso},
        estatus_concurso = ${concursoActualizado.estatus_concurso},
        fecha_creacion = ${concursoActualizado.fecha_creacion},
        fecha_fin = ${fechaFinValor}
      WHERE
        id_concurso = ${id_concurso};
    `;

    console.log("SERVICE Concurso: Concurso actualizado exitosamente.");

    // 🔥 NUEVO: Regresar algo serializable
    return { success: true, message: "Concurso actualizado exitosamente." };

  } catch (error) {
    console.error("SERVICE Concurso: Error actualizando concurso:", error);
    throw new Error('Error al actualizar el concurso.');
  }
};

export const actualizarSoloEstatusConcurso = async (id_concurso: number, estatus_concurso: string) => {
  try {
    await sql`
      UPDATE public.concurso
      SET estatus_concurso = ${estatus_concurso}, updated_at = NOW()
      WHERE id_concurso = ${id_concurso};
    `;

    return { success: true, message: "Estatus del concurso actualizado correctamente." };
  } catch (error) {
    console.error("SERVICE Concurso: Error actualizando solo estatus:", error);
    throw new Error("Error al actualizar solo el estatus del concurso.");
  }
};
