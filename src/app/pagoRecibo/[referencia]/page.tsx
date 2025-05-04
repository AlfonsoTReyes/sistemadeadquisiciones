// app/pagoRecibo/[referencia]/page.tsx
import { notFound } from 'next/navigation';
// ---> Verifica la ruta de importación de tipos <---
import { ReciboData } from '@/types/pago';

async function fetchRecibo(referencia: string): Promise<ReciboData | null> {
    // La URL de la API interna de Next.js
    const internalApiUrl = `/api/pagos/recibo?ref=${encodeURIComponent(referencia)}&format=json`;
    // Para fetch del lado del servidor, necesitamos la URL absoluta
    const absoluteApiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${internalApiUrl}`;

    console.log(`Recibo Page: Fetching ${absoluteApiUrl}`);
    try {
        // Usar la URL absoluta para el fetch del lado del servidor
        const res = await fetch(absoluteApiUrl, {
             cache: 'no-store',
             headers: { 'Accept': 'application/json' }
             });

        if (res.status === 404) {
            console.log(`Recibo Page: API devolvió 404 para ref ${referencia}`);
            return null; // Recibo no encontrado
        }

        if (!res.ok) { // Maneja otros errores (incluyendo el 405)
            let errorMsg = `Error ${res.status} (${res.statusText}) al obtener recibo desde ${internalApiUrl}`;
            try {
                 const errorData = await res.json();
                 // Incluir mensaje del error de la API si existe
                 errorMsg = errorData.message ? `${errorMsg}: ${errorData.message}` : errorMsg;
            } catch (e) { /* No hacer nada si no es JSON */ }
             console.error(`Recibo Page: Error en fetchRecibo - ${errorMsg}`);
            throw new Error(errorMsg); // Lanza el error para que el componente lo capture
        }

        const data: ReciboData = await res.json();
        return data;

    } catch (error: any) {
        // Loguea el error original que puede venir del fetch o del throw anterior
        console.error(`Recibo Page: Catch en fetchRecibo para ref ${referencia}:`, error);
        // Re-lanza el error para que el componente lo maneje
        throw new Error(error.message || 'No se pudo cargar la información del recibo.');
    }
}

interface PageProps { params: { referencia: string } }

// --- El Server Component ---
export default async function ReciboPage({ params }: PageProps) {
    // Accede a params.referencia directamente cuando lo necesites
    const encodedReferencia = params.referencia; // La referencia viene URL-encoded de la ruta

    if (!encodedReferencia) {
        notFound();
    }

    // Decodifica la referencia para mostrarla y pasarla al fetch
    const decodedReferencia = decodeURIComponent(encodedReferencia);

    let reciboData: ReciboData | null = null;
    let fetchError: string | null = null;

    try {
        // Pasa la referencia decodificada a la función fetch
        reciboData = await fetchRecibo(decodedReferencia);
    } catch (error: any) {
        fetchError = error.message; // Captura el error lanzado por fetchRecibo
    }


    if (fetchError) {
        return (
            <div className="container mx-auto p-6 max-w-2xl my-8 border rounded-lg shadow-sm">
                <h1 className="text-2xl font-semibold text-red-600 mb-4">Error al Cargar Recibo</h1>
                <p className="text-gray-700 mb-2">No se pudo cargar la información del recibo para la referencia: <span className="font-mono bg-red-100 px-1 rounded">{decodedReferencia}</span></p>
                <p className="text-sm text-red-500">Detalle: {fetchError}</p>
            </div>
        );
    }

    if (!reciboData) {
         return (
             <div className="container mx-auto p-6 max-w-2xl my-8 border rounded-lg shadow-sm">
                <h1 className="text-2xl font-semibold text-orange-600 mb-4">Recibo no Encontrado</h1>
                <p className="text-gray-700">No se encontró un recibo para la referencia: <span className="font-mono bg-orange-100 px-1 rounded">{decodedReferencia}</span>.</p>
                <p className="text-sm text-gray-500 mt-2">Verifica la referencia o contacta a soporte.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 max-w-3xl my-10 border rounded-xl shadow-lg bg-white">
             <div className="text-center mb-8">
                 <h1 className="text-3xl font-bold text-gray-800 mb-2">{reciboData.titulo || 'Recibo de Pago'}</h1>
                 <p className="text-sm text-gray-500">Folio: {reciboData.folioRecibo || 'N/A'}</p>
                 <p className="text-sm text-gray-500">Fecha: {reciboData.fechaHora ? new Date(reciboData.fechaHora).toLocaleString() : 'N/A'}</p>
                 <p className="text-sm text-gray-500">Referencia: <span className="font-mono">{reciboData.pago?.referencia || 'N/A'}</span></p>
            </div>
        </div>
    );
}