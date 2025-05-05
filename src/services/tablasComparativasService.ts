// src/services/tablasComparativasService.ts

import { sql, VercelPoolClient, db } from '@vercel/postgres';
import {
    TablaComparativa,
    TablaComparativaCompleta,
    TablaComparativaProveedorSnapshot,
    TablaComparativaItem,
    TablaComparativaObservacion,
    TablaComparativaFirma,
    TablaComparativaComentario,
    ProveedorEnTabla,
    CrearTablaComparativaInput,
    AgregarProveedorInput, // Asegúrate que este tipo esté actualizado (sin los campos eliminados)
    AgregarItemInput,
    ActualizarItemInput,
    AgregarObservacionInput,
    ActualizarObservacionInput,
    AgregarFirmaInput,
    AgregarComentarioInput,
    ActualizarTablaInput,
    ItemDbRow,
    ProveedorSnapshotDbRow, // Asegúrate que este tipo esté actualizado
    ObservacionDbRow,
    FirmaDbRow,
    ComentarioDbRow
} from '@/types/tablaComparativa';
import { ProveedorDetallado } from '@/types/proveedor'; // Se usa para obtener datos para el snapshot

// --- Helper Functions (Opcional, para cálculos o lógica repetitiva) ---

/**
 * Calcula los totales para un proveedor basado en sus ítems.
 * NOTA: Este es un ejemplo de cálculo en el lado del servidor. Podría hacerse en la BD también.
 * @param items - Lista de ítems del proveedor.
 * @param tasaIva - La tasa de IVA a aplicar (ej: 0.16 para 16%).
 * @returns Objeto con subtotal, iva y total.
 */
const calcularTotalesProveedor = (items: TablaComparativaItem[], tasaIva: number = 0.16) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal_item, 0);
    const iva = subtotal * tasaIva;
    const total = subtotal + iva;
    return { subtotal, iva, total };
};

/**
 * Actualiza los totales calculados en la tabla tabla_comparativa_proveedores.
 * IMPORTANTE: Esta función debe ejecutarse dentro de una transacción junto con la modificación de ítems.
 * @param client - El cliente de la transacción de base deatos.
 * @param idTablaComparativaProveedor - El ID del proveedor dentro de la tabla comparativa.
 * @param tasaIva - Tasa de IVA.
 */
const actualizarTotalesProveedorEnDB = async (
    client: VercelPoolClient,
    idTablaComparativaProveedor: number,
    tasaIva: number = 0.16
): Promise<void> => {
    console.log(`SERVICE: Recalculating totals for tabla_comparativa_proveedor ID: ${idTablaComparativaProveedor}`);
    // 1. Obtener items
    const itemsResult = await client.sql<Pick<ItemDbRow, 'cantidad' | 'precio_unitario'>>`
        SELECT cantidad, precio_unitario
        FROM tabla_comparativa_items
        WHERE id_tabla_comparativa_proveedor = ${idTablaComparativaProveedor};
    `;

    // 2. Calcular totales
    const subtotalCalculado = itemsResult.rows.reduce((sum, item) => {
        const cantidad = parseFloat(item.cantidad);
        const precio = parseFloat(item.precio_unitario);
        // Añadir chequeo por si acaso parseFloat falla
        return sum + (isNaN(cantidad) || isNaN(precio) ? 0 : cantidad * precio);
    }, 0);
    const ivaCalculado = subtotalCalculado * tasaIva;
    const totalCalculado = subtotalCalculado + ivaCalculado;
    console.log(`SERVICE: New totals calculated - Subtotal: ${subtotalCalculado}, IVA: ${ivaCalculado}, Total: ${totalCalculado}`);

    // 3. Actualizar tabla_comparativa_proveedores
    await client.sql`
        UPDATE tabla_comparativa_proveedores
        SET
            subtotal_proveedor = ${subtotalCalculado},
            iva_proveedor = ${ivaCalculado},
            total_proveedor = ${totalCalculado}
            -- *** ELIMINAR ESTA LÍNEA: ***
            -- fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ${idTablaComparativaProveedor};
    `;
    console.log(`SERVICE: Totals updated in DB for tabla_comparativa_proveedor ID: ${idTablaComparativaProveedor}`);
};


// --- Service Functions ---

/**
 * Crea una nueva Tabla Comparativa en la base de datos.
 * @param {CrearTablaComparativaInput} data - Datos básicos para la nueva tabla.
 * @returns {Promise<TablaComparativa>} La tabla comparativa recién creada.
 */
export const crearTablaComparativa = async (data: CrearTablaComparativaInput): Promise<TablaComparativa> => {
    // ... (código sin cambios)
    console.log("SERVICE: Creating new Tabla Comparativa:", data);
    const { nombre, descripcion, id_usuario_creador } = data;
    try {
        const result = await sql<TablaComparativa>`
            INSERT INTO tablas_comparativas (nombre, descripcion, id_usuario_creador)
            VALUES (${nombre}, ${descripcion}, ${id_usuario_creador})
            RETURNING *;
        `;
        if (result.rowCount === 0) throw new Error("No se pudo crear la tabla comparativa.");
        console.log(`SERVICE: Tabla Comparativa created with ID: ${result.rows[0].id}`);
        return result.rows[0];
    } catch (error: any) {
        console.error("SERVICE ERROR in crearTablaComparativa:", error);
        // Manejo específico de FK violation
        if (error.code === '23503' && error.constraint === 'tablas_comparativas_id_usuario_creador_fkey') {
            throw new Error(`Error al crear: El usuario creador con ID ${id_usuario_creador} no existe.`);
        }
        throw new Error(`Error al crear la tabla comparativa: ${error.message}`);
    }
};

