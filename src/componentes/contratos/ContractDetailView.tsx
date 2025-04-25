// src/components/contratos/ContractDetailView.tsx
import React from 'react';
import Link from 'next/link'; // *** Asegúrate de importar Link ***
import { ContratoDetallado } from '@/types/contrato'; // Ajusta ruta
import ContractProviderInfo from './ContractProviderInfo';

interface ContractDetailViewProps {
    contrato: ContratoDetallado | null | undefined;
    isLoading?: boolean;
    error?: string | null;
    // *** AÑADIR PROP PARA RUTA BASE DE ENLACES ***
    linkBasePath?: string; // ej: "/admin" o "/usuariosProveedores"
}

const ContractDetailView: React.FC<ContractDetailViewProps> = ({
    contrato,
    isLoading,
    error,
    linkBasePath = "/admin" // <-- Default a admin, ajústalo si es necesario
}) => {

    if (isLoading) return <p className="text-center p-5 text-gray-500">Cargando detalles...</p>;
    if (error) return <div className="p-3 my-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert"><p className="font-bold">Error:</p><p>{error}</p></div>;
    if (!contrato) return <p className="text-gray-500 italic text-center p-5">No se encontraron datos para este contrato.</p>;

    // Funciones auxiliares
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
            return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        } catch (e) { return 'Fecha inválida'; }
    };
    const formatCurrency = (amount: string | null, currency: string | null = 'MXN') => {
        if (amount === null || amount === undefined) return 'N/A';
        const numberAmount = parseFloat(amount);
        if (isNaN(numberAmount)) return 'Valor inválido';
        return numberAmount.toLocaleString('es-MX', { style: 'currency', currency: currency ?? 'MXN' });
    };

    // *** AÑADIR FUNCIÓN HELPER PARA ENLACES ***
    const renderOptionalLink = (id: number | null | undefined, displayValue: string | null | undefined, entityPath: string) => {
        const textToShow = displayValue ?? (id ? `ID: ${id}` : 'N/A');
        // Solo crea el enlace si hay un ID válido y una ruta base
        if (id && linkBasePath && entityPath) {
            // Asumiendo rutas: /{basePath}/{entityPath}/{id}
            // Ej: /admin/concursos/10
            return (
                <Link href={`${linkBasePath}/${entityPath}/${id}`} className="text-blue-600 hover:underline ml-1" title={`Ver detalle ID ${id}`}>
                    {textToShow}
                </Link>
            );
        }
        // Si no hay ID o ruta, solo muestra el texto
        return <span className="text-gray-800 ml-1">{textToShow}</span>;
    };
    // *** FIN FUNCIÓN HELPER ***

    return (
        <div className="space-y-6 p-4 border rounded shadow-sm bg-white">
            {/* Sección 1: Datos Generales */}
            <section>
                <h2 className="text-lg font-semibold border-b pb-2 mb-3 text-gray-700">Datos Generales del Contrato</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div><strong>Núm. Contrato:</strong> <span className="text-gray-800">{contrato.numero_contrato ?? 'N/A'}</span></div>
                    <div><strong>ID Contrato:</strong> <span className="text-gray-600">{contrato.id_contrato}</span></div>

                    {/* --- USAR renderOptionalLink --- */}
                    <div>
                        <strong>Concurso:</strong>
                        {/* Llama al helper con ID, display_text, y la ruta de concursos */}
                        {renderOptionalLink(contrato.id_concurso, contrato.concurso_display, 'concursos')}
                    </div>
                    <div>
                        <strong>Solicitud:</strong>
                        {/* Llama al helper con ID, display_text, y la ruta de solicitudes */}
                        {renderOptionalLink(contrato.id_solicitud, contrato.solicitud_display, 'solicitudes')}
                    </div>
                    <div>
                        <strong>Dictamen:</strong>
                        {/* Llama al helper con ID, display_text, y la ruta de dictamenes */}
                        {renderOptionalLink(contrato.id_dictamen, contrato.dictamen_display, 'dictamenes')}
                    </div>
                    {/* --- FIN USO --- */}

                </div>
            </section>

            {/* ... (Resto de las secciones: Objeto, Vigencia/Monto, Condiciones, Garantías sin cambios) ... */}
            <section> <h3 className="text-md font-semibold mb-1 text-gray-700">Objeto del Contrato</h3> <p className="text-sm text-gray-800 bg-gray-50 p-3 border rounded">{contrato.objeto_contrato || 'N/A'}</p></section>
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

            {/* Sección Proveedor */}
            <section className="pt-4 border-t">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Proveedor Asociado</h2>
                <ContractProviderInfo proveedor={contrato.proveedor} />
            </section>

        </div>
    );
};

export default ContractDetailView;