// src/services/catalogoProveedoresService.ts

import { sql } from '@vercel/postgres';

// --- Interfaces/Types ---

// Representa un artículo como se mostrará en el catálogo
interface ArticuloCatalogo {
    id_articulo: number;
    codigo_partida: string; // <-- AÑADIDO: Código de la partida del artículo
    descripcion: string;
    unidad_medida: string;
    precio_unitario: number;
    // partida_descripcion?: string; // Podríamos añadir la desc de la partida del artículo aquí también si fuera útil
}

interface PartidaProveedorCatalogo {
    codigo_partida: string;
    descripcion: string;
}

interface ProveedorCatalogo {
    id_proveedor: number;
    rfc: string;
    nombre_o_razon_social: string;
    giro_comercial: string | null;
    correo: string | null;
    telefono_uno: string | null;
    pagina_web: string | null;
    partidas: PartidaProveedorCatalogo[];
    articulos: ArticuloCatalogo[]; // Usa la interfaz actualizada
}

interface CatalogoPartidaFiltro {
    codigo: string;
    descripcion: string;
}

// Tipo intermedio para la fila de la BD (Actualizado)
type ArticuloDbRow = {
    id_articulo: number;
    id_proveedor: number;
    codigo_partida: string; // <-- AÑADIDO
    descripcion: string;
    unidad_medida: string;
    precio_unitario: string;
};



// --- Funciones del Servicio ---

/**
 * Obtiene la lista de todas las partidas genéricas (nivel 3) para usar en el filtro.
 * Reutiliza la lógica o crea una específica si es necesario.
 * @returns {Promise<CatalogoPartidaFiltro[]>}
 */
export const getAllPartidasParaFiltro = async (): Promise<CatalogoPartidaFiltro[]> => {
    console.log("SERVICE: Fetching all partidas (nivel 3) for filter dropdown");
    try {
        const result = await sql<CatalogoPartidaFiltro>`
            SELECT codigo, descripcion
            FROM catalogo_partidas_presupuestarias
            WHERE nivel = 3 -- Asumiendo que se filtra por partidas genéricas
            ORDER BY codigo ASC;
        `;
        console.log(`SERVICE: Found ${result.rowCount} partidas for filter.`);
        return result.rows;
    } catch (error: any) {
        console.error("SERVICE ERROR in getAllPartidasParaFiltro:", error);
        throw new Error(`Error al obtener el catálogo de partidas para filtro: ${error.message}`);
    }
};


/**
 * Obtiene la lista de proveedores activos, opcionalmente filtrados por partida,
 * incluyendo sus partidas y artículos asociados.
 * @param {string | null} codigoPartidaFiltro - Código de la partida para filtrar (opcional).
 * @returns {Promise<ProveedorCatalogo[]>} - Array de proveedores con detalles.
 */