/**
 * Obtiene una lista simple de todas las Tablas Comparativas.
 * @returns {Promise<TablaComparativa[]>} Lista de tablas comparativas (solo datos base).
 */
export const getTablasComparativasLista = async (): Promise<TablaComparativa[]> => {
    console.log("SERVICE: Fetching list of Tablas Comparativas");
    try {
        // Seleccionar solo los campos necesarios para la vista de lista
        const result = await sql<TablaComparativa>`
            SELECT id, nombre, estado, fecha_creacion, fecha_actualizacion
            FROM tablas_comparativas
            ORDER BY fecha_creacion DESC;
        `;
        console.log(`SERVICE: Found ${result.rowCount} Tablas Comparativas.`);
        return result.rows;
    } catch (error: any) {
        console.error("SERVICE ERROR in getTablasComparativasLista:", error);
        throw new Error(`Error al obtener la lista de tablas comparativas: ${error.message}`);
    }
};

/**
 * Obtiene todos los detalles de una Tabla Comparativa específica por su ID.
 * Incluye proveedores, sus ítems, observaciones, firmas y comentarios.
 * @param {number} idTablaComparativa - El ID de la tabla a obtener.
 * @returns {Promise<TablaComparativaCompleta | null>} Objeto completo o null si no se encuentra.
 */
export const getTablaComparativaPorId = async (idTablaComparativa: number): Promise<TablaComparativaCompleta | null> => {
    console.log(`SERVICE: Fetching full details for Tabla Comparativa ID: ${idTablaComparativa}`);
    try {
        // 1. Base
        const tablaResult = await sql<TablaComparativa>`
            SELECT * FROM tablas_comparativas WHERE id = ${idTablaComparativa};
        `;
        if (tablaResult.rowCount === 0) return null;
        const tablaBase = tablaResult.rows[0];

        // 2. Proveedores Snapshot
        const proveedoresResult = await sql<ProveedorSnapshotDbRow>`
            SELECT * FROM tabla_comparativa_proveedores
            WHERE id_tabla_comparativa = ${idTablaComparativa} ORDER BY id ASC;
        `;
        const proveedoresSnapshots = proveedoresResult.rows;
        const idProveedoresEnTabla = proveedoresSnapshots.map(p => p.id);

        // 3. Items y Observaciones (si hay proveedores)
        let items: ItemDbRow[] = [];
        let observaciones: ObservacionDbRow[] = [];
        if (idProveedoresEnTabla.length > 0) {
            const itemsResult = await sql<ItemDbRow>`
                SELECT * FROM tabla_comparativa_items
                WHERE id_tabla_comparativa_proveedor = ANY (${idProveedoresEnTabla})
                ORDER BY id_tabla_comparativa_proveedor, id ASC;
            `;
            items = itemsResult.rows;
            const observacionesResult = await sql<ObservacionDbRow>`
                SELECT * FROM tabla_comparativa_observaciones
                WHERE id_tabla_comparativa_proveedor = ANY (${idProveedoresEnTabla})
                ORDER BY id_tabla_comparativa_proveedor, id ASC;
            `;
            observaciones = observacionesResult.rows;
        }

        // 5. Firmas (Ajustar JOIN a usuarios.id_usuario si es necesario)
        const firmasResult = await sql<FirmaDbRow & { nombre_usuario?: string }>`
            SELECT tf.*, u.nombre as nombre_usuario
            FROM tabla_comparativa_firmas tf
            LEFT JOIN usuarios u ON tf.id_usuario = u.id_usuario -- <- VERIFICA ESTE JOIN
            WHERE tf.id_tabla_comparativa = ${idTablaComparativa} ORDER BY fecha_firma ASC;
        `;
        const firmas = firmasResult.rows;

        // 6. Comentarios (Ajustar JOIN a usuarios.id_usuario si es necesario)
        const comentariosResult = await sql<ComentarioDbRow & { nombre_usuario?: string }>`
            SELECT tc.*, u.nombre as nombre_usuario
            FROM tabla_comparativa_comentarios tc
            LEFT JOIN usuarios u ON tc.id_usuario = u.id_usuario -- <- VERIFICA ESTE JOIN
            WHERE tc.id_tabla_comparativa = ${idTablaComparativa} ORDER BY fecha_comentario ASC;
        `;
        const comentarios = comentariosResult.rows;

        // 7. Ensamblar
        const proveedoresCompletos: ProveedorEnTabla[] = proveedoresSnapshots.map(provSnapshot => {
            const itemsProveedor = items
                .filter(item => item.id_tabla_comparativa_proveedor === provSnapshot.id)
                .map(dbRow => ({
                    ...dbRow,
                    caracteristicas_tecnicas: dbRow.caracteristicas_tecnicas || null,
                    cantidad: parseFloat(dbRow.cantidad),
                    precio_unitario: parseFloat(dbRow.precio_unitario),
                    subtotal_item: parseFloat(dbRow.subtotal_item),
                    id_articulo_origen: dbRow.id_articulo_origen ? parseInt(dbRow.id_articulo_origen.toString(), 10) : null,
                }));
            const observacionesProveedor = observaciones
                .filter(obs => obs.id_tabla_comparativa_proveedor === provSnapshot.id)
                .map(dbRow => ({ ...dbRow, cumple: Boolean(dbRow.cumple) }));
            const proveedorConNumeros: TablaComparativaProveedorSnapshot = {
                ...provSnapshot,
                subtotal_proveedor: parseFloat(provSnapshot.subtotal_proveedor),
                iva_proveedor: parseFloat(provSnapshot.iva_proveedor),
                total_proveedor: parseFloat(provSnapshot.total_proveedor),
            };
            return { ...proveedorConNumeros, items: itemsProveedor, observaciones: observacionesProveedor };
        });

        const tablaCompleta: TablaComparativaCompleta = {
            ...tablaBase,
            proveedores: proveedoresCompletos,
            firmas: firmas.map(f => ({ ...f, id_usuario: parseInt(f.id_usuario.toString(), 10) })),
            comentarios: comentarios.map(c => ({ ...c, id_usuario: parseInt(c.id_usuario.toString(), 10) })),
        };
        console.log(`SERVICE: Successfully fetched details for Tabla ID: ${idTablaComparativa}`);
        return tablaCompleta;
    } catch (error: any) {
        console.error(`SERVICE ERROR in getTablaComparativaPorId (ID: ${idTablaComparativa}):`, error);
        throw new Error(`Error al obtener detalles: ${error.message}`);
    }
};


