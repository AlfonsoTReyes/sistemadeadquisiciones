// src/services/proveedoresservice.ts
import { sql, VercelPoolClient, db } from '@vercel/postgres';
import { triggerPusherEvent } from '../lib/pusher-server'; // Ajusta ruta
import bcrypt from 'bcryptjs';

// --- INTERFACES (Definir o asegurar que existen en otro lugar) ---
export interface ProveedorCompletoData { // Export if used elsewhere
    id_proveedor: number;
    rfc?: string | null;
    giro_comercial?: string | null;
    correo?: string | null;
    calle?: string | null;
    numero?: string | null;
    colonia?: string | null;
    codigo_postal?: string | null;
    municipio?: string | null;
    estado?: string | null;
    telefono_uno?: string | null;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    fecha_inscripcion?: string | null;
    fecha_vigencia?: string | null;
    estatus?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    fecha_solicitud?: string | null;
    id_usuario_proveedor?: number | null;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    estatus_revision?: string | null;
    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;
    razon_social?: string | null;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    representantes?: RepresentanteLegalOutput[];
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;
    [key: string]: any; // Consider replacing 'any' with 'unknown' or a more specific type
}
interface RepresentanteLegalOutput {
    id_morales: number;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
}
interface RepresentanteLegalInput {
    id_morales?: number;
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante?: string | null;
}
interface UpdateProveedorAdminData {
    id_proveedor: number;
    tipoProveedor: 'moral' | 'fisica';
    rfc?: string;
    giro_comercial?: string;
    correo?: string;
    calle?: string;
    numero?: string;
    colonia?: string;
    codigo_postal?: string;
    municipio?: string;
    estado?: string;
    telefono_uno?: string;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    actividadSat?: string | null;
    proveedorEventos?: boolean;
    estatus_revision?: string | null;
    razon_social?: string;
    representantes?: RepresentanteLegalInput[];
    nombre_representante?: string;
    apellido_p_representante?: string;
    apellido_m_representante?: string | null;
    nombre?: string;
    apellido_p?: string;
    apellido_m?: string | null;
    curp?: string;
    [key: string]: any; // Consider replacing 'any' with 'unknown'
}
interface ProveedorAdminListData {
    id_proveedor: number;
    rfc?: string | null;
    correo?: string | null;
    estatus?: boolean | null;
    estatus_revision?: string | null;
    telefono?: string | null;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    nombre_display?: string | null;
    razon_social?: string | null;
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
}

// Helper function (ensure this is defined or imported if used elsewhere)
// This is a simplified version based on your usage in getProveedorById
const procesarResultadoProveedor = (rows: any[]): ProveedorCompletoData | null => {
    if (!rows || rows.length === 0) {
        console.log("procesarResultadoProveedor: No rows received, returning null.");
        return null;
    }
    const firstRow = rows[0];
    const tipo: 'moral' | 'fisica' | 'desconocido' =
        firstRow.razon_social != null ? 'moral' :
        (firstRow.nombre_fisica != null ? 'fisica' : 'desconocido');

    const proveedorBase: ProveedorCompletoData = {
        id_proveedor: firstRow.id_proveedor,
        rfc: firstRow.rfc,
        giro_comercial: firstRow.giro_comercial,
        correo: firstRow.correo,
        camara_comercial: firstRow.camara_comercial,
        numero_registro_camara: firstRow.numero_registro_camara,
        numero_registro_imss: firstRow.numero_registro_imss,
        fecha_inscripcion: firstRow.fecha_inscripcion,
        fecha_vigencia: firstRow.fecha_vigencia,
        estatus: firstRow.estatus,
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at,
        fecha_solicitud: firstRow.fecha_solicitud,
        calle: firstRow.calle,
        numero: firstRow.numero,
        colonia: firstRow.colonia,
        codigo_postal: firstRow.codigo_postal,
        municipio: firstRow.municipio,
        estado: firstRow.estado,
        telefono_uno: firstRow.telefono_uno,
        telefono_dos: firstRow.telefono_dos,
        pagina_web: firstRow.pagina_web,
        id_usuario_proveedor: firstRow.id_usuario_proveedor,
        actividad_sat: firstRow.actividad_sat,
        proveedor_eventos: firstRow.proveedor_eventos,
        tipo_proveedor: tipo,
        estatus_revision: firstRow.estatus_revision,
        nombre_fisica: tipo === 'fisica' ? firstRow.nombre_fisica : null,
        apellido_p_fisica: tipo === 'fisica' ? firstRow.apellido_p_fisica : null,
        apellido_m_fisica: tipo === 'fisica' ? firstRow.apellido_m_fisica : null,
        curp: tipo === 'fisica' ? firstRow.curp : null,
        razon_social: tipo === 'moral' ? firstRow.razon_social : null,
        representantes: tipo === 'moral' ? [] : undefined,
    };

    if (tipo === 'moral' && proveedorBase.representantes) {
        proveedorBase.representantes = rows
            .filter(row => row.id_morales != null)
            .map(row => ({
                id_morales: row.id_morales,
                nombre_representante: row.nombre_representante,
                apellido_p_representante: row.apellido_p_representante,
                apellido_m_representante: row.apellido_m_representante,
            }));
    }
    return proveedorBase;
};


