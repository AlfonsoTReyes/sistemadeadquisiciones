// src/components/contratos/ContractDetailView.tsx
import React from 'react';
import Link from 'next/link';
import { ContratoDetallado } from '@/types/contrato';
import ContractProviderInfo from './ContractProviderInfo';
import { SuficienciaInput, AreaRequirenteInput } from '@/types/contratoTemplateData'; // Para leer datos específicos
import { FaFileContract, FaFileInvoiceDollar, FaRegBuilding, FaUserTie, FaCalendarAlt, FaMoneyBillWave, FaShieldAlt, FaInfoCircle } from 'react-icons/fa'; // Iconos de ejemplo

interface ContractDetailViewProps {
    contrato: ContratoDetallado | null | undefined;
    isLoading?: boolean;
    error?: string | null;
    linkBasePath?: string;
}

// --- Componente Auxiliar para Secciones ---
interface DetailSectionProps {
    title: string;
    icon?: React.ReactNode; // Para añadir íconos
    children: React.ReactNode;
    className?: string; // Clases adicionales para el contenedor
}
const DetailSection: React.FC<DetailSectionProps> = ({ title, icon, children, className = '' }) => (
    <section className={`pt-5 mt-5 border-t border-gray-200 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            {icon && <span className="mr-2 text-indigo-600">{icon}</span>}
            {title}
        </h3>
        {children}
    </section>
);

// --- Componente Auxiliar para Pares Clave-Valor ---
interface DetailItemProps {
    label: string;
    value: React.ReactNode | string | null | undefined;
    className?: string; // Clases para el div contenedor
    isFullWidth?: boolean; // Para items que ocupan todo el ancho
}
const DetailItem: React.FC<DetailItemProps> = ({ label, value, className = '', isFullWidth = false }) => (
    <div className={`${isFullWidth ? 'col-span-1 sm:col-span-2 md:col-span-3' : 'col-span-1'} mb-2 ${className}`}>
        <dt className="text-sm font-medium text-gray-500">{label}:</dt>
        <dd className="mt-1 text-sm text-gray-900">{value ?? <span className="italic text-gray-400">N/A</span>}</dd>
    </div>
);


const ContractDetailView: React.FC<ContractDetailViewProps> = ({
    contrato,
    isLoading,
    error,
    linkBasePath = "/admin"
}) => {

    if (isLoading) return <div className="text-center p-6 text-gray-500">Cargando detalles...</div>;
    if (error) return <div className="p-4 my-4 bg-red-100 border border-red-400 text-red-700 rounded shadow" role="alert"><strong className="font-bold">Error:</strong><span className="block sm:inline"> {error}</span></div>;
    if (!contrato) return <p className="text-gray-500 italic text-center p-6">No se encontraron datos para este contrato.</p>;

    // --- Funciones Helper (Sin cambios) ---
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

    // --- Acceso seguro a template_data ---
    const td = contrato.template_data ?? {};
    const suficiencia = td.suficiencia as SuficienciaInput | undefined ?? {};
    const areaRequirente = td.areaRequirente as AreaRequirenteInput | undefined ?? {};

    return (
        // Contenedor principal con sombra y bordes redondeados
        <div className="bg-white shadow-lg rounded-lg overflow-hidden p-6 md:p-8 border border-gray-200">

            {/* Encabezado Principal */}
            <div className="border-b border-gray-200 pb-4 mb-6">
                 <h2 className="text-2xl font-bold text-center text-indigo-700">
                     {td.tipoContrato === 'adquisicion' ? (td.nombreContratoAdquisicion || `Contrato de Adquisición ID: ${contrato.id_contrato}`) :
                      td.tipoContrato === 'servicio' ? (td.objetoPrincipal || `Contrato de Servicio ID: ${contrato.id_contrato}`) :
                      `Contrato ID: ${contrato.id_contrato}` // Fallback
                    }
                 </h2>
                <p className="text-center text-sm text-gray-500 mt-1">
                    Número de Procedimiento: {td.numeroProcedimiento ?? contrato.numero_contrato ?? 'N/A'}
                </p>
            </div>


            {/* --- Sección 1: Datos Generales y Referencias --- */}
            <DetailSection title="Información General" icon={<FaFileContract size={18} />}>
                <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1"> {/* dl/dt/dd para semántica */}
                    <DetailItem label="ID Contrato (Interno)" value={contrato.id_contrato} />
                    <DetailItem label="Artículo Fundamento" value={td.articuloFundamento} />
                    <DetailItem label="Concurso" value={renderOptionalLink(contrato.id_concurso, contrato.concurso_display, 'concursos')} />
                    <DetailItem label="Solicitud" value={renderOptionalLink(contrato.id_solicitud, contrato.solicitud_display, 'solicitudes')} />
                    <DetailItem label="Dictamen" value={renderOptionalLink(contrato.id_dictamen, contrato.dictamen_display, 'dictamenes')} />
                </dl>
            </DetailSection>

            {/* --- Sección 2: Objeto del Contrato --- */}
            <DetailSection title="Objeto del Contrato" icon={<FaInfoCircle size={18} />}>
                <p className="text-base font-medium text-gray-800 mb-2">{td.objetoPrincipal ?? contrato.objeto_contrato ?? 'N/A'}</p>
                 {td.descripcionDetallada && (
                     <div className="text-sm text-gray-700 bg-gray-50 p-4 border border-gray-200 rounded whitespace-pre-wrap">
                         <h4 className="font-semibold mb-1 text-gray-600">Detalles Adicionales:</h4>
                         {td.descripcionDetallada}
                     </div>
                 )}
            </DetailSection>

            {/* --- Sección 3: Vigencia y Montos --- */}
            <DetailSection title="Vigencia y Montos" icon={<FaCalendarAlt size={18} />}>
                 <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                     <DetailItem label="Fecha Inicio" value={formatDate(td.fechaInicio ?? contrato.fecha_inicio)} />
                     <DetailItem label="Fecha Fin" value={formatDate(td.fechaFin ?? contrato.fecha_fin)} />
                      {/* Mostrar Monto Mínimo si es Adquisición */}
                      {td.tipoContrato === 'adquisicion' && (
                         <DetailItem label="Monto Mínimo" value={formatCurrency(td.montoMinimo, td.moneda ?? contrato.moneda)} />
                      )}
                      <DetailItem
                        label={`Monto ${td.tipoContrato === 'adquisicion' ? 'Máximo' : 'Total'}`}
                        value={
                            <span className="font-semibold">
                                {formatCurrency(contrato.monto_total, td.moneda ?? contrato.moneda)}
                                <span className="text-gray-500 text-xs ml-1">({td.moneda ?? contrato.moneda ?? 'MXN'})</span>
                            </span>
                         }
                         // Ocupa más espacio si no hay monto mínimo
                         isFullWidth={td.tipoContrato !== 'adquisicion'}
                      />
                 </dl>
            </DetailSection>

            {/* --- Sección 4: Suficiencia y Área Requirente --- */}
            <DetailSection title="Datos Administrativos" icon={<FaRegBuilding size={18}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                     {/* Columna Suficiencia */}
                     <div>
                        <h4 className="text-md font-semibold text-gray-600 mb-2 border-b pb-1">Suficiencia Presupuestal</h4>
                        <dl className="space-y-1 text-sm">
                             <DetailItem label="Fecha" value={formatDate(suficiencia.fecha)} className='mb-0'/>
                             <DetailItem label="Oficio" value={suficiencia.numeroOficio} className='mb-0'/>
                             <DetailItem label="Cuenta" value={suficiencia.cuenta} className='mb-0'/>
                             <DetailItem label="Recurso" value={suficiencia.tipoRecurso} className='mb-0'/>
                         </dl>
                    </div>
                    {/* Columna Área Requirente */}
                    <div>
                        <h4 className="text-md font-semibold text-gray-600 mb-2 border-b pb-1">Área Requirente</h4>
                        <dl className="space-y-1 text-sm">
                            <DetailItem label="Funcionario" value={areaRequirente.nombreFuncionario} className='mb-0'/>
                            <DetailItem label="Cargo" value={areaRequirente.cargoFuncionario} className='mb-0'/>
                        </dl>
                    </div>
                 </div>
                 {/* Mostrar datos Oficio Petición si es Adquisición */}
                 {td.tipoContrato === 'adquisicion' && (td.oficioPeticionNumero || td.oficioPeticionFecha) && (
                     <div className="mt-4 pt-4 border-t border-dashed">
                         <h4 className="text-md font-semibold text-gray-600 mb-1">Oficio Petición</h4>
                         <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm">
                            {td.oficioPeticionNumero && <DetailItem label="Número" value={td.oficioPeticionNumero} className='mb-0'/>}
                            {td.oficioPeticionFecha && <DetailItem label="Fecha" value={formatDate(td.oficioPeticionFecha)} className='mb-0'/>}
                         </dl>
                     </div>
                 )}
             </DetailSection>

            {/* --- Sección 5: Condiciones y Garantías --- */}
            {(td.condicionesPago || td.garantiasTexto || td.montoGarantiaCumplimiento || td.montoGarantiaVicios) && (
                 <DetailSection title="Condiciones y Garantías" icon={<FaShieldAlt size={18}/>}>
                     {td.condicionesPago && (
                         <div className="mb-4">
                             <h4 className="text-md font-semibold text-gray-600 mb-1">Condiciones de Pago:</h4>
                             <p className="text-sm text-gray-700 bg-gray-50 p-3 border border-gray-200 rounded whitespace-pre-wrap">{td.condicionesPago}</p>
                         </div>
                     )}
                      {(td.montoGarantiaCumplimiento || td.montoGarantiaVicios || td.garantiasTexto) && (
                          <div>
                              <h4 className="text-md font-semibold text-gray-600 mb-1">Garantías:</h4>
                              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm mb-2">
                                 {td.montoGarantiaCumplimiento && <DetailItem label="Cumplimiento" value={formatCurrency(td.montoGarantiaCumplimiento, td.moneda ?? contrato.moneda)} className='mb-0'/>}
                                 {td.montoGarantiaVicios && <DetailItem label="Vicios Ocultos" value={formatCurrency(td.montoGarantiaVicios, td.moneda ?? contrato.moneda)} className='mb-0'/>}
                              </dl>
                              {td.garantiasTexto && <p className="text-sm text-gray-700 bg-gray-50 p-3 border border-gray-200 rounded whitespace-pre-wrap">{td.garantiasTexto}</p>}
                          </div>
                     )}
                 </DetailSection>
             )}

             {/* --- Sección 6: Proveedor --- */}
             <DetailSection title="Proveedor" icon={<FaUserTie size={18}/>}>
                 {/* ContractProviderInfo ya tiene sus propios estilos */}
                 <ContractProviderInfo proveedor={contrato.proveedor} />
             </DetailSection>

             {/* --- Sección 7: Cierre y Metadatos --- */}
             <DetailSection title="Detalles Finales" icon={<FaFileInvoiceDollar size={18}/>} className="border-t pt-4 mt-4">
                 <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                    <DetailItem label="Fecha Elaboración/Firma" value={formatDate(td.fechaFirma ?? contrato.fecha_firma)} />
                    <DetailItem label="Número de Hojas" value={td.numeroHojas} />
                 </dl>
            </DetailSection>

        </div> // Cierre del contenedor principal
    );
};

export default ContractDetailView;