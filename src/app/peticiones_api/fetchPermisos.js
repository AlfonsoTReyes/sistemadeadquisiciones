import bcrypt from "bcryptjs";

const API_URL = "/api/permisos"; // Definir la URL base de la API

export const fetchPermisos = async () => {
  try {
    const response = await fetch("/api/permisos");
    if (!response.ok) {
      throw new Error("Error al obtener los permisos");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const createPermiso = async (permisoData) => {
  try {
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(permisoData),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Error al crear el permiso.");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

/** Obtiene un usuario por ID */
export const getPermisoById = async (id_permiso) => {
  try {
    const response = await fetch(`${API_URL}?id_permiso=${id_permiso}`);
    if (!response.ok) throw new Error("Error al obtener los datos del permiso");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const updatePermiso = async (permisoData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(permisoData),
    });

    if (!response.ok) throw new Error("Error al actualizar permiso");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const deletePermiso = async (permisoId) => {
  try {
    const response = await fetch(`${API_URL}?id_permiso=${permisoId}&eliminar=true`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al actualizar permiso");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};