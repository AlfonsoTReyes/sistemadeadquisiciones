import { NextRequest, NextResponse } from "next/server";
import {
    obtenerEventos,
    obtenerEventoPorId,
    crearEventoComite,
    actualizarEventoComite,
    eliminarEventoComite
    } from "../../../services/eventocomiteservice";

// GET: obtener todos o uno
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const evento = await obtenerEventoPorId(parseInt(id));
      if (!evento) {
        return NextResponse.json({ message: "evento no encontrado" }, { status: 404 });
      }
      return NextResponse.json(evento);
    }

    const eventos = await obtenerEventos();
    return NextResponse.json(eventos);
  } catch (error) {
    console.error("error al obtener eventos:", error);
    return NextResponse.json({ message: "error interno", error }, { status: 500 });
  }
}

// POST: crear nuevo evento
export async function POST(req: NextRequest) {
  try {
    const {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      tipo_evento,
      estatus,
      color,
      id_usuario,
      nomenclatura,
      anio
    } = await req.json();

    if (!titulo || !fecha_inicio || !fecha_fin || !tipo_evento || !id_usuario) {
      return NextResponse.json({ message: "faltan campos obligatorios" }, { status: 400 });
    }

    const nuevo = await crearEventoComite({
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      tipo_evento,
      estatus: estatus || 'activo',
      color,
      id_usuario,
      nomenclatura,
      anio
    });

    return NextResponse.json(nuevo);
  } catch (error) {
    console.error("error al crear evento:", error);
    return NextResponse.json({ message: "error al crear evento", error }, { status: 500 });
  }
}

// PUT: actualizar evento
export async function PUT(req: NextRequest) {
  try {
    const {
      id_evento,
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      tipo_evento,
      estatus,
      color,
      nomenclatura,
      anio
    } = await req.json();

    if (!id_evento) {
      return NextResponse.json({ message: "id del evento requerido" }, { status: 400 });
    }

    const actualizado = await actualizarEventoComite(id_evento, {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      tipo_evento,
      estatus,
      color,
      nomenclatura,
      anio
    });

    if (!actualizado) {
      return NextResponse.json({ message: "evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("error al actualizar evento:", error);
    return NextResponse.json({ message: "error al actualizar evento", error }, { status: 500 });
  }
}

// DELETE: eliminar evento
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "id requerido para eliminar" }, { status: 400 });
    }

    const eliminado = await eliminarEventoComite(parseInt(id));
    if (!eliminado) {
      return NextResponse.json({ message: "evento no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "evento eliminado con éxito" });

  } catch (error) {
    console.error("error al eliminar evento:", error);
    return NextResponse.json({ message: "error al eliminar evento", error }, { status: 500 });
  }
}


