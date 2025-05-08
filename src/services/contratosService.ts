// src/services/contratosService.ts

import { sql, VercelPoolClient } from '@vercel/postgres';
// Importa funciones y tipos necesarios del servicio de proveedores
import { getProveedorById } from './proveedoresservice'; // Ajusta la ruta si es necesario
// ProveedorDetallado was unused in this file, so it's removed from direct imports here.
// It's used as a return type from getProveedorById.
import { ContratoCreateData, ContratoDetallado, ContratoEnLista, ContratoUpdateData } from '../types/contrato'; // Asegúrate que la ruta a tus tipos es correcta
import { ContratoInputData } from '@/types/contratoTemplateData'; // Ajusta ruta

// --- OBTENER LISTA DE CONTRATOS ---

interface GetContractsFilters {
    id_proveedor?: number;
    limit?: number;
    offset?: number;
}

export const getContracts = async (filters: GetContractsFilters = {}): Promise<ContratoEnLista[]> => {
    const { id_proveedor, limit = 10, offset = 0 } = filters;
    console.log(`SERVICE Contratos: getContracts called with filters:`, filters);

    try {
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
                COALESCE(pf.nombre || ' ' || pf.apellido_p, pm.razon_social, p.rfc) AS nombre_proveedor_o_razon_social
            FROM contratos c
            JOIN proveedores p ON c.id_proveedor = p.id_proveedor
            LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
            LEFT JOIN (
                SELECT DISTINCT ON (id_proveedor) id_proveedor, razon_social
                FROM proveedores_morales
            ) pm ON p.id_proveedor = pm.id_proveedor
        `;
        const queryParams: (string | number | boolean | null)[] = []; // CORREGIDO
        let whereClause = '';

        if (id_proveedor !== undefined) {
            queryParams.push(id_proveedor);
            whereClause += `c.id_proveedor = $${queryParams.length}`;
        }

        if (whereClause) {
            query += ` WHERE ${whereClause}`;
        }

        query += ` ORDER BY c.fecha_firma DESC, c.id_contrato DESC`;

        queryParams.push(limit);
        query += ` LIMIT $${queryParams.length}`;
        queryParams.push(offset);
        query += ` OFFSET $${queryParams.length}`;

        console.log("SERVICE Contratos: Executing query:", query);
        console.log("SERVICE Contratos: With params:", queryParams);

        const result = await sql.query(query, queryParams);

        const contratos: ContratoEnLista[] = result.rows.map(row => ({
            id_contrato: row.id_contrato,
            numero_contrato: row.numero_contrato,
            objeto_contrato: row.objeto_contrato,
            monto_total: String(row.monto_total),
            moneda: row.moneda,
            fecha_firma: row.fecha_firma ? new Date(row.fecha_firma).toISOString().split('T')[0] : null,
            fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().split('T')[0] : null,
            fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toISOString().split('T')[0] : null,
            id_proveedor: row.id_proveedor,
            nombre_proveedor_o_razon_social: row.nombre_proveedor_o_razon_social,
        }));

        console.log(`SERVICE Contratos: Found ${contratos.length} contracts.`);
        return contratos;

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error("SERVICE Contratos: Error fetching contracts:", errUnknown);
        const message = 'Error al obtener la lista de contratos.';
        if (errUnknown instanceof Error) {
            // message = errUnknown.message; // Podrías usar el mensaje original si es seguro
        }
        throw new Error(message);
    }
};

// --- OBTENER DETALLES DE UN CONTRATO POR ID ---
export const getContractById = async (idContrato: number): Promise<ContratoDetallado | null> => {
    console.log(`SERVICE Contratos: getContractById called for ID: ${idContrato}`);
    if (isNaN(idContrato)) throw new Error("ID de contrato inválido.");

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();

        const contractResult = await client.sql`
            SELECT
                c.*, 
                co.numero_concurso, co.nombre_concurso,
                s.id_solicitud AS solicitud_id_ref,
                d.id_dictamen AS dictamen_id_ref
            FROM contratos c
            LEFT JOIN concurso co ON c.id_concurso = co.id_concurso
            LEFT JOIN solicitud_adquisicion s ON c.id_solicitud = s.id_solicitud
            LEFT JOIN dictamen_comite d ON c.id_dictamen = d.id_dictamen
            WHERE c.id_contrato = ${idContrato};
        `;

        if (contractResult.rows.length === 0) return null;
        const row = contractResult.rows[0];

        const proveedorDetallado = await getProveedorById(row.id_proveedor);
        if (!proveedorDetallado) throw new Error(`Proveedor asociado no encontrado para el contrato ID: ${idContrato}. ID Proveedor: ${row.id_proveedor}`);


        let parsedTemplateData: (Partial<ContratoInputData> & { tipoContrato: 'servicio' | 'adquisicion' }) | undefined = undefined;
        if (row.template_data && typeof row.template_data === 'object') {
            const tempParsed = row.template_data as Partial<ContratoInputData>;
            if (tempParsed.tipoContrato === 'servicio' || tempParsed.tipoContrato === 'adquisicion') {
                parsedTemplateData = {
                    ...tempParsed,
                    tipoContrato: tempParsed.tipoContrato // Asegura el campo
                };
            } else {
                throw new Error("template_data no contiene un tipoContrato válido.");
            }
        }

        const contratoCompleto: ContratoDetallado = {
            id_contrato: row.id_contrato,
            numero_contrato: row.numero_contrato,
            id_solicitud: row.id_solicitud,
            id_dictamen: row.id_dictamen,
            id_proveedor: row.id_proveedor,
            id_concurso: row.id_concurso,
            objeto_contrato: row.objeto_contrato,
            monto_total: String(row.monto_total),
            moneda: row.moneda,
            fecha_firma: row.fecha_firma ? new Date(row.fecha_firma).toISOString().split('T')[0] : null,
            fecha_inicio: row.fecha_inicio ? new Date(row.fecha_inicio).toISOString().split('T')[0] : null, // Asegurar formato
            fecha_fin: row.fecha_fin ? new Date(row.fecha_fin).toISOString().split('T')[0] : null,       // Asegurar formato
            condiciones_pago: row.condiciones_pago,
            garantias: row.garantias,
            proveedor: proveedorDetallado,
            template_data: parsedTemplateData, // CORREGIDO: as any removido
            concurso_display: row.numero_concurso ? `${row.numero_concurso} (${row.nombre_concurso ?? ''})` : (row.id_concurso ? `ID: ${row.id_concurso}` : 'N/A'),
            solicitud_display: row.solicitud_id_ref ? `ID: ${row.solicitud_id_ref}` : 'N/A',
            dictamen_display: row.dictamen_id_ref ? `ID: ${row.dictamen_id_ref}` : 'N/A',
        };

        return contratoCompleto;

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error(`SERVICE Contratos: Error fetching contract details for ID ${idContrato}:`, errUnknown);
        let message = 'Error desconocido al obtener los detalles del contrato.';
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        }
        throw new Error(`Error al obtener los detalles del contrato: ${message}`);
    } finally {
         if (client) { await client.release(); }
    }
};

// Esta función parece ser un duplicado de la que estaría en proveedoresservice.ts
// Si es intencional, se corrige el catch. Si no, debería eliminarse y usar la del otro servicio.
export const getProveedoresForSelect = async (): Promise<{ id: number; label: string }[]> => {
    console.log("SERVICE Contratos (Proveedores): getProveedoresForSelect called");
    try {
        interface SelectRow { id: number; label: string | null; }
        const result = await sql<SelectRow>`
            SELECT
                p.id_proveedor AS id,
                COALESCE(
                    pm.razon_social,
                    TRIM(CONCAT(pf.nombre, ' ', pf.apellido_p, ' ', pf.apellido_m)),
                    p.rfc,
                    'ID: ' || p.id_proveedor::text
                ) AS label
            FROM proveedores p
            LEFT JOIN (
                SELECT DISTINCT ON (id_proveedor) id_proveedor, razon_social
                FROM proveedores_morales
            ) pm ON p.id_proveedor = pm.id_proveedor
            LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
            WHERE p.estatus = true
            ORDER BY label ASC;
        `;
        console.log(`SERVICE Contratos (Proveedores): Found ${result.rows.length} active providers for select.`);
         return result.rows.map(row => ({
             id: row.id,
             label: row.label?.trim() || `ID: ${row.id}`
         }));

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error("SERVICE Contratos (Proveedores): Error fetching providers for select:", errUnknown);
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

    if (!id_proveedor || !objeto_contrato || !monto_total) {
        throw new Error("Faltan campos requeridos para crear el contrato (proveedor, objeto, monto).");
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log(`SERVICE Contratos: createContract - Iniciando transacción para proveedor ID: ${id_proveedor}`);

        const result = await client.sql<{ id_contrato: number }>`
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

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error(`SERVICE Contratos: createContract - Error durante la creación`);
        if (client) {
            try { await client.sql`ROLLBACK`; console.log("SERVICE Contratos: createContract - ROLLBACK ejecutado."); }
            catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); }
        }
        
        let message = 'Error desconocido al crear el contrato.';
        let code: string | undefined;
        let constraint: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any; // Para acceder a propiedades específicas de error de DB
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.constraint === 'string') constraint = errAsAny.constraint;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        console.error("Error creando contrato:", errUnknown); // Log el error original

         if (code === '23503' && constraint === 'contratos_id_proveedor_fkey') {
             throw new Error(`Error de referencia: El proveedor con ID ${id_proveedor} no existe.`);
         }
         if (code === '23505' && constraint === 'contratos_numero_contrato_key') {
             throw new Error(`El número de contrato '${numero_contrato ?? ''}' ya existe.`);
         }
        throw new Error(`Error al crear el contrato: ${message}`);
    } finally {
        if (client) { await client.release(); }
    }
};

