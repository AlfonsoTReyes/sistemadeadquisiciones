// src/fetch/solicitudAdquisicionFetch.ts (o donde prefieras)

const SOLICITUDES_API_URL = '/api/contratos/solicitudes';

interface SelectOption {
    id: number;
    label: string;
}

/**
 * Obtiene la lista de solicitudes formateada para usar en un <select>.
 * @returns Promise<SelectOption[]>
 */
export const fetchSolicitudesForSelect = async (): Promise<SelectOption[]> => {
    const logPrefix = "FETCH fetchSolicitudesForSelect:";
    const apiUrl = `${SOLICITUDES_API_URL}?forSelect=true`;

    console.log(`${logPrefix} Calling GET ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store', // Considera cachear si la lista es estable
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(`${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`, data);
            throw new Error(data?.message || `Error ${response.status}: No se pudo obtener la lista de solicitudes.`);
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

// Añade aquí otras funciones fetch para solicitudes si es necesario