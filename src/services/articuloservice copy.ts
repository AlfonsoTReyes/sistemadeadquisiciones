// src/services/articulosService.ts (o la ruta que corresponda)

import { sql } from "@vercel/postgres";

// Para crear o actualizar un artículo
interface ArticuloProveedorInput {
    id_proveedor: number;
    descripcion: string;
    unidad_medida: string;
    stock: number; // Usamos number, asumiendo validación previa si es necesario
    precio_unitario: number; // Usamos number
    estatus?: boolean; // Opcional al crear (default TRUE), requerido al actualizar si se quiere cambiar
}

// Para representar un artículo completo de la BD
interface ArticuloProveedor extends ArticuloProveedorInput {
    id_articulo: number;
    estatus: boolean; // Aseguramos que esté presente
    created_at: Date;
    updated_at: Date;
}

// --- Funciones del Servicio CRUD ---

/**
 * Guarda un nuevo artículo para un proveedor específico.
 * @param {ArticuloProveedorInput} articuloData - Datos del artículo a crear.
 * @returns {Promise<ArticuloProveedor>} - El artículo recién creado.
 */
export const createArticuloProveedor = async (articuloData: ArticuloProveedorInput): Promise<ArticuloProveedor> => {
    const { id_proveedor, descripcion, unidad_medida, stock, precio_unitario, estatus = true } = articuloData; // Default estatus a true

    console.log(`SERVICE: Creating article for proveedor ID: ${id_proveedor}`);
    // Validación básica
    if (!id_proveedor || !descripcion || !unidad_medida || stock === undefined || stock === null || precio_unitario === undefined || precio_unitario === null) {
        throw new Error("Faltan datos requeridos para crear el artículo (proveedor, descripción, UDM, stock, precio unitario).");
    }
    if (typeof stock !== 'number' || stock < 0 || typeof precio_unitario !== 'number' || precio_unitario < 0) {
        throw new Error("Stock y Precio Unitario deben ser números no negativos.");
    }

    try {
        const result = await sql<ArticuloProveedor>`
            INSERT INTO articulos_proveedor (
                id_proveedor,
                descripcion,
                unidad_medida,
                stock,
                precio_unitario,
                estatus,
                created_at,
                updated_at
            ) VALUES (
                ${id_proveedor},
                ${descripcion},
                ${unidad_medida},
                ${stock},
                ${precio_unitario},
                ${estatus},
                NOW(),
                NOW()
            )
            RETURNING *;
        `;
        console.log(`SERVICE: Article created successfully with ID: ${result.rows[0].id_articulo}`);
        return result.rows[0];
    } catch (error: any) {
        console.error(`SERVICE ERROR in createArticuloProveedor for proveedor ${id_proveedor}:`, error);
         if (error.code === '23503') { // Foreign key violation (proveedor no existe)
            throw new Error(`Error: El proveedor con ID ${id_proveedor} no existe.`);
        }
        throw new Error(`Error al guardar el artículo: ${error.message}`);
    }
};

/**
 * Obtiene todos los artículos de un proveedor específico.
 * Opcionalmente filtra por estado activo.
 * @param {number} idProveedor - ID del proveedor.
 * @param {boolean} [activoOnly=true] - Si es true, solo devuelve artículos con estatus = true.
 * @returns {Promise<ArticuloProveedor[]>} - Array de artículos del proveedor.
 */
export const getArticulosByProveedorId = async (idProveedor: number, activoOnly: boolean = true): Promise<ArticuloProveedor[]> => {
    console.log(`SERVICE: Fetching articles for proveedor ID: ${idProveedor}. Active only: ${activoOnly}`);
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }

    try {
        // Construye la query dinámicamente para el filtro opcional
        let query;
        if (activoOnly) {
             query = sql<ArticuloProveedor>`
                SELECT * FROM articulos_proveedor
                WHERE id_proveedor = ${idProveedor} AND estatus = TRUE
                ORDER BY descripcion ASC;
            `;
        } else {
             query = sql<ArticuloProveedor>`
                SELECT * FROM articulos_proveedor
                WHERE id_proveedor = ${idProveedor}
                ORDER BY estatus DESC, descripcion ASC; -- Inactivos al final
            `;
        }

        const result = await query;
        console.log(`SERVICE: Found ${result.rowCount} articles for proveedor ID ${idProveedor}.`);
        return result.rows;
    } catch (error: any) {
        console.error(`SERVICE ERROR in getArticulosByProveedorId for proveedor ${idProveedor}:`, error);
        throw new Error(`Error al obtener los artículos del proveedor: ${error.message}`);
    }
};

/**
 * Obtiene un artículo específico por su ID, verificando que pertenezca al proveedor.
 * @param {number} idArticulo - ID del artículo a obtener.
 * @param {number} idProveedor - ID del proveedor al que debe pertenecer el artículo.
 * @returns {Promise<ArticuloProveedor | null>} - El artículo encontrado o null si no existe o no pertenece al proveedor.
 */
export const getArticuloById = async (idArticulo: number, idProveedor: number): Promise<ArticuloProveedor | null> => {
    console.log(`SERVICE: Fetching article ID: ${idArticulo} for proveedor ID: ${idProveedor}`);
    if (typeof idArticulo !== 'number' || isNaN(idArticulo) || typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("IDs de artículo y proveedor inválidos.");
    }

    try {
        const result = await sql<ArticuloProveedor>`
            SELECT * FROM articulos_proveedor
            WHERE id_articulo = ${idArticulo} AND id_proveedor = ${idProveedor};
        `;

        if (result.rowCount === 0) {
            console.warn(`SERVICE: Article ID ${idArticulo} not found for proveedor ID ${idProveedor}.`);
            return null; // O lanzar un error "Not Found" si se prefiere
        }

        console.log(`SERVICE: Article ID ${idArticulo} found.`);
        return result.rows[0];
    } catch (error: any) {
        console.error(`SERVICE ERROR in getArticuloById (Article: ${idArticulo}, Proveedor: ${idProveedor}):`, error);
        throw new Error(`Error al obtener el artículo: ${error.message}`);
    }
};

