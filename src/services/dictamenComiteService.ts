// src/services/dictamenComiteService.ts
import { sql } from '@vercel/postgres';

interface SelectOption {
    id: number;
    label: string;
}

/**
 * Obtiene una lista simplificada de dictámenes para usar en selects.
 * Considera filtrar por aquellos que aún no estén asociados a un contrato/concurso si es necesario.
 * @returns Promise<SelectOption[]>
 */
export const getDictamenesForSelect = async (): Promise<SelectOption[]> => {
    console.log("SERVICE DictamenComite: getDictamenesForSelect called");
    try {
        // Selecciona ID y un label descriptivo. Combina resultado, fecha y tal vez ID solicitud.
        // Podrías añadir un LEFT JOIN a contratos/concurso y un WHERE c.id_dictamen IS NULL
        // si solo quieres mostrar dictámenes "disponibles".
        const result = await sql`
            SELECT
                id_dictamen AS id,
                CONCAT(
                    'Dictamen ID: ', id_dictamen::text,
                    ' (', COALESCE(resultado_dictamen, 'Pendiente'), ')',
                    ' - Solicitud: ', COALESCE(id_solicitud::text, 'N/A'),
                    ' - Fecha: ', COALESCE(TO_CHAR(fecha_dictamen, 'DD/MM/YYYY'), 'Sin Fecha')
                ) AS label
            FROM dictamen_comite
            -- Añade WHERE aquí si necesitas filtrar por disponibilidad o tipo
            ORDER BY fecha_dictamen DESC, id_dictamen DESC;
        `;
        console.log(`SERVICE DictamenComite: Found ${result.rows.length} dictamenes for select.`);
        return result.rows as SelectOption[];

    } catch (error) {
        console.error("SERVICE DictamenComite: Error fetching dictamenes for select:", error);
        throw new Error('Error al obtener la lista de dictámenes para selección.');
    }
};

// Otras funciones para dictámenes aquí...