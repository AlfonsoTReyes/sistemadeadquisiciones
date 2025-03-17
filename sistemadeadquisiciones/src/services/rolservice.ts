// 08 DE DICIEMBRE DE 2024

//Importa esta libreria para interactuar con la tabla roles en una base de datos PostgreSQL.
import { sql } from '@vercel/postgres'; 

const connectionString = process.env.POSTGRES_URL;

//Recupera todos los registros de la tabla roles.
export const getRol = async () => {
  try {
    // Usamos sql directamente para hacer la consulta y recuperar todos los datos de la tabla ROLES
    const result = await sql`
      SELECT * FROM roles;
    `;
    return result.rows; //Devuelve un arreglo de objetos, donde cada objeto representa un rol.
    
  } catch (error) {
    console.log(error);
    throw error; //Lanza errores capturados para manejo externo.
  }
};

// El resto de las funciones permanece igual.
export const createRol = async (nombre: string, descripcion: string, sistema: string) => {
  try {
    // Usamos sql para insertar el nuevo usuario}
    const result = await sql`
      INSERT INTO roles (nombre, descripcion, sistema) 
      VALUES (${nombre}, ${descripcion}, ${sistema}) 
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    throw error; //Lanza errores capturados para manejo externo.
  }
};

// Función para obtener un usuario por ID
export const getRolById = async (id: number) => {
    try {
      //Consulta un rol específico según su id_rol.
      const result = await sql`
        SELECT id_rol, nombre, descripcion, sistema FROM roles WHERE id_rol = ${id};
      `;
      return result.rows[0]; // Devuelve el rol encontrado
    } catch (error) {
      throw error; //Lanza errores capturados para manejo externo.
    }
};
  

// Función para modificar un usuario
export const updateRol = async (id: number, rolData: { nombre: string, descripcion: string, sistema: string }) => {
    try {
      const { nombre, descripcion, sistema  } = rolData;
  
      // Actualiza el rol directamente usando el id
      const result = await sql`
        UPDATE roles 
        SET nombre = ${nombre}, descripcion = ${descripcion}, sistema = ${sistema}
        WHERE id_rol = ${id} 
        RETURNING *; 
      `;
  
      return result.rows[0]; // Devuelve el rol actualizado
    } catch (error) {
      console.error("Error en updateRol:", error);
      throw error; //Lanza errores capturados para manejo externo.
    }
};