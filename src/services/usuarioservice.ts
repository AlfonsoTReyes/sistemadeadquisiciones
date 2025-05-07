//26 Febrero 2025

//Importa esta libreria para interactuar con la tabla roles en una base de datos PostgreSQL.
import { sql } from '@vercel/postgres';

//Recupera TODOS los registros de la tabla Usuarios.
export const getUsuarios = async () => {
  try {
    // Llamamos al procedimiento almacenado en PostgreSQL
    const result = await sql`
    SELECT 
        u.id_usuario,
        u.nombre AS nombre_u,
        u.email,
        u.nomina,
        u.password,
        u.estatus,
        r.nombre AS rol,  
        s.nombre AS nombre_s,
        d.nombre AS nombre_d,
        u.puesto
    FROM 
        usuarios u
    INNER JOIN 
        roles r ON u.id_rol = r.id_rol
    INNER JOIN 
        secretarias s ON u.id_secretaria = s.id_secretaria
    INNER JOIN 
        dependencias d ON u.id_dependencia = d.id_dependencia;

    `;
    return result.rows;
  } catch (error) {
    console.log(error);

    throw error; // Lanza errores capturados para manejo externo.
  }
};


//Función para CREAR/INSERTAR un nuevo Usuario en la tabla Usuarios
export const createUsuario = async (nombre: string, apellidos: string, email: string, password: string, rol: string, nomina: string, emailUsuario: string, secretaria: string, sistemas: string, dependencia: string, puesto: string) => {
  try {

    const result = await sql`
    INSERT INTO usuarios (nombre, apellidos, email, password, id_rol, nomina, id_secretaria, id_dependencia, puesto, sistema, estatus, created_at) 
    VALUES (${nombre}, ${apellidos}, ${email}, ${password}, ${rol}, ${nomina}, ${secretaria}, ${dependencia}, ${puesto}, ${sistemas}, true, NOW()) 
    RETURNING *;
  `;
/*

    // Construcción segura del mensaje de bitácora
    const mensajeBitacora = `Se dio de alta un nuevo usuario: 
    Nombre: ${nombre}, 
    Apellidos: ${apellidos}, 
    Nómina: ${nomina}, 
    Email: ${email}, 
    Secretaria: ${secretaria}, 
    Sistema: ${sistemas}, 
    Rol: ${rol}`;
    // Consulta SQL con valores seguros
    const bitacora = await sql`
  INSERT INTO bitacora_sistema(
	tabla_afectada, operacion, usuario, informacion, created_at, updated_at)
	VALUES (${'usuarios'}, ${'alta'}, ${emailUsuario}, ${mensajeBitacora}, now(), now() );
  `;
*/
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
        u.nombre AS nombre_u,
        u.apellidos,
        u.email,
        u.nomina,
        u.password,
        u.estatus,
        r.nombre AS rol,  
        s.nombre AS nombre_s,
        d.nombre AS nombre_d,
        u.puesto,
        u.id_rol,
        u.id_secretaria,
        u.id_dependencia,
        u.sistema
    FROM 
        usuarios u
    INNER JOIN 
        roles r ON u.id_rol = r.id_rol
    INNER JOIN 
        secretarias s ON u.id_secretaria = s.id_secretaria
    INNER JOIN 
        dependencias d ON u.id_dependencia = d.id_dependencia
    WHERE id_usuario= ${id};
    `;
    return result.rows[0]; // Devuelve el primer usuario encontrado
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};

// Función para MODIFICAR un Usuario
export const updateUsuario = async (id: number, usuarioData: { nombre: string, apellidos: string, email: string, nomina: string, secretaria: string, dependencia: string, puesto: string, sistema: string, rol: string, emailUsuario: string }) => {
  try {
    //Extrae la propiedad nombre,email,rol,nomina del objeto usuarioData para su uso directo en la consulta SQL.
    const { nombre, apellidos, email, nomina, secretaria, dependencia, puesto, sistema, rol, emailUsuario } = usuarioData;

    //Actualizar el usuario con el id_rol obtenido
    const result = await sql`
      UPDATE usuarios 
      SET nombre = ${nombre}, apellidos= ${apellidos}, email = ${email}, id_rol = ${rol}, nomina = ${nomina}, id_secretaria = ${secretaria}, id_dependencia = ${dependencia}, puesto=${puesto}, sistema=${sistema}, updated_at=NOW()
      WHERE id_usuario = ${id} 
      RETURNING *; 
    `;

/*
    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, informacion, created_at, updated_at)
    VALUES (
        ${'usuarios'}, 
        ${`modificación`}, 
        ${emailUsuario}, 
        ${`Se actualizo nombre = ${nombre}, apellidos= ${apellidos}, email = ${email}, id_rol = ${rol}, nomina = ${nomina}, id_secretaria = ${secretaria}, id_dependencia = ${dependencia}, puesto=${puesto}, sistema=${sistema} con el id ${result.rows[0].id_usuario}`},
        NOW(),
        NOW()
    )`; */
    return result.rows[0]; // Devuelve el usuario actualizado
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};


//Función para CREAR/INSERTAR un nuevo Usuario en la tabla Usuarios
export const updateRostro = async (id: number, rostro: string, emailUsuario: string) => {
  try {
    console.log(id, rostro);
    // Usamos sql para insertar el nuevo usuario a la base de datos
    const result = await sql`
      UPDATE usuarios 
      SET rostro = ${rostro}
      where id_usuario = ${id}
      RETURNING *;
    `;
/*
    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, informacion,  created_at, updated_at)
    VALUES (
        ${'usuarios'}, 
        ${`Actualización rostro ${id}`}, 
        ${emailUsuario}, 
        ${`Se actualizo rostro = ${rostro},
        NOW(),
        NOW()`
      }
    )`;
*/
    return result.rows[0]; //Devuelve el registro recién creado.
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};

//Función para ACTUALIZAR/MODIFICAR la contraseña de un Usuario específico.
export const updateContraseña = async (id: number, usuarioData: { password: string, emailUsuario: string }) => {
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
    /*
        const bitacora = await sql`
        INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, informacion, created_at, updated_at)
        VALUES (
            ${'usuarios'}, 
            ${`Actualización de contraseña`}, 
            ${emailUsuario}, 
            ${`Se actualizo contraseña: ${password}`},
            NOW(),
            NOW()
        )`;
      */
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
/*
    const bitacora = await sql`
    INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, datos_nuevos)
    VALUES (
        ${'usuarios'}, 
        ${`Se elimino un usuario`}, 
        ${email}, 
        ${`Se elimino el usuario con id : ${id}`}
    )`;
*/
    return filasAfectadas > 0; //Devuelve un valor booleano.
    // {Si filasAfectadas es mayor a 0, indica que se eliminó al menos un registro, por lo que retorna true.}
    // {Si filasAfectadas es igual a 0, significa que no se encontró ningún registro con el id proporcionado, 
    //  por lo que retorna false.}
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};


