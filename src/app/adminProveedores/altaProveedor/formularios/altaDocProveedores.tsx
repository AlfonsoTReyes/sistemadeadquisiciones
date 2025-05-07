"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

// Importa las funciones API relevantes para documentos de proveedores y usuarios
import {
  fetchDocumentosPorProveedor,
  uploadDocumentoProveedor,
  deleteDocumentoProveedor,
} from "./fetchDocumentosProveedores"; // Ajusta la ruta si es necesario
//import { getUserById } from "../../../peticiones_api/fetchUsuarios"; // Para obtener el ID del usuario

// Interfaz para un documento existente
interface DocumentoProveedor {
  id_documento_proveedor: number;
  id_proveedor: number;
  tipo_documento: string; // Clave interna o descripción
  nombre_original: string;
  ruta_archivo: string;
  id_usuario: number;
  estatus: string;
  created_at: string;
  updated_at: string;
}

// Interfaz para definir los documentos requeridos
interface RequiredDoc {
  key: string; // Identificador único para el tipo de documento (ej: 'ACTA_CONSTITUTIVA')
  label: string; // Descripción para el usuario
  notes?: string; // Notas adicionales (opcional)
}

// --- LISTAS DE DOCUMENTOS REQUERIDOS ---
// (Ajusta las KEYS para que sean identificadores únicos y descriptivos internamente)
const REQUIRED_DOCS_MORAL: RequiredDoc[] = [
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
    // Comparte muchos con Moral, pero usa las keys correctas
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
// --- FIN LISTAS ---

// Props del componente principal
interface GestionDocumentosProveedorProps {
  idProveedor: number;
  tipoProveedor: 'moral' | 'fisica' | string; // Recibe el tipo
  onClose: () => void;
}

// Componente para un slot de documento requerido
interface RequiredDocSlotProps {
    docInfo: RequiredDoc;
    uploadedDoc: DocumentoProveedor | null | undefined;
    idProveedor: number;
    idUsuarioLogueado: number | null;
    onActionComplete: () => void; // Callback para refrescar lista principal
}

const RequiredDocSlot: React.FC<RequiredDocSlotProps> = ({
    docInfo, uploadedDoc, idProveedor, idUsuarioLogueado, onActionComplete
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError(null); // Clear error on new file selection
        } else {
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !idUsuarioLogueado) {
            setError("Selecciona un archivo y asegúrate de haber iniciado sesión.");
            return;
        }
        setIsUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append("archivo", selectedFile);
        // --- USA LA KEY DEL DOCUMENTO REQUERIDO ---
        formData.append("tipo_documento", docInfo.key);
        // --- FIN ---
        formData.append("id_proveedor", idProveedor.toString());
        formData.append("userId", idUsuarioLogueado.toString());

        try {
            await uploadDocumentoProveedor(formData);
            setSelectedFile(null); // Clear selection
            if(fileInputRef.current) fileInputRef.current.value = ""; // Clear input visual
            onActionComplete(); // Refresh main list
        } catch (err) {
            console.error(`Error uploading ${docInfo.key}:`, err);
            setError(`Error al subir: ${(err as Error).message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!uploadedDoc) return;
        if (!window.confirm(`¿Eliminar el documento "${uploadedDoc.nombre_original}" (${docInfo.label})?`)) return;

        setIsDeleting(true);
        setError(null);
        try {
            await deleteDocumentoProveedor(uploadedDoc.id_documento_proveedor);
            onActionComplete(); // Refresh main list
        } catch (err) {
            console.error(`Error deleting ${docInfo.key}:`, err);
            setError(`Error al eliminar: ${(err as Error).message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={`p-4 border rounded-md ${uploadedDoc ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <label className={`block font-medium ${uploadedDoc ? 'text-green-700' : 'text-gray-700'}`}>
                        {docInfo.label} {uploadedDoc ? ' (Subido)' : ' (Pendiente)'}
                    </label>
                    {docInfo.notes && <p className="text-xs text-gray-500 mt-1">{docInfo.notes}</p>}
                    {uploadedDoc && (
                         <a href={`/${uploadedDoc.ruta_archivo}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block mt-1" title={uploadedDoc.nombre_original}>
                             Ver: {uploadedDoc.nombre_original.length > 30 ? uploadedDoc.nombre_original.substring(0, 27) + '...' : uploadedDoc.nombre_original}
                         </a>
                    )}
                </div>
                <div className="flex-shrink-0 mt-2 sm:mt-0 w-full sm:w-auto">
                    {!uploadedDoc ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                             <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={isUploading}
                            />
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading || !idUsuarioLogueado}
                                className={`px-3 py-1 rounded text-white text-sm ${isUploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50 whitespace-nowrap`}
                            >
                                {isUploading ? "Subiendo..." : "Subir"}
                            </button>
                        </div>
                    ) : (
                         <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`px-3 py-1 rounded text-white text-sm ${isDeleting ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"} disabled:opacity-50`}
                         >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                         </button>
                    )}
                </div>
            </div>
            {selectedFile && !uploadedDoc && <p className="text-xs text-gray-500 mt-1">Seleccionado: {selectedFile.name}</p>}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};


