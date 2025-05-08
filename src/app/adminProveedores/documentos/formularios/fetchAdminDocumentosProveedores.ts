// --- URLs de API ---
// URL base para la mayoría de las operaciones de admin sobre proveedores y usuarios
const ADMIN_PROVEEDORES_API_URL: string = '/api/adminProveedores';
// URL específica para documentos y comentarios (si la separaste, si no, usa la de arriba)
const DOCS_API_URL: string = "/api/adminDocumuentosProveedores"; // Usar este nombre consistentemente
const DOCS_COMMENTS_API_URL: string = '/api/adminDocumuentosProveedores'; // Asumiendo que se maneja en la misma ruta con query params

// --- Interfaces ---

export interface DocumentoProveedor {
  id_documento_proveedor: number;
  id_proveedor: number;
  tipo_documento: string;
  nombre_original: string;
  ruta_archivo: string;
  id_usuario: number; // Asumo que es el ID del usuario que subió/modificó el documento
  estatus: string | boolean;
  created_at: string; // O Date si se transforman
  updated_at: string; // O Date si se transforman
}

export interface ProveedorDetalles {
  id_proveedor: number;
  rfc: string;
  tipo_proveedor: 'moral' | 'fisica' | 'desconocido'; // ← ESTA ES LA CLAVE
  nombre_o_razon_social: string; // ← ESTA TAMBIÉN DEBE ESTAR
}

export interface Comentario {
  id_comentario: number;
  id_documento_proveedor: number;
  comentario: string;
  id_usuario_admin: number; // ID del admin que creó el comentario
  created_at: string; // O Date
  updated_at: string; // O Date
  // podrías incluir nombre_usuario_admin si la API lo devuelve
}

// Interfaz genérica para respuestas de la API que no devuelven un objeto específico
export interface ApiResponse {
  message: string;
  success?: boolean;
  // podrías añadir 'data?: any;' si a veces viene con datos adicionales
}

/**
 * Obtiene los detalles de UN proveedor específico por su ID principal.
 * Usado para mostrar info en la cabecera de la página de documentos de admin.
 * Llama a GET /api/proveedores?id_proveedor=[id]
 * @param idProveedor - El ID del proveedor a obtener.
 * @returns Una promesa que resuelve al objeto del proveedor.
 */
export const fetchProveedorDetallesPorIdAdmin = async (idProveedor: number): Promise<ProveedorDetalles> => {
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    const errorMsg = 'Fetch Error: idProveedor inválido para fetchProveedorDetallesPorIdAdmin';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  const apiUrl = `${ADMIN_PROVEEDORES_API_URL}?id_proveedor=${idProveedor}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    let errorData: any; // Para capturar el cuerpo del error si existe
    if (!response.ok) {
      try { errorData = await response.json(); } catch (e) { /* ignora si no es json */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener detalles del proveedor ${idProveedor}: ${response.statusText}`);
    }

    const data: ProveedorDetalles = await response.json();
    return data;

  } catch (err: any) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in fetchProveedorDetallesPorIdAdmin for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};


/**
 * Obtiene la lista de documentos para un proveedor específico.
 * Llama a GET /api/documentosProveedores?id_proveedor=[id]
 * @param idProveedor - El ID del proveedor.
 * @returns Una promesa que resuelve a un array de documentos.
 */
