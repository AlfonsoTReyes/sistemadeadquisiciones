import { sql, VercelPoolClient } from '@vercel/postgres';
import { triggerPusherEvent } from '../lib/pusher-server';

// --- INTERFACES ADAPTADAS ---

// Interfaz para un representante legal (como se recibe/envía en arrays)
interface RepresentanteLegalInput {
    id_morales?: number; // Opcional: para identificar en actualizaciones
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante?: string | null;
    // Podrías añadir aquí otros campos específicos del representante si los tuvieras
}

// Interfaz para datos devueltos (ahora con array de representantes)
interface ProveedorDetallado {
    id_proveedor: number;
    rfc?: string;
    giro_comercial?: string;
    correo?: string;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    fecha_inscripcion?: string | null; // Considera usar Date si parseas
    fecha_vigencia?: string | null;   // Considera usar Date si parseas
    estatus?: boolean;
    created_at?: string | null; // Considera usar Date si parseas
    updated_at?: string | null; // Considera usar Date si parseas
    fecha_solicitud?: string | null; // Considera usar Date si parseas
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
    nombre_representante?: string | null; // Moral
    apellido_p_representante?: string | null; // Moral
    apellido_m_representante?: string | null; // Moral
    nombre_fisica?: string | null; // Fisica
    apellido_p_fisica?: string | null; // Fisica
    apellido_m_fisica?: string | null; // Fisica
    curp?: string | null; // Fisica
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    representantes?: RepresentanteLegalOutput[]; // Usamos una interfaz Output

     [key: string]: any;
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
  // Comunes
  rfc: string; giro_comercial: string; correo: string; calle: string; numero: string; colonia: string; codigo_postal: string; municipio: string; estado: string; telefono_uno: string; actividadSat: string;
  telefono_dos?: string | null; pagina_web?: string | null; camara_comercial?: string | null; numero_registro_camara?: string | null; numero_registro_imss?: string | null; proveedorEventos?: boolean;

  tipoProveedor: 'moral' | 'fisica';

  // Específicos Física
  nombre?: string; apellido_p?: string; curp?: string; apellido_m?: string | null;

  // Específicos Moral (ADAPTADO)
  razon_social?: string; // Único para la entidad
  representantes?: RepresentanteLegalInput[];
}

// Interface para actualizar proveedor
interface UpdateProveedorData {
  // Comunes (opcionales)
  rfc?: string; giro_comercial?: string; correo?: string; calle?: string; numero?: string; colonia?: string; codigo_postal?: string; municipio?: string; estado?: string; telefono_uno?: string;
  telefono_dos?: string | null; pagina_web?: string | null; camara_comercial?: string | null; numero_registro_camara?: string | null; numero_registro_imss?: string | null; estatus?: boolean; actividadSat?: string | null; proveedorEventos?: boolean;

  tipoProveedor: 'moral' | 'fisica'; // Necesario para la lógica

  // Específicos Física (opcionales)
  nombre?: string; apellido_p?: string; curp?: string; apellido_m?: string | null;

  // Específicos Moral (ADAPTADO)
  razon_social?: string; // Único para la entidad
  representantes?: RepresentanteLegalInput[];
   [key: string]: any; // Para otros campos si es necesario
}


// --- FUNCIONES getProveedorById / getProveedorByUserId (ADAPTADAS) ---