export const getAllProveedoresForAdmin = async (): Promise<ProveedorAdminListData[]> => {
    console.log("SERVICE: getAllProveedoresForAdmin called");
    try {
        const result = await sql`
            SELECT DISTINCT ON (p.id_proveedor)
                p.id_proveedor,
                p.rfc,
                p.correo,
                p.estatus,
                p.estatus_revision,
                p.telefono_uno, 
                m.razon_social,
                f.nombre AS nombre_fisica,
                f.apellido_p AS apellido_p_fisica,
                f.apellido_m AS apellido_m_fisica,
                m.razon_social IS NOT NULL AS es_moral,
                f.nombre IS NOT NULL AS es_fisica,
                COALESCE(m.razon_social, CONCAT_WS(' ', f.nombre, f.apellido_p, f.apellido_m)) AS nombre_display_calculado
            FROM proveedores p
            LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
            LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
            ORDER BY p.id_proveedor, p.created_at DESC;
        `;

        const proveedoresFormateados = result.rows.map(row => {
            const tipoProveedorDeterminado = row.es_moral ? 'moral' : (row.es_fisica ? 'fisica' : 'desconocido');
            return {
                id_proveedor: row.id_proveedor,
                rfc: row.rfc,
                correo: row.correo,
                estatus: row.estatus,
                estatus_revision: row.estatus_revision,
                telefono: row.telefono_uno,
                tipo_proveedor: tipoProveedorDeterminado,
                razon_social: tipoProveedorDeterminado === 'moral' ? row.razon_social : null,
                nombre_fisica: tipoProveedorDeterminado === 'fisica' ? row.nombre_fisica : null,
                apellido_p_fisica: tipoProveedorDeterminado === 'fisica' ? row.apellido_p_fisica : null,
                apellido_m_fisica: tipoProveedorDeterminado === 'fisica' ? row.apellido_m_fisica : null,
                nombre_display: row.nombre_display_calculado 
            };
        });

        console.log(`SERVICE: Found ${proveedoresFormateados.length} UNIQUE providers for admin list.`);
        return proveedoresFormateados;
    } catch (error: unknown) { // Changed to unknown
        console.error("SERVICE ERROR in getAllProveedoresForAdmin:", error);
        let message = "Error al obtener la lista de proveedores (servicio).";
        if (error instanceof Error) {
            message = error.message || message;
        }
        throw new Error(message);
    }
};

