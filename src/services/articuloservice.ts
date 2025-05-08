// src/services/articulosService.ts

import { sql } from "@vercel/postgres";


// Para crear o actualizar un artículo
interface ArticuloProveedorInput {
    id_proveedor: number;
    codigo_partida: string;
    descripcion: string;
    unidad_medida: string;
    stock: number;
    precio_unitario: number;
    estatus?: boolean;
}

interface ArticuloProveedor extends Omit<ArticuloProveedorInput, 'estatus'>{
    id_articulo: number;
    codigo_partida: string;
    estatus: boolean;
    created_at: Date;
    updated_at: Date;
    partida_descripcion?: string;
}


/**
 * Guarda un nuevo artículo para un proveedor específico, incluyendo su partida.
 * @param {ArticuloProveedorInput} articuloData - Datos del artículo a crear (DEBE incluir codigo_partida).
 * @returns {Promise<ArticuloProveedor>} - El artículo recién creado.
 */
export const createArticuloProveedor = async (articuloData: ArticuloProveedorInput): Promise<ArticuloProveedor> => {
    // Ahora incluye codigo_partida
    const { id_proveedor, codigo_partida, descripcion, unidad_medida, stock, precio_unitario, estatus = true } = articuloData;

    console.log(`SERVICE: Creating article for proveedor ID: ${id_proveedor} under partida: ${codigo_partida}`);
    // Validación básica actualizada
    if (!id_proveedor || !codigo_partida || !descripcion || !unidad_medida || stock === undefined || stock === null || precio_unitario === undefined || precio_unitario === null) {
        throw new Error("Faltan datos requeridos (proveedor, partida, descripción, UDM, stock, precio unitario).");
    }
     if (typeof codigo_partida !== 'string' || codigo_partida.trim() === '') {
        throw new Error("El código de partida es requerido y no puede estar vacío.");
    }
    if (typeof stock !== 'number' || stock < 0 || typeof precio_unitario !== 'number' || precio_unitario < 0) {
        throw new Error("Stock y Precio Unitario deben ser números no negativos.");
    }


    try {
        const result = await sql<ArticuloProveedor>`
            INSERT INTO articulos_proveedor (
                id_proveedor,
                codigo_partida, -- Añadido
                descripcion,
                unidad_medida,
                stock,
                precio_unitario,
                estatus,
                created_at,
                updated_at
            ) VALUES (
                ${id_proveedor},
                ${codigo_partida}, -- Añadido
                ${descripcion},
                ${unidad_medida},
                ${stock},
                ${precio_unitario},
                ${estatus},
                NOW(),
                NOW()
            )
            RETURNING *; -- Devuelve la fila insertada
        `;
        console.log(`SERVICE: Article created successfully with ID: ${result.rows[0].id_articulo}`);
        // El resultado ya incluye codigo_partida porque usamos RETURNING *
        return result.rows[0];
    } catch (error: any) {
        console.error(`SERVICE ERROR in createArticuloProveedor (Prov: ${id_proveedor}, Partida: ${codigo_partida}):`, error);
         if (error.code === '23503') { // Foreign key violation
             if (error.constraint === 'fk_proveedor_articulo') { // Nombre de la constraint del proveedor
                 throw new Error(`Error: El proveedor con ID ${id_proveedor} no existe.`);
             }
             if (error.constraint === 'fk_partida_articulo') { // Nombre de la constraint de la partida
                 throw new Error(`Error: La partida con código '${codigo_partida}' no existe en el catálogo.`);
             }
             // Error FK genérico
             throw new Error(`Error de referencia: El proveedor o la partida especificada no existen.`);
         }
        throw new Error(`Error al guardar el artículo: ${error.message}`);
    }
};

/**
 * Obtiene todos los artículos de un proveedor, incluyendo descripción de partida.
 * Opcionalmente filtra por estado activo.
 * @param {number} idProveedor - ID del proveedor.
 * @param {boolean} [activoOnly=true] - Si es true, solo devuelve artículos con estatus = true.
 * @returns {Promise<ArticuloProveedor[]>} - Array de artículos del proveedor con descripción de partida.
 */