/**
 * Agrega un proveedor existente a una tabla comparativa, creando el registro 'snapshot'.
 * @param {AgregarProveedorInput} data - IDs de tabla y proveedor, y datos snapshot requeridos.
 * @returns {Promise<TablaComparativaProveedorSnapshot>} El registro del proveedor snapshot creado.
 */
export const agregarProveedorATabla = async (data: AgregarProveedorInput): Promise<TablaComparativaProveedorSnapshot> => {
    // Campos eliminados ya no se destructuran: atencion_de_snapshot, condiciones_pago_snapshot, tiempo_entrega_snapshot
    const {
        id_tabla_comparativa,
        id_proveedor,
        nombre_empresa_snapshot,
        rfc_snapshot,
        giro_comercial_snapshot,
        domicilio_snapshot,
        telefono_snapshot,
        correo_electronico_snapshot,
        pagina_web_snapshot,
    } = data;
    console.log(`SERVICE: Adding provider ID ${id_proveedor} to Tabla ID ${id_tabla_comparativa}`);

    try {
        // --- VALIDACIONES ADICIONALES (Opcional, FKs ayudan) ---
        // Verificar que id_tabla_comparativa existe
        const tablaCheck = await sql`SELECT 1 FROM tablas_comparativas WHERE id = ${id_tabla_comparativa}`;
        if (tablaCheck.rowCount === 0) throw new Error(`Tabla comparativa con ID ${id_tabla_comparativa} no encontrada.`);
        // Verificar que id_proveedor existe
        const provCheck = await sql`SELECT 1 FROM proveedores WHERE id_proveedor = ${id_proveedor}`; // Ajusta nombre de tabla/columna si es diferente
        if (provCheck.rowCount === 0) throw new Error(`Proveedor maestro con ID ${id_proveedor} no encontrado.`);
        // --- FIN VALIDACIONES ---


        // --- Query INSERT actualizada (sin los campos eliminados) ---
        const result = await sql<ProveedorSnapshotDbRow>`
            INSERT INTO tabla_comparativa_proveedores (
                id_tabla_comparativa, id_proveedor, nombre_empresa_snapshot, rfc_snapshot,
                giro_comercial_snapshot, domicilio_snapshot, telefono_snapshot,
                correo_electronico_snapshot, pagina_web_snapshot
                -- Los campos eliminados ya no se insertan
            ) VALUES (
                ${id_tabla_comparativa}, ${id_proveedor}, ${nombre_empresa_snapshot}, ${rfc_snapshot},
                ${giro_comercial_snapshot}, ${domicilio_snapshot}, ${telefono_snapshot},
                ${correo_electronico_snapshot}, ${pagina_web_snapshot}
            )
            RETURNING *;
        `;
        // --- Fin Query ---

        if (result.rowCount === 0) {
            throw new Error("No se pudo agregar el proveedor a la tabla comparativa.");
        }
        const row = result.rows[0];
        console.log(`SERVICE: Provider added successfully. New tabla_comparativa_proveedores ID: ${row.id}`);
        // Convertir a números antes de devolver
        return {
            ...row,
            // Asegurar que todos los campos del tipo actualizado estén aquí
            id: row.id,
            id_tabla_comparativa: row.id_tabla_comparativa,
            id_proveedor: row.id_proveedor,
            nombre_empresa_snapshot: row.nombre_empresa_snapshot,
            rfc_snapshot: row.rfc_snapshot,
            giro_comercial_snapshot: row.giro_comercial_snapshot,
            domicilio_snapshot: row.domicilio_snapshot,
            telefono_snapshot: row.telefono_snapshot,
            correo_electronico_snapshot: row.correo_electronico_snapshot,
            pagina_web_snapshot: row.pagina_web_snapshot,
            // Convertir totales
            subtotal_proveedor: parseFloat(row.subtotal_proveedor),
            iva_proveedor: parseFloat(row.iva_proveedor),
            total_proveedor: parseFloat(row.total_proveedor),
        };

    } catch (error: any) {
        // Manejar error de llave única
        if (error.code === '23505' && error.constraint === 'tabla_comparativa_proveedores_id_tabla_comparativa_id_provee_key') { // Ajusta el nombre exacto del constraint si es diferente
            console.error(`SERVICE ERROR: Provider ${id_proveedor} already exists in Tabla ${id_tabla_comparativa}.`);
            throw new Error(`El proveedor seleccionado ya existe en esta tabla comparativa.`);
        }
        // Manejar error de FK (si las validaciones previas fallan o hay concurrencia)
        if (error.code === '23503') {
            console.error("SERVICE ERROR FK violation:", error);
            if (error.constraint === 'tabla_comparativa_proveedores_id_tabla_comparativa_fkey') throw new Error(`La tabla comparativa ID ${id_tabla_comparativa} no existe.`);
            if (error.constraint === 'tabla_comparativa_proveedores_id_proveedor_fkey') throw new Error(`El proveedor maestro ID ${id_proveedor} no existe.`); // Ajusta nombre de constraint
            throw new Error(`Error de referencia: ${error.detail || error.message}`);
        }
        console.error("SERVICE ERROR in agregarProveedorATabla:", error);
        throw new Error(`Error al agregar el proveedor: ${error.message}`);
    }
};

