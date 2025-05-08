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
    AgregarProveedorInput,
    AgregarItemInput,
    ActualizarItemInput,
    AgregarObservacionInput,
    ActualizarObservacionInput,
    AgregarFirmaInput,
    AgregarComentarioInput,
    ActualizarTablaInput,
    ItemDbRow,
    ProveedorSnapshotDbRow,
    ObservacionDbRow,
    FirmaDbRow,
    ComentarioDbRow
} from '@/types/tablaComparativa';
// ProveedorDetallado no se usa, se elimina la importación.

// --- Helper Functions (Opcional, para cálculos o lógica repetitiva) ---

/**
 * Calcula los totales para un proveedor basado en sus ítems.
 * NOTA: Este es un ejemplo de cálculo en el lado del servidor. Podría hacerse en la BD también.
 * @param items - Lista de ítems del proveedor.
 * @param tasaIva - La tasa de IVA a aplicar (ej: 0.16 para 16%).
 * @returns Objeto con subtotal, iva y total.
 * const calcularTotalesProveedor = (items: TablaComparativaItem[], tasaIva: number = 0.16) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal_item, 0);
    const iva = subtotal * tasaIva;
    const total = subtotal + iva;
    return { subtotal, iva, total };
};
 */


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
    const itemsResult = await client.sql<Pick<ItemDbRow, 'cantidad' | 'precio_unitario'>>`
        SELECT cantidad, precio_unitario
        FROM tabla_comparativa_items
        WHERE id_tabla_comparativa_proveedor = ${idTablaComparativaProveedor};
    `;

    const subtotalCalculado = itemsResult.rows.reduce((sum, item) => {
        const cantidad = parseFloat(item.cantidad);
        const precio = parseFloat(item.precio_unitario);
        return sum + (isNaN(cantidad) || isNaN(precio) ? 0 : cantidad * precio);
    }, 0);
    const ivaCalculado = subtotalCalculado * tasaIva;
    const totalCalculado = subtotalCalculado + ivaCalculado;
    console.log(`SERVICE: New totals calculated - Subtotal: ${subtotalCalculado}, IVA: ${ivaCalculado}, Total: ${totalCalculado}`);

    await client.sql`
        UPDATE tabla_comparativa_proveedores
        SET
            subtotal_proveedor = ${subtotalCalculado},
            iva_proveedor = ${ivaCalculado},
            total_proveedor = ${totalCalculado}
        WHERE id = ${idTablaComparativaProveedor};
    `;
    console.log(`SERVICE: Totals updated in DB for tabla_comparativa_proveedor ID: ${idTablaComparativaProveedor}`);
};


// --- Service Functions ---

export const crearTablaComparativa = async (data: CrearTablaComparativaInput): Promise<TablaComparativa> => {
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
    } catch (errUnknown: unknown) {
        console.error("SERVICE ERROR in crearTablaComparativa:", errUnknown);
        let message = "Error desconocido al crear la tabla comparativa.";
        let code: string | undefined;
        let constraint: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.constraint === 'string') constraint = errAsAny.constraint;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }

        if (code === '23503' && constraint === 'tablas_comparativas_id_usuario_creador_fkey') {
            throw new Error(`Error al crear: El usuario creador con ID ${id_usuario_creador} no existe.`);
        }
        throw new Error(`Error al crear la tabla comparativa: ${message}`);
    }
};

export const getTablasComparativasLista = async (): Promise<TablaComparativa[]> => {
    console.log("SERVICE: Fetching list of Tablas Comparativas");
    try {
        const result = await sql<TablaComparativa>`
            SELECT id, nombre, estado, fecha_creacion, fecha_actualizacion
            FROM tablas_comparativas
            ORDER BY fecha_creacion DESC;
        `;
        console.log(`SERVICE: Found ${result.rowCount} Tablas Comparativas.`);
        return result.rows;
    } catch (errUnknown: unknown) {
        console.error("SERVICE ERROR in getTablasComparativasLista:", errUnknown);
        let message = "Error desconocido al obtener la lista de tablas comparativas.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al obtener la lista de tablas comparativas: ${message}`);
    }
};

