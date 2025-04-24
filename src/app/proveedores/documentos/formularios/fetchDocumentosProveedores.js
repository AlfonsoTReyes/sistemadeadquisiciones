// URLs de API
const API_URL_DOCUMENTOS = "/api/proveedoresDocumentos";
const API_URL_PROVEEDORES = "/api/proveedores";

// ... (getProveedor y getProveedorForUser como antes) ...
/**
 * Obtiene los detalles COMPLETOS de un proveedor por su ID principal.
 * @param {number} id_proveedor - El ID del proveedor.
 * @returns {Promise<object>} Los datos del proveedor.
 */
export const getProveedor = async (id_proveedor) => {
  const providerIdNum = parseInt(id_proveedor, 10);
  if (isNaN(providerIdNum)) { throw new Error("ID de proveedor inválido proporcionado a getProveedor."); }
  console.log(`DEBUG Fetch: getProveedor by ID: ${providerIdNum}`);
  try {
    const response = await fetch(`${API_URL_PROVEEDORES}?id_proveedor=${providerIdNum}`);
    const data = await response.json().catch(() => null);
    if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudo obtener el proveedor.`); }
    if (!data) { throw new Error("Respuesta inválida del servidor al obtener proveedor."); }
    console.log(`DEBUG Fetch: getProveedor successful for ID: ${providerIdNum}`);
    return data;
  } catch (err) { console.error(`Error en fetch getProveedor ID ${providerIdNum}:`, err); throw err; }
};

/**
 * Obtiene el perfil COMPLETO del proveedor asociado a un ID de usuario proveedor.
 * @param {number | string} userId - El ID del usuario proveedor.
 * @returns {Promise<object | null>} Los datos del perfil o null si no se encuentra.
 */
export const getProveedorForUser = async (userId) => {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) { throw new Error("ID de usuario proveedor inválido para getProveedorForUser."); }
    console.log(`DEBUG Fetch: getProveedorForUser by User ID: ${userIdNum}`);
    try {
        const response = await fetch(`${API_URL_PROVEEDORES}?id_usuario_proveedor=${userIdNum}`);
        if (response.status === 404) { console.log(`DEBUG Fetch: getProveedorForUser profile not found (404) for user ID ${userIdNum}`); return null; }
        const data = await response.json().catch(() => null);
        if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudo obtener el perfil del proveedor.`); }
        if (!data) { throw new Error("Respuesta inválida del servidor al obtener perfil por usuario."); }
        console.log(`DEBUG Fetch: getProveedorForUser successful for user ID ${userIdNum}`);
        return data;
    } catch (err) { console.error(`Error en fetch getProveedorForUser ID ${userIdNum}:`, err); throw err; }
};

/**
 * Obtiene la lista de documentos asociados a un ID de proveedor.
 * @param {number} id_proveedor - El ID del proveedor.
 * @returns {Promise<Array>} Lista de documentos.
 */
export const fetchDocumentosPorProveedor = async (id_proveedor) => {
  const providerIdNum = parseInt(id_proveedor, 10);
  if (isNaN(providerIdNum)) { throw new Error("ID de proveedor inválido para fetchDocumentosPorProveedor."); }
  console.log(`DEBUG Fetch: fetchDocumentosPorProveedor ID: ${providerIdNum}`);
  try {
    const response = await fetch(`${API_URL_DOCUMENTOS}?id_proveedor=${providerIdNum}`);
    const data = await response.json().catch(() => null);
    if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudieron obtener los documentos.`); }
    if (!data) { throw new Error("Respuesta inválida del servidor al obtener documentos."); }
    console.log(`DEBUG Fetch: fetchDocumentosPorProveedor successful for ID ${providerIdNum}`);
    return data;
  } catch (err) { console.error(`Error en fetch fetchDocumentosPorProveedor ID ${providerIdNum}:`, err); throw err; }
};

/**
 * Sube un archivo de documento para un proveedor.
 * @param {FormData} formData - Objeto FormData con 'archivo', 'tipo_documento', 'id_proveedor', 'userId'.
 * @returns {Promise<object>} Respuesta de la API tras subir.
 */
export const uploadDocumentoProveedor = async (formData) => {
  if (!(formData instanceof FormData)) throw new Error("Se espera un objeto FormData para subir documento.");

  const archivo = formData.get('archivo'); // Obtener el archivo

  // *** CORRECCIÓN AQUÍ ***
  // Validar que 'archivo' sea una instancia de File y tenga tamaño > 0
  if (!(archivo instanceof File) || archivo.size === 0) {
      throw new Error("Archivo inválido o faltante.");
  }
  // *** FIN CORRECCIÓN ***

  if (!formData.get('tipo_documento') || !formData.get('id_proveedor') || !formData.get('userId')) {
     throw new Error("Faltan datos (tipo, id_proveedor, userId) para subir el documento.");
  }

  console.log(`DEBUG Fetch: uploadDocumentoProveedor for ID: ${formData.get('id_proveedor')}, Type: ${formData.get('tipo_documento')}`);
  try {
    const response = await fetch(API_URL_DOCUMENTOS, {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudo subir el documento.`); }
    if (!data) { throw new Error("Respuesta inválida del servidor tras subir documento."); }
    console.log(`DEBUG Fetch: uploadDocumentoProveedor successful`);
    return data;
  } catch (err) { console.error("Error en uploadDocumentoProveedor:", err); throw err; }
};

