import bcrypt from "bcryptjs";

const API_URL = "/api/catalogoAdjudicaciones"; // Definir la URL base de la API

/** Obtiene la lista de roles desde la API */
export const fetchAdjudicaciones = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener las requisiciones");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const fetchAdjudicacionesById = async (id) => {
  try {
    const response = await fetch(`${API_URL}?id=${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener las requisiciones");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

/** Crea un nuevo usuario en la API */
export const createAdjudicaciones = async (requisicionData) => {
  try {
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requisicionData),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Error al crear el requisiciones.");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};


export const updateAdjudicaciones = async (requisicionData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requisicionData),
    });

    if (!response.ok) throw new Error("Error al actualizar usuario");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};
