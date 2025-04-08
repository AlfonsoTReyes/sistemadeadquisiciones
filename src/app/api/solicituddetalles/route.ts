// 08 de diciembre de 2024

import { NextRequest, NextResponse } from "next/server";
import { getDetallesSolicitudPorId } from "../../../services/solicituddetalleservice";
import { updateSolicitudEstatus } from "../../../services/solicitudeservice";
import { updateDocumentoEstatus } from "../../../services/documentosoliservice";
import { updateJustificacionEstatus } from '../../../services/justificacionservice';
import { updateSuficienciaEstatus } from "../../../services/suficienciaService";


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
    const { idDoc, tipoOrigen, nuevoEstatus } = body;
    if (!idDoc || !tipoOrigen || !nuevoEstatus) {
      return NextResponse.json(
        { message: "faltan datos para actualizar. contacte con el administrador." },
        { status: 400 }
      );
    }

    let resultado;

    // según el tipo de documento se llama a una función distinta

    console.log(tipoOrigen, nuevoEstatus);
    switch (tipoOrigen) {
      
      case "suficiencia":
    console.log(tipoOrigen, nuevoEstatus);

        resultado = await updateSolicitudEstatus(idDoc, nuevoEstatus);
        break;

      case "justificacion":
        resultado = await updateJustificacionEstatus(idDoc, nuevoEstatus);
        break;

      case "aquisicion":
        resultado = await updateSuficienciaEstatus(idDoc, nuevoEstatus);
        break;

      case "documento":
        resultado = await updateDocumentoEstatus(idDoc, nuevoEstatus);
        break;

      default:
        return NextResponse.json(
          { message: "tipo de documento no reconocido." },
          { status: 400 }
        );
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