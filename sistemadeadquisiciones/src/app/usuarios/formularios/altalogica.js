import bcrypt from "bcryptjs";

/**
 * Obtiene la lista de roles desde la API
 * @returns {Promise<Array>} - Lista de roles
 */
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

/**
 * Crea un nuevo usuario en la API
 * @param {Object} usuarioData - Datos del usuario a registrar
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const createUser = async (usuarioData) => {
  try {
    // Cifrar la contraseña antes de enviarla
    usuarioData.password = await bcrypt.hash(usuarioData.password, 10);
    
    const response = await fetch("/api/usuarios", {
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