/**
 * Actualiza un artículo existente de un proveedor específico.
 * @param {number} idArticulo - ID del artículo a actualizar.
 * @param {number} idProveedor - ID del proveedor (para verificación de propiedad).
 * @param {Partial<ArticuloProveedorInput>} articuloData - Objeto con los campos a actualizar.
 * @returns {Promise<ArticuloProveedor>} - El artículo actualizado.
 */
export const updateArticuloProveedor = async (idArticulo: number, idProveedor: number, articuloData: Partial<ArticuloProveedorInput>): Promise<ArticuloProveedor> => {
    console.log(`SERVICE: Updating article ID: ${idArticulo} for proveedor ID: ${idProveedor}`);
    console.log(`SERVICE: Update data:`, JSON.stringify(articuloData, null, 2));

    if (typeof idArticulo !== 'number' || isNaN(idArticulo) || typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("IDs de artículo y proveedor inválidos para actualizar.");
    }

    // Validar que al menos se esté actualizando algo útil (aparte de updated_at)
    const { descripcion, unidad_medida, stock, precio_unitario, estatus } = articuloData;
    if (descripcion === undefined && unidad_medida === undefined && stock === undefined && precio_unitario === undefined && estatus === undefined) {
        console.warn(`SERVICE: No fields provided to update for article ID: ${idArticulo}.`);
        // Podrías lanzar un error o simplemente obtener y devolver el artículo actual
         const currentData = await getArticuloById(idArticulo, idProveedor);
         if (!currentData) {
             throw new Error(`Artículo con ID ${idArticulo} no encontrado o no pertenece al proveedor ${idProveedor}.`);
         }
         return currentData;
    }

     // Validaciones adicionales para los campos que se actualizan
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
        throw new Error("Stock debe ser un número no negativo.");
    }
    if (precio_unitario !== undefined && (typeof precio_unitario !== 'number' || precio_unitario < 0)) {
        throw new Error("Precio Unitario debe ser un número no negativo.");
    }
     if (estatus !== undefined && typeof estatus !== 'boolean') {
        throw new Error("Estatus debe ser un valor booleano (true/false).");
    }


    try {
        const result = await sql<ArticuloProveedor>`
            UPDATE articulos_proveedor
            SET
                descripcion = COALESCE(${descripcion}, descripcion),
                unidad_medida = COALESCE(${unidad_medida}, unidad_medida),
                stock = COALESCE(${stock?.toString()}, stock::text)::numeric, -- Convertir a string para COALESCE, luego de vuelta a numeric
                precio_unitario = COALESCE(${precio_unitario?.toString()}, precio_unitario::text)::numeric, -- Similar para precio
                estatus = COALESCE(${estatus}, estatus),
                updated_at = NOW()
            WHERE id_articulo = ${idArticulo} AND id_proveedor = ${idProveedor}
            RETURNING *;
        `;

        if (result.rowCount === 0) {
             console.warn(`SERVICE: Article ID ${idArticulo} not found for update or does not belong to proveedor ID ${idProveedor}.`);
            throw new Error(`Artículo con ID ${idArticulo} no encontrado o no pertenece al proveedor ${idProveedor}.`);
        }

        console.log(`SERVICE: Article ID ${idArticulo} updated successfully.`);
        return result.rows[0];

    } catch (error: any) {
        console.error(`SERVICE ERROR in updateArticuloProveedor (Article: ${idArticulo}, Proveedor: ${idProveedor}):`, error);
         if (error.code === '23503') { // Foreign key violation (no debería pasar en update)
            throw new Error(`Error interno al actualizar artículo.`);
         }
         if (error.code === '22P02') { // invalid input syntax for type numeric
              throw new Error(`Error: Formato inválido para Stock o Precio Unitario.`);
         }
        throw new Error(`Error al actualizar el artículo: ${error.message}`);
    }
};

/**
 * Elimina un artículo específico de un proveedor.
 * @param {number} idArticulo - ID del artículo a eliminar.
 * @param {number} idProveedor - ID del proveedor (para verificación de propiedad).
 * @returns {Promise<boolean>} - True si se eliminó, False si no se encontró.
 */
export const deleteArticuloProveedor = async (idArticulo: number, idProveedor: number): Promise<boolean> => {
    console.log(`SERVICE: Deleting article ID: ${idArticulo} for proveedor ID: ${idProveedor}`);
    if (typeof idArticulo !== 'number' || isNaN(idArticulo) || typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("IDs de artículo y proveedor inválidos para eliminar.");
    }

    try {
        const result = await sql`
            DELETE FROM articulos_proveedor
            WHERE id_articulo = ${idArticulo} AND id_proveedor = ${idProveedor};
        `;

        if (result.rowCount > 0) {
            console.log(`SERVICE: Article ID ${idArticulo} deleted successfully.`);
            return true;
        } else {
            console.warn(`SERVICE: Article ID ${idArticulo} not found for deletion or does not belong to proveedor ID ${idProveedor}.`);
            return false; // No se encontró la fila para eliminar
        }

    } catch (error: any) {
        console.error(`SERVICE ERROR in deleteArticuloProveedor (Article: ${idArticulo}, Proveedor: ${idProveedor}):`, error);
        throw new Error(`Error al eliminar el artículo: ${error.message}`);
    }
};