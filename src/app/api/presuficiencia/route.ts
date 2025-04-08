import { NextRequest, NextResponse } from "next/server";
import {
  getSuficienciaById,
  getSuficienciaByIdPDF,
  createSuficiencia,
  updateSuficiencia,
  getPreSuficienciasPendientes,
  getSuficienciasPendientes
} from "../../../services/suficienciaService";

// GET: obtener todas o una suficiencia
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id_pre");
    const id_pdf = searchParams.get("id");

    const tipo = searchParams.get("tipo");


    if (id) {
      const suficiencia = await getSuficienciaById(parseInt(id));
      if (!suficiencia) {
        return NextResponse.json({ message: "suficiencia no encontrada" }, { status: 404 });
      }
      return NextResponse.json(suficiencia);
    }

    if (id_pdf) {

      const suficiencia = await getSuficienciaByIdPDF(parseInt(id_pdf));
      if (!suficiencia) {
        return NextResponse.json({ message: "suficiencia no encontrada" }, { status: 404 });
      }
      return NextResponse.json(suficiencia);
    }


    if (tipo === "suf") {
      const suficiencias = await getSuficienciasPendientes(); // ← consulta de solicitudes de suficiencia
        if (!suficiencias) {
          return NextResponse.json({ message: "suficiencia no encontrada" }, { status: 404 });
        }
        return NextResponse.json(suficiencias);
    }

    if (tipo === "pre") {
      const suficiencia = await getPreSuficienciasPendientes();
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
      estatus: 'Pendiente',
      tipo: 'Pre-suficiencia'
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
      cuenta,
      cantidad,
      motivo
    } = await req.json();

    if (!id_suficiencia) {
      return NextResponse.json({ message: "id de suficiencia requerido" }, { status: 400 });
    }

    const actualizado = await updateSuficiencia(id_suficiencia, {
      oficio,
      asunto,
      lugar,
      fecha,
      cuenta,
      cantidad,
      motivo,
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
