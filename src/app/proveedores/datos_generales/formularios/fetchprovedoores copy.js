const API_URL = "/api/proveedores"; // Assuming this is the correct base path

export const getProveedor = async (id_proveedor) => {
  const response = await fetch(`${API_URL}?id_proveedor=${id_proveedor}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Error al obtener proveedor" })); // Try to get error message from API
    throw new Error(errorData.message || `Error ${response.status}: Error al obtener proveedor`);
  }
  return await response.json();
};



// --- NEW FUNCTION ---
export const createProveedor = async (proveedorData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(proveedorData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Error al registrar proveedor" })); // Try to parse error JSON
    throw new Error(errorData.message || `Error ${response.status}: Error al registrar proveedor`); // Use API message or generic
  }
  return await response.json();
};

/** Fetches the main provider profile associated with a logged-in provider user */
export const getProveedorForUser = async (userId) => {
  if (!userId || isNaN(parseInt(userId))) {
      throw new Error("ID de usuario proveedor inválido para la búsqueda.");
  }
  try {
      console.log(`DEBUG Fetch: Fetching profile for user ID: ${userId}`);
      const response = await fetch(`${API_URL}?id_usuario_proveedor=${userId}`);
      console.log(`DEBUG Fetch: Response status for user ID ${userId}: ${response.status}`);

      const data = await response.json(); // Attempt to parse JSON regardless of status for error messages

      if (!response.ok) {
          // Handle specific 404 for profile not found vs other errors
          if (response.status === 404) {
              console.log(`DEBUG Fetch: Profile not found (404) for user ID: ${userId}`);
              // Decide how to handle this - throw specific error or return null?
              // Throwing makes the calling component handle the "not found" state explicitly
               throw new Error(data.message || 'Perfil de proveedor no encontrado para este usuario.');
          } else {
              console.error(`DEBUG Fetch: Error ${response.status} for user ID ${userId}:`, data.message);
               throw new Error(data.message || `Error ${response.status}: No se pudo obtener el perfil.`);
          }
      }
      console.log(`DEBUG Fetch: Profile data received for user ID ${userId}:`, data);
      return data;
  } catch (err) {
      console.error("Error during getProveedorForUser fetch:", err);
      // Re-throw the error for the component to handle
      throw new Error(err.message || 'Error de red o parseo al obtener perfil.');
  }
};




