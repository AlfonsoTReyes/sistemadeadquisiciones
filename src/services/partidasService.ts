// src/services/partidasService.ts o similar

import { sql } from '@vercel/postgres';

// --- Tipos de Datos (Opcional pero recomendado) ---
interface CatalogoPartida {
    codigo: string;
    descripcion: string;
}

interface ProveedorPartidaSeleccionada {
    codigo_partida: string;
    descripcion: string; // Obtenida del JOIN
}


/**
 * Obtiene todas las partidas genéricas (nivel 3) del catálogo para ser seleccionadas.
 * @returns {Promise<CatalogoPartida[]>} - Array de partidas disponibles.
 */
export const getAllSelectablePartidas = async (): Promise<CatalogoPartida[]> => {
    console.log("SERVICE: Fetching all selectable partidas (nivel 3)");
    try {
        // Seleccionamos solo las de nivel 3, que son las que usualmente se asignan
        const result = await sql<CatalogoPartida>`
            SELECT codigo, descripcion
            FROM catalogo_partidas_presupuestarias
            WHERE nivel = 3
            ORDER BY codigo ASC;
        `;
        console.log(`SERVICE: Found ${result.rowCount} selectable partidas.`);
        return result.rows;
    } catch (error: any) {
        console.error("SERVICE ERROR in getAllSelectablePartidas:", error);
        throw new Error(`Error al obtener el catálogo de partidas: ${error.message}`);
    }
};

/**
 * Obtiene las partidas actualmente asociadas a un proveedor específico.
 * @param {number} idProveedor - El ID del proveedor.
 * @returns {Promise<ProveedorPartidaSeleccionada[]>} - Array de partidas seleccionadas por el proveedor.
 */
export const getPartidasByProveedorId = async (idProveedor: number): Promise<ProveedorPartidaSeleccionada[]> => {
    console.log(`SERVICE: Fetching partidas for proveedor ID: ${idProveedor}`);
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }
    try {
        const result = await sql<ProveedorPartidaSeleccionada>`
            SELECT
                pp.codigo_partida,
                cp.descripcion
            FROM proveedor_partidas pp
            INNER JOIN catalogo_partidas_presupuestarias cp ON pp.codigo_partida = cp.codigo
            WHERE pp.id_proveedor = ${idProveedor}
            ORDER BY pp.codigo_partida ASC;
        `;
        console.log(`SERVICE: Found ${result.rowCount} partidas for proveedor ID ${idProveedor}.`);
        return result.rows;
    } catch (error: any) {
        console.error(`SERVICE ERROR in getPartidasByProveedorId for proveedor ${idProveedor}:`, error);
        throw new Error(`Error al obtener las partidas del proveedor: ${error.message}`);
    }
};

/**
 * Añade una única partida a un proveedor.
 * Considera usar syncProveedorPartidas para múltiples cambios.
 * @param {number} idProveedor - El ID del proveedor.
 * @param {string} codigoPartida - El código de la partida a añadir.
 * @returns {Promise<object>} - El registro creado en la tabla proveedor_partidas.
 */
export const addProveedorPartida = async (idProveedor: number, codigoPartida: string): Promise<object> => {
    console.log(`SERVICE: Adding partida ${codigoPartida} to proveedor ID: ${idProveedor}`);
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }
    if (!codigoPartida || typeof codigoPartida !== 'string') {
        throw new Error("Código de partida inválido.");
    }

    try {
        // Insertar la nueva relación
        const result = await sql`
            INSERT INTO proveedor_partidas (id_proveedor, codigo_partida)
            VALUES (${idProveedor}, ${codigoPartida})
            ON CONFLICT (id_proveedor, codigo_partida) DO NOTHING -- Evita error si ya existe
            RETURNING *;
        `;

        if (result.rowCount === 0) {
            console.warn(`SERVICE: Partida ${codigoPartida} ya existía para proveedor ${idProveedor}. No se insertó.`);
            // Podrías devolver un indicador o null si prefieres manejar esto diferente
             return { message: "La partida ya estaba asignada." };
        }

        console.log(`SERVICE: Partida ${codigoPartida} added successfully for proveedor ${idProveedor}.`);
        return result.rows[0]; // Devuelve el registro insertado

    } catch (error: any) {
        console.error(`SERVICE ERROR in addProveedorPartida (Proveedor: ${idProveedor}, Partida: ${codigoPartida}):`, error);
        if (error.code === '23503') { // Foreign key violation
             if (error.constraint?.includes('fk_proveedor')) {
                 throw new Error(`Error: El proveedor con ID ${idProveedor} no existe.`);
             }
             if (error.constraint?.includes('fk_partida')) {
                 throw new Error(`Error: La partida con código '${codigoPartida}' no existe en el catálogo.`);
             }
        }
        throw new Error(`Error al añadir la partida al proveedor: ${error.message}`);
    }
};

