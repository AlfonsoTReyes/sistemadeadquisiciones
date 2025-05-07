// 08 de diciembre de 2024

import { NextRequest, NextResponse } from "next/server";
import { getDetallesSolicitudPorId } from "../../../services/solicituddetalleservice";
import { updateSolicitudEstatus } from "../../../services/solicitudeservice";
import { updateDocumentoEstatus } from "../../../services/documentosoliservice";
import { updateJustificacionEstatus } from '../../../services/justificacionservice';
import { updateSuficienciaEstatus } from "../../../services/suficienciaService";
import { 
  getSolicitudById 
} from "../../../services/solicitudeservice";
import { enviarNotificacionUsuario } from "../../../services/notificaciooneservice";



// obtener todas las solicitudes o una en específico
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id_solicitudd");

    if (id) {
      const solicitud = await getDetallesSolicitudPorId(parseInt(id));
      if (!solicitud) {
        return NextResponse.json({ message: "detalle de solicitud no encontrada" }, { status: 404 });
      }
      return NextResponse.json(solicitud);
    }
    
  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    return NextResponse.json({ message: "error al obtener solicitudes", error }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { idDoc, tipoOrigen, nuevoEstatus, userId } = body;
    if (!idDoc || !tipoOrigen || !nuevoEstatus) {
      return NextResponse.json(
        { message: "faltan datos para actualizar. contacte con el administrador." },
        { status: 400 }
      );
    }

    let resultado;
    let usuarioDestino = null;
    let folio = null;

    switch (tipoOrigen) {
      
      case "suficiencia":
        resultado = await updateSolicitudEstatus(idDoc, nuevoEstatus);
        const solicitudSuficiencia = await getSolicitudById(idDoc);
        usuarioDestino = solicitudSuficiencia.id_usuario;
        folio = solicitudSuficiencia.folio;
        break;

      case "justificacion":
        console.log(idDoc,tipoOrigen, nuevoEstatus);
        resultado = await updateJustificacionEstatus(idDoc, nuevoEstatus);
        const solicitudJustificacion = await getSolicitudById(resultado.id_solicitud);
        usuarioDestino = solicitudJustificacion.id_usuario;
        folio = solicitudJustificacion.folio;
        break;

      case "aquisicion":
        resultado = await updateSuficienciaEstatus(idDoc, nuevoEstatus);
        const solicitudAdquisicion = await getSolicitudById(resultado.id_solicitud);
        usuarioDestino = solicitudAdquisicion.id_usuario;
        folio = solicitudAdquisicion.folio;
        break;

      case "documento":
        resultado = await updateDocumentoEstatus(idDoc, nuevoEstatus);
        const solicitudDocumento = await getSolicitudById(resultado.id_solicitud);
        usuarioDestino = solicitudDocumento.id_usuario;
        folio = solicitudDocumento.folio;
        break;

      default:
        return NextResponse.json(
          { message: "tipo de documento no reconocido." },
          { status: 400 }
        );
    }

    if (usuarioDestino) {
      await enviarNotificacionUsuario({
        titulo: `Actualización de estatus en ${tipoOrigen}`,
        mensaje: `El documento con folio ${folio} ha cambiado su estatus a "${nuevoEstatus}".`,
        tipo: 'Actualización',
        id_usuario_origen: userId,
        id_usuario_destino: usuarioDestino,
        destino_tipo: 'usuario',
      });
    } else {
      console.error("⚠️ No se encontró el usuario destino para la notificación.");
    }

    return NextResponse.json(resultado);

  } catch (error) {
    console.error("error al actualizar estatus:", error);
    return NextResponse.json(
      { message: "❌ error interno al actualizar el estatus.", error },
      { status: 500 }
    );
  }
}