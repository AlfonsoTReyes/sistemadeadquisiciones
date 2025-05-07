// Importa las herramientas necesarias de Next.js para manejar solicitudes y respuestas HTTP.
import { NextRequest, NextResponse } from "next/server";

// Importa las funciones relacionadas con comentarios desde el servicio correspondiente.
import {
  getComentarios,
  getComentariosbySolicitudDocumento,
  createComentario,
  updateComentario,
  deleteComentario,
} from "../../../services/comentarioservice";

// 📚 Obtener comentarios por solicitud, justificación o documento
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id_origen = searchParams.get("id_origen");
    const tipo_origen = searchParams.get("tipo_origen");

    if (id_origen && tipo_origen) {
      const comentarios = await getComentariosbySolicitudDocumento(Number(id_origen), tipo_origen);
      return NextResponse.json(comentarios);
    }

    // Obtener todos los comentarios si no hay filtros
    const allComentarios = await getComentarios();
    return NextResponse.json(allComentarios);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return NextResponse.json(
      { message: "Error al obtener comentarios.", error },
      { status: 500 }
    );
  }
}

// 📌 Crear un nuevo comentario
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

// ✏️ Actualizar un comentario existente
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id_comentario } = data;

    if (!id_comentario) {
      return NextResponse.json(
        { message: "ID del comentario requerido para actualizar." },
        { status: 400 }
      );
    }

    const comentarioActualizado = await updateComentario(data);
    return NextResponse.json(comentarioActualizado);
  } catch (error) {
    console.error("Error al actualizar comentario:", error);
    return NextResponse.json(
      { message: "Error al actualizar comentario.", error },
      { status: 500 }
    );
  }
}

// ❌ Eliminar un comentario
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id_comentario = searchParams.get("id_comentario");

    if (!id_comentario) {
      return NextResponse.json(
        { message: "ID del comentario requerido para eliminar." },
        { status: 400 }
      );
    }

    // const resultado = await deleteComentario(Number(id_comentario));
    return NextResponse.json({ message: "Comentario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return NextResponse.json(
      { message: "Error al eliminar comentario.", error },
      { status: 500 }
    );
  }
}
