import { sql } from "@vercel/postgres";

export const guardarDocumentoUsuarioAdicional = async ({
  id_proveedor,
  tipo_documento,
  nombre_original,
  ruta_archivo,
  id_usuario,
  estatus
}: {
  id_proveedor: number;
  tipo_documento: string;
  nombre_original: string;
  ruta_archivo: string;
  id_usuario: number;
  estatus: string;
}) => {
  try {
    const result = await sql`
      INSERT INTO documentos_proveedor (
        id_proveedor,
        tipo_documento,
        nombre_original,
        ruta_archivo,
        id_usuario,
        estatus,
        created_at,
        updated_at
      ) VALUES (
        ${id_proveedor},
        ${tipo_documento},
        ${nombre_original},
        ${ruta_archivo},
        ${id_usuario},
        ${estatus},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al guardar documento adicional:", error);
    throw error;
  }
};

export const obtenerDocumentosPorProveedor = async (id_proveedor: number) => {
  try {
    const result = await sql`
      SELECT * FROM documentos_proveedor
      WHERE id_proveedor = ${id_proveedor}
      ORDER BY created_at ASC;
    `;
    return result.rows;
  } catch (error) {
    console.error("error al obtener documentos por proveedor:", error);
    throw error;
  }
};


export const obtenerDocumentoProveedorPorId = async (id_documento_proveedor: number) => {
  try {
    const result = await sql`
      SELECT * FROM documentos_proveedor
      WHERE id_documento_proveedor = ${id_documento_proveedor};
    `;
    return result.rows[0];
  } catch (error) {
    console.error("error al obtener documentos por proveedor:", error);
    throw error;
  }
};


export const eliminarDocumentoAdicionalPorId = async (id_documento_proveedor: number) => {
  try {
    const result = await sql`
      DELETE FROM documentos_proveedor
      WHERE id_documento_proveedor = ${id_documento_proveedor};
    `;
    return { success: true };
  } catch (error) {
    console.error("error al obtener documentos por proveedor:", error);
    throw error;
  }
};
