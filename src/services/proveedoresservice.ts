import { sql, VercelPoolClient, db } from '@vercel/postgres'; // Assuming db might be used, if not, remove it.
import { triggerPusherEvent } from '../lib/pusher-server';

// --- INTERFACES ADAPTADAS ---

// Interfaz para un representante legal (como se recibe/envía en arrays)
export interface Proveedor {
    id_proveedor: number;
    nombre_o_razon_social: string;
    rfc: string;
}

// Interfaz para un representante legal (Input)
interface RepresentanteLegalInput {
    id_morales?: number; // PK de la fila en proveedores_morales
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante?: string | null;
}

// Interfaz para datos devueltos (ahora con array de representantes)
export interface ProveedorDetallado {
    id_proveedor: number;
    rfc?: string;
    giro_comercial?: string;
    correo?: string;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    fecha_inscripcion?: string | null;
    fecha_vigencia?: string | null;
    estatus?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    fecha_solicitud?: string | null;
    calle?: string;
    numero?: string;
    colonia?: string;
    codigo_postal?: string;
    municipio?: string;
    estado?: string;
    telefono_uno?: string;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    id_usuario_proveedor?: number | null;
    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;
    estatus_revision?: string | null;
    razon_social?: string | null; // Moral
    // Estos campos de representante individual en ProveedorDetallado son redundantes si usamos el array 'representantes'
    // nombre_representante?: string | null;
    // apellido_p_representante?: string | null;
    // apellido_m_representante?: string | null;
    nombre_fisica?: string | null; // Fisica
    apellido_p_fisica?: string | null; // Fisica
    apellido_m_fisica?: string | null; // Fisica
    curp?: string | null; // Fisica
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    representantes?: RepresentanteLegalOutput[];
    nombre_o_razon_social?: string; // Campo combinado
    domicilio?: string | null; // Campo combinado

    [key: string]: unknown; // CORREGIDO: any -> unknown
}

// Interfaz para la info de un representante devuelta por la API/Servicio
interface RepresentanteLegalOutput {
    id_morales: number; // PK de la fila en proveedores_morales
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
}


// Interface para crear proveedor (ADAPTADA)
interface CreateProveedorData {
    id_usuario_proveedor: number;
    rfc: string; giro_comercial: string; correo: string; calle: string; numero: string; colonia: string; codigo_postal: string; municipio: string; estado: string; telefono_uno: string; actividadSat: string;
    telefono_dos?: string | null; pagina_web?: string | null; camara_comercial?: string | null; numero_registro_camara?: string | null; numero_registro_imss?: string | null; proveedorEventos?: boolean;
    tipoProveedor: 'moral' | 'fisica';
    nombre?: string; apellido_p?: string; curp?: string; apellido_m?: string | null; // Fisica
    razon_social?: string; // Moral
    representantes?: RepresentanteLegalInput[]; // Moral
}


// Interface para actualizar proveedor
interface UpdateProveedorData {
    rfc?: string; giro_comercial?: string; correo?: string; calle?: string; numero?: string; colonia?: string; codigo_postal?: string; municipio?: string; estado?: string; telefono_uno?: string; actividadSat?: string | null;
    telefono_dos?: string | null; pagina_web?: string | null; camara_comercial?: string | null; numero_registro_camara?: string | null; numero_registro_imss?: string | null; proveedorEventos?: boolean; estatus?: boolean;
    tipoProveedor: 'moral' | 'fisica';
    nombre?: string; apellido_p?: string; curp?: string; apellido_m?: string | null; // Fisica
    razon_social?: string; // Moral
    representantes?: RepresentanteLegalInput[]; // Moral
    [key: string]: unknown; // CORREGIDO: any -> unknown
}

// --- Tipo para la fila cruda de la base de datos ---
interface ProveedorDbBaseRow {
    id_proveedor: number;
    rfc: string | null;
    giro_comercial: string | null;
    correo: string | null;
    camara_comercial: string | null;
    numero_registro_camara: string | null;
    numero_registro_imss: string | null;
    fecha_inscripcion: string | null;
    fecha_vigencia: string | null;
    estatus: boolean | string; // Podría ser string 'true'/'false' desde algunas DB drivers
    created_at: string | null;
    updated_at: string | null;
    fecha_solicitud: string | null;
    calle: string | null;
    numero: string | null;
    colonia: string | null;
    codigo_postal: string | null;
    municipio: string | null;
    estado: string | null;
    telefono_uno: string | null;
    telefono_dos: string | null;
    pagina_web: string | null;
    id_usuario_proveedor: number | null;
    actividad_sat: string | null;
    proveedor_eventos: boolean | string | null;
    estatus_revision: string | null;
}

