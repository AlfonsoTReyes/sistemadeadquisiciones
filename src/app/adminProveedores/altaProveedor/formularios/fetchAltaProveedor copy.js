
const ADMIN_PROVEEDORES_API_URL = '/api/adminProveedores';

/**
 * Obtiene la lista completa de proveedores desde la API de administración.
 * Llama a GET /api/admin/proveedores
 * @returns {Promise<ProveedorData[]>} - Una promesa que resuelve a un array de proveedores.
 */
/**
 * Obtiene la lista completa de proveedores desde la API de administración.
 * Llama a GET /api/admin/proveedores
 * @returns {Promise<Array<object>>} - Una promesa que resuelve a un array de proveedores.
 */
export const fetchAllProveedores = async () => {
  console.log("DEBUG Fetch: Calling fetchAllProveedores");
  try {
    // Usa la URL base correcta
    const response = await fetch(ADMIN_PROVEEDORES_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora error */ }
      console.error(`Fetch Error GET ${ADMIN_PROVEEDORES_API_URL}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener la lista de proveedores: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("DEBUG Fetch: fetchAllProveedores successful, received", data.length, "providers");
    return data;

  } catch (err) {
    console.error("Fetch Error in fetchAllProveedores:", err);
    throw err; // Re-lanza el error
  }
};

/**
 * Actualiza el estatus (activo/inactivo) de un proveedor específico.
 * Llama a PUT /api/admin/proveedores enviando ID y estatus en el cuerpo.
 * @param {number} idProveedor - El ID del proveedor a actualizar.
 * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
// AJUSTADO para coincidir con PUT /api/admin/proveedores
export const updateProveedorStatus = async (idProveedor, newStatus) => {
  console.log(`DEBUG Fetch: Calling updateProveedorStatus for ID ${idProveedor} with status ${newStatus}`);
  // --- Usa la URL BASE ---
  const apiUrl = ADMIN_PROVEEDORES_API_URL;

  // Validación básica en JS (opcional pero útil)
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
     const errorMsg = 'Fetch Error: idProveedor inválido para updateProveedorStatus';
     console.error(errorMsg);
     throw new Error(errorMsg); // Detener ejecución si el ID es inválido
  }
  if (typeof newStatus !== 'boolean') {
     const errorMsg = 'Fetch Error: newStatus inválido (debe ser boolean) para updateProveedorStatus';
     console.error(errorMsg);
     throw new Error(errorMsg); // Detener ejecución si el estatus es inválido
  }

  try {
    const response = await fetch(apiUrl, {
      // --- MÉTODO AJUSTADO A PUT ---
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Añadir headers de autenticación si son necesarios
      },
      // --- BODY AJUSTADO: Incluye id_proveedor y estatus ---
      body: JSON.stringify({
          id_proveedor: idProveedor, // Clave como la espera la API
          estatus: newStatus         // Clave como la espera la API
      }),
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora error */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating ID ${idProveedor}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar el estatus del proveedor: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: updateProveedorStatus successful for ID ${idProveedor}`);
    return data;

  } catch (err) {
    // Asegura que siempre se lance un objeto Error
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in updateProveedorStatus for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Obtiene los datos completos del PERFIL de un proveedor específico por su ID.
 * Llama a GET /api/adminProveedores?id_proveedor={idProveedor}
 * @param {number} idProveedor - El ID del proveedor a obtener.
 * @returns {Promise<object>} - Una promesa que resuelve con los datos del proveedor.
 */
export const getProveedorProfileById = async (idProveedor) => {
  console.log(`DEBUG Fetch: Calling getProveedorProfileById for ID ${idProveedor}`);
  const apiUrl = `${ADMIN_PROVEEDORES_API_URL}?id_proveedor=${idProveedor}`; // Usa query param

  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
     const errorMsg = 'Fetch Error: idProveedor inválido para getProveedorProfileById';
     console.error(errorMsg);
     throw new Error(errorMsg);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // Evitar caché para datos específicos
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora error */ }
      // Manejar 404 específicamente
      if (response.status === 404) {
          console.warn(`Fetch Warning GET ${apiUrl}: Proveedor no encontrado (404).`);
          throw new Error(errorData?.message || `Proveedor con ID ${idProveedor} no encontrado.`);
      }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener el perfil del proveedor: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: getProveedorProfileById successful for ID ${idProveedor}`);
    // Asume que la API devuelve directamente el objeto del proveedor o { proveedor: {...} }
    // Ajusta si es necesario: return data.proveedor || data;
    return data;

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in getProveedorProfileById for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Actualiza los datos completos del PERFIL de un proveedor.
 * Llama a PUT /api/adminProveedores (enviando el objeto completo con id_proveedor)
 * @param {object} proveedorData - Objeto con los datos actualizados, DEBE incluir id_proveedor.
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
export const updateProveedorProfile = async (proveedorData) => {
  console.log(`DEBUG Fetch: Calling updateProveedorProfile for ID ${proveedorData?.id_proveedor}`);
  const apiUrl = ADMIN_PROVEEDORES_API_URL;

  // Validación crucial: el ID debe estar en los datos
  if (!proveedorData || typeof proveedorData.id_proveedor !== 'number' || isNaN(proveedorData.id_proveedor)) {
     const errorMsg = 'Fetch Error: id_proveedor es requerido y debe ser un número válido en proveedorData para updateProveedorProfile';
     console.error(errorMsg, "Data received:", proveedorData);
     throw new Error(errorMsg);
  }
   // Podrías añadir más validaciones si es necesario (ej: tipoProveedor)

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT', // Usa PUT como updateStatus, asumiendo que maneja el update completo
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proveedorData), // Envía el objeto completo
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora error */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating profile ID ${proveedorData.id_proveedor}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar el perfil del proveedor: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: updateProveedorProfile successful for ID ${proveedorData.id_proveedor}`);
    return data; // Podría ser un mensaje de éxito o los datos actualizados

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in updateProveedorProfile for ID ${proveedorData?.id_proveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Obtiene los datos del USUARIO asociado a un ID de proveedor.
 * Llama a GET /api/admin/usuarios-proveedor?idProveedor={idProveedor}
 * @param {number} idProveedor - El ID del proveedor cuyo usuario se busca.
 * @returns {Promise<object|null>} - Una promesa que resuelve con los datos del usuario o null si no se encuentra.
 */
export const getUsuarioProveedorAsociado = async (idDelProveedor) => { // Renombrada para claridad
  console.log(`DEBUG Fetch: Fetching associated user for proveedor ID ${idDelProveedor}`);

  // *** CAMBIO CLAVE AQUÍ: Usa un parámetro diferente ***
  const apiUrl = `/api/admin/proveedores?getUsuarioForProveedorId=${idDelProveedor}`;
  // Antes probablemente era: `/api/admin/proveedores?id_proveedor=${idDelProveedor}` o similar
  // O si usabas la ruta /api/admin/usuarios-proveedor era: `/api/admin/usuarios-proveedor?idProveedor=${idDelProveedor}`
  // Asegúrate que la URL base sea '/api/admin/proveedores' ahora.

  console.log(`DEBUG Fetch: Target API URL for user: ${apiUrl}`);

  if (typeof idDelProveedor !== 'number' || isNaN(idDelProveedor)) {
     throw new Error('Fetch Error: ID de proveedor inválido');
  }

  try {
      const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
      });
      console.log(`DEBUG Fetch: Response status for user request: ${response.status}`);

      if (!response.ok) {
           let errorData = {};
           try { errorData = await response.json(); } catch (e) { /* ignore */ }
           // Manejar 404 si la API lo devuelve para usuario no encontrado
           if (response.status === 404) {
               console.warn(`DEBUG Fetch: User not found (404) for provider ${idDelProveedor}.`);
               // Decide cómo manejarlo. Devolver null permite al componente decidir.
               return null;
           }
           console.error(`DEBUG Fetch: Error response. Status: ${response.status}, Body:`, errorData);
           throw new Error(`Error en API (${response.status}): ${errorData.message || response.statusText}`);
      }

      if (response.status === 204) { // Por si la API devuelve No Content
          return null;
      }

      const data = await response.json();
      console.log(`DEBUG Fetch: Successfully fetched associated user data for provider ${idDelProveedor}:`, data);
      return data;

  } catch (err) {
      console.error(`DEBUG Fetch: CATCH block fetching associated user for provider ${idDelProveedor}:`, err);
      throw err instanceof Error ? err : new Error(String(err));
  }
};

