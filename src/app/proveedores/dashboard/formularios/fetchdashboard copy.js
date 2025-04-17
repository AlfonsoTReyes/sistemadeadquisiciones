const API_URL = "/api/proveedores"; // Assuming this is the correct base path

export const getProveedor = async (id_proveedor) => {
  const response = await fetch(`${API_URL}?id_proveedor=${id_proveedor}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Error al obtener proveedor" })); // Try to get error message from API
    throw new Error(errorData.message || `Error ${response.status}: Error al obtener proveedor`);
  }
  return await response.json();
};

export const updateProveedor = async (proveedorDataWithId) => {
    // Ensure id_proveedor is included
    if (!proveedorDataWithId || !proveedorDataWithId.id_proveedor) {
        throw new Error("ID del proveedor es requerido para actualizar.");
    }
     // Ensure tipoProveedor is included
     if (!proveedorDataWithId.tipoProveedor) {
        throw new Error("Tipo de proveedor es requerido para actualizar.");
    }
  
    try {
      const response = await fetch(API_URL, { // Use the base URL
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          // Send the complete object as received
          body: JSON.stringify(proveedorDataWithId),
      });
  
      const data = await response.json(); // Always parse to get potential errors
  
      if (!response.ok) {
          // Use message from API response if available
          throw new Error(data.message || `Error ${response.status}: Error al actualizar proveedor`);
      }
      return data; // Return updated data on success
    } catch(err) {
      console.error("Error during provider update fetch:", err);
      throw new Error(err.message); // Re-throw for the component/hook
    }
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



