import { sql } from "@vercel/postgres";

export const getAllProveedoresForAdmin = async () => {
  console.log("DEBUG Service: Fetching all provider profiles for admin table.");
  try {
      // Seleccionamos campos de 'proveedores' y usamos JOINs solo para determinar el tipo
      const result = await sql`
      SELECT
          p.id_proveedor,
          p.rfc,
          p.correo,
          p.estatus,
          p.telefono_uno, -- O p.telefono_dos, o ambos si necesitas concatenarlos
          m.razon_social, -- Necesario para determinar si es moral
          f.nombre AS nombre_fisica -- Necesario para determinar si es física
      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
      ORDER BY p.created_at DESC; -- O por RFC, etc.
    `;

      // Mapeamos para añadir el tipo y devolver solo lo necesario
      const proveedoresFormateados = result.rows.map(row => {
          const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');
          return {
              id_proveedor: row.id_proveedor,
              rfc: row.rfc,
              correo: row.correo,
              estatus: row.estatus, // Asegúrate que sea boolean en tu DB
              telefono: row.telefono_uno, // Renombramos para claridad en frontend si solo muestras uno
              tipo_proveedor: tipo
          };
      });

      console.log(`DEBUG Service: Found ${proveedoresFormateados.length} providers for admin table.`);
      return proveedoresFormateados;

  } catch (error) {
      console.error("Error fetching all providers for admin:", error);
      throw new Error('Error al obtener la lista de proveedores para administración.');
  }
};


/**
* Actualiza el estatus (activo/inactivo) de un proveedor específico.
* Acepta un booleano para el nuevo estado.
*/
export const updateProveedorEstatus = async (
  idProveedor: number,
  estatus: boolean // Acepta un BOOLEANO
) => {
  console.log(`DEBUG Service: Updating status for provider ID ${idProveedor} to ${estatus}`);
  try {
      if (isNaN(idProveedor)) {
          throw new Error("ID de proveedor inválido proporcionado.");
      }

      const result = await sql`
      UPDATE proveedores
      SET
        estatus = ${estatus},
        updated_at = NOW()
      WHERE id_proveedor = ${idProveedor}
      RETURNING id_proveedor, rfc, estatus, updated_at;
    `;

      if (result.rows.length === 0) {
          throw new Error(`Proveedor con ID ${idProveedor} no encontrado para actualizar.`);
      }

      console.log(`DEBUG Service: Status updated successfully for provider ID ${idProveedor}`);
      return result.rows[0];

  } catch (error) {
      console.error(`Error updating provider status for ID ${idProveedor}:`, error);
      throw new Error('Error al actualizar el estatus del proveedor.');
  }
};
/**
* Obtiene los detalles COMPLETOS de un proveedor por su ID principal.
* Útil si el admin hace clic para ver una ficha completa del proveedor.
*/
export const getProveedorById = async (id: number) => {
  try {
    // Tu consulta JOIN completa está bien para obtener todos los detalles
    const result = await sql`
      SELECT
        p.*,
        m.razon_social, m.nombre_representante, m.apellido_p_representante, m.apellido_m_representante,
        f.nombre AS nombre_fisica, f.apellido_p AS apellido_p_fisica, f.apellido_m AS apellido_m_fisica, f.curp
      FROM proveedores p
      LEFT JOIN proveedores_morales m ON p.id_proveedor = m.id_proveedor
      LEFT JOIN personas_fisicas f ON p.id_proveedor = f.id_proveedor
      WHERE p.id_proveedor = ${id};
    `;

    if (result.rows.length === 0) {
      // Cambiamos a devolver null en lugar de lanzar error aquí,
      // permite al frontend manejar el "no encontrado" más suavemente.
      console.log(`DEBUG Service: Provider not found for ID: ${id}`);
      return null;
    }

    const row = result.rows[0];
    const tipo = row.razon_social ? 'moral' : (row.nombre_fisica ? 'fisica' : 'desconocido');

    return { ...row, tipo_proveedor: tipo };

  } catch (error) {
    console.error("Error fetching proveedor by ID:", error);
    throw new Error('Error al obtener datos del proveedor por ID.');
  }
};

/**
* Obtiene los documentos asociados a un proveedor específico.
* Necesaria para la vista de documentos del proveedor.
*/
export const getDocumentosByProveedor = async (id_proveedor: number) => {
  console.log(`DEBUG Service: Fetching documents for provider ID: ${id_proveedor}`);
  try {
      if (isNaN(id_proveedor)) {
          throw new Error("ID de proveedor inválido proporcionado.");
      }
      const result = await sql`
      SELECT
          id_documento_proveedor, id_proveedor, ruta_archivo, estatus,
          created_at, updates_at, nombre_original, tipo_documento, id_usuario
      FROM documentos_proveedor
      WHERE id_proveedor = ${id_proveedor};
    `;
      console.log(`DEBUG Service: Found ${result.rows.length} documents for provider ID: ${id_proveedor}`);
      return result.rows; // Devuelve array (puede ser vacío)

  } catch (error) {
      console.error(`Error fetching documents for provider ID ${id_proveedor}:`, error);
      throw new Error('Error al obtener los documentos del proveedor.');
  }
};
