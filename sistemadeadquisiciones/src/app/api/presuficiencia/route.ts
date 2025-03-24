import { NextRequest, NextResponse } from "next/server";
import {
  getSuficienciaById,
  createSuficiencia,
  updateSuficiencia
} from "../../../services/suficienciaService";

// GET: obtener todas o una suficiencia
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id_suficiencia");
    const id_solicitud = searchParams.get("id_solicitud");

    if (id) {
      const suficiencia = await getSuficienciaById(parseInt(id));
      if (!suficiencia) {
        return NextResponse.json({ message: "suficiencia no encontrada" }, { status: 404 });
      }
      return NextResponse.json(suficiencia);
    }

  } catch (error) {
    console.error("error al obtener suficiencias:", error);
    return NextResponse.json({ message: "error al obtener suficiencias", error }, { status: 500 });
  }
}

// POST: crear nueva suficiencia
export async function POST(req: NextRequest) {
  try {
    const {
      id_secretaria,
      id_dependencia,
      id_usuario,
      id_solicitud,
      oficio,
      asunto,
      lugar,
      fecha,
      hora,
      cuenta,
      cantidad,
      motivo
    } = await req.json();
    console.log("444", id_secretaria,
        id_dependencia,
        id_usuario,
        id_solicitud,
        oficio,
        asunto,
        lugar,
        fecha,
        hora,
        cuenta,
        cantidad,
        motivo);

    if (!id_secretaria || !id_dependencia || !id_usuario || !oficio || !asunto || !lugar || !fecha || !hora || !cuenta || !cantidad || !motivo || !id_solicitud) {
      return NextResponse.json({ message: "todos los campos son obligatorios" }, { status: 400 });
    }

    const nueva = await createSuficiencia({
      id_secretaria,
      id_dependencia,
      id_usuario,
      id_solicitud,
      oficio,
      asunto,
      lugar,
      fecha,
      hora,
      cuenta,
      cantidad,
      motivo,
      estatus: 'pendiente'
    });

    return NextResponse.json(nueva);
  } catch (error) {
    console.error("error al crear suficiencia:", error);
    return NextResponse.json({ message: "error al crear suficiencia", error }, { status: 500 });
  }
}

// PUT: actualizar suficiencia existente
export async function PUT(req: NextRequest) {
  try {
    const {
      id_suficiencia,
      oficio,
      asunto,
      lugar,
      fecha,
      hora,
      cuenta,
      cantidad,
      motivo,
      estatus
    } = await req.json();

    if (!id_suficiencia) {
      return NextResponse.json({ message: "id de suficiencia requerido" }, { status: 400 });
    }

    const actualizado = await updateSuficiencia(id_suficiencia, {
      oficio,
      asunto,
      lugar,
      fecha,
      hora,
      cuenta,
      cantidad,
      motivo,
      estatus
    });

    if (!actualizado) {
      return NextResponse.json({ message: "suficiencia no encontrada" }, { status: 404 });
    }

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("error al actualizar suficiencia:", error);
    return NextResponse.json({ message: "error al actualizar suficiencia", error }, { status: 500 });
  }
}
