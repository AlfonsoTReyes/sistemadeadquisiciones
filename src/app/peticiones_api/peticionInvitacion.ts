// ➕ Crear invitaciones a comité
export const enviarInvitacionesCalendario = async (invitaciones: any[]) => {
    try {
      const res = await fetch("/api/invitacionoferentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitaciones }),
      });
  
      if (!res.ok) throw new Error("Error al enviar invitaciones");
      return await res.json();
    } catch (error: any) {
      console.error("Error en enviarInvitacionesCalendario:", error);
      throw new Error(error.message || "Error desconocido al enviar invitaciones");
    }
  };

  // 🔍 Verificar si ya se enviaron invitaciones para un concurso
export const verificarInvitacionPorConcurso = async (id_concurso: number) => {
    try {
      const res = await fetch(`/api/invitacionoferentes?verificar=1&id_concurso=${id_concurso}`);
  
      if (!res.ok) throw new Error("Error al verificar invitación");
  
      const data = await res.json();
      return data; // { yaFueEnviado: true, numero_oficio, fecha_hora_envio, participantes: [...] }
    } catch (error: any) {
      console.error("Error en verificarInvitacionPorConcurso:", error);
      return null;
    }
  };
  

  export const createInvitacionComite = async (data: any) => {
    try {
      const res = await fetch("/api/invitacionoferentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al enviar invitaciones");
      return await res.json();
    } catch (error: any) {
      console.error("Error en createInvitacionComite:", error);
      throw new Error(error.message || "Error desconocido al enviar");
    }
  };
  

  export const updateInvitacionComite = async (idConcurso: number, payload: any) => {
    const res = await fetch(`/api/invitacionoferentes?id_concurso=${idConcurso}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  
    if (!res.ok) throw new Error("Error al actualizar la invitación");
    return await res.json();
  };
  

  

  // peticiones_api/peticionInvitacion.ts

export const eliminarInvitacionComite = async (id_usuario: number, id_concurso: number) => {
    
    const res = await fetch("/api/invitacionoferentes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, id_concurso }),
    });
  
    if (!res.ok) {
      throw new Error("Error al eliminar la invitación");
    }
  
    return await res.json();
  };
  
  export const getInvitacionByConcurso = async (idConcurso: number) => {
    try {
      const res = await fetch(`/api/invitacionoferentes?verificar=1&id_concurso=${idConcurso}`);
      if (!res.ok) throw new Error("Error al obtener la invitación");
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("❌ Error en getInvitacionByConcurso:", error);
      return null;
    }
  };
  