interface ProveedorMoralDbFields {
    id_morales: number | null;
    razon_social: string | null;
    nombre_representante: string | null;
    apellido_p_representante: string | null;
    apellido_m_representante: string | null;
}

interface PersonaFisicaDbFields {
    id_fisicas: number | null;
    nombre_fisica: string | null;
    apellido_p_fisica: string | null;
    apellido_m_fisica: string | null;
    curp: string | null;
}

type ProveedorDbRow = ProveedorDbBaseRow & ProveedorMoralDbFields & PersonaFisicaDbFields;


// --- FUNCIONES getProveedorById / getProveedorByUserId (ADAPTADAS) ---

const procesarResultadoProveedor = (rows: ProveedorDbRow[]): ProveedorDetallado | null => { // CORREGIDO: any[] -> ProveedorDbRow[]
    if (!rows || rows.length === 0) {
        return null;
    }
    const firstRow = rows[0]; // firstRow es ahora de tipo ProveedorDbRow
    const tipo = firstRow.razon_social ? 'moral' : (firstRow.nombre_fisica ? 'fisica' : 'desconocido');

    let nombreCombinado = 'Desconocido';
    if (tipo === 'moral' && firstRow.razon_social) {
        nombreCombinado = firstRow.razon_social;
    } else if (tipo === 'fisica' && firstRow.nombre_fisica && firstRow.apellido_p_fisica) {
        nombreCombinado = `${firstRow.nombre_fisica} ${firstRow.apellido_p_fisica} ${firstRow.apellido_m_fisica || ''}`.trim();
    } else if (firstRow.rfc) {
        nombreCombinado = firstRow.rfc;
    }

    const domicilioParts = [firstRow.calle, firstRow.numero, firstRow.colonia, firstRow.codigo_postal, firstRow.municipio, firstRow.estado].filter(Boolean);
    const domicilioCombinado = domicilioParts.length > 0 ? domicilioParts.join(', ') : null;

    const proveedorBase: ProveedorDetallado = {
        id_proveedor: firstRow.id_proveedor,
        rfc: firstRow.rfc ?? undefined,
        giro_comercial: firstRow.giro_comercial ?? undefined,
        correo: firstRow.correo ?? undefined,
        camara_comercial: firstRow.camara_comercial,
        numero_registro_camara: firstRow.numero_registro_camara,
        numero_registro_imss: firstRow.numero_registro_imss,
        fecha_inscripcion: firstRow.fecha_inscripcion,
        fecha_vigencia: firstRow.fecha_vigencia,
        estatus: typeof firstRow.estatus === 'string' ? firstRow.estatus.toLowerCase() === 'true' : firstRow.estatus,
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at,
        fecha_solicitud: firstRow.fecha_solicitud,
        calle: firstRow.calle ?? undefined,
        numero: firstRow.numero ?? undefined,
        colonia: firstRow.colonia ?? undefined,
        codigo_postal: firstRow.codigo_postal ?? undefined,
        municipio: firstRow.municipio ?? undefined,
        estado: firstRow.estado ?? undefined,
        telefono_uno: firstRow.telefono_uno ?? undefined,
        telefono_dos: firstRow.telefono_dos,
        pagina_web: firstRow.pagina_web,
        id_usuario_proveedor: firstRow.id_usuario_proveedor,
        actividad_sat: firstRow.actividad_sat,
        proveedor_eventos: typeof firstRow.proveedor_eventos === 'string' ? firstRow.proveedor_eventos.toLowerCase() === 'true' : (firstRow.proveedor_eventos ?? null),
        estatus_revision: firstRow.estatus_revision,
        tipo_proveedor: tipo,
        nombre_fisica: tipo === 'fisica' ? firstRow.nombre_fisica : null,
        apellido_p_fisica: tipo === 'fisica' ? firstRow.apellido_p_fisica : null,
        apellido_m_fisica: tipo === 'fisica' ? firstRow.apellido_m_fisica : null,
        curp: tipo === 'fisica' ? firstRow.curp : null,
        razon_social: tipo === 'moral' ? firstRow.razon_social : null,
        representantes: tipo === 'moral' ? [] : undefined,
        nombre_o_razon_social: nombreCombinado,
        domicilio: domicilioCombinado,
    };

    if (tipo === 'moral' && proveedorBase.representantes) { // Asegurar que representantes existe
        const repsMap = new Map<number, RepresentanteLegalOutput>();
        rows.forEach(row => {
            if (row.id_morales != null && !repsMap.has(row.id_morales)) { // Evitar duplicados si el JOIN produce múltiples filas para el mismo representante
                repsMap.set(row.id_morales, {
                    id_morales: row.id_morales,
                    nombre_representante: row.nombre_representante,
                    apellido_p_representante: row.apellido_p_representante,
                    apellido_m_representante: row.apellido_m_representante,
                });
            }
        });
        proveedorBase.representantes = Array.from(repsMap.values());
    }

    return proveedorBase;
};

