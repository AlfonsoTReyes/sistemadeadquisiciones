// src/app/proveedores/dashboard/formularios/ProveedorInfo.tsx
'use client';
import React, { useState, useEffect } from 'react';
// import Link from 'next/link'; // <-- REMOVED: Link was defined but never used.

import { updateProveedor, solicitarRevision } from './fetchdashboard';
import ModalActualizarProveedor from './modalActualizarProveedor';
import { generateProveedorPdfClientSide } from '../../../PDF/usuarioProveedor';
// import { revalidacionProveedores } from '../../../PDF/revalidacionProveedores'; // Function was unused

// --- Interfaces ---
interface RepresentanteLegalOutput {
    id_morales: number;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    estatus_revision?: string | null;
    representantes?: RepresentanteLegalOutput[];
}

interface ProveedorData {
    id_proveedor: number;
    rfc: string;
    giro_comercial?: string | null;
    correo?: string | null;
    calle?: string | null;
    numero?: string | null;
    colonia?: string | null;
    codigo_postal?: string | null;
    municipio?: string | null;
    estado?: string | null;
    telefono_uno?: string | null;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    estatus?: boolean;
    estatus_revision?: string | null;
    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;
    razon_social?: string | null;
    representantes?: RepresentanteLegalOutput[];
    [key: string]: unknown; // CORREGIDO: any -> unknown
}

interface ProveedorInfoProps {
    providerData: ProveedorData | null;
    loading: boolean;
    error: string | null;
    onManageDocumentsClick: () => void;
    onDataRefreshNeeded?: () => void;
}

// Define a more specific type for the data coming from the update modal
interface UpdateModalPayload extends Partial<Omit<ProveedorData, 'id_proveedor' | 'tipo_proveedor'>> {
    id_proveedor: number;
    tipo_proveedor: 'moral' | 'fisica'; // Assuming 'desconocido' is not a valid type for update
    // Include other fields that are definitely part of the modal's submission, e.g.,
    // rfc: string; // if rfc is always submitted and required by the modal/update function
    // ... other fields
}


const InfoFieldDisplay: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <p className="text-sm text-gray-700 mb-1 break-words">
        <span className="font-semibold text-gray-800">{label}:</span>
        <span className="ml-1">{value ?? <span className="text-gray-400 italic">N/A</span>}</span>
    </p>
);

