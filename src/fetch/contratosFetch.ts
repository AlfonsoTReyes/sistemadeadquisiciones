// src/fetch/contratosFetch.ts
import { ProveedorDetallado } from "@/types/proveedor"; // Ajusta la ruta

// Importa los tipos necesarios
import {
    ContratoCreateData,
    ContratoUpdateData,
    ContratoEnLista,
    ContratoDetallado,
} from "@/types/contrato"; // Ajusta la ruta
const PROVEEDORES_API_URL = "/api/proveedores"; // O '/api/usuariosProveedores' si tienes una ruta específica
const CONTRATOS_API_URL = "/api/contratos"; // Ruta base para la API de contratos
/**
 * Obtiene el perfil detallado de un proveedor usando el ID del usuario asociado.
 * @param {number} idUsuarioProveedor - El ID del usuario logueado (de usuarios_proveedores).
 * @returns {Promise<ProveedorDetallado | null>} - El perfil del proveedor o null si no se encuentra.
 * @throws {Error} - Si el ID es inválido o hay un error de API.
 */
export const fetchProveedorByUserId = async (
    idUsuarioProveedor: number
): Promise<ProveedorDetallado | null> => {
    const logPrefix = `FETCH fetchProveedorByUserId (User ID: ${idUsuarioProveedor}):`;
    // Asume que tu API en /api/proveedores puede manejar un query param como ?userId=...
    // O ajusta la URL si tienes un endpoint dedicado como /api/usuariosProveedores/profile
    const apiUrl = `${PROVEEDORES_API_URL}?id_usuario_proveedor=${idUsuarioProveedor}`;

    if (typeof idUsuarioProveedor !== "number" || isNaN(idUsuarioProveedor)) {
        const errorMsg = `${logPrefix} Error: ID de usuario inválido.`;
        console.error(errorMsg);
        throw new Error("ID de usuario inválido.");
    }

    console.log(`${logPrefix} Calling GET ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        // Si el usuario no tiene perfil asociado, la API podría devolver 404
        if (response.status === 404) {
            console.warn(
                `${logPrefix} Proveedor no encontrado (404) para este usuario.`
            );
            return null; // Indica que no se encontró perfil
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudo obtener el perfil del proveedor.`
            );
        }
        if (!data || typeof data !== "object" || data === null) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Respuesta inválida del servidor. Response:`,
                data
            );
            throw new Error(
                "Respuesta inesperada del servidor al obtener perfil del proveedor."
            );
        }

        console.log(`${logPrefix} Success. Profile data received.`);
        return data as ProveedorDetallado;
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido en fetch"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};
/**
 * Obtiene la lista de proveedores formateada para usar en un <select>.
 * @returns Promise<Array<{ id: number; label: string }>>
 */
export const fetchProveedoresForSelect = async (): Promise<
    { id: number; label: string }[]
> => {
    const logPrefix = "FETCH fetchProveedoresForSelect:";
    const apiUrl = `${PROVEEDORES_API_URL}?forSelect=true`; // <-- Usa el nuevo query param

    console.log(`${logPrefix} Calling GET ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store", // Quizás quieras cachear esta lista si no cambia mucho
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudo obtener la lista de proveedores.`
            );
        }
        if (!Array.isArray(data)) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: La respuesta no es un array. Response:`,
                data
            );
            throw new Error("Respuesta inesperada del servidor.");
        }

        console.log(`${logPrefix} Success. Received ${data.length} options.`);
        return data as { id: number; label: string }[];
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};
/**
 * Obtiene la lista de contratos.
 * Si se proporciona idProveedor, filtra para ese proveedor (confiando en el cliente).
 * Si no se proporciona idProveedor, obtiene todos los contratos (simulando vista admin, ¡inseguro!).
 * @param {number} [idProveedor] - (Opcional) ID del proveedor para filtrar la lista.
 * @returns {Promise<ContratoEnLista[]>} - Una promesa que resuelve a un array de contratos resumidos.
 * @throws {Error} - Si ocurre un error durante la solicitud o el procesamiento.
 */