export const getTablaComparativaPorId = async (idTablaComparativa: number): Promise<TablaComparativaCompleta | null> => {
    console.log(`SERVICE: Fetching full details for Tabla Comparativa ID: ${idTablaComparativa}`);
    try {
        const tablaResult = await sql<TablaComparativa>`
            SELECT * FROM tablas_comparativas WHERE id = ${idTablaComparativa};
        `;
        if (tablaResult.rowCount === 0) return null;
        const tablaBase = tablaResult.rows[0];

        const proveedoresResult = await sql<ProveedorSnapshotDbRow>`
            SELECT * FROM tabla_comparativa_proveedores
            WHERE id_tabla_comparativa = ${idTablaComparativa} ORDER BY id ASC;
        `;
        const proveedoresSnapshots = proveedoresResult.rows;
        const idProveedoresEnTabla = proveedoresSnapshots.map(p => p.id);

        let items: ItemDbRow[] = [];
        let observaciones: ObservacionDbRow[] = [];
        if (idProveedoresEnTabla.length > 0) {
            const itemsResult = await sql<ItemDbRow>`
                SELECT * FROM tabla_comparativa_items
                WHERE id_tabla_comparativa_proveedor = ANY (${idProveedoresEnTabla as any})
                ORDER BY id_tabla_comparativa_proveedor, id ASC;
            `;
            items = itemsResult.rows;
            const observacionesResult = await sql<ObservacionDbRow>`
                SELECT * FROM tabla_comparativa_observaciones
                WHERE id_tabla_comparativa_proveedor = ANY (${idProveedoresEnTabla as any})
                ORDER BY id_tabla_comparativa_proveedor, id ASC;
            `;
            observaciones = observacionesResult.rows;
        }

        const firmasResult = await sql<FirmaDbRow & { nombre_usuario?: string }>`
            SELECT tf.*, u.nombre as nombre_usuario
            FROM tabla_comparativa_firmas tf
            LEFT JOIN usuarios u ON tf.id_usuario = u.id_usuario
            WHERE tf.id_tabla_comparativa = ${idTablaComparativa} ORDER BY fecha_firma ASC;
        `;
        const firmas = firmasResult.rows;

        const comentariosResult = await sql<ComentarioDbRow & { nombre_usuario?: string }>`
            SELECT tc.*, u.nombre as nombre_usuario
            FROM tabla_comparativa_comentarios tc
            LEFT JOIN usuarios u ON tc.id_usuario = u.id_usuario
            WHERE tc.id_tabla_comparativa = ${idTablaComparativa} ORDER BY fecha_comentario ASC;
        `;
        const comentarios = comentariosResult.rows;

        const proveedoresCompletos: ProveedorEnTabla[] = proveedoresSnapshots.map(provSnapshot => {
            const itemsProveedor = items
                .filter(item => item.id_tabla_comparativa_proveedor === provSnapshot.id)
                .map(dbRow => ({
                    ...dbRow,
                    caracteristicas_tecnicas: (typeof dbRow.caracteristicas_tecnicas === 'string' ? JSON.parse(dbRow.caracteristicas_tecnicas) : dbRow.caracteristicas_tecnicas) || null,
                    cantidad: parseFloat(dbRow.cantidad),
                    precio_unitario: parseFloat(dbRow.precio_unitario),
                    subtotal_item: parseFloat(dbRow.subtotal_item),
                    id_articulo_origen: dbRow.id_articulo_origen ? parseInt(dbRow.id_articulo_origen.toString(), 10) : null,
                }));
            const observacionesProveedor = observaciones
                .filter(obs => obs.id_tabla_comparativa_proveedor === provSnapshot.id)
                .map(dbRow => ({ ...dbRow, cumple: dbRow.cumple === 'true' || dbRow.cumple === true })); // Ajuste para boolean desde DB
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
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in getTablaComparativaPorId (ID: ${idTablaComparativa}):`, errUnknown);
        let message = "Error desconocido al obtener detalles.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al obtener detalles: ${message}`);
    }
};

export const agregarProveedorATabla = async (data: AgregarProveedorInput): Promise<TablaComparativaProveedorSnapshot> => {
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
        const tablaCheck = await sql`SELECT 1 FROM tablas_comparativas WHERE id = ${id_tabla_comparativa}`;
        if (tablaCheck.rowCount === 0) throw new Error(`Tabla comparativa con ID ${id_tabla_comparativa} no encontrada.`);
        const provCheck = await sql`SELECT 1 FROM proveedores WHERE id_proveedor = ${id_proveedor}`;
        if (provCheck.rowCount === 0) throw new Error(`Proveedor maestro con ID ${id_proveedor} no encontrado.`);

        const result = await sql<ProveedorSnapshotDbRow>`
            INSERT INTO tabla_comparativa_proveedores (
                id_tabla_comparativa, id_proveedor, nombre_empresa_snapshot, rfc_snapshot,
                giro_comercial_snapshot, domicilio_snapshot, telefono_snapshot,
                correo_electronico_snapshot, pagina_web_snapshot
            ) VALUES (
                ${id_tabla_comparativa}, ${id_proveedor}, ${nombre_empresa_snapshot}, ${rfc_snapshot},
                ${giro_comercial_snapshot}, ${domicilio_snapshot}, ${telefono_snapshot},
                ${correo_electronico_snapshot}, ${pagina_web_snapshot}
            )
            RETURNING *;
        `;

        if (result.rowCount === 0) {
            throw new Error("No se pudo agregar el proveedor a la tabla comparativa.");
        }
        const row = result.rows[0];
        console.log(`SERVICE: Provider added successfully. New tabla_comparativa_proveedores ID: ${row.id}`);
        return {
            ...row,
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
            subtotal_proveedor: parseFloat(row.subtotal_proveedor),
            iva_proveedor: parseFloat(row.iva_proveedor),
            total_proveedor: parseFloat(row.total_proveedor),
        };

    } catch (errUnknown: unknown) {
        console.error("SERVICE ERROR in agregarProveedorATabla:", errUnknown);
        let message = "Error desconocido al agregar el proveedor.";
        let code: string | undefined;
        let constraint: string | undefined;
        let detail: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.constraint === 'string') constraint = errAsAny.constraint;
            if (typeof errAsAny.detail === 'string') detail = errAsAny.detail;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }

        if (code === '23505' && constraint === 'tabla_comparativa_proveedores_id_tabla_comparativa_id_provee_key') {
            console.error(`SERVICE ERROR: Provider ${id_proveedor} already exists in Tabla ${id_tabla_comparativa}.`);
            throw new Error(`El proveedor seleccionado ya existe en esta tabla comparativa.`);
        }
        if (code === '23503') {
            console.error("SERVICE ERROR FK violation:", errUnknown);
            if (constraint === 'tabla_comparativa_proveedores_id_tabla_comparativa_fkey') throw new Error(`La tabla comparativa ID ${id_tabla_comparativa} no existe.`);
            if (constraint === 'tabla_comparativa_proveedores_id_proveedor_fkey') throw new Error(`El proveedor maestro ID ${id_proveedor} no existe.`);
            throw new Error(`Error de referencia: ${detail || message}`);
        }
        throw new Error(`Error al agregar el proveedor: ${message}`);
    }
};

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

    const subtotal_item = cantidad * precio_unitario;
    const client = await db.connect();
    try {
        await client.sql`BEGIN`;

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

        await actualizarTotalesProveedorEnDB(client, id_tabla_comparativa_proveedor);
        await client.sql`COMMIT`;

        return {
            ...newItemDb,
            caracteristicas_tecnicas: (typeof newItemDb.caracteristicas_tecnicas === 'string' ? JSON.parse(newItemDb.caracteristicas_tecnicas) : newItemDb.caracteristicas_tecnicas) || null,
            cantidad: parseFloat(newItemDb.cantidad),
            precio_unitario: parseFloat(newItemDb.precio_unitario),
            subtotal_item: parseFloat(newItemDb.subtotal_item),
            id_articulo_origen: newItemDb.id_articulo_origen ? parseInt(newItemDb.id_articulo_origen.toString(), 10) : null,
        };

    } catch (errUnknown: unknown) {
        await client.sql`ROLLBACK`;
        console.error("SERVICE ERROR in agregarItemAProveedor:", errUnknown);
        let message = "Error desconocido al agregar el ítem.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al agregar el ítem: ${message}`);
    } finally {
        client.release();
    }
};