// Función helper reutilizable para procesar resultados de la query
const procesarResultadoProveedor = (rows: any[]): ProveedorDetallado | null => {
    if (!rows || rows.length === 0) {
        return null;
    }

    // Tomar datos comunes y de la entidad moral de la primera fila
    const firstRow = rows[0];
    const tipo = firstRow.razon_social ? 'moral' : (firstRow.nombre_fisica ? 'fisica' : 'desconocido');

    const proveedorBase: ProveedorDetallado = {
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
        // Inicializar específicos a null o según el tipo
        nombre_fisica: tipo === 'fisica' ? firstRow.nombre_fisica : null,
        apellido_p_fisica: tipo === 'fisica' ? firstRow.apellido_p_fisica : null,
        apellido_m_fisica: tipo === 'fisica' ? firstRow.apellido_m_fisica : null,
        curp: tipo === 'fisica' ? firstRow.curp : null,
        razon_social: tipo === 'moral' ? firstRow.razon_social : null,
        representantes: tipo === 'moral' ? [] : undefined // Inicializar array si es moral
    };

    // Si es moral, iterar TODAS las filas para construir el array de representantes
    if (tipo === 'moral') {
        proveedorBase.representantes = rows
            .filter(row => row.id_morales != null) // Asegurarse que la fila tiene datos de moral
            .map(row => ({
                id_morales: row.id_morales, // El ID único de esta fila/representante
                nombre_representante: row.nombre_representante,
                apellido_p_representante: row.apellido_p_representante,
                apellido_m_representante: row.apellido_m_representante,
                // Añadir otros campos del representante si existen en la tabla moral
            }));
         // Opcional: Eliminar duplicados si la query generó alguno por error
        proveedorBase.representantes = Array.from(new Map(proveedorBase.representantes.map(item => [item.id_morales, item])).values());
    }

    return proveedorBase;
};

export const getProveedorById = async (id: number): Promise<ProveedorDetallado | null> => {
  console.log(`DEBUG Service: getProveedorById: Fetching provider by ID: ${id}`);
  try {
    if (isNaN(id)) throw new Error("ID de proveedor inválido.");

    // La query necesita traer TODOS los campos, incluyendo los de moral/fisica
    // El LEFT JOIN con proveedores_morales ahora puede devolver múltiples filas por proveedor
    const result = await sql`
      SELECT
        p.*, -- Todos de proveedores (incluirá estatus_revision)
        -- Seleccionar explícitamente si se prefiere o hay ambigüedad
        -- p.estatus_revision,
        m.id_morales, m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
        f.id_fisicas, f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
      WHERE p.id_proveedor = ${id};
    `;

    return procesarResultadoProveedor(result.rows);

  } catch (error) {
    console.error(`Error fetching proveedor by ID ${id}:`, error);
    // Considera no rechazar la promesa aquí, sino devolver null o un objeto de error
    // para que el llamador maneje el fallo de obtención de datos.
    // return Promise.reject(new Error('Error al obtener datos del proveedor.'));
     throw new Error('Error al obtener datos del proveedor.'); // O relanzar
  }
};

export const getProveedorByUserId = async (id_usuario_proveedor: number): Promise<ProveedorDetallado | null> => {
  console.log(`DEBUG Service: getProveedorByUserId: Fetching provider profile for user ID: ${id_usuario_proveedor}`);
  try {
      if (isNaN(id_usuario_proveedor)) throw new Error("ID de usuario proveedor inválido.");

      // Misma query que getProveedorById pero filtrando por id_usuario_proveedor
       const result = await sql`
         SELECT
           p.*, -- Incluye estatus_revision
           -- p.estatus_revision, -- Explícito si se prefiere
           m.id_morales, m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
           f.id_fisicas, f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
         FROM proveedores p
         LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
         LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
         WHERE p.id_usuario_proveedor = ${id_usuario_proveedor};
       `;

       return procesarResultadoProveedor(result.rows);

  } catch (error) {
      console.error(`Error fetching provider profile by user ID ${id_usuario_proveedor}:`, error);
      throw new Error('Error al obtener el perfil del proveedor por usuario.');
  }
};


