//26 Febrero 2025

//Importa esta libreria para interactuar con la tabla roles en una base de datos PostgreSQL.
import { sql } from '@vercel/postgres';

//Recupera TODOS los registros de la tabla Usuarios.
export const getUsuarios = async () => {
  try {
    // Usamos sql directamente para hacer la consulta con INNER JOIN entre las tablas USUARIOS y ROLES
    const result = await sql`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.nomina,
        u.password,
        u.estatus,
        r.nombre AS rol,  
        u.secretaria
      FROM 
        usuarios u
      INNER JOIN 
        roles r ON u.id_rol = r.id_rol; 
    `;
    return result.rows; //Devuelve un arreglo de objetos, donde cada objeto representa un rol.
  } catch (error) {
    throw error; ////Lanza errores capturados para manejo externo.
  }
};

//Función para CREAR/INSERTAR un nuevo Usuario en la tabla Usuarios
export const createUsuario = async (nombre: string, email: string, password: string, rol: string, nomina: string, descriptorJSON: string, emailUsuario: string, secretaria: string) => {
  try {
    // Usamos sql para insertar el nuevo usuario a la base de datos
    const result = await sql`
      INSERT INTO usuarios (nombre, email, password, id_rol, nomina, rostro, secretaria) 
      VALUES (${nombre}, ${email}, ${password}, ${rol}, ${nomina}, ${descriptorJSON}, ${secretaria}) 
      RETURNING *;
    `;

    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, datos_nuevos)
    VALUES (
        ${'usuarios'}, 
        ${`Se dio de alta un nuevo usuario ${result.rows[0].id_usuario}`}, 
        ${emailUsuario}, 
        ${`Se dio de alta nombre: ${nombre}, email: ${email}, password: ${password}, id_rol: ${rol}, nomina: ${nomina}, descriptorJSON: ${descriptorJSON}, secretaria: ${secretaria}`}
    )`;
    return result.rows[0]; //Devuelve el registro recién creado.
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};

// Función para OBTENER los datos de un Usuario por ID
export const getUsuarioById = async (id: number) => {
  try {
    //Consultamos la Base de Datos, para traer devuelta toda la información de un usuario específico 
    // junto con su rol, según su id_usuario
    const result = await sql`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.email,
        u.nomina,
        u.password,
        u.id_rol
      FROM 
        usuarios u
      INNER JOIN 
        roles r ON u.id_rol = r.id_rol
      WHERE 
        u.id_usuario = ${id};
    `;
    return result.rows[0]; // Devuelve el primer usuario encontrado
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};

// Función para MODIFICAR un Usuario
export const updateUsuario = async (id: number, usuarioData: { nombre: string, email: string, rol: string, nomina: string, emailUsuario: string, secretaria: string }) => {
  try {
    //Extrae la propiedad nombre,email,rol,nomina del objeto usuarioData para su uso directo en la consulta SQL.
    const { nombre, email, rol, nomina, emailUsuario, secretaria } = usuarioData;

    //Actualizar el usuario con el id_rol obtenido
    const result = await sql`
      UPDATE usuarios 
      SET nombre = ${nombre}, email = ${email}, id_rol = ${rol}, nomina = ${nomina}, secretaria = ${secretaria}
      WHERE id_usuario = ${id} 
      RETURNING *; 
    `;

    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, datos_nuevos)
    VALUES (
        ${'usuarios'}, 
        ${`Se actualizo un usuario ${id}`}, 
        ${emailUsuario}, 
        ${`Se actualizo nombre: ${nombre}, email: ${email}, id_rol: ${rol}, nomina: ${nomina}, secretaria = ${secretaria}`}
    )`;
    return result.rows[0]; // Devuelve el usuario actualizado
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};


//Función para CREAR/INSERTAR un nuevo Usuario en la tabla Usuarios
export const updateRostro = async (id: number, descriptorJSON: string, emailUsuario: string) => {
  try {
    console.log(id, descriptorJSON);
    // Usamos sql para insertar el nuevo usuario a la base de datos
    const result = await sql`
      UPDATE usuarios 
      SET rostro = ${descriptorJSON}
      where id_usuario = ${id}
      RETURNING *;
    `;

    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, datos_nuevos)
    VALUES (
        ${'usuarios'}, 
        ${`Se actualizo el rostro facial ${id}`}, 
        ${emailUsuario}, 
        ${`Se actualizo rostro = ${descriptorJSON}`}
    )`;
    return result.rows[0]; //Devuelve el registro recién creado.
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};

//Función para ACTUALIZAR/MODIFICAR la contraseña de un Usuario específico.
export const updateContraseña= async (id: number, usuarioData: { password: string, emailUsuario: string }) => {
  try {
    //Extrae la propiedad password del objeto usuarioData para su uso directo en la consulta SQL.
    const { password, emailUsuario } = usuarioData;

    //Realiza una consulta SQL para actualizar la contraseña del usuario identificado por el id.
    const result = await sql`
      UPDATE usuarios 
      SET password = ${password}
      WHERE id_usuario = ${id} 
      RETURNING *; 
    `;

    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, datos_nuevos)
    VALUES (
        ${'usuarios'}, 
        ${`Se actualizo la contraseña del usuario ${id}`}, 
        ${emailUsuario}, 
        ${`Se actualizo contraseña: ${password}`}
    )`;
    return result.rows[0]; // Devuelve el usuario actualizado
  } catch (error) {
    console.error("Error en updateUsuario:", error);
    throw error; //Lanza errores capturados para manejo externo.
  }
};

// Funicón para ELIMINAR un usuario específico de la tabla Usuarios
export const deleteUsuario = async (id: number, email: string) => {
  try {
    //Ejecuta una consulta SQL para eliminar un registro de la tabla usuarios cuyo id_usuario 
    // coincida con el valor proporcionado en el parámetro id.
    const result = await sql`
      UPDATE usuarios
      SET estatus='false' WHERE id_usuario = ${id}`;
      
    
    //Captura la cantidad de filas afectadas por la operación DELETE
    const filasAfectadas = result.rowCount ?? 0;

    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, datos_nuevos)
    VALUES (
        ${'usuarios'}, 
        ${`Se elimino un usuario`}, 
        ${email}, 
        ${`Se elimino el usuario con id : ${id}`}
    )`;

    return filasAfectadas > 0; //Devuelve un valor booleano.
    // {Si filasAfectadas es mayor a 0, indica que se eliminó al menos un registro, por lo que retorna true.}
    // {Si filasAfectadas es igual a 0, significa que no se encontró ningún registro con el id proporcionado, 
    //  por lo que retorna false.}
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};