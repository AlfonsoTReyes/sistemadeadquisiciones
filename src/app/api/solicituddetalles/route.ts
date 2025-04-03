// 08 de diciembre de 2024

import { NextRequest, NextResponse } from "next/server";
//import {  getDetallesSolicitudPorId, updateEstatusDocumentos } from "../../../services/solicituddetalleservice";
import {  getDetallesSolicitudPorId } from "../../../services/solicituddetalleservice";


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
/*

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { idDoc, tipoOrigen, nuevoEstatus } = body;

    // Verificar si los valores requeridos están presentes
    if (!idDoc || !tipoOrigen || !nuevoEstatus) {
      return NextResponse.json(
        { message: "Faltan datos para actualizar. Contacte con el administrador" },
        { status: 400 }
      );
    }

    // Actualizar en función del tipo de origen
    const resultado = await updateEstatusDocumentos(
      parseInt(id_vehiculo_actual),
      parseInt(id_vehiculo_nuevo),
      tipo_origen
    );

    if (resultado.success) {
      return NextResponse.json({
        success: true,
        message: "✅ id_vehiculo actualizado correctamente.",
      });
    } else {
      return NextResponse.json(
        { message: resultado.message || "❌ Error al actualizar id_vehiculo." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error al actualizar id_vehiculo:", error);
    return NextResponse.json(
      { message: "❌ Error al actualizar id_vehiculo.", error },
      { status: 500 }
    );
  }
}
  */