export const getProveedoresConDetalles = async (codigoPartidaFiltro: string | null = null): Promise<ProveedorCatalogo[]> => {
    console.log(`SERVICE: Fetching UNIQUE providers catalog (Manual Query Build). Filter: ${codigoPartidaFiltro ?? 'None'}`);
    try {
        // --- 1. Obtener proveedores base (CONSTRUCCIÓN MANUAL) ---
        let proveedoresResult; // Para almacenar el resultado de la query

        // Define la lista de campos a seleccionar
        const selectFields = `
            p.id_proveedor, p.rfc, p.giro_comercial, p.correo, p.telefono_uno, p.pagina_web,
            COALESCE(pf.nombre || ' ' || pf.apellido_p || ' ' || pf.apellido_m, pm.razon_social) AS nombre_o_razon_social
        `;

        // Define cláusulas comunes
        const fromClause = `
            FROM proveedores p
            LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
            LEFT JOIN proveedores_morales pm ON p.id_proveedor = pm.id_proveedor
        `;
        const whereBase = ` WHERE p.estatus = TRUE `;
        const orderBy = ` ORDER BY p.id_proveedor, COALESCE(pf.nombre, pm.razon_social) ASC `; // Necesario para DISTINCT ON

        // Construir la query completa
        let queryText: string;

        if (codigoPartidaFiltro) {
            console.log(`SERVICE: Applying filter for partida: ${codigoPartidaFiltro}`);
            // Construir query CON filtro de partida
            queryText = `
                SELECT DISTINCT ON (p.id_proveedor) ${selectFields}
                ${fromClause}
                ${whereBase}
                  AND EXISTS (
                      SELECT 1
                      FROM proveedor_partidas pp
                      WHERE pp.id_proveedor = p.id_proveedor AND pp.codigo_partida = $1 -- Placeholder $1
                  )
                ${orderBy}
            `;
            // Ejecutar con parámetro usando sql.query()
            proveedoresResult = await sql.query(queryText, [codigoPartidaFiltro]);

        } else {
            console.log(`SERVICE: Fetching all active unique providers.`);
            // Construir query SIN filtro de partida
            queryText = `
                SELECT DISTINCT ON (p.id_proveedor) ${selectFields}
                ${fromClause}
                ${whereBase}
                ${orderBy}
            `;
            // Ejecutar SIN parámetros usando sql.query()
            proveedoresResult = await sql.query(queryText);
        }
        // --- Fin Construcción/Ejecución SQL ---

        // **proveedoresBase ahora contendrá filas únicas**
        const proveedoresBase = proveedoresResult.rows;
        console.log(`SERVICE: Found ${proveedoresBase.length} UNIQUE base providers.`);
        if (proveedoresBase.length === 0) return [];

        const proveedorIds = proveedoresBase.map(p => p.id_proveedor);

        // --- 2. Obtener Partidas Asociadas (Sin cambios) ---
        // Usar plantilla etiquetada aquí es seguro porque ${proveedorIds} es un array
        const partidasResult = await sql`
            SELECT pp.id_proveedor, pp.codigo_partida, cp.descripcion
            FROM proveedor_partidas pp JOIN catalogo_partidas_presupuestarias cp ON pp.codigo_partida = cp.codigo
            WHERE pp.id_proveedor = ANY (${proveedorIds})
            ORDER BY pp.id_proveedor, pp.codigo_partida;
        `;
        const todasLasPartidas = partidasResult.rows;

        // --- 3. Obtener Artículos Asociados (Sin cambios) ---
        console.log("SERVICE: Fetching associated active articles...");
        // Usar plantilla etiquetada aquí es seguro
        const articulosResult = await sql<ArticuloDbRow>`
            SELECT id_articulo, id_proveedor, codigo_partida, descripcion, unidad_medida, precio_unitario
            FROM articulos_proveedor
            WHERE id_proveedor = ANY (${proveedorIds}) AND estatus = TRUE
            ORDER BY id_proveedor, codigo_partida, descripcion ASC;
        `;
        const todosLosArticulosDb = articulosResult.rows;
        console.log(`SERVICE: Found ${todosLosArticulosDb.length} raw active articles.`);

        // 4. Combinar los datos (Sin cambios en este bloque)
        console.log("SERVICE: Combining data...");
        const proveedoresCompletos: ProveedorCatalogo[] = proveedoresBase.map(proveedor => {
            const partidasDelProveedor = todasLasPartidas
                .filter(partida => partida.id_proveedor === proveedor.id_proveedor)
                .map(p => ({ codigo_partida: p.codigo_partida, descripcion: p.descripcion }));

            const articulosDelProveedor = todosLosArticulosDb
                .filter(articuloDb => articuloDb.id_proveedor === proveedor.id_proveedor)
                .map(dbRow => ({
                    id_articulo: dbRow.id_articulo,
                    codigo_partida: dbRow.codigo_partida,
                    descripcion: dbRow.descripcion,
                    unidad_medida: dbRow.unidad_medida,
                    precio_unitario: parseFloat(dbRow.precio_unitario) || 0
                }));

            return {
                id_proveedor: proveedor.id_proveedor,
                rfc: proveedor.rfc,
                nombre_o_razon_social: proveedor.nombre_o_razon_social,
                giro_comercial: proveedor.giro_comercial,
                correo: proveedor.correo,
                telefono_uno: proveedor.telefono_uno,
                pagina_web: proveedor.pagina_web,
                partidas: partidasDelProveedor,
                articulos: articulosDelProveedor,
            };
        });

        console.log("SERVICE: Data combination complete.");
        return proveedoresCompletos; // Devuelve array sin proveedores duplicados

    } catch (error: any) {
        console.error("SERVICE ERROR in getProveedoresConDetalles:", error);
        throw new Error(`Error al obtener el catálogo de proveedores: ${error.message}`);
    }
};

// --- ***** NUEVA FUNCIÓN PARA BUSCAR ARTÍCULOS ***** ---
/**
 * Busca artículos/servicios de un proveedor específico por término de descripción.
 * Reutiliza la interfaz ArticuloCatalogo y el parseo de precio.
 * @param {number} idProveedor - El ID del proveedor.
 * @param {string} term - Término de búsqueda para la descripción (mínimo 3 caracteres).
 * @returns {Promise<ArticuloCatalogo[]>} - Lista de artículos que coinciden.
 */
export const buscarArticulosPorProveedorYTermino = async (idProveedor: number, term: string): Promise<ArticuloCatalogo[]> => {
    const logPrefix = `SERVICE buscarArticulosPorProveedorYTermino (Prov ID: ${idProveedor}, Term: ${term}):`;
    console.log(logPrefix);

    if (isNaN(idProveedor) || idProveedor <= 0) {
        throw new Error("ID de proveedor inválido.");
    }
    if (!term || term.trim().length < 3) {
        console.log(`${logPrefix} Search term too short.`);
        return []; // No buscar si el término es muy corto
    }

    const likeTerm = `%${term.trim()}%`;

    try {
        // Query similar a la de getProveedoresConDetalles, pero filtrando por id_proveedor y descripción
        const result = await sql<Omit<ArticuloDbRow, 'id_proveedor'>>`
            SELECT
                id_articulo,
                codigo_partida,
                descripcion,
                unidad_medida,
                precio_unitario
            FROM articulos_proveedor
            WHERE id_proveedor = ${idProveedor}
              AND descripcion ILIKE ${likeTerm}
              AND estatus = TRUE -- Solo buscar artículos activos
            ORDER BY descripcion ASC
            LIMIT 20; -- Limitar resultados para el selector
        `;

        console.log(`${logPrefix} Found ${result.rowCount} articles.`);

        // Mapear y convertir precio_unitario a número (reutilizando lógica)
        const articulos: ArticuloCatalogo[] = result.rows.map(dbRow => ({
            id_articulo: dbRow.id_articulo,
            codigo_partida: dbRow.codigo_partida,
            descripcion: dbRow.descripcion,
            unidad_medida: dbRow.unidad_medida,
            precio_unitario: parseFloat(dbRow.precio_unitario) || 0, // Convertir y manejar NaN
        }));

        return articulos;

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        throw new Error(`Error al buscar artículos para el proveedor: ${error.message}`);
    }
};