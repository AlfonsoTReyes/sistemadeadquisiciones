// src/components/administradorProveedores/documentos/VistaDocumentosAdmin.tsx (NUEVO COMPONENTE)
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileImage, faFileAlt, faEye, faSpinner, faCheckCircle, faTimesCircle, faQuestionCircle, faEdit, faSave, faTimes, faCommentDots, faChevronDown, faChevronUp, faPaperPlane, faTrashAlt } from '@fortawesome/free-solid-svg-icons'; // Añadir iconos

// Importa las funciones fetch CORRECTAS
import {
    fetchDocumentosPorProveedorAdmin,
    updateDocumentoStatusAdmin,
    fetchComentariosPorDocumentoAdmin,
    createComentarioAdmin,
    deleteComentarioAdmin // Asumiendo que existe y la quieres usar
} from './fetchAdminDocumentosProveedores'; // Ajusta ruta

// Importa la interfaz del Documento
import { DocumentoProveedor, ComentarioDocProveedor, CreateComentarioData } from '../interfaces'; // Ajusta ruta

// Props del componente principal (AÑADIR ID ADMIN)
interface VistaDocumentosAdminProps {
    idProveedor: number;
    // **NUEVO: ID del admin logueado, necesario para crear comentarios**
    idUsuarioAdminLogueado: number;
}

// Props para la fila (AÑADIR ID ADMIN)
interface DocumentoRowProps {
    documento: DocumentoProveedor;
    onStatusChange: (idDocumento: number, nuevoEstatus: string | boolean) => Promise<void>;
    idUsuarioAdminLogueado: number;
}

