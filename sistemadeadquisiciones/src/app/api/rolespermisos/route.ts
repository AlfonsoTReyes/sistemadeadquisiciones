//08 DE DICIEMBRE DE 2024

// Importa las herramientas necesarias de Next.js para manejar solicitudes y respuestas HTTP.
import { NextRequest, NextResponse } from 'next/server';

// Importa las funciones relacionadas con roles desde el servicio correspondiente.
import { asignarPermisoARol, getRolPermisos, getRolPermisoById, verificarPermisoExistente, actualizarPermiso } from '../../../services/rolpermisosservice';


// Manejo del método GET
// Se define una función asincrónica que recupera todos los permisos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url); // Extrae los parámetros de búsqueda de la URL de la solicitud.
    const id_rol = searchParams.get('rolId'); // Obtener el id de los parámetros de la URL
    if (id_rol) { //Verifica si id_rol tiene un valor.
      const rolPermiso = await getRolPermisoById(Number(id_rol)); //Llama a la función getRolPermisoById, pasándole el id_rol convertido a un número.
      if (!rolPermiso) { //Verifica si la función getRolPermisoById devolvió null o undefined.
        //Si no se encontró el rol, responde con un mensaje de error y un código HTTP 404 (No encontrado).
        return NextResponse.json({ message: 'Rol no encontrado' }, { status: 404 });
      }
      //Si el rol fue encontrado, responde con los datos del rol y permisos en formato JSON.
      return NextResponse.json(rolPermiso);
    }

    //Se llama a la función getRolPermisos, que devuelve todos los roles con sus permisos.
    const rolPermisos = await getRolPermisos();
    return NextResponse.json(rolPermisos); //Devuelve la lista de todos los roles y sus permisos en formato JSON.
  } catch (error) { //Captura errores generados en el bloque try.
    //Responde con un mensaje de error y un código HTTP 500 (Error interno del servidor).
    return NextResponse.json({ message: 'Error al obtener permisos', error }, { status: 500 });
  }
}

// Manejo del método PUT
export async function PUT(req: NextRequest) {
  try {
    const { id_rol, permisos } = await req.json(); //Extrae las propiedades id_rol (ID del rol) y permisos (lista de permisos) del cuerpo de la solicitud.
    // Validación de los datos
    if (!Array.isArray(permisos) || typeof id_rol !== 'number') {
      //Devuelve una respuesta JSON con un error y un código de estado 400 (solicitud incorrecta).
      return NextResponse.json({ error: 'Datos incompletos o inválidos' }, { status: 400 });
    }

    // Verificar que todos los permisos tengan la estructura correcta
    for (const permiso of permisos) { //Recorre cada objeto permiso en el arreglo permisos
      if (typeof permiso.id_permiso !== 'number' || typeof permiso.estatus !== 'boolean') {
        return NextResponse.json({ error: 'Datos de permisos inválidos' }, { status: 400 });
      }
    }

    // Lógica para manejar la actualización o alta de permisos
    for (const permiso of permisos) {
      // Comprobamos si el permiso ya está asignado al rol
      const permisoExistente = await verificarPermisoExistente(id_rol, permiso.id_permiso);
      
      if (permisoExistente) {
        await actualizarPermiso(id_rol, permiso.id_permiso, permiso.estatus);
      } else {

        // Si no existe, damos de alta el permiso
        await asignarPermisoARol(id_rol, permiso.id_permiso, permiso.estatus);
      }
    }

    // Respuesta de éxito
    return NextResponse.json({ message: 'Permisos actualizados o dados de alta exitosamente' }, { status: 200 });
  } catch (error) {
    // Manejo de errores
    return NextResponse.json({ error: 'Error al procesar los permisos' }, { status: 500 });
  }
}
