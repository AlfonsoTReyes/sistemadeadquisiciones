"use client";
import { useState } from "react";
import Link from 'next/link';
import { DetallesSolicitud } from "./interfaces";
import ModalJustificacion from "../justificaciones/alta";
import ModalJustificacionEditar from "../justificaciones/modificar";
import ModalPreSuEditar from "../../pre_suficiencia/formularios/modificacion";
import ModalSuficiencia from "../../pre_suficiencia/formularios/alta";
import ModalDocumentoAdicional from "./formularios/alta_doc_adic"; 
import ModalDocumentoAdicionalEliminar from "./formularios/eliminar_doc_adic"; 
import ModificarSolicitud from "../solicitudes/formularios/modificar";
import ModalComentarios from "../../comentarios_documentos/modal";
import ModalConfirmacion from "./formularios/modificarEstatus";
import generarPDFSolicitud from "../../PDF/solicitud";


const TablaSolicitudes: React.FC<{ 
    solicitudes: DetallesSolicitud;
    onSolicitudAdded: () => Promise<void>;
    }> = ({ solicitudes, onSolicitudAdded }) => {
    const [isJustificacionModalOpen, setJustificacionModalOpen] = useState(false);
    const [isSuficienciaModalOpen, setSuficienciaModalOpen] = useState(false);
    const [isModalDocOpen, setModalDocOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [solicitudAEditar, setSolicitudAEditar] = useState<number | null>(null);
    const [isEditJustModalOpen, setIsEditJustModalOpen] = useState(false);
    const [justificacionAEditar, setJustificacionAEditar] = useState<number | null>(null);
    const [isEditPreModalOpen, setIsEditPreModalOpen] = useState(false);
    const [preAEditar, setPreAEditar] = useState<number | null>(null);
    const [isEditDocModalOpen, setIsEditDocModalOpen] = useState(false);
    const [docAEditar, setDocAEditar] = useState<number | null>(null);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [tipoOrigenComentario, setTipoOrigenComentario] = useState<string>("");
    const [idOrigenComentario, setIdOrigenComentario] = useState<number | null>(null);
    const [id_sol, setSol] = useState<number | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [estatusDoc, setDocEstatus] = useState<number | null>(null);
    const [tipoOrigenModal, setTipoOrigenModal] = useState<string>("");

    const handlePDF = () => {
        if (solicitud?.id_solicitud) {
          generarPDFSolicitud(solicitud.id_solicitud);
        }
      };


    const openEditDocModal = (id: number) => {
        setDocAEditar(id);
        setIsEditDocModalOpen(true);
    };

    const closeEditDocModal = () => {
        setDocAEditar(null);
        setIsEditDocModalOpen(false);
        onSolicitudAdded();
    };
    
    const openEditModal = (id: number) => {
        setSolicitudAEditar(id);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSolicitudAEditar(null);
        setIsEditModalOpen(false);
        onSolicitudAdded();
    };

    const openEditPreModal = (id: number) => {
        setPreAEditar(id);
        setIsEditPreModalOpen(true);
    };

    const closeEditPreModal = () => {
        setPreAEditar(null);
        setIsEditPreModalOpen(false);
        onSolicitudAdded();
    };

    const openEditJustModal = (id: number) => {
        setJustificacionAEditar(id);
        setIsEditJustModalOpen(true);
    };

    const closeEditJustModal = () => {
        setJustificacionAEditar(null);
        setIsEditJustModalOpen(false);
        onSolicitudAdded();
    };

    const openCommentsModal = (id: number, tipo: string, sol:number) => {
        setIdOrigenComentario(id);
        setTipoOrigenComentario(tipo);
        setSol(sol);
        setIsCommentsModalOpen(true);
    };
      
    const closeCommentsModal = () => {
        setIdOrigenComentario(null);
        setTipoOrigenComentario("");
        setIsCommentsModalOpen(false);
    };

    const abrirModalConfirmacion = (idDoc: number, tipoOrigen: string) => {
        setDocEstatus(idDoc);
        setTipoOrigenModal(tipoOrigen);
        setIsConfirmModalOpen(true);
      };
      
      // Cerrar modal sin hacer cambios
      const cerrarModalConfirmacion = () => {
        setIsConfirmModalOpen(false);
        setDocEstatus(null);
        setTipoOrigenModal("");
      };

    if (!solicitudes?.solicitud) {
        return <p className="text-gray-500">No hay detalles disponibles.</p>;
    }

    const { solicitud, justificacion, techoPresupuestal, documentos_adicionales } = solicitudes;

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card de Solicitud */}
            <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 hover:shadow-2xl transition duration-300">
                <div className="text-5xl text-center mb-4">📄</div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Solicitud</h2>
                <p><strong>Folio:</strong> {solicitud.id_solicitud}</p>
                <p><strong>Solicitante:</strong> {solicitud.nomina_solicitante}</p>
                <p><strong>Secretaría:</strong> {solicitud.nombre_secretaria}</p>
                <p><strong>Motivo:</strong> {solicitud.motivo}</p>
                <p><strong>Monto:</strong> ${solicitud.monto}</p>
                <p><strong>Fecha Solicitud:</strong> {solicitud.fecha_solicitud}</p>
                <p className={`font-semibold ${solicitud.estatus === "pendiente" ? "text-yellow-500" : "text-green-600"}`}>
                    Estatus: {solicitud.estatus}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                    <button onClick={() => openEditModal(solicitud.id_solicitud)} className="bg-yellow-500 text-white py-2 rounded-xl shadow hover:bg-yellow-600 transition">
                        Editar
                    </button>
                    <button
  onClick={handlePDF}
  className="bg-rose-500 text-white py-2 rounded-xl shadow hover:bg-rose-600 transition"
>
  Generar PDF
</button>



                    <button
                        onClick={() => openCommentsModal(solicitud.id_solicitud, "suficiencia", solicitud.id_solicitud)}
                        className="bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 transition"
                        >
                        Ver Comentarios
                    </button>
                    <button
                        onClick={() =>
                            abrirModalConfirmacion(solicitud.id_solicitud, "suficiencia")
                        }
                        className="bg-green-500 text-white py-2 rounded-xl shadow hover:bg-green-600 transition"
                        >
                        Actualizar estatus
                    </button>


                </div>
            </div>

            {/* Card de Justificación */}
            {justificacion ? (
                <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 hover:shadow-2xl transition duration-300">
                    <div className="text-5xl text-center mb-4">📜</div>
                    <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Justificación</h2>
                    <p><strong>Asunto:</strong> {justificacion.asunto}</p>
                    <p><strong>Lugar:</strong> {justificacion.lugar}</p>
                    <p><strong>Dirigido a:</strong> {justificacion.nombre_dirigido}</p>
                    <p><strong>Fecha:</strong> {justificacion.fecha_hora}</p>
                    <p className={`font-semibold ${justificacion.estatus === "Pendiente" ? "text-yellow-500" : "text-green-600"}`}>
                        Estatus: {solicitud.estatus}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                        <button onClick={() => openEditJustModal(justificacion.id_justificacion)} className="bg-yellow-500 text-white py-2 rounded-xl shadow hover:bg-yellow-600 transition">
                            Editar
                        </button>
                        <button className="bg-rose-500 text-white py-2 rounded-xl shadow hover:bg-rose-600 transition">Generar PDF</button>
                        <button
                            onClick={() => openCommentsModal(justificacion.id_justificacion, "justificacion", justificacion.id_solicitud)}
                            className="bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 transition"
                            >
                            Ver Comentarios
                        </button>
                        <button
                            onClick={() =>
                                abrirModalConfirmacion(
                                justificacion.id_justificacion, "justificacion"
                                )
                            }
                            className="bg-green-500 text-white py-2 rounded-xl shadow hover:bg-green-600 transition"
                            >
                            Actualizar estatus
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-100 shadow-xl rounded-xl p-6 border border-yellow-300 text-yellow-800">
                    <div className="text-5xl text-center mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-center mb-2">Justificación pendiente</h2>
                    <p className="text-center">No se ha registrado una justificación para esta solicitud.</p>
                    <div className="mt-4 text-center">
                    <button
                        onClick={() => setJustificacionModalOpen(true)}
                        className="bg-rose-500 text-white py-2 px-4 rounded-xl shadow hover:bg-rose-600 transition"
                    >
                        Generar Justificación
                    </button>
                    </div>
                </div>
            )}

            {/* Card de Techo Presupuestal */}
            {techoPresupuestal ? (
                <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 hover:shadow-2xl transition duration-300">
                    <div className="text-5xl text-center mb-4">💰</div>
                    <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Solicitud Pre-suficiencia</h2>
                    <p><strong>Fecha peticion:</strong> {techoPresupuestal.created_at}</p>
                    <p><strong>No. Folio:</strong> {techoPresupuestal.oficio}</p>
                    <p><strong>Fecha Aprobación:</strong> {techoPresupuestal.fecha_aprobacion}</p>
                    <p className={`font-semibold ${techoPresupuestal.estatus === "pendiente" ? "text-yellow-500" : "text-green-600"}`}>
                        Estatus: {techoPresupuestal.estatus}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                        <button onClick={() => openEditPreModal(techoPresupuestal.id_suficiencia)} className="bg-yellow-500 text-white py-2 rounded-xl shadow hover:bg-yellow-600 transition">
                            Editar
                        </button>
                        <button className="bg-rose-500 text-white py-2 rounded-xl shadow hover:bg-rose-600 transition">
                            Generar PDF
                        </button>
                        <button
                            onClick={() => openCommentsModal(techoPresupuestal.id_suficiencia, "adquisicion", techoPresupuestal.id_solicitud)}
                            className="bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 transition"
                            >
                            Ver Comentarios
                        </button>
                        <button
                            onClick={() =>
                                abrirModalConfirmacion(
                                techoPresupuestal.id_suficiencia, "aquisicion"
                                )
                            }
                            className="bg-green-500 text-white py-2 rounded-xl shadow hover:bg-green-600 transition"
                            >
                                Actualizar estatus
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-100 shadow-xl rounded-xl p-6 border border-yellow-300 text-yellow-800">
                    <div className="text-5xl text-center mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-center mb-2">Techo presupuestal pendiente</h2>
                    <p className="text-center">No se ha aprobado un techo presupuestal para esta solicitud.</p>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setSuficienciaModalOpen(true)}
                            className="bg-rose-500 text-white py-2 px-4 rounded-xl shadow hover:bg-rose-600 transition"
                        >
                            Generar solicitud suficiencia
                        </button>
                    </div>
                </div>
            )}

            {/* Documentos adicionales */}
            {documentos_adicionales && documentos_adicionales.length > 0 ? (
                <>
                    {documentos_adicionales.map((doc) => (
                    <div key={doc.id_doc_solicitud} className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 hover:shadow-2xl transition duration-300">
                        <div className="text-5xl text-center mb-4">📁</div>
                        <h2 className="text-xl font-bold text-center text-gray-800 mb-4 capitalize">
                        {doc.tipo_documento}
                        </h2>
                        <p><strong>Nombre original:</strong> {doc.nombre_original}</p>
                        <p><strong>Subido el:</strong> {new Date(doc.created_at).toLocaleString()}</p>
                        <p className={`font-semibold ${doc.estatus === "Pendiente" ? "text-yellow-500" : "text-green-600"}`}>
                        Estatus: {doc.estatus}
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                            <a
                                href={`/${doc.ruta_archivo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white text-center py-2 rounded-xl shadow hover:bg-blue-600 transition"
                            >
                                Ver documento
                            </a>
                            <button
                                key={doc.id_doc_solicitud}
                                onClick={() => openCommentsModal(doc.id_doc_solicitud, "documento", doc.id_solicitud)}
                                className="bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 transition"
                            >
                                Ver Comentarios
                            </button>
                            <button onClick={() => openEditDocModal(doc.id_doc_solicitud)} className="bg-red-500 text-white py-2 px-4 rounded-xl shadow hover:bg-red-600 transition">
                                Eliminar
                            </button>
                            <button
                                onClick={() =>
                                    abrirModalConfirmacion(
                                    doc.id_doc_solicitud, "documento"
                                    )
                                }
                                className="bg-green-500 text-white py-2 rounded-xl shadow hover:bg-green-600 transition"
                                >
                                Actualizar estatus
                            </button>
                        </div>
                    </div>
                    ))}

                    {/* Card de Alta adicional incluso si ya hay documentos */}
                    <div className="bg-yellow-50 shadow-xl rounded-xl p-6 border border-yellow-200 text-yellow-800 hover:shadow-2xl transition duration-300">
                        <div className="text-5xl text-center mb-4">➕</div>
                        <h2 className="text-xl font-bold text-center mb-2">Agregar otro documento</h2>
                        <p className="text-center">Puedes subir dictámenes, anexos técnicos, cotizaciones u otros archivos.</p>
                        <div className="mt-4 text-center">
                            <button
                            onClick={() => setModalDocOpen(true)}
                            className="bg-green-500 text-white py-2 px-4 rounded-xl shadow hover:bg-green-600 transition"
                            >
                            Dar de alta
                            </button>
                        </div>
                    </div>
                </>
                ) : (
                <div className="bg-yellow-100 shadow-xl rounded-xl p-6 border border-yellow-300 text-yellow-800">
                    <div className="text-5xl text-center mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-center mb-2">Documentos adicionales</h2>
                    <p className="text-center">No hay documentos adicionales registrados para esta solicitud.</p>
                    <div className="mt-4 text-center">
                    <button
                        onClick={() => setModalDocOpen(true)}
                        className="bg-green-500 text-white py-2 px-4 rounded-xl shadow hover:bg-green-600 transition"
                    >
                        Dar de alta
                    </button>
                    </div>
                </div>
            )}


            {isJustificacionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">

                    <ModalJustificacion
                        idSolicitud={solicitud.id_solicitud}
                        onClose={() => setJustificacionModalOpen(false)}
                        onSubmit={() => {
                            setJustificacionModalOpen(false);
                            onSolicitudAdded(); // ✅ ya estás recargando los datos
                        }}
                    />

                    </div>
                </div>
            )}
            
            {isSuficienciaModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
                    <ModalSuficiencia
                        idSolicitud={solicitud.id_solicitud}
                        onClose={() => setSuficienciaModalOpen(false)}
                        onSubmit={() => {
                            setSuficienciaModalOpen(false);
                            onSolicitudAdded();
                        }}
                    />

                    </div>
                </div>
            )}

            {isModalDocOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
                    <ModalDocumentoAdicional
                        idSolicitud={solicitud.id_solicitud}
                        onClose={() => setModalDocOpen(false)}
                        onUploadSuccess={() => {
                            setModalDocOpen(false);
                            onSolicitudAdded(); // para recargar los datos actualizados
                        }}
                    />

                    </div>
                </div>
            )}

            {isEditModalOpen && solicitudAEditar !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                    <ModificarSolicitud idSolicitud={solicitudAEditar} onClose={closeEditModal} onSolicitudUpdated={onSolicitudAdded} />
                    </div>
                </div>
            )}

            {isEditPreModalOpen && preAEditar !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ModalPreSuEditar idSolicitud={preAEditar} onClose={closeEditPreModal} onUpdate={onSolicitudAdded} />
                    </div>
                </div>
            )}

            {isEditJustModalOpen && justificacionAEditar !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ModalJustificacionEditar idJustificacion={justificacionAEditar} onClose={closeEditJustModal} onSubmit={onSolicitudAdded} />
                    </div>
                </div>
            )}

            {isEditDocModalOpen && docAEditar !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ModalDocumentoAdicionalEliminar idDoc={docAEditar} onClose={closeEditDocModal} onDeleted={onSolicitudAdded} />
                    </div>
                </div>
            )}

            {isCommentsModalOpen && idOrigenComentario !== null && id_sol !== null && (
                <ModalComentarios
                    idSol={id_sol}
                    idOrigen={idOrigenComentario}
                    tipoOrigen={tipoOrigenComentario}
                    onClose={closeCommentsModal}
                />
            )}

            {isConfirmModalOpen && estatusDoc !== null && tipoOrigenModal !== null && (
                <ModalConfirmacion
                    idDoc={estatusDoc}
                    tipoOrigen={tipoOrigenModal}
                    onClose={cerrarModalConfirmacion}
                    onUpdateSuccess={onSolicitudAdded}
                />
            )}


        </div>
    );
};

export default TablaSolicitudes;