/**
 * Elimina una única partida asociada a un proveedor.
 * @param {number} idProveedor - El ID del proveedor.
 * @param {string} codigoPartida - El código de la partida a eliminar.
 * @returns {Promise<boolean>} - True si se eliminó, False si no se encontró la relación.
 */
export const deleteProveedorPartida = async (idProveedor: number, codigoPartida: string): Promise<boolean> => {
    console.log(`SERVICE: Deleting partida ${codigoPartida} from proveedor ID: ${idProveedor}`);
     if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }
    if (!codigoPartida || typeof codigoPartida !== 'string') {
        throw new Error("Código de partida inválido.");
    }

    try {
        const result = await sql`
            DELETE FROM proveedor_partidas
            WHERE id_proveedor = ${idProveedor} AND codigo_partida = ${codigoPartida};
        `;

        if (result.rowCount && result.rowCount > 0) {
            console.log(`SERVICE: Partida ${codigoPartida} deleted successfully for proveedor ${idProveedor}.`);
            return true;
        } else {
            console.warn(`SERVICE: No relation found to delete for proveedor ${idProveedor} and partida ${codigoPartida}.`);
            return false; // No se encontró la fila para eliminar
        }

    } catch (error: any) {
        console.error(`SERVICE ERROR in deleteProveedorPartida (Proveedor: ${idProveedor}, Partida: ${codigoPartida}):`, error);
        throw new Error(`Error al eliminar la partida del proveedor: ${error.message}`);
    }
};

/**
 * Sincroniza las partidas de un proveedor (usando DELETE + bucle de INSERTs individuales).
 * SOLO USA EL TAG `sql`. No es transaccional.
 * @param {number} idProveedor - El ID del proveedor.
 * @param {string[]} codigosPartida - Array con los códigos de las partidas que el proveedor DEBE tener.
 * @returns {Promise<void>}
 */
export const syncProveedorPartidas = async (idProveedor: number, codigosPartida: string[]): Promise<void> => {
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }
    if (!Array.isArray(codigosPartida)) {
        throw new Error("La lista de códigos de partida debe ser un array.");
    }

    // Filtrar códigos vacíos o nulos y asegurar strings únicos
    const uniqueValidCodigos = [...new Set(codigosPartida
                                .map(p => p != null ? String(p).trim() : null)
                                .filter((p): p is string => p !== null && p !== '') // Asegura que sean strings no vacíos
                            )];

    // Advertencia: Esta operación NO es atómica (no usa transacción explícita)
    try {
        // 1. Eliminar todas las partidas existentes para este proveedor
        // Se usa el tag sql para el DELETE
        await sql`DELETE FROM proveedor_partidas WHERE id_proveedor = ${idProveedor};`;
        // 2. Insertar las nuevas partidas una por una (si las hay)
        if (uniqueValidCodigos.length > 0) {
            // Usar un bucle for...of para ejecutar cada INSERT secuencialmente
            // Esto es más fácil de depurar que Promise.all si hay errores
            for (const codigo of uniqueValidCodigos) {
                 console.log(`SERVICE (Individual Inserts): Inserting partida ${codigo}...`);
                 // Se usa el tag sql para cada INSERT
                 await sql`
                     INSERT INTO proveedor_partidas (id_proveedor, codigo_partida)
                     VALUES (${idProveedor}, ${codigo})
                     ON CONFLICT (id_proveedor, codigo_partida) DO NOTHING; -- Evita errores si la combinación ya existe (aunque no debería tras el DELETE)
                 `;
            }

        } else {
            console.log(`SERVICE (Individual Inserts): No new partidas to insert.`);
        }

    } catch (error: any) {
        console.error(`SERVICE ERROR (Individual Inserts) in syncProveedorPartidas for proveedor ${idProveedor}:`, error);
         let userMessage = `Error al sincronizar las partidas del proveedor: ${error.message}`;
         // Añadir más contexto si es posible basado en el código de error
         if (error.code === '23503') { // Foreign key violation
             userMessage = `Error: El proveedor ID ${idProveedor} o alguna de las partidas proporcionadas no existe.`;
         } else if (error.code === '22P02') { // Invalid text representation (si algún código no es válido)
             userMessage = `Error: Uno de los códigos de partida proporcionados tiene un formato inválido.`;
         }
        throw new Error(userMessage);
    }
};