/**
 * Agrega un ítem a un proveedor dentro de una tabla comparativa.
 * IMPORTANTE: Esta operación debe ser transaccional para actualizar los totales del proveedor.
 * @param {AgregarItemInput} data - Datos del ítem a agregar.
 * @returns {Promise<TablaComparativaItem>} El ítem recién creado.
 */
export const agregarItemAProveedor = async (data: AgregarItemInput): Promise<TablaComparativaItem> => {
    const {
        id_tabla_comparativa_proveedor,
        id_articulo_origen,
        codigo_partida_origen,
        descripcion_item,
        caracteristicas_tecnicas,
        udm,
        cantidad,
        precio_unitario,
    } = data;
    console.log(`SERVICE: Adding item to tabla_comparativa_proveedor ID: ${id_tabla_comparativa_proveedor}`);

    // Calcular subtotal
    const subtotal_item = cantidad * precio_unitario;

    // Usar transacción
    const client = await db.connect();
    try {
        await client.sql`BEGIN`; // Iniciar transacción

        const result = await client.sql<ItemDbRow>`
            INSERT INTO tabla_comparativa_items (
                id_tabla_comparativa_proveedor, id_articulo_origen, codigo_partida_origen,
                descripcion_item, caracteristicas_tecnicas, udm, cantidad,
                precio_unitario, subtotal_item
            ) VALUES (
                ${id_tabla_comparativa_proveedor}, ${id_articulo_origen}, ${codigo_partida_origen},
                ${descripcion_item}, ${JSON.stringify(caracteristicas_tecnicas || null)}, ${udm}, ${cantidad},
                ${precio_unitario}, ${subtotal_item}
            )
            RETURNING *;
        `;

        if (result.rowCount === 0) {
            throw new Error("No se pudo agregar el ítem.");
        }
        const newItemDb = result.rows[0];
        console.log(`SERVICE: Item added successfully. New tabla_comparativa_items ID: ${newItemDb.id}`);

        // Actualizar totales del proveedor DENTRO de la misma transacción
        await actualizarTotalesProveedorEnDB(client, id_tabla_comparativa_proveedor);

        await client.sql`COMMIT`; // Confirmar transacción

        // Convertir tipos antes de devolver
        return {
            ...newItemDb,
            caracteristicas_tecnicas: newItemDb.caracteristicas_tecnicas || null,
            cantidad: parseFloat(newItemDb.cantidad),
            precio_unitario: parseFloat(newItemDb.precio_unitario),
            subtotal_item: parseFloat(newItemDb.subtotal_item),
            id_articulo_origen: newItemDb.id_articulo_origen ? parseInt(newItemDb.id_articulo_origen.toString(), 10) : null,
        };

    } catch (error: any) {
        await client.sql`ROLLBACK`; // Revertir transacción en caso de error
        console.error("SERVICE ERROR in agregarItemAProveedor:", error);
        throw new Error(`Error al agregar el ítem: ${error.message}`);
    } finally {
        client.release(); // Liberar cliente
    }
};

/**
 * Actualiza un ítem existente.
 * IMPORTANTE: Operación transaccional para actualizar totales.
 * @param {number} idItem - ID del ítem a actualizar.
 * @param {ActualizarItemInput} data - Datos a actualizar.
 * @returns {Promise<TablaComparativaItem>} El ítem actualizado.
 */
