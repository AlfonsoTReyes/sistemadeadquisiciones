// ./src/app/adminProveedores/altaProveedor/formularios/fetchAltaProveedor.ts

const ADMIN_PROVEEDORES_API_URL = '/api/adminProveedores';

// Definiciones de tipos (ajusta según la estructura real de tus datos)
interface Proveedor {
  id_proveedor: number;
  estatus?: boolean;
  estatus_revision?: string;
  // Agrega aquí otros campos que esperas para un proveedor
  [key: string]: any; // Permite otros campos no definidos explícitamente
}

interface UsuarioProveedor {
  id_usuario: number;
  // Agrega aquí otros campos que esperas para un usuario proveedor
  [key: string]: any; // Permite otros campos no definidos explícitamente
}

interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}

/**
 * Obtiene la lista completa de proveedores desde la API de administración.
 * @returns {Promise<Proveedor[]>} - Una promesa que resuelve a un array de proveedores.
 */
export const fetchAllProveedores = async (): Promise<Proveedor[]> => {
  console.log("DEBUG Fetch: Calling fetchAllProveedores");
  try {
    const response = await fetch(ADMIN_PROVEEDORES_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined;
      try { errorData = await response.json(); } catch { /* ignora error de parseo */ }
      console.error(`Fetch Error GET ${ADMIN_PROVEEDORES_API_URL}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener la lista de proveedores: ${response.statusText}`);
    }

    const data: Proveedor[] = await response.json();
    console.log("DEBUG Fetch: fetchAllProveedores successful, received", data.length, "providers");
    return data;

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Fetch Error in fetchAllProveedores:", error);
    throw error; // Re-lanza el error
  }
};

/**
 * Actualiza el estatus (activo/inactivo) de un proveedor específico.
 * @param {number} idProveedor - El ID del proveedor a actualizar.
 * @param {boolean} newStatus - El nuevo estado (true para activo, false para inactivo).
 * @returns {Promise<any>} - Una promesa que resuelve con la respuesta de la API. (Ajusta 'any' si conoces la estructura de la respuesta)
 */
export const updateProveedorStatus = async (idProveedor: number, newStatus: boolean): Promise<any> => {
  console.log(`DEBUG Fetch: Calling updateProveedorStatus for ID ${idProveedor} with status ${newStatus}`);
  const apiUrl = ADMIN_PROVEEDORES_API_URL;

  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    const errorMsg = 'Fetch Error: idProveedor inválido para updateProveedorStatus';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (typeof newStatus !== 'boolean') {
    const errorMsg = 'Fetch Error: newStatus inválido (debe ser boolean) para updateProveedorStatus';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_proveedor: idProveedor,
        estatus: newStatus
      }),
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined;
      try { errorData = await response.json(); } catch { /* ignora error de parseo */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating ID ${idProveedor}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar el estatus del proveedor: ${response.statusText}`);
    }

    const data: any = await response.json(); // Ajusta 'any' si conoces la estructura
    console.log(`DEBUG Fetch: updateProveedorStatus successful for ID ${idProveedor}`);
    return data;

  } catch (err: unknown) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in updateProveedorStatus for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Obtiene los datos completos del PERFIL de un proveedor específico por su ID.
 * @param {number} idProveedor - El ID del proveedor a obtener.
 * @returns {Promise<Proveedor | null>} - Una promesa que resuelve con los datos del proveedor o null si no se encuentra.
 */
export const getProveedorProfileById = async (idProveedor: number): Promise<Proveedor | null> => {
  console.log(`DEBUG Fetch: Calling getProveedorProfileById for ID ${idProveedor}`);
  const apiUrl = `${ADMIN_PROVEEDORES_API_URL}?id_proveedor=${idProveedor}`;

  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    const errorMsg = 'Fetch Error: idProveedor inválido para getProveedorProfileById';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined;
      try { errorData = await response.json(); } catch { /* ignora error de parseo */ }
      if (response.status === 404) {
        console.warn(`Fetch Warning GET ${apiUrl}: Proveedor no encontrado (404).`);
        // Devolver null o lanzar un error específico para 404 es una opción.
        // Aquí se lanza un error, pero podrías cambiarlo a `return null;` si prefieres.
        throw new Error(errorData?.message || `Proveedor con ID ${idProveedor} no encontrado.`);
      }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener el perfil del proveedor: ${response.statusText}`);
    }

    const data: Proveedor = await response.json();
    console.log(`DEBUG Fetch: getProveedorProfileById successful for ID ${idProveedor}`);
    return data;

  } catch (err: unknown) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in getProveedorProfileById for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Actualiza los datos completos del PERFIL de un proveedor.
 * @param {Partial<Proveedor> & { id_proveedor: number }} proveedorData - Objeto con los datos actualizados, DEBE incluir id_proveedor.
 * @returns {Promise<any>} - Una promesa que resuelve con la respuesta de la API. (Ajusta 'any')
 */
