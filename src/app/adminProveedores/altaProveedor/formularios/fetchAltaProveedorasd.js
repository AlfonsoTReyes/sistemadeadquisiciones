
const ADMIN_PROVEEDORES_API_URL = '/api/adminProveedores';
import { enviarNotificacionUnificada } from '@/services/notificaciones/notificacionesService';

/**
 * Obtiene la lista completa de proveedores desde la API de administración.
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
 * @param {number} idProveedor - El ID del proveedor a actualizar.
 * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 */
export const updateProveedorStatus = async (idProveedor: number, newStatus: boolean) => {
  const apiUrl = `/api/adminProveedores/${idProveedor}/status`;

  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    throw new Error('ID de proveedor inválido');
  }
  if (typeof newStatus !== 'boolean') {
    throw new Error('Estatus inválido');
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estatus: newStatus }),
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (_) {}
      throw new Error(errorData?.message || `Error al actualizar el estatus: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Error actualizando estatus del proveedor ${idProveedor}:`, err);
    throw err instanceof Error ? err : new Error(String(err));
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
 * Actualiza los datos de un usuario asociado a un proveedor.
 * Llama a PUT /api/adminProveedores (o la URL configurada) enviando los datos del usuario.
 * @param {object} usuarioData - Objeto con los datos actualizados, DEBE incluir 'id_usuario'.
 * @returns {Promise<object>} - Una promesa que resuelve con los datos del usuario actualizado devueltos por la API.
 * @throws {Error} - Lanza un error si la validación falla o la llamada fetch/API falla.
 */
export const updateUsuarioProveedor = async (usuarioData) => {
  // Log inicial para rastrear la llamada y el ID
  console.log(`FETCH: Iniciando actualización para usuario ID: ${usuarioData?.id_usuario}`);
  // Loguear el payload completo puede ser útil para depurar qué se está enviando exactamente
  console.log(`FETCH: Payload a enviar:`, JSON.stringify(usuarioData, null, 2));

  // Define la URL del endpoint. Usa una constante si es posible.
  const apiUrl = '/api/adminProveedores'; // Asegúrate que esta es la ruta correcta de tu API
  // const apiUrl = ADMIN_PROVEEDORES_API_URL; // Si usas una constante

  // Validación crucial del ID del usuario antes de enviar
  if (!usuarioData || typeof usuarioData.id_usuario !== 'number' || isNaN(usuarioData.id_usuario)) {
      const errorMsg = `Fetch Error: El campo 'id_usuario' es requerido y debe ser un número válido para la función updateUsuarioProveedor. Datos recibidos: ${JSON.stringify(usuarioData)}`;
      console.error(errorMsg);
      // Lanzar un error detiene la ejecución aquí y será capturado por el .catch en el componente que llama
      throw new Error(errorMsg);
  }

  try {
      // Realizar la solicitud PUT a la API Route
      const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              // Aquí podrías añadir otros headers si fuesen necesarios (ej. Authorization: `Bearer ${token}`)
          },
          // Enviar el objeto usuarioData completo, ya que la API Route lo espera
          body: JSON.stringify(usuarioData),
      });

      // --- Manejo de la Respuesta ---

      // Si la respuesta NO es exitosa (status code no es 2xx)
      if (!response.ok) {
          let errorData = { message: `Error ${response.status}: ${response.statusText}` }; // Mensaje por defecto
          try {
              // Intenta parsear el cuerpo de la respuesta por si la API envía un JSON con un mensaje de error
              errorData = await response.json();
          } catch (parseError) {
              // Si el cuerpo no es JSON o está vacío, nos quedamos con el mensaje por defecto
              console.warn(`FETCH: No se pudo parsear el cuerpo de la respuesta de error como JSON. Status: ${response.status}`);
          }

          const errorMessage = errorData.message || `Error desconocido al actualizar usuario (Status: ${response.status})`;
          console.error(`FETCH Error PUT ${apiUrl}: Status ${response.status}. Mensaje: "${errorMessage}". User ID: ${usuarioData.id_usuario}.`, errorData);
          // Lanzar un error con el mensaje obtenido de la API (o el genérico)
          throw new Error(errorMessage);
      }

      // Si la respuesta es exitosa (status code 2xx)
      const updatedUserData = await response.json(); // Parsea la respuesta JSON exitosa
      console.log(`FETCH: Actualización de usuario ID ${usuarioData.id_usuario} exitosa. Respuesta recibida:`, updatedUserData);
      return updatedUserData; // Devuelve los datos actualizados

  } catch (error) {
      // Captura errores de red (ej. servidor caído) o los errores lanzados desde el bloque `if (!response.ok)`
      // Asegurarnos de que siempre lanzamos un objeto Error
      const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido en fetch'));
      console.error(`FETCH Exception durante actualización para usuario ID ${usuarioData?.id_usuario}:`, errorToThrow.message);
      // Propagar el error para que el componente que llama (page.tsx en handleSaveUserUpdate) pueda manejarlo
      throw errorToThrow;
  }
};

/**
 * Obtiene el usuario proveedor asociado a un proveedor específico por su ID.
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

/**
 * Actualiza el estatus de REVISIÓN de un proveedor específico (llamada por el Admin)
 * E INSERTA/ENVÍA una notificación al usuario proveedor correspondiente.
 * @param {number} idProveedor - El ID del proveedor cuyo estado de revisión se actualizará.
 * @param {string} nuevoEstatusRevision - El nuevo estado ('EN_REVISION', 'APROBADO', etc.).
 * @param {number} adminUserId - El ID del usuario administrador que realiza la acción. <--- NUEVO ARGUMENTO
 * @returns {Promise<object>} - Una promesa que resuelve con la respuesta de la API.
 * @throws {Error} - Si la validación falla o la llamada fetch/API falla.
 */
// --- Firma actualizada para aceptar adminUserId ---
export const updateAdminRevisionStatus = async (idProveedor, nuevoEstatusRevision) => {
  console.log(`FETCH: Calling API to update revision status for ID ${idProveedor} to ${nuevoEstatusRevision}`);

  // Validaciones básicas (se mantienen)
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
      throw new Error("Fetch Error: ID de proveedor inválido.");
  }
  if (typeof nuevoEstatusRevision !== 'string' || nuevoEstatusRevision.trim() === '') {
      throw new Error("Fetch Error: El nuevo estatus de revisión es requerido.");
  }
  // ... (validación opcional de valores de estatus) ...

  try {
      // --- Llamada ÚNICA a la API ---
      const response = await fetch(ADMIN_PROVEEDORES_API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              id_proveedor: idProveedor,
              estatus_revision: nuevoEstatusRevision // Enviar solo los datos relevantes
          }),
      });

      const data = await response.json().catch(() => null); // Intentar parsear

      if (!response.ok) {
           console.error(`FETCH Error PUT ${ADMIN_PROVEEDORES_API_URL} (Revision Status): Status ${response.status}. ID: ${idProveedor}. Response:`, data);
           throw new Error(data?.message || `Error ${response.status}: ${response.statusText || 'No se pudo actualizar el estado de revisión.'}`);
       }

      console.log(`FETCH: API call for updateAdminRevisionStatus successful for ID ${idProveedor}`);
      return data ?? { message: "Estado de revisión actualizado." }; // Devuelve respuesta de la API

  } catch (err) {
      const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
      console.error(`FETCH Exception updateAdminRevisionStatus ID ${idProveedor}:`, errorToThrow);
      throw errorToThrow; // Re-lanzar para el componente
  }
};