export const getArticulosByProveedorId = async (idProveedor: number, activoOnly: boolean = true): Promise<ArticuloProveedor[]> => {
    console.log(`SERVICE: Fetching articles for proveedor ID: ${idProveedor}. Active only: ${activoOnly}`);
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }

    try {
        let query;
        if (activoOnly) {
            // --- Consulta Completa para Solo Activos ---
             console.log("SERVICE: Building query for active articles only.");
             query = sql<ArticuloProveedor>`
                SELECT
                    ap.*,
                    cp.descripcion AS partida_descripcion
                FROM articulos_proveedor ap
                LEFT JOIN catalogo_partidas_presupuestarias cp ON ap.codigo_partida = cp.codigo
                WHERE ap.id_proveedor = ${idProveedor} AND ap.estatus = TRUE
                ORDER BY ap.descripcion ASC;
            `;
        } else {
             // --- Consulta Completa para Todos (Activos e Inactivos) ---
             console.log("SERVICE: Building query for all articles.");
             query = sql<ArticuloProveedor>`
                SELECT
                    ap.*,
                    cp.descripcion AS partida_descripcion
                FROM articulos_proveedor ap
                LEFT JOIN catalogo_partidas_presupuestarias cp ON ap.codigo_partida = cp.codigo
                WHERE ap.id_proveedor = ${idProveedor}
                ORDER BY ap.estatus DESC, ap.descripcion ASC; -- Inactivos al final
            `;
        }

        console.log("SERVICE: Executing article query.");
        const result = await query; // Ejecuta la consulta seleccionada
        console.log(`SERVICE: Found ${result.rowCount} articles for proveedor ID ${idProveedor}.`);
        return result.rows;

    } catch (error: any) {
        console.error(`SERVICE ERROR in getArticulosByProveedorId for proveedor ${idProveedor}:`, error);
        // Mejorar mensaje si es error de sintaxis
        if (error.code === '42601') {
             throw new Error(`Error de sintaxis SQL al obtener artículos: ${error.message}. Revise la consulta en articulosService.`);
        }
        throw new Error(`Error al obtener los artículos del proveedor: ${error.message}`);
    }
};

/**
 * Obtiene un artículo específico por su ID, verificando proveedor y añadiendo descripción de partida.
 * @param {number} idArticulo - ID del artículo a obtener.
 * @param {number} idProveedor - ID del proveedor al que debe pertenecer el artículo.
 * @returns {Promise<ArticuloProveedor | null>} - El artículo encontrado (con desc partida) o null.
 */