export const getProveedorById = async (id: number): Promise<ProveedorDetallado | null> => {
    console.log(`DEBUG Service: getProveedorById: Fetching provider by ID: ${id}`);
    try {
        if (isNaN(id)) throw new Error("ID de proveedor inválido.");
        const result = await sql<ProveedorDbRow>`
          SELECT p.*, m.id_morales, m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
                 f.id_fisicas, f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
          FROM proveedores p LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
                             LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
          WHERE p.id_proveedor = ${id};`;
        return procesarResultadoProveedor(result.rows);
    } catch (error: unknown) { // CORREGIDO
        console.error(`Error fetching proveedor by ID ${id}:`, error);
        const message = 'Error al obtener datos del proveedor.';
        if (error instanceof Error) {
            // message = error.message; // Podrías usar el mensaje original si es seguro
        }
        throw new Error(message);
    }
};

export const getProveedorByUserId = async (id_usuario_proveedor: number): Promise<ProveedorDetallado | null> => {
    console.log(`DEBUG Service: getProveedorByUserId: Fetching provider profile for user ID: ${id_usuario_proveedor}`);
    try {
        if (isNaN(id_usuario_proveedor)) throw new Error("ID de usuario proveedor inválido.");
        const result = await sql<ProveedorDbRow>`
          SELECT p.*, m.id_morales, m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
                 f.id_fisicas, f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
          FROM proveedores p LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
                             LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
          WHERE p.id_usuario_proveedor = ${id_usuario_proveedor};`;
        return procesarResultadoProveedor(result.rows);
    } catch (error: unknown) { // CORREGIDO
        console.error(`Error fetching provider profile by user ID ${id_usuario_proveedor}:`, error);
        const message = 'Error al obtener el perfil del proveedor por usuario.';
        if (error instanceof Error) {
            // message = error.message;
        }
        throw new Error(message);
    }
};