export const fetchContracts = async (
    idProveedor?: number
): Promise<ContratoEnLista[]> => {
    let apiUrl = CONTRATOS_API_URL;
    const logPrefix = "FETCH fetchContracts:";

    if (typeof idProveedor === "number" && !isNaN(idProveedor)) {
        apiUrl += `?idProveedor=${idProveedor}`;
        console.log(
            `${logPrefix} Calling GET ${apiUrl} (filtrando para proveedor ${idProveedor})`
        );
    } else {
        console.log(
            `${logPrefix} Calling GET ${apiUrl} (obteniendo todos - ¡sin filtro de proveedor!)`
        );
    }

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // No hay headers de sesión/auth aquí según el requisito
            },
            cache: "no-store", // Para obtener la lista actualizada
        });

        const data = await response.json().catch(() => null); // Intentar parsear siempre

        if (!response.ok) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudo obtener la lista de contratos.`
            );
        }
        if (!Array.isArray(data)) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Respuesta no es un array. Response:`,
                data
            );
            throw new Error(
                "Respuesta inesperada del servidor al obtener contratos."
            );
        }

        console.log(`${logPrefix} Success. Received ${data.length} contracts.`);
        return data as ContratoEnLista[]; // Castear al tipo esperado
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido en fetch"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow; // Re-lanzar para el componente
    }
};

/**
 * Obtiene los detalles completos de un contrato específico por su ID.
 * No hay verificación de propiedad del contrato en esta versión simplificada.
 * @param {number} idContrato - El ID del contrato a obtener.
 * @returns {Promise<ContratoDetallado>} - Una promesa que resuelve con los datos detallados del contrato.
 * @throws {Error} - Si el ID es inválido, no se encuentra el contrato, o hay un error de red/API.
 */
