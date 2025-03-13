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

