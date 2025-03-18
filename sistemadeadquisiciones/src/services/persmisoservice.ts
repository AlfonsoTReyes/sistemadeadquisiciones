import { sql } from '@vercel/postgres';

const connectionString = process.env.POSTGRES_URL;

export const getPermiso = async () => {
  try {
    // Usamos sql directamente para hacer la consulta con INNER JOIN
    const result = await sql`
      SELECT * FROM permisos WHERE estatus= true ORDER BY id_permiso ASC;
    `;
    return result.rows;
    
  } catch (error) {
    throw error;
  }
};

// El resto de las funciones permanece igual.
export const createPermiso = async (nombre: string, descripcion: string, sistema: string) => {
  try {
    // Usamos sql para insertar el nuevo usuario}
    const result = await sql`
      INSERT INTO permisos (nombre_permiso, descripcion, sistema, estatus) 
      VALUES (${nombre}, ${descripcion}, ${sistema}, 'true') 
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Función para obtener un usuario por ID
export const getPermisoById = async (id: number) => {
    try {
      const result = await sql`
        SELECT * FROM permisos WHERE id_permiso = ${id};
      `;
      return result.rows[0]; // Devuelve el rol encontrado
    } catch (error) {
      throw error;
    }
};
  

// Función para modificar un usuario
export const updatePermiso = async (id: number, permisoData: { nombre: string, descripcion: string, sistema: string}) => {
    try {
      const { nombre, descripcion, sistema } = permisoData;
      console.log(nombre, descripcion, sistema);
  
      // Actualiza el rol directamente usando el id
      const result = await sql`
        UPDATE permisos 
        SET nombre_permiso = ${nombre}, descripcion = ${descripcion}, sistema = ${sistema}
        WHERE id_permiso = ${id} 
        RETURNING *; 
      `;
  
      return result.rows[0]; // Devuelve el rol actualizado
    } catch (error) {
      console.error("Error en updatePermiso:", error);
      throw error;
    }
};

export const deletePermiso = async (id: number) => {
  try {
    const result = await sql`
      DELETE FROM permisos WHERE id_permiso = ${id}`;
    const filasAfectadas = result.rowCount ?? 0;
    return filasAfectadas > 0;
  } catch (error) {
    throw error;
  }
};


export const getPermissionsByRole = async (roleId: number) => {
  try {
    // Consulta SQL para obtener los permisos de un rol
    const result = await sql
      `SELECT p.nombre FROM permisos p
       JOIN rolpermiso rp ON p.id_permiso = rp.id_permiso WHERE rp.id_rol = ${roleId} AND rp.estatus = 'true'`;
       
    return result.rows.map(row => row.nombre);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
  }
}