// src/lib/fetchApi.ts

/**
 * @fileoverview Helper unificado para realizar llamadas fetch a las API Routes internas
 * de la aplicación Next.js (ubicadas bajo /api). Simplifica la configuración
 * de cabeceras, manejo de métodos (GET/POST basado en data) y procesamiento
 * básico de respuestas y errores JSON.
 */

/**
 * Opciones extendidas para la función `fetchApi`, basadas en `RequestInit`
 * pero añadiendo una propiedad `data` para simplificar el envío de cuerpos JSON.
 */
interface FetchApiOptions extends RequestInit {
    /**
     * Datos a enviar en el cuerpo de la solicitud (para métodos POST, PUT, etc.).
     * Si se proporciona `data`, el método por defecto será 'POST'.
     * El objeto `data` será serializado como JSON.
     * @type {any}
     * @optional
     */
    data?: any;
}

/**
 * Realiza una llamada fetch a un endpoint de la API interna de Next.js.
 * Automáticamente prefija el endpoint con '/api'.
 * Configura cabeceras para JSON y maneja el cuerpo de la solicitud si se proporciona `data`.
 * Parsea la respuesta como JSON si es exitosa y tiene el Content-Type correcto.
 * Lanza un Error si la respuesta no es 'ok' (status >= 400), intentando incluir
 * el mensaje de error del cuerpo de la respuesta si está disponible.
 * Maneja respuestas 204 No Content o no JSON devolviendo un objeto vacío.
 *
 * @async
 * @template T - El tipo esperado de la respuesta JSON exitosa. Por defecto es `any`.
 * @param {string} endpoint - La ruta del endpoint de la API interna (ej: '/pagos/iniciar', '/usuarios'). No incluir '/api'.
 * @param {FetchApiOptions} [options={}] - Opciones de configuración para `fetch`, extendidas con la propiedad `data`.
 * @returns {Promise<T>} Una promesa que resuelve con los datos JSON de la respuesta parseada.
 * @throws {Error} Lanza un error si la llamada fetch falla, si la respuesta no es 'ok',
 *                 o si ocurre un error durante el procesamiento. El mensaje de error
 *                 intentará ser descriptivo basado en la respuesta del servidor.
 *
 * @example
 * // Llamada GET
 * const usuarios = await fetchApi<Usuario[]>('/usuarios');
 *
 * // Llamada POST con datos
 * const nuevoPago = await fetchApi<PagoLocal>('/pagos/registrar', {
 *   method: 'POST', // Opcional si 'data' está presente
 *   data: { referencia: 'REF123', monto: 50.00 }
 * });
 *
 * // Llamada con cabeceras personalizadas
 * const datosProtegidos = await fetchApi('/datos-protegidos', {
 *   headers: { 'Authorization': 'Bearer TOKEN_JWT' }
 * });
 */
export async function fetchApi<T = any>(
    endpoint: string,
    options: FetchApiOptions = {}
): Promise<T> {
    // Construye la URL completa de la API interna
    const url = `/api${endpoint}`;
    // Separa la opción 'data' del resto de opciones de fetch
    const { data, ...fetchOptions } = options;

    // Configuración base para la solicitud fetch
    const config: RequestInit = {
        // Método: Usa el proporcionado, o POST si hay 'data', o GET por defecto
        method: options.method || (data ? 'POST' : 'GET'),
        headers: {
            // Establece cabeceras por defecto para JSON
            'Content-Type': 'application/json',
            'Accept': 'application/json', // Indica que esperamos JSON de vuelta
            // Permite sobrescribir o añadir cabeceras desde las opciones
            ...options.headers,
        },
        // Incluye cualquier otra opción de fetch (cache, credentials, etc.)
        ...fetchOptions,
    };

    // Si se proporcionaron datos, serializarlos como JSON y añadirlos al cuerpo
    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        // Realizar la llamada fetch
        const response = await fetch(url, config);
        // Obtener el tipo de contenido de la respuesta para validación
        const contentType = response.headers.get('content-type');

        // --- Manejo de Errores (Respuesta no OK) ---
        if (!response.ok) { // status < 200 || status >= 300
            let errorData: any; // Para almacenar el cuerpo del error
            let errorMessage: string; // Mensaje final del error

            try {
                // Intentar leer el cuerpo del error (JSON o Texto)
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
            } catch (e) {
                // Si falla la lectura del cuerpo, usar el texto de estado HTTP
                errorData = response.statusText;
            }

            // Construir un mensaje de error descriptivo
            errorMessage = (typeof errorData === 'object' && errorData?.message) // ¿Tiene propiedad 'message'?
                ? errorData.message // Usar mensaje del JSON
                : (typeof errorData === 'string' ? errorData.substring(0, 200) : `Error ${response.status}`); // Usar texto o código

            // Loguear el error detallado en la consola del servidor/cliente
            console.error(`API Error ${response.status} for ${url}:`, errorData);
            // Lanzar un error que será capturado por el código que llamó a fetchApi
            throw new Error(errorMessage);
        }

        // --- Manejo de Respuestas Exitosas pero Especiales ---
        // Si el status es 204 (No Content) o el Content-Type no es JSON,
        // no intentar parsear JSON. Devuelve un objeto vacío tipado.
        if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
            console.warn(`FetchApi: Received non-JSON or empty response (Status: ${response.status}) for ${url}. Returning empty object.`);
            // Se devuelve un objeto vacío casteado al tipo esperado T.
            // El código que llama debe estar preparado para manejar esto si espera datos.
            return {} as T;
        }

        // --- Respuesta Exitosa con JSON ---
        // Si la respuesta es OK y es JSON, parsearla y devolverla
        return await response.json() as T;

    } catch (error: any) {
        // Capturar errores de red, errores lanzados arriba, o errores de parseo JSON
        console.error(`Fetch API failed for ${url}:`, error);
        // Re-lanzar el error para que el código que llama pueda manejarlo
        // Usa el mensaje del error capturado o uno genérico.
        throw new Error(error.message || 'Error de comunicación con el servidor.');
    }
}