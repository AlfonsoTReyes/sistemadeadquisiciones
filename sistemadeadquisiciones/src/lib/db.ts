import { Pool } from 'pg';


const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT) || 5432,
});

// función sql que imita `@vercel/postgres`, ahora soporta parámetros en consultas normales
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const queryText = strings.reduce((prev, curr, i) => prev + `$${i}` + curr);
  return pool.query(queryText, values);
};

export default pool;
