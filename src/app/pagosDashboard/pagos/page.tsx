// app/dashboard/pagos/page.tsx
import Link from 'next/link';
import { getAllPagosLocales } from '@/services/pago/pagoLocalService';
import { PagoLocal } from '@/types/pago';

// Función auxiliar para clases de estado (Tailwind)
const getEstadoClasses = (estado: string): string => {
    switch (estado) {
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'proxy_webhook_llamado':
             return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'confirmado_por_notificacion': // (Si usas opción B)
             return 'bg-green-100 text-green-800 border-green-300';
        case 'fallido':
        case 'error':
            return 'bg-red-100 text-red-800 border-red-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};


export default async function PagosDashboardPage() {
    let pagos: PagoLocal[] = [];
    let fetchError: string | null = null;

    try {
        pagos = await getAllPagosLocales(50);
    } catch (error: any) {
        fetchError = error.message || 'Error desconocido al cargar los pagos.';
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Historial de Pagos Iniciados</h1>

            {fetchError && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
                    <span className="font-medium">Error:</span> {fetchError}
                </div>
            )}

            {pagos.length === 0 && !fetchError && (
                 <div className="p-4 text-sm text-blue-700 bg-blue-100 rounded-lg border border-blue-300" role="alert">
                    No se encontraron registros de pagos iniciados.
                </div>
            )}

            {pagos.length > 0 && (
                <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="py-3 px-6">Referencia</th>
                                <th scope="col" className="py-3 px-6">Trámite</th>
                                <th scope="col" className="py-3 px-6">Monto</th>
                                <th scope="col" className="py-3 px-6">Estado</th>
                                <th scope="col" className="py-3 px-6">Fecha Creación</th>
                                <th scope="col" className="py-3 px-6">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map((pago) => (
                                <tr key={pago.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="py-4 px-6 font-mono text-xs">{pago.referencia}</td>
                                    <td className="py-4 px-6">{pago.tramite || '-'}</td>
                                    <td className="py-4 px-6">${pago.monto?.toFixed(2) ?? 'N/A'}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getEstadoClasses(pago.estado)}`}>
                                            {pago.estado}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-xs">{new Date(pago.fecha_creacion).toLocaleString()}</td>
                                    <td className="py-4 px-6">
                                        {(pago.estado === 'confirmado_por_notificacion' || pago.estado === 'proxy_webhook_llamado') && (
                                            <Link href={`/recibo/${pago.referencia}`} className="font-medium text-blue-600 hover:underline">
                                                Ver Recibo
                                            </Link>
                                        )}
                                        {/* Otras acciones */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}