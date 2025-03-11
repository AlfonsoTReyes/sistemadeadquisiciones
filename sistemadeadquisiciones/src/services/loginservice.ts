import { sql } from '@vercel/postgres'; // Importa el cliente de Vercel


export const getUserByEmail = async (email: string) => {
    try {
        console.log("hola mundo");
        // Llamamos al procedimiento almacenado en la base de datos
        const result = await sql`
            SELECT * FROM obtener_usuario_por_email(${email});
        `;
        return result.rows[0]; // Devuelve el usuario encontrado
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        throw error;
    }
};


export const getAllUsers = async () => {
    try {
        const result = await sql`SELECT * FROM usuarios where estatus=true;`;
        return result.rows;  // Devuelve todos los usuarios
    } catch (error) {
        console.error('Error en la consulta a la base de datos:', error);
        throw error;
    }
};


export const inputBitacora = async (email: string, operacion: string, tabla_afectada: string, datos_nuevos: string) => {
    try {
        console.log(tabla_afectada, operacion, email, datos_nuevos);
        const result = await sql`
        INSERT INTO bitacora_sistema (tabla_afectada, operacion, usuario, datos_nuevos)
          VALUES (
              ${tabla_afectada}, 
              ${operacion}, 
              ${email}, 
              ${datos_nuevos}
          )
        `;
        return result.rows;  // Devuelve todos los usuarios
    } catch (error) {
        console.error('Error en la consulta a la base de datos:', error);
        throw error;
    }
};
