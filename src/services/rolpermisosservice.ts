// 08 DE DICIEMBRE DE 2024

//Importa la función sql de la librería @vercel/postgres para interactuar con la base de datos PostgreSQL.
import { sql } from '@vercel/postgres';

// Se define una función asincrónica que recupera todos los permisos relacionados con roles en la base de datos.
export const getRolPermisos = async () => {
  try {
    //Se realiza una consulta SQL que combina datos de tres tablas: rolpermiso, roles, y permisos.
    const result = await sql`
      SELECT rp.id_rol, rp.id_permiso, rp.estatus, r.nombre as nombre_rol, p.nombre as nombre_permiso 
      FROM rolpermiso rp
      INNER JOIN roles r ON rp.id_rol = r.id_rol
      INNER JOIN permisos p ON rp.id_permiso = p.id_permiso;
    `;
    return result.rows; //Devuelve un arreglo de objetos que representa cada fila obtenida de la consulta SQL.
  } catch (error) { //Captura cualquier error que ocurra durante la ejecución del bloque try.
    throw new Error('Error al obtener los permisos de rol'); // lanza una nueva excepción con un mensaje.
  }
};

//Se define una función asíncrona llamada getRolPermisoById que acepta un parámetro id_rol (un número).
// (Obtener los permisos de un rol específico)
export const getRolPermisoById = async (id_rol: number) => {
  try {
    //Realiza una consulta SQL a la base de datos para recuperar los permisos asociados al rol con el ID especificado.
    const result = await sql`
      SELECT rp.id_rol, rp.id_permiso, rp.estatus, r.nombre as nombre_rol, p.nombre_permiso as nombre_permiso 
      FROM rolpermiso rp
      INNER JOIN roles r ON rp.id_rol = r.id_rol
      INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
      WHERE rp.id_rol = ${id_rol}
      order by rp.id_rol;
    `;
    return result.rows; //Devuelve las filas obtenidas como resultado de la consulta SQL.
  } catch (error) { //Captura cualquier error que ocurra durante la ejecución del bloque try.
    //Lanza un nuevo error con un mensaje personalizado si ocurre un problema.
    throw new Error('Error al obtener los permisos para el rol especificado');
  }
};

//Declara y exporta una función asíncrona que recibirá dos parámetros
export const verificarPermisoExistente = async (id_rol: number, id_permiso: number) => {
  try{
    //Busca en la tabla rolpermiso todos los registros donde:
    // (id_rol coincida con el valor proporcionado en el parámetro id_rol.
    // id_permiso coincida con el valor proporcionado en el parámetro id_permiso.)
    const result =  await sql`SELECT * FROM rolpermiso WHERE id_rol = ${id_rol} AND id_permiso = ${id_permiso};`;
    return result.rows; //Devuelve el arreglo rows, que contiene las filas (registros) encontradas por la consulta.
  }catch(error){ //Inicia el bloque catch para manejar errores que puedan ocurrir en la ejecución del bloque try.
    //Si ocurre un error, lanza una excepción con un mensaje personalizado
    throw new Error('Error al obtener los permisos para el rol especificado');
  }
}

//Define una función asíncrona exportada que recibe tres parámetros
// para ASIGNAR un permiso en un rol específico
export const asignarPermisoARol = async (id_rol: number, id_permiso: number, estatus: boolean) => {
    try {
      //Realiza una consulta para INSERTAR una relación entre un rol y un permiso en la tabla rolpermiso.
      await sql`
        INSERT INTO rolpermiso (id_rol, id_permiso, estatus)
        VALUES (${id_rol}, ${id_permiso}, ${estatus})
        ON CONFLICT (id_rol, id_permiso)
        DO UPDATE SET estatus = ${estatus};
      `;
    } catch (error) { //Captura cualquier error que ocurra durante la ejecución del bloque try.
      throw new Error('Error al asignar el permiso al rol'); //Lanza una nueva excepción con el mensaje: "Error al asignar el permiso al rol".
    }
};

//Declara una función asíncrona que ACTUALIZA un permiso para un rol en la tabla ROLPERMISO.
export const actualizarPermiso = async (id_rol: number, id_permiso: number, estatus: boolean) => {
  try {
    //Ejecuta una consulta SQL para actualizar el campo estatus de la relación rolpermiso que coincide con los valores de id_rol e id_permiso.
    const result = await sql`
      UPDATE rolpermiso
      SET estatus = ${estatus}
      WHERE id_rol = ${id_rol} AND id_permiso = ${id_permiso}
      RETURNING *;
    `;

    //Comprueba si no se encontró ninguna relación que coincidiera con id_rol e id_permiso en la consulta de actualización.
    if (result.rows.length === 0) {
      //Si no se actualizó ninguna fila, inserta una nueva relación en la tabla rolpermiso 
      // con los valores proporcionados (id_rol, id_permiso, estatus).
      const insertResult = await sql`
        INSERT INTO rolpermiso (id_rol, id_permiso, estatus)
        VALUES (${id_rol}, ${id_permiso}, ${estatus})
        RETURNING *;
      `;
      return insertResult.rows[0]; // Devolver la fila insertada
    }
    return result.rows[0]; //Si la fila fue actualizada en la consulta inicial, devuelve la primera fila del resultado.

  } catch (error) { //Captura cualquier error ocurrido durante la ejecución de las consultas.
    //Lanza un nuevo error con un mensaje descriptivo para que sea manejado externamente.
    throw new Error('Error al actualizar el permiso al rol');
  }
}

  