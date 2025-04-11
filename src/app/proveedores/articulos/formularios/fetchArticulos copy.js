// Endpoint para las operaciones CRUD de artículos de un proveedor
const API_PROVEEDOR_ARTICULOS_URL = "/api/proveedores/articulos";

/**
 * Obtiene la lista de artículos para un proveedor específico.
 * Llama a GET /api/proveedor/articulos?id_proveedor=...[&activoOnly=...]
 * @param {number} idProveedor - El ID del proveedor.
 * @param {boolean} [activoOnly=true] - Si se deben obtener solo los artículos activos.
 * @returns {Promise<Array<object>>} - Una promesa que resuelve con un array de objetos artículo.
 * @throws {Error} - Si el idProveedor es inválido o la llamada fetch/API falla.
 */
export const fetchArticulosProveedor = async (idProveedor, activoOnly = true) => {
    console.log(`FETCH: Solicitando artículos para proveedor ID: ${idProveedor}, ActivoOnly: ${activoOnly}`);

    // Validación del ID del proveedor
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        const errorMsg = `Fetch Error: 'idProveedor' es requerido y debe ser un número válido para fetchArticulosProveedor. Valor recibido: ${idProveedor}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Construir URL con query parameters
    const params = new URLSearchParams({
        id_proveedor: idProveedor.toString(),
    });
    if (!activoOnly) { // Solo añadir si es false, ya que true es el default en la API
        params.append('activoOnly', 'false');
    }
    const apiUrlWithQuery = `${API_PROVEEDOR_ARTICULOS_URL}?${params.toString()}`;

    console.log(`FETCH: Calling GET ${apiUrlWithQuery}`);
    try {
        const response = await fetch(apiUrlWithQuery);

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar si no es JSON */ }
            console.error(`FETCH Error GET ${apiUrlWithQuery}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al obtener los artículos del proveedor ${idProveedor}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Artículos obtenidos para proveedor ${idProveedor} (${data.length} artículos).`);
        return data;

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido obteniendo artículos'));
        console.error(`FETCH Exception en fetchArticulosProveedor para ID ${idProveedor}:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Crea un nuevo artículo para un proveedor.
 * Llama a POST /api/proveedor/articulos
 * @param {object} articuloData - Objeto con los datos del artículo a crear. DEBE incluir id_proveedor, descripcion, unidad_medida, stock, precio_unitario. 'estatus' es opcional (default true).
 * @returns {Promise<object>} - Una promesa que resuelve con el objeto del artículo creado.
 * @throws {Error} - Si faltan datos o la llamada fetch/API falla.
 */
export const createArticuloProveedorFetch = async (articuloData) => {
    console.log(`FETCH: Intentando crear artículo para proveedor ID: ${articuloData?.id_proveedor}`);
    console.log(`FETCH: Payload para crear:`, JSON.stringify(articuloData, null, 2));

    // Validación básica del payload (la API y el servicio harán validación más profunda)
    if (!articuloData || typeof articuloData.id_proveedor !== 'number' || isNaN(articuloData.id_proveedor)) {
        const errorMsg = "Fetch Error: 'articuloData' debe ser un objeto y contener un 'id_proveedor' numérico válido para crear.";
        console.error(errorMsg, articuloData);
        throw new Error(errorMsg);
    }
    if (!articuloData.descripcion || !articuloData.unidad_medida || articuloData.stock === undefined || articuloData.precio_unitario === undefined) {
         const errorMsg = "Fetch Error: Faltan campos requeridos en articuloData (descripcion, unidad_medida, stock, precio_unitario).";
         console.error(errorMsg, articuloData);
         throw new Error(errorMsg);
    }


    try {
        const response = await fetch(API_PROVEEDOR_ARTICULOS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articuloData),
        });

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error POST ${API_PROVEEDOR_ARTICULOS_URL}: Status ${response.status}. Payload Sent: ${JSON.stringify(articuloData)}. Response:`, errorData);
            throw new Error(errorData.message || `Error al crear el artículo: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Artículo creado exitosamente. Respuesta:`, data);
        return data; // Devuelve el artículo creado por la API

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido creando artículo'));
        console.error(`FETCH Exception en createArticuloProveedorFetch para proveedor ID ${articuloData?.id_proveedor}:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Actualiza un artículo existente.
 * Llama a PUT /api/proveedor/articulos?id_articulo=...
 * @param {number} idArticulo - El ID del artículo a actualizar.
 * @param {object} articuloUpdateData - Objeto con los campos a actualizar. DEBE incluir id_proveedor para verificación en el backend.
 * @returns {Promise<object>} - Una promesa que resuelve con el objeto del artículo actualizado.
 * @throws {Error} - Si los IDs son inválidos, faltan datos o la llamada fetch/API falla.
 */
export const updateArticuloProveedorFetch = async (idArticulo, articuloUpdateData) => {
    console.log(`FETCH: Intentando actualizar artículo ID: ${idArticulo} para proveedor ID: ${articuloUpdateData?.id_proveedor}`);
    console.log(`FETCH: Payload para actualizar:`, JSON.stringify(articuloUpdateData, null, 2));

    // Validación de IDs
    if (typeof idArticulo !== 'number' || isNaN(idArticulo)) {
        const errorMsg = `Fetch Error: 'idArticulo' es requerido y debe ser numérico para actualizar. Valor: ${idArticulo}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
     if (!articuloUpdateData || typeof articuloUpdateData.id_proveedor !== 'number' || isNaN(articuloUpdateData.id_proveedor)) {
        const errorMsg = "Fetch Error: 'articuloUpdateData' debe ser un objeto y contener un 'id_proveedor' numérico válido para actualizar.";
        console.error(errorMsg, articuloUpdateData);
        throw new Error(errorMsg);
    }
    // Validación básica de que hay algo que actualizar (opcional aquí, el backend lo valida)
    // const { id_proveedor, ...rest } = articuloUpdateData;
    // if (Object.keys(rest).length === 0) {
    //    console.warn("FETCH: No se proporcionaron campos para actualizar para el artículo:", idArticulo);
    //    throw new Error("No hay campos para actualizar.");
    // }


    const apiUrlWithQuery = `${API_PROVEEDOR_ARTICULOS_URL}?id_articulo=${idArticulo}`;
    console.log(`FETCH: Calling PUT ${apiUrlWithQuery}`);

    try {
        const response = await fetch(apiUrlWithQuery, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articuloUpdateData), // Envía el id_proveedor y los campos a cambiar
        });

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error PUT ${apiUrlWithQuery}: Status ${response.status}. Payload Sent: ${JSON.stringify(articuloUpdateData)}. Response:`, errorData);
            throw new Error(errorData.message || `Error al actualizar el artículo ${idArticulo}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Actualización de artículo ${idArticulo} exitosa. Respuesta:`, data);
        return data; // Devuelve el artículo actualizado

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido actualizando artículo'));
        console.error(`FETCH Exception en updateArticuloProveedorFetch para artículo ID ${idArticulo}:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Elimina un artículo de un proveedor.
 * Llama a DELETE /api/proveedor/articulos?id_articulo=...&id_proveedor=...
 * @param {number} idArticulo - El ID del artículo a eliminar.
 * @param {number} idProveedor - El ID del proveedor (para verificación y construcción de URL).
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de éxito de la API (ej. { success: true, message: '...' }).
 * @throws {Error} - Si los IDs son inválidos o la llamada fetch/API falla.
 */
export const deleteArticuloProveedorFetch = async (idArticulo, idProveedor) => {
    console.log(`FETCH: Intentando eliminar artículo ID: ${idArticulo} para proveedor ID: ${idProveedor}`);

    // Validación de IDs
    if (typeof idArticulo !== 'number' || isNaN(idArticulo)) {
        const errorMsg = `Fetch Error: 'idArticulo' es requerido y numérico para eliminar. Valor: ${idArticulo}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        const errorMsg = `Fetch Error: 'idProveedor' es requerido y numérico para eliminar. Valor: ${idProveedor}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Construir URL con ambos query parameters
    const apiUrlWithQuery = `${API_PROVEEDOR_ARTICULOS_URL}?id_articulo=${idArticulo}&id_proveedor=${idProveedor}`;
    console.log(`FETCH: Calling DELETE ${apiUrlWithQuery}`);

    try {
        const response = await fetch(apiUrlWithQuery, {
            method: 'DELETE',
            // No se necesita body ni Content-Type para este DELETE
        });

        if (!response.ok) {
            let errorData = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json(); } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error DELETE ${apiUrlWithQuery}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al eliminar el artículo ${idArticulo}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`FETCH: Eliminación de artículo ${idArticulo} exitosa. Respuesta:`, data);
        return data; // Devuelve la respuesta de éxito de la API

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido eliminando artículo'));
        console.error(`FETCH Exception en deleteArticuloProveedorFetch para artículo ID ${idArticulo}:`, errorToThrow.message);
        throw errorToThrow;
    }
};