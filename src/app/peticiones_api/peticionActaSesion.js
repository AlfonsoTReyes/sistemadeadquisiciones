const API = "/api/ordendia";
const API_ACTAS = "/api/actas_sesion"; // 👈 ruta sugerida para actas

/** Obtener todas las órdenes del día (opcionalmente por solicitud) */
export const fetchOrdenesDia = async (solicitud) => {
  try {
    const res = await fetch(`${API}?solicitud=${solicitud}`);
    if (!res.ok) throw new Error("Error al obtener órdenes del día");
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};

/** Obtener órdenes del día filtradas por usuario y sistema */
export const fetchOrdenesUsuario = async (usuario, sistema) => {
  try {
    const res = await fetch(`${API}?usuario=${usuario}&sistema=${sistema}`);
    if (!res.ok) throw new Error("Error al obtener órdenes del día");
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};

/** Crear una nueva orden del día */
export const createOrdenDia = async (data) => {
  try {
    const res = await fetch(API, {
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

/** Obtener una orden del día por su ID */
export const getOrdenDiaById = async (id_orden) => {
  try {
    const res = await fetch(`${API}?id=${id_orden}`);
    if (!res.ok) throw new Error("Orden del día no encontrada");
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};

/** Actualizar orden del día (tipo 1 o 2 según secciones) */
export const updateOrdenDia = async (data) => {
  try {
    const res = await fetch(API, {
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

/** Obtener una orden del día por su ID */
export const geDictamenOrdenDiaById = async (id_orden) => {
  try {
    const res = await fetch(`${API_ACTAS}?id=${id_orden}`);
    if (!res.ok) throw new Error("Orden del día no encontrada");
    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};

/** Crear acta de sesión vinculada a una orden del día */
export const guardarActaSesion = async (data) => {
  try {
    const res = await fetch(`${API_ACTAS}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Error al guardar acta de sesión");
    }

    return await res.json();
  } catch (err) {
    throw new Error(err.message || "Error desconocido");
  }
};
