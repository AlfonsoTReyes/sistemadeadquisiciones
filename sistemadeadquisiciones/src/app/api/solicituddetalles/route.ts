// 08 de diciembre de 2024

import { NextRequest, NextResponse } from "next/server";
import {  getDetallesSolicitudPorId } from "../../../services/solicituddetalleservice";

// obtener todas las solicitudes o una en específico
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id_solicitudd");

    if (id) {
      console.log(1);
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
