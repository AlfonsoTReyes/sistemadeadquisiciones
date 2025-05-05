// src/lib/fetchUtils.ts (NUEVO ARCHIVO)

/**
 * Procesa la respuesta de una llamada fetch.
 * Parsea el JSON si la respuesta es OK, de lo contrario lanza un error con el mensaje del servidor.
 * @param response - La respuesta del fetch.
 * @returns {Promise<T>} - Promesa que resuelve con los datos parseados o es rechazada con un error.
 */
export const handleFetchResponse = async <T>(response: Response): Promise<T> => { // <--- AÑADIR EXPORT
    if (response.status === 204) { // No Content
        return undefined as unknown as T;
    }

    // Intentar parsear como JSON siempre, incluso en errores, para obtener mensajes
    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        // Si no es JSON válido (ej. error 500 con HTML), data seguirá siendo null
        console.warn("Response body could not be parsed as JSON.");
    }


    if (!response.ok) {
        // Intenta obtener un mensaje de error específico del cuerpo JSON, si no, usa statusText
        const errorMessage = data?.message || data?.error || response.statusText || `Error ${response.status}`;
        console.error("API Fetch Error:", errorMessage, data); // Loguear el error completo
        throw new Error(errorMessage);
    }

    // Si la respuesta es OK pero no había cuerpo JSON (raro para GET/POST, posible para otros)
    if (data === null && response.ok) {
        console.warn("API Fetch OK but no JSON body found.");
        // Decide qué devolver, quizás null o un objeto vacío dependiendo del caso de uso
        // Para la mayoría de los casos, si esperas datos, esto podría ser un error.
        // Por ahora, devolvemos null, pero podrías lanzar un error si siempre esperas data.
        return null as unknown as T;
    }

    return data as T;
};