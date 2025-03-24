import bcrypt from "bcryptjs";

const API_URL = "/api/usuarios"; // Definir la URL base de la API

/** Obtiene la lista de roles desde la API */
export const fetchRoles = async () => {
  try {
    const response = await fetch("/api/roles");
    if (!response.ok) {
      throw new Error("Error al obtener los roles");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const fetchSecretarias = async () => {
  try {
    const response = await fetch("/api/secretarias");
    if (!response.ok) {
      throw new Error("Error al obtener las secretarias");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const fetchDependencias = async () => {
  try {
    const response = await fetch("/api/dependencias");
    if (!response.ok) {
      throw new Error("Error al obtener las dependencias");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

/** Crea un nuevo usuario en la API */
export const createUser = async (usuarioData) => {
  try {
    usuarioData.password = await bcrypt.hash(usuarioData.password, 10);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuarioData),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Error al crear el usuario.");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

/** Obtiene un usuario por ID */
export const getUserById = async (id_usuario) => {
  try {
    const response = await fetch(`${API_URL}?id_usuario=${id_usuario}`);
    if (!response.ok) throw new Error("Error al obtener los datos del usuario");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

/** Actualiza un usuario en la API */


export const updateUser = async (usuarioData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuarioData),
    });

    if (!response.ok) throw new Error("Error al actualizar usuario");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};
