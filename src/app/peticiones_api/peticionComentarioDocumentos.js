const API_URL = "/api/comentarios";


export const fetchJustificacionBySolicitud = async (idOrigen, tipoOrigen) => {
  try {
    const res = await fetch(
      `${API_URL}?id_origen=${idOrigen}&tipo_origen=${tipoOrigen}`
    );
    if (!res.ok) {
        throw new Error("Error al obtener los comentarios");
      }
      return await res.json();
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return null; // ✅ Retorna null si hay un error
  }
};

  
export const createComentario = async (
    idOrigen,
    tipoOrigen,
    nuevoComentario,
    respuestaA,
    idUsuario,
    idSol
  ) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_origen: idOrigen,
          tipo_origen: tipoOrigen,
          comentario: nuevoComentario,
          respuesta_a: respuestaA,
          id_usuario: idUsuario,
          id_solicitud: idSol
        }),
      });
  
      if (!res.ok) {
        console.error(`Error al enviar comentario. Status: ${res.status}`);
        return null;
      }
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      return null;
    }
  };