export const actualizarItem = async (idItem: number, data: ActualizarItemInput): Promise<TablaComparativaItem> => {
    console.log(`SERVICE: Updating item ID: ${idItem}`);
    const { descripcion_item, caracteristicas_tecnicas, udm, cantidad, precio_unitario } = data;

    const subtotal_item = (cantidad !== undefined && precio_unitario !== undefined)
        ? cantidad * precio_unitario
        : undefined;

    const client = await db.connect();
    try {
        await client.sql`BEGIN`;

        const itemInfoResult = await client.sql<{ id_tabla_comparativa_proveedor: number }>`
            SELECT id_tabla_comparativa_proveedor FROM tabla_comparativa_items WHERE id = ${idItem};
        `;
        if (itemInfoResult.rowCount === 0) {
            throw new Error(`Ítem con ID ${idItem} no encontrado.`);
        }
        const idTablaComparativaProveedor = itemInfoResult.rows[0].id_tabla_comparativa_proveedor;

        const updateResult = await client.sql<ItemDbRow>`
            UPDATE tabla_comparativa_items SET
                descripcion_item = COALESCE(${descripcion_item}, descripcion_item),
                caracteristicas_tecnicas = COALESCE(${caracteristicas_tecnicas !== undefined ? JSON.stringify(caracteristicas_tecnicas || null) : null}, caracteristicas_tecnicas),
                udm = COALESCE(${udm}, udm),
                cantidad = COALESCE(${cantidad?.toString()}, cantidad::text),
                precio_unitario = COALESCE(${precio_unitario?.toString()}, precio_unitario::text),
                subtotal_item = COALESCE(${subtotal_item?.toString()}, subtotal_item::text)
            WHERE id = ${idItem}
            RETURNING *;
        `;

        if (updateResult.rowCount === 0) {
            throw new Error(`No se pudo actualizar el ítem con ID ${idItem}.`);
        }
        const updatedItemDb = updateResult.rows[0];
        console.log(`SERVICE: Item ID ${idItem} updated.`);

        if (cantidad !== undefined || precio_unitario !== undefined) {
            await actualizarTotalesProveedorEnDB(client, idTablaComparativaProveedor);
        }
        await client.sql`COMMIT`;

        return {
            ...updatedItemDb,
            caracteristicas_tecnicas: (typeof updatedItemDb.caracteristicas_tecnicas === 'string' ? JSON.parse(updatedItemDb.caracteristicas_tecnicas) : updatedItemDb.caracteristicas_tecnicas) || null,
            cantidad: parseFloat(updatedItemDb.cantidad),
            precio_unitario: parseFloat(updatedItemDb.precio_unitario),
            subtotal_item: parseFloat(updatedItemDb.subtotal_item),
            id_articulo_origen: updatedItemDb.id_articulo_origen ? parseInt(updatedItemDb.id_articulo_origen.toString(), 10) : null,
        };

    } catch (errUnknown: unknown) {
        await client.sql`ROLLBACK`;
        console.error(`SERVICE ERROR in actualizarItem (ID: ${idItem}):`, errUnknown);
        let message = "Error desconocido al actualizar el ítem.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al actualizar el ítem: ${message}`);
    } finally {
        client.release();
    }
};

