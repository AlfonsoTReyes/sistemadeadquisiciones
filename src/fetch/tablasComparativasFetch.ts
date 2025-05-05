// src/fetch/tablasComparativasFetch.ts
import { handleFetchResponse } from '@/lib/fetchUtils';
import {
    TablaComparativa,
    TablaComparativaCompleta,
    CrearTablaComparativaInput,
    ActualizarTablaInput,
    AgregarProveedorInput,
    TablaComparativaProveedorSnapshot,
    AgregarItemInput,
    TablaComparativaItem,
    AgregarObservacionInput,
    TablaComparativaObservacion,
    AgregarFirmaInput,
    TablaComparativaFirma,
    AgregarComentarioInput,
    TablaComparativaComentario,
} from '@/types/tablaComparativa'; // Ajusta la ruta según tu estructura
// Asume que handleFetchResponse está disponible o impórtalo
import { ProveedorDetallado } from '@/types/proveedor';
const API_BASE_URL = '/api/tablas_comparativas';


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

/**
 * Obtiene los detalles completos de UN proveedor por su ID.
 * Llama a la API Route existente que usa query params.
 * @param idProveedor
 * @returns Promise<ProveedorDetallado>
 */
export const fetchProveedorDetalladoParaSnapshot = async (idProveedor: number): Promise<ProveedorDetallado> => {
    const logPrefix = `FETCH fetchProveedorDetalladoParaSnapshot (ID: ${idProveedor}):`;
    console.log(logPrefix);

    if (isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido proporcionado al fetcher.");
    }

    // --- ¡ESTA ES LA LÍNEA CORREGIDA! ---
    const apiUrl = `/api/proveedores?id_proveedor=${idProveedor}`;
    // ------------------------------------

    console.log(`${logPrefix} Calling GET ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        // Usa handleFetchResponse para manejar errores y parseo
        const data = await handleFetchResponse<ProveedorDetallado | null>(response);

        if (data === null) {
            // Esto ocurrirá si la API devuelve 404 y handleFetchResponse lo maneja así,
            // o si la API devuelve explícitamente null.
            console.warn(`${logPrefix} Provider ${idProveedor} not found (API returned null or 404).`);
            throw new Error(`Proveedor con ID ${idProveedor} no encontrado.`);
        }

        console.log(`${logPrefix} Success.`);
        return data;

    } catch (error) {
        console.error(`${logPrefix} Exception caught:`, error);
        throw error; // Re-lanzar para que el componente lo maneje
    }
};


// --- Operaciones Anidadas ---

// --- Proveedores en Tabla ---
export const agregarProveedorATablaFetch = async (idTabla: number, data: AgregarProveedorInput): Promise<TablaComparativaProveedorSnapshot> => {
    console.log(`FETCH [${idTabla}]: Adding provider ${data.id_proveedor}`);
    const response = await fetch(`${API_BASE_URL}/${idTabla}/proveedores`, { // PROPUESTA: POST /api/tablas-comparativas/{idTabla}/proveedores
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleFetchResponse<TablaComparativaProveedorSnapshot>(response);
};

export const eliminarProveedorDeTablaFetch = async (idTabla: number, idTablaComparativaProveedor: number): Promise<void> => {
    console.log(`FETCH [${idTabla}]: Removing provider snapshot ${idTablaComparativaProveedor}`);
    const response = await fetch(`${API_BASE_URL}/${idTabla}/proveedores/${idTablaComparativaProveedor}`, { // PROPUESTA: DELETE /api/tablas-comparativas/{idTabla}/proveedores/{idTablaProv}
        method: 'DELETE',
    });
    await handleFetchResponse<void>(response);
};

// --- Items en Proveedor de Tabla ---
export const agregarItemAProveedorFetch = async (idTabla: number, idTablaComparativaProveedor: number, data: AgregarItemInput): Promise<TablaComparativaItem> => {
    console.log(`FETCH [${idTabla}]: Adding item to provider snapshot ${idTablaComparativaProveedor}`);
    const response = await fetch(`${API_BASE_URL}/${idTabla}/proveedores/${idTablaComparativaProveedor}/items`, { // PROPUESTA: POST /api/tablas-comparativas/{idTabla}/proveedores/{idTablaProv}/items
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleFetchResponse<TablaComparativaItem>(response);
};

export const eliminarItemFetch = async (idTabla: number, idItem: number): Promise<void> => {
    console.log(`FETCH [${idTabla}]: Deleting item ${idItem}`);
    // Asumimos ruta directa al item, la API necesitará saber a qué tabla pertenece
    const response = await fetch(`${API_BASE_URL}/${idTabla}/items/${idItem}`, { // PROPUESTA: DELETE /api/tablas-comparativas/{idTabla}/items/{idItem}
        method: 'DELETE',
    });
    await handleFetchResponse<void>(response);
};

// --- Observaciones ---
export const agregarObservacionFetch = async (idTabla: number, data: AgregarObservacionInput): Promise<TablaComparativaObservacion> => {
    console.log(`FETCH [${idTabla}]: Adding observation for provider snapshot ${data.id_tabla_comparativa_proveedor}`);
    // La observación pertenece a un proveedor *dentro* de la tabla, pero la ruta podría ser directa
    const response = await fetch(`${API_BASE_URL}/${idTabla}/observaciones`, { // PROPUESTA: POST /api/tablas-comparativas/{idTabla}/observaciones
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleFetchResponse<TablaComparativaObservacion>(response);
};

export const eliminarObservacionFetch = async (idTabla: number, idObservacion: number): Promise<void> => {
    console.log(`FETCH [${idTabla}]: Deleting observation ${idObservacion}`);
    const response = await fetch(`${API_BASE_URL}/${idTabla}/observaciones/${idObservacion}`, { // PROPUESTA: DELETE /api/tablas-comparativas/{idTabla}/observaciones/{idObs}
        method: 'DELETE',
    });
    await handleFetchResponse<void>(response);
};

// --- Firmas ---
export const agregarFirmaFetch = async (idTabla: number, data: AgregarFirmaInput): Promise<TablaComparativaFirma> => {
    console.log(`FETCH [${idTabla}]: Adding firma by user ${data.id_usuario}`);
    const response = await fetch(`${API_BASE_URL}/${idTabla}/firmas`, { // PROPUESTA: POST /api/tablas-comparativas/{idTabla}/firmas
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleFetchResponse<TablaComparativaFirma>(response);
};

// --- Comentarios ---
export const agregarComentarioFetch = async (idTabla: number, data: AgregarComentarioInput): Promise<TablaComparativaComentario> => {
    console.log(`FETCH [${idTabla}]: Adding comentario by user ${data.id_usuario}`);
    const response = await fetch(`${API_BASE_URL}/${idTabla}/comentarios`, { // PROPUESTA: POST /api/tablas-comparativas/{idTabla}/comentarios
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleFetchResponse<TablaComparativaComentario>(response);
};


// --- NOTA ---
// Si necesitas funciones fetch más granulares (ej., para agregar/eliminar un item específico
// o un proveedor específico SIN tener que enviar toda la data actualizada de la tabla),
// necesitarás crear los API Routes correspondientes y luego añadir aquí las funciones fetch
// que llamen a esos nuevos endpoints (ej. `agregarItemFetch(idTabla, idProveedor, itemData)`
// que llame a `POST /api/tablas-comparativas/[id]/proveedores/[idProv]/items`).