export const actualizarItem = async (idItem: number, data: ActualizarItemInput): Promise<TablaComparativaItem> => {
    console.log(`SERVICE: Updating item ID: ${idItem}`);
    const { descripcion_item, caracteristicas_tecnicas, udm, cantidad, precio_unitario } = data;

    // Recalcular subtotal si cantidad o precio cambian
    const subtotal_item = (cantidad !== undefined && precio_unitario !== undefined)
        ? cantidad * precio_unitario
        : undefined; // Si no se actualizan ambos, no recalculamos aquí directamente

    const client = await db.connect();
    try {
        await client.sql`BEGIN`;

        // 1. Obtener el ID del proveedor asociado a este item ANTES de actualizar
        const itemInfoResult = await client.sql<{ id_tabla_comparativa_proveedor: number }>`
            SELECT id_tabla_comparativa_proveedor FROM tabla_comparativa_items WHERE id = ${idItem};
        `;
        if (itemInfoResult.rowCount === 0) {
            throw new Error(`Ítem con ID ${idItem} no encontrado.`);
        }
        const idTablaComparativaProveedor = itemInfoResult.rows[0].id_tabla_comparativa_proveedor;

        // 2. Construir la query de actualización dinámicamente (solo actualiza campos proporcionados)
        // Esto es más complejo con `sql` template, considera usar `sql.query` o un query builder
        // Ejemplo simplificado (actualiza todo si se proporciona):
        const updateResult = await client.sql<ItemDbRow>`
            UPDATE tabla_comparativa_items SET
                descripcion_item = COALESCE(${descripcion_item}, descripcion_item),
                caracteristicas_tecnicas = ${JSON.stringify(caracteristicas_tecnicas === undefined ? null : (caracteristicas_tecnicas || null))}, -- Manejar undefined y null
                udm = COALESCE(${udm}, udm),
                cantidad = COALESCE(${cantidad?.toString()}, cantidad), -- Convertir a string si se proporciona
                precio_unitario = COALESCE(${precio_unitario?.toString()}, precio_unitario), -- Convertir a string si se proporciona
                subtotal_item = COALESCE(${subtotal_item?.toString()}, subtotal_item) -- Convertir a string si se proporciona
            WHERE id = ${idItem}
            RETURNING *;
        `;
        // **Nota:** El COALESCE en caracteristicas_tecnicas puede ser problemático si quieres ponerlo a NULL explícitamente.
        // Se necesitaría una lógica más avanzada o pasar NULL directamente si esa es la intención.

        if (updateResult.rowCount === 0) {
            throw new Error(`No se pudo actualizar el ítem con ID ${idItem}.`);
        }
        const updatedItemDb = updateResult.rows[0];
        console.log(`SERVICE: Item ID ${idItem} updated.`);

        // 3. Actualizar totales del proveedor si cantidad o precio cambiaron
        if (cantidad !== undefined || precio_unitario !== undefined) {
            await actualizarTotalesProveedorEnDB(client, idTablaComparativaProveedor);
        }

        await client.sql`COMMIT`;

        // Convertir tipos antes de devolver
        return {
            ...updatedItemDb,
            caracteristicas_tecnicas: updatedItemDb.caracteristicas_tecnicas || null,
            cantidad: parseFloat(updatedItemDb.cantidad),
            precio_unitario: parseFloat(updatedItemDb.precio_unitario),
            subtotal_item: parseFloat(updatedItemDb.subtotal_item),
            id_articulo_origen: updatedItemDb.id_articulo_origen ? parseInt(updatedItemDb.id_articulo_origen.toString(), 10) : null,
        };

    } catch (error: any) {
        await client.sql`ROLLBACK`;
        console.error(`SERVICE ERROR in actualizarItem (ID: ${idItem}):`, error);
        throw new Error(`Error al actualizar el ítem: ${error.message}`);
    } finally {
        client.release();
    }
};


/**
 * Elimina un ítem de una tabla comparativa.
 * IMPORTANTE: Operación transaccional para actualizar totales.
 * @param {number} idItem - ID del ítem a eliminar.
 * @returns {Promise<void>}
 */
export const eliminarItem = async (idItem: number): Promise<void> => {
    console.log(`SERVICE: Deleting item ID: ${idItem}`);
    const client = await db.connect();
    try {
        await client.sql`BEGIN`;

        // 1. Obtener el ID del proveedor asociado ANTES de borrar
        const itemInfoResult = await client.sql<{ id_tabla_comparativa_proveedor: number }>`
            SELECT id_tabla_comparativa_proveedor FROM tabla_comparativa_items WHERE id = ${idItem};
        `;
        if (itemInfoResult.rowCount === 0) {
            // El item ya no existe, podemos considerar la operación exitosa o lanzar error
            console.warn(`SERVICE: Item ID ${idItem} not found for deletion, potentially already deleted.`);
            await client.sql`ROLLBACK`; // No hay nada que hacer
            return;
            // O: throw new Error(`Ítem con ID ${idItem} no encontrado.`);
        }
        const idTablaComparativaProveedor = itemInfoResult.rows[0].id_tabla_comparativa_proveedor;

        // 2. Eliminar el ítem
        const deleteResult = await client.sql`
            DELETE FROM tabla_comparativa_items WHERE id = ${idItem};
        `;

        if (deleteResult.rowCount === 0) {
            // Esto no debería pasar si la SELECT anterior funcionó, pero por si acaso
            throw new Error(`No se pudo eliminar el ítem con ID ${idItem}.`);
        }
        console.log(`SERVICE: Item ID ${idItem} deleted.`);

        // 3. Actualizar totales del proveedor
        await actualizarTotalesProveedorEnDB(client, idTablaComparativaProveedor);

        await client.sql`COMMIT`;

    } catch (error: any) {
        await client.sql`ROLLBACK`;
        console.error(`SERVICE ERROR in eliminarItem (ID: ${idItem}):`, error);
        throw new Error(`Error al eliminar el ítem: ${error.message}`);
    } finally {
        client.release();
    }
};