export const updateProveedorProfile = async (proveedorData: Partial<Proveedor> & { id_proveedor: number }): Promise<any> => {
  console.log(`DEBUG Fetch: Calling updateProveedorProfile for ID ${proveedorData?.id_proveedor}`);
  const apiUrl = ADMIN_PROVEEDORES_API_URL;

  if (!proveedorData || typeof proveedorData.id_proveedor !== 'number' || isNaN(proveedorData.id_proveedor)) {
    const errorMsg = 'Fetch Error: id_proveedor es requerido y debe ser un número válido en proveedorData para updateProveedorProfile';
    console.error(errorMsg, "Data received:", proveedorData);
    throw new Error(errorMsg);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proveedorData),
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined;
      try { errorData = await response.json(); } catch { /* ignora error de parseo */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating profile ID ${proveedorData.id_proveedor}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar el perfil del proveedor: ${response.statusText}`);
    }

    const data: any = await response.json(); // Ajusta 'any'
    console.log(`DEBUG Fetch: updateProveedorProfile successful for ID ${proveedorData.id_proveedor}`);
    return data;

  } catch (err: unknown) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in updateProveedorProfile for ID ${proveedorData?.id_proveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Obtiene los datos del USUARIO asociado a un ID de proveedor.
 * @param {number} idDelProveedor - El ID del proveedor cuyo usuario se busca.
 * @returns {Promise<UsuarioProveedor | null>} - Una promesa que resuelve con los datos del usuario o null si no se encuentra.
 */
export const getUsuarioProveedorAsociado = async (idDelProveedor: number): Promise<UsuarioProveedor | null> => {
  console.log(`DEBUG Fetch: Fetching associated user for proveedor ID ${idDelProveedor}`);
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
      let errorData: ApiErrorResponse = {};
      try { errorData = await response.json(); } catch { /* ignore */ }
      if (response.status === 404) {
        console.warn(`DEBUG Fetch: User not found (404) for provider ${idDelProveedor}.`);
        return null;
      }
      console.error(`DEBUG Fetch: Error response. Status: ${response.status}, Body:`, errorData);
      throw new Error(`Error en API (${response.status}): ${errorData.message || response.statusText}`);
    }

    if (response.status === 204) {
      return null;
    }

    const data: UsuarioProveedor = await response.json();
    console.log(`DEBUG Fetch: Successfully fetched associated user data for provider ${idDelProveedor}:`, data);
    return data;

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`DEBUG Fetch: CATCH block fetching associated user for provider ${idDelProveedor}:`, error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario asociado a un proveedor.
 * @param {Partial<UsuarioProveedor> & { id_usuario: number }} usuarioData - Objeto con los datos actualizados, DEBE incluir 'id_usuario'.
 * @returns {Promise<UsuarioProveedor>} - Una promesa que resuelve con los datos del usuario actualizado.
 */
export const updateUsuarioProveedor = async (usuarioData: Partial<UsuarioProveedor> & { id_usuario: number }): Promise<UsuarioProveedor> => {
  console.log(`FETCH: Iniciando actualización para usuario ID: ${usuarioData?.id_usuario}`);
  console.log(`FETCH: Payload a enviar:`, JSON.stringify(usuarioData, null, 2));

  const apiUrl = '/api/adminProveedores';

  if (!usuarioData || typeof usuarioData.id_usuario !== 'number' || isNaN(usuarioData.id_usuario)) {
    const errorMsg = `Fetch Error: El campo 'id_usuario' es requerido y debe ser un número válido para la función updateUsuarioProveedor. Datos recibidos: ${JSON.stringify(usuarioData)}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData),
    });

    if (!response.ok) {
      let errorData: ApiErrorResponse = { message: `Error ${response.status}: ${response.statusText}` };
      try {
        errorData = await response.json();
      } catch { // El error 'parseError' no se usa, así que se puede omitir la variable.
        console.warn(`FETCH: No se pudo parsear el cuerpo de la respuesta de error como JSON. Status: ${response.status}`);
      }

      const errorMessage = errorData.message || `Error desconocido al actualizar usuario (Status: ${response.status})`;
      console.error(`FETCH Error PUT ${apiUrl}: Status ${response.status}. Mensaje: "${errorMessage}". User ID: ${usuarioData.id_usuario}.`, errorData);
      throw new Error(errorMessage);
    }

    const updatedUserData: UsuarioProveedor = await response.json();
    console.log(`FETCH: Actualización de usuario ID ${usuarioData.id_usuario} exitosa. Respuesta recibida:`, updatedUserData);
    return updatedUserData;

  } catch (error: unknown) {
    const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido en fetch'));
    console.error(`FETCH Exception durante actualización para usuario ID ${usuarioData?.id_usuario}:`, errorToThrow.message);
    throw errorToThrow;
  }
};

