import { sql } from '@vercel/postgres';

export const getProveedorById = async (id: number) => {
  try {
    const result = await sql`
      SELECT
        p.*,
        m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
        f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
      WHERE p.id_proveedor = ${id};
    `;

    if (result.rows.length === 0) {
      throw new Error('Proveedor no encontrado.');
    }

    // Determine type based on which fields are not null
    const row = result.rows[0];
    const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');

    return { ...row, tipo_proveedor: tipo }; // Add tipo for easier frontend handling

  } catch (error) {
    console.error("Error fetching proveedor by ID:", error);
    throw new Error('Error al obtener datos del proveedor.'); // More generic error to client
  }
};

// Fetch the main provider profile linked to a specific provider user ID
export const getProveedorByUserId = async (id_usuario_proveedor: number) => {
  console.log(`DEBUG Service: Fetching provider profile for user ID: ${id_usuario_proveedor}`);
  try {
      if (isNaN(id_usuario_proveedor)) {
          throw new Error("ID de usuario proveedor inválido proporcionado.");
      }
      // Join proveedores with morales and fisicas using LEFT JOIN
      const result = await sql`
      SELECT
          p.id_proveedor, p.rfc, p.giro_comercial, p.correo, p.camara_comercial,
          p.numero_registro_camara, p.numero_registro_imss, p.fecha_inscripcion,
          p.fecha_vigencia, p.estatus, p.created_at, p.updated_at, p.fecha_solicitud,
          p.calle, p.numero, p.colonia, p.codigo_postal, p.municipio, p.estado,
          p.telefono_uno, p.telefono_dos, p.pagina_web, p.id_usuario_proveedor,
          m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
          f.nombre AS nombre_fisica,
          f.apellido_p AS apellido_p_fisica, -- Corrected alias: use apellido_p
          f.apellido_m AS apellido_m_fisica, -- Kept apellido_m
          f.curp
      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor -- Join with personas_fisicas aliased as f
      WHERE p.id_usuario_proveedor = ${id_usuario_proveedor}
      LIMIT 1;
`;

      if (result.rows.length === 0) {
          console.log(`DEBUG Service: No provider profile found for user ID: ${id_usuario_proveedor}`);
          return null; // Or throw new Error('Perfil de proveedor no encontrado para este usuario.');
      }

      const row = result.rows[0];
      // Determine type based on which join succeeded
      const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
      console.log(`DEBUG Service: Profile found, type determined as: ${tipo}`);

      return { ...row, tipo_proveedor: tipo }; // Add tipo for easier frontend handling

  } catch (error) {
      console.error(`Error fetching provider profile by user ID ${id_usuario_proveedor}:`, error);
      throw new Error('Error al obtener el perfil del proveedor.');
  }
};


interface UpdateProveedorData {
  // General fields from 'proveedores' table
  rfc?: string; giro_comercial?: string; correo?: string; calle?: string; numero?: string;
  colonia?: string; codigo_postal?: string; municipio?: string; estado?: string;
  telefono_uno?: string; telefono_dos?: string | null; pagina_web?: string | null;
  camara_comercial?: string | null; numero_registro_camara?: string | null; numero_registro_imss?: string | null;
  estatus?: boolean; // Allow updating status if needed
  // You might add fecha_inscripcion, fecha_vigencia if they become editable

  // Type identifier (CRUCIAL)
  tipoProveedor: 'moral' | 'fisica';

  // Moral fields (only relevant if tipoProveedor is 'moral')
  razon_social?: string; nombre_representante?: string;
  apellido_p_representante?: string; apellido_m_representante?: string | null;

