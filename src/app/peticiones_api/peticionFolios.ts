const API_URL = "/api/folios";

// 🔍 Obtener todos los folios por id_secretaria
export const getFoliosBySecretaria = async (idSecretaria: number) => {
  try {
    const res = await fetch(`${API_URL}?idSecretaria=${idSecretaria}`);
    if (!res.ok) throw new Error("Error al cargar folios");
    return await res.json();
  } catch (error: any) {
    console.error("Error en getFoliosBySecretaria:", error);
    throw new Error(error.message || "Error desconocido al cargar folios");
  }
};

// ➕ Crear un nuevo folio
export const crearFolio = async (datos: any) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error("Error al crear folio");
    return await res.json();
  } catch (error: any) {
    console.error("Error en crearFolio:", error);
    throw new Error(error.message || "Error desconocido al crear folio");
  }
};

// ✏️ Modificar folio existente
export const modificarFolio = async (idFolio: number, datos: any) => {
  try {
    const res = await fetch(`${API_URL}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: idFolio,
        ...datos,
      }),
    });

    if (!res.ok) throw new Error("Error al modificar folio");
    return await res.json();
  } catch (error: any) {
    console.error("Error en modificarFolio:", error);
    throw new Error(error.message || "Error desconocido al modificar folio");
  }
};

// 🗑️ Eliminar folio
export const eliminarFolio = async (idFolio: number) => {
  try {
    const res = await fetch(`${API_URL}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idFolio }),
    });
    if (!res.ok) throw new Error("Error al eliminar folio");
    return await res.json();
  } catch (error: any) {
    console.error("Error en eliminarFolio:", error);
    throw new Error(error.message || "Error desconocido al eliminar folio");
  }
};

// 🔎 Obtener un folio por su ID
export const getFolioById = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}?id=${id}`);
    if (!response.ok) throw new Error("Error al obtener el folio");
    return await response.json();
  } catch (error: any) {
    console.error("Error en getFolioById:", error);
    throw new Error(error.message || "Error desconocido al obtener el folio");
  }
};
