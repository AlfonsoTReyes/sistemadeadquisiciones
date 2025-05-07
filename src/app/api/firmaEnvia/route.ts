import { NextRequest, NextResponse } from "next/server";
import { updateSolicitudEstatusFirma, getSolicitudById } from "../../../services/solicitudeservice";
import { getJustificacionBySolicitud } from "../../../services/justificacionservice";
import { getSuficienciasBySolicitudID } from "../../../services/suficienciaService";
import { getDocsBySolicitud } from "../../../services/documentosoliservice";
import { enviarNotificacion } from "../../../services/notificaciooneservice";

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
    const solicitud = await getSolicitudById(id_solicitud);

    if (!justificacion && !techo && numDocs < 1) {
      return NextResponse.json({
        message:
          "No puedes firmar la solicitud: falta justificación, techo presupuestal o al menos un documento adicional.",
      }, { status: 400 });
    }

    // Definir los roles dependiendo del tipo de adquisición
    let rolesDestino = [1, 3]; // Por defecto

    if (solicitud.tipo_adquisicion === 3) {
      rolesDestino = [1, 7]; // Si es tipo 3, cambiamos los roles
    }

    // Si pasa la validación, se firma
    const resultado = await updateSolicitudEstatusFirma(id_solicitud);
    const notificacion = await enviarNotificacion({
      titulo: 'Solicitud adquisición',
      mensaje: `La solicitud con el folio ${resultado.folio} fue enviada para revisión.`,
      tipo: 'Informativo', // o 'solicitud' si prefieres
      id_usuario_origen: 8,
      id_rol_destino: rolesDestino,
      destino_tipo: 'rol',
    });

    return NextResponse.json({ message: "Solicitud firmada correctamente", data: resultado.data });
  } catch (error) {
    console.error("error al firmar solicitud:", error);
    return NextResponse.json({ message: "error al firmar solicitud", error }, { status: 500 });
  }
}
