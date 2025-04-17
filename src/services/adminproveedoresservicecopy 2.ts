import { sql } from "@vercel/postgres";
import bcrypt from 'bcryptjs';
// --- INTERFACES (Definir o asegurar que existen en otro lugar) ---
// Es MUY recomendable tener interfaces definidas para los datos
interface ProveedorAdminListData {
    id_proveedor: number;
    rfc?: string | null;
    correo?: string | null;
    estatus?: boolean | null;
    telefono?: string | null;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    // nombre_o_razon_social?: string | null; // Podrías añadir un campo combinado
}

interface ProveedorCompletoData {
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

    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;

    // Morales
    razon_social?: string | null;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    representantes?: RepresentanteLegalOutput[]; // Array

    // Físicas
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;

    // ... otros campos que puedan existir ...
     [key: string]: any;
}
interface RepresentanteLegalOutput { // (Necesaria para ProveedorCompletoData)
    id_morales: number;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
}
interface RepresentanteLegalInput { // (Necesaria para UpdateProveedorAdminData)
    id_morales?: number; // Para identificar existentes
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante?: string | null;
}

// Interfaz para los datos de actualización que el admin envía
interface UpdateProveedorAdminData {
    id_proveedor: number; // Requerido
    tipoProveedor: 'moral' | 'fisica'; // Requerido para lógica interna

    // Campos editables por el admin (todos opcionales)
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

    actividadSat?: string | null; // camelCase en la entrada JS/TS
    proveedorEventos?: boolean;   // camelCase en la entrada JS/TS

    // Campos específicos (opcionales)
    razon_social?: string;
    representantes?: RepresentanteLegalInput[]; // Array
    nombre_representante?: string;
    apellido_p_representante?: string;
    apellido_m_representante?: string | null;
    nombre?: string; // Usar nombres consistentes ('nombre' vs 'nombre_fisica')
    apellido_p?: string;
    apellido_m?: string | null;
    curp?: string;

    // estatus?: boolean; // El estatus se maneja con updateProveedorEstatus
     [key: string]: any;
}
interface ProveedorAdminListData {
    id_proveedor: number;
    rfc?: string | null;
    correo?: string | null;
    estatus?: boolean | null;
    telefono?: string | null;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    // Añadir un campo para mostrar nombre o razón social en la tabla
    nombre_display?: string | null;
}

export const getAllProveedoresForAdmin = async (): Promise<ProveedorAdminListData[]> => {
    console.log("SERVICE: getAllProveedoresForAdmin called");
    try {
        const result = await sql`
            SELECT DISTINCT ON (p.id_proveedor) -- Clave: Obtener solo la primera fila por proveedor
                p.id_proveedor,
                p.rfc,
                p.correo,
                p.estatus,
                p.telefono_uno,
                -- Tomar razon_social o nombre de la fila correspondiente (será el de la primera fila encontrada por el ORDER BY)
                COALESCE(m.razon_social, f.nombre) AS nombre_o_razon, -- Para mostrar en la tabla
                m.razon_social IS NOT NULL AS es_moral, -- Para determinar el tipo más fácil
                f.nombre IS NOT NULL AS es_fisica      -- Para determinar el tipo más fácil
            FROM proveedores p
            LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
            LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
            -- Ordenar PRIMERO por id_proveedor, luego por lo que quieras para desempatar si importa cuál fila de 'm' tomar
            ORDER BY p.id_proveedor, p.created_at DESC;
        `;

        // Formateo adaptado
        const proveedoresFormateados = result.rows.map(row => ({
            id_proveedor: row.id_proveedor,
            rfc: row.rfc,
            correo: row.correo,
            estatus: row.estatus,
            telefono: row.telefono_uno,
            // Determinar tipo basado en los flags booleanos (más robusto que chequear null)
            tipo_proveedor: row.es_moral ? 'moral' : (row.es_fisica ? 'fisica' : 'desconocido'),
            // Añadir el nombre para mostrar en la tabla
            nombre_display: row.nombre_o_razon
        }));
        console.log(`SERVICE: Found ${proveedoresFormateados.length} UNIQUE providers for admin list.`);
        return proveedoresFormateados;
    } catch (error) {
        console.error("SERVICE ERROR in getAllProveedoresForAdmin:", error);
        throw new Error("Error al obtener la lista de proveedores (servicio).");
    }
};


