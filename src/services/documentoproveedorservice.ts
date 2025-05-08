import { sql } from "@vercel/postgres";

// Interfaz para un comentario leído de la BD (incluye info del admin)
interface ComentarioDocProveedor {
  id_comentario: number;
  id_documento_proveedor: number;
  id_usuario: number; // ID del usuario que comentó (admin)
  comentario: string;
  created_at: Date; // O string, dependiendo de cómo lo devuelva la librería
  updated_at: Date; // O string
  // Opcional: Datos del admin que comentó (obtenidos con JOIN)
  nombre_admin?: string | null;
  apellidos_admin?: string | null;
  email_admin?: string | null;
}
// Interfaz para un documento leído de la BD (para el proveedor)
interface DocumentoProveedor {
  id_documento_proveedor: number;
  id_proveedor: number;
  tipo_documento: string;
  nombre_original: string;
  ruta_archivo: string;
  id_usuario: number; // ID del usuario proveedor que subió
  estatus: string | null; // El proveedor VE el estado, pero no lo cambia aquí
  created_at: Date | string;
  updated_at: Date | string;
}

// Interfaz para crear un nuevo comentario
interface CreateComentarioData {
  id_documento_proveedor: number;
  id_usuario_admin: number; // ID del admin que está comentando
  comentario: string;
}

