const API_URL = "/api/secretarias";
const API_URL_D = "/api/dependencias";

// 🔍 Obtener todos los folios por id_secretaria
export const getSecretariasById = async (idSecretaria: number) => {
  try {
    const res = await fetch(`${API_URL}?idSecretaria=${idSecretaria}`);
    if (!res.ok) throw new Error("Error al cargar folios");
    return await res.json();
  } catch (error: any) {
    console.error("Error en getFoliosBySecretaria:", error);
    throw new Error(error.message || "Error desconocido al cargar folios");
  }
};

export const getDependenciaById = async (idDependencia: number) => {
  try {
    const res = await fetch(`${API_URL_D}?idDependencia=${idDependencia}`);
    if (!res.ok) throw new Error("Error al cargar folios");
    return await res.json();
  } catch (error: any) {
    console.error("Error en getFoliosBySecretaria:", error);
    throw new Error(error.message || "Error desconocido al cargar folios");
  }
};
