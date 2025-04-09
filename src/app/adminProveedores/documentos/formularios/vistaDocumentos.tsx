// src/components/administradorProveedores/documentos/VistaDocumentosAdmin.tsx (NUEVO COMPONENTE)

"use client"; // Necesario para hooks

import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileImage, faFileAlt, faEye, faSpinner, faCheckCircle, faTimesCircle, faQuestionCircle, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'; // Añade/ajusta iconos

// Importa las funciones fetch CORRECTAS para esta vista
import {
  fetchDocumentosPorProveedorAdmin, // La que obtiene la lista para este proveedor
  updateDocumentoStatusAdmin      // La que actualiza el estatus
} from './fetchAdminDocumentosProveedores'; // Ajusta la ruta a tu archivo fetch de admin docs

// Importa la interfaz del Documento
import { DocumentoProveedor } from '../interfaces'; // Ajusta ruta

// Props que recibirá este componente desde la página principal
interface VistaDocumentosAdminProps {
  idProveedor: number; // El ID del proveedor cuyos documentos se mostrarán
}

// Componente para una FILA de la tabla de documentos
interface DocumentoRowProps {
    documento: DocumentoProveedor;
    onStatusChange: (idDocumento: number, nuevoEstatus: string | boolean) => Promise<void>; // Función para llamar a la API de cambio de estatus
    // Añade otros props si necesitas más info o acciones
}

