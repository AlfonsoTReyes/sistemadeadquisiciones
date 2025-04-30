// src/fetch/tablasComparativasFetch.ts

import {
    TablaComparativa,
    TablaComparativaCompleta,
    CrearTablaComparativaInput,
    ActualizarTablaInput
} from '@/types/tablaComparativa'; // Ajusta la ruta según tu estructura

const API_BASE_URL = '/api/tablas_comparativas';

// --- Helper para manejar respuestas Fetch ---
/**
 * Procesa la respuesta de una llamada fetch.
 * Parsea el JSON si la respuesta es OK, de lo contrario lanza un error con el mensaje del servidor.
 * @param response - La respuesta del fetch.
 * @returns {Promise<T>} - Promesa que resuelve con los datos parseados o es rechazada con un error.
 */
const handleFetchResponse = async <T>(response: Response): Promise<T> => {
    if (response.status === 204) { // No Content (para DELETE exitoso)
        // Devolvemos 'undefined' como tipo genérico void
        return undefined as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
        // Intenta obtener un mensaje de error específico del cuerpo de la respuesta, si no, usa statusText
        const errorMessage = data?.message || data?.error || response.statusText || `Error ${response.status}`;
        console.error("API Fetch Error:", errorMessage, data); // Loguear el error completo
        throw new Error(errorMessage);
    }

    return data as T;
};


// --- Funciones Fetch para Tablas Comparativas ---

/**
 * Obtiene la lista de todas las tablas comparativas (información básica).
 * @returns {Promise<TablaComparativa[]>}
 */
export const fetchTablasComparativasLista = async (): Promise<TablaComparativa[]> => {
    console.log('FETCH: Getting list of Tablas Comparativas');
    try {
        const response = await fetch(API_BASE_URL);
        return await handleFetchResponse<TablaComparativa[]>(response);
    } catch (error) {
        console.error('FETCH ERROR [fetchTablasComparativasLista]:', error);
        // Re-lanzar el error para que el componente que llama pueda manejarlo (e.g., mostrar un mensaje al usuario)
        throw error;
    }
};

/**
 * Crea una nueva tabla comparativa.
 * @param {CrearTablaComparativaInput} data - Datos para la nueva tabla.
 * @returns {Promise<TablaComparativa>} - La tabla recién creada.
 */
export const crearTablaComparativaFetch = async (data: CrearTablaComparativaInput): Promise<TablaComparativa> => {
    console.log('FETCH: Creating new Tabla Comparativa:', data);
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await handleFetchResponse<TablaComparativa>(response);
    } catch (error) {
        console.error('FETCH ERROR [crearTablaComparativaFetch]:', error);
        throw error;
    }
};

/**
 * Obtiene los detalles completos de una tabla comparativa específica por su ID.
 * @param {number} id - El ID de la tabla comparativa.
 * @returns {Promise<TablaComparativaCompleta>} - Los detalles completos de la tabla.
 */
export const fetchTablaComparativaDetalle = async (id: number): Promise<TablaComparativaCompleta> => {
    console.log(`FETCH: Getting details for Tabla Comparativa ID: ${id}`);
    if (!id || isNaN(id)) {
         console.error('FETCH ERROR: Invalid ID provided to fetchTablaComparativaDetalle');
         throw new Error('ID inválido proporcionado.');
    }
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        // handleFetchResponse manejará el caso 404 lanzando un error
        return await handleFetchResponse<TablaComparativaCompleta>(response);
    } catch (error) {
        console.error(`FETCH ERROR [fetchTablaComparativaDetalle ID: ${id}]:`, error);
        throw error; // Re-lanzar para manejo en UI
    }
};

/**
 * Actualiza (parcialmente) una tabla comparativa existente.
 * @param {number} id - ID de la tabla a actualizar.
 * @param {ActualizarTablaInput} data - Objeto con los campos a actualizar.
 * @returns {Promise<TablaComparativa>} - La tabla actualizada.
 */
export const actualizarTablaComparativaFetch = async (id: number, data: ActualizarTablaInput): Promise<TablaComparativa> => {
    console.log(`FETCH: Updating Tabla Comparativa ID: ${id} with data:`, data);
     if (!id || isNaN(id)) {
         console.error('FETCH ERROR: Invalid ID provided to actualizarTablaComparativaFetch');
         throw new Error('ID inválido proporcionado.');
    }
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await handleFetchResponse<TablaComparativa>(response);
    } catch (error) {
        console.error(`FETCH ERROR [actualizarTablaComparativaFetch ID: ${id}]:`, error);
        throw error;
    }
};

/**
 * Elimina una tabla comparativa específica.
 * @param {number} id - ID de la tabla a eliminar.
 * @returns {Promise<void>} - Promesa que resuelve si la eliminación fue exitosa.
 */
export const eliminarTablaComparativaFetch = async (id: number): Promise<void> => {
    console.log(`FETCH: Deleting Tabla Comparativa ID: ${id}`);
     if (!id || isNaN(id)) {
         console.error('FETCH ERROR: Invalid ID provided to eliminarTablaComparativaFetch');
         throw new Error('ID inválido proporcionado.');
    }
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        // handleFetchResponse manejará el status 204 y devolverá undefined (que concuerda con Promise<void>)
        await handleFetchResponse<void>(response);
    } catch (error) {
        console.error(`FETCH ERROR [eliminarTablaComparativaFetch ID: ${id}]:`, error);
        throw error;
    }
};


// --- NOTA ---
// Si necesitas funciones fetch más granulares (ej., para agregar/eliminar un item específico
// o un proveedor específico SIN tener que enviar toda la data actualizada de la tabla),
// necesitarás crear los API Routes correspondientes y luego añadir aquí las funciones fetch
// que llamen a esos nuevos endpoints (ej. `agregarItemFetch(idTabla, idProveedor, itemData)`
// que llame a `POST /api/tablas-comparativas/[id]/proveedores/[idProv]/items`).