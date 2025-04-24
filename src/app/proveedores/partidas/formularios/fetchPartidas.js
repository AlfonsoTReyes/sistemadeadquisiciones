
// Endpoint para las partidas específicas del proveedor
const API_PROVEEDOR_PARTIDAS_URL = "/api/proveedores/partidas"; // <-- Debe ser esta
// Endpoint para obtener el catálogo completo de partidas
const API_CATALOGO_PARTIDAS_URL = "/api/catalogo/partidas"; // <-- Debe ser esta

/**
 * Obtiene la lista completa de partidas/giros disponibles para selección.
 * Llama a GET /api/catalogos/partidas
 */
export const fetchAllSelectablePartidas = async () => {
    console.log(`FETCH: Solicitando catálogo completo desde ${API_CATALOGO_PARTIDAS_URL}`); // Usa la constante correcta
    try {
        const response = await fetch(API_CATALOGO_PARTIDAS_URL);

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error GET ${API_CATALOGO_PARTIDAS_URL}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al obtener catálogo: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Catálogo obtenido (${data.length} partidas).`);
        return data;

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
        console.error("FETCH Exception en fetchAllSelectablePartidas:", errorToThrow.message);
        throw errorToThrow;
    }
};


/**
 * Obtiene las partidas actualmente seleccionadas por un proveedor específico.
 * Llama a GET /api/proveedor/partidas?id_proveedor=...
 */
export const fetchProveedorPartidas = async (idProveedor) => {
    console.log(`FETCH: Solicitando partidas para proveedor ID: ${idProveedor}`);
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
         const errorMsg = `Fetch Error: 'idProveedor' es requerido y numérico. Valor: ${idProveedor}`;
         console.error(errorMsg);
         throw new Error(errorMsg);
    }
    const apiUrlWithQuery = `${API_PROVEEDOR_PARTIDAS_URL}?id_proveedor=${idProveedor}`;
    try {
        const response = await fetch(apiUrlWithQuery);

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error GET ${apiUrlWithQuery}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al obtener partidas del proveedor ${idProveedor}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Partidas obtenidas para proveedor ${idProveedor} (${data.length}).`);
        return data;

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
        console.error(`FETCH Exception en fetchProveedorPartidas para ID ${idProveedor}:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Sincroniza (reemplaza) las partidas de un proveedor.
 * Llama a POST /api/proveedor/partidas
 */
export const syncProveedorPartidasFetch = async (idProveedor, codigosPartida) => {
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) { /*...*/ throw new Error('...'); }
    if (!Array.isArray(codigosPartida)) { /*...*/ throw new Error('...'); }

    const cleanCodigosPartida = codigosPartida
                                .map(p => p != null ? String(p) : null)
                                .filter(p => p !== null && p.trim() !== '');

    const payload = {
        id_proveedor: idProveedor,
        partidas: cleanCodigosPartida
    };

    try {
        const response = await fetch(API_PROVEEDOR_PARTIDAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            throw new Error(errorData.message || `Error al sincronizar partidas del proveedor ${idProveedor}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Sincronización de partidas exitosa para proveedor ${idProveedor}. Respuesta:`, data);
        return data;

    } catch (error) {
         const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
         console.error(`FETCH Exception en syncProveedorPartidasFetch para ID ${idProveedor}:`, errorToThrow.message);
         throw errorToThrow;
    }
};