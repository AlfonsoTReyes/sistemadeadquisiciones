import { sql, VercelPoolClient } from '@vercel/postgres'; // Asegúrate que VercelPoolClient esté importado si usas transacciones

// --- INTERFACES ACTUALIZADAS ---

// Interface para los datos retornados por getProveedorById y getProveedorByUserId
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
    // Nuevos campos
    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;
    // Campos de JOINs
    razon_social?: string | null; // Moral
    nombre_representante?: string | null; // Moral
    apellido_p_representante?: string | null; // Moral
    apellido_m_representante?: string | null; // Moral
    nombre_fisica?: string | null; // Fisica
    apellido_p_fisica?: string | null; // Fisica
    apellido_m_fisica?: string | null; // Fisica
    curp?: string | null; // Fisica
    // Campo calculado
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
}


// Interface para actualizar proveedor
interface UpdateProveedorData {
    // Campos generales de 'proveedores' (todos opcionales en la actualización)
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
    estatus?: boolean; // Permitir actualizar estatus
    actividadSat?: string | null; // Actividad SAT
    proveedorEventos?: boolean;   // Checkbox Eventos
    tipoProveedor: 'moral' | 'fisica';
  
    razon_social?: string;
    nombre_representante?: string;
    apellido_p_representante?: string;
    apellido_m_representante?: string | null;
  
    nombre?: string;
    apellido_p?: string;
    apellido_m?: string | null;
    curp?: string;
  }

// Interface para crear proveedor
interface CreateProveedorData {
  id_usuario_proveedor: number; // ID del USUARIO proveedor

  // Campos comunes de 'proveedores' (requeridos)
  rfc: string; giro_comercial: string; correo: string; calle: string; numero: string; colonia: string; codigo_postal: string; municipio: string; estado: string; telefono_uno: string;
  actividadSat: string;

  // Campos comunes opcionales
  telefono_dos?: string | null; pagina_web?: string | null; camara_comercial?: string | null; numero_registro_camara?: string | null; numero_registro_imss?: string | null;
  proveedorEventos?: boolean;

  tipoProveedor: 'moral' | 'fisica';

  razon_social?: string; nombre_representante?: string; apellido_p_representante?: string;
  apellido_m_representante?: string | null;

  nombre?: string; apellido_p?: string; curp?: string;
  apellido_m?: string | null;
}


// --- FUNCIONES ACTUALIZADAS ---

export const getProveedorById = async (id: number): Promise<ProveedorDetallado> => {
  try {
    console.log(`DEBUG Service: Fetching provider by ID: ${id}`);
    const result = await sql`
      SELECT
        p.id_proveedor, p.rfc, p.giro_comercial, p.correo, p.camara_comercial,
        p.numero_registro_camara, p.numero_registro_imss, p.fecha_inscripcion,
        p.fecha_vigencia, p.estatus, p.created_at, p.updated_at, p.fecha_solicitud,
        p.calle, p.numero, p.colonia, p.codigo_postal, p.municipio, p.estado,
        p.telefono_uno, p.telefono_dos, p.pagina_web, p.id_usuario_proveedor,
        p.actividad_sat, p.proveedor_eventos, -- <-- NUEVOS CAMPOS SELECCIONADOS
        m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
        f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
      WHERE p.id_proveedor = ${id};
    `;

    if (result.rows.length === 0) {
      console.error(`DEBUG Service: Provider not found for ID: ${id}`);
      throw new Error('Proveedor no encontrado.');
    }

    const row = result.rows[0];
    const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
    console.log(`DEBUG Service: Provider found, type: ${tipo}`);

    const proveedor: ProveedorDetallado = {
        id_proveedor: row.id_proveedor,
        rfc: row.rfc,
        giro_comercial: row.giro_comercial,
        correo: row.correo,
        camara_comercial: row.camara_comercial,
        numero_registro_camara: row.numero_registro_camara,
        numero_registro_imss: row.numero_registro_imss,
        fecha_inscripcion: row.fecha_inscripcion,
        fecha_vigencia: row.fecha_vigencia,
        estatus: row.estatus,
        created_at: row.created_at,
        updated_at: row.updated_at,
        fecha_solicitud: row.fecha_solicitud,
        calle: row.calle,
        numero: row.numero,
        colonia: row.colonia,
        codigo_postal: row.codigo_postal,
        municipio: row.municipio,
        estado: row.estado,
        telefono_uno: row.telefono_uno,
        telefono_dos: row.telefono_dos,
        pagina_web: row.pagina_web,
        id_usuario_proveedor: row.id_usuario_proveedor,
        actividad_sat: row.actividad_sat, // <-- Nuevo campo
        proveedor_eventos: row.proveedor_eventos, // <-- Nuevo campo
        razon_social: row.razon_social,
        nombre_representante: row.nombre_representante,
        apellido_p_representante: row.apellido_p_representante,
        apellido_m_representante: row.apellido_m_representante,
        nombre_fisica: row.nombre_fisica,
        apellido_p_fisica: row.apellido_p_fisica,
        apellido_m_fisica: row.apellido_m_fisica,
        curp: row.curp,
        tipo_proveedor: tipo,
    };

    return proveedor;

  } catch (error) {
    console.error(`Error fetching proveedor by ID ${id}:`, error);
    return Promise.reject(new Error('Error al obtener datos del proveedor.'));
  }
};

