// Endpoint para obtener la lista de proveedores para el catálogo (con filtro opcional)
const API_CATALOGO_PROVEEDORES_URL = "/api/catalogo/proveedores";
// Endpoint para obtener la lista de partidas (para el dropdown de filtro)
const API_CATALOGO_PARTIDAS_URL = "/api/catalogo/partidas"; // Reutilizamos la de antes

/**
 * Obtiene la lista completa de partidas genéricas (nivel 3) para el filtro.
 * Llama a GET /api/catalogos/partidas
 * @returns {Promise<Array<{codigo: string, descripcion: string}>>} - Array de partidas.
 * @throws {Error} - Si la llamada fetch/API falla.
 */
export const fetchPartidasParaFiltro = async () => {
    console.log(`FETCH: Solicitando catálogo de partidas para filtro desde ${API_CATALOGO_PARTIDAS_URL}`);
    try {
        const response = await fetch(API_CATALOGO_PARTIDAS_URL);

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error GET ${API_CATALOGO_PARTIDAS_URL}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al obtener catálogo de partidas: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Catálogo de partidas para filtro obtenido (${data.length} partidas).`);
        return data;

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido obteniendo partidas'));
        console.error("FETCH Exception en fetchPartidasParaFiltro:", errorToThrow.message);
        throw errorToThrow;
    }
};


/**
 * Obtiene la lista de proveedores activos con sus detalles (partidas y artículos).
 * Permite filtrar por código de partida.
 * Llama a GET /api/catalogo/proveedores[?codigo_partida=...]
 * @param {string | null} [codigoPartidaFiltro=null] - El código de la partida para filtrar, o null para obtener todos.
 * @returns {Promise<Array<object>>} - Una promesa que resuelve con un array de objetos ProveedorCatalogo.
 * @throws {Error} - Si la llamada fetch/API falla.
 */
export const fetchCatalogoProveedores = async (codigoPartidaFiltro = null) => {
    console.log(`FETCH: Solicitando catálogo de proveedores. Filtro partida: ${codigoPartidaFiltro ?? 'Ninguno'}`);

    let apiUrl = API_CATALOGO_PROVEEDORES_URL;
    if (codigoPartidaFiltro) {
        // Añadir el query parameter solo si se proporciona un código de partida
        const params = new URLSearchParams({ codigo_partida: codigoPartidaFiltro });
        apiUrl = `${API_CATALOGO_PROVEEDORES_URL}?${params.toString()}`;
        console.log(`FETCH: URL con filtro: ${apiUrl}`);
    } else {
         console.log(`FETCH: URL sin filtro: ${apiUrl}`);
    }


    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al obtener catálogo de proveedores: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Catálogo de proveedores obtenido (${data.length} proveedores).`);
        return data; // Devuelve el array de proveedores con sus detalles anidados

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido obteniendo catálogo de proveedores'));
        console.error("FETCH Exception en fetchCatalogoProveedores:", errorToThrow.message);
        throw errorToThrow;
    }
};
