// src/lib/fetchApi.ts
interface FetchOptions extends RequestInit {
    data?: any;
}

export async function fetchApi<T = any>(
    endpoint: string, // Endpoint interno (ej: /pagos/iniciar)
    options: FetchOptions = {}
): Promise<T> {
    const url = `/api${endpoint}`;
    const { data, ...fetchOptions } = options;

    const config: RequestInit = {
        method: options.method || (data ? 'POST' : 'GET'),
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...fetchOptions,
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            let errorData;
            try {
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
            } catch (e) {
                errorData = response.statusText;
            }
            const errorMessage = (typeof errorData === 'object' && errorData?.message)
                ? errorData.message
                : (typeof errorData === 'string' ? errorData.substring(0, 200) : `Error ${response.status}`);

            console.error(`API Error ${response.status}:`, errorData);
            throw new Error(errorMessage);
        }

        // Manejar respuestas sin contenido (ej: 204) o no JSON
        if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
            return {} as T; // O devuelve null o un valor específico
        }

        return await response.json() as T;

    } catch (error: any) {
        console.error(`Fetch API failed for ${url}:`, error);
        throw new Error(error.message || 'Error de comunicación con el servidor.');
    }
}