export const updateProveedorEstatus = async (
  idProveedor: number,
  estatus: boolean
): Promise<{ id_proveedor: number; rfc: string | null; estatus: boolean | null; updated_at: string | null; }> => { // Added return type
  console.log(`DEBUG Service: Updating status for provider ID ${idProveedor} to ${estatus}`);
  try {
      if (isNaN(idProveedor)) {
          throw new Error("ID de proveedor inválido proporcionado.");
      }

      const result = await sql`
      UPDATE proveedores
      SET
        estatus = ${estatus},
        updated_at = NOW()
      WHERE id_proveedor = ${idProveedor}
      RETURNING id_proveedor, rfc, estatus, updated_at;
    `;

      if (result.rows.length === 0) {
          throw new Error(`Proveedor con ID ${idProveedor} no encontrado para actualizar.`);
      }

      console.log(`DEBUG Service: Status updated successfully for provider ID ${idProveedor}`);
      return result.rows[0] as { id_proveedor: number; rfc: string | null; estatus: boolean | null; updated_at: string | null; };

  } catch (error: unknown) { // Changed to unknown
      console.error(`Error updating provider status for ID ${idProveedor}:`, error);
      let message = 'Error al actualizar el estatus del proveedor.';
      if (error instanceof Error) {
          message = error.message || message;
      }
      throw new Error(message);
  }
};

export const getProveedorById = async (id: number): Promise<ProveedorCompletoData | null> => {
    console.log(`SERVICE: getProveedorById called for ID ${id}`);
    try {
        if (isNaN(id)) throw new Error("ID inválido.");
        const result = await sql`
            SELECT p.*, m.id_morales, m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
                   f.id_fisicas, f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
            FROM proveedores p
            LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
            LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
            WHERE p.id_proveedor = ${id};
        `;
        return procesarResultadoProveedor(result.rows);
    } catch (error: unknown) {
        console.error(`Error fetching proveedor by ID ${id}:`, error);
        // CORREGIDO: Declarar con const y asignar condicionalmente
        const message = error instanceof Error ? (error.message || 'Error al obtener datos del proveedor.') : 'Error al obtener datos del proveedor.';
        throw new Error(message);
    }
};