// --- Componente DocumentoRow (MODIFICADO) ---
const DocumentoRow: React.FC<DocumentoRowProps> = ({
    documento,
    onStatusChange,
    idUsuarioAdminLogueado // Recibir ID admin
}) => {
    // Estados para estatus (como antes)
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string | boolean>(documento.estatus ?? 'Pendiente');
    const [newStatus, setNewStatus] = useState<string | boolean>(documento.estatus ?? 'Pendiente');
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    const [errorStatus, setErrorStatus] = useState<string | null>(null);
    const STATUS_OPTIONS = ['Pendiente', 'Aprobado', 'Rechazado', 'Solicitar Corrección'];

    // --- **NUEVO: Estados para Comentarios** ---
    const [comentarios, setComentarios] = useState<ComentarioDocProveedor[]>([]);
    const [showComentarios, setShowComentarios] = useState(false); // Controla visibilidad
    const [loadingComentarios, setLoadingComentarios] = useState(false);
    const [errorComentarios, setErrorComentarios] = useState<string | null>(null);
    const [nuevoComentario, setNuevoComentario] = useState(""); // Texto del nuevo comentario
    const [isSubmittingComentario, setIsSubmittingComentario] = useState(false);

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
    // --- **NUEVO: Funciones para Comentarios** ---
    const toggleComentarios = async () => {
        const newState = !showComentarios;
        setShowComentarios(newState);
        setErrorComentarios(null); // Limpiar error al abrir/cerrar

        // Cargar comentarios solo si se abre y no se han cargado antes (o si quieres recargar siempre)
        if (newState && comentarios.length === 0) {
            cargarComentarios();
        }
    };

    const cargarComentarios = async () => {
        setLoadingComentarios(true);
        setErrorComentarios(null);
        try {
            const fetchedComentarios = await fetchComentariosPorDocumentoAdmin(documento.id_documento_proveedor);
            const comentariosTransformados: ComentarioDocProveedor[] = (fetchedComentarios || []).map((com: any) => ({
                id_comentario: com.id_comentario,
                id_documento_proveedor: com.id_documento_proveedor,
                id_usuario: com.id_usuario,
                comentario: com.comentario,
                created_at: com.created_at,
                nombre_admin: com.nombre_admin,
                apellidos_admin: com.apellidos_admin
            }));

            setComentarios(comentariosTransformados);
        } catch (err) {
            console.error("Error cargando comentarios:", err);
            setErrorComentarios((err as Error).message || "Error al cargar comentarios.");
        } finally {
            setLoadingComentarios(false);
        }
    };

    const handleNuevoComentarioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNuevoComentario(e.target.value);
        setErrorComentarios(null); // Limpiar error al escribir
    };

    const handleCrearComentario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) {
            setErrorComentarios("El comentario no puede estar vacío.");
            return;
        }
        const adminId = idUsuarioAdminLogueado; // Usar la prop recibida

        if (!adminId || isNaN(adminId) || !documento?.id_documento_proveedor || isNaN(documento.id_documento_proveedor)) {
            setErrorComentarios("Error: ID de usuario administrador o ID de documento no válido.");
            return;
        }

        setIsSubmittingComentario(true);
        setErrorComentarios(null);

        try {
            await createComentarioAdmin(
                documento.id_documento_proveedor, // 1er argumento: idDocumento
                nuevoComentario.trim(),           // 2do argumento: comentarioTexto
                adminId                          // 3er argumento: idUsuarioAdmin
            );

            setNuevoComentario(""); // Limpiar textarea
            await cargarComentarios(); // Recargar lista de comentarios

        } catch (err: any) {
            console.error("Error creando comentario:", err);
            setErrorComentarios(err.message || "Error al guardar comentario.");
        } finally {
            setIsSubmittingComentario(false);
        }
    };

    // Opcional: Handler para eliminar comentario (necesitarías un botón en la lista de comentarios)
    const handleEliminarComentarioClick = async (idComentario: number) => {
        if (!window.confirm("¿Seguro que quieres eliminar este comentario?")) return;
        setErrorComentarios(null);
        try {
            await deleteComentarioAdmin(idComentario);
            cargarComentarios(); // Recargar lista
        } catch (err) {
            setErrorComentarios((err as Error).message || "Error al eliminar comentario.");
        }
    };
    // --- FIN Funciones Comentarios ---
    const statusInfo = getStatusIndicator(currentStatus);

    return (
        // Usar React.Fragment para poder retornar múltiples elementos (tr + tr condicional)
        <>
            {/* --- Fila Principal del Documento (como antes, pero con botón comentarios) --- */}
            <tr className="bg-white border-b hover:bg-gray-50">
                {/* Tipo y Nombre */}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                    <FontAwesomeIcon icon={getFileIcon(documento.nombre_original)} className="mr-2 text-gray-400" />
                    {documento.tipo_documento}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 align-top break-words">
                    {documento.nombre_original}
                </td>
                {/* Fecha Carga */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 align-top">
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
                {/* Acciones */}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center space-x-2 align-top">
                    {/* Botón Ver */}
                    <a href={`/${documento.ruta_archivo}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs" title="Ver/Descargar">Ver</a>
                    {/* Botón Editar Estatus */}
                    {!isEditingStatus && (<button onClick={handleStatusEditToggle} className="text-indigo-600 hover:underline text-xs" title="Cambiar Estatus"><FontAwesomeIcon icon={faEdit} /> Cambiar</button>)}
                    {/* **NUEVO: Botón Comentarios** */}
                    <button onClick={toggleComentarios} className="text-gray-600 hover:text-black text-xs" title={showComentarios ? "Ocultar Comentarios" : "Ver/Añadir Comentarios"}>
                        <FontAwesomeIcon icon={faCommentDots} className="mr-1" />
                        ({comentarios.length}) {/* Mostrar contador */}
                        <FontAwesomeIcon icon={showComentarios ? faChevronUp : faChevronDown} className="ml-1 text-xs" />
                    </button>
                </td>
            </tr>

            {/* --- **NUEVO: Fila Condicional para Mostrar/Añadir Comentarios** --- */}
            {showComentarios && (
                <tr className="bg-gray-50 border-b">
                    {/* Usar colspan para que ocupe todas las columnas */}
                    <td colSpan={5} className="px-6 py-4">
                        <div className="max-w-2xl mx-auto"> {/* Limitar ancho para legibilidad */}
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Comentarios del Documento</h4>
                            {/* Sección para mostrar errores de comentarios */}
                            {errorComentarios && <p className="text-xs text-red-600 mb-2">{errorComentarios}</p>}

                            {/* Lista de Comentarios */}
                            {loadingComentarios ? (
                                <p className="text-xs text-gray-500 italic">Cargando comentarios...</p>
                            ) : comentarios.length > 0 ? (
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-4 custom-scrollbar">
                                    {comentarios.map(com => (
                                        <div key={com.id_comentario} className="p-2 border rounded bg-white text-xs">
                                            <p className="text-gray-800">{com.comentario}</p>
                                            <p className="text-gray-500 mt-1 text-right">
                                                - {com.nombre_admin || 'Admin'} {com.apellidos_admin || ''} el {new Date(com.created_at).toLocaleString()}
                                                {/* Opcional: Botón Eliminar Comentario */}
                                                <button onClick={() => handleEliminarComentarioClick(com.id_comentario)} className="ml-2 text-red-500 hover:text-red-700 text-xs"> (Eliminar)</button>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic mb-3">No hay comentarios para este documento.</p>
                            )}

                            {/* Formulario para Añadir Comentario */}
                            <form onSubmit={handleCrearComentario} className="mt-2">
                                <label htmlFor={`nuevoComentario-${documento.id_documento_proveedor}`} className="block text-xs font-medium text-gray-600 mb-1">Añadir Comentario:</label>
                                <textarea
                                    id={`nuevoComentario-${documento.id_documento_proveedor}`}
                                    rows={2}
                                    value={nuevoComentario}
                                    onChange={handleNuevoComentarioChange}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    placeholder="Escriba su comentario aquí..."
                                    disabled={isSubmittingComentario}
                                    required
                                />
                                <div className="text-right mt-2">
                                    <button
                                        type="submit"
                                        className="button-primary-small disabled:opacity-50"
                                        disabled={isSubmittingComentario || !nuevoComentario.trim()}
                                    >
                                        {isSubmittingComentario ? (
                                            <><FontAwesomeIcon icon={faSpinner} spin className="mr-1" /> Enviando...</>
                                        ) : (
                                            <><FontAwesomeIcon icon={faPaperPlane} className="mr-1" /> Enviar</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </td>
                </tr>
            )}
            {/* --- FIN Fila Condicional --- */}
        </>
    );
}


// --- Componente Principal de la Vista ---
const VistaDocumentosAdmin: React.FC<VistaDocumentosAdminProps> = ({
    idProveedor,
    idUsuarioAdminLogueado // <-- Recibir ID del admin
}) => {
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
            setDocumentos((docs || []) as DocumentoProveedor[]);
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
            {/* ... (Mensajes Globales como antes) ... */}
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
            ) : (
                <div className="overflow-x-auto border rounded shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Ajustar encabezados si es necesario */}
                                <th scope="col" className="...">Tipo Doc.</th>
                                <th scope="col" className="...">Nombre Archivo</th>
                                <th scope="col" className="...">Cargado</th>
                                <th scope="col" className="...">Estatus</th>
                                <th scope="col" className="...">Acciones / Comentarios</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {documentos.map(doc => (
                                <DocumentoRow
                                    key={doc.id_documento_proveedor}
                                    documento={doc}
                                    onStatusChange={handleDocumentStatusChange}
                                    // **PASAR ID ADMIN A LA FILA**
                                    idUsuarioAdminLogueado={idUsuarioAdminLogueado}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Estilos para scrollbar si es necesario */}
            <style jsx>{`
             .custom-scrollbar::-webkit-scrollbar { width: 6px; }
             .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
             .custom-scrollbar::-webkit-scrollbar-thumb { background: #c5c5c5; border-radius: 3px; }
             .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        `}</style>
        </div>
    );
};

export default VistaDocumentosAdmin;