export const guardarDocumentoUsuarioAdicional = async ({
  id_proveedor,
  tipo_documento,
  nombre_original,
  ruta_archivo,
  id_usuario,
  estatus
}: {
  id_proveedor: number;
  tipo_documento: string;
  nombre_original: string;
  ruta_archivo: string;
  id_usuario: number;
  estatus: string;
}) => {
  try {
    const result = await sql`
      INSERT INTO documentos_proveedor (
        id_proveedor,
        tipo_documento,
        nombre_original,
        ruta_archivo,
        id_usuario,
        estatus,
        created_at,
        updated_at
      ) VALUES (
        ${id_proveedor},
        ${tipo_documento},
        ${nombre_original},
        ${ruta_archivo},
        ${id_usuario},
        ${estatus},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al guardar documento adicional:", error);
    throw error;
  }
};
export const guardarDocumentoProveedor = async ({ // Nombre más específico
  id_proveedor,
  tipo_documento,
  nombre_original,
  ruta_archivo,
  id_usuario_proveedor, // Usar ID del proveedor logueado
  estatusInicial = 'PENDIENTE_REVISION' // Default estatus al subir
}: {
  id_proveedor: number;
  tipo_documento: string;
  nombre_original: string;
  ruta_archivo: string;
  id_usuario_proveedor: number; // ID del usuario PROVEEDOR
  estatusInicial?: string;
}) => {
  console.log(`SERVICE (Proveedor): Guardando documento para prov ID ${id_proveedor} por user ID ${id_usuario_proveedor}`);
  // Validaciones básicas
  if (isNaN(id_proveedor) || isNaN(id_usuario_proveedor)) throw new Error("IDs inválidos.");
  if (!tipo_documento || !nombre_original || !ruta_archivo) throw new Error("Datos del documento incompletos.");

  try {
    const result = await sql`
      INSERT INTO documentos_proveedor (
        id_proveedor, tipo_documento, nombre_original, ruta_archivo,
        id_usuario, -- Columna se llama id_usuario
        estatus,    -- Estado inicial
        created_at, updated_at
      ) VALUES (
        ${id_proveedor}, ${tipo_documento}, ${nombre_original}, ${ruta_archivo},
        ${id_usuario_proveedor}, -- ID del usuario PROVEEDOR
        ${estatusInicial},       -- Estado al subir
        NOW(), NOW()
      )
      RETURNING *; -- Devolver todo el registro creado
    `;
    console.log(`SERVICE (Proveedor): Documento guardado ID: ${result.rows[0]?.id_documento_proveedor}`);
    return result.rows[0];
  } catch (error: any) {
    console.error("SERVICE (Proveedor) Error guardando documento:", error);
     // Manejar errores específicos de BD si es necesario
     if (error.code === '23503') { // Foreign key violation
        if (error.constraint?.includes('id_proveedor')) throw new Error("Error: El proveedor especificado no existe.");
        if (error.constraint?.includes('id_usuario')) throw new Error("Error: El usuario proveedor especificado no existe.");
     }
    throw new Error(`Error al guardar el documento: ${error.message || 'Desconocido'}`);
  }
};

export const obtenerDocumentosPorProveedor = async (id_proveedor: number): Promise<DocumentoProveedor[]> => {
  console.log(`SERVICE (Proveedor): Obteniendo documentos para prov ID ${id_proveedor}`);
  if (isNaN(id_proveedor)) throw new Error("ID de proveedor inválido.");
  try {
      // Seleccionar solo las columnas necesarias para la vista del proveedor
      const result = await sql`
          SELECT
              id_documento_proveedor, id_proveedor, tipo_documento,
              nombre_original, ruta_archivo, estatus, created_at, updated_at
              -- No necesitamos id_usuario aquí normalmente
          FROM documentos_proveedor
          WHERE id_proveedor = ${id_proveedor}
          ORDER BY created_at DESC; -- O por tipo_documento
      `;
      console.log(`SERVICE (Proveedor): Encontrados ${result.rowCount} documentos.`);
      return result.rows as DocumentoProveedor[];
  } catch (error: any) {
      console.error(`SERVICE (Proveedor) Error obteniendo documentos prov ID ${id_proveedor}:`, error);
      throw new Error(`Error al obtener documentos: ${error.message || 'Desconocido'}`);
  }
};

/**
 * Elimina UN documento específico por su ID (llamado por el proveedor).
 * Opcional: Añadir verificación de que el documento pertenece al proveedor logueado.
 */
export const eliminarDocumentoProveedor = async (id_documento_proveedor: number, id_proveedor_verificar?: number): Promise<{ success: boolean }> => {
  console.log(`SERVICE (Proveedor): Eliminando doc ID ${id_documento_proveedor}`);
  if (isNaN(id_documento_proveedor)) throw new Error("ID de documento inválido.");

  // Verificación Opcional de Pertenencia
  if (id_proveedor_verificar !== undefined) {
      if (isNaN(id_proveedor_verificar)) throw new Error("ID de proveedor para verificación inválido.");
      const doc = await obtenerDocumentoProveedorPorId(id_documento_proveedor);
      if (!doc) throw new Error("Documento no encontrado.");
      if (doc.id_proveedor !== id_proveedor_verificar) {
           console.warn(`SERVICE (Proveedor): Intento de borrar documento ${id_documento_proveedor} que no pertenece a proveedor ${id_proveedor_verificar}.`);
           throw new Error("No tiene permiso para eliminar este documento.");
      }
  }

  try {
      // Eliminar registro de la BD
      const result = await sql`
          DELETE FROM documentos_proveedor
          WHERE id_documento_proveedor = ${id_documento_proveedor};
      `;
      if (result.rowCount === 0) {
           console.warn(`SERVICE (Proveedor): Documento ID ${id_documento_proveedor} no encontrado para eliminar (ya borrado?).`);
           // No lanzar error necesariamente, la meta era borrarlo.
      }

      console.log(`SERVICE (Proveedor): Documento ID ${id_documento_proveedor} eliminado de BD.`);
      // Nota: La eliminación del archivo físico se maneja en la API Route.
      return { success: true };

  } catch (error: any) {
      console.error(`SERVICE (Proveedor) Error eliminando doc ID ${id_documento_proveedor}:`, error);
       // Manejar error si hay comentarios asociados y la FK tiene ON DELETE RESTRICT
       if (error.code === '23503') { // Foreign key violation
          if (error.constraint === 'fk_comentario_docprov_documento') {
              throw new Error("No se puede eliminar el documento porque tiene comentarios asociados.");
          }
       }
      throw new Error(`Error al eliminar documento: ${error.message || 'Desconocido'}`);
  }
};
/**
 * Obtiene todos los comentarios para un documento específico, incluyendo
 * información básica del administrador que comentó (para mostrar al proveedor).
 * @param id_documento_proveedor El ID del documento cuyos comentarios se quieren obtener.
 * @returns Promise<ComentarioDocProveedor[]> Array de comentarios.
 */
export const obtenerComentariosPorDocumentoParaProveedor = async ( // Nombre específico
  id_documento_proveedor: number
): Promise<ComentarioDocProveedor[]> => {
  console.log(`SERVICE (Proveedor): Obteniendo comentarios para doc ID: ${id_documento_proveedor}`);
  if (isNaN(id_documento_proveedor)) {
      throw new Error("ID de documento inválido.");
  }

  try {
      // JOIN con usuarios para nombre/apellidos del admin
      const result = await sql`
          SELECT
              c.id_comentario, c.id_documento_proveedor, c.id_usuario, c.comentario,
              c.created_at, c.updated_at,
              u.nombre AS nombre_admin, u.apellidos AS apellidos_admin
          FROM comentarios_doc_proveedor c
          JOIN usuarios u ON c.id_usuario = u.id_usuario -- Asume que id_usuario en comentarios es el admin
          WHERE c.id_documento_proveedor = ${id_documento_proveedor}
          ORDER BY c.created_at ASC;
      `;
      console.log(`SERVICE (Proveedor): Encontrados ${result.rowCount} comentarios.`);
      return result.rows as ComentarioDocProveedor[];

  } catch (error: any) {
      console.error(`SERVICE (Proveedor) Error obteniendo comentarios doc ID ${id_documento_proveedor}:`, error);
      throw new Error(`Error al obtener comentarios: ${error.message || 'Error desconocido'}`);
  }
};
export const obtenerDocumentoProveedorPorId = async (id_documento_proveedor: number) => {
  try {
    const result = await sql`
      SELECT * FROM documentos_proveedor
      WHERE id_documento_proveedor = ${id_documento_proveedor};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al obtener documentos por proveedor:", error);
    throw error;
  }
};


