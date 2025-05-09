// Asume que esta es la ruta base correcta para tu API de proveedores
const API_URL = "/api/proveedores";

/**
 * Actualiza un registro de proveedor existente.
 * @param {object} updateData - Objeto con los datos a actualizar. DEBE incluir 'id_proveedor' y 'tipoProveedor'.
 *                              Si es moral, AHORA debe incluir el array 'representantes'.
 * @returns {Promise<object>} - Los datos completos del proveedor actualizado (con array 'representantes' si es moral).
 * @throws {Error} - Si la petición falla o hay errores de validación.
 */
export const updateProveedor = async (updateData) => {
  // ... (validación de id_proveedor y tipoProveedor)
  if (!updateData?.id_proveedor || typeof updateData.id_proveedor !== 'number') { throw new Error("Se requiere 'id_proveedor'."); }
  if (!updateData?.tipoProveedor || !['moral', 'fisica'].includes(updateData.tipoProveedor)) { throw new Error("Se requiere 'tipoProveedor'."); }
  // Opcional: Validación básica si es moral y no viene el array (aunque la API debería manejarlo)
  // if (updateData.tipoProveedor === 'moral' && !Array.isArray(updateData.representantes)) {
  //    console.warn("updateProveedor Fetch: Falta el array 'representantes' para proveedor moral.");
  //    // Podrías lanzar error o continuar y dejar que la API valide
  // }

  try {
      const response = await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          // Envía el objeto completo, INCLUYENDO el array 'representantes' si existe en updateData
          body: JSON.stringify(updateData),
      });
      // ... (manejo de errores y parseo JSON)
      const data = await response.json().catch(/* ... */);
      if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: Error al actualizar`); }
      return data; // <-- ESTE 'data' YA CONTIENE EL ARRAY 'representantes' SI LA API LO DEVUELVE
  } catch(err) {
      console.error("Error during provider update fetch:", err);
      throw err; // Re-lanza el error formateado
  }
};

/**
 * Obtiene el perfil de proveedor principal asociado a un ID de usuario proveedor.
 * La respuesta AHORA incluirá un array 'representantes' si es moral.
 * @param {number | string} userId - El ID del usuario proveedor.
 * @returns {Promise<object | null>} - Los datos del perfil del proveedor o null si no se encuentra.
 * @throws {Error} - Si la petición falla por otros motivos o el ID es inválido.
 */
export const getProveedorForUser = async (userId) => {
  // ... (validación de userId)
  const userIdNum = parseInt(userId, 10);
  if (!userId || isNaN(userIdNum)) { throw new Error("ID de usuario inválido."); }
  try {
      const response = await fetch(`${API_URL}?id_usuario_proveedor=${userIdNum}`);
      // ... (manejo de 404 y errores / parseo JSON)
      if (response.status === 404) return null;
      const data = await response.json().catch(/* ... */);
      if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudo obtener perfil.`); }
      return data; // <-- ESTE 'data' YA CONTIENE EL ARRAY 'representantes' SI LA API LO DEVUELVE
  } catch (err) {
      console.error(`Error during getProveedorForUser fetch for ID ${userIdNum}:`, err);
      throw err; // Re-lanza
  }
};

/**
 * Solicita la revisión del perfil/documentos de un proveedor.
 * Llama al endpoint PATCH /api/proveedores.
 * @param {number} idProveedor - El ID del proveedor que solicita la revisión.
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API (ej. { id_proveedor, estatus_revision }).
 * @throws {Error} - Si el ID es inválido o la solicitud falla.
 */
export const solicitarRevision = async (idProveedor) => {
    const providerIdNum = parseInt(idProveedor, 10);
    if (isNaN(providerIdNum)) {
        throw new Error("ID de proveedor inválido para solicitar revisión.");
    }
    try {
        const response = await fetch(API_URL, { // Llama al mismo endpoint base pero con PATCH
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_proveedor: providerIdNum }), // Enviar solo el ID en el body
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
             console.error(`FETCH Error PATCH ${API_URL}: Status ${response.status} for ID ${providerIdNum}`, data);
             throw new Error(data?.message || `Error ${response.status}: No se pudo solicitar la revisión.`);
         }
         if (!data) {
             throw new Error("Respuesta inválida del servidor tras solicitar revisión.");
         }
        return data; // Devuelve { id_proveedor, estatus_revision: 'PENDIENTE_REVISION' }

    } catch(err) {
        console.error(`FETCH Error solicitarRevision ID ${providerIdNum}:`, err);
        throw err;
    }
};