export const getProveedorByUserId = async (id_usuario_proveedor: number): Promise<ProveedorCompletoData | null> => {
    console.log(`DEBUG Service: getProveedorByUserId: Fetching provider profile for user ID: ${id_usuario_proveedor}`);
    try {
        if (isNaN(id_usuario_proveedor)) throw new Error("ID de usuario proveedor inválido.");
        const result = await sql`
          SELECT p.*, m.id_morales, m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
                 f.id_fisicas, f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
          FROM proveedores p LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
                             LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
          WHERE p.id_usuario_proveedor = ${id_usuario_proveedor};`;
        return procesarResultadoProveedor(result.rows);
    } catch (error: unknown) {
        console.error(`Error fetching provider profile by user ID ${id_usuario_proveedor}:`, error);
        // CORREGIDO: Declarar con const y asignar condicionalmente
        const message = error instanceof Error ? (error.message || 'Error al obtener el perfil del proveedor por usuario.') : 'Error al obtener el perfil del proveedor por usuario.';
        throw new Error(message);
    }
};

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

    } catch (errUnknown: unknown) {
        console.error(`SERVICE Create: Error durante el registro para user ID: ${id_usuario_proveedor}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("SERVICE Create: ROLLBACK ejecutado."); } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        
        let message = "Error desconocido en el registro.";
        let code: string | undefined;
        let constraint: string | undefined;
        let detail: string | undefined;

        if (errUnknown instanceof Error) {
            message = errUnknown.message || message; 
            const errAsAny = errUnknown as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.constraint === 'string') constraint = errAsAny.constraint;
            if (typeof errAsAny.detail === 'string') detail = errAsAny.detail;
        } else if (typeof errUnknown === 'string') {
            message = errUnknown;
        }
        console.error(`Error creando proveedor:`, errUnknown);

        if (code === '23505' && constraint?.includes('proveedores_id_usuario_proveedor')) {
            throw new Error('Este usuario ya tiene un perfil de proveedor registrado.');
        }
        if (code === '23503') {
            console.error("Error FK Detectado:", detail);
            throw new Error(`Error de referencia: ${detail || message}`);
        }
        throw new Error(message); 
    } finally {
        if (client) { await client.release(); }
    }
};

export const updateProveedorProfileForAdmin = async (
    proveedorData: UpdateProveedorAdminData
): Promise<ProveedorCompletoData | null> => {

    const idProveedor = proveedorData.id_proveedor;
    const tipoProveedor = proveedorData.tipoProveedor;

    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido o faltante.");
    }
    if (!tipoProveedor || (tipoProveedor !== 'moral' && tipoProveedor !== 'fisica')) {
        throw new Error("Tipo de proveedor ('moral' o 'fisica') es requerido.");
    }
    if (tipoProveedor === 'moral' && proveedorData.representantes !== undefined && !Array.isArray(proveedorData.representantes)) {
        throw new Error("El campo 'representantes' debe ser un array si se incluye para proveedor moral.");
    }
     if (tipoProveedor === 'moral' && Array.isArray(proveedorData.representantes)) {
         for(const rep of proveedorData.representantes) {
             if (!rep.nombre_representante?.trim() || !rep.apellido_p_representante?.trim()) {
                 throw new Error("Cada representante debe tener nombre y apellido paterno válidos.");
             }
             if (rep.id_morales !== undefined && (typeof rep.id_morales !== 'number' || isNaN(rep.id_morales))) {
                 throw new Error(`ID de representante (id_morales=${rep.id_morales}) inválido.`);
             }
         }
     }
     if (tipoProveedor === 'fisica' && proveedorData.curp !== undefined && (typeof proveedorData.curp !== 'string' || proveedorData.curp.trim().length !== 18)) {
        throw new Error('Si se incluye "curp", debe ser una cadena de 18 caracteres.');
     }

    console.log(`SERVICE: updateProveedorProfileForAdmin - Iniciando para ID ${idProveedor}, Tipo: ${tipoProveedor}`);

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log("SERVICE: Transacción iniciada.");

        const updateFieldsProveedores: string[] = [];
        const updateValuesProveedores: any[] = [];
        let paramIndexProveedores = 1;

        const addUpdateField = (dbCol: string, value: any) => {
            if (value !== undefined) {
                updateFieldsProveedores.push(`${dbCol} = $${paramIndexProveedores++}`);
                updateValuesProveedores.push(value === null ? null : value);
            }
        };

        addUpdateField('rfc', proveedorData.rfc);
        addUpdateField('giro_comercial', proveedorData.giro_comercial);
        addUpdateField('correo', proveedorData.correo);
        addUpdateField('calle', proveedorData.calle);
        addUpdateField('numero', proveedorData.numero);
        addUpdateField('colonia', proveedorData.colonia);
        addUpdateField('codigo_postal', proveedorData.codigo_postal);
        addUpdateField('municipio', proveedorData.municipio);
        addUpdateField('estado', proveedorData.estado);
        addUpdateField('telefono_uno', proveedorData.telefono_uno);
        addUpdateField('telefono_dos', proveedorData.telefono_dos);
        addUpdateField('pagina_web', proveedorData.pagina_web);
        addUpdateField('camara_comercial', proveedorData.camara_comercial);
        addUpdateField('numero_registro_camara', proveedorData.numero_registro_camara);
        addUpdateField('numero_registro_imss', proveedorData.numero_registro_imss);
        addUpdateField('actividad_sat', proveedorData.actividadSat);
        addUpdateField('proveedor_eventos', proveedorData.proveedorEventos);

        if (updateFieldsProveedores.length > 0) {
            updateFieldsProveedores.push(`updated_at = NOW()`);
            const updateQueryProveedores = `UPDATE proveedores SET ${updateFieldsProveedores.join(', ')} WHERE id_proveedor = $${paramIndexProveedores}`;
            updateValuesProveedores.push(idProveedor);

            console.log(`SERVICE: Ejecutando UPDATE en 'proveedores' (ID: ${idProveedor})`);
            const provResult = await client.query(updateQueryProveedores, updateValuesProveedores);
            if (provResult.rowCount === 0) {
                throw new Error(`Proveedor con ID ${idProveedor} no encontrado en tabla 'proveedores'.`);
            }
            console.log(`SERVICE: Tabla 'proveedores' actualizada.`);
        } else {
            console.log(`SERVICE: Sin campos comunes que actualizar en 'proveedores'.`);
        }

        if (tipoProveedor === 'fisica') {
            const updateFieldsFisicas: string[] = [];
            const updateValuesFisicas: any[] = [];
            let paramIndexFisicas = 1;
            const addUpdateFieldFisica = (dbCol: string, val: any) => { if (val !== undefined) { updateFieldsFisicas.push(`${dbCol} = $${paramIndexFisicas++}`); updateValuesFisicas.push(val); } };

            addUpdateFieldFisica('nombre', proveedorData.nombre);
            addUpdateFieldFisica('apellido_p', proveedorData.apellido_p);
            addUpdateFieldFisica('apellido_m', proveedorData.apellido_m);
            addUpdateFieldFisica('curp', proveedorData.curp);

            if (updateFieldsFisicas.length > 0) {
                 const updateQueryFisicas = `UPDATE personas_fisicas SET ${updateFieldsFisicas.join(', ')} WHERE id_proveedor = $${paramIndexFisicas}`;
                 updateValuesFisicas.push(idProveedor);
                 console.log(`SERVICE: Ejecutando UPDATE en 'personas_fisicas' (ID Prov: ${idProveedor})`);
                 const resFis = await client.query(updateQueryFisicas, updateValuesFisicas);
                 if(resFis.rowCount === 0) console.warn(`WARN SERVICE: No se encontró registro en 'personas_fisicas' para ID Proveedor ${idProveedor}.`);
                 else console.log(`SERVICE: Tabla 'personas_fisicas' actualizada.`);
            } else {
                 console.log(`SERVICE: Sin campos que actualizar en 'personas_fisicas'.`);
            }

        } else if (tipoProveedor === 'moral') {
            console.log(`SERVICE: Procesando actualización para proveedor MORAL (ID: ${idProveedor})`);
            const repsEntrantes = proveedorData.representantes;
            let razonSocialActual = proveedorData.razon_social;

            if (razonSocialActual !== undefined) {
                 if (typeof razonSocialActual !== 'string' || razonSocialActual.trim() === '') {
                     throw new Error("Si se proporciona 'razon_social', no puede estar vacía.");
                 }
                 console.log(`SERVICE: Actualizando razon_social a "${razonSocialActual}" en 'proveedores_morales' para ID Prov: ${idProveedor}`);
                 await client.sql`UPDATE proveedores_morales SET razon_social = ${razonSocialActual} WHERE id_proveedor = ${idProveedor};`;
            } else if (repsEntrantes && repsEntrantes.some(r => r.id_morales === undefined || r.id_morales < 0 )) {
                 console.log(`SERVICE: Obteniendo razon_social actual para nuevos representantes (ID Prov: ${idProveedor})`);
                 const current = await client.sql`SELECT razon_social FROM proveedores_morales WHERE id_proveedor = ${idProveedor} LIMIT 1;`;
                 razonSocialActual = current.rows[0]?.razon_social;
                 console.log(`SERVICE: Razon social actual obtenida: "${razonSocialActual}"`);
                 if(razonSocialActual === undefined || razonSocialActual === null) {
                      throw new Error(`No se puede añadir representantes porque no se encontró una razón social existente para el proveedor ID ${idProveedor} y no se proporcionó una nueva.`);
                 }
            }

            if (repsEntrantes !== undefined) {
                 console.log(`SERVICE: Sincronizando ${repsEntrantes.length} representante(s)...`);
                 const { rows: repsExistentesDb } = await client.sql<{id_morales: number}>`
                    SELECT id_morales FROM proveedores_morales WHERE id_proveedor = ${idProveedor};
                 `;
                 const idsExistentesDb = new Set(repsExistentesDb.map(r => r.id_morales));
                 console.log("SERVICE: IDs existentes en BD:", Array.from(idsExistentesDb));

                 const idsParaMantenerOActualizar = new Set<number>();

                 for (const repIn of repsEntrantes) {
                     if (!repIn.nombre_representante?.trim() || !repIn.apellido_p_representante?.trim()) {
                         console.warn("SERVICE: Saltando representante entrante sin nombre o apellido paterno:", repIn);
                         continue;
                     }
                     const idMoralEntrante = repIn.id_morales;
                     if (idMoralEntrante != null && idMoralEntrante > 0 && idsExistentesDb.has(idMoralEntrante)) {
                         console.log(`SERVICE: Actualizando representante existente (id_morales: ${idMoralEntrante})`);
                         await client.sql`
                             UPDATE proveedores_morales SET
                                 nombre_representante = ${repIn.nombre_representante},
                                 apellido_p_representante = ${repIn.apellido_p_representante},
                                 apellido_m_representante = ${repIn.apellido_m_representante ?? null}
                             WHERE id_morales = ${idMoralEntrante};
                         `;
                         idsParaMantenerOActualizar.add(idMoralEntrante);
                     }
                     else {
                         if(razonSocialActual === undefined || razonSocialActual === null) {
                              throw new Error(`Error crítico: Falta razon_social para insertar nuevo representante ${repIn.nombre_representante}.`);
                         }
                         console.log(`SERVICE: Insertando NUEVO representante: ${repIn.nombre_representante}`);
                         await client.sql`
                             INSERT INTO proveedores_morales
                                (id_proveedor, razon_social, nombre_representante, apellido_p_representante, apellido_m_representante)
                             VALUES
                                (${idProveedor}, ${razonSocialActual}, ${repIn.nombre_representante}, ${repIn.apellido_p_representante}, ${repIn.apellido_m_representante ?? null});
                         `;
                     }
                 }

                 const idsParaEliminar = Array.from(idsExistentesDb).filter(id => !idsParaMantenerOActualizar.has(id));
                 if (idsParaEliminar.length > 0) {
                     console.log(`SERVICE: Eliminando ${idsParaEliminar.length} representante(s) obsoletos:`, idsParaEliminar);
                     await client.query(`DELETE FROM proveedores_morales WHERE id_morales = ANY($1::int[])`, [idsParaEliminar]);
                     console.log(`SERVICE: Representantes obsoletos eliminados.`);
                 } else {
                    console.log(`SERVICE: No hay representantes obsoletos para eliminar.`);
                 }
            } else {
                console.log(`SERVICE: No se proporcionó array 'representantes', no se sincronizarán.`);
            }
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE: Transacción completada (COMMIT) para ID: ${idProveedor}`);
        return await getProveedorById(idProveedor);

    } catch (error: unknown) { // Changed to unknown
        if (client) {
            try { await client.sql`ROLLBACK`; console.log("SERVICE: Transacción revertida (ROLLBACK)."); }
            catch (rbErr) { console.error("Error durante ROLLBACK:", rbErr); }
        }
        console.error(`SERVICE ERROR updateProveedorProfileForAdmin ID ${idProveedor}:`, error);
        let message = `Error al actualizar perfil (Admin): Error desconocido`;
        if (error instanceof Error) {
            message = `Error al actualizar perfil (Admin): ${error.message}`;
        }
        throw new Error(message);
    } finally {
        if (client) {
            await client.release();
            console.log("SERVICE: Conexión liberada.");
        }
    }
};

