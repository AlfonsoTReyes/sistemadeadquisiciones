// src/services/contratosService.ts

import { sql, VercelPoolClient } from '@vercel/postgres';
// Importa funciones y tipos necesarios del servicio de proveedores
import { getProveedorById, ProveedorDetallado } from './proveedoresservice'; // Ajusta la ruta si es necesario
import { ContratoCreateData, ContratoDetallado, ContratoEnLista, ContratoUpdateData } from '../types/contrato'; // Asegúrate que la ruta a tus tipos es correcta

// --- OBTENER LISTA DE CONTRATOS ---
// Nota: La lógica para diferenciar admin/proveedor se manejaría idealmente en la API Route
//       pasando un 'filters' object que podría incluir 'id_proveedor'.
interface GetContractsFilters {
    id_proveedor?: number;
    limit?: number;
    offset?: number;
    // Otros filtros potenciales: status, fecha_inicio_range, etc.
}

export const getContracts = async (filters: GetContractsFilters = {}): Promise<ContratoEnLista[]> => {
    const { id_proveedor, limit = 10, offset = 0 } = filters;
    console.log(`SERVICE Contratos: getContracts called with filters:`, filters);

    try {
        // Construcción dinámica de la query
        let query = `
            SELECT
                c.id_contrato,
                c.numero_contrato,
                c.objeto_contrato,
                c.monto_total,
                c.moneda,
                c.fecha_firma,
                c.fecha_inicio,
                c.fecha_fin,
                c.id_proveedor,
                -- Obtener nombre/razón social para la lista
                COALESCE(pf.nombre || ' ' || pf.apellido_p, pm.razon_social, p.rfc) AS nombre_proveedor_o_razon_social
            FROM contratos c
            JOIN proveedores p ON c.id_proveedor = p.id_proveedor
            LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
            LEFT JOIN (
                -- Seleccionar una sola fila por proveedor moral para evitar duplicados en la lista
                SELECT DISTINCT ON (id_proveedor) id_proveedor, razon_social
                FROM proveedores_morales
            ) pm ON p.id_proveedor = pm.id_proveedor
        `;
        const queryParams: any[] = [];
        let whereClause = '';

        if (id_proveedor !== undefined) {
            queryParams.push(id_proveedor);
            whereClause += `c.id_proveedor = $${queryParams.length}`;
        }

        // Añadir más condiciones WHERE aquí si se agregan más filtros...
        // if (filters.status) { ... }

        if (whereClause) {
            query += ` WHERE ${whereClause}`;
        }

        query += ` ORDER BY c.fecha_firma DESC, c.id_contrato DESC`; // O el orden que prefieras

        queryParams.push(limit);
        query += ` LIMIT $${queryParams.length}`;
        queryParams.push(offset);
        query += ` OFFSET $${queryParams.length}`;

        console.log("SERVICE Contratos: Executing query:", query);
        console.log("SERVICE Contratos: With params:", queryParams);

        const result = await sql.query(query, queryParams);

        // Mapear a la interfaz ContratoEnLista (ajustar tipos si es necesario)
        const contratos: ContratoEnLista[] = result.rows.map(row => ({
            id_contrato: row.id_contrato,
            numero_contrato: row.numero_contrato,
            objeto_contrato: row.objeto_contrato,
            monto_total: String(row.monto_total), // Convertir numeric a string
            moneda: row.moneda,
            fecha_firma: row.fecha_firma ? new Date(row.fecha_firma).toISOString().split('T')[0] : null, // Formatear fecha
            fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().split('T')[0] : null,
            fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toISOString().split('T')[0] : null,
            id_proveedor: row.id_proveedor,
            nombre_proveedor_o_razon_social: row.nombre_proveedor_o_razon_social,
        }));

        console.log(`SERVICE Contratos: Found ${contratos.length} contracts.`);
        return contratos;

    } catch (error) {
        console.error("SERVICE Contratos: Error fetching contracts:", error);
        throw new Error('Error al obtener la lista de contratos.');
    }
};


