import { NextRequest, NextResponse } from "next/server";
import { verificarInvitacion, crearInvitacionesComite, eliminarInvitacionesDeUsuario, actualizarInvitacionComite } from "../../../services/invitacioncomiteservice";
import { getEventosByConcurso } from "../../../services/calendarioEventosService";


// 🔍 Verificar o recuperar invitaciones
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verificar = searchParams.get("verificar");
    const id_concurso = searchParams.get("id_concurso");

    if (verificar === "1" && id_concurso) {
      const resultado = await verificarInvitacion(Number(id_concurso));

      if (!resultado) {
        return NextResponse.json({ yaFueEnviado: false }, { status: 200 });
      }

      return NextResponse.json({
        yaFueEnviado: true,
        numero_oficio: resultado.numero_oficio,
        fecha_hora_envio: resultado.fecha_hora_envio,
        participantes: resultado.participantes,
        eventos: resultado.eventos, // 👈 asegúrate que esto exista en el objeto de respuesta
      });
      
    }

    return NextResponse.json({ message: "Parámetros inválidos" }, { status: 400 });
  } catch (error) {
    console.error("Error en GET /invitacionescalendario:", error);
    return NextResponse.json({ message: "Error en servidor", error }, { status: 500 });
  }
}

// ➕ Crear nuevas invitaciones
export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
  
      const id_concurso = body.id_concurso;
      const numero_oficio = body.numero_oficio;
      const fecha_hora_envio = body.fecha_hora_envio;
      const id_usuario_envio = body.id_usuario_envio;
      const participantes = body.participantes;
  
      if (!id_concurso || !numero_oficio || !fecha_hora_envio || !id_usuario_envio || !participantes || participantes.length === 0) {
        return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
      }
  
      // 🔄 1. Obtener los eventos asociados al concurso
      const eventos = await getEventosByConcurso(id_concurso);
  
      if (!eventos || eventos.length === 0) {
        return NextResponse.json({ message: "No hay eventos registrados para este concurso" }, { status: 404 });
      }
  
      // 🧠 2. Generar todas las combinaciones evento × participante
      const invitaciones = eventos.flatMap((evento: any) =>
        participantes.map((part: any) => ({
          id_evento_calendario: evento.id_evento_calendario,
          id_usuario_envio,
          id_usuario_recibe: part.id_usuario_recibe,
          tipo_participante: part.tipo_participante,
          numero_oficio,
          fecha_hora_envio
        }))
      );
  
      // 📤 3. Guardar todas las invitaciones
      const resultado = await crearInvitacionesComite(invitaciones);
      return NextResponse.json(resultado); // ya incluye .cantidad¿      
      
    } catch (error) {
      console.error("Error en POST /invitacionescalendario:", error);
      return NextResponse.json({ message: "Error al guardar invitaciones", error }, { status: 500 });
    }
  }


  export async function DELETE(req: NextRequest) {
    try {
      const body = await req.json();
      const { id_usuario, id_concurso } = body;
      console.log(id_usuario, id_concurso);
  
      if (!id_usuario || !id_concurso) {
        return NextResponse.json({ message: "Faltan parámetros requeridos" }, { status: 400 });
      }
  
      const result = await eliminarInvitacionesDeUsuario(id_usuario, id_concurso);
  
      return NextResponse.json({
        message: "Invitaciones eliminadas correctamente",
        eliminadas: result,
      });
    } catch (error) {
      console.error("Error en DELETE /invitacionescalendario:", error);
      return NextResponse.json({ message: "Error al eliminar invitaciones", error }, { status: 500 });
    }
  }


  export async function PUT(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const id_concurso = searchParams.get("id_concurso");
  
      if (!id_concurso) {
        return NextResponse.json({ message: "Falta el parámetro id_concurso" }, { status: 400 });
      }
  
      const { numero_oficio } = await req.json();
  
      if (!numero_oficio) {
        return NextResponse.json({ message: "Falta el número de oficio" }, { status: 400 });
      }
  
      const result = await actualizarInvitacionComite(Number(id_concurso), numero_oficio);
      return NextResponse.json(result);
    } catch (error) {
      console.error("❌ Error en PUT /invitacionoferentes:", error);
      return NextResponse.json({ message: "Error en servidor", error }, { status: 500 });
    }
  }