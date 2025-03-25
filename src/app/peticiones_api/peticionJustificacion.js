const API_URL = "/api/justificacion";


export const fetchJustificacionBySolicitud = async (id_solicitud) => {
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

export const createJustificacion = async (rolData) => {
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

export const getJusitificacionById = async (id_solicitud) => {
  try {
    const response = await fetch(`${API_URL}?id_solicitud=${id_solicitud}`);
    if (!response.ok) throw new Error("Error al obtener los datos de la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const updateJustificacion = async (solicitudData) => {
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



/********* PARA LA SUBIDA DE DOCUMENTOS DE DETALLE DE LA JUSTIFICACION ***********/

export const fetchJustificacionDetalleBySolicitud = async (id_solicitud) => {
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

export const createJustificacionDetalle = async (rolData) => {
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

export const getJusitificacionDetalleById = async (id_solicitud) => {
  try {
    const response = await fetch(`${API_URL}?id_solicitud=${id_solicitud}`);
    if (!response.ok) throw new Error("Error al obtener los datos de la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const updateJustificacionDetalle = async (solicitudData) => {
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