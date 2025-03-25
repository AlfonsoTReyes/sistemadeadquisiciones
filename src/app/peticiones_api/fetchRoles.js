import bcrypt from "bcryptjs";

const API_URL = "/api/roles";
const API_URL_ROLES_PERMISOS = "/api/rolespermisos";
const API_URL_PERMISOS = "/api/permisos";


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


/** Crea un nuevo usuario en la API */
export const createRol = async (rolData) => {
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
      throw new Error(errorResponse.message || "Error al crear el rol.");
    }

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

/** Obtiene un usuario por ID */
export const getRolById = async (id_rol) => {
  try {
    const response = await fetch(`${API_URL}?id_rol=${id_rol}`);
    if (!response.ok) throw new Error("Error al obtener los datos del rol");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};


export const updateRol = async (rolData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rolData),
    });

    if (!response.ok) throw new Error("Error al actualizar usuario");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const fetchPermisos = async () => {
  try {
    const response = await fetch(API_URL_PERMISOS);
    if (!response.ok) throw new Error("Error al obtener los permisos");
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const fetchPermisosRol = async (rolId) => {
  try {
    const response = await fetch(`${API_URL_ROLES_PERMISOS}?rolId=${rolId}`);
    if (!response.ok) throw new Error("Error al obtener los permisos del rol");
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};

export const updatePermisosRol = async (rolId, permisos) => {
  try {
    const response = await fetch(API_URL_ROLES_PERMISOS, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_rol: rolId, permisos }),
    });

    if (!response.ok) throw new Error("Error al modificar los permisos");

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};