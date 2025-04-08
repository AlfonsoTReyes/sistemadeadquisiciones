import { NextRequest, NextResponse } from "next/server";
import { updateSolicitudEstatusFirma } from "../../../services/solicitudeservice";
import { getJustificacionBySolicitud } from "../../../services/justificacionservice";
import { getSuficienciasBySolicitudID } from "../../../services/suficienciaService";
import { getDocsBySolicitud } from "../../../services/documentosoliservice";


export async function POST(req: NextRequest) {
  try {
    const { id_solicitud } = await req.json();

    if (!id_solicitud) {
      return NextResponse.json({ message: "id de solicitud requerido" }, { status: 400 });
    }

    // Validaciones previas
    const justificacion = await getJustificacionBySolicitud(id_solicitud);
    const techo = await getSuficienciasBySolicitudID(id_solicitud);
    const numDocs = await getDocsBySolicitud(id_solicitud);

    if (!justificacion && !techo && numDocs < 1) {
      return NextResponse.json({
        message:
          "No puedes firmar la solicitud: falta justificación, techo presupuestal o al menos un documento adicional.",
      }, { status: 400 });
    }

    // Si pasa la validación, se firma
    const resultado = await updateSolicitudEstatusFirma(id_solicitud);

    return NextResponse.json({ message: "Solicitud firmada correctamente", data: resultado.data });
  } catch (error) {
    console.error("error al firmar solicitud:", error);
    return NextResponse.json({ message: "error al firmar solicitud", error }, { status: 500 });
  }
}
