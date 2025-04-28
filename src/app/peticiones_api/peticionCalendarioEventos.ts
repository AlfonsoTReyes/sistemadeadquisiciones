const API_URL = "/api/calendarioeventos";

// 🔍 Obtener todos los eventos de un concurso
export const getEventosByConcurso = async (idConcurso: number) => {
  try {
    const res = await fetch(`${API_URL}?idConcurso=${idConcurso}`);
    if (!res.ok) throw new Error("Error al cargar eventos");
    return await res.json();
  } catch (error: any) {
    console.error("Error en getEventosByConcurso:", error);
    throw new Error(error.message || "Error desconocido al cargar eventos");
  }
};

// ➕ Crear un nuevo evento
export const crearEvento = async (idConcurso: number, datos: any) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_concurso: idConcurso, ...datos }),
    });
    if (!res.ok) throw new Error("Error al crear evento");
    return await res.json();
  } catch (error: any) {
    console.error("Error en crearEvento:", error);
    throw new Error(error.message || "Error desconocido al crear evento");
  }
};

// ✏️ Modificar evento existente
export const modificarEvento = async (idEvento: number, datos: any) => {
    try {
      const res = await fetch(`${API_URL}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_evento_calendario: idEvento,
          ...datos,
        }),
      });
  
      if (!res.ok) throw new Error("Error al modificar evento");
  
      return await res.json();
    } catch (error: any) {
      console.error("Error en modificarEvento:", error);
      throw new Error(error.message || "Error desconocido al modificar evento");
    }
  };
  

// 🗑️ Eliminar evento
export const eliminarEvento = async (idEvento: number) => {
    try {
      const res = await fetch(`${API_URL}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_evento_calendario: idEvento }), // 👈 Lo mandamos en el body
      });
      if (!res.ok) throw new Error("Error al eliminar evento");
      return await res.json();
    } catch (error: any) {
      console.error("Error en eliminarEvento:", error);
      throw new Error(error.message || "Error desconocido al eliminar evento");
    }
  };
  

// 🔎 Obtener un concurso por su ID (por si quieres ver datos extra del concurso)
export const getEventoById = async (id_concurso: number) => {
  try {
    const response = await fetch(`${API_URL}?id=${id_concurso}`);
    if (!response.ok) throw new Error("Error al obtener los datos del concurso");
    return await response.json();
  } catch (error: any) {
    console.error("Error en getConcursoById:", error);
    throw new Error(error.message || "Error desconocido al obtener el concurso");
  }
};