// Fetch the main provider profile linked to a specific provider user ID
export const getProveedorByUserId = async (id_usuario_proveedor: number): Promise<ProveedorDetallado | null> => {
  console.log(`DEBUG Service: Fetching provider profile for user ID: ${id_usuario_proveedor}`);
  try {
      if (isNaN(id_usuario_proveedor)) {
          throw new Error("ID de usuario proveedor inválido proporcionado.");
      }
      const result = await sql`
      SELECT
          p.id_proveedor, p.rfc, p.giro_comercial, p.correo, p.camara_comercial,
          p.numero_registro_camara, p.numero_registro_imss, p.fecha_inscripcion,
          p.fecha_vigencia, p.estatus, p.created_at, p.updated_at, p.fecha_solicitud,
          p.calle, p.numero, p.colonia, p.codigo_postal, p.municipio, p.estado,
          p.telefono_uno, p.telefono_dos, p.pagina_web, p.id_usuario_proveedor,
          p.actividad_sat, p.proveedor_eventos, -- <-- NUEVOS CAMPOS SELECCIONADOS
          m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
          f.nombre AS nombre_fisica,
          f.apellido_p AS apellido_p_fisica,
          f.apellido_m AS apellido_m_fisica,
          f.curp
      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
      WHERE p.id_usuario_proveedor = ${id_usuario_proveedor}
      LIMIT 1;
    `;

      if (result.rows.length === 0) {
          console.log(`DEBUG Service: No provider profile found for user ID: ${id_usuario_proveedor}`);
          return null;
      }

      const row = result.rows[0];
      const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
      console.log(`DEBUG Service: Profile found, type determined as: ${tipo}`);

      // Mapeo explícito
      const proveedor: ProveedorDetallado = {
        id_proveedor: row.id_proveedor,
        rfc: row.rfc,
        giro_comercial: row.giro_comercial,
        correo: row.correo,
        camara_comercial: row.camara_comercial,
        numero_registro_camara: row.numero_registro_camara,
        numero_registro_imss: row.numero_registro_imss,
        fecha_inscripcion: row.fecha_inscripcion,
        fecha_vigencia: row.fecha_vigencia,
        estatus: row.estatus,
        created_at: row.created_at,
        updated_at: row.updated_at,
        fecha_solicitud: row.fecha_solicitud,
        calle: row.calle,
        numero: row.numero,
        colonia: row.colonia,
        codigo_postal: row.codigo_postal,
        municipio: row.municipio,
        estado: row.estado,
        telefono_uno: row.telefono_uno,
        telefono_dos: row.telefono_dos,
        pagina_web: row.pagina_web,
        id_usuario_proveedor: row.id_usuario_proveedor,
        actividad_sat: row.actividad_sat, // <-- Nuevo campo
        proveedor_eventos: row.proveedor_eventos, // <-- Nuevo campo
        razon_social: row.razon_social,
        nombre_representante: row.nombre_representante,
        apellido_p_representante: row.apellido_p_representante,
        apellido_m_representante: row.apellido_m_representante,
        nombre_fisica: row.nombre_fisica,
        apellido_p_fisica: row.apellido_p_fisica,
        apellido_m_fisica: row.apellido_m_fisica,
        curp: row.curp,
        tipo_proveedor: tipo,
      };

      return proveedor;

  } catch (error) {
      console.error(`Error fetching provider profile by user ID ${id_usuario_proveedor}:`, error);
      // throw new Error('Error al obtener el perfil del proveedor.');
      return Promise.reject(new Error('Error al obtener el perfil del proveedor.'));
  }
};