export const eliminarDocumentoAdicionalPorId = async (id_documento_proveedor: number) => {
  try {
    const result = await sql`
      DELETE FROM documentos_proveedor
      WHERE id_documento_proveedor = ${id_documento_proveedor};
    `;
    return { success: true };
  } catch (error) {
    console.error("error al obtener documentos por proveedor:", error);
    throw error;
  }
};
/**
 * Obtiene todos los comentarios para un documento específico, incluyendo
 * información básica del administrador que comentó.
 * @param id_documento_proveedor El ID del documento cuyos comentarios se quieren obtener.
 * @returns Promise<ComentarioDocProveedor[]> Array de comentarios.
 */
export const obtenerComentariosPorDocumento = async (
  id_documento_proveedor: number
): Promise<ComentarioDocProveedor[]> => {
  console.log(`SERVICE (Admin): Obteniendo comentarios para documento ID: ${id_documento_proveedor}`);
  if (isNaN(id_documento_proveedor)) {
      throw new Error("ID de documento inválido.");
  }

  try {
      // Hacer JOIN con la tabla 'usuarios' para obtener el nombre/apellidos del admin
      // Ajusta los campos seleccionados de 'usuarios' según necesites (u.* podría ser mucho)
      const result = await sql`
          SELECT
              c.id_comentario,
              c.id_documento_proveedor,
              c.id_usuario, -- ID del admin
              c.comentario,
              c.created_at,
              c.updated_at,
              u.nombre AS nombre_admin, -- Datos del admin
              u.apellidos AS apellidos_admin -- Datos del admin
              -- , u.email AS email_admin -- Opcional
          FROM comentarios_doc_proveedor c
          JOIN usuarios u ON c.id_usuario = u.id_usuario -- JOIN con tabla usuarios
          WHERE c.id_documento_proveedor = ${id_documento_proveedor}
          ORDER BY c.created_at ASC; -- Mostrar comentarios en orden cronológico
      `;

      console.log(`SERVICE (Admin): Encontrados ${result.rowCount} comentarios para doc ID ${id_documento_proveedor}.`);
      return result.rows as ComentarioDocProveedor[]; // Castear al tipo interfaz

  } catch (error: any) {
      console.error(`SERVICE ERROR (Admin) obteniendo comentarios para doc ID ${id_documento_proveedor}:`, error);
      throw new Error(`Error al obtener comentarios: ${error.message || 'Error desconocido'}`);
  }
};