/**
 * Obtiene el usuario proveedor asociado a un proveedor específico por su ID.
 * @param {number} idProveedor - El ID del proveedor para obtener el usuario asociado.
 * @returns {Promise<UsuarioProveedor | null>} - Una promesa que resuelve con los datos del usuario o null si no se encuentra.
 */
export const getUsuarioProveedorByProveedorId = async (idProveedor: number): Promise<UsuarioProveedor | null> => {
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

      let errorData: ApiErrorResponse | undefined;
      try { errorData = await response.json(); } catch { /* ignora error de parseo */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener usuario proveedor: ${response.statusText}`);
    }

    const data: UsuarioProveedor = await response.json();
    console.log(`DEBUG Fetch: getUsuarioProveedorByProveedorId exitoso para proveedor ID ${idProveedor}`);
    return data;

  } catch (err: unknown) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error en getUsuarioProveedorByProveedorId para proveedor ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
 * Actualiza el estatus de REVISIÓN de un proveedor específico (llamada por el Admin).
 * @param {number} idProveedor - El ID del proveedor cuyo estado de revisión se actualizará.
 * @param {string} nuevoEstatusRevision - El nuevo estado ('EN_REVISION', 'APROBADO', etc.).
 * @returns {Promise<any>} - Una promesa que resuelve con la respuesta de la API. (Ajusta 'any')
 */
export const updateAdminRevisionStatus = async (idProveedor: number, nuevoEstatusRevision: string): Promise<any> => {
  console.log(`FETCH: Calling API to update revision status for ID ${idProveedor} to ${nuevoEstatusRevision}`);

  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    throw new Error("Fetch Error: ID de proveedor inválido.");
  }
  if (typeof nuevoEstatusRevision !== 'string' || nuevoEstatusRevision.trim() === '') {
    throw new Error("Fetch Error: El nuevo estatus de revisión es requerido.");
  }

  try {
    const response = await fetch(ADMIN_PROVEEDORES_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_proveedor: idProveedor,
        estatus_revision: nuevoEstatusRevision
      }),
    });

    // Intenta parsear JSON incluso si no es ok, para obtener mensajes de error de la API
    let data: any = null; // Ajusta 'any'
    try {
      data = await response.json();
    } catch {
      // Si el parseo falla (ej. respuesta vacía o no JSON), data permanece null
    }

    if (!response.ok) {
      console.error(`FETCH Error PUT ${ADMIN_PROVEEDORES_API_URL} (Revision Status): Status ${response.status}. ID: ${idProveedor}. Response:`, data);
      throw new Error(data?.message || `Error ${response.status}: ${response.statusText || 'No se pudo actualizar el estado de revisión.'}`);
    }

    console.log(`FETCH: API call for updateAdminRevisionStatus successful for ID ${idProveedor}`);
    return data ?? { message: "Estado de revisión actualizado." };

  } catch (err: unknown) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
    console.error(`FETCH Exception updateAdminRevisionStatus ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};