// URL para las operaciones con documentos (obtener lista, actualizar estatus)
//const DOCS_API_URL = "/api/proveedoresDocumentos"; // Ajusta si tu ruta es diferente
const DOCS_API_URL = "/api/adminDocumuentosProveedores"; // Ajusta si tu ruta es diferente

// URL para obtener detalles del proveedor
const PROVEEDOR_API_URL = "/api/proveedores"; // Asumiendo que esta es la ruta para GET por ID

/**
 * Obtiene los detalles de UN proveedor específico por su ID principal.
 * Usado para mostrar info en la cabecera de la página de documentos de admin.
 * Llama a GET /api/proveedores?id_proveedor=[id]
 * @param {number} idProveedor - El ID del proveedor a obtener.
 * @returns {Promise<object>} - Una promesa que resuelve al objeto del proveedor.
 */
export const fetchProveedorDetallesPorIdAdmin = async (idProveedor) => {
  // Renombrado para evitar conflicto si tienes otra función getProveedor
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
     const errorMsg = 'Fetch Error: idProveedor inválido para fetchProveedorDetallesPorIdAdmin';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }
  console.log(`DEBUG Fetch: Calling fetchProveedorDetallesPorIdAdmin for ID ${idProveedor}`);
  const apiUrl = `${PROVEEDOR_API_URL}?id_proveedor=${idProveedor}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener detalles del proveedor ${idProveedor}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: fetchProveedorDetallesPorIdAdmin successful for ID ${idProveedor}`);
    return data;

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in fetchProveedorDetallesPorIdAdmin for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};


/**
 * Obtiene la lista de documentos para un proveedor específico.
 * Llama a GET /api/documentosProveedores?id_proveedor=[id]
 * @param {number} idProveedor - El ID del proveedor.
 * @returns {Promise<Array<object>>} - Una promesa que resuelve a un array de documentos.
 */
export const fetchDocumentosPorProveedorAdmin = async (idProveedor) => {
  // Renombrado para claridad
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
     const errorMsg = 'Fetch Error: idProveedor inválido para fetchDocumentosPorProveedorAdmin';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }
  console.log(`DEBUG Fetch: Calling fetchDocumentosPorProveedorAdmin for ID ${idProveedor}`);
  const apiUrl = `${DOCS_API_URL}?id_proveedor=${idProveedor}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener documentos del proveedor ${idProveedor}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: fetchDocumentosPorProveedorAdmin successful for ID ${idProveedor}, received ${data.length} docs`);
    return data;

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in fetchDocumentosPorProveedorAdmin for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Actualiza el estatus de un documento específico (llamada desde Admin).
 * Llama a PUT /api/documentosProveedores enviando ID del documento y estatus en el cuerpo.
 * @param {number} idDocumento - El ID del documento a actualizar.
 * @param {string | boolean} nuevoEstatus - El nuevo estado (depende de tu DB).
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
export const updateDocumentoStatusAdmin = async (idDocumento, nuevoEstatus) => {
  console.log(`DEBUG Fetch: Calling updateDocumentoStatusAdmin for Doc ID ${idDocumento} with status ${nuevoEstatus}`);
  const apiUrl = DOCS_API_URL; // Usa la URL base para PUT

  // Validación básica
  if (typeof idDocumento !== 'number' || isNaN(idDocumento)) {
     const errorMsg = 'Fetch Error: idDocumento inválido para updateDocumentoStatusAdmin';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }
  if (nuevoEstatus === undefined || nuevoEstatus === null) {
     const errorMsg = 'Fetch Error: nuevoEstatus inválido para updateDocumentoStatusAdmin';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }


  try {
    const response = await fetch(apiUrl, {
      method: 'PUT', // Método para actualizar según la API route
      headers: {
        'Content-Type': 'application/json',
        // Headers de autenticación si son necesarios
      },
      // Body con el ID del DOCUMENTO y el nuevo ESTATUS
      body: JSON.stringify({
        id_documento_proveedor: idDocumento, // La API espera este ID
        estatus: nuevoEstatus               // La API espera el nuevo estado
      }),
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating Doc ID ${idDocumento}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar estatus del documento: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: updateDocumentoStatusAdmin successful for Doc ID ${idDocumento}`);
    return data; // Devuelve el documento actualizado

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in updateDocumentoStatusAdmin for Doc ID ${idDocumento}:`, errorToThrow);
    throw errorToThrow;
  }
};