// --- ACTUALIZADO updateProveedorCompleto ---
export const updateProveedorCompleto = async (
    id_proveedor: number,
    proveedorData: UpdateProveedorData
  ): Promise<ProveedorDetallado> => { // Usar la interfaz detallada como tipo de retorno
    const {
        // Destructurar TODOS los campos posibles de UpdateProveedorData
        // Campos comunes
        rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal,
        municipio, estado, telefono_uno, telefono_dos, pagina_web,
        camara_comercial, numero_registro_camara, numero_registro_imss,
        estatus,
        // Nuevos campos comunes
        actividadSat, proveedorEventos,
        // Tipo y campos específicos
        tipoProveedor,
        razon_social, nombre_representante, apellido_p_representante, apellido_m_representante,
        nombre, apellido_p, apellido_m, curp
    } = proveedorData;
  
    // Validación inicial (Tipo de proveedor sigue siendo necesario para la lógica)
    if (!tipoProveedor || (tipoProveedor !== 'moral' && tipoProveedor !== 'fisica')) {
        // Si el tipo no se envía, podríamos intentar obtenerlo de la BD primero,
        // pero por ahora, lo mantenemos requerido en el input para la lógica condicional.
        throw new Error("Tipo de proveedor ('moral' o 'fisica') es requerido para la actualización.");
    }
  
    let client: VercelPoolClient | null = null;
    try {
        client = await sql.connect();
        await client.sql`BEGIN`;
        console.log(`DEBUG Service Update: Iniciando actualización para ID: ${id_proveedor} (Tipo declarado: ${tipoProveedor})`);
        console.log(`DEBUG Service Update: Datos recibidos:`, proveedorData);
  
        // 1. Actualizar tabla 'proveedores' dinámicamente
        const updateFieldsProveedores: string[] = [];
        const updateValuesProveedores: any[] = [];
        let paramIndexProveedores = 1;
  
        // Función helper para añadir campo si está definido
        const addUpdateField = (fieldNameDb: string, value: any) => {
            if (value !== undefined) {
                updateFieldsProveedores.push(`${fieldNameDb} = $${paramIndexProveedores++}`);
                updateValuesProveedores.push(value); // Incluir nulls explícitos si se envían
            }
        };
  
        // Añadir campos comunes estándar
        addUpdateField('rfc', rfc);
        addUpdateField('giro_comercial', giro_comercial);
        addUpdateField('correo', correo);
        addUpdateField('calle', calle);
        addUpdateField('numero', numero);
        addUpdateField('colonia', colonia);
        addUpdateField('codigo_postal', codigo_postal);
        addUpdateField('municipio', municipio);
        addUpdateField('estado', estado);
        addUpdateField('telefono_uno', telefono_uno);
        addUpdateField('telefono_dos', telefono_dos);
        addUpdateField('pagina_web', pagina_web);
        addUpdateField('camara_comercial', camara_comercial);
        addUpdateField('numero_registro_camara', numero_registro_camara);
        addUpdateField('numero_registro_imss', numero_registro_imss);
  
        // Añadir estatus (manejo especial del booleano si es necesario)
         if (estatus !== undefined) {
            // Asegurarse de que sea booleano
            const estatusFinal = typeof estatus === 'boolean' ? estatus : !!estatus;
            addUpdateField('estatus', estatusFinal);
         }
  
        addUpdateField('actividad_sat', actividadSat); // Nombre columna snake_case
        addUpdateField('proveedor_eventos', proveedorEventos); // Nombre columna snake_case
  
        // Siempre actualizar 'updated_at'
        if (updateFieldsProveedores.length > 0) { // Solo si hay algo que actualizar
            updateFieldsProveedores.push(`updated_at = CURRENT_TIMESTAMP`);
            const updateQueryProveedores = `UPDATE proveedores SET ${updateFieldsProveedores.join(', ')} WHERE id_proveedor = $${paramIndexProveedores}`;
            updateValuesProveedores.push(id_proveedor);
  
            console.log("DEBUG Service Update: Query Proveedores:", updateQueryProveedores);
            console.log("DEBUG Service Update: Values Proveedores:", updateValuesProveedores);
            await client.query(updateQueryProveedores, updateValuesProveedores);
            console.log(`DEBUG Service Update: Tabla 'proveedores' actualizada para ID: ${id_proveedor}`);
        } else {
             console.log(`DEBUG Service Update: No se actualizaron campos en 'proveedores' para ID: ${id_proveedor}`);
             // Actualizar solo updated_at si no hay otros cambios? Opcional.
             // await client.sql`UPDATE proveedores SET updated_at = CURRENT_TIMESTAMP WHERE id_proveedor = ${id_proveedor}`;
        }
  
  
        // 2. Actualizar tabla específica (moral o física) dinámicamente
        // Solo intentamos actualizar la tabla específica si vienen datos para ella.
        if (tipoProveedor === 'moral') {
            const updateFieldsMorales: string[] = [];
            const updateValuesMorales: any[] = [];
            let paramIndexMorales = 1;
  
            const addUpdateFieldMoral = (fieldNameDb: string, value: any) => {
                if (value !== undefined) {
                    updateFieldsMorales.push(`${fieldNameDb} = $${paramIndexMorales++}`);
                    updateValuesMorales.push(value);
                }
            };
  
            addUpdateFieldMoral('razon_social', razon_social);
            addUpdateFieldMoral('nombre_representante', nombre_representante);
            addUpdateFieldMoral('apellido_p_representante', apellido_p_representante);
            addUpdateFieldMoral('apellido_m_representante', apellido_m_representante);
             // Añadir aquí lógica para acta_constitutiva, poder_notarial si son editables
  
            if (updateFieldsMorales.length > 0) {
                 const updateQueryMorales = `UPDATE proveedores_morales SET ${updateFieldsMorales.join(', ')} WHERE id_proveedor = $${paramIndexMorales}`;
                 updateValuesMorales.push(id_proveedor);
  
                 console.log("DEBUG Service Update: Query Morales:", updateQueryMorales);
                 console.log("DEBUG Service Update: Values Morales:", updateValuesMorales);
                 const resultMorales = await client.query(updateQueryMorales, updateValuesMorales);
                 console.log(`DEBUG Service Update: Tabla 'proveedores_morales' actualizada para ID: ${id_proveedor}. Filas afectadas: ${resultMorales.rowCount}`);
                  if (resultMorales.rowCount === 0) {
                       console.warn(`WARN Service Update: No se encontró registro en 'proveedores_morales' para ID ${id_proveedor} durante la actualización.`);
                       // Considera si esto debería ser un error dependiendo de tu lógica de negocio
                  }
            } else {
                console.log(`DEBUG Service Update: No se actualizaron campos en 'proveedores_morales' para ID: ${id_proveedor}`);
            }
  
        } else if (tipoProveedor === 'fisica') {
            const updateFieldsFisicas: string[] = [];
            const updateValuesFisicas: any[] = [];
            let paramIndexFisicas = 1;
  
            const addUpdateFieldFisica = (fieldNameDb: string, value: any) => {
                if (value !== undefined) {
                    updateFieldsFisicas.push(`${fieldNameDb} = $${paramIndexFisicas++}`);
                    updateValuesFisicas.push(value);
                }
            };
  
            addUpdateFieldFisica('nombre', nombre);
            addUpdateFieldFisica('apellido_p', apellido_p);
            addUpdateFieldFisica('apellido_m', apellido_m);
            addUpdateFieldFisica('curp', curp);
  
            if (updateFieldsFisicas.length > 0) {
                const updateQueryFisicas = `UPDATE personas_fisicas SET ${updateFieldsFisicas.join(', ')} WHERE id_proveedor = $${paramIndexFisicas}`;
                updateValuesFisicas.push(id_proveedor);
  
                console.log("DEBUG Service Update: Query Fisicas:", updateQueryFisicas);
                console.log("DEBUG Service Update: Values Fisicas:", updateValuesFisicas);
                const resultFisicas = await client.query(updateQueryFisicas, updateValuesFisicas);
                console.log(`DEBUG Service Update: Tabla 'personas_fisicas' actualizada para ID: ${id_proveedor}. Filas afectadas: ${resultFisicas.rowCount}`);
                 if (resultFisicas.rowCount === 0) {
                       console.warn(`WARN Service Update: No se encontró registro en 'personas_fisicas' para ID ${id_proveedor} durante la actualización.`);
                       // Considera si esto debería ser un error
                  }
            } else {
                 console.log(`DEBUG Service Update: No se actualizaron campos en 'personas_fisicas' para ID: ${id_proveedor}`);
            }
        }
  
        await client.sql`COMMIT`;
        console.log(`DEBUG Service Update: Transacción completada (COMMIT) para ID: ${id_proveedor}`);
  
        // Devolver los datos frescos y completos del proveedor actualizado
        // Asegúrate que getProveedorById también selecciona los nuevos campos
        return await getProveedorById(id_proveedor);
  
    } catch (error: any) {
        console.error(`DEBUG Service Update: Error actualizando proveedor ID ${id_proveedor}`);
        if (client) {
            try {
                await client.sql`ROLLBACK`;
                console.log("DEBUG Service Update: Transacción revertida (ROLLBACK).");
            } catch (rbErr) {
                console.error("Error durante ROLLBACK:", rbErr);
            }
        }
        console.error("Error detallado en updateProveedorCompleto:", error);
        // Propagar el error para que la capa superior (route) lo maneje
        throw new Error(`Error al actualizar el proveedor (ID: ${id_proveedor}): ${error.message}`);
    } finally {
        if (client) {
            await client.release();
        }
    }
  };
  

