const API_URL = "/api/presuficiencia";
const API_URL_OTROS = "/api/documento_presuficiencia";


/** Obtiene la lista de roles desde la API */
export const fetchSoliPreSuficiencia = async (tipo, userSecre, userSistema) => {
  try {
    const response = await fetch(`${API_URL}?tipo=${tipo}&secretaria=${userSecre}&sistema=${userSistema}`);
    if (!response.ok) {
      throw new Error("Error al obtener las solicitudes de detalle");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const createSoliPreSuficiencia = async (PreData) => {
  try {

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(PreData),
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
export const getSoliPreById = async (id_pre) => {
  try {
    const response = await fetch(`${API_URL}?id_pre=${id_pre}`);
    if (!response.ok) throw new Error("Error al obtener los datos de la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};


export const updateSoliPre = async (preData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preData),
    });

    if (!response.ok) throw new Error("Error al actualizar la solicitud");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};



/** Modulo de finanzas */

export const createRespuesta = async (formData) => {
  try {

    const response = await fetch(API_URL_OTROS, {
      method: "POST",
      
      body: formData,
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

export const fetchDocsPreSuficiencia = async (idSuficiencia) => {
  try {
    const response = await fetch(`${API_URL_OTROS}?id=${idSuficiencia}`);
    if (!response.ok) {
      throw new Error("Error al obtener las solicitudes de detalle");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const deleteDocumento = async (idDoc) => {
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

export const fetchSoliSuficiencia = async (tipo, userSecre, userSistema) => {
  try {
    const response = await fetch(`${API_URL}?tipo=${tipo}&secretaria=${userSecre}&sistema=${userSistema}`);
    if (!response.ok) {
      throw new Error("Error al obtener las solicitudes de detalle");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};