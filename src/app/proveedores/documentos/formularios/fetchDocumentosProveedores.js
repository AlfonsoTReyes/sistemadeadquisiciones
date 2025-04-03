const API_URL = "/api/proveedoresDocumentos";
const API_URL_ID = "/api/proveedores"; // Assuming this is the correct base path

export const getProveedor = async (id_proveedor) => {
  const response = await fetch(`${API_URL_ID}?id_proveedor=${id_proveedor}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Error al obtener proveedor" })); // Try to get error message from API
    throw new Error(errorData.message || `Error ${response.status}: Error al obtener proveedor`);
  }
  return await response.json();
};

export const fetchDocumentosPorProveedor = async (id_proveedor) => {
  if (!id_proveedor) {
    throw new Error("El id_proveedor es requerido para buscar documentos.");
  }
  try {
    const response = await fetch(`${API_URL}?id_proveedor=${id_proveedor}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Intenta obtener detalles del error
      throw new Error(errorData.message || `Error al obtener los documentos del proveedor ${id_proveedor}. Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error en fetchDocumentosPorProveedor:", err);
    throw err;
  }
};

export const uploadDocumentoProveedor = async (formData) => {
  // Validación básica en el frontend (aunque el backend también valida)
  if (!formData.get('archivo') || !formData.get('tipo_documento') || !formData.get('id_proveedor') || !formData.get('userId')) {
     throw new Error("Faltan datos necesarios en el FormData para subir el documento.");
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => ({ message: "Error desconocido al subir el archivo." }));
      throw new Error(errorResponse.message || `Error al subir el documento. Status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error en uploadDocumentoProveedor:", err);
    throw err;
  }
};

export const deleteDocumentoProveedor = async (id_documento_proveedor) => {
  if (!id_documento_proveedor) {
    throw new Error("El id_documento_proveedor es requerido para eliminar.");
  }
  try {
    const response = await fetch(`${API_URL}?id=${id_documento_proveedor}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => ({})); // Intenta obtener detalles
      throw new Error(errorResponse.message || `Error al eliminar el documento ${id_documento_proveedor}. Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en deleteDocumentoProveedor:", error);
    throw error;
  }
};