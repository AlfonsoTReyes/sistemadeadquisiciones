import { sql } from "@vercel/postgres";
import bcrypt from 'bcryptjs';

export const getAllProveedoresForAdmin = async () => {
    console.log("SERVICE: getAllProveedoresForAdmin called");
    try {
        const result = await sql`
            SELECT
                p.id_proveedor, p.rfc, p.correo, p.estatus, p.telefono_uno,
                m.razon_social, f.nombre AS nombre_fisica
            FROM proveedores p
            LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
            LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
            ORDER BY p.created_at DESC;
        `;
        const proveedoresFormateados = result.rows.map(row => ({
            id_proveedor: row.id_proveedor,
            rfc: row.rfc,
            correo: row.correo,
            estatus: row.estatus,
            telefono: row.telefono_uno,
            tipo_proveedor: row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido')
        }));
        console.log(`SERVICE: Found ${proveedoresFormateados.length} providers for admin view.`);
        return proveedoresFormateados;
    } catch (error) {
        console.error("SERVICE ERROR in getAllProveedoresForAdmin:", error);
        throw new Error("Error al obtener la lista de proveedores desde el servicio.");
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
* Útil si el admin hace clic para ver una ficha completa del proveedor.
*/
export const getProveedorById = async (id: number) => {
  try {
    // Tu consulta JOIN completa está bien para obtener todos los detalles
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
      // Cambiamos a devolver null en lugar de lanzar error aquí,
      // permite al frontend manejar el "no encontrado" más suavemente.
      console.log(`DEBUG Service: Provider not found for ID: ${id}`);
      return null;
    }

    const row = result.rows[0];
    const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');

    return { ...row, tipo_proveedor: tipo };

  } catch (error) {
    console.error("Error fetching proveedor by ID:", error);
    throw new Error('Error al obtener datos del proveedor por ID.');
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
// --- FUNCIÓN NUEVA O MODIFICADA PARA ACTUALIZAR ESTATUS DEL DOCUMENTO ---
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

// CORREGIDO: Usa los nombres de tabla correctos (personas_fisicas, proveedores_morales)
export const getProveedorProfileByIdForAdmin = async (idProveedor: number) => {
    console.log(`SERVICE: getProveedorProfileByIdForAdmin called for ID ${idProveedor}`);
    try {
        // *** CORRECCIÓN AQUÍ ***
        const result = await sql`
            SELECT
                p.*, -- Todos los campos de la tabla proveedores
                f.nombre AS nombre_fisica,       -- Usa alias 'f' y tabla 'personas_fisicas'
                f.apellido_p AS apellido_p_fisica,
                f.apellido_m AS apellido_m_fisica,
                f.curp,
                m.razon_social,                 -- Usa alias 'm' y tabla 'proveedores_morales'
                m.nombre_representante,
                m.apellido_p_representante,
                m.apellido_m_representante
            FROM proveedores p
            LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor   -- Tabla correcta
            LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor -- Tabla correcta
            WHERE p.id_proveedor = ${idProveedor};
        `;
        // *** FIN CORRECCIÓN ***

        if (result.rowCount === 0) {
            console.warn(`SERVICE: Provider profile not found for ID ${idProveedor}`);
            throw new Error(`Perfil de proveedor con ID ${idProveedor} no encontrado.`);
        }

        console.log(`SERVICE: Found provider profile for ID ${idProveedor}`);
        // Determinar tipo basado en los campos recuperados (puede ser redundante si ya existe en 'p', pero seguro)
        const row = result.rows[0];
         const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : (row.tipo_proveedor || 'desconocido'));
        return { ...row, tipo_proveedor: tipo }; // Devolver incluyendo el tipo determinado

    } catch (error: any) {
        console.error(`SERVICE ERROR in getProveedorProfileByIdForAdmin for ID ${idProveedor}:`, error);
        throw error; // Re-lanza para que la API route lo capture
    }
};
// CORREGIDO: Usa los nombres de tabla correctos (personas_fisicas, proveedores_morales)
export const updateProveedorProfileForAdmin = async (proveedorData: any) => {
    const idProveedor = proveedorData.id_proveedor;
    const tipoProveedor = proveedorData.tipoProveedor;
    console.log(`SERVICE: updateProveedorProfileForAdmin called for ID ${idProveedor}, Type: ${tipoProveedor}`);

    if (!idProveedor || !tipoProveedor) {
        throw new Error("ID de proveedor y tipo son requeridos para actualizar perfil.");
    }

    try {
        // 1. Actualizar tabla principal 'proveedores' (sin cambios aquí)
        console.log(`SERVICE: Updating common fields in 'proveedores' for ID ${idProveedor}`);
        const updateProveedoresResult = await sql`
            UPDATE proveedores SET 
              rfc = ${proveedorData.rfc},
              giro_comercial = ${proveedorData.giro_comercial},
              correo = ${proveedorData.correo},
              calle = ${proveedorData.calle},
              numero = ${proveedorData.numero},
              colonia = ${proveedorData.colonia},
              codigo_postal = ${proveedorData.codigo_postal},
              municipio = ${proveedorData.municipio},
              estado = ${proveedorData.estado},
              telefono_uno = ${proveedorData.telefono_uno},
              telefono_dos = ${proveedorData.telefono_dos ?? null},
              pagina_web = ${proveedorData.pagina_web ?? null},
              camara_comercial = ${proveedorData.camara_comercial ?? null},
              numero_registro_camara = ${proveedorData.numero_registro_camara ?? null},
              numero_registro_imss = ${proveedorData.numero_registro_imss ?? null},
              --updated_at = CURRENT_TIMESTAMP
            updated_at = NOW()
            WHERE id_proveedor = ${idProveedor} RETURNING id_proveedor;
        `;
        if (updateProveedoresResult.rowCount === 0) { throw new Error(/* ... */); }

        // 2. Actualizar tabla de detalle (física o moral)
        // *** CORRECCIÓN AQUÍ ***
        if (tipoProveedor === 'fisica') {
            console.log(`SERVICE: Updating details in 'personas_fisicas' for ID ${idProveedor}`);
            await sql`
                UPDATE personas_fisicas -- Tabla correcta
                SET
                    nombre = ${proveedorData.nombre},
                    apellido_p = ${proveedorData.apellido_p},
                    apellido_m = ${proveedorData.apellido_m},
                    curp = ${proveedorData.curp}
                WHERE id_proveedor = ${idProveedor};
            `;
        } else if (tipoProveedor === 'moral') {
            console.log(`SERVICE: Updating details in 'proveedores_morales' for ID ${idProveedor}`);
            await sql`
                UPDATE proveedores_morales -- Tabla correcta
                SET
                    razon_social = ${proveedorData.razon_social},
                    nombre_representante = ${proveedorData.nombre_representante},
                    apellido_p_representante = ${proveedorData.apellido_p_representante},
                    apellido_m_representante = ${proveedorData.apellido_m_representante}
                WHERE id_proveedor = ${idProveedor};
            `;
        } else {
            console.warn(`SERVICE: Tipo de proveedor desconocido ('${tipoProveedor}') para actualizar detalle. ID: ${idProveedor}`);
        }
        // *** FIN CORRECCIÓN ***

        // 3. Re-obtener perfil actualizado
        console.log(`SERVICE: Re-fetching updated profile for ID ${idProveedor}`);
        const proveedorActualizado = await getProveedorProfileByIdForAdmin(idProveedor);
        console.log(`SERVICE: Profile update process completed for ID ${idProveedor}`);
        return proveedorActualizado;

    } catch (error: any) {
        console.error(`SERVICE ERROR in updateProveedorProfileForAdmin for ID ${idProveedor}:`, error);
        throw error;
    }
};


// --- NUEVAS FUNCIONES PARA USUARIOS_PROVEEDORES (ADMIN) ---

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

export const updateUsuarioProveedor = async (usuarioData: any) => {
    const idUsuario = usuarioData.id_usuario;
    console.log(`SERVICE: updateUsuarioProveedor called for user ID ${idUsuario}`);

    if (typeof idUsuario !== 'number' || isNaN(idUsuario)) {
        throw new Error("ID de usuario es requerido para actualizar usuario proveedor.");
    }

    try {
        const hashedPassword = usuarioData.contraseña ? await bcrypt.hash(usuarioData.contraseña, 10) : undefined;

        const result = await sql`
            UPDATE usuarios_proveedores
            SET
                usuario = ${usuarioData.usuario},
                nombre = ${usuarioData.nombre},
                apellido_p = ${usuarioData.apellidoPaterno || usuarioData.apellido_p},
                apellido_m = ${usuarioData.apellidoMaterno || usuarioData.apellido_m},
                correo = ${usuarioData.correo},
                ${hashedPassword ? sql`contraseña = ${hashedPassword},` : sql``}
                estatus = ${usuarioData.estatus ?? 'activo'},
                updated_at = NOW()
            WHERE id_usuario = ${idUsuario}
            RETURNING *;
        `;

        if (result.rowCount === 0) {
            console.warn(`SERVICE: User not found for update. ID: ${idUsuario}`);
            throw new Error(`Usuario proveedor con ID ${idUsuario} no encontrado para actualizar.`);
        }

        console.log(`SERVICE: User updated successfully for ID ${idUsuario}`);
        return result.rows[0];
    } catch (error: any) {
        console.error(`SERVICE ERROR in updateUsuarioProveedor for user ID ${idUsuario}:`, error);
        if (error.message.includes('constraint')) {
            throw new Error(`Error de base de datos al actualizar usuario (posiblemente correo o usuario duplicado).`);
        }
        throw error;
    }
};
