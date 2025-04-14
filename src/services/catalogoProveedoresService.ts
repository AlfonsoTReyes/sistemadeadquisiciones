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
    console.log(`SERVICE: Fetching providers catalog. Filter by partida: ${codigoPartidaFiltro ?? 'None'}`);
    try {
        // 1. Obtener proveedores base (Sin cambios en esta parte)
        let proveedoresQuery;
        if (codigoPartidaFiltro) {
            console.log(`SERVICE: Applying filter for partida: ${codigoPartidaFiltro}`);
            proveedoresQuery = sql`
                SELECT
                    p.id_proveedor, p.rfc, p.giro_comercial, p.correo, p.telefono_uno, p.pagina_web,
                    COALESCE(pf.nombre || ' ' || pf.apellido_p || ' ' || pf.apellido_m, pm.razon_social) AS nombre_o_razon_social
                FROM proveedores p
                LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
                LEFT JOIN proveedores_morales pm ON p.id_proveedor = pm.id_proveedor
                WHERE p.estatus = TRUE
                AND EXISTS (
                    SELECT 1
                    FROM proveedor_partidas pp
                    WHERE pp.id_proveedor = p.id_proveedor AND pp.codigo_partida = ${codigoPartidaFiltro} -- El único parámetro ($1)
                )
                ORDER BY nombre_o_razon_social ASC;
            `;
        } else {
            console.log(`SERVICE: Fetching all active providers.`);
            proveedoresQuery = sql`
                SELECT
                    p.id_proveedor, p.rfc, p.giro_comercial, p.correo, p.telefono_uno, p.pagina_web,
                    COALESCE(pf.nombre || ' ' || pf.apellido_p || ' ' || pf.apellido_m, pm.razon_social) AS nombre_o_razon_social
                FROM proveedores p
                LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
                LEFT JOIN proveedores_morales pm ON p.id_proveedor = pm.id_proveedor
                WHERE p.estatus = TRUE
                ORDER BY nombre_o_razon_social ASC;
            `; // <-- Esta consulta es estática, no debe generar "$1"
        }
        const proveedoresResult = await proveedoresQuery;
        const proveedoresBase = proveedoresResult.rows;
        if (proveedoresBase.length === 0) return [];
        const proveedorIds = proveedoresBase.map(p => p.id_proveedor);

        // 2. Obtener Partidas Asociadas (Sin cambios)
        const partidasResult = await sql`
        SELECT
            pp.id_proveedor,
            pp.codigo_partida,
            cp.descripcion
        FROM proveedor_partidas pp
        INNER JOIN catalogo_partidas_presupuestarias cp ON pp.codigo_partida = cp.codigo
        WHERE pp.id_proveedor = ANY (${proveedorIds}) -- Más eficiente que IN para arrays grandes
        ORDER BY pp.id_proveedor, pp.codigo_partida;
    `;
        const todasLasPartidas = partidasResult.rows;

        // 3. Obtener TODOS los artículos ACTIVOS asociados (CONSULTA ACTUALIZADA)
        console.log("SERVICE: Fetching associated active articles (articulos_proveedor)...");
        const articulosResult = await sql<ArticuloDbRow>`
            SELECT
                id_articulo,
                id_proveedor,
                codigo_partida,    -- <<<--- SELECCIONADO AHORA
                descripcion,
                unidad_medida,
                precio_unitario
            FROM articulos_proveedor
            WHERE id_proveedor = ANY (${proveedorIds})
              AND estatus = TRUE
            ORDER BY id_proveedor, codigo_partida, descripcion ASC; -- Ordenar también por partida
        `;
        const todosLosArticulosDb = articulosResult.rows;
        console.log(`SERVICE: Found ${todosLosArticulosDb.length} raw active articles from DB.`);

        // 4. Combinar los datos (MAPEO ACTUALIZADO)
        console.log("SERVICE: Combining data...");
        const proveedoresCompletos: ProveedorCatalogo[] = proveedoresBase.map(proveedor => {
            const partidasDelProveedor: PartidaProveedorCatalogo[] = todasLasPartidas
                .filter(partida => partida.id_proveedor === proveedor.id_proveedor)
                .map(p => ({ codigo_partida: p.codigo_partida, descripcion: p.descripcion }));

            // Mapear artículos, incluyendo codigo_partida
            const articulosDelProveedor: ArticuloCatalogo[] = todosLosArticulosDb
                .filter(articuloDb => articuloDb.id_proveedor === proveedor.id_proveedor)
                .map(dbRow => ({
                    id_articulo: dbRow.id_articulo,
                    codigo_partida: dbRow.codigo_partida, // <-- Incluir código de partida
                    descripcion: dbRow.descripcion,
                    unidad_medida: dbRow.unidad_medida,
                    precio_unitario: parseFloat(dbRow.precio_unitario)
                }));

            return {
                // Datos base del proveedor
                id_proveedor: proveedor.id_proveedor,
                rfc: proveedor.rfc,
                nombre_o_razon_social: proveedor.nombre_o_razon_social,
                giro_comercial: proveedor.giro_comercial,
                correo: proveedor.correo,
                telefono_uno: proveedor.telefono_uno,
                pagina_web: proveedor.pagina_web,
                // Datos anidados
                partidas: partidasDelProveedor,
                articulos: articulosDelProveedor, // Array de ArticuloCatalogo actualizado
            };
        });

        console.log("SERVICE: Data combination complete.");
        return proveedoresCompletos;

    } catch (error: any) {
        // ... (Manejo de errores sin cambios) ...
         console.error("SERVICE ERROR in getProveedoresConDetalles:", error);
         if (error.message.includes('column') && error.message.includes('does not exist')) {
              throw new Error(`Error de base de datos: ${error.message}. Revisa nombres de columna en el servicio.`);
         }
        throw new Error(`Error al obtener el catálogo de proveedores: ${error.message}`);
    }
};
