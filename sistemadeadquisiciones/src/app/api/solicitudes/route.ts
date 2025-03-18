// 08 de diciembre de 2024

import { NextRequest, NextResponse } from "next/server";
import { getSolicitudes, getSolicitudById, createSolicitud, updateSolicitud } from "../../../services/solicitudeservice";

// obtener todas las solicitudes o una en específico
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id_solicitud");

    if (id) {
      const solicitud = await getSolicitudById(parseInt(id));
      if (!solicitud) {
        return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
      }
      return NextResponse.json(solicitud);
    }

    const solicitudes = await getSolicitudes();
    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    return NextResponse.json({ message: "error al obtener solicitudes", error }, { status: 500 });
  }
}

// registrar una nueva solicitud
export async function POST(req: NextRequest) {
  try {
    const { folio, nomina_solicitante, secretaria, motivo, monto, id_adjudicacion } = await req.json();

    if (!folio || !nomina_solicitante || !secretaria || !motivo || !monto || !id_adjudicacion) {
      return NextResponse.json({ message: "todos los campos son obligatorios" }, { status: 400 });
    }

    const nuevaSolicitud = await createSolicitud({
      folio,
      nomina_solicitante,
      secretaria,
      motivo,
      monto,
      id_adjudicacion,
      fecha_solicitud: new Date(),
      estatus: "pendiente",
    });

    return NextResponse.json(nuevaSolicitud);
  } catch (error) {
    console.error("error al crear solicitud:", error);
    return NextResponse.json({ message: "error al crear solicitud", error }, { status: 500 });
  }
}

// actualizar solicitud
export async function PUT(req: NextRequest) {
  try {
    const { id_solicitud, folio, nomina_solicitante, secretaria, motivo, monto, id_adjudicacion, estatus } = await req.json();

    if (!id_solicitud) {
      return NextResponse.json({ message: "id de solicitud no proporcionado" }, { status: 400 });
    }

    const solicitudActualizada = await updateSolicitud(id_solicitud, {
      folio,
      nomina_solicitante,
      secretaria,
      motivo,
      monto,
      id_adjudicacion,
      estatus,
    });

    if (!solicitudActualizada) {
      return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    }

    return NextResponse.json(solicitudActualizada);
  } catch (error) {
    console.error("error al actualizar solicitud:", error);
    return NextResponse.json({ message: "error al actualizar solicitud", error }, { status: 500 });
  }
}