export const getUsuarioProveedorByProveedorId = async (idProveedor: number): Promise<any | null> => { // Return type can be more specific
    console.log(`SERVICE: getUsuarioProveedorByProveedorId called for proveedor ID ${idProveedor}`);
    try {
        if (isNaN(idProveedor)) {
            throw new Error("ID de proveedor inválido proporcionado al servicio.");
        }
        const result = await sql`
            SELECT up.*
            FROM proveedores p
            JOIN usuarios_proveedores up ON p.id_usuario_proveedor = up.id_usuario
            WHERE p.id_proveedor = ${idProveedor};
        `;

        if (result.rowCount === 0) {
            console.warn(`SERVICE: No associated user found for proveedor ID ${idProveedor} (or provider/link missing).`);
            return null;
        }

        console.log(`SERVICE: Found associated user data for proveedor ID ${idProveedor}. User ID: ${result.rows[0].id_usuario}`);
        return result.rows[0];

    } catch (error: unknown) { // Changed to unknown
        console.error(`SERVICE ERROR in getUsuarioProveedorByProveedorId for proveedor ID ${idProveedor}:`, error);
        let message = "Error al obtener el usuario asociado al proveedor desde el servicio.";
        if (error instanceof Error) {
            message = error.message || message;
        }
        throw new Error(message);
    }
};

