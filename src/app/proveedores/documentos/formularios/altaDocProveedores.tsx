"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchDocumentosPorProveedor,
  uploadDocumentoProveedor,
  deleteDocumentoProveedor,
} from "./fetchDocumentosProveedores";

// Interfaz para un documento existente (sin cambios)
interface DocumentoProveedor {
  id_documento_proveedor: number;
  id_proveedor: number;
  tipo_documento: string;
  nombre_original: string;
  ruta_archivo: string;
  id_usuario: number;
  estatus: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para definir los documentos requeridos (sin cambios)
interface RequiredDoc {
  key: string;
  label: string;
  notes?: string;
}

// --- LISTAS DE DOCUMENTOS REQUERIDOS (Incluyendo la nueva) ---
const REQUIRED_DOCS_MORAL: RequiredDoc[] = [
  // ... (definición como antes)
  { key: 'SOLICITUD_PADRON', label: 'Solicitud Registro Padrón (Firmada Rep. Legal)' },
  { key: 'CONSTANCIA_FISCAL', label: 'Constancia Situación Fiscal (SAT)', notes:'Actividad acorde a servicios.' },
  { key: 'CURRICULUM_CARTA', label: 'Curriculum / Carta Presentación / Servicios' },
  { key: 'ACTA_CONSTITUTIVA', label: 'Acta Constitutiva (y Modificaciones)', notes:'Con registro público.' },
  { key: 'PODER_REPRESENTANTE', label: 'Poder del Representante/Apoderado Legal' },
  { key: 'ID_REPRESENTANTE', label: 'Identificación Oficial Vigente (Rep. Legal)' },
  { key: 'ESTADO_FINANCIERO', label: 'Estado Financiero (<3 meses)', notes: 'Firmado Rep. Legal y Contador (anexar cédula).' },
  { key: 'COMPROBANTE_DOMICILIO', label: 'Comprobante Domicilio (Luz o Agua)' },
  { key: 'OPINION_CUMPLIMIENTO', label: 'Opinión Cumplimiento Fiscal Positiva (<1 mes)' },
  { key: 'PAGO_IMSS_INFONAVIT', label: 'Pago Mensual y Cédula IMSS/INFONAVIT (<1 mes)', notes:'O carta protesta si no aplica.' },
  { key: 'DATOS_BANCARIOS', label: 'Datos Bancarios (Carátula de Edo. Cuenta)' },
  { key: 'LICENCIA_PERMISO', label: 'Licencia Sanitaria / Permisos Vigentes (Si aplica)', notes:'Ej: fumigación, alimentos, seguridad.' },
  { key: 'RECIBO_PAGO_DERECHOS', label: 'Recibo Oficial Pago de Derechos' },
];
const REQUIRED_DOCS_FISICA: RequiredDoc[] = [
  // ... (definición como antes)
  { key: 'SOLICITUD_PADRON', label: 'Solicitud Registro Padrón (Firmada)' },
  { key: 'CONSTANCIA_FISCAL', label: 'Constancia Situación Fiscal (SAT)', notes:'Actividad acorde a servicios.' },
  { key: 'CURRICULUM_CARTA', label: 'Curriculum / Carta Presentación / Servicios' },
  { key: 'ACTA_NACIMIENTO', label: 'Acta de Nacimiento (Actualizada)' },
  { key: 'ID_PERSONAL', label: 'Identificación Oficial Vigente' }, // Cambiado de ID_REPRESENTANTE
  { key: 'ESTADO_FINANCIERO', label: 'Estado Financiero (<3 meses)', notes: 'Firmado por persona física y Contador (anexar cédula).' },
  { key: 'COMPROBANTE_DOMICILIO', label: 'Comprobante Domicilio (Luz o Agua)' },
  { key: 'OPINION_CUMPLIMIENTO', label: 'Opinión Cumplimiento Fiscal Positiva (<1 mes)' },
  { key: 'PAGO_IMSS_INFONAVIT', label: 'Pago Mensual y Cédula IMSS/INFONAVIT (<1 mes)', notes:'O carta protesta si no aplica.' },
  { key: 'DATOS_BANCARIOS', label: 'Datos Bancarios (Carátula de Edo. Cuenta)' },
  { key: 'LICENCIA_PERMISO', label: 'Licencia Sanitaria / Permisos Vigentes (Si aplica)', notes:'Ej: fumigación, alimentos, seguridad.' },
  { key: 'RECIBO_PAGO_DERECHOS', label: 'Recibo Oficial Pago de Derechos' },
];
const REQUIRED_DOCS_EVENTOS: RequiredDoc[] = [
  // ... (definición como arriba)
    { key: 'CARTA_COMPROMISO_A', label: 'Carta compromiso alta Padrón Proveedores Nacional (Anexo 1)' },
    { key: 'CATALOGO_SERVICIOS_B', label: 'Catálogo de servicios (sin precios)' },
    { key: 'CERT_RESERVA_C_IMPRESOS', label: 'Certificado Reserva Derechos Uso Exclusivo (Medios impresos)', notes: 'Si aplica.' },
    { key: 'REG_DOMINIO_C_WEB', label: 'Registro de Dominio Vigente (Página web)', notes: 'Si aplica.' },
    { key: 'TITULO_CONCESION_C_RADIO', label: 'Título de Concesión Vigente (Radio y TV)', notes: 'Si aplica.' },
    { key: 'GOOGLE_ANALYTICS_D', label: 'Google Analytics (últimos 3 meses, Página web)', notes: 'Si aplica.' },
    { key: 'ESTADISTICAS_LECTORES_D', label: 'Estadísticas lectores (últimos 3 meses, Medios impresos)', notes: 'Si aplica.' },
    { key: 'ESTADISTICAS_AUDIENCIA_D', label: 'Estadísticas audiencia (últimos 3 meses, Radio y TV)', notes: 'Si aplica.' },
];
// --- FIN LISTAS ---

// Props del componente principal (ACTUALIZADO)
interface GestionDocumentosProveedorProps {
  idProveedor: number;
  tipoProveedor: 'moral' | 'fisica' | string; // Recibe el tipo
  esProveedorEventos?: boolean; // Hacerla opcional por retrocompatibilidad
  onClose?: () => void; // Mantener si se usa como modal
}

// Componente para un slot de documento requerido (Sin cambios internos)
interface RequiredDocSlotProps {
    docInfo: RequiredDoc;
    uploadedDoc: DocumentoProveedor | null | undefined;
    idProveedor: number;
    idUsuarioLogueado: number | null;
    onActionComplete: () => void;
}
const RequiredDocSlot: React.FC<RequiredDocSlotProps> = ({
    docInfo, uploadedDoc, idProveedor, idUsuarioLogueado, onActionComplete
}) => {
    // ... (Implementación del slot como la tenías, sin cambios necesarios aquí)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) { setSelectedFile(e.target.files[0]); setError(null); }
        else { setSelectedFile(null); }
    };
    const handleUpload = async () => { /* ... lógica upload ... */
        if (!selectedFile || !idUsuarioLogueado) { setError("Selecciona archivo y asegúrate de iniciar sesión."); return; }
        setIsUploading(true); setError(null);
        const formData = new FormData();
        formData.append("archivo", selectedFile);
        formData.append("tipo_documento", docInfo.key); // Usa la key
        formData.append("id_proveedor", idProveedor.toString());
        formData.append("userId", idUsuarioLogueado.toString());
        try {
            await uploadDocumentoProveedor(formData);
            setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = "";
            onActionComplete();
        } catch (err) { setError(`Error al subir: ${(err as Error).message}`); }
        finally { setIsUploading(false); }
    };
    const handleDelete = async () => { /* ... lógica delete ... */
        if (!uploadedDoc) return;
        if (!window.confirm(`¿Eliminar "${uploadedDoc.nombre_original}"?`)) return;
        setIsDeleting(true); setError(null);
        try {
            await deleteDocumentoProveedor(uploadedDoc.id_documento_proveedor);
            onActionComplete();
        } catch (err) { setError(`Error al eliminar: ${(err as Error).message}`); }
        finally { setIsDeleting(false); }
    };

