import { sql } from '@vercel/postgres'; 


export const getAdjudicaciones = async () => {
  try {
    
    const result = await sql`
      SELECT * FROM tipos_adjudicacion;
    `;
    return result.rows; 
    
  } catch (error) {
    console.log(error);
    throw error; 
  }
};