// --- createProveedorCompleto (ADAPTADO) ---
export const createProveedorCompleto = async (data: CreateProveedorData): Promise<{ id_proveedor: number }> => {
    const {
        id_usuario_proveedor, tipoProveedor,
        rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal, municipio, estado, telefono_uno, actividadSat, telefono_dos, pagina_web, camara_comercial, numero_registro_camara, numero_registro_imss, proveedorEventos,
        nombre, apellido_p, apellido_m, curp,
        razon_social, representantes
    } = data;

    if (tipoProveedor === 'moral' && (!razon_social || !representantes || representantes.length === 0)) {
        throw new Error("Para Persona Moral: Razón Social y al menos un Representante son requeridos.");
    }
    if (tipoProveedor === 'fisica' && (!nombre || !apellido_p || !curp)) {
        throw new Error("Para Persona Física: Nombre, Apellido P y CURP son requeridos.");
    }
    if (!actividadSat) { throw new Error("Actividad SAT requerida."); }

    let client: VercelPoolClient | null = null;
    let newProveedorId: number | null = null;

    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log(`SERVICE Create: Iniciando registro para user ID: ${id_usuario_proveedor}, Tipo: ${tipoProveedor}`);

        const proveedorResult = await client.sql<{ id_proveedor: number }>`
          INSERT INTO proveedores (
              rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal, municipio, estado, telefono_uno, telefono_dos, pagina_web, camara_comercial, numero_registro_camara, numero_registro_imss, actividad_sat, proveedor_eventos, estatus, id_usuario_proveedor, created_at, updated_at, fecha_solicitud
          ) VALUES (
              ${rfc}, ${giro_comercial}, ${correo}, ${calle}, ${numero}, ${colonia}, ${codigo_postal}, ${municipio}, ${estado}, ${telefono_uno}, ${telefono_dos ?? null}, ${pagina_web ?? null}, ${camara_comercial ?? null}, ${numero_registro_camara ?? null}, ${numero_registro_imss ?? null}, ${actividadSat}, ${proveedorEventos ?? false}, ${true}, ${id_usuario_proveedor}, NOW(), NOW(), NOW()
          ) RETURNING id_proveedor;
      `;
        newProveedorId = proveedorResult.rows[0]?.id_proveedor;
        if (!newProveedorId) { throw new Error("Fallo al crear registro principal del proveedor."); }
        console.log(`SERVICE Create: Registro en 'proveedores' creado con ID: ${newProveedorId}`);

        if (tipoProveedor === 'moral') {
            if (!representantes || representantes.length === 0) { throw new Error("Se requiere al menos un representante para proveedor moral."); }
            if (!razon_social) { throw new Error("Se requiere razón social para proveedor moral."); }

            console.log(`SERVICE Create: Insertando ${representantes.length} representante(s) para ID: ${newProveedorId}`);
            for (const rep of representantes) {
                if (!rep.nombre_representante || !rep.apellido_p_representante) {
                    throw new Error("Cada representante debe tener al menos nombre y apellido paterno.");
                }
                await client.sql`
                  INSERT INTO proveedores_morales (id_proveedor, razon_social, nombre_representante, apellido_p_representante, apellido_m_representante)
                  VALUES (${newProveedorId}, ${razon_social}, ${rep.nombre_representante}, ${rep.apellido_p_representante}, ${rep.apellido_m_representante ?? null});
              `;
            }
            console.log(`SERVICE Create: Inserciones en 'proveedores_morales' completadas para ID: ${newProveedorId}`);

        } else if (tipoProveedor === 'fisica') {
            await client.sql`
            INSERT INTO personas_fisicas (id_proveedor, nombre, apellido_p, apellido_m, curp)
            VALUES (${newProveedorId}, ${nombre}, ${apellido_p}, ${apellido_m ?? null}, ${curp});
          `;
            console.log(`SERVICE Create: Inserción en 'personas_fisicas' completada para ID: ${newProveedorId}`);
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Create: Transacción completada para ID: ${newProveedorId}`);
        return { id_proveedor: newProveedorId };

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error(`SERVICE Create: Error durante el registro para user ID: ${id_usuario_proveedor}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("SERVICE Create: ROLLBACK ejecutado."); } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        
        let message = "Error desconocido en el registro.";
        let code: string | undefined;
        let constraint: string | undefined;
        let detail: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message;
            const errAsAny = errUnknown as any; // Para acceder a propiedades específicas de error de DB
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.constraint === 'string') constraint = errAsAny.constraint;
            if (typeof errAsAny.detail === 'string') detail = errAsAny.detail;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        console.error(`Error creando proveedor:`, errUnknown); // Log el error original

        if (code === '23505' && constraint?.includes('proveedores_id_usuario_proveedor')) {
            throw new Error('Este usuario ya tiene un perfil de proveedor registrado.');
        }
        if (code === '23503') {
            console.error("Error FK Detectado:", detail);
            throw new Error(`Error de referencia: ${detail || message}`);
        }
        throw new Error(`Error en el registro: ${message}`);
    } finally {
        if (client) { await client.release(); }
    }
};