    return (
        <div className={`p-4 border rounded-md ${uploadedDoc ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'} transition-colors duration-200 ease-in-out`}>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                 <div className="flex-grow">
                     <label className={`block font-semibold ${uploadedDoc ? 'text-green-800' : 'text-gray-800'}`}>
                         {docInfo.label}
                         <span className={`ml-2 text-xs font-normal ${uploadedDoc ? 'text-green-600' : 'text-orange-600'}`}>
                             {uploadedDoc ? '(Subido)' : '(Pendiente)'}
                         </span>
                     </label>
                     {docInfo.notes && <p className="text-xs text-gray-500 mt-1">{docInfo.notes}</p>}
                     {uploadedDoc && (
                          <a href={`/${uploadedDoc.ruta_archivo}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block mt-1 truncate" title={uploadedDoc.nombre_original}>
                              Ver: {uploadedDoc.nombre_original}
                          </a>
                     )}
                 </div>
                 <div className="flex-shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    {/* Lógica botones upload/delete como antes */}
                     {!uploadedDoc ? (
                         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="input-file-style" disabled={isUploading}/>
                             <button onClick={handleUpload} disabled={!selectedFile || isUploading || !idUsuarioLogueado} className="button-primary-small disabled:opacity-50 whitespace-nowrap"> {isUploading ? "Subiendo..." : "Subir"} </button>
                         </div>
                     ) : (
                          <button onClick={handleDelete} disabled={isDeleting} className="button-danger-small disabled:opacity-50"> {isDeleting ? "Eliminando..." : "Eliminar"} </button>
                     )}
                 </div>
             </div>
             {selectedFile && !uploadedDoc && <p className="text-xs text-gray-600 mt-1">Seleccionado: {selectedFile.name}</p>}
             {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
         </div>
    );
};


// --- Componente Principal (ACTUALIZADO) ---
const GestionDocumentosProveedor: React.FC<GestionDocumentosProveedorProps> = ({
    idProveedor,
    tipoProveedor,
    esProveedorEventos = false, // Default a false si no se pasa la prop
    onClose
}) => {
  // Estados existentes
  const [documentos, setDocumentos] = useState<DocumentoProveedor[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [idUsuarioLogueado, setIdUsuarioLogueado] = useState<number | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [archivoOtro, setArchivoOtro] = useState<File | null>(null);
  const [tipoDocumentoOtro, setTipoDocumentoOtro] = useState("");
  const fileInputOtroRef = useRef<HTMLInputElement>(null);
  const [isUploadingOtro, setIsUploadingOtro] = useState(false);

  // **NUEVO ESTADO para la lista combinada de documentos requeridos**
  const [listaDocsRequeridos, setListaDocsRequeridos] = useState<RequiredDoc[]>([]);

  // Obtener ID usuario (sin cambios)
   useEffect(() => {
    const userIdString = sessionStorage.getItem("proveedorUserId");
    if (userIdString) {
        const userIdNum = parseInt(userIdString, 10);
        if (!isNaN(userIdNum)) { setIdUsuarioLogueado(userIdNum); }
        else { setErrorGlobal("ID de usuario inválido."); }
    } else { setErrorGlobal("Usuario no autenticado."); }
  }, []);

  // Cargar documentos existentes (sin cambios)
  const cargarDocumentos = useCallback(async () => {
    if (!idProveedor) return;
    setIsLoadingDocs(true);
    setErrorGlobal(null);
    try {
      const docs = await fetchDocumentosPorProveedor(idProveedor);
      setDocumentos(docs || []);
    } catch (err) { setErrorGlobal(`Error al cargar documentos: ${(err as Error).message}`); setDocumentos([]); }
    finally { setIsLoadingDocs(false); }
  }, [idProveedor]);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]);

  useEffect(() => {
      console.log(`Determinando docs requeridos. Tipo: ${tipoProveedor}, Eventos: ${esProveedorEventos}`);
      let baseDocs: RequiredDoc[] = [];
      if (tipoProveedor === 'moral') {
          baseDocs = REQUIRED_DOCS_MORAL;
      } else if (tipoProveedor === 'fisica') {
          baseDocs = REQUIRED_DOCS_FISICA;
      } else if (tipoProveedor) { // Si hay tipo pero no es reconocido
           console.warn(`Tipo de proveedor no manejado: ${tipoProveedor}`);
           setErrorGlobal(`Tipo de proveedor "${tipoProveedor}" no reconocido para determinar documentos.`);
      } else {
          console.warn('Tipo de proveedor no especificado.');
          // Podrías no poner error aquí si esperas a que cargue
      }

      let finalDocs = [...baseDocs]; // Copia de la lista base

      // Añadir documentos de eventos si la bandera es true
      if (esProveedorEventos === true) {
          console.log("Añadiendo documentos para proveedor de eventos.");
          finalDocs = [...finalDocs, ...REQUIRED_DOCS_EVENTOS];
      }

      console.log(`Lista final de documentos requeridos (${finalDocs.length}):`, finalDocs.map(d=>d.key));
      setListaDocsRequeridos(finalDocs);

  }, [tipoProveedor, esProveedorEventos]); // Se recalcula si cambia el tipo o la bandera de eventos

  // Helper para encontrar si un doc requerido ya existe (sin cambios)
  const findUploadedDoc = (tipoDocKey: string): DocumentoProveedor | undefined => {
    return documentos.find(doc => doc.tipo_documento === tipoDocKey);
  };

  // Renderizar los slots de documentos requeridos (USA LA LISTA DEL ESTADO)
   const renderRequiredDocs = (requiredList: RequiredDoc[]) => {
        // Mover la carga aquí para asegurar que se muestre antes de intentar renderizar
        if (isLoadingDocs) return <div className="text-center p-4"><p>Cargando estado de documentos...</p></div>;
        if (!requiredList || requiredList.length === 0) {
            // Esto puede pasar si el tipo es desconocido o si no hay docs definidos
            return <p className="text-center text-gray-500 italic p-4">No hay documentos requeridos definidos para este tipo de proveedor.</p>;
        }
        return (
            <div className="space-y-3">
                {requiredList.map(reqDoc => (
                    <RequiredDocSlot
                        key={reqDoc.key}
                        docInfo={reqDoc}
                        uploadedDoc={findUploadedDoc(reqDoc.key)}
                        idProveedor={idProveedor}
                        idUsuarioLogueado={idUsuarioLogueado}
                        onActionComplete={() => {
                            setSuccessMessage(`Acción completada para ${reqDoc.label}.`);
                            cargarDocumentos();
                            setTimeout(() => setSuccessMessage(null), 3500);
                        }}
                    />
                ))}
            </div>
        );
    };


  // Lógica para "Otros Documentos" (sin cambios)
  const handleFileChangeOtro = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setArchivoOtro(e.target.files?.[0] || null); setErrorGlobal(null); setSuccessMessage(null);};
  const handleTipoDocChangeOtro = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ setTipoDocumentoOtro(e.target.value); setErrorGlobal(null); setSuccessMessage(null);};
  const handleUploadSubmitOtro = async (e: React.FormEvent) => {
    e.preventDefault(); /* ... (lógica upload otro doc como antes) ... */
    if (!archivoOtro || !tipoDocumentoOtro.trim() || !idUsuarioLogueado) { setErrorGlobal("Faltan datos para subir 'Otro Documento'."); return; }
    setIsUploadingOtro(true);
    const formData = new FormData(); /* ... (añadir campos) ... */
    formData.append("archivo", archivoOtro);
    formData.append("tipo_documento", tipoDocumentoOtro.trim());
    formData.append("id_proveedor", idProveedor.toString());
    formData.append("userId", idUsuarioLogueado.toString());
    try {
        await uploadDocumentoProveedor(formData);
        setSuccessMessage(`Documento "${tipoDocumentoOtro}" subido.`);
        setArchivoOtro(null); setTipoDocumentoOtro(""); if(fileInputOtroRef.current) fileInputOtroRef.current.value = "";
        cargarDocumentos();
        setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) { setErrorGlobal(`Error al subir: ${(err as Error).message}`); }
    finally { setIsUploadingOtro(false); }
  };


  // --- Renderizado (Usa listaDocsRequeridos) ---
  return (
    <div className="p-4 md:p-6 bg-gray-50 rounded-lg shadow">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
             <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Gestionar Documentos Proveedor</h1>
             {/* Botón Cerrar opcional si es un modal */}
             {onClose && (
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
             )}
        </div>

        {/* Mensajes Globales */}
        {successMessage && ( <div className="p-3 mb-4 border-l-4 bg-green-100 border-green-500 text-green-800 text-sm" role="alert">{successMessage}</div> )}
        {errorGlobal && ( <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700 text-sm" role="alert">{errorGlobal}</div> )}

        {/* === Sección Documentos Requeridos (Usa el estado listaDocsRequeridos) === */}
        <div className="mb-8 p-5 border border-blue-200 rounded-lg shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4 text-blue-800">Documentos Requeridos</h2>
            {!idUsuarioLogueado && <p className="text-red-600 text-sm mb-3 italic">No se puede subir/eliminar: Inicie sesión.</p>}
            {/* Llama a renderRequiredDocs pasando la lista del estado */}
            {renderRequiredDocs(listaDocsRequeridos)}
        </div>

        {/* === Sección Otros Documentos === */}
        <form onSubmit={handleUploadSubmitOtro} className="mb-8 p-5 border border-gray-200 rounded-lg shadow-sm bg-white">
            {/* ... (Formulario "Otros Documentos" como antes) ... */}
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Subir Otros Documentos (Opcional)</h2>
            {!idUsuarioLogueado && <p className="text-red-600 text-sm mb-3 italic">No se puede subir: Inicie sesión.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                 <label htmlFor="tipoDocumentoOtro" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento {archivoOtro && <span className="text-red-500">*</span>}</label>
                 <input type="text" id="tipoDocumentoOtro" name="tipoDocumentoOtro" value={tipoDocumentoOtro} onChange={handleTipoDocChangeOtro} required={!!archivoOtro} className="input-style" placeholder="Ej: Fianza" disabled={isUploadingOtro || !idUsuarioLogueado}/>
              </div>
              <div>
                 <label htmlFor="archivoOtro" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Archivo {tipoDocumentoOtro && <span className="text-red-500">*</span>}</label>
                 <input type="file" id="archivoOtro" name="archivoOtro" ref={fileInputOtroRef} onChange={handleFileChangeOtro} required={!!tipoDocumentoOtro.trim()} className="input-file-style-full" disabled={isUploadingOtro || !idUsuarioLogueado}/>
                 {archivoOtro && <span className="text-xs text-gray-500 mt-1 block">Seleccionado: {archivoOtro.name}</span>}
              </div>
            </div>
            <button type="submit" disabled={isUploadingOtro || !archivoOtro || !tipoDocumentoOtro.trim() || !idUsuarioLogueado} className="button-primary disabled:opacity-50"> {isUploadingOtro ? "Subiendo..." : "Subir Otro Documento"} </button>
        </form>

        {/* === Sección Resumen Documentos Subidos === */}
        <div className="mb-6">
            {/* ... (Tabla resumen como antes) ... */}
             <h2 className="text-lg font-semibold mb-3 text-gray-800">Resumen de Todos los Documentos Subidos</h2>
             {isLoadingDocs ? ( <p>Cargando resumen...</p> ) : !documentos.length ? ( <p className="text-gray-500 italic">Aún no hay documentos subidos.</p> ) : (
             <div className="overflow-x-auto border rounded shadow-sm">
                <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Nombre Original</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Tipo Documento (Clave Interna)</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Subido</th>
                    <th className="px-4 py-2 text-center font-medium text-gray-600">Acciones</th>
                </tr>
                </thead>
                    <tbody className="divide-y divide-gray-200">
                        {documentos.map(doc => (
                            <tr key={doc.id_documento_proveedor}>
                                <td className="px-4 py-2 whitespace-nowrap font-medium text-blue-600 hover:text-blue-800">
                                    <a href={`/${doc.ruta_archivo}`} target="_blank" rel="noopener noreferrer" title={doc.nombre_original}> {doc.nombre_original} </a>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-700">{doc.tipo_documento}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-500"> {new Date(doc.created_at).toLocaleDateString()} </td>
                                <td className="px-4 py-2 text-center">
                                    <button className="button-danger-small" onClick={async () => { if (window.confirm(`Eliminar ${doc.nombre_original}?`)) { try { await deleteDocumentoProveedor(doc.id_documento_proveedor); cargarDocumentos(); } catch (err) { setErrorGlobal(`Error: ${(err as Error).message}`); } } }}> Eliminar </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
            )}
        </div>

        {/* Estilos rápidos (mueve a CSS/Tailwind) */}
        <style jsx global>{`
            .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); outline: none; }
            .input-style:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3); }
            .input-file-style { display: block; width: 100%; font-size: 0.875rem; color: #1f2937; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer; background-color: #f9fafb; }
            .input-file-style::file-selector-button { margin-right: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 0; font-size: 0.875rem; font-weight: 600; background-color: #e0e7ff; color: #3730a3; }
            .input-file-style:hover::file-selector-button { background-color: #c7d2fe; }
            .input-file-style-full { display: block; width: 100%; font-size: 0.875rem; color: #1f2937; border: 1px solid #d1d5db; border-radius: 0.375rem; cursor: pointer; background-color: #f9fafb; }
            .input-file-style-full::file-selector-button { margin-right: 1rem; padding: 0.5rem 1rem; border-radius: 0.375rem 0 0 0.375rem; border: 0; font-size: 0.875rem; font-weight: 600; background-color: #e0e7ff; color: #3730a3; }
            .input-file-style-full:hover::file-selector-button { background-color: #c7d2fe; }
            .button-primary { padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border-radius: 0.375rem; font-weight: 500; }
            .button-primary:hover:not(:disabled) { background-color: #4338ca; }
            .button-primary:disabled { opacity: 0.5; cursor: not-allowed; }
            .button-primary-small { padding: 0.25rem 0.75rem; background-color: #4f46e5; color: white; border-radius: 0.375rem; font-size: 0.875rem; }
            .button-primary-small:hover:not(:disabled) { background-color: #4338ca; }
            .button-danger-small { padding: 0.25rem 0.75rem; background-color: #dc2626; color: white; border-radius: 0.375rem; font-size: 0.875rem; }
            .button-danger-small:hover:not(:disabled) { background-color: #b91c1c; }
            .button-danger-small:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>

    </div> // Cierre del div principal
  );
};

export default GestionDocumentosProveedor;