/**
 * Elimina un documento específico por su ID.
 * @param {number} id_documento_proveedor - El ID del documento a eliminar.
 * @returns {Promise<object>} Respuesta de la API tras eliminar.
 */
export const deleteDocumentoProveedor = async (id_documento_proveedor) => {
  const docIdNum = parseInt(id_documento_proveedor, 10);
  if (isNaN(docIdNum)) { throw new Error("ID de documento inválido para eliminar."); }
  console.log(`DEBUG Fetch: deleteDocumentoProveedor ID: ${docIdNum}`);
  try {
    const response = await fetch(`${API_URL_DOCUMENTOS}?id_documento_proveedor=${docIdNum}`, {
      method: "DELETE",
    });
    let data = null;
    if (response.status !== 204) { data = await response.json().catch(() => null); }
    if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudo eliminar el documento.`); }
    console.log(`DEBUG Fetch: deleteDocumentoProveedor successful for ID: ${docIdNum}`);
    return data ?? { message: "Documento eliminado exitosamente." };
  } catch (error) { console.error(`Error en deleteDocumentoProveedor ID ${docIdNum}:`, error); throw error; }
};

/**
 * Obtiene la lista de comentarios asociados a un ID de documento específico (Vista Proveedor).
 * Llama a GET /api/proveedoresDocumentos?documentoIdParaComentarios=[idDoc]
 * @param {number | string} idDocumento - El ID del documento cuyos comentarios se buscan.
 * @returns {Promise<Array<object>>} - Una promesa que resuelve a un array de comentarios (puede ser vacío).
 * @throws {Error} - Si el ID es inválido o la petición falla.
 */
export const fetchComentariosPorDocumentoParaProveedor = async (idDocumento) => {
  const docIdNum = parseInt(idDocumento, 10);
  if (isNaN(docIdNum)) {
      throw new Error("Fetch Error: ID de documento inválido para obtener comentarios.");
  }
  console.log(`FETCH (Proveedor): fetchComentariosPorDocumentoParaProveedor Doc ID: ${docIdNum}`);

  // Usa la URL base de documentos y añade el query param específico
  const apiUrl = `${API_URL_DOCUMENTOS}?documentoIdParaComentarios=${docIdNum}`;

  try {
      const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store', // Evitar caché para comentarios
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
          // Manejar 404 si la API lo usa para "doc no encontrado o sin autorización"
          if (response.status === 404) {
              console.warn(`FETCH (Proveedor): Comentarios no encontrados o no autorizados (404) para Doc ID ${docIdNum}`);
              return []; // Devolver array vacío en lugar de lanzar error
          }
          console.error(`FETCH Error GET ${apiUrl}: Status ${response.status}. Response:`, data);
          throw new Error(data?.message || `Error ${response.status}: No se pudieron obtener los comentarios.`);
      }
      // Si la respuesta es OK pero el parseo falla o devuelve null
      if (!data) {
           console.warn(`FETCH (Proveedor): Respuesta vacía o inválida del servidor para comentarios Doc ID ${docIdNum}`);
           return []; // Devolver array vacío
      }

      console.log(`FETCH (Proveedor): fetchComentariosPorDocumentoParaProveedor successful for Doc ID ${docIdNum}`);
      return data; // Devuelve el array de comentarios

  } catch (err) {
      const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
      console.error(`FETCH Exception fetchComentariosPorDocumentoParaProveedor Doc ID ${docIdNum}:`, errorToThrow);
      throw errorToThrow; // Re-lanzar para que el componente lo maneje
  }
};