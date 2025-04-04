import { sql } from "@vercel/postgres";

export const getAllProveedoresForAdmin = async () => {
  console.log("DEBUG Service: Fetching all provider profiles for admin view.");
  try {
      // Usamos LEFT JOIN para obtener info de morales y físicas si existen
      // Seleccionamos solo los campos necesarios para la tabla admin + campos para tipo
      const result = await sql`
      SELECT

      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor -- Asegúrate que esta tabla exista y el join sea correcto
      ORDER BY p.created_at DESC; -- Opcional: ordenar por fecha de creación o RFC, etc.
    `;

      // Procesamos cada fila para añadir el tipo
      const proveedoresConTipo = result.rows.map(row => {
          const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
          // Devolvemos un objeto limpio solo con los datos necesarios + tipo
          return {
              id_proveedor: row.id_proveedor,
              rfc: row.rfc,
              correo: row.correo,
              estatus: row.estatus, // Asumiendo que estatus es BOOLEAN en la DB
              tipo_proveedor: tipo,
               // Incluimos estos opcionalmente si la tabla los necesita, si no, se pueden omitir aquí
               razon_social: row.razon_social,
               nombre_fisica: row.nombre_fisica
          };
      });

      console.log(`DEBUG Service: Found ${proveedoresConTipo.length} providers.`);
      return proveedoresConTipo;

  } catch (error) {
      console.error("Error fetching all providers for admin:", error);
      throw new Error('Error al obtener la lista de proveedores.');
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
        estatus = ${estatus}, -- Pasa el booleano directamente
        updated_at = NOW()
      WHERE id_proveedor = ${idProveedor}
      RETURNING id_proveedor, rfc, estatus, updated_at; -- Devuelve campos clave actualizados
    `;

      if (result.rows.length === 0) {
          throw new Error(`Proveedor con ID ${idProveedor} no encontrado para actualizar.`);
      }

      console.log(`DEBUG Service: Status updated successfully for provider ID ${idProveedor}`);
      return result.rows[0]; // Devuelve la fila actualizada

  } catch (error) {
      console.error(`Error updating provider status for ID ${idProveedor}:`, error);
      // Podrías querer diferenciar errores (e.g., no encontrado vs error DB)
      throw new Error('Error al actualizar el estatus del proveedor.');
  }
};


// --- FUNCIONES EXISTENTES (ÚTILES PARA OTRAS VISTAS) ---

/**
* Obtiene los documentos asociados a un proveedor específico.
* (Asegúrate que la consulta devuelva lo necesario para la vista de documentos)
*/
export const getDocumentosByProveedor = async (id_proveedor: number) => {
  console.log(`DEBUG Service: Fetching documents for provider ID: ${id_proveedor}`);
  try {
      if (isNaN(id_proveedor)) {
          throw new Error("ID de proveedor inválido proporcionado.");
      }
      // Modifica esta consulta si necesitas más o menos datos de los documentos
      const result = await sql`
      SELECT
          id_documento_proveedor,
          id_proveedor,
          ruta_archivo,
          estatus, -- Estatus del documento, si aplica
          created_at,
          updates_at,
          nombre_original,
          tipo_documento,
          id_usuario -- Quién subió el documento, si es relevante
      FROM documentos_proveedor
      WHERE id_proveedor = ${id_proveedor};
    `;
      // Nota: RETURNING * no es válido en SELECT puro, se quitó.

      console.log(`DEBUG Service: Found ${result.rows.length} documents for provider ID: ${id_proveedor}`);
      // Devuelve un array de documentos, puede ser vacío si no hay.
      return result.rows;

  } catch (error) {
      console.error(`Error fetching documents for provider ID ${id_proveedor}:`, error);
      throw new Error('Error al obtener los documentos del proveedor.');
  }
};

/**
* Obtiene el perfil detallado de un proveedor basado en su id_usuario_proveedor asociado.
* Útil si necesitas cargar todos los detalles de un proveedor específico en otra vista.
*/
export const getProveedorByUserId = async (id_usuario_proveedor: number) => {
  console.log(`DEBUG Service: Fetching detailed provider profile for user ID: ${id_usuario_proveedor}`);
  try {
      if (isNaN(id_usuario_proveedor)) {
          throw new Error("ID de usuario proveedor inválido proporcionado.");
      }
      // La consulta JOIN existente está bien para obtener detalles completos
      const result = await sql`
      SELECT
          p.id_proveedor, p.rfc, p.giro_comercial, p.correo, p.camara_comercial,
          p.numero_registro_camara, p.numero_registro_imss, p.fecha_inscripcion,
          p.fecha_vigencia, p.estatus, p.created_at, p.updated_at, p.fecha_solicitud,
          p.calle, p.numero, p.colonia, p.codigo_postal, p.municipio, p.estado,
          p.telefono_uno, p.telefono_dos, p.pagina_web, p.id_usuario_proveedor,
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
          console.log(`DEBUG Service: No detailed provider profile found for user ID: ${id_usuario_proveedor}`);
          return null;
      }

      const row = result.rows[0];
      const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
      console.log(`DEBUG Service: Detailed profile found, type determined as: ${tipo}`);

      return { ...row, tipo_proveedor: tipo };

  } catch (error) {
      console.error(`Error fetching detailed provider profile by user ID ${id_usuario_proveedor}:`, error);
      throw new Error('Error al obtener el perfil detallado del proveedor.');
  }
};


/* Comentada o eliminada - La función original parecía incorrecta
export const getProveedor = async (id: number) => {
  try {
    // Esta consulta original obtenía TODOS los proveedores, no por ID
    const result = await sql`
      SELECT
      *
      FROM proveedores;
    `;

    if (result.rows.length === 0) {
      throw new Error('Proveedor no encontrado.'); // Mensaje no preciso con la consulta original
    }

    // Lógica para determinar tipo aquí no sería confiable sin JOINs
    const row = result.rows[0];
    // const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido'); // No funcionaría bien

    // return { ...row, tipo_proveedor: tipo };
    return row; // Devolvería solo la primera fila de *todos* los proveedores

  } catch (error) {
    console.error("Error fetching proveedor by ID:", error);
    throw new Error('Error al obtener datos del proveedor.');
  }
};
*/