// --- updateProveedorCompleto ---
export const updateProveedorCompleto = async (
    id_proveedor: number,
    proveedorData: UpdateProveedorData
): Promise<ProveedorDetallado | null> => {
    const {
        tipoProveedor,
        rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal, municipio, estado, telefono_uno, actividadSat, telefono_dos, pagina_web, camara_comercial, numero_registro_camara, numero_registro_imss, proveedorEventos, estatus,
        nombre, apellido_p, apellido_m, curp,
        razon_social, representantes
    } = proveedorData;

    if (isNaN(id_proveedor)) throw new Error("ID de proveedor inválido.");
    if (!tipoProveedor || (tipoProveedor !== 'moral' && tipoProveedor !== 'fisica')) {
        throw new Error("Tipo de proveedor ('moral' o 'fisica') es requerido para la actualización.");
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log(`SERVICE Update: Iniciando actualización para ID: ${id_proveedor}, Tipo: ${tipoProveedor}`);
        console.log("SERVICE Update: Datos recibidos:", JSON.stringify(proveedorData, null, 2));

        const updateFieldsProveedores: string[] = [];
        const updateValuesProveedores: (string | boolean | number | null)[] = []; // CORREGIDO
        let paramIndexProveedores = 1;
        
        const addUpdateField = (fieldNameDb: string, value: string | boolean | number | null | undefined) => { // CORREGIDO
            if (value !== undefined) { 
                updateFieldsProveedores.push(`${fieldNameDb} = $${paramIndexProveedores++}`); 
                updateValuesProveedores.push(value); 
            }
        };
        addUpdateField('rfc', rfc); addUpdateField('giro_comercial', giro_comercial); addUpdateField('correo', correo); addUpdateField('calle', calle); addUpdateField('numero', numero); addUpdateField('colonia', colonia); addUpdateField('codigo_postal', codigo_postal); addUpdateField('municipio', municipio); addUpdateField('estado', estado); addUpdateField('telefono_uno', telefono_uno); addUpdateField('telefono_dos', telefono_dos); addUpdateField('pagina_web', pagina_web); addUpdateField('camara_comercial', camara_comercial); addUpdateField('numero_registro_camara', numero_registro_camara); addUpdateField('numero_registro_imss', numero_registro_imss); addUpdateField('actividad_sat', actividadSat); addUpdateField('proveedor_eventos', proveedorEventos);
        if (estatus !== undefined) { addUpdateField('estatus', typeof estatus === 'boolean' ? estatus : (String(estatus).toLowerCase() === 'true')); }


        if (updateFieldsProveedores.length > 0) {
            updateFieldsProveedores.push(`updated_at = NOW()`);
            const updateQueryProveedores = `UPDATE proveedores SET ${updateFieldsProveedores.join(', ')} WHERE id_proveedor = $${paramIndexProveedores}`;
            updateValuesProveedores.push(id_proveedor);
            const provResult = await client.query(updateQueryProveedores, updateValuesProveedores);
            if (provResult.rowCount === 0) throw new Error(`Proveedor con ID ${id_proveedor} no encontrado.`);
            console.log(`SERVICE Update: Tabla 'proveedores' actualizada.`);
        } else {
            console.log(`SERVICE Update: Sin campos comunes que actualizar en 'proveedores', actualizando solo timestamp.`);
            await client.sql`UPDATE proveedores SET updated_at = NOW() WHERE id_proveedor = ${id_proveedor}`;
        }

        if (tipoProveedor === 'moral') {
            console.log(`SERVICE Update: Procesando tipo MORAL.`);
            let razonSocialActual = razon_social;
            if (razonSocialActual !== undefined) {
                console.log(`SERVICE Update: Actualizando razon_social a "${razonSocialActual}" para ID ${id_proveedor}`);
                await client.sql`UPDATE proveedores_morales SET razon_social = ${razonSocialActual} WHERE id_proveedor = ${id_proveedor};`;
            } else {
                const currentMoralData = await client.sql<{razon_social: string}>`SELECT razon_social FROM proveedores_morales WHERE id_proveedor = ${id_proveedor} LIMIT 1;`;
                razonSocialActual = currentMoralData.rows[0]?.razon_social;
                if (razonSocialActual === undefined) console.warn(`WARN Service Update: No se encontró razon_social existente para ID ${id_proveedor} y no se proporcionó una nueva.`);
            }

            const repsEntrantes = representantes ?? [];
            // const idsEntrantesConId = new Set(repsEntrantes.filter(r => r.id_morales != null).map(r => r.id_morales!)); // CORREGIDO: Eliminada variable no usada

            const { rows: repsExistentesDb } = await client.sql<RepresentanteLegalOutput>`
                SELECT id_morales, nombre_representante, apellido_p_representante, apellido_m_representante
                FROM proveedores_morales WHERE id_proveedor = ${id_proveedor};
            `;
            const mapaExistentes = new Map(repsExistentesDb.map(r => [r.id_morales, r]));
            console.log(`SERVICE Update: ${repsExistentesDb.length} representantes existentes en BD.`);
            console.log(`SERVICE Update: ${repsEntrantes.length} representantes recibidos para actualizar/insertar.`);

            for (const repIn of repsEntrantes) {
                if (!repIn.nombre_representante || !repIn.apellido_p_representante) {
                    console.warn("SERVICE Update: Saltando representante sin nombre o apellido paterno:", repIn);
                    continue;
                }
                if (repIn.id_morales != null && mapaExistentes.has(repIn.id_morales)) {
                    console.log(`SERVICE Update: Actualizando representante (id_morales: ${repIn.id_morales})`);
                    await client.sql`
                        UPDATE proveedores_morales SET
                            nombre_representante = ${repIn.nombre_representante},
                            apellido_p_representante = ${repIn.apellido_p_representante},
                            apellido_m_representante = ${repIn.apellido_m_representante ?? null}
                        WHERE id_morales = ${repIn.id_morales};
                    `;
                    mapaExistentes.delete(repIn.id_morales);
                } else {
                    if (razonSocialActual === undefined) throw new Error("No se puede insertar representante sin una razón social definida (ni nueva ni existente).");
                    console.log(`SERVICE Update: Insertando nuevo representante para ID ${id_proveedor}`);
                    await client.sql`
                        INSERT INTO proveedores_morales (id_proveedor, razon_social, nombre_representante, apellido_p_representante, apellido_m_representante)
                        VALUES (${id_proveedor}, ${razonSocialActual}, ${repIn.nombre_representante}, ${repIn.apellido_p_representante}, ${repIn.apellido_m_representante ?? null});
                    `;
                }
            }

            const idsParaEliminar = Array.from(mapaExistentes.keys());
            if (idsParaEliminar.length > 0) {
                console.log(`SERVICE Update: Eliminando ${idsParaEliminar.length} representante(s) obsoletos:`, idsParaEliminar);
                await client.query(`DELETE FROM proveedores_morales WHERE id_morales = ANY($1::int[])`, [idsParaEliminar]);
            } else {
                console.log(`SERVICE Update: No hay representantes obsoletos para eliminar.`);
            }

        } else if (tipoProveedor === 'fisica') {
            console.log(`SERVICE Update: Procesando tipo FISICA.`);
            const updateFieldsFisicas: string[] = [];
            const updateValuesFisicas: (string | null)[] = []; // CORREGIDO
            let paramIndexFisicas = 1;
            const addUpdateFieldFisica = (fieldNameDb: string, value: string | null | undefined) => { // CORREGIDO
                if (value !== undefined) { 
                    updateFieldsFisicas.push(`${fieldNameDb} = $${paramIndexFisicas++}`); 
                    updateValuesFisicas.push(value); 
                }
            };
            addUpdateFieldFisica('nombre', nombre); addUpdateFieldFisica('apellido_p', apellido_p); addUpdateFieldFisica('apellido_m', apellido_m); addUpdateFieldFisica('curp', curp);

            if (updateFieldsFisicas.length > 0) {
                const updateQueryFisicas = `UPDATE personas_fisicas SET ${updateFieldsFisicas.join(', ')} WHERE id_proveedor = $${paramIndexFisicas}`;
                updateValuesFisicas.push(id_proveedor.toString()); // Asegurar que el ID es string para el placeholder
                const resFis = await client.query(updateQueryFisicas, updateValuesFisicas);
                if (resFis.rowCount === 0) console.warn(`WARN Service Update: No se encontró registro en 'personas_fisicas' para ID ${id_proveedor}. Podría ser necesario un INSERT si se cambia de tipo.`);
                else console.log(`SERVICE Update: Tabla 'personas_fisicas' actualizada.`);
            } else {
                console.log(`SERVICE Update: Sin campos que actualizar en 'personas_fisicas'.`);
            }
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Update: Transacción completada (COMMIT) para ID: ${id_proveedor}`);
        return await getProveedorById(id_proveedor);

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error(`SERVICE Update: Error actualizando proveedor ID ${id_proveedor}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("SERVICE Update: ROLLBACK ejecutado."); } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        
        let message = "Error desconocido al actualizar el proveedor.";
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
        console.error("Error detallado en updateProveedorCompleto:", errUnknown);

        if (code === '23503' && constraint === 'fk_proveedor_moral_proveedor_mult') { // Ajusta el nombre del constraint si es diferente
            throw new Error(`Error de referencia: El proveedor con ID ${id_proveedor} no existe o hay un problema de FK con proveedores_morales.`);
        }
        throw new Error(`Error al actualizar el proveedor: ${message}`);
    } finally {
        if (client) { await client.release(); }
    }
};