export const eliminarItem = async (idItem: number): Promise<void> => {
    console.log(`SERVICE: Deleting item ID: ${idItem}`);
    const client = await db.connect();
    try {
        await client.sql`BEGIN`;

        const itemInfoResult = await client.sql<{ id_tabla_comparativa_proveedor: number }>`
            SELECT id_tabla_comparativa_proveedor FROM tabla_comparativa_items WHERE id = ${idItem};
        `;
        if (itemInfoResult.rowCount === 0) {
            console.warn(`SERVICE: Item ID ${idItem} not found for deletion, potentially already deleted.`);
            await client.sql`ROLLBACK`;
            return;
        }
        const idTablaComparativaProveedor = itemInfoResult.rows[0].id_tabla_comparativa_proveedor;

        const deleteResult = await client.sql`
            DELETE FROM tabla_comparativa_items WHERE id = ${idItem};
        `;

        if (deleteResult.rowCount === 0) {
            throw new Error(`No se pudo eliminar el ítem con ID ${idItem}.`);
        }
        console.log(`SERVICE: Item ID ${idItem} deleted.`);

        await actualizarTotalesProveedorEnDB(client, idTablaComparativaProveedor);
        await client.sql`COMMIT`;

    } catch (errUnknown: unknown) {
        await client.sql`ROLLBACK`;
        console.error(`SERVICE ERROR in eliminarItem (ID: ${idItem}):`, errUnknown);
        let message = "Error desconocido al eliminar el ítem.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al eliminar el ítem: ${message}`);
    } finally {
        client.release();
    }
};

