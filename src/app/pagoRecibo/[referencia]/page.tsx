// app/pagoRecibo/[referencia]/page.tsx
import { notFound } from 'next/navigation';
import { ReciboData } from '@/types/pago';
export const dynamic = 'force-dynamic';
async function fetchRecibo(referencia: string): Promise<ReciboData | null> {
    // ... (your fetchRecibo function remains the same)
    const internalApiUrl = `/api/pagos/recibo?ref=${encodeURIComponent(referencia)}&format=json`;
    const absoluteApiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${internalApiUrl}`;
    console.log(`Recibo Page: Fetching ${absoluteApiUrl}`);
    try {
        const res = await fetch(absoluteApiUrl, { cache: 'no-store', headers: { 'Accept': 'application/json' }});
        if (res.status === 404) return null;
        if (!res.ok) {
            let errorMsg = `Error ${res.status}`;
            try { const ed = await res.json(); errorMsg = ed.message || errorMsg; } catch {}
            throw new Error(errorMsg);
        }
        return await res.json();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'No se pudo cargar la información del recibo.';
        throw new Error(message);
    }
}

// --- El Server Component ---
// Try with a very generic props type, or even 'any' temporarily for diagnosis
export default async function ReciboPage(props: any) { // TEMPORARY: Use 'any' for props
    // Access params with optional chaining and type assertion if using 'any'
    const encodedReferencia = props.params?.referencia as string | undefined;

    if (!encodedReferencia) {
        console.log("ReciboPage: encodedReferencia is missing from props.params", props.params);
        notFound();
    }

    const decodedReferencia = decodeURIComponent(encodedReferencia);

    let reciboData: ReciboData | null = null;
    let fetchError: string | null = null;

    try {
        reciboData = await fetchRecibo(decodedReferencia);
    } catch (error: unknown) {
        fetchError = error instanceof Error ? error.message : "Error desconocido al obtener recibo.";
    }

    // ... (rest of your rendering logic for fetchError, !reciboData, and reciboData)
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
            <div className="mt-6 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Detalles del Pago</h2>
                <p><strong>Concepto:</strong> {reciboData.concepto?.descripcion || 'N/A'}</p>
                <p><strong>Monto:</strong> {reciboData.pago?.monto !== undefined ? `${reciboData.pago.monto.toFixed(2)} ${reciboData.pago.moneda || 'MXN'}` : 'N/A'}</p>
                <p><strong>Método de Pago:</strong> {reciboData.pago?.metodo || 'N/A'}</p>
                {/*<p><strong>Estado del Pago:</strong> {reciboData.pago?.estado || 'N/A'}</p>*/}
            </div>
        </div>
    );
}