/**
 * Actualiza los datos de un USUARIO proveedor.
 * Llama a PUT /api/admin/usuarios-proveedor (enviando el objeto completo con id_usuario_proveedor)
 * @param {object} usuarioData - Objeto con los datos actualizados, DEBE incluir id_usuario_proveedor.
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
export const updateUsuarioProveedor = async (usuarioData) => {
    console.log(`DEBUG Fetch: Calling updateUsuarioProveedor for user ID ${usuarioData?.id_usuario_proveedor}`);
    const apiUrl = ADMIN_PROVEEDORES_API_URL; // Usa la nueva URL base

    // Validación crucial: el ID del *usuario* debe estar
    //if (!usuarioData || typeof usuarioData.id_usuario_proveedor !== 'number' || isNaN(usuarioData.id_usuario_proveedor)) {
    if (!usuarioData || isNaN(usuarioData.id_usuario_proveedor)) {
    
      const errorMsg = 'Fetch Error: id_usuario_proveedor es requerido y debe ser un número válido en usuarioData para updateUsuarioProveedor';
       console.error(errorMsg, "Data received:", usuarioData);
       throw new Error(errorMsg);
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT', // Asume PUT para actualizar el usuario
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioData), // Envía el objeto completo
        });

        if (!response.ok) {
            let errorData;
            try { errorData = await response.json(); } catch (e) { /* ignore */ }
            console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating user ID ${usuarioData.id_usuario_proveedor}. Response:`, errorData);
            throw new Error(errorData?.message || `Error al actualizar el usuario proveedor: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`DEBUG Fetch: updateUsuarioProveedor successful for user ID ${usuarioData.id_usuario_proveedor}`);
        return data; // Podría ser mensaje de éxito o datos actualizados

    } catch (err) {
        const errorToThrow = err instanceof Error ? err : new Error(String(err));
        console.error(`Fetch Error in updateUsuarioProveedor for user ID ${usuarioData?.id_usuario_proveedor}:`, errorToThrow);
        throw errorToThrow;
    }
};