export const checkProveedorProfileExists = async (id_usuario_proveedor: number): Promise<boolean> => {
    try {
        console.log(`DEBUG Service: Checking profile existence for user ID: ${id_usuario_proveedor}`);
        const result = await sql`
            SELECT 1
            FROM proveedores
            WHERE id_usuario_proveedor = ${id_usuario_proveedor}
            LIMIT 1;
        `;
        const exists = result.rows.length > 0;
        console.log(`DEBUG Service: Profile exists for user ID ${id_usuario_proveedor}: ${exists}`);
        return exists;
    } catch (error: unknown) { // CORREGIDO
        console.error("Error checking provider profile existence:", error);
        // Consider re-throwing or returning a more specific error state
        throw new Error("Error al verificar la existencia del perfil del proveedor.");
    }
};

export const solicitarRevisionProveedor = async (idProveedor: number): Promise<{ id_proveedor: number, estatus_revision: string }> => {
    console.log(`SERVICE (Proveedor): Solicitando revisión para ID: ${idProveedor}`);
    if (isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        interface RevisionUpdateResult {
            id_proveedor: number;
            estatus_revision: string;
            rfc: string;
            nombre_display: string | null;
        }

        const result = await client.sql<RevisionUpdateResult>`
            UPDATE proveedores
            SET
                estatus_revision = 'PENDIENTE_REVISION',
                updated_at = NOW()
            WHERE id_proveedor = ${idProveedor}
              AND (estatus_revision = 'NO_SOLICITADO' OR estatus_revision = 'RECHAZADO' OR estatus_revision IS NULL)
            RETURNING
                id_proveedor,
                estatus_revision,
                rfc,
                (SELECT COALESCE(pf.nombre || ' ' || pf.apellido_p, pm.razon_social)
                 FROM proveedores p2
                 LEFT JOIN personas_fisicas pf ON p2.id_proveedor = pf.id_proveedor
                 LEFT JOIN proveedores_morales pm ON p2.id_proveedor = pm.id_proveedor AND pm.id_morales = (SELECT MIN(id_morales) FROM proveedores_morales WHERE id_proveedor = p2.id_proveedor) -- Para asegurar una sola fila moral
                 WHERE p2.id_proveedor = proveedores.id_proveedor
                 LIMIT 1
                ) AS nombre_display;
        `;

        if (result.rowCount === 0) {
            await client.sql`ROLLBACK`;
            const currentState = await sql<{estatus_revision: string}>`SELECT estatus_revision FROM proveedores WHERE id_proveedor = ${idProveedor}`;
            const currentStatus = currentState.rows[0]?.estatus_revision;
            if (!currentStatus) { throw new Error(`Proveedor con ID ${idProveedor} no encontrado.`); }
            else { throw new Error(`No se pudo solicitar revisión. Estado actual: ${currentStatus}. Solo se puede solicitar desde 'NO SOLICITADO' o 'RECHAZADO'.`); }
        }

        const updatedData = result.rows[0];
        console.log(`SERVICE (Proveedor): BD actualizada para solicitud. Nuevo estado: ${updatedData.estatus_revision}`);

        try {
            const adminChannel = 'admin-notifications';
            const evento = 'cambio_estado_proveedor';
            const notificationPayload = {
                idProveedor: updatedData.id_proveedor,
                rfc: updatedData.rfc,
                nombreProveedor: updatedData.nombre_display || updatedData.rfc,
                nuevoEstatus: updatedData.estatus_revision,
                mensaje: `El proveedor ${updatedData.nombre_display || updatedData.rfc} ha solicitado revisión de documentos/perfil.`,
                timestamp: new Date().toISOString()
            };

            console.log(`SERVICE (Proveedor): Emitiendo evento '${evento}' a canal '${adminChannel}'`);
            await triggerPusherEvent(adminChannel, evento, notificationPayload);
            console.log("SERVICE (Proveedor): Evento para admin emitido exitosamente.");

        } catch (notificationError: unknown) { // CORREGIDO
            console.error(`SERVICE (Proveedor) ERROR: Fallo al emitir notificación Pusher al admin para ID ${idProveedor}:`, notificationError);
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE (Proveedor): Transacción COMMIT para solicitud ID: ${idProveedor}.`);

        return {
            id_proveedor: updatedData.id_proveedor,
            estatus_revision: updatedData.estatus_revision
        };

    } catch (errUnknown: unknown) { // CORREGIDO
        if (client) { try { await client.sql`ROLLBACK`; } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        console.error(`SERVICE ERROR en solicitarRevisionProveedor ID ${idProveedor}:`, errUnknown);
        let message = 'Error desconocido al solicitar la revisión.';
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al solicitar la revisión: ${message}`);
    } finally {
        if (client) { await client.release(); }
    }
};