/**
 * Elimina un proveedor (y todos sus ítems/observaciones asociados por CASCADE) de una tabla comparativa.
 * @param {number} idTablaComparativaProveedor - El ID del registro en tabla_comparativa_proveedores a eliminar.
 * @returns {Promise<void>}
 */
export const eliminarProveedorDeTabla = async (idTablaComparativaProveedor: number): Promise<void> => {
    // ... (código sin cambios)
    console.log(`SERVICE: Removing provider snapshot ID: ${idTablaComparativaProveedor}`);
    try {
        const result = await sql`
            DELETE FROM tabla_comparativa_proveedores WHERE id = ${idTablaComparativaProveedor};
        `;
        if (result.rowCount === 0) {
            // Considerar esto como éxito silencioso o lanzar un error 404
            console.warn(`SERVICE: Provider snapshot ID ${idTablaComparativaProveedor} not found for deletion.`);
            throw new Error(`Registro de proveedor en tabla comparativa con ID ${idTablaComparativaProveedor} no encontrado.`);
        } else {
            console.log(`SERVICE: Provider snapshot ID ${idTablaComparativaProveedor} deleted successfully.`);
        }
    } catch (error: any) {
        console.error(`SERVICE ERROR in eliminarProveedorDeTabla (ID: ${idTablaComparativaProveedor}):`, error);
        throw new Error(`Error al eliminar el proveedor de la tabla: ${error.message}`);
    }
};

/**
 * Elimina una tabla comparativa completa (y todos sus datos asociados por CASCADE).
 * ¡Usar con precaución!
 * @param {number} idTablaComparativa - ID de la tabla a eliminar.
 * @returns {Promise<void>}
 */