/**
* Guarda un nuevo comentario realizado por un administrador en un documento.
* @param data Objeto con id_documento_proveedor, id_usuario_admin y comentario.
* @returns Promise<ComentarioDocProveedor> El comentario recién creado (sin info del admin).
*/
export const crearComentarioDocumento = async (
  data: CreateComentarioData
): Promise<Omit<ComentarioDocProveedor, 'nombre_admin' | 'apellidos_admin' | 'email_admin'>> => {
  const { id_documento_proveedor, id_usuario_admin, comentario } = data;

  console.log(`SERVICE (Admin): Creando comentario en doc ID ${id_documento_proveedor} por admin ID ${id_usuario_admin}`);

  // Validaciones básicas
  if (isNaN(id_documento_proveedor)) throw new Error("ID de documento inválido.");
  if (isNaN(id_usuario_admin)) throw new Error("ID de usuario admin inválido.");
  if (!comentario || comentario.trim() === '') throw new Error("El comentario no puede estar vacío.");

  try {
      const result = await sql<Omit<ComentarioDocProveedor, 'nombre_admin' | 'apellidos_admin' | 'email_admin'>>`
          INSERT INTO comentarios_doc_proveedor (
              id_documento_proveedor,
              id_usuario,
              comentario,
              created_at,
              updated_at
          ) VALUES (
              ${id_documento_proveedor},
              ${id_usuario_admin},
              ${comentario},
              NOW(),
              NOW()
          )
          RETURNING id_comentario, id_documento_proveedor, id_usuario, comentario, created_at, updated_at;
      `;

      if (result.rowCount === 0) {
          // Esto podría ocurrir si el id_documento_proveedor o id_usuario_admin no existen (por FKs)
           // O si hay otro error de inserción no capturado explícitamente.
           console.error(`SERVICE ERROR (Admin): INSERT en comentarios_doc_proveedor no afectó filas.`);
           throw new Error("No se pudo guardar el comentario. Verifique que el documento y el usuario existan.");
      }

      console.log(`SERVICE (Admin): Comentario creado con ID: ${result.rows[0].id_comentario}`);
      return result.rows[0]; // Devuelve el comentario insertado

  } catch (error: any) {
       console.error(`SERVICE ERROR (Admin) creando comentario en doc ID ${id_documento_proveedor}:`, error);
       // Manejar errores específicos de FK si es necesario
       if (error.code === '23503') { // Foreign key violation
           if (error.constraint === 'fk_comentario_docprov_documento') {
               throw new Error("Error: El documento especificado no existe.");
           } else if (error.constraint === 'fk_comentario_docprov_usuario') {
               throw new Error("Error: El usuario administrador especificado no existe.");
           } else {
              throw new Error(`Error de referencia al guardar comentario: ${error.detail || error.message}`);
           }
       }
       throw new Error(`Error al guardar el comentario: ${error.message || 'Error desconocido'}`);
  }
};

/**
* Elimina un comentario específico por su ID.
* @param id_comentario El ID del comentario a eliminar.
* @returns Promise<{ success: boolean, message?: string }>
*/
export const eliminarComentarioDocumento = async (
  id_comentario: number
): Promise<{ success: boolean; message?: string }> => {
  console.log(`SERVICE (Admin): Eliminando comentario ID: ${id_comentario}`);
  if (isNaN(id_comentario)) {
      throw new Error("ID de comentario inválido.");
  }

  try {
      const result = await sql`
          DELETE FROM comentarios_doc_proveedor
          WHERE id_comentario = ${id_comentario};
      `;

      if (result.rowCount === 0) {
          console.warn(`SERVICE (Admin): Comentario ID ${id_comentario} no encontrado para eliminar.`);
          // Podrías lanzar error o devolver éxito pero indicando que no se encontró
          // throw new Error(`Comentario con ID ${id_comentario} no encontrado.`);
          return { success: false, message: `Comentario con ID ${id_comentario} no encontrado.` };
      }

      console.log(`SERVICE (Admin): Comentario ID ${id_comentario} eliminado exitosamente.`);
      return { success: true };

  } catch (error: any) {
      console.error(`SERVICE ERROR (Admin) eliminando comentario ID ${id_comentario}:`, error);
      throw new Error(`Error al eliminar el comentario: ${error.message || 'Error desconocido'}`);
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
