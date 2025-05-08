import { sql } from '@vercel/postgres'; 


export const getSecretarias = async () => {
  try {
    
    const result = await sql`
      SELECT * FROM secretarias;
    `;
    return result.rows; 
    
  } catch (error) {
    console.log(error);
    throw error; 
  }
};

export const getSecretariaById = async (secretaria: number) => {
  try {
    
    const result = await sql`
      SELECT * FROM secretarias WHERE id_secretaria= ${secretaria};
    `;
    return result.rows[0]; 
    
  } catch (error) {
    console.log(error);
    throw error; 
  }
};