export const eliminarProveedorDeTabla = async (idTablaComparativaProveedor: number): Promise<void> => {
    console.log(`SERVICE: Removing provider snapshot ID: ${idTablaComparativaProveedor}`);
    try {
        const result = await sql`
            DELETE FROM tabla_comparativa_proveedores WHERE id = ${idTablaComparativaProveedor};
        `;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Provider snapshot ID ${idTablaComparativaProveedor} not found for deletion.`);
            throw new Error(`Registro de proveedor en tabla comparativa con ID ${idTablaComparativaProveedor} no encontrado.`);
        } else {
            console.log(`SERVICE: Provider snapshot ID ${idTablaComparativaProveedor} deleted successfully.`);
        }
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in eliminarProveedorDeTabla (ID: ${idTablaComparativaProveedor}):`, errUnknown);
        let message = "Error desconocido al eliminar el proveedor de la tabla.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al eliminar el proveedor de la tabla: ${message}`);
    }
};

export const eliminarTablaComparativa = async (idTablaComparativa: number): Promise<void> => {
    console.warn(`SERVICE: Attempting to DELETE Tabla Comparativa ID: ${idTablaComparativa}. This is permanent!`);
    try {
        const result = await sql`
            DELETE FROM tablas_comparativas WHERE id = ${idTablaComparativa};
        `;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Tabla Comparativa ID ${idTablaComparativa} not found for deletion.`);
        } else {
            console.log(`SERVICE: Tabla Comparativa ID ${idTablaComparativa} deleted successfully.`);
        }
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in eliminarTablaComparativa (ID: ${idTablaComparativa}):`, errUnknown);
        let message = "Error desconocido al eliminar la tabla comparativa.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al eliminar la tabla comparativa: ${message}`);
    }
};

export const actualizarTablaComparativa = async (idTablaComparativa: number, data: ActualizarTablaInput): Promise<TablaComparativa> => {
    console.log(`SERVICE: Updating Tabla Comparativa ID: ${idTablaComparativa}`);
    const { nombre, descripcion, estado } = data;
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

    fieldsToUpdate.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    if (fieldsToUpdate.length === 1 && !(nombre !== undefined || descripcion !== undefined || estado !== undefined)) {
        console.warn(`SERVICE: No fields provided to update for Tabla Comparativa ID: ${idTablaComparativa}, only timestamp will be updated if record exists.`);
        const currentDataResult = await sql<TablaComparativa>`SELECT * FROM tablas_comparativas WHERE id = ${idTablaComparativa}`;
        if (currentDataResult.rowCount === 0) throw new Error(`Tabla comparativa con ID ${idTablaComparativa} no encontrada.`);
        // Actualizar solo timestamp si es necesario o devolver actual
         await sql`UPDATE tablas_comparativas SET fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ${idTablaComparativa} RETURNING *;`;
        const updatedData = await sql<TablaComparativa>`SELECT * FROM tablas_comparativas WHERE id = ${idTablaComparativa}`;
        return updatedData.rows[0];
    }
    
    values.push(idTablaComparativa);

    const queryText = `
        UPDATE tablas_comparativas
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
    `;

    try {
        const result = await sql.query<TablaComparativa>(queryText, values);

        if (result.rowCount === 0) {
            throw new Error(`Tabla comparativa con ID ${idTablaComparativa} no encontrada para actualizar.`);
        }
        console.log(`SERVICE: Tabla Comparativa ID ${idTablaComparativa} updated successfully.`);
        return result.rows[0];
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in actualizarTablaComparativa (ID: ${idTablaComparativa}):`, errUnknown);
        let message = "Error desconocido al actualizar la tabla comparativa.";
        
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            if (message.includes('violates check constraint "tablas_comparativas_estado_check"')) {
                throw new Error(`Estado inválido proporcionado: ${estado}`);
            }
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al actualizar la tabla comparativa: ${message}`);
    }
};