export const eliminarTablaComparativa = async (idTablaComparativa: number): Promise<void> => {
    console.warn(`SERVICE: Attempting to DELETE Tabla Comparativa ID: ${idTablaComparativa}. This is permanent!`);
    try {
        const result = await sql`
            DELETE FROM tablas_comparativas WHERE id = ${idTablaComparativa};
        `;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Tabla Comparativa ID ${idTablaComparativa} not found for deletion.`);
            // Opcional: throw new Error(...)
        } else {
            console.log(`SERVICE: Tabla Comparativa ID ${idTablaComparativa} deleted successfully.`);
        }
    } catch (error: any) {
        console.error(`SERVICE ERROR in eliminarTablaComparativa (ID: ${idTablaComparativa}):`, error);
        throw new Error(`Error al eliminar la tabla comparativa: ${error.message}`);
    }
};


/**
 * Actualiza los datos básicos de una tabla comparativa (nombre, descripción, estado).
 * @param {number} idTablaComparativa - ID de la tabla a actualizar.
 * @param {ActualizarTablaInput} data - Campos a actualizar.
 * @returns {Promise<TablaComparativa>} La tabla actualizada.
 */
export const actualizarTablaComparativa = async (idTablaComparativa: number, data: ActualizarTablaInput): Promise<TablaComparativa> => {
    console.log(`SERVICE: Updating Tabla Comparativa ID: ${idTablaComparativa}`);
    const { nombre, descripcion, estado } = data;
    // Solo actualizaremos campos que vengan definidos
    const fieldsToUpdate: string[] = [];
    const values: (string | number | null | undefined)[] = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
        fieldsToUpdate.push(`nombre = $${paramIndex++}`);
        values.push(nombre);
    }
    if (descripcion !== undefined) {
        fieldsToUpdate.push(`descripcion = $${paramIndex++}`);
        values.push(descripcion);
    }
    if (estado !== undefined) {
        fieldsToUpdate.push(`estado = $${paramIndex++}`);
        values.push(estado);
    }

    // Siempre actualizamos la fecha de modificación
    fieldsToUpdate.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    if (fieldsToUpdate.length === 1) { // Solo se actualiza la fecha
        console.warn(`SERVICE: No fields provided to update for Tabla Comparativa ID: ${idTablaComparativa}, only timestamp will be updated if record exists.`);
        // Podríamos optar por no hacer nada si no hay campos reales que actualizar
        const currentData = await sql<TablaComparativa>`SELECT * FROM tablas_comparativas WHERE id = ${idTablaComparativa}`;
        if (currentData.rowCount === 0) throw new Error(`Tabla comparativa con ID ${idTablaComparativa} no encontrada.`);
        return currentData.rows[0];
    }

    values.push(idTablaComparativa); // El último parámetro es el ID para el WHERE

    const queryText = `
        UPDATE tablas_comparativas
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
    `;

    try {
        // Usamos sql.query para pasar parámetros dinámicos
        const result = await sql.query<TablaComparativa>(queryText, values);

        if (result.rowCount === 0) {
            throw new Error(`Tabla comparativa con ID ${idTablaComparativa} no encontrada para actualizar.`);
        }
        console.log(`SERVICE: Tabla Comparativa ID ${idTablaComparativa} updated successfully.`);
        return result.rows[0];
    } catch (error: any) {
        console.error(`SERVICE ERROR in actualizarTablaComparativa (ID: ${idTablaComparativa}):`, error);
        // Validar error de CHECK constraint para 'estado' si aplica
        if (error.message.includes('violates check constraint "tablas_comparativas_estado_check"')) {
            throw new Error(`Estado inválido proporcionado: ${estado}`);
        }
        throw new Error(`Error al actualizar la tabla comparativa: ${error.message}`);
    }
};


// --- Funciones para Observaciones, Firmas, Comentarios (CRUD Básico) ---

// OBSERVACIONES
export const agregarObservacion = async (data: AgregarObservacionInput): Promise<TablaComparativaObservacion> => {
    // ... (código sin cambios)
    console.log(`SERVICE: Adding observation for proveedor snapshot ${data.id_tabla_comparativa_proveedor}`);
    try {
        // Validación adicional (opcional): Verificar que id_tabla_comparativa_proveedor existe
        const checkProv = await sql`SELECT 1 FROM tabla_comparativa_proveedores WHERE id = ${data.id_tabla_comparativa_proveedor}`;
        if (checkProv.rowCount === 0) throw new Error(`El proveedor (ID en tabla: ${data.id_tabla_comparativa_proveedor}) no existe en ninguna tabla comparativa.`);
        // Podrías añadir una validación más compleja para asegurar que pertenece a la tabla correcta si tuvieras idTabla aquí

        const result = await sql<ObservacionDbRow>`
            INSERT INTO tabla_comparativa_observaciones (id_tabla_comparativa_proveedor, descripcion_validacion, cumple, comentario_adicional)
            VALUES (${data.id_tabla_comparativa_proveedor}, ${data.descripcion_validacion}, ${data.cumple}, ${data.comentario_adicional})
            RETURNING *;
        `;
        if (result.rowCount === 0) throw new Error("No se pudo agregar la observación.");
        const row = result.rows[0];
        return { ...row, cumple: Boolean(row.cumple) };
    } catch (error: any) {
        console.error("SERVICE ERROR in agregarObservacion:", error);
        if (error.code === '23503') { // Error de FK
            throw new Error(`Error al agregar observación: El proveedor asociado (ID en tabla: ${data.id_tabla_comparativa_proveedor}) no existe.`);
        }
        throw new Error(`Error al agregar la observación: ${error.message}`);
    }
};

export const actualizarObservacion = async (idObservacion: number, data: ActualizarObservacionInput): Promise<TablaComparativaObservacion> => {
    console.log(`SERVICE: Updating observation ID: ${idObservacion}`);
    const { descripcion_validacion, cumple, comentario_adicional } = data;
    // Lógica similar a actualizarTablaComparativa para construir query dinámica
    const fieldsToUpdate: string[] = [];
    const values: (string | boolean | null | undefined)[] = [];
    let paramIndex = 1;

    if (descripcion_validacion !== undefined) { fieldsToUpdate.push(`descripcion_validacion = $${paramIndex++}`); values.push(descripcion_validacion); }
    if (cumple !== undefined) { fieldsToUpdate.push(`cumple = $${paramIndex++}`); values.push(cumple); }
    if (comentario_adicional !== undefined) { fieldsToUpdate.push(`comentario_adicional = $${paramIndex++}`); values.push(comentario_adicional); }

    if (fieldsToUpdate.length === 0) {
        const currentData = await sql<ObservacionDbRow>`SELECT * FROM tabla_comparativa_observaciones WHERE id = ${idObservacion}`;
        if (currentData.rowCount === 0) throw new Error(`Observación con ID ${idObservacion} no encontrada.`);
        return { ...currentData.rows[0], cumple: Boolean(currentData.rows[0].cumple) };
    }
    values.push(idObservacion);
    const queryText = `UPDATE tabla_comparativa_observaciones SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;

    try {
        const result = await sql.query<ObservacionDbRow>(queryText, values);
        if (result.rowCount === 0) throw new Error(`Observación con ID ${idObservacion} no encontrada para actualizar.`);
        const row = result.rows[0];
        return { ...row, cumple: Boolean(row.cumple) };
    } catch (error: any) {
        console.error(`SERVICE ERROR in actualizarObservacion (ID: ${idObservacion}):`, error);
        throw new Error(`Error al actualizar la observación: ${error.message}`);
    }
};

export const eliminarObservacion = async (idObservacion: number): Promise<void> => {
    // ... (código sin cambios)
    console.log(`SERVICE: Deleting observation ID: ${idObservacion}`);
    try {
        const result = await sql`DELETE FROM tabla_comparativa_observaciones WHERE id = ${idObservacion};`;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Observation ID ${idObservacion} not found for deletion.`);
            throw new Error(`Observación con ID ${idObservacion} no encontrada.`);
        }
    } catch (error: any) {
        console.error(`SERVICE ERROR in eliminarObservacion (ID: ${idObservacion}):`, error);
        throw new Error(`Error al eliminar la observación: ${error.message}`);
    }
};

// FIRMAS
export const agregarFirma = async (data: AgregarFirmaInput): Promise<TablaComparativaFirma> => {
    // ... (código sin cambios, FKs manejan validación de tabla/usuario)
    console.log(`SERVICE: Adding firma for tabla ${data.id_tabla_comparativa} by user ${data.id_usuario}`);
    try {
        // Validaciones adicionales (opcional)
        const tablaCheck = await sql`SELECT 1 FROM tablas_comparativas WHERE id = ${data.id_tabla_comparativa}`;
        if (tablaCheck.rowCount === 0) throw new Error(`Tabla comparativa ID ${data.id_tabla_comparativa} no encontrada.`);
        const userCheck = await sql`SELECT 1 FROM usuarios WHERE id_usuario = ${data.id_usuario}`; // Ajusta tabla/columna usuario
        if (userCheck.rowCount === 0) throw new Error(`Usuario ID ${data.id_usuario} no encontrado.`);

        const result = await sql<FirmaDbRow>`
            INSERT INTO tabla_comparativa_firmas (id_tabla_comparativa, id_usuario, tipo_firma, comentario_firma)
            VALUES (${data.id_tabla_comparativa}, ${data.id_usuario}, ${data.tipo_firma}, ${data.comentario_firma})
            RETURNING *;
        `;
        if (result.rowCount === 0) throw new Error("No se pudo agregar la firma.");
        // Convertir id_usuario a número por si acaso
        const row = result.rows[0];
        return { ...row, id_usuario: parseInt(row.id_usuario.toString(), 10) };
    } catch (error: any) {
        console.error("SERVICE ERROR in agregarFirma:", error);
        if (error.code === '23503') { // Error de FK
            throw new Error(`Error al agregar firma: La tabla o el usuario no existen.`);
        }
        throw new Error(`Error al agregar la firma: ${error.message}`);
    }
};

export const eliminarFirma = async (idFirma: number): Promise<void> => {
    // ... (código sin cambios)
    console.log(`SERVICE: Deleting firma ID: ${idFirma}`);
    try {
        const result = await sql`DELETE FROM tabla_comparativa_firmas WHERE id = ${idFirma};`;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Firma ID ${idFirma} not found for deletion.`);
            throw new Error(`Firma con ID ${idFirma} no encontrada.`);
        }
    } catch (error: any) {
        console.error(`SERVICE ERROR in eliminarFirma (ID: ${idFirma}):`, error);
        throw new Error(`Error al eliminar la firma: ${error.message}`);
    }
};


