// src/services/catalogoProveedoresService.ts

import { sql } from '@vercel/postgres';

// --- Interfaces/Types ---

// Representa un artículo como se mostrará en el catálogo
interface ArticuloCatalogo {
    id_producto: number; // Corregido: usa el nombre de columna de productos_proveedor
    nombre_producto: string; // Corregido
    descripcion: string;
    unidad_medida: string;
    precio: number; // Asumiendo que quieres mostrar el precio
    // No incluimos stock aquí, ya que es más para gestión interna del proveedor
}

// Representa una partida asociada a un proveedor en el catálogo
interface PartidaProveedorCatalogo {
    codigo_partida: string;
    descripcion: string; // De la tabla catalogo_partidas_presupuestarias
}

// Representa la información completa de un proveedor para el catálogo
interface ProveedorCatalogo {
    id_proveedor: number;
    rfc: string;
    // Incluye los campos de la tabla 'proveedores' que quieras mostrar:
    nombre_o_razon_social: string; // Necesitaremos lógica para obtener esto (JOIN o lógica JS)
    giro_comercial: string | null;
    correo: string | null;
    telefono_uno: string | null;
    pagina_web: string | null;
    // ... otros campos relevantes de 'proveedores' ...
    partidas: PartidaProveedorCatalogo[]; // Array de partidas asociadas
    articulos: ArticuloCatalogo[]; // Array de artículos asociados
}

// Interfaz para el catálogo de partidas (para el filtro)
interface CatalogoPartidaFiltro {
    codigo: string;
    descripcion: string;
}


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
        // 1. Definir y ejecutar la consulta de proveedores base
        let proveedoresQuery;
        if (codigoPartidaFiltro) {
            // --- Consulta COMPLETA con filtro de partida ---
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
            // --- Consulta COMPLETA sin filtro de partida ---
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
        // Ejecutar la consulta seleccionada
        const proveedoresResult = await proveedoresQuery;
        const proveedoresBase = proveedoresResult.rows;

        // --- Resto de la función (sin cambios desde la versión anterior corregida) ---
        if (proveedoresBase.length === 0) {
            console.log("SERVICE: No providers found matching criteria.");
            return [];
        }
        const proveedorIds = proveedoresBase.map(p => p.id_proveedor);
        console.log(`SERVICE: Found ${proveedoresBase.length} base providers. IDs: ${proveedorIds.join(', ')}`);

        // 2. Obtener Partidas Asociadas
        console.log("SERVICE: Fetching associated partidas...");
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
        console.log(`SERVICE: Found ${todasLasPartidas.length} associated partidas.`);

        // 3. Obtener Artículos Asociados (usando consulta corregida anteriormente)
        console.log("SERVICE: Fetching associated active articles (articulos_proveedor)...");
        const articulosResult = await sql<ProveedorCatalogo>`
             SELECT id_articulo, id_proveedor, descripcion, unidad_medida, precio_unitario
             FROM articulos_proveedor
             WHERE id_proveedor = ANY (${proveedorIds}) AND estatus = TRUE
             ORDER BY id_proveedor, descripcion ASC;
        `;
        const todosLosArticulosDb = articulosResult.rows;
        console.log(`SERVICE: Found ${todosLosArticulosDb.length} raw active articles from DB.`);


        // 4. Combinar los datos en JavaScript
        console.log("SERVICE: Combining data...");
        const proveedoresCompletos: ProveedorCatalogo[] = proveedoresBase.map(proveedor => {

            // Filtrar partidas para este proveedor específico
            const partidasDelProveedor: PartidaProveedorCatalogo[] = todasLasPartidas
                .filter(partida => partida.id_proveedor === proveedor.id_proveedor)
                .map(p => ({ // Mapear al formato de la interfaz PartidaProveedorCatalogo
                    codigo_partida: p.codigo_partida,
                    descripcion: p.descripcion
                }));

            // Filtrar artículos para este proveedor específico Y MAPEAR a la interfaz ArticuloCatalogo
            const articulosDelProveedor: ArticuloCatalogo[] = todosLosArticulosDb
                .filter(articuloDb => articuloDb.id_proveedor === proveedor.id_proveedor)
                .map(dbRow => ({ // Mapear la fila de la BD al formato ArticuloCatalogo
                    id_articulo: dbRow.id_articulo,
                    descripcion: dbRow.descripcion,
                    unidad_medida: dbRow.unidad_medida,
                    precio_unitario: parseFloat(dbRow.precio_unitario) // Asegura que sea número
                    // Se omite id_proveedor y stock del objeto final
                }));

            // Construir el objeto final para este proveedor
            return {
                // Datos base del proveedor obtenidos en la primera consulta
                id_proveedor: proveedor.id_proveedor,
                rfc: proveedor.rfc,
                nombre_o_razon_social: proveedor.nombre_o_razon_social,
                giro_comercial: proveedor.giro_comercial,
                correo: proveedor.correo,
                telefono_uno: proveedor.telefono_uno,
                pagina_web: proveedor.pagina_web,
                // Arrays anidados de partidas y artículos filtrados/mapeados
                partidas: partidasDelProveedor,
                articulos: articulosDelProveedor,
            };
        }); // Fin del map sobre proveedoresBase

        console.log("SERVICE: Data combination complete.");
        return proveedoresCompletos;

    } catch (error: any) {
        // ... (Manejo de errores sin cambios) ...
        console.error("SERVICE ERROR in getProveedoresConDetalles:", error);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
             throw new Error(`Error de base de datos: ${error.message}. Revisa nombres de columna en la consulta SQL del servicio.`);
        }
        throw new Error(`Error al obtener el catálogo de proveedores: ${error.message}`);
    }
}; // Fin de getProveedoresConDetalles

// NOTA: Este servicio es principalmente para LEER datos para el catálogo público.
// Las funciones CREATE, UPDATE, DELETE para proveedores individuales
// probablemente pertenecerían a un servicio de administración (`adminProveedoresService.ts`)
// o al servicio propio del proveedor (`proveedorProfileService.ts`).