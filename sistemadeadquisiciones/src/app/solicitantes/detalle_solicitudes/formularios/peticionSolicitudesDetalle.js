const API_URL = "/api/solicituddetalles";


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

/** Obtiene un usuario por ID */
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