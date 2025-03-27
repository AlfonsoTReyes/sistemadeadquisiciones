const API_URL = "/api/solicituddetalles";
const API_URL_OTROS = "/api/solicitud_documentos";


/** Obtiene la lista de roles desde la API */
export const fetchSolicitudesDetalles = async (id_solicitud) => {
  try {
    const response = await fetch(`${API_URL}?id_solicitudd=${id_solicitud}`);
    if (!response.ok) {
      throw new Error("Error al obtener las solicitudes de detalle");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};


/** Crea un nuevo usuario en la API */
export const createSolicitud = async (rolData) => {
  try {

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rolData),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Error al crear la solicitud.");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getSolicitudById = async (id_solicitud) => {
  try {
    const response = await fetch(`${API_URL}?id_solicitud=${id_solicitud}`);
    if (!response.ok) throw new Error("Error al obtener los datos de la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};


export const updateSolicitud = async (solicitudData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(solicitudData),
    });

    if (!response.ok) throw new Error("Error al actualizar la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};


/********** ALTA DE OTROS DOCUMENTOS ******/

export const createOtroAnexo = async (formData) => {
  try {

    const response = await fetch(API_URL_OTROS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Error al crear la solicitud.");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getOtroAnexoById = async (id_solicitud) => {
  try {
    const response = await fetch(`${API_URL}?id_doc=${id_solicitud}`);
    if (!response.ok) throw new Error("Error al obtener los datos de la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};


export const updateOtroAnexo = async (solicitudData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(solicitudData),
    });

    if (!response.ok) throw new Error("Error al actualizar la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const deleteOtroAnexo = async (idDoc) => {
  try {
    const response = await fetch(`${API_URL_OTROS}?id=${idDoc}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Error al eliminar el documento.");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};