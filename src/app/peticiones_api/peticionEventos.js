const API_URL = "/api/eventoComite";

// 🔍 Obtener todos los eventos del comité
export const fetchEventos = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error("Error al obtener los eventos");
    }
    return await res.json();
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return [];
  }
};

export const getEventoById = async (id_evento) => {
  try {
    const response = await fetch(`${API_URL}?id=${id_evento}`);
    if (!response.ok) throw new Error("Error al obtener los datos del evento");
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Error desconocido");
  }
};


// ➕ Crear un nuevo evento
export const crearEvento = async (nuevoEvento) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoEvento),
    });

    if (!res.ok) {
      throw new Error("Error al crear el evento");
    }

    return await res.json();
  } catch (error) {
    console.error("Error al crear evento:", error);
    return null;
  }
};

// 🖊️ Modificar un evento existente
export const modificarEvento = async (datosActualizados) => {
  try {
    const res = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosActualizados),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar el evento");
    }

    return await res.json();
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return null;
  }
};

// 🗑️ Eliminar un evento
export const eliminarEvento = async (idEvento) => {
  try {
    const res = await fetch(`${API_URL}?id=${idEvento}`, {
      method: "DELETE",
    });

    const data = await res.json(); // <- Primero obtén los datos

    if (!res.ok) {
      throw new Error(data.message || "Error al eliminar el evento");
    }

    return data; // <- data tendrá { success: true }
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    return null;
  }
};