// --- OBTENER DETALLES DE UN CONTRATO POR ID ---
export const getContractById = async (idContrato: number): Promise<ContratoDetallado | null> => {
    console.log(`SERVICE Contratos: getContractById called for ID: ${idContrato}`);
    if (isNaN(idContrato)) throw new Error("ID de contrato inválido.");

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();

        // 1. Obtener datos del contrato y datos relacionados básicos
        const contractResult = await client.sql`
            SELECT
                c.*, -- Todos los campos de la tabla contratos
                co.numero_concurso, -- Número del concurso relacionado
                co.nombre_concurso, -- Nombre del concurso relacionado
                s.folio, -- Asumiendo que solicitudes tiene un numero_solicitud (AJUSTAR SI ES DIFERENTE)
                d.resultado_dictamen, -- Como ejemplo, si quieres mostrar el resultado del dictamen
                s.id_solicitud AS solicitud_id_ref, -- Traemos el id para referencia, si numero_solicitud no existe
                d.id_dictamen AS dictamen_id_ref -- Traemos el id para referencia
            FROM contratos c
            LEFT JOIN concurso co ON c.id_concurso = co.id_concurso
            LEFT JOIN solicitud_adquisicion s ON c.id_solicitud = s.id_solicitud -- Asumiendo tabla 'solicitudes' y columna 'id_solicitud'
            LEFT JOIN dictamen_comite d ON c.id_dictamen = d.id_dictamen
            WHERE c.id_contrato = ${idContrato};
        `;

        if (contractResult.rows.length === 0) return null;

        const contratoBase = contractResult.rows[0];
        console.log(`SERVICE Contratos: Base contract and related data found for ID: ${idContrato}`);

        // 2. Obtener datos detallados del proveedor (sin cambios aquí)
        const idProveedor = contratoBase.id_proveedor;
        console.log(`SERVICE Contratos: Fetching provider details for ID: ${idProveedor}`);
        const proveedorDetallado: ProveedorDetallado | null = await getProveedorById(idProveedor);

        if (!proveedorDetallado) {
             throw new Error(`Proveedor asociado (ID: ${idProveedor}) no encontrado para el contrato ${idContrato}.`);
        }
        console.log(`SERVICE Contratos: Provider details fetched successfully.`);

        // 3. Combinar datos en el objeto ContratoDetallado
        const contratoCompleto: ContratoDetallado = {
            // Datos del contrato base
            id_contrato: contratoBase.id_contrato,
            numero_contrato: contratoBase.numero_contrato,
            id_solicitud: contratoBase.id_solicitud,
            id_dictamen: contratoBase.id_dictamen,
            id_proveedor: contratoBase.id_proveedor,
            id_concurso: contratoBase.id_concurso,
            objeto_contrato: contratoBase.objeto_contrato,
            monto_total: String(contratoBase.monto_total),
            moneda: contratoBase.moneda ?? 'MXN',
            fecha_firma: contratoBase.fecha_firma ? new Date(contratoBase.fecha_firma).toISOString().split('T')[0] : null,
            fecha_inicio: contratoBase.fecha_inicio ? new Date(contratoBase.fecha_inicio).toISOString().split('T')[0] : null,
            fecha_fin: contratoBase.fecha_fin ? new Date(contratoBase.fecha_fin).toISOString().split('T')[0] : null,
            condiciones_pago: contratoBase.condiciones_pago,
            garantias: contratoBase.garantias,
            // Datos del proveedor detallado
            proveedor: proveedorDetallado,
            // *** NUEVOS CAMPOS RELACIONADOS ***
            // Ajusta los nombres de campo según tu tabla 'solicitudes' y 'dictamen_comite'
            numero_solicitud: contratoBase.numero_solicitud ?? null,
            resultado_dictamen: contratoBase.resultado_dictamen ?? null,
            numero_concurso: contratoBase.numero_concurso ?? null,
            nombre_concurso: contratoBase.nombre_concurso ?? null,
            // Puedes añadir fallbacks si no tienes campos descriptivos
            solicitud_display: contratoBase.solicitud_id_ref ? `ID: ${contratoBase.solicitud_id_ref}` : 'N/A', // Ejemplo fallback
            dictamen_display: contratoBase.dictamen_id_ref ? `ID: ${contratoBase.dictamen_id_ref}`: 'N/A', // Ejemplo fallback
            concurso_display: contratoBase.numero_concurso ? `${contratoBase.numero_concurso} (${contratoBase.nombre_concurso})` : (contratoBase.id_concurso ? `ID: ${contratoBase.id_concurso}` : 'N/A'), // Ejemplo fallback más completo

        };

        return contratoCompleto;

    } catch (error) {
        console.error(`SERVICE Contratos: Error fetching contract details for ID ${idContrato}:`, error);
        throw new Error(`Error al obtener los detalles del contrato: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
         if (client) { await client.release(); }
    }
};
/**
 * Obtiene una lista simplificada de proveedores (activos) para usar en selects/dropdowns.
 * @returns Promise<Array<{ id: number; label: string }>>
 */
export const getProveedoresForSelect = async (): Promise<{ id: number; label: string }[]> => {
    console.log("SERVICE Proveedores: getProveedoresForSelect called");
    try {
        // Selecciona ID y un nombre descriptivo combinando razón social/nombre/rfc
        // Filtra por estatus activo si es relevante para seleccionar en contratos
        const result = await sql`
            SELECT
                p.id_proveedor AS id,
                COALESCE(
                    pm.razon_social,
                    TRIM(CONCAT(pf.nombre, ' ', pf.apellido_p, ' ', pf.apellido_m)),
                    p.rfc,
                    'ID: ' || p.id_proveedor::text -- Fallback muy básico
                ) AS label
            FROM proveedores p
            LEFT JOIN (
                -- Obtener una sola razón social por proveedor moral
                SELECT DISTINCT ON (id_proveedor) id_proveedor, razon_social
                FROM proveedores_morales
            ) pm ON p.id_proveedor = pm.id_proveedor
            LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
            WHERE p.estatus = true -- O el filtro que consideres apropiado (ej: aprobados)
            ORDER BY label ASC;
        `;
        console.log(`SERVICE Proveedores: Found ${result.rows.length} active providers for select.`);
        // Asegurarse que label no sea null o vacío si es posible
         return result.rows.map(row => ({
             ...row,
             label: row.label?.trim() || `ID: ${row.id}` // Limpiar y fallback final
         })) as { id: number; label: string }[];

    } catch (error) {
        console.error("SERVICE Proveedores: Error fetching providers for select:", error);
        throw new Error('Error al obtener la lista de proveedores para selección.');
    }
};

// --- CREAR UN NUEVO CONTRATO ---
export const createContract = async (data: ContratoCreateData): Promise<{ id_contrato: number }> => {
    const {
        numero_contrato, id_solicitud, id_dictamen, id_proveedor, id_concurso,
        objeto_contrato, monto_total, moneda, fecha_firma, fecha_inicio, fecha_fin,
        condiciones_pago, garantias
    } = data;

    // Validaciones básicas (más robustas podrían estar en la API Route con Zod)
    if (!id_proveedor || !objeto_contrato || !monto_total) {
        throw new Error("Faltan campos requeridos para crear el contrato (proveedor, objeto, monto).");
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log(`SERVICE Contratos: createContract - Iniciando transacción para proveedor ID: ${id_proveedor}`);

        const result = await client.sql`
            INSERT INTO contratos (
                numero_contrato, id_solicitud, id_dictamen, id_proveedor, id_concurso,
                objeto_contrato, monto_total, moneda, fecha_firma, fecha_inicio, fecha_fin,
                condiciones_pago, garantias
            ) VALUES (
                ${numero_contrato ?? null}, ${id_solicitud ?? null}, ${id_dictamen ?? null}, ${id_proveedor}, ${id_concurso ?? null},
                ${objeto_contrato}, ${monto_total}, ${moneda ?? 'MXN'}, ${fecha_firma ?? null}, ${fecha_inicio ?? null}, ${fecha_fin ?? null},
                ${condiciones_pago ?? null}, ${garantias ?? null}
            ) RETURNING id_contrato;
        `;

        const newContratoId = result.rows[0]?.id_contrato;
        if (!newContratoId) {
            throw new Error("Fallo al crear el registro del contrato, no se obtuvo ID.");
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Contratos: createContract - Transacción completada. Nuevo contrato ID: ${newContratoId}`);
        return { id_contrato: newContratoId };

    } catch (error: any) {
        console.error(`SERVICE Contratos: createContract - Error durante la creación`);
        if (client) {
            try { await client.sql`ROLLBACK`; console.log("SERVICE Contratos: createContract - ROLLBACK ejecutado."); }
            catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); }
        }
        console.error("Error creando contrato:", error);
         // Manejar errores específicos si es necesario (ej. FK violation)
         if (error.code === '23503' && error.constraint === 'contratos_id_proveedor_fkey') {
             throw new Error(`Error de referencia: El proveedor con ID ${id_proveedor} no existe.`);
         }
         if (error.code === '23505' && error.constraint === 'contratos_numero_contrato_key') {
             throw new Error(`El número de contrato '${numero_contrato}' ya existe.`);
         }
        throw new Error(`Error al crear el contrato: ${error.message || 'Error desconocido'}`);
    } finally {
        if (client) { await client.release(); }
    }
};


