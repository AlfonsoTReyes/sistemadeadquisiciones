// src/components/contratos/ContractDetailView.tsx
import React from 'react';
import { ContratoDetallado } from '@/types/contrato'; // Ajusta ruta
import ContractProviderInfo from './ContractProviderInfo';

interface ContractDetailViewProps {
    contrato: ContratoDetallado | null | undefined;
    isLoading?: boolean;
    error?: string | null;
}

const ContractDetailView: React.FC<ContractDetailViewProps> = ({ contrato, isLoading, error }) => {
    // ... (manejo de isLoading, error, funciones formatDate/formatCurrency sin cambios) ...
    if (isLoading) return <p>Cargando...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!contrato) return <p>No hay datos.</p>;

    // Funciones auxiliares (puedes moverlas a un archivo de utils si las usas en más sitios)
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
         try {
            const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z'); // Asumir UTC si no hay T
            return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        } catch (e) { return 'Fecha inválida'; }
    };

    const formatCurrency = (amount: string | null, currency: string | null = 'MXN') => {
        if (amount === null || amount === undefined) return 'N/A';
        const numberAmount = parseFloat(amount);
        if (isNaN(numberAmount)) return 'Valor inválido';
        return numberAmount.toLocaleString('es-MX', { style: 'currency', currency: currency ?? 'MXN' });
    };


    return (
        <div className="space-y-6 p-4 border rounded shadow-sm bg-white">
            {/* Sección 1: Datos Generales */}
            <section>
                <h2 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-700">Datos Generales del Contrato</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div><strong>Núm. Contrato:</strong> <span className="text-gray-800">{contrato.numero_contrato ?? 'N/A'}</span></div>
                    <div><strong>ID Contrato:</strong> <span className="text-gray-600">{contrato.id_contrato}</span></div>

                    {/* --- CAMPOS MODIFICADOS --- */}
                    <div>
                        <strong>Concurso:</strong>
                        <span className="text-gray-800 ml-1">{contrato.concurso_display ?? 'N/A'}</span>
                        {/* Podrías hacer esto un Link si tienes una página de detalle de concurso */}
                        {/* {contrato.id_concurso && <Link href={`/admin/concursos/${contrato.id_concurso}`}> ({contrato.id_concurso})</Link>} */}
                    </div>
                    <div>
                        <strong>Solicitud:</strong>
                         {/* Ajusta según tengas numero_solicitud o solo el display */}
                        <span className="text-gray-800 ml-1">{contrato.solicitud_display ?? 'N/A'}</span>
                        {/* {contrato.id_solicitud && <Link href={`/admin/solicitudes/${contrato.id_solicitud}`}> ({contrato.id_solicitud})</Link>} */}
                    </div>
                    <div>
                        <strong>Dictamen:</strong>
                         {/* Ajusta según tengas resultado_dictamen o solo el display */}
                        <span className="text-gray-800 ml-1">{contrato.dictamen_display ?? 'N/A'}</span>
                        {/* {contrato.id_dictamen && <Link href={`/admin/dictamenes/${contrato.id_dictamen}`}> ({contrato.id_dictamen})</Link>} */}
                    </div>
                     {/* --- FIN CAMPOS MODIFICADOS --- */}

                </div>
            </section>

            {/* ... (Resto de las secciones: Objeto, Vigencia/Monto, Condiciones, Garantías sin cambios) ... */}
             <section>
                 <h3 className="text-md font-semibold mb-1 text-gray-700">Objeto del Contrato</h3>
                 <p className="text-sm text-gray-800 bg-gray-50 p-3 border rounded">{contrato.objeto_contrato || 'N/A'}</p>
            </section>
             <section className="pt-4 border-t">
                <h3 className="text-md font-semibold mb-2 text-gray-700">Vigencia y Monto</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                     <div><strong>Fecha Firma:</strong> <span className="text-gray-800">{formatDate(contrato.fecha_firma)}</span></div>
                     <div><strong>Fecha Inicio:</strong> <span className="text-gray-800">{formatDate(contrato.fecha_inicio)}</span></div>
                     <div><strong>Fecha Fin:</strong> <span className="text-gray-800">{formatDate(contrato.fecha_fin)}</span></div>
                     <div className="sm:col-span-2"><strong>Monto Total:</strong><span className="text-gray-900 font-medium ml-1">{formatCurrency(contrato.monto_total, contrato.moneda)}</span><span className="text-gray-500 text-xs ml-1">({contrato.moneda ?? 'MXN'})</span></div>
                 </div>
            </section>
            {(contrato.condiciones_pago || contrato.garantias) && (
                <section className="pt-4 border-t">
                     {contrato.condiciones_pago && (
                         <div className="mb-4">
                             <h3 className="text-md font-semibold mb-1 text-gray-700">Condiciones de Pago</h3>
                             <p className="text-sm text-gray-800 bg-gray-50 p-3 border rounded">{contrato.condiciones_pago}</p>
                         </div>
                     )}
                      {contrato.garantias && (
                         <div>
                             <h3 className="text-md font-semibold mb-1 text-gray-700">Garantías</h3>
                             <p className="text-sm text-gray-800 bg-gray-50 p-3 border rounded">{contrato.garantias}</p>
                         </div>
                     )}
                </section>
            )}

            {/* Sección Proveedor (sin cambios) */}
            <section className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Proveedor Asociado</h2>
                <ContractProviderInfo proveedor={contrato.proveedor} />
            </section>

        </div>
    );
};

export default ContractDetailView;