/**
 * Obtiene el usuario proveedor asociado a un proveedor específico por su ID.
 * Llama a GET /api/admin/proveedores?id_proveedor_usuario={idProveedor}
 * @param {number} idProveedor - El ID del proveedor para obtener el usuario asociado.
 * @returns {Promise<object|null>} - Una promesa que resuelve con los datos del usuario o null si no se encuentra.
 */
export const getUsuarioProveedorByProveedorId = async (idProveedor) => {
  console.log(`DEBUG Fetch: Calling getUsuarioProveedorByProveedorId for proveedor ID ${idProveedor}`);
  
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    throw new Error('Fetch Error: ID del proveedor inválido para getUsuarioProveedorByProveedorId');
  }

  const apiUrl = `${ADMIN_PROVEEDORES_API_URL}?id_proveedor_usuario=${idProveedor}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`DEBUG Fetch: Usuario proveedor no encontrado para proveedor ID ${idProveedor}`);
        return null;
      }

      let errorData;
      try { errorData = await response.json(); } catch (e) { /* ignora error */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener usuario proveedor: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`DEBUG Fetch: getUsuarioProveedorByProveedorId exitoso para proveedor ID ${idProveedor}`);
    return data;

  } catch (err) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error en getUsuarioProveedorByProveedorId para proveedor ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};