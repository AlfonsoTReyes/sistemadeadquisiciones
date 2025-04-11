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

export const getAdjudicacionId = async (id: string) => {
  try {
    
    const result = await sql`
      SELECT * FROM tipos_adjudicacion WHERE id_tipo_adjudicacion = ${id};
    `;
    return result.rows[0]; 
    
  } catch (error) {
    console.log(error);
    throw error; 
  }
};


