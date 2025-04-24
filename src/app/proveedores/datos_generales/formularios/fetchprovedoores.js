// Asume que esta es la ruta base correcta para tu API de proveedores
const API_URL = "/api/proveedores";

/**
 * Obtiene los detalles de un proveedor por su ID principal.
 * La respuesta incluirá los campos actividad_sat y proveedor_eventos si existen.
 * @param {number} id_proveedor - El ID del proveedor a buscar.
 * @returns {Promise<object>} - Los datos del proveedor.
 * @throws {Error} - Si la petición falla o el proveedor no se encuentra.
 */
export const getProveedor = async (id_proveedor) => {
  // Validar entrada
  if (!id_proveedor || isNaN(parseInt(id_proveedor))) {
      console.error("getProveedor Fetch: ID de proveedor inválido:", id_proveedor);
      throw new Error("ID de proveedor inválido proporcionado.");
  }
  console.log(`DEBUG Fetch: Attempting to fetch provider with ID: ${id_proveedor}`);
  const response = await fetch(`${API_URL}?id_proveedor=${id_proveedor}`);
  console.log(`DEBUG Fetch: Response status for provider ID ${id_proveedor}: ${response.status}`);

  const data = await response.json().catch((err) => {
      console.error(`DEBUG Fetch: Failed to parse JSON for provider ID ${id_proveedor}, status ${response.status}`, err);
      // Si falla el parseo y la respuesta no fue OK, genera un error genérico para ese status
      if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo obtener el proveedor (respuesta no válida).`);
      }
      // Si la respuesta fue OK pero el JSON falló (raro), es un problema diferente.
      throw new Error("Error al procesar la respuesta del servidor.");
  });


  if (!response.ok) {
    console.error(`DEBUG Fetch: Error fetching provider ID ${id_proveedor}:`, data);
    // Usa el mensaje de la API si existe, si no, uno genérico.
    throw new Error(data?.message || `Error ${response.status}: Error al obtener proveedor`);
  }
  console.log(`DEBUG Fetch: Successfully fetched provider ID ${id_proveedor}`);
  return data; // Contiene los datos, incluyendo los nuevos campos
};

/**
 * Crea un nuevo registro de proveedor (incluyendo detalles morales/físicos).
 * @param {object} proveedorData - Objeto con TODOS los datos del proveedor, incluyendo:
 *   id_usuario_proveedor, tipoProveedor, rfc, ..., actividadSat (requerido), proveedorEventos (opcional boolean),
 *   y los campos específicos de moral/física.
 * @returns {Promise<object>} - El objeto del proveedor recién creado (usualmente { id_proveedor: newId }).
 * @throws {Error} - Si la petición falla o hay errores de validación en el backend.
 */
export const createProveedor = async (proveedorData) => {
  // Opcional: Validación básica en el cliente antes de enviar
  if (!proveedorData?.id_usuario_proveedor || !proveedorData.tipoProveedor || !proveedorData.rfc || !proveedorData.actividadSat /* ... otros requeridos */) {
       console.error("createProveedor Fetch: Faltan datos esenciales en proveedorData", proveedorData);
       // Podrías lanzar un error aquí para evitar una llamada inútil a la API
       // throw new Error("Faltan datos requeridos para crear el proveedor.");
       // O simplemente dejar que la API lo valide, pero loggear el problema.
  }

  console.log("DEBUG Fetch: Attempting to create provider with data:", proveedorData);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedorData), // Envía el objeto completo
  });

  console.log(`DEBUG Fetch: Create response status: ${response.status}`);
  const data = await response.json().catch((err) => {
        console.error(`DEBUG Fetch: Failed to parse JSON for create, status ${response.status}`, err);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo registrar el proveedor (respuesta no válida).`);
        }
        throw new Error("Error al procesar la respuesta del servidor tras creación.");
  });

  if (!response.ok) {
    console.error("DEBUG Fetch: Error creating provider:", data);
    throw new Error(data?.message || `Error ${response.status}: Error al registrar proveedor`);
  }
  console.log("DEBUG Fetch: Provider created successfully:", data);
  return data; // Devuelve la respuesta del API (e.g., { id_proveedor: ... })
};

/**
 * Actualiza un registro de proveedor existente.
 * @param {object} updateData - Objeto con los datos a actualizar. DEBE incluir 'id_proveedor'.
 *   Puede contener cualquier campo actualizable de la tabla proveedores (incluyendo actividadSat, proveedorEventos)
 *   y los campos específicos de moral/física según corresponda. También debe incluir 'tipoProveedor'.
 * @returns {Promise<object>} - Los datos completos del proveedor actualizado.
 * @throws {Error} - Si la petición falla o hay errores de validación.
 */