// --- createProveedorCompleto (ADAPTADO) ---
export const createProveedorCompleto = async (data: CreateProveedorData): Promise<{ id_proveedor: number }> => {
  const {
      id_usuario_proveedor, tipoProveedor,
      // Comunes
      rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal, municipio, estado, telefono_uno, actividadSat, telefono_dos, pagina_web, camara_comercial, numero_registro_camara, numero_registro_imss, proveedorEventos,
      // Físicos
      nombre, apellido_p, apellido_m, curp,
      // Morales
      razon_social, representantes // Ahora es un array
  } = data;

  // Validaciones básicas
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

      // 1. INSERT en proveedores
      const proveedorResult = await client.sql`
          INSERT INTO proveedores (
              rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal, municipio, estado, telefono_uno, telefono_dos, pagina_web, camara_comercial, numero_registro_camara, numero_registro_imss, actividad_sat, proveedor_eventos, estatus, id_usuario_proveedor, created_at, updated_at, fecha_solicitud
          ) VALUES (
              ${rfc}, ${giro_comercial}, ${correo}, ${calle}, ${numero}, ${colonia}, ${codigo_postal}, ${municipio}, ${estado}, ${telefono_uno}, ${telefono_dos ?? null}, ${pagina_web ?? null}, ${camara_comercial ?? null}, ${numero_registro_camara ?? null}, ${numero_registro_imss ?? null}, ${actividadSat}, ${proveedorEventos ?? false}, ${true}, ${id_usuario_proveedor}, NOW(), NOW(), NOW()
          ) RETURNING id_proveedor;
      `;
      newProveedorId = proveedorResult.rows[0]?.id_proveedor;
      if (!newProveedorId) { throw new Error("Fallo al crear registro principal del proveedor."); }
      console.log(`SERVICE Create: Registro en 'proveedores' creado con ID: ${newProveedorId}`);

      // 2. INSERT en tabla específica
      if (tipoProveedor === 'moral') {
          // Iterar sobre el array de representantes
          if (!representantes || representantes.length === 0) { throw new Error("Se requiere al menos un representante para proveedor moral.");} // Doble check
          if (!razon_social) { throw new Error("Se requiere razón social para proveedor moral.");} // Doble check

          console.log(`SERVICE Create: Insertando ${representantes.length} representante(s) para ID: ${newProveedorId}`);
          for (const rep of representantes) {
              if (!rep.nombre_representante || !rep.apellido_p_representante) {
                  throw new Error("Cada representante debe tener al menos nombre y apellido paterno.");
              }
              // Insertar UNA FILA por cada representante, repitiendo id_proveedor y razon_social
              await client.sql`
                  INSERT INTO proveedores_morales (
                      id_proveedor,
                      razon_social,
                      nombre_representante,
                      apellido_p_representante,
                      apellido_m_representante
                      -- acta_constitutiva, poder_notarial -- Eliminados
                  ) VALUES (
                      ${newProveedorId},
                      ${razon_social}, -- Se repite
                      ${rep.nombre_representante},
                      ${rep.apellido_p_representante},
                      ${rep.apellido_m_representante ?? null}
                      -- null, null -- Para acta/poder si estuvieran
                  );
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

    } catch (error: any) {
        console.error(`SERVICE Create: Error durante el registro para user ID: ${id_usuario_proveedor}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("SERVICE Create: ROLLBACK ejecutado."); } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        console.error(`Error creando proveedor:`, error);
        // Propagar errores específicos
         if (error.code === '23505' && error.constraint?.includes('proveedores_id_usuario_proveedor')) {
             throw new Error('Este usuario ya tiene un perfil de proveedor registrado.');
         }
         if (error.code === '23503') { // Error de FK (aunque no debería ocurrir aquí si la lógica es correcta)
            console.error("Error FK Detectado:", error.detail);
            throw new Error(`Error de referencia: ${error.detail}`);
         }
        throw new Error(`Error en el registro: ${error.message}`);
    } finally {
        if (client) { await client.release(); }
    }
};