export const fetchDocumentosPorProveedorAdmin = async (idProveedor: number): Promise<DocumentoProveedor[]> => {
  if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
    const errorMsg = 'Fetch Error: idProveedor inválido para fetchDocumentosPorProveedorAdmin';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Usar DOCS_API_URL si esa es la intención, o DOCS_COMMENTS_API_URL si es la misma para GET de docs
  const apiUrl = `${DOCS_API_URL}?id_proveedor=${idProveedor}`;


  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    let errorData: any;
    if (!response.ok) {
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error GET ${apiUrl}: Status ${response.status}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al obtener documentos del proveedor ${idProveedor}: ${response.statusText}`);
    }

    const rawData: any[] = await response.json();

    // Transformar para asegurar el tipo y campos correctos
    const documentos: DocumentoProveedor[] = rawData.map((item: any): DocumentoProveedor => ({
      id_documento_proveedor: Number(item.id_documento_proveedor),
      id_proveedor: Number(item.id_proveedor),
      tipo_documento: String(item.tipo_documento),
      nombre_original: String(item.nombre_original),
      ruta_archivo: String(item.ruta_archivo),
      created_at: String(item.created_at),
      updated_at: String(item.updated_at),
      estatus: item.estatus, // string | boolean, se mantiene como viene
      id_usuario: Number(item.id_usuario),
    }));

    return documentos;

  } catch (err: any) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    console.error(`Fetch Error in fetchDocumentosPorProveedorAdmin for ID ${idProveedor}:`, errorToThrow);
    throw errorToThrow;
  }
};


/**
 * Actualiza el estatus de un documento específico (llamada desde Admin).
 * Llama a PUT /api/documentosProveedores enviando ID del documento y estatus en el cuerpo.
 * @param idDocumento - El ID del documento a actualizar.
 * @param nuevoEstatus - El nuevo estado (depende de tu DB).
 * @returns Una promesa que resuelve con la respuesta de la API (generalmente el documento actualizado).
 */
export const updateDocumentoStatusAdmin = async (
  idDocumento: number,
  nuevoEstatus: string | boolean
): Promise<DocumentoProveedor> => { // Asumimos que devuelve el documento actualizado
  const apiUrl = DOCS_API_URL; // Usa la URL base para PUT (o la específica si es diferente)

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
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_documento_proveedor: idDocumento,
        estatus: nuevoEstatus
      }),
    });

    let errorData: any;
    if (!response.ok) {
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      console.error(`Fetch Error PUT ${apiUrl}: Status ${response.status} updating Doc ID ${idDocumento}. Response:`, errorData);
      throw new Error(errorData?.message || `Error al actualizar estatus del documento: ${response.statusText}`);
    }

    const data: DocumentoProveedor = await response.json(); // Asumimos que devuelve el documento actualizado
    return data;

  } catch (err: any) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err));
    throw errorToThrow;
  }
};

/**
 * Obtiene la lista de comentarios para un documento específico.
 * Llama a GET /api/adminDocumuentosProveedores?documentoIdParaComentarios=[idDoc]
 * @param idDocumento - El ID del documento.
 * @returns Array de objetos comentario.
 */
export const fetchComentariosPorDocumentoAdmin = async (idDocumento: number): Promise<Comentario[]> => {
  // La validación de idDocumento como número ya está implícita en el tipo de parámetro
  if (isNaN(idDocumento)) {
    throw new Error("Fetch Error: ID de documento inválido para obtener comentarios.");
  }
  const apiUrl = `${DOCS_COMMENTS_API_URL}?documentoIdParaComentarios=${idDocumento}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    let responseBody: any = null; // Para depurar la respuesta completa
    try {
      responseBody = await response.clone().json(); // Clonar para leer y seguir usando response
    } catch (e) {
      // Si no es JSON, podría ser texto plano
      try { responseBody = await response.clone().text(); } catch (e2) { /* No se pudo leer */ }
    }

    if (!response.ok) {
      console.error(`FETCH Error GET ${apiUrl}: Status ${response.status}. Response Body:`, responseBody);
      const errorMessage = (typeof responseBody === 'object' && responseBody?.message)
        ? responseBody.message
        : `Error ${response.status}: No se pudieron obtener los comentarios.`;
      throw new Error(errorMessage);
    }

    // Si response.ok, intentamos parsear como Comentario[]
    const data: Comentario[] = await response.json();

    // Validar que data es un array (podría ser un objeto con una propiedad 'data' o 'comentarios')
    // Si la API devuelve { comentarios: [...] }, necesitarás acceder a data.comentarios
    if (!Array.isArray(data)) {
      console.error(`FETCH Warning: La respuesta para comentarios no es un array. Recibido:`, data);
      // Decide cómo manejar esto: lanzar error o devolver array vacío
      // throw new Error("Respuesta inesperada del servidor al obtener comentarios.");
      return []; // O ajusta para acceder a la propiedad correcta ej: data.comentarios
    }


    return data.map((item: any): Comentario => ({ // Mapeo para asegurar la estructura
      id_comentario: Number(item.id_comentario),
      id_documento_proveedor: Number(item.id_documento_proveedor),
      comentario: String(item.comentario),
      id_usuario_admin: Number(item.id_usuario_admin),
      created_at: String(item.created_at),
      updated_at: String(item.updated_at),
    }));

  } catch (err: any) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
    console.error(`FETCH Exception fetchComentariosPorDocumentoAdmin Doc ID ${idDocumento}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
* Crea un nuevo comentario en un documento (Admin).
* Llama a POST /api/adminDocumuentosProveedores (enviando datos del comentario en el body)
* @param idDocumento - ID del documento a comentar.
* @param comentarioTexto - El texto del comentario.
* @param idUsuarioAdmin - El ID del admin que comenta.
* @returns El comentario recién creado.
*/
export const createComentarioAdmin = async (
  idDocumento: number,
  comentarioTexto: string,
  idUsuarioAdmin: number
): Promise<Comentario> => {

  if (isNaN(idDocumento) || isNaN(idUsuarioAdmin)) {
    throw new Error("Fetch Error: ID de documento o ID de admin inválido.");
  }
  if (typeof comentarioTexto !== 'string' || comentarioTexto.trim() === '') {
    throw new Error("Fetch Error: El texto del comentario es requerido.");
  }
  const apiUrl = DOCS_COMMENTS_API_URL; // Endpoint POST (DOCS_COMMENTS_API_URL o DOCS_API_URL según tu API)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_documento_proveedor: idDocumento,
        comentario: comentarioTexto.trim(),
        id_usuario_admin: idUsuarioAdmin
      }),
    });

    let errorData: any;
    if (!response.ok) {
      try { errorData = await response.json(); } catch (e) { /* ignora */ }
      throw new Error(errorData?.message || `Error ${response.status}: No se pudo crear comentario.`);
    }

    const data: Comentario = await response.json();
    if (!data || typeof data.id_comentario !== 'number') { // Validación básica de la respuesta
      throw new Error("Respuesta inválida del servidor al crear comentario.");
    }
    return data;

  } catch (err: any) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido en fetch'));
    console.error(`FETCH Exception createComentarioAdmin Doc ID ${idDocumento}:`, errorToThrow);
    throw errorToThrow;
  }
};

/**
* Elimina un comentario específico por su ID (Admin).
* Llama a DELETE /api/adminDocumuentosProveedores?id_comentario=[idComentario]
* @param idComentario - El ID del comentario a eliminar.
* @returns Respuesta de la API (ej. { message: "..." }).
*/
export const deleteComentarioAdmin = async (idComentario: number): Promise<ApiResponse> => {
  if (isNaN(idComentario)) {
    throw new Error("Fetch Error: ID de comentario inválido para eliminar.");
  }
  const apiUrl = `${DOCS_COMMENTS_API_URL}?id_comentario=${idComentario}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    let data: ApiResponse | null = null;
    // Un DELETE exitoso puede devolver 204 No Content (sin cuerpo) o 200 OK con un mensaje.
    if (response.status !== 204 && response.body) {
      try {
        data = await response.json();
      } catch (e) {
        // Si no es JSON, podría ser un error o un mensaje de texto plano
        console.warn(`DELETE ${apiUrl} no devolvió JSON válido, status: ${response.status}`);
      }
    }

    if (!response.ok) {
      console.error(`FETCH Error DELETE ${apiUrl}: Status ${response.status}. Response:`, data);
      throw new Error(data?.message || `Error ${response.status}: No se pudo eliminar el comentario.`);
    }

    // Si es 204, data será null. Devolvemos un mensaje de éxito genérico.
    // Si es 200 y data tiene un mensaje, lo usamos.
    return data ?? { success: true, message: 'Comentario eliminado exitosamente.' };

  } catch (err: any) {
    const errorToThrow = err instanceof Error ? err : new Error(String(err || 'Error desconocido'));
    console.error(`FETCH Exception deleteComentarioAdmin ID ${idComentario}:`, errorToThrow);
    throw errorToThrow;
  }
};