  // Física fields (only relevant if tipoProveedor is 'fisica')
  nombre?: string; apellido_p?: string; apellido_m?: string | null; curp?: string;
}
// --- REFINED updateProveedorCompleto ---
export const updateProveedorCompleto = async (
  id_proveedor: number, // Use the main provider ID
  proveedorData: UpdateProveedorData
): Promise<any> => { // Return type could be more specific (e.g., result of getProveedorById)
  const {
      // Destructure all possible fields
      rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal,
      municipio, estado, telefono_uno, telefono_dos, pagina_web,
      camara_comercial, numero_registro_camara, numero_registro_imss,
      estatus, // Include status if updatable
      tipoProveedor,
      // Moral fields
      razon_social, nombre_representante, apellido_p_representante, apellido_m_representante,
      // Física fields
      nombre, apellido_p, apellido_m, curp
  } = proveedorData;

    // --- SOLUCIÓN: Preparar el valor booleano para estatus ---
  // Si estatus NO viene en el payload (es undefined), asigna true por defecto.
  // Si SÍ viene, asegúrate de que sea un booleano (true o false).
  // Usar !! (doble negación) convierte cualquier valor "truthy" a true y "falsy" (0, "", null, undefined, false) a false.
  // Esto maneja correctamente si llega true, false, "true", "false", undefined, null.
  const estatusFinal: boolean = proveedorData.estatus === undefined ? true : !!proveedorData.estatus;
  // Alternativa más explícita si prefieres:
  // const estatusFinal: boolean = typeof proveedorData.estatus === 'boolean' ? proveedorData.estatus : (proveedorData.estatus === undefined ? true : Boolean(proveedorData.estatus));

  // Validate crucial input
  if (!tipoProveedor || (tipoProveedor !== 'moral' && tipoProveedor !== 'fisica')) {
      throw new Error("Tipo de proveedor inválido especificado para la actualización.");
  }

  let client: VercelPoolClient | null = null;
  try {
      client = await sql.connect();
      await client.sql`BEGIN`;
      console.log(`DEBUG updateProveedorCompleto: Updating provider ID ${id_proveedor} (Type: ${tipoProveedor})`);
      console.log(`DEBUG updateProveedorCompleto: Estatus value being sent: ${estatusFinal} (Type: ${typeof estatusFinal})`); // <-- Log para verificar

      // 1. Update common fields in 'proveedores' table
      // Build the SET clause dynamically ONLY for fields actually provided in proveedorData
      // to avoid overwriting existing data with undefined/null unnecessarily.
      // (Simplified approach below updates all passed fields)
      await client.sql`
          UPDATE proveedores
          SET
              rfc = ${rfc},
              giro_comercial = ${giro_comercial},
              correo = ${correo},
              calle = ${calle},
              numero = ${numero},
              colonia = ${colonia},
              codigo_postal = ${codigo_postal},
              municipio = ${municipio},
              estado = ${estado},
              telefono_uno = ${telefono_uno},
              telefono_dos = ${telefono_dos ?? null},
              pagina_web = ${pagina_web ?? null},
              camara_comercial = ${camara_comercial ?? null},
              numero_registro_camara = ${numero_registro_camara ?? null},
              numero_registro_imss = ${numero_registro_imss ?? null},
              updated_at = CURRENT_TIMESTAMP
          WHERE id_proveedor = ${id_proveedor};
      `;
      console.log(`DEBUG updateProveedorCompleto: Updated 'proveedores' table for ID ${id_proveedor}`);


      // 2. Conditionally update specific tables
      if (tipoProveedor === 'moral') {
           // Check if moral-specific data is present before updating
           if (razon_social !== undefined && nombre_representante !== undefined && apellido_p_representante !== undefined) {
              const resultMorales = await client.sql`
                  UPDATE proveedores_morales
                  SET
                      razon_social = ${razon_social},
                      nombre_representante = ${nombre_representante},
                      apellido_p_representante = ${apellido_p_representante},
                      apellido_m_representante = ${apellido_m_representante ?? null}
                  WHERE id_proveedor = ${id_proveedor}
                  RETURNING id_morales;
              `;
              if (resultMorales.rows.length === 0) {
                  console.warn(`WARN updateProveedorCompleto: No matching record found in 'proveedores_morales' for ID ${id_proveedor}. Data might be inconsistent.`);
                  // Optional: Throw an error if the record MUST exist
                  // throw new Error('Registro moral del proveedor no encontrado para actualizar.');
              } else {
                   console.log(`DEBUG updateProveedorCompleto: Updated 'proveedores_morales' for ID ${id_proveedor}`);
              }
           } else {
                console.log(`DEBUG updateProveedorCompleto: Skipping 'proveedores_morales' update as key fields were missing in input.`);
           }

      } else if (tipoProveedor === 'fisica') {
           // Check if fisica-specific data is present before updating
           if (nombre !== undefined && apellido_p !== undefined && curp !== undefined) {
               const resultFisicas = await client.sql`
                  UPDATE personas_fisicas
                  SET
                      nombre = ${nombre},
                      apellido_p = ${apellido_p},
                      apellido_m = ${apellido_m ?? null},
                      curp = ${curp}
                  WHERE id_proveedor = ${id_proveedor}
                  RETURNING id_fisicas;
              `;
               if (resultFisicas.rows.length === 0) {
                  console.warn(`WARN updateProveedorCompleto: No matching record found in 'personas_fisicas' for ID ${id_proveedor}. Data might be inconsistent.`);
                   // Optional: Throw an error if the record MUST exist
                   // throw new Error('Registro de persona física no encontrado para actualizar.');
               } else {
                   console.log(`DEBUG updateProveedorCompleto: Updated 'personas_fisicas' for ID ${id_proveedor}`);
               }
           } else {
                console.log(`DEBUG updateProveedorCompleto: Skipping 'personas_fisicas' update as key fields were missing in input.`);
           }
      }

      await client.sql`COMMIT`;
      console.log(`DEBUG updateProveedorCompleto: Transaction committed for ID ${id_proveedor}`);

      // Return the freshly updated data
      return await getProveedorById(id_proveedor);

  } catch (error: any) {
      console.error(`DEBUG updateProveedorCompleto: Error updating provider ID ${id_proveedor}`);
      if (client) { try { await client.sql`ROLLBACK`; } catch (rbErr) { console.error("Error during ROLLBACK:", rbErr); } }
      console.error("Error en updateProveedorCompleto:", error);
       // Check for specific DB errors if needed (e.g., constraint violations on update)
      // ...
      throw new Error(`Error al actualizar el proveedor (ID: ${id_proveedor}). ${error.message}`);
  } finally {
      if (client) { await client.release(); }
  }
};


