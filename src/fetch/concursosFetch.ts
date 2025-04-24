// src/fetch/concursosFetch.ts (o donde prefieras)

const CONCURSOS_API_URL = '/api/concursos';

interface SelectOption {
    id: number;
    label: string;
}

/**
 * Obtiene la lista de concursos formateada para usar en un <select>.
 * @returns Promise<SelectOption[]>
 */
export const fetchConcursosForSelect = async (): Promise<SelectOption[]> => {
    const logPrefix = "FETCH fetchConcursosForSelect:";
    const apiUrl = `${CONCURSOS_API_URL}?forSelect=true`;

    console.log(`${logPrefix} Calling GET ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(`${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`, data);
            throw new Error(data?.message || `Error ${response.status}: No se pudo obtener la lista de concursos.`);
        }
        if (!Array.isArray(data)) {
            console.error(`${logPrefix} Error GET ${apiUrl}: La respuesta no es un array. Response:`, data);
            throw new Error("Respuesta inesperada del servidor.");
        }

        console.log(`${logPrefix} Success. Received ${data.length} options.`);
        return data as SelectOption[];

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};