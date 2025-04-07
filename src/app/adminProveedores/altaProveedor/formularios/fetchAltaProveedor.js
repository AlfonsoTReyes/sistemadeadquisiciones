
const ADMIN_PROVEEDORES_API_URL = '/api/adminProveedores';

/**
 * Obtiene la lista completa de proveedores desde la API de administración.
 * Llama a GET /api/admin/proveedores
 * @returns {Promise<ProveedorData[]>} - Una promesa que resuelve a un array de proveedores.
 */
/**
 * Obtiene la lista completa de proveedores desde la API de administración.
 * Llama a GET /api/admin/proveedores
 * @returns {Promise<Array<object>>} - Una promesa que resuelve a un array de proveedores.
 */
export const fetchAllProveedores = async () => {
  console.log("DEBUG Fetch: Calling fetchAllProveedores");
  try {
    // Usa la URL base correcta
    const response = await fetch(ADMIN_PROVEEDORES_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora error */ }
      console.error(`Fetch Error GET ${ADMIN_PROVEEDORES_API_URL}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener la lista de proveedores: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("DEBUG Fetch: fetchAllProveedores successful, received", data.length, "providers");
    return data;

  } catch (err) {
    console.error("Fetch Error in fetchAllProveedores:", err);
    throw err; // Re-lanza el error
  }
};

/**
 * Actualiza el estatus (activo/inactivo) de un proveedor específico.
 * Llama a PUT /api/admin/proveedores enviando ID y estatus en el cuerpo.
 * @param {number} idProveedor - El ID del proveedor a actualizar.
 * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
// AJUSTADO para coincidir con PUT /api/admin/proveedores
export const updateProveedorStatus = async (idProveedor, newStatus) => {
  console.log(`DEBUG Fetch: Calling updateProveedorStatus for ID ${idProveedor} with status ${newStatus}`);
  // --- Usa la URL BASE ---
  const apiUrl = ADMIN_PROVEEDORES_API_URL;

  // Validación básica en JS (opcional pero útil)
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
     const errorMsg = 'Fetch Error: idProveedor inválido para updateProveedorStatus';
     console.error(errorMsg);
     throw new Error(errorMsg); // Detener ejecución si el ID es inválido
  }
  if (typeof newStatus !== 'boolean') {
     const errorMsg = 'Fetch Error: newStatus inválido (debe ser boolean) para updateProveedorStatus';
     console.error(errorMsg);
     throw new Error(errorMsg); // Detener ejecución si el estatus es inválido
  }

  try {
    const response = await fetch(apiUrl, {
      // --- MÉTODO AJUSTADO A PUT ---
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Añadir headers de autenticación si son necesarios
      },
      // --- BODY AJUSTADO: Incluye id_proveedor y estatus ---
      body: JSON.stringify({
          id_proveedor: idProveedor, // Clave como la espera la API
          estatus: newStatus         // Clave como la espera la API
      }),
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora error */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating ID ${idProveedor}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar el estatus del proveedor: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: updateProveedorStatus successful for ID ${idProveedor}`);
    return data;

  } catch (err) {
    // Asegura que siempre se lance un objeto Error
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in updateProveedorStatus for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};