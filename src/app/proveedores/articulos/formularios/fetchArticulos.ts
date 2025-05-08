// src/app/proveedores/articulos/formularios/articulosFetch.ts (o la ruta que corresponda)

const API_PROVEEDOR_ARTICULOS_URL: string = "/api/proveedores/articulos";

// Interfaces para tipado de datos

/**
 * Representa la estructura de un objeto Artículo.
 */
interface Articulo {
    id_articulo: number;
    id_proveedor: number;
    descripcion: string;
    unidad_medida: string;
    stock: number;
    precio_unitario: number;
    estatus: boolean;
    created_at: string | Date;
    updated_at: string | Date;
    codigo_partida: string;
}

/**
 * Datos necesarios para crear un nuevo artículo.
 */
interface ArticuloCreateData {
  id_proveedor: number;
  codigo_partida: string;
  descripcion: string;
  unidad_medida: string;
  stock: number;
  precio_unitario: number;
  // Otros campos que puedan ser necesarios para la creación.
}

/**
 * Datos para actualizar un artículo existente.
 * La mayoría de los campos son opcionales, excepto id_proveedor.
 */
interface ArticuloUpdateData {
  id_proveedor: number; // Requerido según la lógica de validación
  codigo_partida?: string;
  descripcion?: string;
  unidad_medida?: string;
  stock?: number;
  precio_unitario?: number;
  activo?: boolean;
  // Otros campos que puedan ser actualizados.
}

/**
 * Estructura esperada para una respuesta de error de la API.
 */
interface ApiErrorResponse {
  message: string;
  // Podría incluir otros campos como 'errors', 'code', etc.
}

/**
 * Estructura esperada para una respuesta exitosa de la operación de eliminación.
 */
interface DeleteSuccessResponse {
  message: string; // O cualquier otra estructura que la API devuelva
  // Por ejemplo: id_articulo_eliminado?: number;
}


/**
 * Obtiene la lista de artículos para un proveedor específico.
 * Llama a GET /api/proveedor/articulos?id_proveedor=...[&activoOnly=...]
 * @param {number} idProveedor - El ID del proveedor.
 * @param {boolean} [activoOnly=true] - Si se deben obtener solo los artículos activos.
 * @returns {Promise<Articulo[]>} - Array de artículos (ahora pueden incluir partida_descripcion).
 * @throws {Error}
 */
