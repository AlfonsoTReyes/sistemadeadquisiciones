import { NextRequest, NextResponse } from "next/server";
import { getBasesAll, getBasesById, getBasesByConcurso, createBases, updateBases } from "../.../../../../services/baseservice"; // ✅ Adaptamos tu servicio

// 🔍 GET: obtener bases
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idConcurso = searchParams.get("idConcurso");
    const idBases = searchParams.get("idBases");

    // Si viene idConcurso, busca bases de ese concurso
    if (idConcurso) {
      const bases = await getBasesByConcurso(parseInt(idConcurso));
      if (!bases) {
        return NextResponse.json({ message: "Bases no encontradas" }, { status: 404 });
      }
      return NextResponse.json(bases);
    }

    // Si viene idBases, buscar bases por idBases (opcional si quieres)
    if (idBases) {
      const bases = await getBasesById(parseInt(idBases));
      if (!bases) {
        return NextResponse.json({ message: "Bases no encontradas" }, { status: 404 });
      }
      return NextResponse.json(bases);
    }

    // Si no viene nada, regresa todas
    const todasBases = await getBasesAll();
    return NextResponse.json(todasBases);

  } catch (error) {
    console.error("Error al obtener bases:", error);
    return NextResponse.json({ message: "Error al obtener bases", error }, { status: 500 });
  }
}

// ➕ POST: crear bases
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nuevaBases = await createBases(body);
    return NextResponse.json(nuevaBases);

  } catch (error) {
    console.error("Error al crear bases:", error);
    return NextResponse.json({ message: "Error al crear bases", error }, { status: 500 });
  }
}

// ✏️ PUT: actualizar bases
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_bases } = body;

    if (!id_bases) {
      return NextResponse.json({ message: "ID de bases no proporcionado" }, { status: 400 });
    }

    const basesActualizadas = await updateBases(id_bases, body);

    if (!basesActualizadas) {
      return NextResponse.json({ message: "Bases no encontradas" }, { status: 404 });
    }

    return NextResponse.json(basesActualizadas);

  } catch (error) {
    console.error("Error al actualizar bases:", error);
    return NextResponse.json({ message: "Error al actualizar bases", error }, { status: 500 });
  }
}