/**
* Actualiza el estatus (activo/inactivo) de un proveedor específico.
* Acepta un booleano para el nuevo estado.
*/
export const updateProveedorEstatus = async (
  idProveedor: number,
  estatus: boolean // Acepta un BOOLEANO
) => {
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
      return result.rows[0];

  } catch (error) {
      console.error(`Error updating provider status for ID ${idProveedor}:`, error);
      throw new Error('Error al actualizar el estatus del proveedor.');
  }
};
/**
 * Obtiene los detalles COMPLETOS de un proveedor por su ID principal.
 */
export const getProveedorById = async (id: number): Promise<ProveedorCompletoData | null> => {
    // ... (Código adaptado en respuesta anterior con procesarResultadoProveedor) ...
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
        // Necesitas la función procesarResultadoProveedor definida como en la respuesta anterior
        const procesarResultadoProveedor = (rows: any[]): ProveedorCompletoData | null => {
             if (!rows || rows.length === 0) return null;
             const firstRow = rows[0];
             const tipo = firstRow.razon_social ? 'moral' : (firstRow.nombre_fisica ? 'fisica' : 'desconocido');
             const proveedorBase: ProveedorCompletoData = { /*... mapeo base ...*/
                id_proveedor: firstRow.id_proveedor, rfc: firstRow.rfc, /*...*/ actividad_sat: firstRow.actividad_sat, proveedor_eventos: firstRow.proveedor_eventos, tipo_proveedor: tipo,
                nombre_fisica: tipo === 'fisica' ? firstRow.nombre_fisica : null, /*...*/ curp: tipo === 'fisica' ? firstRow.curp : null,
                razon_social: tipo === 'moral' ? firstRow.razon_social : null, representantes: tipo === 'moral' ? [] : undefined
             };
             if (tipo === 'moral') {
                 proveedorBase.representantes = rows.filter(r => r.id_morales != null).map(r => ({
                     id_morales: r.id_morales, nombre_representante: r.nombre_representante, apellido_p_representante: r.apellido_p_representante, apellido_m_representante: r.apellido_m_representante
                 }));
             }
             return proveedorBase;
        };
        return procesarResultadoProveedor(result.rows);
    } catch (error) { /* ... manejo de error ... */ throw new Error('Error al obtener datos completos del proveedor.'); }
};

/**
* Obtiene los documentos asociados a un proveedor específico.
* Necesaria para la vista de documentos del proveedor.
*/
export const getDocumentosByProveedor = async (id_proveedor: number) => {
  console.log(`DEBUG Service: Fetching documents for provider ID: ${id_proveedor}`);
  try {
      if (isNaN(id_proveedor)) {
          throw new Error("ID de proveedor inválido proporcionado.");
      }
      const result = await sql`
      SELECT
          id_documento_proveedor, id_proveedor, ruta_archivo, estatus,
          created_at, updates_at, nombre_original, tipo_documento, id_usuario
      FROM documentos_proveedor
      WHERE id_proveedor = ${id_proveedor};
    `;
      console.log(`DEBUG Service: Found ${result.rows.length} documents for provider ID: ${id_proveedor}`);
      return result.rows; // Devuelve array (puede ser vacío)

  } catch (error) {
      console.error(`Error fetching documents for provider ID ${id_proveedor}:`, error);
      throw new Error('Error al obtener los documentos del proveedor.');
  }
};
/**
 * Actualiza el estatus de un documento específico.
 * @param id_documento_proveedor - ID del documento a actualizar.
 * @param nuevoEstatus - El nuevo estado (podría ser string como 'Aprobado', 'Rechazado', 'Pendiente' o boolean)
 */