export const getArticuloById = async (idArticulo: number, idProveedor: number): Promise<ArticuloProveedor | null> => {
    console.log(`SERVICE: Fetching article ID: ${idArticulo} for proveedor ID: ${idProveedor}`);
    if (typeof idArticulo !== 'number' || isNaN(idArticulo) || typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("IDs de artículo y proveedor inválidos.");
    }

    try {
         // Usar LEFT JOIN para obtener la descripción de la partida
        const result = await sql<ArticuloProveedor>`
            SELECT
                ap.*,
                cp.descripcion AS partida_descripcion
            FROM articulos_proveedor ap
            LEFT JOIN catalogo_partidas_presupuestarias cp ON ap.codigo_partida = cp.codigo
            WHERE ap.id_articulo = ${idArticulo} AND ap.id_proveedor = ${idProveedor};
        `;

        if (result.rowCount === 0) {
            console.warn(`SERVICE: Article ID ${idArticulo} not found for proveedor ID ${idProveedor}.`);
            return null;
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
 * @param {Partial<ArticuloProveedorInput>} articuloData - Objeto con los campos a actualizar (puede incluir codigo_partida).
 * @returns {Promise<ArticuloProveedor>} - El artículo actualizado.
 */
export const updateArticuloProveedor = async (idArticulo: number, idProveedor: number, articuloData: Partial<ArticuloProveedorInput>): Promise<ArticuloProveedor> => {
    console.log(`SERVICE: Updating article ID: ${idArticulo} for proveedor ID: ${idProveedor}`);
    console.log(`SERVICE: Update data:`, JSON.stringify(articuloData, null, 2));

    if (typeof idArticulo !== 'number' || isNaN(idArticulo) || typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("IDs de artículo y proveedor inválidos para actualizar.");
    }

    // Validar que al menos se esté actualizando algo
    const { codigo_partida, descripcion, unidad_medida, stock, precio_unitario, estatus } = articuloData;
    if (codigo_partida === undefined && descripcion === undefined && unidad_medida === undefined && stock === undefined && precio_unitario === undefined && estatus === undefined) {
        console.warn(`SERVICE: No fields provided to update for article ID: ${idArticulo}. Fetching current data.`);
         const currentData = await getArticuloById(idArticulo, idProveedor); // Llama a la versión actualizada que trae desc partida
         if (!currentData) {
             throw new Error(`Artículo con ID ${idArticulo} no encontrado o no pertenece al proveedor ${idProveedor}.`);
         }
         return currentData;
    }

     // Validaciones adicionales
    if (codigo_partida !== undefined && (typeof codigo_partida !== 'string' || codigo_partida.trim() === '')) {
         throw new Error("El código de partida no puede estar vacío si se actualiza.");
    }
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) { throw new Error("Stock debe ser número no negativo."); }
    if (precio_unitario !== undefined && (typeof precio_unitario !== 'number' || precio_unitario < 0)) { throw new Error("Precio Unitario debe ser número no negativo."); }
    if (estatus !== undefined && typeof estatus !== 'boolean') { throw new Error("Estatus debe ser booleano."); }


    try {
        // Usamos COALESCE para permitir actualizaciones parciales
        const result = await sql<ArticuloProveedor>`
            UPDATE articulos_proveedor
            SET
                codigo_partida = COALESCE(${codigo_partida}, codigo_partida), -- Añadido
                descripcion = COALESCE(${descripcion}, descripcion),
                unidad_medida = COALESCE(${unidad_medida}, unidad_medida),
                stock = COALESCE(${stock?.toString()}, stock::text)::numeric,
                precio_unitario = COALESCE(${precio_unitario?.toString()}, precio_unitario::text)::numeric,
                estatus = COALESCE(${estatus}, estatus),
                updated_at = NOW()
            WHERE id_articulo = ${idArticulo} AND id_proveedor = ${idProveedor}
            RETURNING *; -- Devuelve la fila actualizada
        `;

        if (result.rowCount === 0) {
             console.warn(`SERVICE: Article ID ${idArticulo} not found for update or does not belong to proveedor ID ${idProveedor}.`);
            throw new Error(`Artículo con ID ${idArticulo} no encontrado o no pertenece al proveedor ${idProveedor}.`);
        }

        console.log(`SERVICE: Article ID ${idArticulo} updated successfully.`);
        // Para devolver también la descripción de la partida actualizada, hacemos una consulta extra
        const updatedArticleWithDetails = await getArticuloById(idArticulo, idProveedor);
        if (!updatedArticleWithDetails) {
             // Esto sería muy raro si el UPDATE funcionó, pero por seguridad
             throw new Error("Error al recuperar los detalles actualizados del artículo.");
        }
        return updatedArticleWithDetails;


    } catch (error: any) {
        console.error(`SERVICE ERROR in updateArticuloProveedor (Article: ${idArticulo}, Prov: ${idProveedor}):`, error);
         if (error.code === '23503') { // Foreign key violation
            if (error.constraint === 'fk_partida_articulo') {
                 throw new Error(`Error: La partida con código '${codigo_partida}' no existe en el catálogo.`);
            }
            throw new Error(`Error interno al actualizar artículo (FK).`);
         }
         if (error.code === '22P02') { throw new Error(`Error: Formato inválido para Stock o Precio Unitario.`); }
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
        if ((result.rowCount ?? 0) > 0) {
            console.log(`SERVICE: Article ID ${idArticulo} deleted successfully.`);
            return true;
        } else {
            console.warn(`SERVICE: Article ID ${idArticulo} not found for deletion or does not belong to proveedor ID ${idProveedor}.`);
            return false;
        }
    } catch (error: any) {
        console.error(`SERVICE ERROR in deleteArticuloProveedor (Article: ${idArticulo}, Prov: ${idProveedor}):`, error);
        throw new Error(`Error al eliminar el artículo: ${error.message}`);
    }
};