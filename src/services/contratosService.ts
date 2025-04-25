// src/services/contratosService.ts

import { sql, VercelPoolClient } from '@vercel/postgres';
// Importa funciones y tipos necesarios del servicio de proveedores
import { getProveedorById, ProveedorDetallado } from './proveedoresservice'; // Ajusta la ruta si es necesario
import { ContratoCreateData, ContratoDetallado, ContratoEnLista, ContratoUpdateData } from '../types/contrato'; // Asegúrate que la ruta a tus tipos es correcta
import { ContratoInputData } from '@/types/contratoTemplateData'; // Ajusta ruta
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

        // 1. Obtener datos del contrato, incluyendo template_data y joins básicos
        const contractResult = await client.sql`
            SELECT
                c.*, -- Todos los campos core de contratos (incluyendo template_data)
                co.numero_concurso, co.nombre_concurso,
                s.id_solicitud AS solicitud_id_ref, -- O numero_solicitud si existe
                d.id_dictamen AS dictamen_id_ref -- O resultado_dictamen si existe
            FROM contratos c
            LEFT JOIN concurso co ON c.id_concurso = co.id_concurso
            LEFT JOIN solicitud_adquisicion s ON c.id_solicitud = s.id_solicitud -- Ajusta nombre tabla
            LEFT JOIN dictamen_comite d ON c.id_dictamen = d.id_dictamen
            WHERE c.id_contrato = ${idContrato};
        `;

        if (contractResult.rows.length === 0) return null;
        const row = contractResult.rows[0];

        // 2. Obtener datos del proveedor (sin cambios)
        const proveedorDetallado = await getProveedorById(row.id_proveedor);
        if (!proveedorDetallado) throw new Error(`Proveedor asociado no encontrado.`);

        // *** 3. Parsear template_data (JSONB) ***
        let parsedTemplateData: Partial<ContratoInputData> | undefined = undefined;
        if (row.template_data && typeof row.template_data === 'object') {
            // Si Vercel/pg ya lo devuelve como objeto JS:
            parsedTemplateData = row.template_data as Partial<ContratoInputData>;
            console.log("SERVICE Contratos: Parsed template_data (from object):", parsedTemplateData);
        } else if (typeof row.template_data === 'string') {
             // Si viene como string JSON
            try {
                parsedTemplateData = JSON.parse(row.template_data);
                console.log("SERVICE Contratos: Parsed template_data (from string):", parsedTemplateData);
            } catch (e) {
                console.error(`SERVICE Contratos: Error parsing template_data JSON for contract ${idContrato}:`, e);
                // Decide cómo manejar: ¿error o continuar sin template_data?
                // Podríamos continuar y dejar parsedTemplateData como undefined.
            }
        }

        // 4. Combinar datos
        const contratoCompleto: ContratoDetallado = {
            // --- Mapeo de Campos Core ---
            id_contrato: row.id_contrato,
            numero_contrato: row.numero_contrato,
            id_solicitud: row.id_solicitud,
            id_dictamen: row.id_dictamen,
            id_proveedor: row.id_proveedor,
            id_concurso: row.id_concurso,
            objeto_contrato: row.objeto_contrato, // Este es el 'core', el de template_data es el específico
            monto_total: String(row.monto_total), // El 'core'
            moneda: row.moneda,
            fecha_firma: row.fecha_firma ? new Date(row.fecha_firma).toISOString().split('T')[0] : null, // La firma final
            fecha_inicio: row.fecha_inicio,
            fecha_fin: row.fecha_fin,
            condiciones_pago: row.condiciones_pago, // ¿O usar el de template_data? Decide fuente de verdad
            garantias: row.garantias,             // ¿O usar el de template_data? Decide fuente de verdad
            // --- Proveedor ---
            proveedor: proveedorDetallado,
            // --- Template Data Parseado ---
            template_data: parsedTemplateData as any, // Castear si es necesario por tipo unión
             // --- Campos Display (generados como antes o leídos de template_data) ---
             // Ahora puedes usar parsedTemplateData para mejorar los display si quieres
             concurso_display: row.numero_concurso ? `${row.numero_concurso} (${row.nombre_concurso ?? ''})` : (row.id_concurso ? `ID: ${row.id_concurso}` : 'N/A'),
             solicitud_display: row.solicitud_id_ref ? `ID: ${row.solicitud_id_ref}` : 'N/A', // Mejora si tienes más datos
             dictamen_display: row.dictamen_id_ref ? `ID: ${row.dictamen_id_ref}` : 'N/A',   // Mejora si tienes más datos
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
// src/services/contratosService.ts

// ... (imports existentes: sql, VercelPoolClient, getProveedorById, etc.) ...

// ... (getContracts, getContractById, createContractWithTemplateData existentes) ...

// --- ACTUALIZAR UN CONTRATO EXISTENTE (MODIFICADO) ---
// Ahora acepta template_data opcionalmente dentro de ContratoUpdateData
export const updateContract = async (
    idContrato: number,
    data: ContratoUpdateData & { template_data?: Partial<ContratoInputData> | object } // Permite objeto genérico también
): Promise<ContratoDetallado | null> => { // Devuelve el detalle completo actualizado

    console.log(`SERVICE Contratos: updateContract - Iniciando actualización para ID: ${idContrato}`);
    if (isNaN(idContrato)) throw new Error("ID de contrato inválido.");

    // Extrae template_data por separado si existe
    const { template_data, ...coreUpdateData } = data;

    if (Object.keys(coreUpdateData).length === 0 && template_data === undefined) {
        console.warn("SERVICE Contratos: updateContract - No data provided for update.");
        return getContractById(idContrato); // No hay nada que actualizar
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        // --- Construcción dinámica de la query UPDATE ---
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramIndex = 1;

        // Helper para añadir campos CORE a actualizar
        const addUpdateField = (fieldNameDb: keyof ContratoUpdateData, value: any) => {
            // Solo añadir si el valor está definido explícitamente en coreUpdateData
            if (value !== undefined) {
                updateFields.push(`${fieldNameDb} = $${paramIndex++}`);
                // Convertir a null si es necesario para la base de datos
                updateValues.push(value === '' ? null : value);
            }
        };

        // Añadir campos CORE que se quieren actualizar
        // Itera sobre las claves permitidas en ContratoUpdateData (excluyendo template_data)
         for (const key in coreUpdateData) {
             if (Object.prototype.hasOwnProperty.call(coreUpdateData, key) && key !== 'template_data') {
                 addUpdateField(key as keyof ContratoUpdateData, coreUpdateData[key as keyof ContratoUpdateData]);
             }
         }


        // *** Añadir template_data si se proporcionó ***
        let templateDataJsonString: string | null = null;
        if (template_data !== undefined) {
            try {
                // Convertir el objeto template_data a string JSON para guardarlo
                templateDataJsonString = JSON.stringify(template_data);
                updateFields.push(`template_data = $${paramIndex++}`);
                updateValues.push(templateDataJsonString);
                console.log(`SERVICE Contratos: updateContract - Preparing to update template_data for ID: ${idContrato}`);
            } catch (jsonError) {
                console.error(`SERVICE Contratos: updateContract - Error stringifying template_data for ID ${idContrato}:`, jsonError);
                // Decide si lanzar error o continuar sin actualizar template_data
                 await client.sql`ROLLBACK`; // Abortar transacción si el JSON es inválido
                 throw new Error("Error al procesar los datos adicionales (template_data).");
            }
        }

        // Si no hay NINGÚN campo para actualizar (ni core ni template), no hacer nada
        if (updateFields.length === 0) {
            console.warn(`SERVICE Contratos: updateContract - No fields to update after filtering for ID: ${idContrato}`);
            await client.sql`ROLLBACK`;
            return getContractById(idContrato);
        }

        // Añadir siempre la actualización de updated_at si tienes esa columna
        // updateFields.push(`updated_at = NOW()`); // Asumiendo que tienes updated_at

        // Construir y ejecutar la query
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

        // Devolver los datos actualizados completos llamando a getContractById
        return await getContractById(idContrato);

    } catch (error: any) {
        console.error(`SERVICE Contratos: updateContract - Error actualizando contrato ID ${idContrato}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("SERVICE Contratos: updateContract - ROLLBACK ejecutado."); } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
         // Manejar errores específicos de DB
         if (error.code === '23503') { throw new Error(`Error de referencia: ${error.detail || 'Verifique IDs relacionados'}`); }
         if (error.code === '23505') { throw new Error(`Conflicto: ${error.detail || 'Valor único duplicado'}`); }
         if (error.code === '22P02') { throw new Error('Error interno al procesar datos adicionales (JSON).'); }
        throw new Error(`Error al actualizar el contrato: ${error.message || 'Error desconocido'}`);
    } finally {
        if (client) { await client.release(); }
    }
};
/**
 * Crea un nuevo contrato usando datos estructurados y guarda datos adicionales en JSONB.
 * @param coreData - Datos principales que van a las columnas estándar de 'contratos'.
 * @param templateData - Datos adicionales específicos de la plantilla para guardar en JSONB.
 * @returns Promise<{ id_contrato: number }>
 */
export const createContractWithTemplateData = async (
    coreData: Partial<ContratoCreateData>, // Usamos Partial porque algunos campos pueden venir de templateData
    templateData: Omit<ContratoInputData, keyof ContratoCreateData> & { tipoContrato: string } // Datos extra y tipo
): Promise<{ id_contrato: number }> => {

    console.log("SERVICE Contratos: createContractWithTemplateData called.");
    // Extraer datos principales asegurando los requeridos
    const {
        id_proveedor,
        objeto_contrato,
        monto_total,
        numero_contrato = null, // Defaults explícitos para opcionales/nulables
        id_solicitud = null,
        id_dictamen = null,
        id_concurso = null,
        moneda = 'MXN',
        fecha_firma = null,
        fecha_inicio = null,
        fecha_fin = null,
        condiciones_pago = null, // Estos podrían venir de templateData también
        garantias = null         // Estos podrían venir de templateData también
    } = coreData;

     // Validaciones básicas en servicio (complementarias a las de la API)
     if (id_proveedor === undefined || id_proveedor === null) throw new Error("ID Proveedor es requerido en coreData.");
     if (!objeto_contrato) throw new Error("Objeto del contrato es requerido en coreData.");
     if (monto_total === undefined || monto_total === null) throw new Error("Monto total es requerido en coreData.");


    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        // Convertir templateData a JSON string para la columna JSONB
        const templateDataJson = JSON.stringify(templateData);

        const result = await client.sql`
            INSERT INTO public.contratos (
                id_proveedor, objeto_contrato, monto_total, numero_contrato,
                id_solicitud, id_dictamen, id_concurso, moneda, fecha_firma,
                fecha_inicio, fecha_fin, condiciones_pago, garantias,
                template_data -- La nueva columna JSONB
            ) VALUES (
                ${id_proveedor}, ${objeto_contrato}, ${monto_total}, ${numero_contrato},
                ${id_solicitud}, ${id_dictamen}, ${id_concurso}, ${moneda}, ${fecha_firma},
                ${fecha_inicio}, ${fecha_fin}, ${condiciones_pago}, ${garantias},
                ${templateDataJson} -- Insertar el JSON como string
            ) RETURNING id_contrato;
        `;

        const newContratoId = result.rows[0]?.id_contrato;
        if (!newContratoId) {
            throw new Error("Fallo al crear el registro del contrato (template), no se obtuvo ID.");
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Contratos: createContractWithTemplateData - Transacción completada. ID: ${newContratoId}`);
        return { id_contrato: newContratoId };

    } catch (error: any) {
        console.error(`SERVICE Contratos: createContractWithTemplateData - Error`);
        if (client) { try { await client.sql`ROLLBACK`; } catch (rbErr) { console.error("Rollback Error:", rbErr); } }
         // Re-lanzar errores específicos de DB
         if (error.code === '23503') { throw new Error(`Error de referencia: ${error.detail || 'Verifique IDs (proveedor, etc.)'}`); }
         if (error.code === '23505') { throw new Error(`Conflicto: ${error.detail || 'Valor único duplicado (ej: num contrato)'}`); }
         if (error.code === '22P02') { // invalid text representation for JSONB
             console.error("Posible error al convertir template_data a JSON:", templateData);
             throw new Error('Error interno al procesar datos adicionales del contrato.');
         }
        throw new Error(`Error en servicio al crear contrato (template): ${error.message || 'Error desconocido'}`);
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