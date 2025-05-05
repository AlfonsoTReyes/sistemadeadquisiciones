const API_URL = "/api/concursos";

// 🔍 Obtener todos los concursos
export const fetchConcursos = async (userSecre, userSistema) => {
  try {
    const res = await fetch(`${API_URL}?userSecre=${encodeURIComponent(userSecre)}&userSistema=${encodeURIComponent(userSistema)}`);
    if (!res.ok) {
      throw new Error("Error al obtener concursos");
    }
    return await res.json();
  } catch (error) {
    console.error("Error al obtener concursos:", error);
    return [];
  }
};

// 🔍 Obtener un concurso por ID
export const getConcursoById = async (id_concurso) => {
  try {
    const response = await fetch(`${API_URL}?id=${id_concurso}`);
    if (!response.ok) throw new Error("Error al obtener los datos del concurso");

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};

export const crearConcurso = async (nuevoConcurso) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoConcurso),
    });

    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(errorMessage || "Error al crear el concurso");
    }

    return await res.json();
  } catch (error) {
    console.error("Error al crear concurso:", error);
    throw error; // <-- Lanzamos el error, no return null
  }
};


export const modificarConcurso = async (id_concurso, datosActualizados) => {
  try {
    const res = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_concurso,     // Aquí se incluye correctamente dentro del JSON
        ...datosActualizados,
      }),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar el concurso");
    }

    return await res.json();
  } catch (error) {
    console.error("Error al actualizar concurso:", error);
    return null;
  }
};


// 🗑️ Eliminar un concurso
export const eliminarConcurso = async (id_concurso) => {
  try {
    const res = await fetch(`${API_URL}/${id_concurso}`, {
      method: "DELETE",
    });

    const data = await res.json(); // Primero obtén la respuesta

    if (!res.ok) {
      throw new Error(data.message || "Error al eliminar el concurso");
    }

    return data; // data tendrá { success: true }
  } catch (error) {
    console.error("Error al eliminar concurso:", error);
    return null;
  }
};


export const actualizarEstatusConcurso = async (id_concurso, datosActualizados) => {
  try {
    const res = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_concurso,     // Aquí se incluye correctamente dentro del JSON
        ...datosActualizados,
      }),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar el concurso");
    }

    return await res.json();
  } catch (error) {
    console.error("Error al actualizar concurso:", error);
    return null;
  }
};
