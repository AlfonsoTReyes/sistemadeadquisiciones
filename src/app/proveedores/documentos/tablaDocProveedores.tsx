// --- componentes/proveedores/dashboard/tablaDocProveedores.tsx ---
'use client';
import React, { useState, useCallback } from 'react'; // Añadir hooks necesarios
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileImage, faFileAlt, faChevronDown, faChevronUp, faSpinner, faCommentDots, faUserShield } from '@fortawesome/free-solid-svg-icons'; // Añadir iconos
// Importar fetch para OBTENER comentarios
import { fetchComentariosPorDocumentoParaProveedor } from './formularios/fetchDocumentosProveedores'; // Ajusta ruta
// Importar interfaces
import { DocumentoProveedor, ComentarioDocProveedor } from './interfaces'; // Ajusta ruta

// Props de la tabla principal (sin cambios)
interface TablaDocumentosProveedorProps {
  documentos: DocumentoProveedor[];
  isLoading: boolean;
}

// --- NUEVO: Componente para una fila individual con comentarios ---
interface DocumentoRowProps {
    documento: DocumentoProveedor;
}

const DocumentoRowConComentarios: React.FC<DocumentoRowProps> = ({ documento }) => {
    const [comentarios, setComentarios] = useState<ComentarioDocProveedor[]>([]);
    const [showComentarios, setShowComentarios] = useState(false);
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    const [errorComentarios, setErrorComentarios] = useState<string | null>(null);

    // Función para cargar comentarios de ESTE documento
    const cargarComentarios = useCallback(async () => {
        if (!documento.id_documento_proveedor) return;
        setLoadingComentarios(true);
        setErrorComentarios(null);
        try {
            const fetchedComentarios = await fetchComentariosPorDocumentoParaProveedor(documento.id_documento_proveedor) as ComentarioDocProveedor[];
            setComentarios(fetchedComentarios || []);
        } catch (err) {
            console.error(`Error cargando comentarios para doc ${documento.id_documento_proveedor}:`, err);
            setErrorComentarios((err as Error).message || "Error al cargar comentarios.");
            setComentarios([]); // Limpiar en caso de error
        } finally {
            setLoadingComentarios(false);
        }
    }, [documento.id_documento_proveedor]); // Depende del ID del documento

    // Handler para mostrar/ocultar y cargar comentarios
    const toggleComentarios = () => {
        const newState = !showComentarios;
        setShowComentarios(newState);
        // Cargar solo la primera vez que se abre
        if (newState && comentarios.length === 0) {
            cargarComentarios();
        }
    };

    // Helper para icono de archivo
    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') return faFilePdf;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return faFileImage;
        return faFileAlt;
    };

     // Helper para badge de estatus
    const getStatusBadge = (status: string | null | undefined) => {
        const defaultStatus = 'Pendiente';
        const statusText = status || defaultStatus;
        let classes = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        if (status === 'Aprobado') classes += ' bg-green-100 text-green-800';
        else if (status === 'Rechazado') classes += ' bg-red-100 text-red-800';
        else if (status === 'Solicitar Corrección') classes += ' bg-yellow-100 text-yellow-800';
        else classes += ' bg-gray-100 text-gray-800'; // Pendiente o N/A
        return <span className={classes}>{statusText}</span>;
    };

    return (
        <>
            {/* Fila Principal del Documento */}
            <tr className="hover:bg-gray-50">
                {/* Nombre Original (con enlace) */}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                    <FontAwesomeIcon icon={getFileIcon(documento.nombre_original)} className="mr-2 text-gray-400 fa-fw" />
                    <a href={`/${documento.ruta_archivo}`} target="_blank" rel="noopener noreferrer" title={`Ver ${documento.nombre_original}`}>
                        {documento.nombre_original}
                    </a>
                </td>
                {/* Tipo Documento */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {documento.tipo_documento}
                </td>
                {/* Fecha Subida */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {documento.created_at ? new Date(documento.created_at).toLocaleDateString() : 'N/A'}
                </td>
                {/* Estatus */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {getStatusBadge(documento.estatus)}
                </td>
                 {/* **NUEVO:** Celda para Acción de Comentarios */}
                 <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                     <button
                        onClick={toggleComentarios}
                        className="text-gray-500 hover:text-indigo-600 focus:outline-none text-xs"
                        title={showComentarios ? "Ocultar Comentarios" : "Ver Comentarios"}
                    >
                         <FontAwesomeIcon icon={faCommentDots} className="mr-1"/>
                         ({comentarios.length}) {/* Mostrar contador */}
                         <FontAwesomeIcon icon={showComentarios ? faChevronUp : faChevronDown} className="ml-1"/>
                     </button>
                 </td>
            </tr>

            {/* **NUEVO:** Fila Condicional para Mostrar Comentarios */}
            {showComentarios && (
                <tr className="bg-slate-50 border-l-4 border-slate-300">
                    {/* Celda que abarca todas las columnas */}
                    <td colSpan={5} className="px-6 py-4">
                        <div className="pl-4 border-l-2 border-slate-200">
                            <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Comentarios del Administrador:</h4>
                            {loadingComentarios ? (
                                <p className="text-xs text-gray-500 italic flex items-center"><FontAwesomeIcon icon={faSpinner} spin className="mr-2"/> Cargando...</p>
                            ) : errorComentarios ? (
                                <p className="text-xs text-red-600">{errorComentarios}</p>
                            ) : comentarios.length > 0 ? (
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar-thin">
                                    {comentarios.map(com => (
                                        <div key={com.id_comentario} className="p-2 border rounded bg-white text-xs shadow-sm">
                                            <p className="text-gray-800 mb-1">{com.comentario}</p>
                                            <p className="text-gray-500 text-right border-t pt-1 mt-1">
                                                <FontAwesomeIcon icon={faUserShield} className="mr-1" /> {/* Icono Admin */}
                                                {com.nombre_admin || 'Admin'} {com.apellidos_admin || ''} - {new Date(com.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic">No hay comentarios para este documento.</p>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// --- Componente Principal de la Tabla ---
const TablaDocumentosProveedor: React.FC<TablaDocumentosProveedorProps> = ({ documentos, isLoading }) => {

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-4">
             <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-blue-500" />
            <span>Cargando documentos...</span>
        </div>
    );
  }

  if (!documentos || documentos.length === 0) {
    return <p className="text-gray-500 italic text-center my-4">No hay documentos registrados.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre Original
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo Documento
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Subida
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estatus Admin
            </th>
             {/* **NUEVO:** Encabezado Columna Comentarios */}
             <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comentarios
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Mapear documentos y renderizar el nuevo componente de fila */}
          {documentos.map((doc) => (
            <DocumentoRowConComentarios key={doc.id_documento_proveedor} documento={doc} />
          ))}
        </tbody>
      </table>
       {/* Estilos para scrollbar delgado */}
       <style jsx>{`
             .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
             .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 2px; }
             .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
             .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        `}</style>
    </div>
  );
};

export default TablaDocumentosProveedor;