export const updateUsuarioProveedor = async (usuarioData: any): Promise<any> => { // Consider specific type for usuarioData and return
    const idUsuario = usuarioData.id_usuario;
    console.log(`SERVICE: updateUsuarioProveedor (Full Update w/ COALESCE) called for user ID ${idUsuario}`);
    console.log(`SERVICE: Received data:`, JSON.stringify(usuarioData, null, 2));

    if (typeof idUsuario !== 'number' || isNaN(idUsuario)) {
        console.error("SERVICE ERROR: Invalid or missing id_usuario.", usuarioData);
        throw new Error("ID de usuario inválido o faltante para actualizar.");
    }

    const requiredFields = ['usuario', 'nombre', 'apellido_p', 'correo', 'estatus'];
    for (const field of requiredFields) {
        if (!usuarioData[field]) {
             console.error(`SERVICE ERROR: Missing required field '${field}'.`, usuarioData);
            throw new Error(`El campo '${field}' es requerido.`);
        }
    }

    try {
        let newHashedPassword: string | null = null;

        if (usuarioData.contraseña && usuarioData.contraseña.trim() !== '') {
            console.log("SERVICE: Hashing new password provided.");
            const saltRounds = 10;
            newHashedPassword = await bcrypt.hash(usuarioData.contraseña, saltRounds);
            console.log("SERVICE: New password hashed.");
        } else {
            console.log("SERVICE: No new password provided, existing password will be kept.");
        }

        console.log("SERVICE: Preparing SQL statement...");
        const result = await sql`
            UPDATE usuarios_proveedores
            SET
                usuario = ${usuarioData.usuario},
                nombre = ${usuarioData.nombre},
                apellido_p = ${usuarioData.apellido_p},
                apellido_m = ${usuarioData.apellido_m ?? null},
                correo = ${usuarioData.correo},
                estatus = ${usuarioData.estatus},
                contraseña = COALESCE(${newHashedPassword}, contraseña),
                updated_at = NOW()
            WHERE id_usuario = ${idUsuario}
            RETURNING
                id_usuario, usuario, nombre, apellido_p, apellido_m, correo, estatus, created_at, updated_at;
        `;

        console.log("SERVICE: SQL statement executed.");

        if (result.rowCount === 0) {
            console.warn(`SERVICE: User not found for update. ID: ${idUsuario}`);
            throw new Error(`Usuario proveedor con ID ${idUsuario} no encontrado.`);
        }

        console.log(`SERVICE: User updated successfully for ID ${idUsuario}. Rows affected: ${result.rowCount}`);
        return result.rows[0];

    } catch (error: unknown) { // Changed to unknown
        console.error(`SERVICE ERROR in updateUsuarioProveedor for user ID ${idUsuario}:`, error);
        let message = `Error interno del servidor al actualizar usuario: Desconocido`;
        let code: string | undefined;
        let constraint: string | undefined;

        if (error instanceof Error) {
            message = `Error interno del servidor al actualizar usuario: ${error.message}`;
            const errAsAny = error as any;
            if (typeof errAsAny.code === 'string') code = errAsAny.code;
            if (typeof errAsAny.constraint === 'string') constraint = errAsAny.constraint;
        } else if (typeof error === 'string') {
            message = `Error interno del servidor al actualizar usuario: ${error}`;
        }
        
        if (code === '23505') {
             const field = constraint?.includes('usuario') ? 'usuario' : constraint?.includes('correo') ? 'correo electrónico' : 'campo único';
            throw new Error(`Error: El ${field} '${usuarioData[field.split(' ')[0]] || ''}' ya está en uso.`);
        } else if (code === '42703') {
             throw new Error(`Error de base de datos: La columna referenciada no existe (${message}). Revisa los nombres de columna.`);
        } else if (code === '42601') {
             throw new Error(`Error de sintaxis en la consulta SQL: ${message}.`);
        } else if (message.includes('no encontrado')) {
             throw error; // Re-throw original "no encontrado" error
        }
        throw new Error(message);
    }
};

