// ➕ Crear invitaciones a comité
export const enviarInvitacionesCalendario = async (invitaciones: any[]) => {
    try {
      const res = await fetch("/api/invitacionescalendario", {
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

  export const createInvitacionComite = async (data: any) => {
    try {
      const res = await fetch("/api/invitacionescalendario", {
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
  