export const fetchContractDetails = async (
    idContrato: number
): Promise<ContratoDetallado> => {
    const logPrefix = `FETCH fetchContractDetails (ID: ${idContrato}):`;
    const apiUrl = `${CONTRATOS_API_URL}/${idContrato}`;

    if (typeof idContrato !== "number" || isNaN(idContrato)) {
        const errorMsg = `${logPrefix} Error: ID de contrato inválido.`;
        console.error(errorMsg);
        throw new Error("ID de contrato inválido.");
    }

    console.log(`${logPrefix} Calling GET ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store", // Para detalles específicos, evitar caché suele ser bueno
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            // Manejar 404 específicamente
            if (response.status === 404) {
                throw new Error(
                    data?.message || `Contrato con ID ${idContrato} no encontrado.`
                );
            }
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudieron obtener los detalles del contrato.`
            );
        }
        if (!data || typeof data !== "object" || data === null) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Respuesta inválida del servidor. Response:`,
                data
            );
            throw new Error(
                "Respuesta inesperada del servidor al obtener detalles del contrato."
            );
        }

        console.log(`${logPrefix} Success.`);
        return data as ContratoDetallado; // Castear al tipo esperado
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido en fetch"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Crea un nuevo contrato enviando los datos a la API.
 * No hay verificación de rol en esta versión simplificada.
 * @param {ContratoCreateData} contratoData - Objeto con los datos para crear el contrato.
 * @returns {Promise<{ id_contrato: number }>} - Una promesa que resuelve con el ID del contrato creado.
 * @throws {Error} - Si la validación de datos falla o la API devuelve un error.
 */
export const createContractRequest = async (
    contratoData: ContratoCreateData
): Promise<{ id_contrato: number }> => {
    const logPrefix = "FETCH createContractRequest:";
    const apiUrl = CONTRATOS_API_URL;

    // Validación básica en cliente (la API también validará)
    if (
        !contratoData ||
        typeof contratoData.id_proveedor !== "number" ||
        !contratoData.objeto_contrato ||
        !contratoData.monto_total
    ) {
        const errorMsg = `${logPrefix} Error: Faltan datos requeridos (id_proveedor, objeto_contrato, monto_total).`;
        console.error(errorMsg, "Data:", contratoData);
        throw new Error("Faltan datos requeridos para crear el contrato.");
    }
    if (isNaN(parseFloat(contratoData.monto_total))) {
        throw new Error("El monto total debe ser un número válido.");
    }

    console.log(`${logPrefix} Calling POST ${apiUrl}`);
    console.log(`${logPrefix} Payload:`, JSON.stringify(contratoData, null, 2));

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contratoData),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                `${logPrefix} Error POST ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            // Manejar errores específicos de la API (ej: 400 Bad Request, 409 Conflict)
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudo crear el contrato.`
            );
        }
        if (!data || typeof data.id_contrato !== "number") {
            console.error(
                `${logPrefix} Error POST ${apiUrl}: Respuesta inválida tras creación exitosa. Response:`,
                data
            );
            throw new Error(
                "Respuesta inesperada del servidor tras crear el contrato."
            );
        }

        console.log(`${logPrefix} Success. New contract ID: ${data.id_contrato}`);
        return data; // Devuelve { id_contrato: number }
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido en fetch"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * Actualiza un contrato existente enviando los datos modificados a la API.
 * No hay verificación de rol en esta versión simplificada.
 * @param {number} idContrato - El ID del contrato a actualizar.
 * @param {ContratoUpdateData} contratoData - Objeto con los campos a actualizar.
 * @returns {Promise<ContratoDetallado>} - Una promesa que resuelve con los datos completos del contrato actualizado.
 * @throws {Error} - Si la validación falla, el contrato no se encuentra, o la API devuelve un error.
 */
export const updateContractRequest = async (
    idContrato: number,
    contratoData: ContratoUpdateData
): Promise<ContratoDetallado> => {
    const logPrefix = `FETCH updateContractRequest (ID: ${idContrato}):`;
    const apiUrl = `${CONTRATOS_API_URL}/${idContrato}`;

    // Validaciones
    if (typeof idContrato !== "number" || isNaN(idContrato)) {
        const errorMsg = `${logPrefix} Error: ID de contrato inválido.`;
        console.error(errorMsg);
        throw new Error("ID de contrato inválido.");
    }
    if (!contratoData || Object.keys(contratoData).length === 0) {
        const errorMsg = `${logPrefix} Error: No se proporcionaron datos para actualizar.`;
        console.error(errorMsg);
        throw new Error("No se proporcionaron datos para actualizar.");
    }
    if (
        contratoData.monto_total !== undefined &&
        isNaN(parseFloat(contratoData.monto_total))
    ) {
        throw new Error("Si se incluye monto_total, debe ser un número válido.");
    }

    console.log(`${logPrefix} Calling PUT ${apiUrl}`);
    console.log(`${logPrefix} Payload:`, JSON.stringify(contratoData, null, 2));

    try {
        const response = await fetch(apiUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contratoData),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                `${logPrefix} Error PUT ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            if (response.status === 404) {
                throw new Error(
                    data?.message ||
                    `Contrato con ID ${idContrato} no encontrado para actualizar.`
                );
            }
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudo actualizar el contrato.`
            );
        }
        if (!data || typeof data !== "object" || data === null) {
            console.error(
                `${logPrefix} Error PUT ${apiUrl}: Respuesta inválida del servidor tras actualización. Response:`,
                data
            );
            throw new Error(
                "Respuesta inesperada del servidor al actualizar el contrato."
            );
        }

        console.log(`${logPrefix} Success.`);
        return data as ContratoDetallado; // Devuelve el objeto contrato actualizado
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido en fetch"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};
// *** NUEVA FUNCIÓN PARA GENERAR WORD ***
/**
 * Llama a la API para generar un documento Word para un contrato específico.
 * Inicia la descarga del archivo en el navegador.
 * @param {number} idContrato - El ID del contrato.
 * @param {'servicio' | 'adquisicion'} templateType - El tipo de plantilla a usar.
 * @returns {Promise<void>}
 * @throws {Error} Si la API devuelve un error o la descarga falla.
 */
export const generateContractWord = async (
    idContrato: number,
    templateType: "servicio" | "adquisicion"
): Promise<void> => {
    const logPrefix = `FETCH generateContractWord (ID: ${idContrato}, Template: ${templateType}):`;
    const apiUrl = `${CONTRATOS_API_URL}/${idContrato}/generar-word?template=${templateType}`;

    console.log(`${logPrefix} Calling GET ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            // No necesita body, la info va en la URL
            headers: {
                // Podrías necesitar enviar un token de autenticación si tu API está protegida
                // 'Authorization': `Bearer ${your_token}`
            },
        });

        if (!response.ok) {
            // Intenta leer el error como JSON si es posible
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // Si no es JSON, usa el texto del status
                errorData = {
                    message: `Error ${response.status}: ${response.statusText}`,
                };
            }
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`,
                errorData
            );
            throw new Error(
                errorData?.message ||
                `Error ${response.status}: No se pudo generar el documento.`
            );
        }

        // Si la respuesta es OK, esperamos un blob (el archivo .docx)
        const blob = await response.blob();

        // Extraer nombre de archivo del header Content-Disposition si existe, o crear uno
        const contentDisposition = response.headers.get("content-disposition");
        let filename = `Contrato_${idContrato}_${templateType}.docx`; // Default
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }
        console.log(
            `${logPrefix} Received blob, attempting download as: ${filename}`
        );

        // Crear un enlace temporal para iniciar la descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // Necesario para Firefox
        a.click();

        // Limpiar
        a.remove();
        window.URL.revokeObjectURL(url);

        console.log(`${logPrefix} Download initiated.`);
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};

/**
 * (Opcional) Elimina un contrato específico.
 * ¡ADVERTENCIA! Esta operación es destructiva y no tiene verificación de rol.
 * @param {number} idContrato - El ID del contrato a eliminar.
 * @returns {Promise<void>} - Una promesa que resuelve cuando la eliminación es exitosa.
 * @throws {Error} - Si el ID es inválido, el contrato no se encuentra, o la API devuelve un error (ej: por restricciones FK).
 */
/*
export const deleteContractRequest = async (idContrato: number): Promise<void> => {
    const logPrefix = `FETCH deleteContractRequest (ID: ${idContrato}):`;
    const apiUrl = `${CONTRATOS_API_URL}/${idContrato}`;

    if (typeof idContrato !== 'number' || isNaN(idContrato)) {
        const errorMsg = `${logPrefix} Error: ID de contrato inválido.`;
        console.error(errorMsg);
        throw new Error('ID de contrato inválido.');
    }

    console.log(`${logPrefix} Calling DELETE ${apiUrl} (¡SIN VERIFICACIÓN!)`);

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        // DELETE exitoso suele devolver 204 No Content (sin body) o 200 OK (con body opcional)
        if (!response.ok && response.status !== 204) {
            const data = await response.json().catch(() => null);
            console.error(`${logPrefix} Error DELETE ${apiUrl}: Status ${response.status}. Response:`, data);
             if (response.status === 404) {
                 throw new Error(data?.message || `Contrato con ID ${idContrato} no encontrado para eliminar.`);
            }
            // Podría haber errores 400 o 409 si hay restricciones
            throw new Error(data?.message || `Error ${response.status}: No se pudo eliminar el contrato.`);
        }

        console.log(`${logPrefix} Success.`);
        // No se devuelve nada en caso de éxito (o un mensaje simple si la API devuelve algo)

    } catch (error) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido en fetch'));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};
*/