export const updateEstatusDocumentoProveedor = async (
  id_documento_proveedor: number,
  nuevoEstatus: string | boolean // Ajusta el tipo según tu base de datos
) => {
  console.log(`DEBUG Service: Updating status for document ID ${id_documento_proveedor} to ${nuevoEstatus}`);
  try {
      if (isNaN(id_documento_proveedor)) {
          throw new Error("ID de documento inválido.");
      }
      // Ajusta el tipo de dato para nuevoEstatus si es necesario (ej. boolean)
      const result = await sql`
          UPDATE documentos_proveedor
          SET
              estatus = ${nuevoEstatus},
              updated_at = NOW() -- Corrige el nombre de columna si es diferente
          WHERE id_documento_proveedor = ${id_documento_proveedor}
          RETURNING *; -- Devuelve el documento actualizado
      `;

      if (result.rows.length === 0) {
          throw new Error(`Documento con ID ${id_documento_proveedor} no encontrado.`);
      }

      console.log(`DEBUG Service: Document status updated successfully for ID ${id_documento_proveedor}`);
      return result.rows[0];

  } catch (error) {
      console.error(`Error updating document status for ID ${id_documento_proveedor}:`, error);
      throw new Error('Error al actualizar el estatus del documento.');
  }
};
/**
 * Obtiene los detalles COMPLETOS de un proveedor por su ID, específicamente para el admin.
 */
export const getProveedorProfileByIdForAdmin = async (idProveedor: number): Promise<ProveedorCompletoData | null> => {
    console.log(`SERVICE: getProveedorProfileByIdForAdmin called for ID ${idProveedor}`);
    try {
         if (isNaN(idProveedor)) { throw new Error("ID de proveedor inválido."); }
        // Añadir p.actividad_sat y p.proveedor_eventos
        const result = await sql`
            SELECT
                p.*, -- Todos los campos de proveedores
                p.actividad_sat,      -- Explicito
                p.proveedor_eventos,  -- Explicito
                f.nombre AS nombre_fisica,
                f.apellido_p AS apellido_p_fisica,
                f.apellido_m AS apellido_m_fisica,
                f.curp,
                m.razon_social,
                m.nombre_representante,
                m.apellido_p_representante,
                m.apellido_m_representante
            FROM proveedores p
            LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
            LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
            WHERE p.id_proveedor = ${idProveedor};
        `;

        if (result.rowCount === 0) {
            console.warn(`SERVICE: Provider profile not found for ID ${idProveedor}`);
            // Lanzar error aquí es una opción si la vista admin espera siempre encontrarlo
            // throw new Error(`Perfil de proveedor con ID ${idProveedor} no encontrado.`);
            return null; // O devolver null
        }

        console.log(`SERVICE: Found provider profile for ID ${idProveedor}`);
        const row = result.rows[0];
        const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
        return { ...row, tipo_proveedor: tipo } as ProveedorCompletoData;

    } catch (error: any) {
        console.error(`SERVICE ERROR in getProveedorProfileByIdForAdmin for ID ${idProveedor}:`, error);
        // Relanzar o manejar como prefieras
        throw new Error(`Error al obtener perfil de proveedor (Admin): ${error.message}`);
    }
};
/**
 * Actualiza el perfil de un proveedor desde la perspectiva del admin.
 */