export const fetchArticulosProveedor = async (idProveedor: number, activoOnly: boolean = true): Promise<Articulo[]> => {
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        const errorMsg = `Fetch Error: 'idProveedor' es requerido y numérico. Valor: ${idProveedor}`;
        console.error(errorMsg); throw new Error(errorMsg);
    }

    const params = new URLSearchParams({ id_proveedor: idProveedor.toString() });
    if (!activoOnly) { params.append('activoOnly', 'false'); }
    const apiUrlWithQuery = `${API_PROVEEDOR_ARTICULOS_URL}?${params.toString()}`;

    try {
        const response: Response = await fetch(apiUrlWithQuery);
        if (!response.ok) {
            let errorData: ApiErrorResponse | { message: string } = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json() as ApiErrorResponse; } catch (e) { /* Ignorar si el cuerpo del error no es JSON */ }
            console.error(`FETCH Error GET ${apiUrlWithQuery}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al obtener artículos: ${response.statusText}`);
        }
        const data: Articulo[] = await response.json();
        return data;
    } catch (error: unknown) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
        console.error(`FETCH Exception en fetchArticulosProveedor para ID ${idProveedor}:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Crea un nuevo artículo para un proveedor.
 * Llama a POST /api/proveedor/articulos
 * @param {ArticuloCreateData} articuloData - Objeto con los datos. DEBE incluir id_proveedor, codigo_partida, descripcion, unidad_medida, stock, precio_unitario.
 * @returns {Promise<Articulo>} - El artículo creado.
 * @throws {Error}
 */
export const createArticuloProveedorFetch = async (articuloData: ArticuloCreateData): Promise<Articulo> => {

    if (!articuloData || typeof articuloData.id_proveedor !== 'number' || isNaN(articuloData.id_proveedor)) {
        throw new Error("Fetch Error: 'id_proveedor' numérico es requerido en articuloData.");
    }
    if (typeof articuloData.codigo_partida !== 'string' || !articuloData.codigo_partida.trim()) {
        throw new Error("Fetch Error: 'codigo_partida' es requerido en articuloData.");
    }
    if (!articuloData.descripcion || !articuloData.unidad_medida || articuloData.stock === undefined || articuloData.precio_unitario === undefined) {
         throw new Error("Fetch Error: Faltan campos requeridos (descripcion, unidad_medida, stock, precio_unitario).");
    }

    try {
        const response: Response = await fetch(API_PROVEEDOR_ARTICULOS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articuloData),
        });

        if (!response.ok) {
            let errorData: ApiErrorResponse | { message: string } = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json() as ApiErrorResponse; } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error POST ${API_PROVEEDOR_ARTICULOS_URL}: Status ${response.status}. Payload: ${JSON.stringify(articuloData)}. Response:`, errorData);
            throw new Error(errorData.message || `Error al crear artículo: ${response.statusText}`);
        }
        const data: Articulo = await response.json();
        return data;
    } catch (error: unknown) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
        console.error(`FETCH Exception en createArticuloProveedorFetch para prov ${articuloData?.id_proveedor}:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Actualiza un artículo existente.
 * Llama a PUT /api/proveedor/articulos?id_articulo=...
 * @param {number} idArticulo - ID del artículo a actualizar.
 * @param {ArticuloUpdateData} articuloUpdateData - Objeto con campos a actualizar. DEBE incluir id_proveedor. Puede incluir codigo_partida.
 * @returns {Promise<Articulo>} - El artículo actualizado.
 * @throws {Error}
 */
export const updateArticuloProveedorFetch = async (idArticulo: number, articuloUpdateData: ArticuloUpdateData): Promise<Articulo> => {

    if (typeof idArticulo !== 'number' || isNaN(idArticulo)) {
        throw new Error(`Fetch Error: 'idArticulo' es requerido y numérico. Valor: ${idArticulo}`);
    }
     if (!articuloUpdateData || typeof articuloUpdateData.id_proveedor !== 'number' || isNaN(articuloUpdateData.id_proveedor)) {
        throw new Error("Fetch Error: 'articuloUpdateData' debe incluir 'id_proveedor' numérico.");
    }
    if (articuloUpdateData.hasOwnProperty('codigo_partida') && (typeof articuloUpdateData.codigo_partida !== 'string' || !articuloUpdateData.codigo_partida?.trim())) {
         throw new Error("Fetch Error: Si se incluye 'codigo_partida' para actualizar, no puede estar vacío.");
    }

    const apiUrlWithQuery = `${API_PROVEEDOR_ARTICULOS_URL}?id_articulo=${idArticulo}`;

    try {
        const response: Response = await fetch(apiUrlWithQuery, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articuloUpdateData),
        });

        if (!response.ok) {
            let errorData: ApiErrorResponse | { message: string } = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json() as ApiErrorResponse; } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error PUT ${apiUrlWithQuery}: Status ${response.status}. Payload: ${JSON.stringify(articuloUpdateData)}. Response:`, errorData);
            throw new Error(errorData.message || `Error al actualizar artículo ${idArticulo}: ${response.statusText}`);
        }
        const data: Articulo = await response.json();
        return data;
    } catch (error: unknown) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
        console.error(`FETCH Exception en updateArticuloProveedorFetch para artículo ID ${idArticulo}:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Elimina un artículo de un proveedor.
 * Llama a DELETE /api/proveedor/articulos?id_articulo=...&id_proveedor=...
 * @param {number} idArticulo - ID del artículo a eliminar.
 * @param {number} idProveedor - ID del proveedor.
 * @returns {Promise<DeleteSuccessResponse>} - Respuesta de éxito de la API.
 * @throws {Error}
 */
export const deleteArticuloProveedorFetch = async (idArticulo: number, idProveedor: number): Promise<DeleteSuccessResponse> => {

    if (typeof idArticulo !== 'number' || isNaN(idArticulo)) {
        throw new Error(`Fetch Error: 'idArticulo' es requerido y numérico. Valor: ${idArticulo}`);
    }
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error(`Fetch Error: 'idProveedor' es requerido y numérico. Valor: ${idProveedor}`);
    }

    const apiUrlWithQuery = `${API_PROVEEDOR_ARTICULOS_URL}?id_articulo=${idArticulo}&id_proveedor=${idProveedor}`;

    try {
        const response: Response = await fetch(apiUrlWithQuery, {
            method: 'DELETE',
        });

        if (!response.ok) {
            let errorData: ApiErrorResponse | { message: string } = { message: `Error ${response.status}: ${response.statusText}` };
            try { errorData = await response.json() as ApiErrorResponse; } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error DELETE ${apiUrlWithQuery}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al eliminar artículo ${idArticulo}: ${response.statusText}`);
        }
        const data: DeleteSuccessResponse = await response.json();
        return data;
    } catch (error: unknown) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido'));
        console.error(`FETCH Exception en deleteArticuloProveedorFetch para artículo ID ${idArticulo}:`, errorToThrow.message);
        throw errorToThrow;
    }
};