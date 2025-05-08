import { NextRequest, NextResponse } from "next/server";
import {
  getEventosByConcurso,
  crearEventoService,
  modificarEventoService,
  eliminarEventoService,
  getEventoById
} from "../../../services/calendarioEventosService";

// 🔍 GET - Obtener eventos de un concurso
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idConcurso = searchParams.get('idConcurso');
  const idEvento = searchParams.get('id'); // Aquí lo renombro para que no se confunda con idConcurso

  try {
    if (idConcurso) {
      const eventos = await getEventosByConcurso(Number(idConcurso));
      return NextResponse.json(eventos);
    }

    if (idEvento) {
      const evento = await getEventoById(Number(idEvento));
      return NextResponse.json(evento);
    }

    // Si no llega ni idConcurso ni id
    return NextResponse.json({ message: "Falta idConcurso o id" }, { status: 400 });

  } catch (error: any) {
    console.error("API GET /calendarioeventos error:", error);
    return NextResponse.json({ message: error.message || "Error en el servidor" }, { status: 500 });
  }
}

// ➕ POST - Crear nuevo evento
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await crearEventoService(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API POST /calendarioeventos error:", error);
    return NextResponse.json({ message: error.message || "Error al crear evento" }, { status: 500 });
  }
}

// ✏️ PUT - Modificar evento existente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_evento_calendario, ...datosActualizados } = body;
    if (!id_evento_calendario) {
      return NextResponse.json({ message: "Falta el id del evento" }, { status: 400 });
    }

    await modificarEventoService(Number(id_evento_calendario), datosActualizados);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("API PUT /calendarioeventos error:", error);
    return NextResponse.json({ message: error.message || "Error al actualizar evento" }, { status: 500 });
  }
}


// 🗑️ DELETE - Eliminar evento
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_evento_calendario } = body;

    if (!id_evento_calendario) {
      return NextResponse.json({ message: "Falta id_evento_calendario" }, { status: 400 });
    }

    await eliminarEventoService(Number(id_evento_calendario));
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("API DELETE /calendarioeventos error:", error);
    return NextResponse.json({ message: error.message || "Error al eliminar evento" }, { status: 500 });
  }
}