export const updateProveedorProfileForAdmin = async (
    proveedorData: UpdateProveedorAdminData
): Promise<ProveedorCompletoData | null> => {

    const idProveedor = proveedorData.id_proveedor;
    const tipoProveedor = proveedorData.tipoProveedor;

    // --- Validaciones de Entrada ---
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido o faltante.");
    }
    if (!tipoProveedor || (tipoProveedor !== 'moral' && tipoProveedor !== 'fisica')) {
        throw new Error("Tipo de proveedor ('moral' o 'fisica') es requerido.");
    }
    // Validación extra para moral: representantes debe ser array si existe
    if (tipoProveedor === 'moral' && proveedorData.representantes !== undefined && !Array.isArray(proveedorData.representantes)) {
        throw new Error("El campo 'representantes' debe ser un array si se incluye para proveedor moral.");
    }
     // Validación extra: si es moral y viene el array, validar campos internos
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
     // Validación extra: si es física, validar campos físicos si vienen
     if (tipoProveedor === 'fisica' && proveedorData.curp !== undefined && (typeof proveedorData.curp !== 'string' || proveedorData.curp.trim().length !== 18)) {
        throw new Error('Si se incluye "curp", debe ser una cadena de 18 caracteres.');
     }
    // ... (añadir más validaciones según sea necesario) ...

    console.log(`SERVICE: updateProveedorProfileForAdmin - Iniciando para ID ${idProveedor}, Tipo: ${tipoProveedor}`);
    // console.log("SERVICE: Datos recibidos:", JSON.stringify(proveedorData, null, 2)); // Log detallado

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log("SERVICE: Transacción iniciada.");

        // --- 1. Actualizar tabla 'proveedores' (campos comunes) ---
        const updateFieldsProveedores: string[] = [];
        const updateValuesProveedores: any[] = [];
        let paramIndexProveedores = 1;

        // Helper para construir SET dinámico
        const addUpdateField = (dbCol: string, value: any) => {
            // Solo añade si el valor NO es undefined (permite enviar null explícito)
            if (value !== undefined) {
                updateFieldsProveedores.push(`${dbCol} = $${paramIndexProveedores++}`);
                // Asegurar que booleanos se pasen correctamente, y nulls también
                updateValuesProveedores.push(value === null ? null : value);
            }
        };

        // Mapear campos comunes (camelCase -> snake_case donde aplique)
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
        addUpdateField('actividad_sat', proveedorData.actividadSat); // Mapeo camel a snake
        addUpdateField('proveedor_eventos', proveedorData.proveedorEventos); // Mapeo camel a snake

        // Ejecutar UPDATE solo si hay campos que actualizar
        if (updateFieldsProveedores.length > 0) {
            updateFieldsProveedores.push(`updated_at = NOW()`); // Actualizar siempre timestamp
            const updateQueryProveedores = `UPDATE proveedores SET ${updateFieldsProveedores.join(', ')} WHERE id_proveedor = $${paramIndexProveedores}`;
            updateValuesProveedores.push(idProveedor);

            console.log(`SERVICE: Ejecutando UPDATE en 'proveedores' (ID: ${idProveedor})`);
            // console.log("Query:", updateQueryProveedores); // Debug Query
            // console.log("Values:", updateValuesProveedores); // Debug Values

            const provResult = await client.query(updateQueryProveedores, updateValuesProveedores);
            if (provResult.rowCount === 0) {
                throw new Error(`Proveedor con ID ${idProveedor} no encontrado en tabla 'proveedores'.`);
            }
            console.log(`SERVICE: Tabla 'proveedores' actualizada.`);
        } else {
            console.log(`SERVICE: Sin campos comunes que actualizar en 'proveedores'.`);
            // Podrías optar por actualizar solo `updated_at` si lo deseas
            // await client.sql`UPDATE proveedores SET updated_at = NOW() WHERE id_proveedor = ${idProveedor}`;
        }

        // --- 2. Actualizar tablas de detalle (física o moral) ---
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
            const repsEntrantes = proveedorData.representantes; // Puede ser undefined
            let razonSocialActual = proveedorData.razon_social;

            // --- 2a. Actualizar Razón Social (si viene) en TODAS las filas ---
            if (razonSocialActual !== undefined) {
                 // Validar que no sea cadena vacía si se proporciona
                 if (typeof razonSocialActual !== 'string' || razonSocialActual.trim() === '') {
                     throw new Error("Si se proporciona 'razon_social', no puede estar vacía.");
                 }
                 console.log(`SERVICE: Actualizando razon_social a "${razonSocialActual}" en 'proveedores_morales' para ID Prov: ${idProveedor}`);
                 await client.sql`UPDATE proveedores_morales SET razon_social = ${razonSocialActual} WHERE id_proveedor = ${idProveedor};`;
            } else if (repsEntrantes && repsEntrantes.some(r => r.id_morales === undefined || r.id_morales < 0 )) {
                 // Si NO viene razón social, pero SÍ vienen nuevos representantes (sin id_morales o con ID temporal),
                 // NECESITAMOS obtener la razón social actual para insertarlos.
                 console.log(`SERVICE: Obteniendo razon_social actual para nuevos representantes (ID Prov: ${idProveedor})`);
                 const current = await client.sql`SELECT razon_social FROM proveedores_morales WHERE id_proveedor = ${idProveedor} LIMIT 1;`;
                 razonSocialActual = current.rows[0]?.razon_social;
                 console.log(`SERVICE: Razon social actual obtenida: "${razonSocialActual}"`);
                 // Si no hay razón social existente Y estamos intentando añadir representantes, es un error.
                 if(razonSocialActual === undefined || razonSocialActual === null) {
                      throw new Error(`No se puede añadir representantes porque no se encontró una razón social existente para el proveedor ID ${idProveedor} y no se proporcionó una nueva.`);
                 }
            }

            // --- 2b. Sincronizar Representantes (si viene el array 'representantes') ---
            if (repsEntrantes !== undefined) { // Solo sincronizar si se envió el array (incluso vacío)
                 console.log(`SERVICE: Sincronizando ${repsEntrantes.length} representante(s)...`);
                 // Obtener IDs de las filas existentes en la BD para este proveedor
                 const { rows: repsExistentesDb } = await client.sql<{id_morales: number}>`
                    SELECT id_morales FROM proveedores_morales WHERE id_proveedor = ${idProveedor};
                 `;
                 const idsExistentesDb = new Set(repsExistentesDb.map(r => r.id_morales));
                 console.log("SERVICE: IDs existentes en BD:", Array.from(idsExistentesDb));

                 // IDs que NO deben ser eliminados (porque vienen en la solicitud para update/mantener)
                 const idsParaMantenerOActualizar = new Set<number>();

                 // Procesar representantes entrantes: UPDATE o INSERT
                 for (const repIn of repsEntrantes) {
                     // Validar datos básicos del representante entrante
                     if (!repIn.nombre_representante?.trim() || !repIn.apellido_p_representante?.trim()) {
                         console.warn("SERVICE: Saltando representante entrante sin nombre o apellido paterno:", repIn);
                         continue; // Saltar este representante inválido
                     }

                     const idMoralEntrante = repIn.id_morales;

                     // UPDATE si tiene ID y ese ID existe en la BD
                     if (idMoralEntrante != null && idMoralEntrante > 0 && idsExistentesDb.has(idMoralEntrante)) {
                         console.log(`SERVICE: Actualizando representante existente (id_morales: ${idMoralEntrante})`);
                         await client.sql`
                             UPDATE proveedores_morales SET
                                 nombre_representante = ${repIn.nombre_representante},
                                 apellido_p_representante = ${repIn.apellido_p_representante},
                                 apellido_m_representante = ${repIn.apellido_m_representante ?? null}
                                 -- No actualizamos razon_social aquí, ya se hizo globalmente
                             WHERE id_morales = ${idMoralEntrante};
                         `;
                         idsParaMantenerOActualizar.add(idMoralEntrante); // Marcar para no eliminar
                     }
                     // INSERT si no tiene ID (o tiene ID temporal negativo)
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
                         // No lo añadimos a idsParaMantener porque no tenía un ID existente
                     }
                 } // Fin del bucle for

                 // DELETE los existentes que NO vinieron en la solicitud
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

        } // Fin else if (tipoProveedor === 'moral')

        // --- 3. COMMIT y Devolver ---
        await client.sql`COMMIT`;
        console.log(`SERVICE: Transacción completada (COMMIT) para ID: ${idProveedor}`);

        // Devolver los datos frescos y completos
        return await getProveedorById(idProveedor); // Reutiliza la función GET ya adaptada

    } catch (error: any) {
        if (client) {
            try { await client.sql`ROLLBACK`; console.log("SERVICE: Transacción revertida (ROLLBACK)."); }
            catch (rbErr) { console.error("Error durante ROLLBACK:", rbErr); }
        }
        console.error(`SERVICE ERROR updateProveedorProfileForAdmin ID ${idProveedor}:`, error);
        // Propagar el error para que la capa superior (route) lo maneje
        throw new Error(`Error al actualizar perfil (Admin): ${error.message || 'Error desconocido'}`);
    } finally {
        if (client) {
            await client.release();
            console.log("SERVICE: Conexión liberada.");
        }
    }
};
export const getUsuarioProveedorByProveedorId = async (idProveedor: number) => {
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

    } catch (error: any) {
        console.error(`SERVICE ERROR in getUsuarioProveedorByProveedorId for proveedor ID ${idProveedor}:`, error);
        throw new Error("Error al obtener el usuario asociado al proveedor desde el servicio.");
    }
};
export const updateUsuarioProveedor = async (usuarioData: any): Promise<any> => {
    const idUsuario = usuarioData.id_usuario;
    console.log(`SERVICE: updateUsuarioProveedor (Full Update w/ COALESCE) called for user ID ${idUsuario}`);
    console.log(`SERVICE: Received data:`, JSON.stringify(usuarioData, null, 2));

    // Validación básica del ID
    if (typeof idUsuario !== 'number' || isNaN(idUsuario)) {
        console.error("SERVICE ERROR: Invalid or missing id_usuario.", usuarioData);
        throw new Error("ID de usuario inválido o faltante para actualizar.");
    }

    // Validación básica de campos requeridos (puedes añadir más si es necesario)
    const requiredFields = ['usuario', 'nombre', 'apellido_p', 'correo', 'estatus'];
    for (const field of requiredFields) {
        if (!usuarioData[field]) {
             console.error(`SERVICE ERROR: Missing required field '${field}'.`, usuarioData);
            throw new Error(`El campo '${field}' es requerido.`);
        }
    }


    try {
        let newHashedPassword: string | null = null; // Tipo explícito

        // Hashear la contraseña SOLO si se proporcionó una nueva y no está vacía
        if (usuarioData.contraseña && usuarioData.contraseña.trim() !== '') {
            console.log("SERVICE: Hashing new password provided.");
            const saltRounds = 10;
            newHashedPassword = await bcrypt.hash(usuarioData.contraseña, saltRounds);
            console.log("SERVICE: New password hashed.");
        } else {
            console.log("SERVICE: No new password provided, existing password will be kept.");
            // newHashedPassword permanece null
        }

        // Construir y ejecutar la consulta UPDATE
        // COALESCE(${newHashedPassword}, contraseña) significa:
        // Si newHashedPassword NO es NULL (es decir, se proporcionó y hasheó una nueva), usa ese valor.
        // Si newHashedPassword ES NULL (no se proporcionó nueva contraseña), usa el valor actual de la columna 'contraseña'.
        console.log("SERVICE: Preparing SQL statement...");
        const result = await sql`
            UPDATE usuarios_proveedores
            SET
                usuario = ${usuarioData.usuario},
                nombre = ${usuarioData.nombre},
                apellido_p = ${usuarioData.apellido_p},
                apellido_m = ${usuarioData.apellido_m ?? null}, -- Permite null si no se envía
                correo = ${usuarioData.correo},
                estatus = ${usuarioData.estatus},
                contraseña = COALESCE(${newHashedPassword}, contraseña), -- Lógica clave aquí
                updated_at = NOW()
            WHERE id_usuario = ${idUsuario}
            RETURNING
                id_usuario, usuario, nombre, apellido_p, apellido_m, correo, estatus, created_at, updated_at; -- Excluye contraseña del retorno
        `;

        console.log("SERVICE: SQL statement executed.");

        if (result.rowCount === 0) {
            console.warn(`SERVICE: User not found for update. ID: ${idUsuario}`);
            throw new Error(`Usuario proveedor con ID ${idUsuario} no encontrado.`); // Esto resultará en un 404 en la API Route
        }

        console.log(`SERVICE: User updated successfully for ID ${idUsuario}. Rows affected: ${result.rowCount}`);
        return result.rows[0]; // Devuelve los datos actualizados (sin la contraseña)

    } catch (error: any) {
        console.error(`SERVICE ERROR in updateUsuarioProveedor for user ID ${idUsuario}:`, error);

        // Clasifica y relanza el error para la API Route
        if (error.code === '23505') { // Violación de unicidad (e.g., usuario o correo duplicado)
             const constraint = error.constraint;
             let field = 'campo único';
             if (constraint?.includes('usuario')) field = 'usuario';
             else if (constraint?.includes('correo')) field = 'correo electrónico';
            throw new Error(`Error: El ${field} '${usuarioData[field.split(' ')[0]] || ''}' ya está en uso.`); // Intenta obtener el valor conflictivo
        } else if (error.code === '42703') { // Columna no encontrada
             throw new Error(`Error de base de datos: La columna referenciada no existe (${error.message}). Revisa los nombres de columna.`);
        } else if (error.code === '42601') { // Error de sintaxis
             throw new Error(`Error de sintaxis en la consulta SQL: ${error.message}.`);
        } else if (error.message.includes('no encontrado')) { // Error de 'no encontrado' lanzado explícitamente
             throw error; // Re-lanzar para que la API route devuelva 404
        } else {
            // Error genérico
            throw new Error(`Error interno del servidor al actualizar usuario: ${error.message || 'Desconocido'}`);
        }
    }
};