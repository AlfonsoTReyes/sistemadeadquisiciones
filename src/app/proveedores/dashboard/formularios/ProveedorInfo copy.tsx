// --- START OF FILE src/components/proveedores/dashboard/ProveedorInfo.tsx ---
'use client';
import React from 'react';

// Define an interface for the expected provider data shape
// Adapt this based on the exact fields returned by getProveedorByUserId
interface ProveedorData {
    id_proveedor: number;
    rfc: string | null;
    giro_comercial: string | null;
    correo: string | null;
    camara_comercial: string | null;
    numero_registro_camara: string | null;
    numero_registro_imss: string | null;
    updated_at: string | null; // Assuming string from JSON, format later
    calle: string | null;
    numero: string | null;
    colonia: string | null;
    codigo_postal: string | null;
    municipio: string | null;
    estado: string | null;
    telefono_uno: string | null;
    telefono_dos: string | null;
    pagina_web: string | null;
    // Moral specific
    razon_social?: string | null;
    // Fisica specific
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;
    // Added type helper
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
}

interface ProveedorInfoProps {
    providerData: ProveedorData | null;
    loading: boolean;
    error: string | null;
    onUpdateClick: () => void; // Function to handle click on update button
    onPdfClick: () => void;    // Function to handle click on PDF button
}

const ProveedorInfo: React.FC<ProveedorInfoProps> = ({
    providerData,
    loading,
    error,
    onUpdateClick,
    onPdfClick
}) => {

    if (loading) {
        return <div className="text-center p-10">Cargando datos del proveedor...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-600">Error: {error}</div>;
    }

    if (!providerData) {
        // This case might happen if the API returned 404 or fetch failed gracefully
        return <div className="text-center p-10 text-gray-600">No se encontró información del perfil del proveedor.</div>;
    }

    // Helper function to format address
    const formatAddress = (p: ProveedorData) => {
        const parts = [p.calle, p.numero, p.colonia, p.municipio, p.estado, p.codigo_postal];
        return parts.filter(Boolean).join(', ') || 'No disponible';
    };

    // Helper function to format optional fields
    const displayValue = (value: string | null | undefined, placeholder = 'N/A') => {
        return value || placeholder;
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Datos Generales del Proveedor</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700">
                {/* Column 1 */}
                <div>
                    <p className="font-semibold text-gray-600">Nombre / Razón Social:</p>
                    <p>{providerData.tipo_proveedor === 'moral'
                         ? displayValue(providerData.razon_social)
                         : displayValue(`${providerData.nombre_fisica || ''} ${providerData.apellido_p_fisica || ''} ${providerData.apellido_m_fisica || ''}`.trim())}
                    </p>
                </div>
                <div>
                    <p className="font-semibold text-gray-600">RFC:</p>
                    <p>{displayValue(providerData.rfc)}</p>
                </div>
                 {providerData.tipo_proveedor === 'fisica' && (
                     <div>
                        <p className="font-semibold text-gray-600">CURP:</p>
                        <p>{displayValue(providerData.curp)}</p>
                    </div>
                 )}
                 <div>
                    <p className="font-semibold text-gray-600">Giro Comercial:</p>
                    <p>{displayValue(providerData.giro_comercial)}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-600">Registro IMSS:</p>
                    <p>{displayValue(providerData.numero_registro_imss)}</p>
                </div>

                {/* Column 2 */}
                <div className="md:col-span-2"> {/* Span across 2 cols on medium screens */}
                    <p className="font-semibold text-gray-600">Domicilio Fiscal:</p>
                    <p>{formatAddress(providerData)}</p>
                </div>
                 <div className="md:col-span-2">
                    <p className="font-semibold text-gray-600">Domicilio Notificaciones:</p>
                    <p>{formatAddress(providerData)}</p> {/* Assuming same as fiscal for now */}
                </div>
                <div>
                    <p className="font-semibold text-gray-600">Medios de Comunicación:</p>
                    <p>Correo: {displayValue(providerData.correo)}</p>
                    <p>Tel 1: {displayValue(providerData.telefono_uno)}</p>
                    <p>Tel 2: {displayValue(providerData.telefono_dos)}</p>
                    <p>Web: {providerData.pagina_web ? <a href={providerData.pagina_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{providerData.pagina_web}</a> : 'N/A'}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-600">Registro Cámara:</p>
                    <p>Cámara: {displayValue(providerData.camara_comercial)}</p>
                    <p>Número: {displayValue(providerData.numero_registro_camara)}</p>
                </div>
                <div className="md:col-span-2">
                    <p className="font-semibold text-gray-600">Última Actualización:</p>
                    <p>{providerData.updated_at ? new Date(providerData.updated_at).toLocaleString() : 'N/A'}</p>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                 <button
                    onClick={onUpdateClick}
                    className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Actualizar Datos
                </button>
                 <button
                     onClick={onPdfClick}
                     className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Generar PDF
                </button>
            </div>
        </div>
    );
};

export default ProveedorInfo;
// --- END OF FILE src/components/proveedores/dashboard/ProveedorInfo.tsx ---