// --- ACTUALIZAR UN CONTRATO EXISTENTE (MODIFICADO) ---
export const updateContract = async (
    idContrato: number,
    data: ContratoUpdateData & { template_data?: Partial<ContratoInputData> | object }
): Promise<ContratoDetallado | null> => {

    console.log(`SERVICE Contratos: updateContract - Iniciando actualización para ID: ${idContrato}`);
    if (isNaN(idContrato)) throw new Error("ID de contrato inválido.");

    const { template_data, ...coreUpdateData } = data;

    if (Object.keys(coreUpdateData).length === 0 && template_data === undefined) {
        console.warn("SERVICE Contratos: updateContract - No data provided for update.");
        return getContractById(idContrato);
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        const updateFields: string[] = [];
        const updateValues: (string | number | boolean | Date | null)[] = []; // CORREGIDO
        let paramIndex = 1;

        const addUpdateField = (fieldNameDb: string, value: string | number | boolean | Date | null | undefined) => { // CORREGIDO
            if (value !== undefined) {
                updateFields.push(`${fieldNameDb} = $${paramIndex++}`);
                updateValues.push(value === '' ? null : value);
            }
        };
        
        // Iterar sobre las claves de coreUpdateData de forma segura
        for (const key of Object.keys(coreUpdateData) as Array<keyof typeof coreUpdateData>) {
            addUpdateField(key, coreUpdateData[key]);
        }

        let templateDataJsonString: string | null = null;
        if (template_data !== undefined) {
            try {
                templateDataJsonString = JSON.stringify(template_data);
                updateFields.push(`template_data = $${paramIndex++}`);
                updateValues.push(templateDataJsonString);
                console.log(`SERVICE Contratos: updateContract - Preparing to update template_data for ID: ${idContrato}`);
            } catch (jsonError: unknown) { // CORREGIDO
                console.error(`SERVICE Contratos: updateContract - Error stringifying template_data for ID ${idContrato}:`, jsonError);
                 await client.sql`ROLLBACK`;
                 throw new Error("Error al procesar los datos adicionales (template_data).");
            }
        }

        if (updateFields.length === 0) {
            console.warn(`SERVICE Contratos: updateContract - No fields to update after filtering for ID: ${idContrato}`);
            await client.sql`ROLLBACK`; // No commit if nothing changed.
            return getContractById(idContrato);
        }

        // updateFields.push(`updated_at = NOW()`); // Uncomment if you have an updated_at column

        const setClause = updateFields.join(', ');
        const updateQuery = `UPDATE public.contratos SET ${setClause} WHERE id_contrato = $${paramIndex}`;
        updateValues.push(idContrato);

        console.log("SERVICE Contratos: updateContract - Executing query:", updateQuery);
        console.log("SERVICE Contratos: updateContract - With params:", updateValues);

        const result = await client.query(updateQuery, updateValues);

        if (result.rowCount === 0) {
            await client.sql`ROLLBACK`;
            throw new Error(`Contrato con ID ${idContrato} no encontrado para actualizar.`);
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Contratos: updateContract - Transacción completada (COMMIT) para ID: ${idContrato}`);
        return await getContractById(idContrato);

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error(`SERVICE Contratos: updateContract - Error actualizando contrato ID ${idContrato}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("SERVICE Contratos: updateContract - ROLLBACK ejecutado."); } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        
        let message = 'Error desconocido al actualizar el contrato.';
        let code: string | undefined;
        let detail: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.detail === 'string') detail = errAsAny.detail;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        
         if (code === '23503') { throw new Error(`Error de referencia: ${detail || 'Verifique IDs relacionados'}`); }
         if (code === '23505') { throw new Error(`Conflicto: ${detail || 'Valor único duplicado'}`); }
         if (code === '22P02') { throw new Error('Error interno al procesar datos adicionales (JSON).'); } // Invalid text representation for JSON
        throw new Error(`Error al actualizar el contrato: ${message}`);
    } finally {
        if (client) { await client.release(); }
    }
};