const ProveedorInfo: React.FC<ProveedorInfoProps> = ({
    providerData: initialProviderData,
    loading: loadingPage,
    error: pageError,
    onManageDocumentsClick,
    onDataRefreshNeeded
}) => {
    const [providerData, setProviderData] = useState<ProveedorData | null>(initialProviderData);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null); // pdfError state
    const [isRequestingReview, setIsRequestingReview] = useState(false);
    const [requestReviewError, setRequestReviewError] = useState<string | null>(null);
    const [requestReviewSuccess, setRequestReviewSuccess] = useState<string | null>(null);

    useEffect(() => {
        setProviderData(initialProviderData);
        setUpdateError(null);
        setPdfError(null);
        setIsRequestingReview(false);
        setRequestReviewError(null);
        setRequestReviewSuccess(null);
    }, [initialProviderData]);

    const handleOpenModal = () => {
        if (providerData) { setUpdateError(null); setModalAbierto(true); }
        else { alert("No hay datos para editar."); }
    };
    const handleCloseModal = () => { setModalAbierto(false); };

    const handleSaveUpdate = async (updatedDataFromModal: UpdateModalPayload) => { // CORREGIDO: any -> UpdateModalPayload
        // The check for !providerData was here, but it seems redundant if the modal can only be opened with providerData.
        // The checks for id_proveedor and tipoProveedor are good.
        if (!updatedDataFromModal?.id_proveedor || !updatedDataFromModal.tipo_proveedor) {
            setUpdateError("Datos incompletos del modal para la actualización.");
            return;
        }
        setIsUpdating(true); setUpdateError(null);
        try {
            // Assuming updateProveedor expects a type compatible with UpdateModalPayload
            const updatedProvider = await updateProveedor(updatedDataFromModal as any); // Cast to any if updateProveedor expects a slightly different shape. Ideally, align types.
            setProviderData(updatedProvider);
            alert("¡Perfil actualizado con éxito!");
            handleCloseModal();

            if (onDataRefreshNeeded) {
                console.log("ProveedorInfo: Solicitando refresh de datos al padre...");
                onDataRefreshNeeded();
            } else {
                console.warn("ProveedorInfo: onDataRefreshNeeded no proporcionado. Considera recargar la página como fallback.");
            }

        } catch (errUnknown: unknown) { // CORREGIDO: any -> unknown
            if (errUnknown instanceof Error) {
                setUpdateError(errUnknown.message || "Error desconocido.");
            } else {
                setUpdateError("Ocurrió un error desconocido al actualizar.");
            }
        }
        finally { setIsUpdating(false); }
    };

    const handleGeneratePdfClick = async () => {
        if (!providerData) { setPdfError("No hay datos para generar el PDF."); return; }
        setIsGeneratingPdf(true); setPdfError(null);
        try {
            await generateProveedorPdfClientSide(providerData);
        } catch (errUnknown: unknown) { // CORREGIDO: any -> unknown
            if (errUnknown instanceof Error) {
                setPdfError(errUnknown.message || "Error generando PDF Solicitud.");
            } else {
                setPdfError("Error desconocido generando PDF Solicitud.");
            }
        }
        finally { setIsGeneratingPdf(false); }
    };

    /* // REMOVED: handleRevalidadProveedores was defined but never used.
    const handleRevalidadProveedores = async () => {
        if (!providerData) { setPdfError("No hay datos."); return; }
        setIsGeneratingPdf(true); setPdfError(null);
        try {
            await revalidacionProveedores(providerData);
        } catch (err: any) { setPdfError(err.message || "Error generando PDF Revalidación."); }
        finally { setIsGeneratingPdf(false); }
    };
    */

    const handleSolicitarRevisionClick = async () => {
        if (!providerData || !providerData.id_proveedor) {
            alert("Error: No se pueden cargar los datos del proveedor.");
            return;
        }

        if (!window.confirm("¿Está seguro de que ha completado su perfil y subido todos los documentos requeridos?\nAl confirmar, su información será enviada a revisión.")) {
            return;
        }

        setIsRequestingReview(true); setRequestReviewError(null); setRequestReviewSuccess(null);
        try {
            const result = await solicitarRevision(providerData.id_proveedor);
            if (result?.estatus_revision) {
                setProviderData(prev => prev ? { ...prev, estatus_revision: result.estatus_revision } : null);
                setRequestReviewSuccess("Solicitud enviada.");
                setTimeout(() => setRequestReviewSuccess(null), 5000);
            } else {
                console.warn("Respuesta inesperada de solicitarRevision, solicitando refresh.");
                if (onDataRefreshNeeded) onDataRefreshNeeded();
                // else window.location.reload(); // Consider if reload is the best fallback
            }
        } catch (errUnknown: unknown) { // CORREGIDO: any -> unknown
            if (errUnknown instanceof Error) {
                setRequestReviewError(errUnknown.message || "Error al solicitar.");
            } else {
                setRequestReviewError("Error desconocido al solicitar la revisión.");
            }
        }
        finally { setIsRequestingReview(false); }
    };

    if (loadingPage) {
        return <div className="text-center p-10 text-gray-600">Cargando datos del proveedor...</div>;
    }

    if (pageError) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg mx-auto text-center" role="alert">{pageError}</div>;
    }

    if (!providerData) {
        return <div className="text-center p-10 text-gray-500">No se encontraron datos del proveedor.</div>;
    }

    const { tipo_proveedor, representantes, estatus_revision } = providerData;
    const isMoral = tipo_proveedor === 'moral';
    const isFisica = tipo_proveedor === 'fisica';
    const puedeSolicitarRevision = estatus_revision === 'NO_SOLICITADO' || estatus_revision === 'RECHAZADO';
    const textoEstatusRevision = estatus_revision?.replace(/_/g, ' ') || 'No Solicitado';
    const mostrarBotonPago = estatus_revision === 'PENDIENTE_PAGO';

    return (
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b pb-3">Información del Proveedor</h1>

            <div className={`mb-6 p-3 rounded-md border text-center
              ${estatus_revision === 'APROBADO' ? 'bg-green-50 border-green-300 text-green-800' :
                estatus_revision === 'RECHAZADO' ? 'bg-red-50 border-red-300 text-red-800' :
                estatus_revision === 'PENDIENTE_REVISION' || estatus_revision === 'EN_REVISION' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
                estatus_revision === 'PENDIENTE_PAGO' ? 'bg-orange-50 border-orange-300 text-orange-800' :
                'bg-gray-100 border-gray-300 text-gray-600'}`}>
                <p className="font-medium text-sm">
                    Estado de Proceso de Solicitud: <span className="font-bold">{textoEstatusRevision}</span>
                </p>
                {estatus_revision === 'RECHAZADO' && <p className="text-xs mt-1">Revise sus documentos o perfil y vuelva a solicitar la revisión.</p>}
                {estatus_revision === 'PENDIENTE_REVISION' && <p className="text-xs mt-1">Su solicitud está en espera de ser atendida por un administrador.</p>}
                {estatus_revision === 'EN_REVISION' && <p className="text-xs mt-1">Un administrador está revisando su información.</p>}
                {estatus_revision === 'PENDIENTE_PAGO' && <p className="text-xs mt-1">Su documentación ha sido aprobada. Por favor, realice el pago correspondiente para completar su registro/revalidación Y SUBIRLO AL APARTADO DE DOCUMENTOS.</p>}
            </div>

            {requestReviewError && <p className="text-sm text-red-600 my-2 text-center">{requestReviewError}</p>}
            {requestReviewSuccess && <p className="text-sm text-green-600 my-2 text-center">{requestReviewSuccess}</p>}
            {pdfError && <p className="text-sm text-red-600 my-2 text-center">Error PDF: {pdfError}</p>} {/* Display pdfError */}
            {updateError && <p className="text-sm text-red-600 my-2 text-center">Error de Actualización: {updateError}</p>}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 mb-6 border-b pb-4">
                <InfoFieldDisplay label="RFC" value={providerData.rfc} />
                <InfoFieldDisplay label="Tipo" value={isMoral ? 'Persona Moral' : isFisica ? 'Persona Física' : 'Desconocido'} />
                <InfoFieldDisplay label="Correo Electrónico" value={providerData.correo} />
                <InfoFieldDisplay label="Giro Comercial" value={providerData.giro_comercial} />
                <InfoFieldDisplay label="Actividad Económica (SAT)" value={providerData.actividad_sat} />
                <InfoFieldDisplay label="Teléfono Principal" value={providerData.telefono_uno} />
                <InfoFieldDisplay label="Teléfono Secundario" value={providerData.telefono_dos} />
                <InfoFieldDisplay label="Página Web" value={providerData.pagina_web ? <a href={providerData.pagina_web.startsWith('http') ? providerData.pagina_web : `http://${providerData.pagina_web}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{providerData.pagina_web}</a> : undefined} />
                <InfoFieldDisplay label="Proveedor para Eventos" value={providerData.proveedor_eventos ? 'Sí' : 'No'} />
            </div>
            <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Dirección</h2>
                <InfoFieldDisplay label="Dirección Completa" value={`${providerData.calle || ''} #${providerData.numero || ''}, Col. ${providerData.colonia || ''}, C.P. ${providerData.codigo_postal || ''}, ${providerData.municipio || ''}, ${providerData.estado || ''}`} />
            </div>
            <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">
                    Datos Específicos ({isMoral ? 'Persona Moral' : isFisica ? 'Persona Física' : 'Tipo Desconocido'})
                </h2>
                {isMoral && (
                    <>
                        <InfoFieldDisplay label="Razón Social" value={providerData.razon_social} />
                        <div className="mt-4">
                            <h4 className="text-md font-medium text-gray-600 mb-2">Representantes Legales:</h4>
                            {representantes && representantes.length > 0 ? (
                                <ul className="list-disc list-inside pl-5 space-y-1">
                                    {representantes.map((rep) => (
                                        <li key={rep.id_morales} className="text-sm text-gray-700">
                                            {rep.nombre_representante || ''} {rep.apellido_p_representante || ''} {rep.apellido_m_representante || ''}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No hay representantes registrados.</p>
                            )}
                        </div>
                    </>
                )}
                {isFisica && (
                    <>
                        <InfoFieldDisplay label="Nombre Completo" value={`${providerData.nombre_fisica || ''} ${providerData.apellido_p_fisica || ''} ${providerData.apellido_m_fisica || ''}`.trim()} />
                        <InfoFieldDisplay label="CURP" value={providerData.curp} />
                    </>
                )}
            </div>
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Registros Adicionales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    <InfoFieldDisplay label="Cámara Comercial" value={providerData.camara_comercial} />
                    <InfoFieldDisplay label="No. Reg. Cámara" value={providerData.numero_registro_camara} />
                    <InfoFieldDisplay label="No. Reg. IMSS" value={providerData.numero_registro_imss} />
                    <InfoFieldDisplay label="Última Actualización" value={providerData.updated_at ? new Date(providerData.updated_at).toLocaleString() : undefined} />
                </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 mt-6 pt-6 border-t">
                {/* Botón de pago (si es necesario, descomentar y ajustar lógica/ruta)
                {mostrarBotonPago && (
                    <Link href="/ruta-al-pago" passHref> // Ajustar ruta
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                            disabled={isUpdating || isGeneratingPdf || isRequestingReview}
                            title="Realizar el pago del trámite de proveedor"
                        >
                            Ir a Pagar
                        </button>
                    </Link>
                )}
                */}
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                    disabled={isUpdating || isGeneratingPdf || isRequestingReview}
                >
                    Modificar Información
                </button>
                <button
                    onClick={handleGeneratePdfClick}
                    className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isGeneratingPdf || isUpdating || isRequestingReview}
                >
                    {isGeneratingPdf ? 'Generando Solicitud...' : 'Generar Solicitud PDF'}
                </button>
                {!mostrarBotonPago && (
                    <button
                        onClick={handleSolicitarRevisionClick}
                        className={`bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={!puedeSolicitarRevision || isUpdating || isGeneratingPdf || isRequestingReview}
                        title={!puedeSolicitarRevision ? `Su estado actual es ${textoEstatusRevision}` : "Enviar perfil y documentos a revisión"}
                    >
                        {isRequestingReview ? 'Enviando Solicitud...' : 'Solicitar Revisión Documentación'}
                    </button>
                )}
                <button
                    onClick={onManageDocumentsClick}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                    disabled={isUpdating || isGeneratingPdf || isRequestingReview}
                >
                    Gestionar Documentos
                </button>
            </div>

            {modalAbierto && providerData && (
                <ModalActualizarProveedor
                    isOpen={modalAbierto}
                    onClose={handleCloseModal}
                    proveedorData={providerData}
                    onSubmit={handleSaveUpdate}
                    isLoading={isUpdating}
                    error={updateError}
                />
            )}
        </div>
    );
};

export default ProveedorInfo;