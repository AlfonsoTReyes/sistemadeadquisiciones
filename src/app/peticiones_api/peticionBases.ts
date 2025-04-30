const API_URL = "/api/bases";
const API_URL_SECRE= "/api/secretarias";

// 🔍 Obtener las bases de un concurso
export const getBasesByConcurso = async (idConcurso: number) => {
    try {
      const res = await fetch(`${API_URL}?idConcurso=${idConcurso}`);
      
      if (res.status === 404) {
        // 🔥 No es un error grave: simplemente no hay bases
        return null;
      }
  
      if (!res.ok) {
        // 🔥 Ahora sí, si es otro error, lo lanzamos
        throw new Error("Error al cargar bases del concurso");
      }
  
      return await res.json();
    } catch (error: any) {
      console.error("Error en getBasesByConcurso:", error);
      throw new Error(error.message || "Error desconocido al cargar bases");
    }
  };
  
  

// ➕ Crear nuevas bases
export const createBases = async (datos: any) => {
    try {
        const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
        });
        if (!res.ok) throw new Error("Error al crear bases");
        return await res.json();
    } catch (error: any) {
        console.error("Error en createBases:", error);
        throw new Error(error.message || "Error desconocido al crear bases");
    }
};

// ✏️ Modificar bases existentes
export const updateBases = async (idBases: number, datos: any) => {
    try {
        const res = await fetch(`${API_URL}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_bases: idBases,
            ...datos,
        }),
        });

        if (!res.ok) throw new Error("Error al modificar bases");

        return await res.json();
    } catch (error: any) {
        console.error("Error en updateBases:", error);
        throw new Error(error.message || "Error desconocido al modificar bases");
    }
};

// ✏️ Cambiar estatus de bases (solo estatus)
export const changeStatusBases = async (idBases: number, nuevoEstatus: string) => {
    try {
        const res = await fetch(`${API_URL}/estatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_bases: idBases,
            estatus: nuevoEstatus,
        }),
        });

        if (!res.ok) throw new Error("Error al cambiar estatus de bases");

        return await res.json();
    } catch (error: any) {
        console.error("Error en changeStatusBases:", error);
        throw new Error(error.message || "Error desconocido al cambiar estatus de bases");
    }
};

// 🔎 Obtener bases por ID (opcional, si quieres buscar solo un registro)
export const getBasesById = async (idBases: number) => {
    try {
        const res = await fetch(`${API_URL}?idBases=${idBases}`);
        if (!res.ok) throw new Error("Error al obtener bases por ID");
        return await res.json();
    } catch (error: any) {
        console.error("Error en getBasesById:", error);
        throw new Error(error.message || "Error desconocido al obtener bases por ID");
    }
};

export const fetchSecretarias = async () => {
    try {
      const res = await fetch(API_URL_SECRE);
      if (!res.ok) throw new Error("Error al obtener bases por ID");
      return await res.json();
    } catch (error: any) {
        console.error("Error en getBasesById:", error);
        throw new Error(error.message || "Error desconocido al obtener bases por ID");
    }
  };