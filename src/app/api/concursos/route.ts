import { NextRequest, NextResponse } from 'next/server';
import { 
  getConcursosForSelect, 
  getConcursos, 
  getConcursosById, 
  crearConcurso, 
  modificarConcurso 
} from '@/services/concursosService'; // Asegúrate que estén bien las rutas

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const forSelect = searchParams.get('forSelect');
  const userSecre = searchParams.get('userSecre');
  const userSistema = searchParams.get('userSistema');
  const id = searchParams.get('id');

  try {
    if (forSelect === 'true') {
      console.log("API GET /concursos: Request for select options");
      const options = await getConcursosForSelect();
      return NextResponse.json(options);
    }

    if (userSecre && userSistema) {
      const concursos = await getConcursos();
      return NextResponse.json(concursos);
    }

    if (id) {
      const concurso = await getConcursosById(id);
      return NextResponse.json(concurso);
    }

    console.log("API GET /concursos: Parámetros no válidos o faltantes.");
    return NextResponse.json({ message: 'Parámetro requerido faltante.' }, { status: 400 });
  } catch (error: any) {
    console.error("API GET /concursos error:", error);
    return NextResponse.json({ message: error.message || 'Error en el servidor' }, { status: 500 });
  }
}

// 🛠 POST para crear nuevo concurso
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const nuevoConcurso = await crearConcurso(body);
    return NextResponse.json(nuevoConcurso, { status: 201 });
  } catch (error: any) {
    console.error("API POST /concursos error:", error);
    return NextResponse.json({ message: error.message || 'Error al crear concurso' }, { status: 500 });
  }
}

// 🛠 PUT para actualizar concurso existente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id_concurso, ...data } = body;

    if (!id_concurso) {
      return NextResponse.json({ message: "Falta el ID del concurso para editar." }, { status: 400 });
    }

    const concursoActualizado = await modificarConcurso(id_concurso, data);
    return NextResponse.json(concursoActualizado);
  } catch (error: any) {
    console.error("API PUT /concursos error:", error);
    return NextResponse.json({ message: error.message || 'Error al editar concurso' }, { status: 500 });
  }
}
