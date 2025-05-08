// Importa las herramientas necesarias de Next.js para manejar solicitudes y respuestas HTTP.
import { NextRequest, NextResponse } from 'next/server';

// Importa las funciones relacionadas con roles desde el servicio correspondiente.
import { getSecretarias,getSecretariaById } from '../../../services/secretariaservice';

// Se define una función asincrónica que recupera todos los roles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idSecretaria = searchParams.get("idSecretaria");

    if (idSecretaria) {
      const folio = await getSecretariaById(parseInt(idSecretaria));
      if (!folio) {
        return NextResponse.json({ message: "Folio no encontrado" }, { status: 404 });
      }
      return NextResponse.json(folio);
    }
    
    const roles = await getSecretarias();
    return NextResponse.json(roles); // Responde con una lista de roles en formato JSON.
  } catch (error) {
    // Captura cualquier error que ocurra y responde con un mensaje de error y un código de estado 500 (Error del servidor).
    return NextResponse.json({ message: 'Error al obtener roles', error }, { status: 500 });
  }
}

