import { NextRequest, NextResponse } from "next/server";
import {
    obtenerUltimoFolioPorSecretaria,
    obtenerFolioPorId,
    crearFolio,
    actualizarFolio,
    eliminarFolio,
    } from "../../../services/folioservice"; // Asegúrate que el path sea correcto

// GET: obtener todos o uno
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const idSecretaria = searchParams.get("idSecretaria");

    if (id) {
      const folio = await obtenerFolioPorId(parseInt(id));
      if (!folio) {
        return NextResponse.json({ message: "Folio no encontrado" }, { status: 404 });
      }
      return NextResponse.json(folio);
    }

    
    if (idSecretaria) {
        const folio = await obtenerUltimoFolioPorSecretaria(parseInt(idSecretaria));
        if (!folio) {
          return NextResponse.json({ message: "Folio no encontrado" }, { status: 404 });
        }
        return NextResponse.json(folio);
      }
      

  } catch (error) {
    console.error("Error al obtener folios:", error);
    return NextResponse.json({ message: "Error interno", error }, { status: 500 });
  }
}

// POST: crear nuevo folio
export async function POST(req: NextRequest) {
  try {
    const { folio, descripcion, contador, id_secretaria } = await req.json();

    if (!folio || !contador || !id_secretaria) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    const nuevoFolio = await crearFolio({ folio, descripcion, contador, id_secretaria });
    return NextResponse.json(nuevoFolio);
  } catch (error) {
    console.error("Error al crear folio:", error);
    return NextResponse.json({ message: "Error al crear folio", error }, { status: 500 });
  }
}

// PUT: actualizar folio
export async function PUT(req: NextRequest) {
  try {
    const { id, folio, descripcion, contador, id_secretaria } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID requerido" }, { status: 400 });
    }

    const actualizado = await actualizarFolio(id, {
      folio,
      descripcion,
      contador,
      id_secretaria,
    });

    if (!actualizado) {
      return NextResponse.json({ message: "Folio no encontrado" }, { status: 404 });
    }

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar folio:", error);
    return NextResponse.json({ message: "Error al actualizar folio", error }, { status: 500 });
  }
}

// DELETE: eliminar folio
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID requerido para eliminar" }, { status: 400 });
    }

    const eliminado = await eliminarFolio(parseInt(id));
    if (!eliminado) {
      return NextResponse.json({ message: "Folio no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Folio eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar folio:", error);
    return NextResponse.json({ message: "Error al eliminar folio", error }, { status: 500 });
  }
}