export const getProveedoresForSelect = async (): Promise<{ id: number; label: string }[]> => {
    console.log("SERVICE Proveedores: getProveedoresForSelect called");
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
        console.log(`SERVICE Proveedores: Found ${result.rows.length} active providers for select.`);
        return result.rows.map(row => ({
            id: row.id,
            label: row.label?.trim() || `ID: ${row.id}`
        }));

    } catch (error: unknown) { // CORREGIDO
        console.error("SERVICE Proveedores: Error fetching providers for select:", error);
        throw new Error('Error al obtener la lista de proveedores para selección.');
    }
};

export const buscarProveedoresPorTermino = async (term: string): Promise<Proveedor[]> => {
    const logPrefix = `SERVICE buscarProveedoresPorTermino (Term: ${term}):`;
    console.log(logPrefix);

    if (!term || term.trim().length < 3) {
        console.log(`${logPrefix} Search term too short.`);
        return [];
    }

    const likeTerm = `%${term.trim()}%`;
    const params: string[] = [];
    let paramIndex = 1;
    const whereClauses = [
        `p.rfc ILIKE $${paramIndex++}`,
        `pm.razon_social ILIKE $${paramIndex++}`,
        `pf.nombre ILIKE $${paramIndex++}`,
        `pf.apellido_p ILIKE $${paramIndex++}`,
        `pf.apellido_m ILIKE $${paramIndex++}`,
    ];
    for (let i = 0; i < (paramIndex -1) ; i++) { // Corrected loop limit
        params.push(likeTerm);
    }

    const queryString = `
        SELECT DISTINCT
            p.id_proveedor,
            p.rfc,
            COALESCE(
                pm.razon_social,
                TRIM(CONCAT(pf.nombre, ' ', pf.apellido_p, ' ', pf.apellido_m)),
                p.rfc
            ) AS nombre_o_razon_social
        FROM proveedores p
        LEFT JOIN (
            SELECT DISTINCT ON (id_proveedor) id_proveedor, razon_social
            FROM proveedores_morales
        ) pm ON p.id_proveedor = pm.id_proveedor
        LEFT JOIN personas_fisicas pf ON p.id_proveedor = pf.id_proveedor
        WHERE
            p.estatus = true
            AND (${whereClauses.join(' OR ')})
        ORDER BY nombre_o_razon_social ASC
        LIMIT 15;
    `;

    try {
        console.log(`${logPrefix} Executing query with ${params.length} params: ${params.join(', ')}`);
        const result = await sql.query<Proveedor>(queryString, params);

        console.log(`${logPrefix} Found ${result.rowCount} results.`);
        return result.rows;

    } catch (errUnknown: unknown) { // CORREGIDO
        console.error(`${logPrefix} Error executing query:`, errUnknown);
        let message = "Error desconocido al buscar proveedores.";
        if (errUnknown instanceof Error) {
            message = errUnknown.message;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        throw new Error(`Error al buscar proveedores: ${message}`);
    }
};