interface CreateProveedorData {
  id_usuario_proveedor: number; // ID of the provider USER creating this profile

  // Common fields from 'proveedores'
  rfc: string; giro_comercial: string; correo: string; calle: string; numero: string; colonia: string; codigo_postal: string; municipio: string; estado: string; telefono_uno: string; telefono_dos?: string; pagina_web?: string; camara_comercial?: string; numero_registro_camara?: string; numero_registro_imss?: string;

  // Type discriminator
  tipoProveedor: 'moral' | 'fisica';

  // Moral fields
  razon_social?: string; nombre_representante?: string; apellido_p_representante?: string; apellido_m_representante?: string;

  // Física fields
  nombre?: string; apellido_p?: string; apellido_m?: string; curp?: string;
}

export const createProveedorCompleto = async (data: CreateProveedorData) => {
  const {
      id_usuario_proveedor,
      rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal,
      municipio, estado, telefono_uno, telefono_dos, pagina_web,
      camara_comercial, numero_registro_camara, numero_registro_imss,
      tipoProveedor,
      razon_social, nombre_representante, apellido_p_representante, apellido_m_representante,
      nombre, apellido_p, apellido_m, curp
  } = data;

  let client: VercelPoolClient | null = null;
  let newProveedorId = null;

  try {
      client = await sql.connect();
      await client.sql`BEGIN`;
      console.log(`DEBUG: Creating main provider profile linked to user ID: ${id_usuario_proveedor}`);

      // Add id_usuario_proveedor to the INSERT statement
      const proveedorResult = await client.sql`
          INSERT INTO proveedores (
              rfc, giro_comercial, correo, calle, numero, colonia, codigo_postal,             /* 7 */
              municipio, estado, telefono_uno, telefono_dos, pagina_web,                      /* 5 = 12 */
              camara_comercial, numero_registro_camara, numero_registro_imss,                /* 3 = 15 */
              fecha_inscripcion, fecha_vigencia, estatus, created_at, updated_at, fecha_solicitud, /* 6 = 21 */
              id_usuario_proveedor -- Added column (22nd column)
          ) VALUES (
              ${rfc}, ${giro_comercial}, ${correo}, ${calle}, ${numero}, ${colonia}, ${codigo_postal}, /* 7 params */
              ${municipio}, ${estado}, ${telefono_uno}, ${telefono_dos ?? null}, ${pagina_web ?? null}, /* 5 = 12 params */
              ${camara_comercial ?? null}, ${numero_registro_camara ?? null}, ${numero_registro_imss ?? null}, /* 3 = 15 params */
              NULL,                       -- fecha_inscripcion default
              NULL,                       -- fecha_vigencia default
              ${true},                    -- estatus (16th param)
              CURRENT_TIME,               -- created_at
              CURRENT_TIMESTAMP,          -- updated_at
              CURRENT_TIMESTAMP,          -- fecha_solicitud
              ${id_usuario_proveedor}     -- Value for id_usuario_proveedor (17th param)
          ) RETURNING id_proveedor;
      `;
      // --- End of modified INSERT ---

      newProveedorId = proveedorResult.rows[0]?.id_proveedor;

      if (!newProveedorId) {
          throw new Error("Main Provider Insert: No se pudo recuperar el ID del nuevo proveedor.");
      }
      console.log(`DEBUG: Main provider profile created with ID: ${newProveedorId}`);

      // --- Second INSERT (Moral/Fisica) - REMAINS THE SAME ---
      console.log(`DEBUG: Manual SQL Corrected Time - Preparing second insert (Type: ${tipoProveedor})`);
       if (tipoProveedor === 'moral') {
          if (!razon_social || !nombre_representante || !apellido_p_representante) { throw new Error("Faltan campos requeridos para Persona Moral..."); }
          await client.sql`INSERT INTO proveedores_morales (id_proveedor, razon_social, nombre_representante, apellido_p_representante, apellido_m_representante) VALUES (${newProveedorId}, ${razon_social}, ${nombre_representante}, ${apellido_p_representante}, ${apellido_m_representante ?? null});`;
          console.log(`DEBUG: Manual SQL Corrected Time - Inserted into proveedores_morales ID: ${newProveedorId}`);
      } else if (tipoProveedor === 'fisica') {
           if (!nombre || !apellido_p || !curp) { throw new Error("Faltan campos requeridos para Persona Física..."); }
          await client.sql`INSERT INTO personas_fisicas (id_proveedor, nombre, apellido_p, apellido_m, curp) VALUES (${newProveedorId}, ${nombre}, ${apellido_p}, ${apellido_m ?? null}, ${curp});`;
           console.log(`DEBUG: Manual SQL Corrected Time - Inserted into personas_fisicas ID: ${newProveedorId}`);
      } else {
          throw new Error("Tipo de proveedor inválido especificado.");
      }

      await client.sql`COMMIT`;
        console.log(`DEBUG: Transaction committed for main provider profile linked to user: ${id_usuario_proveedor}`);
        return { id_proveedor: newProveedorId };

    } catch (error: any) {
         console.error(`DEBUG: Error creating main provider profile linked to user ID: ${id_usuario_proveedor}`);
        if (client) { try { await client.sql`ROLLBACK`; } catch (rbErr) { console.error("Error during ROLLBACK:", rbErr); } }
        console.error(`Error creating proveedor main profile:`, error);
         // Handle specific errors like unique constraint on id_usuario_proveedor if applicable
         if (error.code === '23505' && error.constraint === 'proveedores_id_usuario_proveedor_key') { // Adjust constraint name if needed
             throw new Error('Este usuario proveedor ya tiene un perfil de proveedor principal registrado.');
         }
        // ... (rest of existing error handling) ...
        throw new Error('Error interno al registrar el perfil principal del proveedor.');
    } finally {
        if (client) { await client.release(); }
    }
};

// --- NEW FUNCTION to check if provider profile exists ---
export const checkProveedorProfileExists = async (id_usuario_proveedor: number): Promise<boolean> => {
    try {
        console.log(`DEBUG: Checking profile existence for user ID: ${id_usuario_proveedor}`);
        const result = await sql`
            SELECT 1
            FROM proveedores
            WHERE id_usuario_proveedor = ${id_usuario_proveedor}
            LIMIT 1;
        `;
        console.log(`DEBUG: Profile exists result count: ${result.rows.length}`);
        return result.rows.length > 0;
    } catch (error) {
        console.error("Error checking provider profile existence:", error);
        return false; // Assume not found or error occurred during check
    }
};