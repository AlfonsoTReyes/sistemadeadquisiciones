// app/recibo/[referencia]/page.tsx
import { notFound } from 'next/navigation';
import { ReciboData } from '@/types/pago';

async function fetchRecibo(referencia: string): Promise<ReciboData | null> {
    // ... (lógica fetch sin cambios) ...
     const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pagos/recibo?ref=${encodeURIComponent(referencia)}&format=json`;
    console.log(`Recibo Page: Fetching ${apiUrl}`);
    try {
        const res = await fetch(apiUrl, { cache: 'no-store', headers: { 'Accept': 'application/json' } });
        if (res.status === 404) { return null; }
        if (!res.ok) {
            let errorMsg = `Error ${res.status} al obtener recibo`;
            try { const errorData = await res.json(); errorMsg = errorData.message || errorMsg; } catch (e) {}
            throw new Error(errorMsg);
        }
        const data: ReciboData = await res.json();
        return data;
    } catch (error: any) {
        console.error(`Error fetching recibo para ref ${referencia}:`, error);
        throw new Error(error.message || 'No se pudo cargar la información del recibo.');
    }
}

interface PageProps { params: { referencia: string } }

export default async function ReciboPage({ params }: PageProps) {
    const { referencia } = params;
    if (!referencia) notFound();

    let reciboData: ReciboData | null = null;
    let fetchError: string | null = null;

    try {
        reciboData = await fetchRecibo(decodeURIComponent(referencia));
    } catch (error: any) {
        fetchError = error.message;
    }

    // --- Renderizado ---

    if (fetchError) {
        return (
            <div className="container mx-auto p-6 max-w-2xl my-8 border rounded-lg shadow-sm">
                <h1 className="text-2xl font-semibold text-red-600 mb-4">Error al Cargar Recibo</h1>
                <p className="text-gray-700 mb-2">No se pudo cargar la información del recibo para la referencia: <span className="font-mono bg-red-100 px-1 rounded">{decodeURIComponent(referencia)}</span></p>
                <p className="text-sm text-red-500">Detalle: {fetchError}</p>
            </div>
        );
    }

    if (!reciboData) {
         return (
             <div className="container mx-auto p-6 max-w-2xl my-8 border rounded-lg shadow-sm">
                <h1 className="text-2xl font-semibold text-orange-600 mb-4">Recibo no Encontrado</h1>
                <p className="text-gray-700">No se encontró un recibo para la referencia: <span className="font-mono bg-orange-100 px-1 rounded">{decodeURIComponent(referencia)}</span>.</p>
                <p className="text-sm text-gray-500 mt-2">Verifica la referencia o contacta a soporte.</p>
            </div>
        );
    }

    // Mostrar Recibo con Tailwind
    return (
        <div className="container mx-auto p-8 max-w-3xl my-10 border rounded-xl shadow-lg bg-white">
            <div className="text-center mb-8">
                {/* Puedes añadir un logo aquí */}
                 <h1 className="text-3xl font-bold text-gray-800 mb-2">{reciboData.titulo || 'Recibo de Pago'}</h1>
                 <p className="text-sm text-gray-500">Folio: {reciboData.folioRecibo || 'N/A'}</p>
                 <p className="text-sm text-gray-500">Fecha: {reciboData.fechaHora ? new Date(reciboData.fechaHora).toLocaleString() : 'N/A'}</p>
                 <p className="text-sm text-gray-500">Referencia: <span className="font-mono">{reciboData.pago?.referencia || 'N/A'}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Sección Cliente */}
                <div className="border-t pt-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Cliente</h2>
                    <p><strong className="font-medium text-gray-600">Nombre:</strong> {reciboData.cliente?.nombre || 'N/A'}</p>
                    <p><strong className="font-medium text-gray-600">Correo:</strong> {reciboData.cliente?.correo || 'N/A'}</p>
                </div>

                 {/* Sección Pago */}
                 <div className="border-t pt-4">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Pago</h2>
                    <p><strong className="font-medium text-gray-600">Monto:</strong> <span className="font-semibold text-lg">${reciboData.pago?.monto?.toFixed(2) ?? '0.00'} MXN</span></p>
                    <p><strong className="font-medium text-gray-600">Fecha Pago:</strong> {reciboData.pago?.fecha ? new Date(reciboData.pago.fecha+'T00:00:00').toLocaleDateString() : 'N/A'}</p>
                    <p><strong className="font-medium text-gray-600">Autorización:</strong> {reciboData.pago?.autorizacion || 'N/A'}</p>
                 </div>
            </div>

             {/* Sección Concepto */}
             <div className="border-t pt-4 mb-6">
                 <h2 className="text-lg font-semibold text-gray-700 mb-2">Concepto</h2>
                 <p><strong className="font-medium text-gray-600">Trámite:</strong> {reciboData.concepto?.tramite || 'N/A'}</p>
                 <p><strong className="font-medium text-gray-600">Descripción:</strong> {reciboData.concepto?.descripcion || 'N/A'}</p>
             </div>

             {/* Sección Emisor */}
             {reciboData.emisor && (
                 <div className="border-t pt-4 text-center text-xs text-gray-500">
                     <p>{reciboData.emisor.nombre || 'N/A'}</p>
                     <p>RFC: {reciboData.emisor.rfc || 'N/A'}</p>
                 </div>
             )}

             {/* Botones Opcionales */}
             {/* <div className="mt-8 text-center">
                 <button onClick={() => window.print()} className="mr-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Imprimir</button>
                 <a href={`/api/pagos/recibo?ref=${referencia}&format=pdf`} target="_blank" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Descargar PDF</a>
             </div> */}
        </div>
    );
}