export const updateProveedor = async (updateData) => {
  // Validación crucial: debe tener id_proveedor
  if (!updateData?.id_proveedor || typeof updateData.id_proveedor !== 'number') {
    console.error("updateProveedor Fetch: Falta o es inválido 'id_proveedor' en los datos de actualización.", updateData);
    throw new Error("Se requiere 'id_proveedor' para actualizar.");
  }
  // Validación crucial: debe tener tipoProveedor
   if (!updateData?.tipoProveedor || !['moral', 'fisica'].includes(updateData.tipoProveedor)) {
     console.error("updateProveedor Fetch: Falta o es inválido 'tipoProveedor' en los datos de actualización.", updateData);
     throw new Error("Se requiere 'tipoProveedor' válido ('moral' o 'fisica') para actualizar.");
   }

  console.log(`DEBUG Fetch: Attempting to update provider ID: ${updateData.id_proveedor} with data:`, updateData);

  const response = await fetch(API_URL, { // Asume que PUT va al mismo endpoint base
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData), // Envía el objeto completo incluyendo id_proveedor
  });

  console.log(`DEBUG Fetch: Update response status for ID ${updateData.id_proveedor}: ${response.status}`);
  const data = await response.json().catch((err) => {
        console.error(`DEBUG Fetch: Failed to parse JSON for update ID ${updateData.id_proveedor}, status ${response.status}`, err);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo actualizar el proveedor (respuesta no válida).`);
        }
        throw new Error("Error al procesar la respuesta del servidor tras actualización.");
  });

  if (!response.ok) {
    console.error(`DEBUG Fetch: Error updating provider ID ${updateData.id_proveedor}:`, data);
    throw new Error(data?.message || `Error ${response.status}: Error al actualizar proveedor`);
  }
  console.log(`DEBUG Fetch: Provider ID ${updateData.id_proveedor} updated successfully`);
  return data; // Devuelve el proveedor actualizado desde la API
};


/**
 * Obtiene el perfil de proveedor principal asociado a un ID de usuario proveedor.
 * La respuesta incluirá actividad_sat y proveedor_eventos si existen.
 * @param {number | string} userId - El ID del usuario proveedor.
 * @returns {Promise<object | null>} - Los datos del perfil del proveedor o null si no se encuentra (tras manejo de 404).
 * @throws {Error} - Si la petición falla por otros motivos o el ID es inválido.
 */
export const getProveedorForUser = async (userId) => {
  const userIdNum = parseInt(userId, 10); // Parsear a número para validación
  if (!userId || isNaN(userIdNum)) {
      console.error("getProveedorForUser Fetch: Invalid user ID:", userId);
      throw new Error("ID de usuario proveedor inválido para la búsqueda.");
  }
  try {
      console.log(`DEBUG Fetch: Fetching profile for user ID: ${userIdNum}`);
      const response = await fetch(`${API_URL}?id_usuario_proveedor=${userIdNum}`);
      console.log(`DEBUG Fetch: Response status for user ID ${userIdNum}: ${response.status}`);

      // Si es 404, el perfil no existe, manejarlo específicamente ANTES de intentar parsear JSON
      // porque el body podría estar vacío o no ser JSON.
      if (response.status === 404) {
          console.log(`DEBUG Fetch: Profile not found (404) for user ID: ${userIdNum}`);
          // Decide cómo manejar "no encontrado": devolver null o lanzar error específico.
          // Devolver null puede ser más fácil de manejar en el componente que llama.
           return null;
          // O si prefieres que el componente siempre use try/catch:
          // throw new Error('Perfil de proveedor no encontrado para este usuario.');
      }

      // Para otros errores o éxito, intenta parsear JSON
      const data = await response.json().catch((err) => {
            console.error(`DEBUG Fetch: Failed to parse JSON for user ID ${userIdNum}, status ${response.status}`, err);
            if (!response.ok) {
                // Si la respuesta no fue OK (y no era 404), lanza error basado en status
                throw new Error(`Error ${response.status}: No se pudo obtener el perfil (respuesta no válida).`);
            }
            // Si la respuesta fue OK pero el JSON falló
            throw new Error("Error al procesar la respuesta del servidor.");
      });

      // Si llegamos aquí y la respuesta no fue OK (y no 404), es un error del servidor con mensaje JSON
      if (!response.ok) {
          console.error(`DEBUG Fetch: Error ${response.status} fetching profile for user ID ${userIdNum}:`, data?.message || "No message");
          throw new Error(data?.message || `Error ${response.status}: No se pudo obtener el perfil.`);
      }

      // Éxito
      console.log(`DEBUG Fetch: Profile data received for user ID ${userIdNum}`);
      return data; // Contiene los datos, incluyendo los nuevos campos

  } catch (err) {
      // Captura errores de red, errores lanzados manualmente arriba, etc.
      console.error(`Error during getProveedorForUser fetch for ID ${userIdNum}:`, err);
      // Re-lanza para que el componente lo maneje, usa el mensaje existente si lo tiene.
      throw new Error(err.message || 'Error de red o desconocido al obtener perfil.');
  }
};