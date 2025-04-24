// Importa las herramientas necesarias de Next.js para manejar solicitudes y respuestas HTTP.
import { NextRequest, NextResponse } from 'next/server';

// Importa las funciones relacionadas con roles desde el servicio correspondiente.
import { getAdjudicaciones,getAdjudicacionId, getAdjudicacionTipo } from '../../../services/adjudicacioneservice';

// Se define una función asincrónica que recupera todos los roles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url); //// Crear un objeto URL para manejar los parámetros de la solicitud.
    const adjudicacion = searchParams.get('id');
    const adquisicion = searchParams.get('adquisicion');

    if (adjudicacion) {
      const adj = await getAdjudicacionId(adjudicacion); // Llamar a la función que obtiene el usuario por ID.
      if (!adj) {
        // Si no se encuentra el usuario, devolvemos un error 404.
        return NextResponse.json({ message: 'Adjudicación no encontrado' }, { status: 404 });
      }
      return NextResponse.json(adj); // Si el usuario existe, devolverlo en la respuesta.
    }
    
    if (adquisicion) {
      const adj = await getAdjudicacionTipo(adquisicion); // Llamar a la función que obtiene el usuario por ID.
      if (!adj) {
        // Si no se encuentra el usuario, devolvemos un error 404.
        return NextResponse.json({ message: 'Adjudicación no encontrado' }, { status: 404 });
      }
      return NextResponse.json(adj); // Si el usuario existe, devolverlo en la respuesta.
    }

    const adjudicaciones = await getAdjudicaciones();
    return NextResponse.json(adjudicaciones); // Responde con una lista de roles en formato JSON.
  } catch (error) {
    // Captura cualquier error que ocurra y responde con un mensaje de error y un código de estado 500 (Error del servidor).
    return NextResponse.json({ message: 'Error al obtener adjudicaciones', error }, { status: 500 });
  }
}