export const createContractWithTemplateData = async (
    coreData: Partial<ContratoCreateData>,
    templateData: Omit<ContratoInputData, keyof ContratoCreateData> & { tipoContrato: string }
): Promise<{ id_contrato: number }> => {

    console.log("SERVICE Contratos: createContractWithTemplateData called.");
    const {
        id_proveedor,
        objeto_contrato,
        monto_total,
        numero_contrato = null,
        id_solicitud = null,
        id_dictamen = null,
        id_concurso = null,
        moneda = 'MXN',
        fecha_firma = null,
        fecha_inicio = null,
        fecha_fin = null,
        condiciones_pago = null,
        garantias = null
    } = coreData;

     if (id_proveedor === undefined || id_proveedor === null) throw new Error("ID Proveedor es requerido en coreData.");
     if (!objeto_contrato) throw new Error("Objeto del contrato es requerido en coreData.");
     if (monto_total === undefined || monto_total === null) throw new Error("Monto total es requerido en coreData.");

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        const templateDataJson = JSON.stringify(templateData);

        const result = await client.sql<{ id_contrato: number }>`
            INSERT INTO public.contratos (
                id_proveedor, objeto_contrato, monto_total, numero_contrato,
                id_solicitud, id_dictamen, id_concurso, moneda, fecha_firma,
                fecha_inicio, fecha_fin, condiciones_pago, garantias,
                template_data
            ) VALUES (
                ${id_proveedor}, ${objeto_contrato}, ${monto_total}, ${numero_contrato},
                ${id_solicitud}, ${id_dictamen}, ${id_concurso}, ${moneda}, ${fecha_firma},
                ${fecha_inicio}, ${fecha_fin}, ${condiciones_pago}, ${garantias},
                ${templateDataJson}
            ) RETURNING id_contrato;
        `;

        const newContratoId = result.rows[0]?.id_contrato;
        if (!newContratoId) {
            throw new Error("Fallo al crear el registro del contrato (template), no se obtuvo ID.");
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Contratos: createContractWithTemplateData - Transacción completada. ID: ${newContratoId}`);
        return { id_contrato: newContratoId };

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error(`SERVICE Contratos: createContractWithTemplateData - Error`);
        if (client) { try { await client.sql`ROLLBACK`; } catch (rbErr) { console.error("Rollback Error:", rbErr); } }
        
        let message = 'Error desconocido en servicio al crear contrato (template).';
        let code: string | undefined;
        let detail: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.detail === 'string') detail = errAsAny.detail;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        
         if (code === '23503') { throw new Error(`Error de referencia: ${detail || 'Verifique IDs (proveedor, etc.)'}`); }
         if (code === '23505') { throw new Error(`Conflicto: ${detail || 'Valor único duplicado (ej: num contrato)'}`); }
         if (code === '22P02') {
             console.error("Posible error al convertir template_data a JSON:", templateData);
             throw new Error('Error interno al procesar datos adicionales del contrato.');
         }
        throw new Error(`Error en servicio al crear contrato (template): ${message}`);
    } finally {
        if (client) { await client.release(); }
    }
};
// --- (Opcional) ELIMINAR UN CONTRATO ---
// Soft delete (marcar como eliminado) es generalmente preferible.
// El código para hard delete está comentado como en el original.