export const agregarObservacion = async (data: AgregarObservacionInput): Promise<TablaComparativaObservacion> => {
    console.log(`SERVICE: Adding observation for proveedor snapshot ${data.id_tabla_comparativa_proveedor}`);
    try {
        const checkProv = await sql`SELECT 1 FROM tabla_comparativa_proveedores WHERE id = ${data.id_tabla_comparativa_proveedor}`;
        if (checkProv.rowCount === 0) throw new Error(`El proveedor (ID en tabla: ${data.id_tabla_comparativa_proveedor}) no existe en ninguna tabla comparativa.`);

        const result = await sql<ObservacionDbRow>`
            INSERT INTO tabla_comparativa_observaciones (id_tabla_comparativa_proveedor, descripcion_validacion, cumple, comentario_adicional)
            VALUES (${data.id_tabla_comparativa_proveedor}, ${data.descripcion_validacion}, ${data.cumple}, ${data.comentario_adicional})
            RETURNING *;
        `;
        if (result.rowCount === 0) throw new Error("No se pudo agregar la observación.");
        const row = result.rows[0];
        return { ...row, cumple: row.cumple === 'true' || row.cumple === true };
    } catch (errUnknown: unknown) {
        console.error("SERVICE ERROR in agregarObservacion:", errUnknown);
        let message = "Error desconocido al agregar la observación.";
        let code: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        
        if (code === '23503') {
            throw new Error(`Error al agregar observación: El proveedor asociado (ID en tabla: ${data.id_tabla_comparativa_proveedor}) no existe.`);
        }
        throw new Error(`Error al agregar la observación: ${message}`);
    }
};

export const actualizarObservacion = async (idObservacion: number, data: ActualizarObservacionInput): Promise<TablaComparativaObservacion> => {
    console.log(`SERVICE: Updating observation ID: ${idObservacion}`);
    const { descripcion_validacion, cumple, comentario_adicional } = data;
    const fieldsToUpdate: string[] = [];
    const values: (string | number | boolean | null | undefined)[] = [];
    let paramIndex = 1;

    if (descripcion_validacion !== undefined) { fieldsToUpdate.push(`descripcion_validacion = $${paramIndex++}`); values.push(descripcion_validacion); }
    if (cumple !== undefined) { fieldsToUpdate.push(`cumple = $${paramIndex++}`); values.push(cumple); }
    if (comentario_adicional !== undefined) { fieldsToUpdate.push(`comentario_adicional = $${paramIndex++}`); values.push(comentario_adicional); }

    if (fieldsToUpdate.length === 0) {
        const currentDataResult = await sql<ObservacionDbRow>`SELECT * FROM tabla_comparativa_observaciones WHERE id = ${idObservacion}`;
        if (currentDataResult.rowCount === 0) throw new Error(`Observación con ID ${idObservacion} no encontrada.`);
        const row = currentDataResult.rows[0];
        return { ...row, cumple: row.cumple === 'true' || row.cumple === true };
    }
    values.push(idObservacion);
    const queryText = `UPDATE tabla_comparativa_observaciones SET ${fieldsToUpdate.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;

    try {
        const result = await sql.query<ObservacionDbRow>(queryText, values);
        if (result.rowCount === 0) throw new Error(`Observación con ID ${idObservacion} no encontrada para actualizar.`);
        const row = result.rows[0];
        return { ...row, cumple: row.cumple === 'true' || row.cumple === true };
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in actualizarObservacion (ID: ${idObservacion}):`, errUnknown);
        let message = "Error desconocido al actualizar la observación.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al actualizar la observación: ${message}`);
    }
};

export const eliminarObservacion = async (idObservacion: number): Promise<void> => {
    console.log(`SERVICE: Deleting observation ID: ${idObservacion}`);
    try {
        const result = await sql`DELETE FROM tabla_comparativa_observaciones WHERE id = ${idObservacion};`;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Observation ID ${idObservacion} not found for deletion.`);
            throw new Error(`Observación con ID ${idObservacion} no encontrada.`);
        }
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in eliminarObservacion (ID: ${idObservacion}):`, errUnknown);
        let message = "Error desconocido al eliminar la observación.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al eliminar la observación: ${message}`);
    }
};

