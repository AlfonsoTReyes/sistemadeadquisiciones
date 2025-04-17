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
        // Consulta actual (obtiene nombre/razón social para determinar tipo)
        const result = await sql`
            SELECT
                p.id_proveedor, p.rfc, p.correo, p.estatus, p.telefono_uno,
                m.razon_social, f.nombre AS nombre_fisica
            FROM proveedores p
            LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
            LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
            ORDER BY p.created_at DESC;
        `;
        // Formateo actual
        const proveedoresFormateados = result.rows.map(row => ({
            id_proveedor: row.id_proveedor,
            rfc: row.rfc,
            correo: row.correo,
            estatus: row.estatus,
            telefono: row.telefono_uno,
            tipo_proveedor: row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido')
        }));
        console.log(`SERVICE: Found ${proveedoresFormateados.length} providers for admin list.`);
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
    console.log(`SERVICE: getProveedorById called for ID ${id}`);
    try {
      if (isNaN(id)) { throw new Error("ID de proveedor inválido."); }
  
      // Añadir p.actividad_sat y p.proveedor_eventos a la selección
      const result = await sql`
        SELECT
          p.*, -- Selecciona todos los campos de proveedores (incluirá los nuevos si existen en la tabla)
          p.actividad_sat,      -- Seleccionar explícitamente para claridad/seguridad
          p.proveedor_eventos,  -- Seleccionar explícitamente para claridad/seguridad
          m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
          f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
        FROM proveedores p
        LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
        LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
        WHERE p.id_proveedor = ${id};
      `;
  
      if (result.rows.length === 0) {
        console.log(`DEBUG Service: Provider not found for ID: ${id}`);
        return null; // Devolver null si no se encuentra
      }
  
      const row = result.rows[0];
      // Determinar tipo (la lógica actual está bien)
      const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
      console.log(`SERVICE: Provider found for ID ${id}, Type: ${tipo}`);
  
      // Devuelve el objeto completo, que ahora incluye actividad_sat y proveedor_eventos
      return { ...row, tipo_proveedor: tipo } as ProveedorCompletoData;
  
    } catch (error) {
      console.error("Error fetching proveedor by ID:", error);
      throw new Error('Error al obtener datos completos del proveedor por ID.');
    }
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
export const updateProveedorProfileForAdmin = async (proveedorData: UpdateProveedorAdminData): Promise<ProveedorCompletoData | null> => {
    const idProveedor = proveedorData.id_proveedor;
    const tipoProveedor = proveedorData.tipoProveedor; // Se espera que venga del formulario admin

    console.log(`SERVICE: updateProveedorProfileForAdmin called for ID ${idProveedor}, Type: ${tipoProveedor}`);
    console.log("SERVICE: Data received for update:", proveedorData); // Log para ver qué llega

    // Validaciones básicas
    if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
        throw new Error("ID de proveedor inválido o faltante.");
    }
    if (!tipoProveedor || (tipoProveedor !== 'moral' && tipoProveedor !== 'fisica')) {
        throw new Error("Tipo de proveedor ('moral' o 'fisica') es requerido para la actualización.");
    }

    let client: VercelPoolClient | null = null; // Para transacción si prefieres
    try {
        // --- Conexión y Transacción (Opcional pero recomendado para múltiples updates) ---
        // client = await sql.connect(); // Descomentar si usas transacciones explícitas
        // await client.sql`BEGIN`;      // Descomentar si usas transacciones explícitas

        // 1. Actualizar tabla principal 'proveedores'
        //    Se actualizarán todos los campos proporcionados en proveedorData.
        console.log(`SERVICE: Updating common fields in 'proveedores' for ID ${idProveedor}`);
        const updateProveedoresResult = await sql`
            UPDATE proveedores SET
              rfc = ${proveedorData.rfc ?? null}, -- Usar COALESCE o manejar nulls aquí si es necesario
              giro_comercial = ${proveedorData.giro_comercial ?? null},
              correo = ${proveedorData.correo ?? null},
              calle = ${proveedorData.calle ?? null},
              numero = ${proveedorData.numero ?? null},
              colonia = ${proveedorData.colonia ?? null},
              codigo_postal = ${proveedorData.codigo_postal ?? null},
              municipio = ${proveedorData.municipio ?? null},
              estado = ${proveedorData.estado ?? null},
              telefono_uno = ${proveedorData.telefono_uno ?? null},
              telefono_dos = ${proveedorData.telefono_dos ?? null},
              pagina_web = ${proveedorData.pagina_web ?? null},
              camara_comercial = ${proveedorData.camara_comercial ?? null},
              numero_registro_camara = ${proveedorData.numero_registro_camara ?? null},
              numero_registro_imss = ${proveedorData.numero_registro_imss ?? null},
              -- **NUEVOS CAMPOS**
              actividad_sat = ${proveedorData.actividadSat ?? null}, -- Mapeo camelCase -> snake_case
              proveedor_eventos = ${proveedorData.proveedorEventos ?? false}, -- Mapeo camelCase -> snake_case (default false)
              -- **FIN NUEVOS CAMPOS**
              updated_at = NOW()
            WHERE id_proveedor = ${idProveedor}
            RETURNING id_proveedor; -- Confirmar que la fila existe
        `;
        // Verificar si se afectó alguna fila (el proveedor existe)
        if (updateProveedoresResult.rowCount === 0) {
            // await client?.sql`ROLLBACK`; // Descomentar si usas transacciones
            throw new Error(`Proveedor con ID ${idProveedor} no encontrado en tabla principal.`);
        }
         console.log(`SERVICE: 'proveedores' table updated for ID ${idProveedor}`);


        // 2. Actualizar tabla de detalle (física o moral)
        //    Solo se actualiza si el tipo coincide y hay datos específicos para ese tipo.
        if (tipoProveedor === 'fisica') {
            // Solo actualizar si vienen datos específicos de física
            if (proveedorData.nombre !== undefined || proveedorData.apellido_p !== undefined || proveedorData.apellido_m !== undefined || proveedorData.curp !== undefined) {
                console.log(`SERVICE: Updating details in 'personas_fisicas' for ID ${idProveedor}`);
                await sql`
                    UPDATE personas_fisicas SET
                        nombre = ${proveedorData.nombre ?? null},
                        apellido_p = ${proveedorData.apellido_p ?? null},
                        apellido_m = ${proveedorData.apellido_m ?? null},
                        curp = ${proveedorData.curp ?? null}
                    WHERE id_proveedor = ${idProveedor};
                `;
                 console.log(`SERVICE: 'personas_fisicas' updated for ID ${idProveedor}`);
            } else {
                 console.log(`SERVICE: No specific fisica fields provided for update ID ${idProveedor}, skipping detail update.`);
            }
        } else if (tipoProveedor === 'moral') {
            // Solo actualizar si vienen datos específicos de moral
             if (proveedorData.razon_social !== undefined || proveedorData.nombre_representante !== undefined || proveedorData.apellido_p_representante !== undefined || proveedorData.apellido_m_representante !== undefined) {
                console.log(`SERVICE: Updating details in 'proveedores_morales' for ID ${idProveedor}`);
                await sql`
                    UPDATE proveedores_morales SET
                        razon_social = ${proveedorData.razon_social ?? null},
                        nombre_representante = ${proveedorData.nombre_representante ?? null},
                        apellido_p_representante = ${proveedorData.apellido_p_representante ?? null},
                        apellido_m_representante = ${proveedorData.apellido_m_representante ?? null}
                    WHERE id_proveedor = ${idProveedor};
                `;
                console.log(`SERVICE: 'proveedores_morales' updated for ID ${idProveedor}`);
            } else {
                 console.log(`SERVICE: No specific moral fields provided for update ID ${idProveedor}, skipping detail update.`);
            }
        }
        // No es necesario un else aquí, ya que la validación inicial cubre tipos inválidos

        // await client?.sql`COMMIT`; // Descomentar si usas transacciones

        // 3. Re-obtener perfil actualizado para devolverlo
        console.log(`SERVICE: Re-fetching updated profile for ID ${idProveedor}`);
        // Usar la función get que ya está actualizada
        const proveedorActualizado = await getProveedorById(idProveedor);
        console.log(`SERVICE: Profile update process completed successfully for ID ${idProveedor}`);
        return proveedorActualizado;

    } catch (error: any) {
        // await client?.sql`ROLLBACK`; // Descomentar si usas transacciones
        console.error(`SERVICE ERROR in updateProveedorProfileForAdmin for ID ${idProveedor}:`, error);
        // Relanzar el error para que la capa superior (route) lo maneje
        throw new Error(`Error al actualizar perfil (Admin): ${error.message || 'Error desconocido'}`);
    } finally {
         // if (client) { await client.release(); } // Descomentar si usas transacciones
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