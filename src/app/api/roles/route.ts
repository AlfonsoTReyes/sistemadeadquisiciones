// 08 DE DICIEMBRE DE 2024

// Importa las herramientas necesarias de Next.js para manejar solicitudes y respuestas HTTP.
import { NextRequest, NextResponse } from 'next/server';

// Importa las funciones relacionadas con roles desde el servicio correspondiente.
import { getRol, getRolById, createRol, updateRol} from '../../../services/rolservice';

// Se define una función asincrónica que recupera todos los roles
export async function GET(req: NextRequest) {
  try {
    // Extrae los parámetros de búsqueda de la URL de la solicitud.
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id_rol'); // Obtener el id de los parámetros de la URL

    if (id) {
      // Si el parámetro 'id_rol' está presente, busca un rol específico en la base de datos.
      const rol = await getRolById(parseInt(id)); //// Llama a la función getRolById con el id convertido a número.
      if (!rol) {
        // Si no se encuentra el rol, responde con un mensaje y un código de estado 404 (No encontrado).
        return NextResponse.json({ message: 'Rol no encontrado' }, { status: 404 });
      }
      // Si se encuentra el rol, responde con el rol en formato JSON.
      return NextResponse.json(rol);
    }
    // Si no se proporciona 'id_rol', obtiene todos los roles llamando a la función getRol.
    const roles = await getRol();
    return NextResponse.json(roles); // Responde con una lista de roles en formato JSON.
  } catch (error) {
    // Captura cualquier error que ocurra y responde con un mensaje de error y un código de estado 500 (Error del servidor).
    return NextResponse.json({ message: 'Error al obtener roles', error }, { status: 500 });
  }
}

// Se define una función POST para crear un rol.
export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, sistema} = await req.json(); //Extrae el campo nombre del cuerpo de la solicitud.
    const nuevoRol = await createRol(nombre, descripcion, sistema); //Llama a la función createRol para crear un nuevo rol en la base de datos.
    return NextResponse.json(nuevoRol); //Devuelve una respuesta HTTP con el cuerpo en formato JSON que contiene el registro del rol creado.
  } catch (error) { //Captura cualquier error que ocurra dentro del bloque try
    console.error('Error en POST /api/roles:', error); //Registra el error en la consola para depuración y monitoreo.
    //Incluye un mensaje informativo ('Error al crear rol') y detalles del error.
    return NextResponse.json({ message: 'Error al crear rol', error }, { status: 500 });
  }
}

// Se declara una función asíncrona llamada PUT, que manejará solicitudes HTTP de tipo PUT.
export async function PUT(req: NextRequest) {
  try {
    //Extrae los valores id_rol y nombre del cuerpo de la solicitud. La función req.json() convierte los datos JSON enviados por el cliente en un objeto JavaScript.
    const { id_rol, nombre, descripcion, sistema} = await req.json();

    if (!id_rol) {//Verifica si id_rol no fue proporcionado en la solicitud.
      //Si falta, responde con un estado HTTP 400 (Bad Request) y un mensaje indicando que el ID no fue proporcionado.
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
    }

    //Llama a la función updateRol, pasándole el identificador del rol (id_rol) y un objeto con el nuevo nombre del rol ({ nombre }).
    const rolActualizado = await updateRol(id_rol, { nombre, descripcion, sistema}); 
    
    if (!rolActualizado) {//Verifica si la variable rolActualizado está vacía, lo que indica que el rol con el ID proporcionado no existe.
      //Responde con un estado HTTP 404 (Not Found) y un mensaje indicando que el rol no fue encontrado.
      return NextResponse.json({ message: 'Rol no encontrado' }, { status: 404 });
    }
    return NextResponse.json(rolActualizado); //Si la actualización fue exitosa, responde con el objeto del rol actualizado en formato JSON.
  } catch (error) { //Captura cualquier error que ocurra en el bloque try.
    return NextResponse.json({ message: 'Error al actualizar rol', error }, { status: 500 });
  }
}