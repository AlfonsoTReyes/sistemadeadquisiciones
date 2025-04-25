// src/services/concursosService.ts (o donde corresponda)
import { sql } from '@vercel/postgres';

interface SelectOption {
    id: number;
    label: string;
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

// Otras funciones para concursos aquí...