export const agregarFirma = async (data: AgregarFirmaInput): Promise<TablaComparativaFirma> => {
    console.log(`SERVICE: Adding firma for tabla ${data.id_tabla_comparativa} by user ${data.id_usuario}`);
    try {
        const tablaCheck = await sql`SELECT 1 FROM tablas_comparativas WHERE id = ${data.id_tabla_comparativa}`;
        if (tablaCheck.rowCount === 0) throw new Error(`Tabla comparativa ID ${data.id_tabla_comparativa} no encontrada.`);
        const userCheck = await sql`SELECT 1 FROM usuarios WHERE id_usuario = ${data.id_usuario}`;
        if (userCheck.rowCount === 0) throw new Error(`Usuario ID ${data.id_usuario} no encontrado.`);

        const result = await sql<FirmaDbRow>`
            INSERT INTO tabla_comparativa_firmas (id_tabla_comparativa, id_usuario, tipo_firma, comentario_firma)
            VALUES (${data.id_tabla_comparativa}, ${data.id_usuario}, ${data.tipo_firma}, ${data.comentario_firma})
            RETURNING *;
        `;
        if (result.rowCount === 0) throw new Error("No se pudo agregar la firma.");
        const row = result.rows[0];
        return { ...row, id_usuario: parseInt(row.id_usuario.toString(), 10), fecha_firma: row.fecha_firma };
    } catch (errUnknown: unknown) {
        console.error("SERVICE ERROR in agregarFirma:", errUnknown);
        let message = "Error desconocido al agregar la firma.";
        let code: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        
        if (code === '23503') {
            throw new Error(`Error al agregar firma: La tabla o el usuario no existen.`);
        }
        throw new Error(`Error al agregar la firma: ${message}`);
    }
};

export const eliminarFirma = async (idFirma: number): Promise<void> => {
    console.log(`SERVICE: Deleting firma ID: ${idFirma}`);
    try {
        const result = await sql`DELETE FROM tabla_comparativa_firmas WHERE id = ${idFirma};`;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Firma ID ${idFirma} not found for deletion.`);
            throw new Error(`Firma con ID ${idFirma} no encontrada.`);
        }
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in eliminarFirma (ID: ${idFirma}):`, errUnknown);
        let message = "Error desconocido al eliminar la firma.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al eliminar la firma: ${message}`);
    }
};

export const agregarComentario = async (data: AgregarComentarioInput): Promise<TablaComparativaComentario> => {
    console.log(`SERVICE: Adding comentario for tabla ${data.id_tabla_comparativa} by user ${data.id_usuario}`);
    try {
        const tablaCheck = await sql`SELECT 1 FROM tablas_comparativas WHERE id = ${data.id_tabla_comparativa}`;
        if (tablaCheck.rowCount === 0) throw new Error(`Tabla comparativa ID ${data.id_tabla_comparativa} no encontrada.`);
        const userCheck = await sql`SELECT 1 FROM usuarios WHERE id_usuario = ${data.id_usuario}`;
        if (userCheck.rowCount === 0) throw new Error(`Usuario ID ${data.id_usuario} no encontrado.`);

        const result = await sql<ComentarioDbRow>`
            INSERT INTO tabla_comparativa_comentarios (id_tabla_comparativa, id_usuario, texto_comentario)
            VALUES (${data.id_tabla_comparativa}, ${data.id_usuario}, ${data.texto_comentario})
            RETURNING *;
        `;
        if (result.rowCount === 0) throw new Error("No se pudo agregar el comentario.");
        const row = result.rows[0];
        return { ...row, id_usuario: parseInt(row.id_usuario.toString(), 10), fecha_comentario: row.fecha_comentario };
    } catch (errUnknown: unknown) {
        console.error("SERVICE ERROR in agregarComentario:", errUnknown);
        let message = "Error desconocido al agregar el comentario.";
        let code: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        
        if (code === '23503') {
            throw new Error(`Error al agregar comentario: La tabla o el usuario no existen.`);
        }
        throw new Error(`Error al agregar el comentario: ${message}`);
    }
};

export const eliminarComentario = async (idComentario: number): Promise<void> => {
    console.log(`SERVICE: Deleting comentario ID: ${idComentario}`);
    try {
        const result = await sql`DELETE FROM tabla_comparativa_comentarios WHERE id = ${idComentario};`;
        if (result.rowCount === 0) {
            console.warn(`SERVICE: Comentario ID ${idComentario} not found for deletion.`);
            throw new Error(`Comentario con ID ${idComentario} no encontrado.`);
        }
    } catch (errUnknown: unknown) {
        console.error(`SERVICE ERROR in eliminarComentario (ID: ${idComentario}):`, errUnknown);
        let message = "Error desconocido al eliminar el comentario.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al eliminar el comentario: ${message}`);
    }
};