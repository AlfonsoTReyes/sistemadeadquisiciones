const API_URL = "/api/justificacion";


export const fetchJustificacionBySolicitud = async (id_solicitud) => {
  try {
    const response = await fetch(`${API_URL}?id_solicitudd=${id_solicitud}`);
    if (!response.ok) {
      throw new Error("Error al obtener las solicitudes de detalle");
    }
    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
};