// --- ACTUALIZADO createProveedorCompleto ---
export const createProveedorCompleto = async (data: CreateProveedorData): Promise<{ id_proveedor: number }> => {
  const {
      id_usuario_proveedor,
      rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal,
      municipio, estado, telefono_uno, telefono_dos, pagina_web,
      camara_comercial, numero_registro_camara, numero_registro_imss,
      tipoProveedor,
      // Morales
      razon_social, nombre_representante, apellido_p_representante, apellido_m_representante,
      // Físicos
      nombre, apellido_p, apellido_m, curp,
      // NUEVOS CAMPOS
      actividadSat, proveedorEventos
  } = data;

  // Validar campos requeridos específicos del tipo
  if (tipoProveedor === 'moral' && (!razon_social || !nombre_representante || !apellido_p_representante)) {
       throw new Error("Faltan campos requeridos para Persona Moral (Razón Social, Nombre Rep., Apellido P Rep.).");
  }
  if (tipoProveedor === 'fisica' && (!nombre || !apellido_p || !curp)) {
      throw new Error("Faltan campos requeridos para Persona Física (Nombre, Apellido P, CURP).");
  }
  // Validar nuevo campo requerido
  if (!actividadSat) {
      throw new Error("El campo 'Actividad SAT' es requerido.");
  }


  let client: VercelPoolClient | null = null;
  let newProveedorId: number | null = null;

  try {
      client = await sql.connect();
      await client.sql`BEGIN`;
      console.log(`DEBUG createProveedorCompleto: Creating profile for user ID: ${id_usuario_proveedor}`);

      // INSERT en proveedores incluyendo los nuevos campos
      const proveedorResult = await client.sql`
          INSERT INTO proveedores (
              rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal,
              municipio, estado, telefono_uno, telefono_dos, pagina_web,
              camara_comercial, numero_registro_camara, numero_registro_imss,
              actividad_sat, proveedor_eventos, -- <-- NUEVOS CAMPOS
              estatus, id_usuario_proveedor,
              -- created_at, updated_at, fecha_solicitud, fecha_inscripcion, fecha_vigencia se manejan con DEFAULT o CURRENT_TIMESTAMP si así está configurado en la BD
               created_at, updated_at, fecha_solicitud -- Asumiendo defaults o triggers, si no, añadirlos
          ) VALUES (
              ${rfc}, ${giro_comercial}, ${correo}, ${calle}, ${numero}, ${colonia}, ${codigo_postal},
              ${municipio}, ${estado}, ${telefono_uno}, ${telefono_dos ?? null}, ${pagina_web ?? null},
              ${camara_comercial ?? null}, ${numero_registro_camara ?? null}, ${numero_registro_imss ?? null},
              ${actividadSat}, ${proveedorEventos ?? false}, -- <-- Valores para nuevos campos (default false para checkbox)
              ${true}, -- estatus por defecto true
              ${id_usuario_proveedor},
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP -- Si no hay defaults/triggers
          ) RETURNING id_proveedor;
      `;

      newProveedorId = proveedorResult.rows[0]?.id_proveedor;

      if (!newProveedorId) {
          throw new Error("No se pudo crear el registro principal del proveedor.");
      }
      console.log(`DEBUG createProveedorCompleto: Main provider record created with ID: ${newProveedorId}`);

      // INSERT en tabla específica (moral o física) - Lógica sin cambios
      if (tipoProveedor === 'moral') {
          await client.sql`
            INSERT INTO proveedores_morales (id_proveedor, razon_social, nombre_representante, apellido_p_representante, apellido_m_representante)
            VALUES (${newProveedorId}, ${razon_social}, ${nombre_representante}, ${apellido_p_representante}, ${apellido_m_representante ?? null});
          `;
          console.log(`DEBUG createProveedorCompleto: Inserted into proveedores_morales for ID: ${newProveedorId}`);
      } else if (tipoProveedor === 'fisica') {
          await client.sql`
            INSERT INTO personas_fisicas (id_proveedor, nombre, apellido_p, apellido_m, curp)
            VALUES (${newProveedorId}, ${nombre}, ${apellido_p}, ${apellido_m ?? null}, ${curp});
          `;
           console.log(`DEBUG createProveedorCompleto: Inserted into personas_fisicas for ID: ${newProveedorId}`);
      }
      // No es necesario un else aquí porque la validación inicial ya lo cubre

      await client.sql`COMMIT`;
      console.log(`DEBUG createProveedorCompleto: Transaction committed for user ID: ${id_usuario_proveedor}, Provider ID: ${newProveedorId}`);
      return { id_proveedor: newProveedorId };

    } catch (error: any) {
         console.error(`DEBUG createProveedorCompleto: Error creating profile for user ID: ${id_usuario_proveedor}`);
        if (client) { try { await client.sql`ROLLBACK`; console.log("DEBUG: Transaction rolled back."); } catch (rbErr) { console.error("Error during ROLLBACK:", rbErr); } }
        console.error(`Error creating proveedor completo:`, error);
         // Manejo de errores existentes
         if (error.code === '23505' && error.constraint === 'proveedores_id_usuario_proveedor_key') {
             throw new Error('Este usuario proveedor ya tiene un perfil registrado.');
         }
         // Puedes añadir más manejo de errores específicos aquí si es necesario
        throw new Error(`Error al registrar el proveedor: ${error.message}`);
    } finally {
        if (client) { await client.release(); }
    }
};


// --- checkProveedorProfileExists (SIN CAMBIOS) ---
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