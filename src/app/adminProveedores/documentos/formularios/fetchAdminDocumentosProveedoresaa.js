// --- URLs de API ---
// URL base para la mayoría de las operaciones de admin sobre proveedores y usuarios
const ADMIN_PROVEEDORES_API_URL = '/api/adminProveedores';
// URL específica para documentos y comentarios (si la separaste, si no, usa la de arriba)
const DOCS_API_URL = "/api/adminDocumuentosProveedores"; // Comentada si usas la misma ruta base
const DOCS_COMMENTS_API_URL = '/api/adminDocumuentosProveedores'; // Asumiendo que se maneja en la misma ruta con query params
interface DocumentoProveedor {
    id_documento_proveedor: number;
    id_proveedor: number;
    tipo_documento: string;
    nombre_original: string;
    ruta_archivo: string;
    id_usuario: number;
    estatus: string | boolean;
    created_at: string; // O Date
    updated_at: string; // O Date
  }
/**
 * Obtiene los detalles de UN proveedor específico por su ID principal.
 * Usado para mostrar info en la cabecera de la página de documentos de admin.
 * Llama a GET /api/proveedores?id_proveedor=[id]
 * @param {number} idProveedor - El ID del proveedor a obtener.
 * @returns {Promise<object>} - Una promesa que resuelve al objeto del proveedor.
 */
export const fetchProveedorDetallesPorIdAdmin = async (idProveedor) => {
  // Renombrado para evitar conflicto si tienes otra función getProveedor
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
     const errorMsg = 'Fetch Error: idProveedor inválido para fetchProveedorDetallesPorIdAdmin';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }
  console.log(`FETCH (Admin): fetchProveedorDetallesPorIdAdmin ID ${idProveedor}`);
  const apiUrl = `${ADMIN_PROVEEDORES_API_URL}?id_proveedor=${idProveedor}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener detalles del proveedor ${idProveedor}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: fetchProveedorDetallesPorIdAdmin successful for ID ${idProveedor}`);
    return data;

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in fetchProveedorDetallesPorIdAdmin for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};


/**
 * Obtiene la lista de documentos para un proveedor específico.
 * Llama a GET /api/documentosProveedores?id_proveedor=[id]
 * @param {number} idProveedor - El ID del proveedor.
 * @returns {Promise<Array<object>>} - Una promesa que resuelve a un array de documentos.
 */
