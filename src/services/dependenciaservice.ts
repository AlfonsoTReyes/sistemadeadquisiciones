import { sql } from '@vercel/postgres'; 


export const getDependencias = async () => {
  try {
    
    const result = await sql`
      SELECT * FROM dependencias;
    `;
    return result.rows; 
    
  } catch (error) {
    console.log(error);
    throw error; 
  }
};

export const getDependenciasById = async (dependencia: number) => {
  try {
    
    const result = await sql`
      SELECT nomenclatura FROM dependencias WHERE id_dependencia=${dependencia};
    `;
    return result.rows[0]; 
    
  } catch (error) {
    console.log(error);
    throw error; 
  }
};