const DocumentoRow: React.FC<DocumentoRowProps> = ({ documento, onStatusChange }) => {
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    // El estado local podría ser string o boolean, depende de tu DB y preferencias
    const [currentStatus, setCurrentStatus] = useState<string | boolean>(documento.estatus ?? 'Pendiente'); // Valor inicial
    const [newStatus, setNewStatus] = useState<string | boolean>(documento.estatus ?? 'Pendiente');
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    const [errorStatus, setErrorStatus] = useState<string | null>(null);

    // Posibles estados (ajusta según tu lógica de negocio)
    const STATUS_OPTIONS = ['Pendiente', 'Aprobado', 'Rechazado', 'Solicitar Corrección']; // Ejemplo con strings

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') return faFilePdf;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return faFileImage;
        return faFileAlt;
    };

     // Asume que tienes una ruta API para servir/descargar archivos
    const handleViewClick = () => {
        // NECESITAS UNA RUTA API O URL PÚBLICA PARA ESTO
        // Ejemplo: window.open(`/api/documentos/descargar/${documento.id_documento_proveedor}`, '_blank');
        // O si la ruta_archivo es pública relativa: window.open(`/${documento.ruta_archivo}`, '_blank');
        console.warn("Funcionalidad 'Ver/Descargar' necesita implementación de ruta API o URL pública. Ruta actual:", documento.ruta_archivo);
        alert("Funcionalidad para ver/descargar el archivo no implementada completamente.");
    };

    const handleStatusEditToggle = () => {
        setIsEditingStatus(!isEditingStatus);
        setNewStatus(currentStatus); // Resetea al valor actual al cancelar/abrir
        setErrorStatus(null); // Limpia errores al cambiar modo
    };

    const handleSaveStatus = async () => {
        if (newStatus === currentStatus) {
            setIsEditingStatus(false); // No hubo cambios
            return;
        }
        setIsLoadingStatus(true);
        setErrorStatus(null);
        try {
            // Llama a la función pasada por props que interactúa con la API
            await onStatusChange(documento.id_documento_proveedor, newStatus);
            setCurrentStatus(newStatus); // Actualiza el estado local si la API fue exitosa
            setIsEditingStatus(false); // Cierra el modo edición
        } catch (err) {
            setErrorStatus((err as Error).message || "Error al guardar estatus.");
            // No cerramos la edición para que vea el error
        } finally {
            setIsLoadingStatus(false);
        }
    };

    // Función para obtener el color/icono según el estatus actual
    const getStatusIndicator = (status: string | boolean | null | undefined) => {
        // Adapta esta lógica a tus estados y si usas boolean o string
        if (status === 'Aprobado' || status === true) return { icon: faCheckCircle, color: 'text-green-600', text: 'Aprobado' };
        if (status === 'Rechazado') return { icon: faTimesCircle, color: 'text-red-600', text: 'Rechazado' };
        if (status === 'Solicitar Corrección') return { icon: faEdit, color: 'text-yellow-600', text: 'Corrección Solicitada' };
        // Por defecto o Pendiente / null / false
        return { icon: faQuestionCircle, color: 'text-gray-500', text: 'Pendiente' };
    };

    const statusInfo = getStatusIndicator(currentStatus);

    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            {/* Tipo y Nombre */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <FontAwesomeIcon icon={getFileIcon(documento.nombre_original)} className="mr-2 text-gray-500" />
                {documento.tipo_documento}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {documento.nombre_original}
            </td>
             {/* Fecha Carga */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {documento.created_at ? new Date(documento.created_at).toLocaleDateString() : 'N/A'}
            </td>
             {/* Estatus Actual y Edición */}
             <td className="px-6 py-4 whitespace-nowrap text-sm">
                {!isEditingStatus ? (
                    <span className={`flex items-center ${statusInfo.color}`}>
                        <FontAwesomeIcon icon={statusInfo.icon} className="mr-2" />
                        {statusInfo.text}
                    </span>
                ) : (
                    // Selector para cambiar estatus
                    <div className="flex items-center gap-2">
                        <select
                            value={String(newStatus)} // El select maneja mejor strings
                            onChange={(e) => setNewStatus(e.target.value)} // Actualiza el estado temporal
                            className="border border-gray-300 p-1 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoadingStatus}
                        >
                            {/* Mapea tus opciones de estatus */}
                            {STATUS_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <button onClick={handleSaveStatus} disabled={isLoadingStatus} className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50" title="Guardar">
                            <FontAwesomeIcon icon={isLoadingStatus ? faSpinner : faSave} spin={isLoadingStatus} />
                        </button>
                        <button onClick={handleStatusEditToggle} disabled={isLoadingStatus} className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50" title="Cancelar">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                )}
                 {/* Mostrar error de guardado de estatus */}
                 {errorStatus && isEditingStatus && <p className="text-xs text-red-500 mt-1">{errorStatus}</p>}
            </td>
             {/* Acciones: Ver y Editar Estatus */}
             <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-3">
             <a
    href={`/${documento.ruta_archivo}`} // Asume que ruta_archivo es algo como 'uploads/docs/mi_archivo.pdf'
                                        // y está dentro de la carpeta 'public' de Next.js.
                                        // El '/' inicial lo hace relativo a la raíz del sitio web.
    target="_blank"                     // Abre en una nueva pestaña
    rel="noopener noreferrer"           // Buenas prácticas de seguridad para target="_blank"
    className="text-blue-600 hover:text-blue-800 hover:underline" // Clases de estilo (ej. Tailwind)
    title={`Ver/Descargar ${documento.nombre_original || 'documento'}`} // Texto al pasar el mouse
>
    {/* Puedes poner texto o un icono aquí */}
    Ver Documento
    {/* O podrías mostrar el nombre del archivo como enlace: */}
    {/* {documento.nombre_original} */}
</a>
                {!isEditingStatus && (
                    <button
                    onClick={handleStatusEditToggle}
                    className="font-medium text-indigo-600 hover:underline"
                    title="Cambiar Estatus"
                    >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" /> Cambiar Estatus
                    </button>
                )}
            </td>
        </tr>
    );
}


// --- Componente Principal de la Vista ---
const VistaDocumentosAdmin: React.FC<VistaDocumentosAdminProps> = ({ idProveedor }) => {

  const [documentos, setDocumentos] = useState<DocumentoProveedor[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para feedback

  // Cargar documentos existentes al montar o cuando cambie idProveedor
  const cargarDocumentos = useCallback(async () => {
    if (!idProveedor) {
        setErrorGlobal("ID de proveedor no proporcionado.");
        setIsLoadingDocs(false);
        return;
    };
    setIsLoadingDocs(true);
    setErrorGlobal(null); // Limpiar error global al recargar
    try {
      // Llama a la función fetch específica para obtener documentos
      const docs = await fetchDocumentosPorProveedorAdmin(idProveedor);
      setDocumentos(docs || []);
    } catch (err) {
      console.error("Error al cargar documentos para admin:", err);
      setErrorGlobal(`Error al cargar lista de documentos: ${(err as Error).message}`);
      setDocumentos([]);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [idProveedor]); // Depende de idProveedor

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]); // Llama a cargar al montar y si idProveedor cambia


  // --- FUNCIÓN PARA MANEJAR EL CAMBIO DE ESTATUS (llamará a la API) ---
  // Esta función se pasa como prop a cada DocumentoRow
  const handleDocumentStatusChange = async (idDocumento: number, nuevoEstatus: string | boolean): Promise<void> => {
      setErrorGlobal(null); // Limpia errores globales antes de intentar
      setSuccessMessage(null);
      // console.log(`Admin View: Attempting to change status for doc ${idDocumento} to ${nuevoEstatus}`); // Debug

      // ¡Retornamos la promesa para que DocumentoRow sepa si tuvo éxito o no!
      return updateDocumentoStatusAdmin(idDocumento, nuevoEstatus)
        .then(updatedDoc => {
            // Éxito: Mostrar mensaje y actualizar la lista localmente (opcional pero mejora UX)
            setSuccessMessage(`Estatus del documento ${updatedDoc.nombre_original || idDocumento} actualizado a "${nuevoEstatus}".`);
            // Actualizar la lista local para reflejar el cambio inmediatamente
            setDocumentos(prevDocs =>
                prevDocs.map(doc =>
                    doc.id_documento_proveedor === idDocumento ? { ...doc, estatus: nuevoEstatus, updates_at: new Date().toISOString() } : doc
                )
            );
             // Limpia mensaje después de un tiempo
             setTimeout(() => setSuccessMessage(null), 4000);
             // NO recargamos toda la lista desde la DB aquí para evitar parpadeo,
             // confiamos en la respuesta de la API y actualizamos localmente.
        })
        .catch(err => {
             // Falla: Mostrar error global y RE-LANZAR el error para que DocumentoRow lo maneje
             const errorMsg = `Error al actualizar estatus del doc ${idDocumento}: ${(err as Error).message}`;
             console.error(errorMsg);
             setErrorGlobal(errorMsg);
             throw err; // Re-lanzar para que el catch en DocumentoRow funcione
        });
  };


  // --- Renderizado ---
  return (
    <div className="p-4 md:p-6 bg-white shadow rounded-lg">
        {/* Mensajes Globales */}
        {successMessage && (
            <div className="p-3 mb-4 border-l-4 bg-green-100 border-green-500 text-green-700" role="alert">
            <p>{successMessage}</p>
            </div>
        )}
        {errorGlobal && (
            <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
            <p className="font-bold">{errorGlobal}</p>
            </div>
        )}

        {/* Tabla de Documentos */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Documentos Cargados</h2>
        {isLoadingDocs ? (
            <p className="text-center text-gray-500 py-4">Cargando documentos...</p>
        ) : !documentos.length && !errorGlobal ? ( // Solo muestra si no hay error y terminó carga
            <p className="text-center text-gray-500 italic py-4">Este proveedor no ha cargado ningún documento.</p>
        ) : errorGlobal && !documentos.length ? ( // Si hubo error y no hay documentos
             <p className="text-center text-gray-500 italic py-4">No se pudieron cargar los documentos.</p>
        ): (
            <div className="overflow-x-auto border rounded">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Archivo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Carga</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documentos.map(doc => (
                            <DocumentoRow
                                key={doc.id_documento_proveedor}
                                documento={doc}
                                onStatusChange={handleDocumentStatusChange} // Pasa la función handler
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div> // Cierre del div principal
  );
};

export default VistaDocumentosAdmin;