// --- Componente Principal ---
const GestionDocumentosProveedor: React.FC<GestionDocumentosProveedorProps> = ({ idProveedor, tipoProveedor, onClose }) => {
  // ... (estados existentes: isLoading, isUploading, isDeleting, documentos, idUsuarioLogueado, error, successMessage)
  // Estados para el formulario de "Otros Documentos"
  const [archivoOtro, setArchivoOtro] = useState<File | null>(null);
  const [tipoDocumentoOtro, setTipoDocumentoOtro] = useState("");
  const fileInputOtroRef = useRef<HTMLInputElement>(null);
  const [isUploadingOtro, setIsUploadingOtro] = useState(false);

  // Estado para documentos existentes
  const [documentos, setDocumentos] = useState<DocumentoProveedor[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [idUsuarioLogueado, setIdUsuarioLogueado] = useState<number | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // Obtener ID usuario (sin cambios, pero verifica la key 'proveedorUserId')
   useEffect(() => {
    const userIdString = sessionStorage.getItem("proveedorUserId"); // Asegúrate que esta sea la key correcta
    if (userIdString) {
        const userIdNum = parseInt(userIdString, 10);
        if (!isNaN(userIdNum)) {
            setIdUsuarioLogueado(userIdNum);
        } else {
             console.error("El userId en sessionStorage ('proveedorUserId') no es un número válido:", userIdString);
             setErrorGlobal("No se pudo obtener un ID de usuario válido de la sesión.");
        }
    } else {
        setErrorGlobal("No se encontró ID de usuario en la sesión. No se pueden subir archivos.");
    }
  }, []);

  // Cargar documentos existentes
  const cargarDocumentos = useCallback(async () => {
    if (!idProveedor) return;
    setIsLoadingDocs(true);
    setErrorGlobal(null); // Limpiar error global al recargar
    try {
      const docs = await fetchDocumentosPorProveedor(idProveedor);
      setDocumentos(docs || []);
    } catch (err) {
      console.error("Error al cargar documentos:", err);
      setErrorGlobal(`Error al cargar lista de documentos: ${(err as Error).message}`);
      setDocumentos([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [idProveedor]);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]);

  // Helper para encontrar si un doc requerido ya existe
  const findUploadedDoc = (tipoDocKey: string): DocumentoProveedor | undefined => {
    // Busca por la CLAVE INTERNA (tipo_documento guardado en DB debe coincidir con la key)
    return documentos.find(doc => doc.tipo_documento === tipoDocKey);
  };

  // Renderizar los slots de documentos requeridos
   const renderRequiredDocs = (requiredList: RequiredDoc[]) => {
        if (isLoadingDocs) return <p>Cargando estado de documentos...</p>;
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
                            setSuccessMessage(`Acción completada para ${reqDoc.label}. Actualizando lista...`);
                            cargarDocumentos(); // Recarga la lista principal
                            // Limpia mensaje después de un tiempo
                            setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                    />
                ))}
            </div>
        );
    };


  // --- Lógica para "Otros Documentos" ---
  const handleFileChangeOtro = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        setArchivoOtro(e.target.files[0]);
     } else {
        setArchivoOtro(null);
     }
     setErrorGlobal(null);
     setSuccessMessage(null);
  };
   const handleTipoDocChangeOtro = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipoDocumentoOtro(e.target.value);
    setErrorGlobal(null);
    setSuccessMessage(null);
  };
  const handleUploadSubmitOtro = async (e: React.FormEvent) => {
     e.preventDefault();
     setErrorGlobal(null);
     setSuccessMessage(null);

     if (!archivoOtro || !tipoDocumentoOtro.trim() || !idUsuarioLogueado) {
         setErrorGlobal("Para 'Otros Documentos', selecciona archivo, especifica tipo y asegúrate de haber iniciado sesión.");
         return;
     }
     setIsUploadingOtro(true);
     const formData = new FormData();
     formData.append("archivo", archivoOtro);
     formData.append("tipo_documento", tipoDocumentoOtro.trim()); // Tipo especificado por el usuario
     formData.append("id_proveedor", idProveedor.toString());
     formData.append("userId", idUsuarioLogueado.toString());

     try {
         await uploadDocumentoProveedor(formData);
         setSuccessMessage(`Documento "${tipoDocumentoOtro}" subido correctamente.`);
         setArchivoOtro(null);
         setTipoDocumentoOtro("");
         if(fileInputOtroRef.current) fileInputOtroRef.current.value = "";
         cargarDocumentos(); // Recargar lista
         setTimeout(() => setSuccessMessage(null), 3000);
     } catch (err) {
         setErrorGlobal(`Error al subir 'Otro Documento': ${(err as Error).message}`);
     } finally {
         setIsUploadingOtro(false);
     }
  };
  // --- Fin Lógica "Otros Documentos" ---


  // --- Renderizado ---
  return (
    <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
             <h1 className="text-xl font-semibold">Gestionar Documentos Proveedor (ID: {idProveedor} - {tipoProveedor})</h1>
        </div>


      {/* Mensajes Globales */}
      {successMessage && (
        <div className="p-3 mb-4 border-l-4 bg-green-100 border-green-500 text-green-700" role="alert">
          <p className="font-bold">{successMessage}</p>
        </div>
      )}
      {errorGlobal && (
        <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
          <p className="font-bold">{errorGlobal}</p>
        </div>
      )}

      {/* === Sección Documentos Requeridos === */}
      <div className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-lg font-medium mb-3">Documentos Requeridos ({tipoProveedor})</h2>
         {!idUsuarioLogueado && <p className="text-red-600 text-sm mb-2">No se puede subir/eliminar: falta ID de usuario.</p>}
         {tipoProveedor === 'moral' ? (
                renderRequiredDocs(REQUIRED_DOCS_MORAL)
            ) : tipoProveedor === 'fisica' ? (
                renderRequiredDocs(REQUIRED_DOCS_FISICA)
            ) : !isLoadingDocs ? ( // Evita mostrar error de tipo si aún carga docs
                <p className="text-red-500">Tipo de proveedor ('{tipoProveedor}') no reconocido.</p>
            ) : null}
      </div>

      {/* === Sección Otros Documentos === */}
       <form onSubmit={handleUploadSubmitOtro} className="mb-6 p-4 border rounded shadow-sm bg-gray-50">
        <h2 className="text-lg font-medium mb-3">Subir Otros Documentos (Opcional)</h2>
         {!idUsuarioLogueado && <p className="text-red-600 text-sm mb-2">No se puede subir: falta ID de usuario.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label htmlFor="tipoDocumentoOtro" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tipoDocumentoOtro"
              name="tipoDocumentoOtro"
              value={tipoDocumentoOtro}
              onChange={handleTipoDocChangeOtro}
              required={archivoOtro !== null} // Solo requerido si hay archivo seleccionado
              className="border border-gray-300 p-2 rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Fianza, Contrato Adicional"
              disabled={isUploadingOtro || !idUsuarioLogueado}
            />
          </div>
           <div>
            <label htmlFor="archivoOtro" className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Archivo <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="archivoOtro"
              name="archivoOtro"
              ref={fileInputOtroRef}
              onChange={handleFileChangeOtro}
              required={tipoDocumentoOtro.trim() !== ""} // Solo requerido si se especificó tipo
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={isUploadingOtro || !idUsuarioLogueado}
            />
            {archivoOtro && <span className="text-xs text-gray-500 mt-1 block">Seleccionado: {archivoOtro.name}</span>}
          </div>
        </div>
        <button
          type="submit"
          disabled={isUploadingOtro || !archivoOtro || !tipoDocumentoOtro.trim() || !idUsuarioLogueado}
          className={`w-full md:w-auto px-4 py-2 rounded text-white ${isUploadingOtro ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50`}
        >
          {isUploadingOtro ? "Subiendo..." : "Subir Otro Documento"}
        </button>
      </form>


      {/* === Sección Resumen Documentos Subidos === */}
      {/* (Opcional: puedes quitar esta tabla si la vista de slots es suficiente) */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Resumen de Todos los Documentos Subidos</h2>
        {isLoadingDocs ? (
           <p>Cargando resumen...</p>
        ) : !documentos.length ? (
           <p className="text-gray-500 italic">Aún no hay documentos subidos.</p>
        ) : (
         <div className="overflow-x-auto border rounded shadow-sm">
            <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="...">Nombre Original</th>
                <th className="...">Tipo Documento</th>
                <th className="...">Subido</th>
                <th className="...">Acciones</th>
              </tr>
            </thead>
                <tbody>
                    {documentos.map(doc => (
                        <tr key={doc.id_documento_proveedor}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                     {/* Asume que la ruta es relativa a /public */}
                     <a href={`/${doc.ruta_archivo}`} target="_blank" rel="noopener noreferrer" title="Abrir documento">
                       {doc.nombre_original}
                     </a>
                   </td>
                   <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{doc.tipo_documento}</td>
                   <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                     {/* Formatear fecha si es necesario */}
                     {new Date(doc.created_at).toLocaleDateString()} {/* Ajusta formato si es necesario */}
                   </td>
                            <td>
                                {/* Botón eliminar general (puede coexistir con el de slots) */}
                                <button onClick={async () => {
                                    if (window.confirm(`Eliminar ${doc.nombre_original}?`)) {
                                        try {
                                            await deleteDocumentoProveedor(doc.id_documento_proveedor);
                                            cargarDocumentos();
                                        } catch (err) { setErrorGlobal(`Error: ${(err as Error).message}`); }
                                    }
                                }}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
        )}
      </div>


       {/* Botón de cierre principal */}
        <div className="flex justify-end mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cerrar Ventana
            </button>
        </div>

    </div> // Cierre del div principal
  );
};

export default GestionDocumentosProveedor;