// services/folioservice.ts
import { sql } from "@vercel/postgres";

export const obtenerUltimoFolioPorSecretaria = async (idSecretaria: number) => {
    const result = await sql`
      SELECT contador
      FROM folio_secretarias
      WHERE id_secretaria = ${idSecretaria}
      ORDER BY created_at DESC
      LIMIT 1
    `;
  
    const ultimo = result.rows[0];
    const nuevoContador = (ultimo?.contador ?? 0) + 1;
    return nuevoContador;
  };
  

export const obtenerFolioPorId = async (id: number) => {
  const result = await sql`SELECT * FROM folio_secretarias WHERE id = ${id}`;
  return result.rows[0];
};

export const crearFolio = async ({ folio, descripcion, contador, id_secretaria }: any) => {
  const result = await sql`
    INSERT INTO folio_secretarias (folio, descripcion, contador, id_secretaria)
    VALUES (${folio}, ${descripcion}, ${contador}, ${id_secretaria})
    RETURNING *
  `;
  return result.rows[0];
};

export const actualizarFolio = async (id: number, { folio, descripcion, contador, id_secretaria }: any) => {
  const result = await sql`
    UPDATE folio_secretarias
    SET folio = ${folio}, descripcion = ${descripcion}, contador = ${contador}, id_secretaria = ${id_secretaria}, update_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
};

export const eliminarFolio = async (id: number) => {
  const result = await sql`DELETE FROM folio_secretarias WHERE id = ${id} RETURNING *`;
  return result.rows[0];
};