// COMENTARIOS
export const agregarComentario = async (data: AgregarComentarioInput): Promise<TablaComparativaComentario> => {
    // ... (código sin cambios, similar a agregarFirma)
    console.log(`SERVICE: Adding comentario for tabla ${data.id_tabla_comparativa} by user ${data.id_usuario}`);
    try {
        // Validaciones adicionales (opcional)
        const tablaCheck = await sql`SELECT 1 FROM tablas_comparativas WHERE id = ${data.id_tabla_comparativa}`;
        if (tablaCheck.rowCount === 0) throw new Error(`Tabla comparativa ID ${data.id_tabla_comparativa} no encontrada.`);
        const userCheck = await sql`SELECT 1 FROM usuarios WHERE id_usuario = ${data.id_usuario}`; // Ajusta tabla/columna usuario
        if (userCheck.rowCount === 0) throw new Error(`Usuario ID ${data.id_usuario} no encontrado.`);

        const result = await sql<ComentarioDbRow>`
            INSERT INTO tabla_comparativa_comentarios (id_tabla_comparativa, id_usuario, texto_comentario)
            VALUES (${data.id_tabla_comparativa}, ${data.id_usuario}, ${data.texto_comentario})
            RETURNING *;
        `;
        if (result.rowCount === 0) throw new Error("No se pudo agregar el comentario.");
        // Convertir id_usuario a número por si acaso
        const row = result.rows[0];
        return { ...row, id_usuario: parseInt(row.id_usuario.toString(), 10) };
    } catch (error: any) {
        console.error("SERVICE ERROR in agregarComentario:", error);
        if (error.code === '23503') { // Error de FK
            throw new Error(`Error al agregar comentario: La tabla o el usuario no existen.`);
        }
        throw new Error(`Error al agregar el comentario: ${error.message}`);
    }
};

export const eliminarComentario = async (idComentario: number): Promise<void> => {
    // ... (código sin cambios)
    console.log(`SERVICE: Deleting comentario ID: ${idComentario}`);
    try {
        const result = await sql`DELETE FROM tabla_comparativa_comentarios WHERE id = ${idComentario};`;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Comentario ID ${idComentario} not found for deletion.`);
            throw new Error(`Comentario con ID ${idComentario} no encontrado.`);
        }
    } catch (error: any) {
        console.error(`SERVICE ERROR in eliminarComentario (ID: ${idComentario}):`, error);
        throw new Error(`Error al eliminar el comentario: ${error.message}`);
    }
};