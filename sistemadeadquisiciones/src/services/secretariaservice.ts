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