export const actualizarEstatusRevision = async (
    idProveedor: number,
    nuevoEstatusRevision: string
): Promise<{ id_proveedor: number; estatus_revision: string }> => {

    console.log(`SERVICE (Admin): Actualizando estatus_revision para ID ${idProveedor} a "${nuevoEstatusRevision}"`);

    if (isNaN(idProveedor)) throw new Error("ID de proveedor inválido.");
    const validStatuses = ['NO_SOLICITADO', 'PENDIENTE_REVISION', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'PENDIENTE_PAGO', 'REVALIDAR'];
    if (!nuevoEstatusRevision || !validStatuses.includes(nuevoEstatusRevision)) {
        throw new Error(`Estatus de revisión inválido: "${nuevoEstatusRevision}".`);
    }

    try {
        const result = await sql`
            UPDATE proveedores
            SET
                estatus_revision = ${nuevoEstatusRevision},
                updated_at = NOW()
            WHERE id_proveedor = ${idProveedor}
            RETURNING id_proveedor, estatus_revision;
        `;

        if (result.rowCount === 0) {
            throw new Error(`Proveedor con ID ${idProveedor} no encontrado para actualizar estado de revisión.`);
        }

        const updatedData = result.rows[0];
        console.log(`SERVICE (Admin): Estatus de revisión actualizado en BD a "${updatedData.estatus_revision}" para ID ${idProveedor}`);

        try {
            const proveedorChannel = `proveedor-updates-${idProveedor}`;
            const evento = 'cambio_estado_proveedor';
            const notificationPayload = {
                idProveedor: updatedData.id_proveedor,
                nuevoEstatus: updatedData.estatus_revision,
                mensaje: `Un administrador ha actualizado el estado de la revisión de su cuenta a: ${nuevoEstatusRevision.replace(/_/g, ' ')}.`,
                timestamp: new Date().toISOString()
            };

            console.log(`SERVICE (Admin): Emitiendo evento '${evento}' a canal '${proveedorChannel}'`);
            await triggerPusherEvent(proveedorChannel, evento, notificationPayload);
            console.log(`SERVICE (Admin): Evento Pusher para proveedor ${idProveedor} emitido exitosamente.`);

        } catch (notificationError: unknown) { // Changed to unknown
            console.error(`SERVICE (Admin) ERROR: Fallo al emitir notificación Pusher al proveedor ${idProveedor} tras actualizar estado:`, notificationError);
        }

        return {
             id_proveedor: updatedData.id_proveedor,
             estatus_revision: updatedData.estatus_revision
        };

    } catch (error: unknown) { // Changed to unknown
        console.error(`SERVICE ERROR (Admin) en actualizarEstatusRevision para ID ${idProveedor}:`, error);
        let message = 'Error desconocido al actualizar estado de revisión.';
        if (error instanceof Error) {
            message = error.message || message;
        }
        throw new Error(`Error al actualizar estado de revisión: ${message}`);
    }
};