// --- ACTUALIZAR UN CONTRATO EXISTENTE ---
export const updateContract = async (idContrato: number, data: ContratoUpdateData): Promise<ContratoDetallado | null> => {
    console.log(`SERVICE Contratos: updateContract - Iniciando actualización para ID: ${idContrato}`);
    if (isNaN(idContrato)) throw new Error("ID de contrato inválido.");
    if (Object.keys(data).length === 0) {
         console.warn("SERVICE Contratos: updateContract - No data provided for update.");
         return getContractById(idContrato); // Devuelve el estado actual si no hay nada que cambiar
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        // Construcción dinámica de la query de actualización
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        // Helper para añadir campos a actualizar
        const addUpdateField = (fieldNameDb: string, value: any) => {
            // Solo añadir si el valor NO es undefined (permitir null explícito)
            if (value !== undefined) {
                updateFields.push(`${fieldNameDb} = $${paramIndex++}`);
                updateValues.push(value);
            }
        };

        addUpdateField('numero_contrato', data.numero_contrato);
        addUpdateField('id_solicitud', data.id_solicitud);
        addUpdateField('id_dictamen', data.id_dictamen);
        addUpdateField('id_proveedor', data.id_proveedor); // Permitir cambiar proveedor? Revisar lógica de negocio
        addUpdateField('id_concurso', data.id_concurso);
        addUpdateField('objeto_contrato', data.objeto_contrato);
        addUpdateField('monto_total', data.monto_total);
        addUpdateField('moneda', data.moneda);
        addUpdateField('fecha_firma', data.fecha_firma);
        addUpdateField('fecha_inicio', data.fecha_inicio);
        addUpdateField('fecha_fin', data.fecha_fin);
        addUpdateField('condiciones_pago', data.condiciones_pago);
        addUpdateField('garantias', data.garantias);
        // Añadir aquí otros campos si la tabla 'contratos' crece

        if (updateFields.length === 0) {
            console.warn(`SERVICE Contratos: updateContract - No fields to update after filtering undefined for ID: ${idContrato}`);
            await client.sql`ROLLBACK`; // No hay nada que hacer
            return getContractById(idContrato);
        }

        // Construir la query completa
        const setClause = updateFields.join(', ');
        const updateQuery = `UPDATE contratos SET ${setClause} WHERE id_contrato = $${paramIndex}`;
        updateValues.push(idContrato);

        console.log("SERVICE Contratos: updateContract - Executing query:", updateQuery);
        console.log("SERVICE Contratos: updateContract - With params:", updateValues);

        const result = await client.query(updateQuery, updateValues);

        if (result.rowCount === 0) {
            await client.sql`ROLLBACK`;
            console.error(`SERVICE Contratos: updateContract - Contrato con ID ${idContrato} no encontrado.`);
            throw new Error(`Contrato con ID ${idContrato} no encontrado.`);
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Contratos: updateContract - Transacción completada (COMMIT) para ID: ${idContrato}`);

        // Devolver los datos actualizados
        return await getContractById(idContrato);

    } catch (error: any) {
        console.error(`SERVICE Contratos: updateContract - Error actualizando contrato ID ${idContrato}`);
        if (client) {
            try { await client.sql`ROLLBACK`; console.log("SERVICE Contratos: updateContract - ROLLBACK ejecutado."); }
            catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); }
        }
        console.error("Error detallado en updateContract:", error);
        // Manejar errores específicos
         if (error.code === '23503') { // Error de FK (ej. id_proveedor inválido)
             throw new Error(`Error de referencia: ${error.detail || 'Verifique los IDs relacionados (proveedor, concurso, etc.)'}`);
         }
          if (error.code === '23505' && error.constraint === 'contratos_numero_contrato_key') {
             throw new Error(`El número de contrato '${data.numero_contrato}' ya existe.`);
         }
        throw new Error(`Error al actualizar el contrato: ${error.message || 'Error desconocido'}`);
    } finally {
        if (client) { await client.release(); }
    }
};

// --- (Opcional) ELIMINAR UN CONTRATO ---
// Considerar si realmente se debe eliminar o marcar como inactivo/cancelado
/*
export const deleteContract = async (idContrato: number): Promise<{ success: boolean }> => {
    console.log(`SERVICE Contratos: deleteContract - Intentando eliminar ID: ${idContrato}`);
    if (isNaN(idContrato)) throw new Error("ID de contrato inválido.");

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        // ¡CUIDADO! DELETE es permanente y puede fallar por FKs RESTRICT.
        // Asegúrate que no haya dependencias o considera cambiar a ON DELETE SET NULL/CASCADE si aplica.
        // O mejor aún, implementa soft delete (marcar como eliminado).
        const result = await client.sql`DELETE FROM contratos WHERE id_contrato = ${idContrato}`;

        if (result.rowCount === 0) {
            await client.sql`ROLLBACK`;
            throw new Error(`Contrato con ID ${idContrato} no encontrado para eliminar.`);
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Contratos: deleteContract - Contrato ID ${idContrato} eliminado.`);
        return { success: true };

    } catch (error: any) {
        console.error(`SERVICE Contratos: deleteContract - Error eliminando contrato ID ${idContrato}`);
        if (client) { try { await client.sql`ROLLBACK`; } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        console.error("Error detallado en deleteContract:", error);
        // Podría fallar por FKs con ON DELETE RESTRICT
        if (error.code === '23503') { // Foreign key violation
             throw new Error(`No se puede eliminar el contrato ${idContrato} porque tiene registros relacionados.`);
        }
        throw new Error(`Error al eliminar el contrato: ${error.message || 'Error desconocido'}`);
    } finally {
        if (client) { await client.release(); }
    }
};
*/