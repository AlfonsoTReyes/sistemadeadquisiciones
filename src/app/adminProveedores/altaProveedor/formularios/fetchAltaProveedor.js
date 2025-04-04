
const ADMIN_PROVEEDORES_API_URL = '/api/adminProveedores';

/**
 * Obtiene la lista completa de proveedores desde la API de administración.
 * Llama a GET /api/admin/proveedores
 * @returns {Promise<ProveedorData[]>} - Una promesa que resuelve a un array de proveedores.
 */
export const fetchAllProveedores = async () => {
  console.log("DEBUG Fetch: Calling fetchAllProveedores");
  try {
    const response = await fetch(ADMIN_PROVEEDORES_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Añadir headers de autenticación si son necesarios
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error("Fetch Error: Could not parse error response body.");
      }
      console.error(`Fetch Error: Status ${response.status}. Response:`, errorData);
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
 * Llama a PATCH /api/admin/proveedores/[id]/status
 * @param {number} idProveedor - El ID del proveedor a actualizar.
 * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
// Sin anotaciones de tipo en los parámetros
export const updateProveedorStatus = async (idProveedor, newStatus) => {
  console.log(`DEBUG Fetch: Calling updateProveedorStatus for ID ${idProveedor} with status ${newStatus}`);
  const apiUrl = `${ADMIN_PROVEEDORES_API_URL}/${idProveedor}/status`;

  // Opcional: Añadir validación básica en JS si lo deseas
  if (typeof idProveedor !== 'number' || typeof newStatus !== 'boolean') {
     console.warn('Fetch Warning: Invalid types passed to updateProveedorStatus');
     // Podrías lanzar un error aquí o continuar con precaución
     // throw new Error('Tipos inválidos para updateProveedorStatus');
  }


  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Añadir headers de autenticación si son necesarios
      },
      body: JSON.stringify({ estatus: newStatus }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error("Fetch Error: Could not parse error response body for status update.");
      }
      console.error(`Fetch Error: Status ${response.status} updating status for ID ${idProveedor}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar el estatus del proveedor: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: updateProveedorStatus successful for ID ${idProveedor}`);
    return data;

  } catch (err) {
    console.error(`Fetch Error in updateProveedorStatus for ID ${idProveedor}:`, err);
    throw err; // Re-lanza el error
  }
};