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

  console.log(`DEBUG Fetch: updateProveedor ID: ${updateData.id_proveedor} with data:`, updateData); // Log para ver si viene el array
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
      console.log(`DEBUG Fetch: updateProveedor successful for ID: ${updateData.id_proveedor}`);
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
      console.log(`DEBUG Fetch: getProveedorForUser by User ID: ${userIdNum}`);
      const response = await fetch(`${API_URL}?id_usuario_proveedor=${userIdNum}`);
      // ... (manejo de 404 y errores / parseo JSON)
      if (response.status === 404) return null;
      const data = await response.json().catch(/* ... */);
      if (!response.ok) { throw new Error(data?.message || `Error ${response.status}: No se pudo obtener perfil.`); }
      console.log(`DEBUG Fetch: Profile data received for user ID ${userIdNum}`);
      return data; // <-- ESTE 'data' YA CONTIENE EL ARRAY 'representantes' SI LA API LO DEVUELVE
  } catch (err) {
      console.error(`Error during getProveedorForUser fetch for ID ${userIdNum}:`, err);
      throw err; // Re-lanza
  }
};