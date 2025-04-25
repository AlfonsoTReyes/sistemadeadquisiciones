import { NextRequest, NextResponse } from "next/server";
import {
  confirmarLecturaOrden, getOrdenDiaPorComentarios, createComentario
  } from "../../../services/confirmacionordenservices";

  export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const origen = searchParams.get("origen");
      const tipo = searchParams.get("tipo");
  
      // Validar que ambos parámetros existan
      if (!origen || !tipo) {
        return NextResponse.json({ message: "Parámetros requeridos: origen y tipo" }, { status: 400 });
      }
  
      const idOrigen = parseInt(origen);
      if (isNaN(idOrigen)) {
        return NextResponse.json({ message: "El parámetro 'origen' debe ser un número válido" }, { status: 400 });
      }
  
      const orden = await getOrdenDiaPorComentarios(idOrigen, tipo);
  
      if (!orden || orden.length === 0) {
        return NextResponse.json({ message: "Orden del día no encontrada" }, { status: 404 });
      }
  
      return NextResponse.json(orden);
    } catch (error) {
      console.error("Error al obtener órdenes del día:", error);
      return NextResponse.json({ message: "Error interno", error }, { status: 500 });
    }
  }


export async function POST(req: NextRequest) {
    try {
      const { id_origen, tipo_origen, comentario, respuesta_a, id_usuario, id_solicitud } =
        await req.json();
  
      if (!id_usuario) {
        return NextResponse.json(
          { message: "El ID del usuario es obligatorio." },
          { status: 400 }
        );
      }
  
      const nuevoComentario = await createComentario({
        id_origen,
        tipo_origen,
        comentario,
        respuesta_a,
        id_usuario,
        id_solicitud
      });
  
      return NextResponse.json(nuevoComentario, { status: 201 });
    } catch (error) {
      console.error("Error al crear comentario:", error);
      return NextResponse.json(
        { message: "Error al crear comentario.", error },
        { status: 500 }
      );
    }
}

// PUT: actualizar orden del día
export async function PUT(req: NextRequest) {
  try {
    const { idOrdenDia, id_usuario } = await req.json();

    if (!idOrdenDia || !id_usuario) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const actualizado = await confirmarLecturaOrden(idOrdenDia, id_usuario);

    return NextResponse.json({ message: "Confirmado correctamente", data: actualizado });
  } catch (error) {
    console.error("❌ Error al confirmar recibido:", error);
    return NextResponse.json({ message: "Error al confirmar recibido", error }, { status: 500 });
  }
}
