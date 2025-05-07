// app/pagoRecibo/[referencia]/page.tsx
import { notFound } from 'next/navigation';
import { ReciboData } from '@/types/pago'; // Ensure this path is correct

async function fetchRecibo(referencia: string): Promise<ReciboData | null> {
    const internalApiUrl = `/api/pagos/recibo?ref=${encodeURIComponent(referencia)}&format=json`;
    const absoluteApiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${internalApiUrl}`;

    console.log(`Recibo Page: Fetching ${absoluteApiUrl}`);
    try {
        const res = await fetch(absoluteApiUrl, {
             cache: 'no-store',
             headers: { 'Accept': 'application/json' }
        });

        if (res.status === 404) {
            console.log(`Recibo Page: API devolvió 404 para ref ${referencia}`);
            return null;
        }
        if (!res.ok) {
            let errorMsg = `Error ${res.status} (${res.statusText}) al obtener recibo desde ${internalApiUrl}`;
            try {
                 const errorData = await res.json();
                 errorMsg = errorData.message ? `${errorMsg}: ${errorData.message}` : errorMsg;
            } catch (e) { /* No hacer nada si no es JSON */ }
            console.error(`Recibo Page: Error en fetchRecibo - ${errorMsg}`);
            throw new Error(errorMsg);
        }
        const data: ReciboData = await res.json();
        return data;
    } catch (error: unknown) { // Changed to unknown
        console.error(`Recibo Page: Catch en fetchRecibo para ref ${referencia}:`, error);
        const message = error instanceof Error ? error.message : 'No se pudo cargar la información del recibo.';
        throw new Error(message);
    }
}

// Remove or comment out your custom PageProps interface
// interface PageProps { params: { referencia: string } }

// --- El Server Component ---
// Let TypeScript infer the type of props, especially params
export default async function ReciboPage({ params }: { params: { referencia: string } }) {
    const encodedReferencia = params.referencia;

    if (!encodedReferencia) {
        // This check might be redundant if 'referencia' is a required dynamic segment,
        // as Next.js would typically 404 before reaching here if it's missing.
        // However, it doesn't hurt as a safeguard.
        notFound();
    }

    const decodedReferencia = decodeURIComponent(encodedReferencia);

    let reciboData: ReciboData | null = null;
    let fetchError: string | null = null;

    try {
        reciboData = await fetchRecibo(decodedReferencia);
    } catch (error: unknown) { // Changed to unknown
        fetchError = error instanceof Error ? error.message : "Error desconocido al obtener recibo.";
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
            {/* Consider adding more fields from ReciboData here */}
            <div className="mt-6 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Detalles del Pago</h2>
                <p><strong>Concepto:</strong> {reciboData.pago?.concepto || 'N/A'}</p>
                <p><strong>Monto:</strong> {reciboData.pago?.monto !== undefined ? `${reciboData.pago.monto.toFixed(2)} ${reciboData.pago.moneda || 'MXN'}` : 'N/A'}</p>
                <p><strong>Método de Pago:</strong> {reciboData.pago?.metodoPago || 'N/A'}</p>
                <p><strong>Estado del Pago:</strong> {reciboData.pago?.estado || 'N/A'}</p>
                {/* Add more details as needed */}
            </div>
        </div>
    );
}