export const fetchDocumentosPorProveedorAdmin = async (idProveedor: number): Promise<DocumentoProveedor[]> => {
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    const errorMsg = 'Fetch Error: idProveedor inválido para fetchDocumentosPorProveedorAdmin';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log(`FETCH (Admin): fetchDocumentosPorProveedorAdmin ID ${idProveedor}`);
  const apiUrl = `${DOCS_COMMENTS_API_URL}?id_proveedor=${idProveedor}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener documentos del proveedor ${idProveedor}: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log(`DEBUG Fetch: fetchDocumentosPorProveedorAdmin successful for ID ${idProveedor}, received ${rawData.length} docs`);

    // Transformar para asegurar el tipo
    const documentos: DocumentoProveedor[] = rawData.map((item: any) => ({
      id_documento_proveedor: item.id_documento_proveedor,
      id_proveedor: item.id_proveedor,
      tipo_documento: item.tipo_documento,
      nombre_original: item.nombre_original,
      ruta_archivo: item.ruta_archivo,
      created_at: item.created_at,
      updated_at: item.updated_at,
      estatus: item.estatus, // puede ser boolean o string según tu interfaz
      id_usuario: item.id_usuario,
    }));

    return documentos;

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in fetchDocumentosPorProveedorAdmin for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};


/**
 * Actualiza el estatus de un documento específico (llamada desde Admin).
 * Llama a PUT /api/documentosProveedores enviando ID del documento y estatus en el cuerpo.
 * @param {number} idDocumento - El ID del documento a actualizar.
 * @param {string | boolean} nuevoEstatus - El nuevo estado (depende de tu DB).
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
export const updateDocumentoStatusAdmin = async (idDocumento, nuevoEstatus) => {
  console.log(`DEBUG Fetch: Calling updateDocumentoStatusAdmin for Doc ID ${idDocumento} with status ${nuevoEstatus}`);
  const apiUrl = DOCS_API_URL; // Usa la URL base para PUT

  // Validación básica
  if (typeof idDocumento !== 'number' || isNaN(idDocumento)) {
     const errorMsg = 'Fetch Error: idDocumento inválido para updateDocumentoStatusAdmin';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }
  if (nuevoEstatus === undefined || nuevoEstatus === null) {
     const errorMsg = 'Fetch Error: nuevoEstatus inválido para updateDocumentoStatusAdmin';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }


  try {
    const response = await fetch(apiUrl, {
      method: 'PUT', // Método para actualizar según la API route
      headers: {
        'Content-Type': 'application/json',
        // Headers de autenticación si son necesarios
      },
      // Body con el ID del DOCUMENTO y el nuevo ESTATUS
      body: JSON.stringify({
        id_documento_proveedor: idDocumento, // La API espera este ID
        estatus: nuevoEstatus               // La API espera el nuevo estado
      }),
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating Doc ID ${idDocumento}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar estatus del documento: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: updateDocumentoStatusAdmin successful for Doc ID ${idDocumento}`);
    return data; // Devuelve el documento actualizado

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in updateDocumentoStatusAdmin for Doc ID ${idDocumento}:`, errorToThrow);
    throw errorToThrow;
  }
};
/**
 * Obtiene la lista de comentarios para un documento específico.
 * Llama a GET /api/adminProveedores?documentoIdParaComentarios=[idDoc]
 * @param {number} idDocumento - El ID del documento.
 * @returns {Promise<Array<object>>} - Array de objetos comentario.
 */
export const fetchComentariosPorDocumentoAdmin = async (idDocumento) => {
  const docIdNum = parseInt(idDocumento, 10);
  if (isNaN(docIdNum)) {
      throw new Error("Fetch Error: ID de documento inválido para obtener comentarios.");
  }
  console.log(`FETCH (Admin): fetchComentariosPorDocumentoAdmin Doc ID ${docIdNum}`);
  const apiUrl = `${DOCS_COMMENTS_API_URL}?documentoIdParaComentarios=${docIdNum}`;

  try {
      const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store', // Evitar caché para comentarios
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
          console.error(`FETCH Error GET ${apiUrl}: Status ${response.status}. Response:`, data);
          throw new Error(data?.message || `Error ${response.status}: No se pudieron obtener los comentarios.`);
      }
      if (!data) { throw new Error("Respuesta inválida del servidor al obtener comentarios."); }

      console.log(`FETCH (Admin): fetchComentariosPorDocumentoAdmin successful for Doc ID ${docIdNum}`);
      return data; // Devuelve el array de comentarios

  } catch (err) {
      const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
      console.error(`FETCH Exception fetchComentariosPorDocumentoAdmin Doc ID ${docIdNum}:`, errorToThrow);
      throw errorToThrow;
  }
};

/**
* Crea un nuevo comentario en un documento (Admin).
* Llama a POST /api/adminProveedores (enviando datos del comentario en el body)
* @param {number} idDocumento - ID del documento a comentar.
* @param {string} comentarioTexto - El texto del comentario.
* @param {number} idUsuarioAdmin - El ID del admin que comenta (¡Obtenerlo de forma segura!).
* @returns {Promise<object>} - El comentario recién creado.
*/
export const createComentarioAdmin = async (idDocumento, comentarioTexto, idUsuarioAdmin) => {
  const docIdNum = parseInt(idDocumento, 10);
  const adminIdNum = parseInt(idUsuarioAdmin, 10); // <-- AHORA SE VALIDA EL RECIBIDO

  if (isNaN(docIdNum) || isNaN(adminIdNum)) { // Validación ahora incluye adminIdNum
      throw new Error("Fetch Error: ID de documento o ID de admin inválido.");
  }
  if (typeof comentarioTexto !== 'string' || comentarioTexto.trim() === '') {
      throw new Error("Fetch Error: El texto del comentario es requerido.");
  }
  console.log(`FETCH (Admin): createComentarioAdmin for Doc ID ${docIdNum} by Admin ID ${adminIdNum}`);
  const apiUrl = '/api/adminDocumuentosProveedores'; // Endpoint POST (Asegúrate que sea el correcto)

  try {
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // **CAMBIO: Enviar también idUsuarioAdmin**
          body: JSON.stringify({
              id_documento_proveedor: docIdNum,
              comentario: comentarioTexto.trim(),
              id_usuario_admin: adminIdNum // <--- Se envía el ID desde el frontend
          }),
      });
      // ... (Manejo de respuesta y errores como antes) ...
      const data = await response.json().catch(() => null);
      if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudo crear comentario.`); }
      if (!data) { throw new Error("Respuesta inválida del servidor."); }
      console.log(`FETCH (Admin): createComentarioAdmin successful`);
      return data;

  } catch(err) {
       const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
       console.error(`FETCH Exception createComentarioAdmin Doc ID ${docIdNum}:`, errorToThrow);
       throw errorToThrow;
  }
};

/**
* Elimina un comentario específico por su ID (Admin).
* Llama a DELETE /api/adminProveedores?id_comentario=[idComentario]
* @param {number} idComentario - El ID del comentario a eliminar.
* @returns {Promise<object>} - Respuesta de la API (ej. { message: "..." }).
*/
export const deleteComentarioAdmin = async (idComentario) => {
  const commentIdNum = parseInt(idComentario, 10);
  if (isNaN(commentIdNum)) {
      throw new Error("Fetch Error: ID de comentario inválido para eliminar.");
  }
  console.log(`FETCH (Admin): deleteComentarioAdmin ID: ${commentIdNum}`);
  // Construir URL con query param para DELETE
  const apiUrl = `${DOCS_COMMENTS_API_URL}?id_comentario=${commentIdNum}`;

  try {
      const response = await fetch(apiUrl, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }, // Aunque no hay body, es buena práctica
      });

      let data = null;
      if (response.status !== 204) { // Si no es 'No Content', intentar leer body
          data = await response.json().catch(() => null);
      }

      if (!response.ok) {
          console.error(`FETCH Error DELETE ${apiUrl}: Status ${response.status}. Response:`, data);
          throw new Error(data?.message || `Error ${response.status}: No se pudo eliminar el comentario.`);
      }

      console.log(`FETCH (Admin): deleteComentarioAdmin successful for ID: ${commentIdNum}`);
      return data ?? { success: true, message: 'Comentario eliminado.' }; // Devolver respuesta o éxito genérico

  } catch (err) {
      const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
      console.error(`FETCH Exception deleteComentarioAdmin ID ${commentIdNum}:`, errorToThrow);
      throw errorToThrow;
  }
};
