//08 DE DICIEMBRE DE 2024

// Importa las herramientas necesarias de Next.js para manejar solicitudes y respuestas HTTP.
import { NextRequest, NextResponse } from 'next/server';

// Importa las funciones relacionadas con roles desde el servicio correspondiente.
import { getUsuarios, getUsuarioById, createUsuario, deleteUsuario, updateUsuario, updateContraseña} from '../../../services/usuarioservice';

import * as faceapi from 'face-api.js'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url); //// Crear un objeto URL para manejar los parámetros de la solicitud.
    const id = searchParams.get('id_usuario'); // Obtener el id de los parámetros de la URL
    const nomina = searchParams.get('nomina');

    if (id) {
      // Si existe el id, obtenemos solo ese usuario
      
      const usuario = await getUsuarioById(parseInt(id)); // Llamar a la función que obtiene el usuario por ID.
      if (!usuario) {
        // Si no se encuentra el usuario, devolvemos un error 404.
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
      }
      return NextResponse.json(usuario); // Si el usuario existe, devolverlo en la respuesta.
    }



    const usuarios = await getUsuarios(); // Si no hay id, traemos todos los usuarios
    return NextResponse.json(usuarios); // Devolver la lista de usuarios en la respuesta.
  } catch (error) {
    // Manejo de errores: Si ocurre un error, devolver un mensaje con estado 500.
    return NextResponse.json({ message: 'Error al obtener usuarios', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, apellidos, email, password, rol, nomina, emailUsuario, secretaria, sistemas} = await req.json();
    // Convertir el descriptor facial a JSON si es necesario (asegurando que es un Float32Array)
    const nuevoUsuario = await createUsuario(nombre, apellidos, email, password, rol, nomina, emailUsuario, secretaria, sistemas);
    return NextResponse.json(nuevoUsuario);
  } catch (error) {
    console.error('Error en POST /api/usuarios:', error);
    return NextResponse.json({ message: 'Error al crear usuario', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url); // obtiene los parámetros de la url
  const id = searchParams.get("usuarioId"); // obtiene "usuarioId"
  const email = searchParams.get("email"); // obtiene "usuarioId"


  if (!id) {
    return NextResponse.json(
      { message: "id no proporcionado" },
      { status: 400 }
    );
  }
  if (!email) {
    return NextResponse.json(
      { message: "email no proporcionado" },
      { status: 400 }
    );
  }

  const usuarioEliminado = await deleteUsuario(parseInt(id), email);

  if (!usuarioEliminado) {
    return NextResponse.json(
      { message: "usuario no encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "usuario eliminado correctamente" });
}


// export async function PUT(req: NextRequest) {

//   try {
//     const { id_usuario, nombre, apellido_paterno, apellido_materno, rol, nomina, email, password, emailUsuario } = await req.json();
    
//     if (!id_usuario) {
//       return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
//     }


//     if (password) {
//       const usuarioActualizado = await updateContraseña(id_usuario, { password, emailUsuario });
      
//       if (!usuarioActualizado) {
//         return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
//       }

//       return NextResponse.json(usuarioActualizado);
//     }
    
//     const usuarioActualizado = await updateUsuario(id_usuario, { nombre, apellido_paterno, apellido_materno, rol, nomina, email, emailUsuario}); 
//     if (!usuarioActualizado) {
//       return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
//     }

//     return NextResponse.json(usuarioActualizado);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: 'Error al actualizar usuario', error }, { status: 500 });
//   }
// }