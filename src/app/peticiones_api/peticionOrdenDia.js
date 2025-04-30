const API_ORDEN_DIA = "/api/ordendia";

/** Obtener todas las órdenes del día (opcionalmente por secretaría) */
export const fetchOrdenesDia = async (solicitud) => {
  try {
    const res = await fetch(`${API_ORDEN_DIA}?solicitud=${solicitud}`);
    if (!res.ok) {
      const errorData = await res.text(); // Puedes ajustar si tu API manda JSON o texto
      throw new Error(`Error al obtener órdenes del día: ${errorData}`);
    }

    const data = await res.json();
    // Si el servidor responde bien pero no hay órdenes:
    if (!data || data.length === 0) {
      return []; // ⬅️ OJO: simplemente regreso arreglo vacío, no lanzo error
    }

    return data;
  } catch (err) {
    console.error("fetchOrdenesDia error:", err);
    throw err; // Error real
  }
};




export const fetchOrdenesUsuario = async (usuario, sistema) => {
  try {
    const res = await fetch(`${API_ORDEN_DIA}?usuario=${usuario}&sistema=${sistema}`);
    if (!res.ok) throw new Error("Error al obtener órdenes del día");
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};

/** Crear una nueva orden del día */
export const createOrdenDia = async (data) => {
  try {
    const res = await fetch(API_ORDEN_DIA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al crear orden del día");
    }

    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};

/** Obtener una orden del día por ID */
export const getOrdenDiaById = async (id_orden) => {
  try {
    const res = await fetch(`${API_ORDEN_DIA}?id=${id_orden}`);
    if (!res.ok) throw new Error("Orden del día no encontrada");
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};

/** Actualizar una orden del día */
export const updateOrdenDia = async (data) => {
  try {
    const res = await fetch(API_ORDEN_DIA, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar la orden del día");
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};