// --- updateProveedorCompleto ---
export const updateProveedorCompleto = async (
    id_proveedor: number,
    proveedorData: UpdateProveedorData // Usa la interfaz adaptada
  ): Promise<ProveedorDetallado | null> => { // Devuelve el proveedor actualizado o null
    const {
        tipoProveedor,
        // Comunes (pueden ser undefined)
        rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal, municipio, estado, telefono_uno, actividadSat, telefono_dos, pagina_web, camara_comercial, numero_registro_camara, numero_registro_imss, proveedorEventos, estatus,
        // Físicos (pueden ser undefined)
        nombre, apellido_p, apellido_m, curp,
        // Morales (pueden ser undefined)
        razon_social, representantes // Array de representantes
    } = proveedorData;

    // Validaciones
    if (isNaN(id_proveedor)) throw new Error("ID de proveedor inválido.");
    if (!tipoProveedor || (tipoProveedor !== 'moral' && tipoProveedor !== 'fisica')) {
        throw new Error("Tipo de proveedor ('moral' o 'fisica') es requerido para la actualización.");
    }

    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log(`SERVICE Update: Iniciando actualización para ID: ${id_proveedor}, Tipo: ${tipoProveedor}`);
        console.log("SERVICE Update: Datos recibidos:", proveedorData);

        // 1. Actualizar tabla 'proveedores' (dinámicamente como antes)
        //    (Código de construcción dinámica de SET omitido por brevedad, pero es igual al de tu versión anterior)
        const updateFieldsProveedores: string[] = [];
        const updateValuesProveedores: any[] = [];
        let paramIndexProveedores = 1;
        const addUpdateField = (fieldNameDb: string, value: any) => { if (value !== undefined) { updateFieldsProveedores.push(`${fieldNameDb} = $${paramIndexProveedores++}`); updateValuesProveedores.push(value); } };
        addUpdateField('rfc', rfc); addUpdateField('giro_comercial', giro_comercial); addUpdateField('correo', correo); addUpdateField('calle', calle); addUpdateField('numero', numero); addUpdateField('colonia', colonia); addUpdateField('codigo_postal', codigo_postal); addUpdateField('municipio', municipio); addUpdateField('estado', estado); addUpdateField('telefono_uno', telefono_uno); addUpdateField('telefono_dos', telefono_dos); addUpdateField('pagina_web', pagina_web); addUpdateField('camara_comercial', camara_comercial); addUpdateField('numero_registro_camara', numero_registro_camara); addUpdateField('numero_registro_imss', numero_registro_imss); addUpdateField('actividad_sat', actividadSat); addUpdateField('proveedor_eventos', proveedorEventos);
        if (estatus !== undefined) { addUpdateField('estatus', typeof estatus === 'boolean' ? estatus : !!estatus); }

        if (updateFieldsProveedores.length > 0) {
            updateFieldsProveedores.push(`updated_at = NOW()`);
            const updateQueryProveedores = `UPDATE proveedores SET ${updateFieldsProveedores.join(', ')} WHERE id_proveedor = $${paramIndexProveedores}`;
            updateValuesProveedores.push(id_proveedor);
            const provResult = await client.query(updateQueryProveedores, updateValuesProveedores);
            if (provResult.rowCount === 0) throw new Error(`Proveedor con ID ${id_proveedor} no encontrado.`);
            console.log(`SERVICE Update: Tabla 'proveedores' actualizada.`);
        } else {
            console.log(`SERVICE Update: Sin campos comunes que actualizar en 'proveedores'.`);
            // Opcionalmente actualizar solo updated_at
            await client.sql`UPDATE proveedores SET updated_at = NOW() WHERE id_proveedor = ${id_proveedor}`;
        }


        // 2. Actualizar tablas específicas
        if (tipoProveedor === 'moral') {
            console.log(`SERVICE Update: Procesando tipo MORAL.`);
            // A. Actualizar RAZON SOCIAL en TODAS las filas existentes de este proveedor
            //    (Solo si se proporcionó una nueva razón social)
            let razonSocialActual = razon_social; // Usar la nueva si viene
            if (razonSocialActual !== undefined) {
                 console.log(`SERVICE Update: Actualizando razon_social a "${razonSocialActual}" para ID ${id_proveedor}`);
                 await client.sql`UPDATE proveedores_morales SET razon_social = ${razonSocialActual} WHERE id_proveedor = ${id_proveedor};`;
            } else {
                 // Si no se envió, necesitamos obtener la actual para los nuevos inserts
                 const currentMoralData = await client.sql`SELECT razon_social FROM proveedores_morales WHERE id_proveedor = ${id_proveedor} LIMIT 1;`;
                 razonSocialActual = currentMoralData.rows[0]?.razon_social;
                 if(razonSocialActual === undefined) console.warn(`WARN Service Update: No se encontró razon_social existente para ID ${id_proveedor}, posible inconsistencia.`);
                 // Si no existe ninguna fila moral previa, razonSocialActual será undefined.
            }


            // B. Sincronizar representantes
            const repsEntrantes = representantes ?? []; // Array vacío si no se envió
            const idsEntrantesConId = new Set(repsEntrantes.filter(r => r.id_morales != null).map(r => r.id_morales));

            // Obtener representantes existentes en la BD
            const { rows: repsExistentesDb } = await client.sql`
                SELECT id_morales, nombre_representante, apellido_p_representante, apellido_m_representante
                FROM proveedores_morales WHERE id_proveedor = ${id_proveedor};
            `;
            const mapaExistentes = new Map(repsExistentesDb.map(r => [r.id_morales, r]));
            console.log(`SERVICE Update: ${repsExistentesDb.length} representantes existentes en BD.`);
            console.log(`SERVICE Update: ${repsEntrantes.length} representantes recibidos para actualizar/insertar.`);

            // Procesar entrantes: UPDATE o INSERT
            for (const repIn of repsEntrantes) {
                 if (!repIn.nombre_representante || !repIn.apellido_p_representante) {
                     console.warn("SERVICE Update: Saltando representante sin nombre o apellido paterno:", repIn);
                     continue; // Saltar si faltan datos básicos
                 }
                if (repIn.id_morales != null && mapaExistentes.has(repIn.id_morales)) {
                    // --- UPDATE ---
                    console.log(`SERVICE Update: Actualizando representante (id_morales: ${repIn.id_morales})`);
                    await client.sql`
                        UPDATE proveedores_morales SET
                            nombre_representante = ${repIn.nombre_representante},
                            apellido_p_representante = ${repIn.apellido_p_representante},
                            apellido_m_representante = ${repIn.apellido_m_representante ?? null}
                            -- Actualizar razon_social aquí es redundante si ya se hizo arriba
                        WHERE id_morales = ${repIn.id_morales};
                    `;
                    mapaExistentes.delete(repIn.id_morales); // Marcar como procesado
                } else {
                    // --- INSERT ---
                    // Necesitamos la razón social (actual o la nueva)
                    if(razonSocialActual === undefined) throw new Error("No se puede insertar representante sin razón social.");
                    console.log(`SERVICE Update: Insertando nuevo representante para ID ${id_proveedor}`);
                    await client.sql`
                        INSERT INTO proveedores_morales (id_proveedor, razon_social, nombre_representante, apellido_p_representante, apellido_m_representante)
                        VALUES (${id_proveedor}, ${razonSocialActual}, ${repIn.nombre_representante}, ${repIn.apellido_p_representante}, ${repIn.apellido_m_representante ?? null});
                    `;
                }
            }

            // C. Eliminar existentes que NO vinieron en la solicitud
            const idsParaEliminar = Array.from(mapaExistentes.keys()); // IDs que quedaron en el mapa
            if (idsParaEliminar.length > 0) {
                 console.log(`SERVICE Update: Eliminando ${idsParaEliminar.length} representante(s) obsoletos:`, idsParaEliminar);
                 await client.query(`DELETE FROM proveedores_morales WHERE id_morales = ANY($1::int[])`, [idsParaEliminar]);
            } else {
                console.log(`SERVICE Update: No hay representantes obsoletos para eliminar.`);
            }


        } else if (tipoProveedor === 'fisica') {
             console.log(`SERVICE Update: Procesando tipo FISICA.`);
             // Actualizar tabla personas_fisicas (dinámicamente como antes)
             const updateFieldsFisicas: string[] = [];
             const updateValuesFisicas: any[] = [];
             let paramIndexFisicas = 1;
             const addUpdateFieldFisica = (fieldNameDb: string, value: any) => { if (value !== undefined) { updateFieldsFisicas.push(`${fieldNameDb} = $${paramIndexFisicas++}`); updateValuesFisicas.push(value); } };
             addUpdateFieldFisica('nombre', nombre); addUpdateFieldFisica('apellido_p', apellido_p); addUpdateFieldFisica('apellido_m', apellido_m); addUpdateFieldFisica('curp', curp);

             if (updateFieldsFisicas.length > 0) {
                 const updateQueryFisicas = `UPDATE personas_fisicas SET ${updateFieldsFisicas.join(', ')} WHERE id_proveedor = $${paramIndexFisicas}`;
                 updateValuesFisicas.push(id_proveedor);
                 const resFis = await client.query(updateQueryFisicas, updateValuesFisicas);
                 if(resFis.rowCount === 0) console.warn(`WARN Service Update: No se encontró registro en 'personas_fisicas' para ID ${id_proveedor}.`);
                 else console.log(`SERVICE Update: Tabla 'personas_fisicas' actualizada.`);
             } else {
                 console.log(`SERVICE Update: Sin campos que actualizar en 'personas_fisicas'.`);
             }
        }

        await client.sql`COMMIT`;
        console.log(`SERVICE Update: Transacción completada (COMMIT) para ID: ${id_proveedor}`);

        // Devolver datos actualizados
        return await getProveedorById(id_proveedor);

    } catch (error: any) {
        console.error(`SERVICE Update: Error actualizando proveedor ID ${id_proveedor}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("SERVICE Update: ROLLBACK ejecutado."); } catch (rbErr) { console.error("Error en ROLLBACK:", rbErr); } }
        console.error("Error detallado en updateProveedorCompleto:", error);
        // Manejar error de FK si ocurre al intentar insertar/actualizar representante
         if (error.code === '23503' && error.constraint === 'fk_proveedor_moral_proveedor_mult') {
             throw new Error(`Error de referencia: El proveedor con ID ${id_proveedor} no existe.`);
         }
        throw new Error(`Error al actualizar el proveedor: ${error.message}`);
    } finally {
        if (client) { await client.release(); }
    }
  };


// --- checkProveedorProfileExists ---
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
    } catch (error) {
        console.error("Error checking provider profile existence:", error);
        // En caso de error, podría ser más seguro asumir que no existe o relanzar
        return false; // O: throw new Error("Error al verificar perfil");
    }
};

/**
 * Actualiza el estado de revisión de un proveedor a 'PENDIENTE_REVISION'.
 * @param idProveedor El ID del proveedor que solicita la revisión.
 * @returns Promise<{id_proveedor: number, estatus_revision: string}> - El ID y el nuevo estado.
 * @throws Error si el proveedor no se encuentra o falla la actualización.
 */
export const solicitarRevisionProveedor = async (idProveedor: number): Promise<{id_proveedor: number, estatus_revision: string}> => {
    console.log(`SERVICE: Solicitando revisión para proveedor ID: ${idProveedor}`);
    if (isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido.");
    }
    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;

        const result = await client.sql`
            UPDATE proveedores
            SET estatus_revision = 'PENDIENTE_REVISION', updated_at = NOW()
            WHERE id_proveedor = ${idProveedor}
              AND (estatus_revision = 'NO_SOLICITADO' OR estatus_revision = 'RECHAZADO' OR estatus_revision IS NULL)
            RETURNING id_proveedor, estatus_revision, rfc,
                      (SELECT COALESCE(pf.nombre || ' ' || pf.apellido_p, pm.razon_social)
                       FROM proveedores p2
                       LEFT JOIN personas_fisicas pf ON p2.id_proveedor = pf.id_proveedor
                       LEFT JOIN proveedores_morales pm ON p2.id_proveedor = pm.id_proveedor
                       WHERE p2.id_proveedor = proveedores.id_proveedor) AS nombre_display;
        `;

        if (result.rowCount === 0) {
            throw new Error(`Proveedor con ID ${idProveedor} no encontrado para solicitar revisión.`);
        }

        const updatedData = result.rows[0];
        console.log(`SERVICE: Revisión solicitada exitosamente para ID: ${idProveedor}. Nuevo estado: ${updatedData.estatus_revision}`);

        const notificationPayload = {
            idProveedor: updatedData.id_proveedor,
            rfc: updatedData.rfc,
            nombreProveedor: updatedData.nombre_display || updatedData.rfc,
            mensaje: `El proveedor ${updatedData.nombre_display || updatedData.rfc} ha solicitado revisión.`,
            timestamp: new Date().toISOString() // Añadir timestamp es útil
        };
                // Usar la función helper para abstraer la llamada
        // Canal: 'admin-notifications' (o como lo llames)
        // Evento: 'nueva-solicitud-revision' (o como lo llames)
        await triggerPusherEvent('admin-notifications', 'nueva-solicitud-revision', notificationPayload);

        await client.sql`COMMIT`;
        console.log(`SERVICE: Transacción COMMIT para solicitud revisión ID: ${idProveedor}.`);

        return {
             id_proveedor: updatedData.id_proveedor,
             estatus_revision: updatedData.estatus_revision
        };

    } catch (error: any) {
        console.error(`SERVICE ERROR en solicitarRevisionProveedor para ID ${idProveedor}:`, error);
        throw new Error(`Error al solicitar la revisión: ${error.message || 'Error desconocido'}`);
    }
};