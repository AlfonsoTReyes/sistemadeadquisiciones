"use client";
import { useState, useEffect } from "react";
import ModificarSolicitud from "./formularios/modificar";
import Link from 'next/link';
import ModalConfirmacion from "../detalle_solicitudes/formularios/modificarEstatus";
import ModalFirmaEnvio from "./formularios/firmar";
import ModalAdjudicar from "./formularios/adjudicar";


interface Solicitud {
    id_solicitud: number;
    nomina_solicitante: string;
    secretaria: string;
    motivo: string;
    fecha_solicitud: string;
    estatus: string;
    id_adjudicacion: number;
    folio: string;
    fecha_aprobacion: string | null;
    id_usuario: number;
    monto: number;
    tipo_adquisicion: string;
    dependencia: string;
}

const TablaSolicitudes: React.FC<{ 
    solicitudes: Solicitud[];
    onSolicitudAdded: () => Promise<void>;
}> = ({ solicitudes, onSolicitudAdded }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [solicitudAEditar, setSolicitudAEditar] = useState<number | null>(null);
    const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
    const [solicitudAAprobar, setSolicitudAAprobar] = useState<number | null>(null);
    const [tipoOrigenModal, setTipoOrigenModal] = useState<string>("");
    const [isFirmaModalOpen, setIsFirmaModalOpen] = useState(false);
    const [solicitudAFirmar, setSolicitudAFirmar] = useState<number | null>(null);
    const [isAdjudicarModalOpen, setIsAdjudicarModalOpen] = useState(false);
    const [solicitudAdjudicar, setSolicitudAdjudicar] = useState<number | null>(null);
    const [filtroSecretaria, setFiltroSecretaria] = useState("todos");
    const [filtroEstatus, setFiltroEstatus] = useState("todos");
    const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
    const [filtroFechaFin, setFiltroFechaFin] = useState("");
    const [permisos, setPermisos] = useState<string[]>([]);

    const secretariasUnicas = Array.from(new Set(solicitudes.map(s => s.secretaria)));
    const estatusUnicos = Array.from(new Set(solicitudes.map(s => s.estatus.toLowerCase())));
  
    const solicitudesFiltradas = solicitudes.filter(solicitud => {
      const coincideSecretaria = filtroSecretaria === "todos" || solicitud.secretaria === filtroSecretaria;
      const coincideEstatus = filtroEstatus === "todos" || solicitud.estatus.toLowerCase() === filtroEstatus;
  
      const fechaComparar = solicitud.estatus.toLowerCase() === "cancelada" || solicitud.estatus.toLowerCase() === "terminada"
        ? solicitud.fecha_aprobacion
        : solicitud.fecha_solicitud;
  
      const dentroDeRango =
        (!filtroFechaInicio || new Date(fechaComparar!) >= new Date(filtroFechaInicio)) &&
        (!filtroFechaFin || new Date(fechaComparar!) <= new Date(filtroFechaFin));
  
      return coincideSecretaria && coincideEstatus && dentroDeRango;
    });

    useEffect(() => {
        const storedPermisos = sessionStorage.getItem("userPermissions");
        if (storedPermisos) {
          setPermisos(JSON.parse(storedPermisos));
        }
      }, []);

    const openFirmaModal = (id: number) => {
        setSolicitudAFirmar(id);
        setIsFirmaModalOpen(true);
    };
    
    const closeFirmaModal = () => {
        setSolicitudAFirmar(null);
        setIsFirmaModalOpen(false);
    };

    const openAdjudicarModal = (id: number) => {
        setSolicitudAdjudicar(id);
        setIsAdjudicarModalOpen(true);
    };
    
    const closeAdjudicarModal = () => {
        setSolicitudAdjudicar(null);
        setIsAdjudicarModalOpen(false);
    };
    
    const openEditModal = (id: number) => {
        setSolicitudAEditar(id);
        setIsEditModalOpen(true);
    };

    const handleDetalleClick = (idSolicitud: number) => {
        sessionStorage.setItem("solicitudId", idSolicitud.toString());
    };
    

    const closeEditModal = () => {
        setSolicitudAEditar(null);
        setIsEditModalOpen(false);
        onSolicitudAdded(); // recargar solicitudes después de la edición
    };

    const openAprobarModal = (idDoc: number, tipoOrigen: string) => {
        setSolicitudAAprobar(idDoc);
        setTipoOrigenModal(tipoOrigen);
        setIsAprobarModalOpen(true);
    };

    const closeAprobarModal = () => {
        setSolicitudAAprobar(null);
        setIsAprobarModalOpen(false);
        setTipoOrigenModal("");
    };
    

    return (
      <div>
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={filtroSecretaria} onChange={e => setFiltroSecretaria(e.target.value)} className="p-2 border rounded">
            <option value="todos">Todas las secretarías</option>
            {secretariasUnicas.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>

          <select value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value)} className="p-2 border rounded">
            <option value="todos">Todos los estatus</option>
            {estatusUnicos.map(est => (
              <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>
            ))}
          </select>

          <input type="date" value={filtroFechaInicio} onChange={e => setFiltroFechaInicio(e.target.value)} className="p-2 border rounded" />
          <input type="date" value={filtroFechaFin} onChange={e => setFiltroFechaFin(e.target.value)} className="p-2 border rounded" />
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full border mt-4 table-auto">
                <thead className="bg-yellow-600 text-white">
                    <tr>
                        <th className="border px-4 py-2">Folio</th>
                        <th className="border px-4 py-2">Solicitante</th>
                        <th className="border px-4 py-2">Secretaría</th>
                        <th className="border px-4 py-2">Motivo</th>
                        <th className="border px-4 py-2">Fecha Solicitud</th>
                        <th className="border px-4 py-2">Monto</th>
                        <th className="border px-4 py-2">Estatus</th>
                        <th className="border px-4 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudesFiltradas.map((solicitud) => (
                        <tr key={solicitud.id_solicitud}>
                            <td className="border px-4 py-2">{solicitud.folio}</td>
                            <td className="border px-4 py-2">{solicitud.nomina_solicitante}</td>
                            <td className="border px-4 py-2">{solicitud.secretaria}</td>
                            <td className="border px-4 py-2">{solicitud.motivo}</td>
                            <td className="border px-4 py-2">
                                {new Date(solicitud.fecha_solicitud).toLocaleString("es-MX", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false, // Usa formato 24 horas
                                })}
                            </td>
                            <td className="border px-4 py-2">${solicitud.monto.toLocaleString()}</td>
                            <td className="border px-4 py-2">{solicitud.estatus}</td>
                            <td className="border px-4 py-2">
                            {!["en revisión", "aprobada"].includes(solicitud.estatus.toLowerCase()) && (
                                    <>
                                {permisos.includes('firmar_enviar_solicitud') && (
                                    <button
                                        onClick={() => openFirmaModal(solicitud.id_solicitud)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Firmar y enviar
                                    </button>
                                )}
                                </>
                            )}
                                {!["en revisión", "aprobada"].includes(solicitud.estatus.toLowerCase()) && (
                                    <>
                                        <br />
                                        {permisos.includes('editar_solicitud_adquisicion_secretaria') && (
                                        <button
                                            onClick={() => openEditModal(solicitud.id_solicitud)}
                                            className="text-yellow-600 hover:underline"
                                        >
                                            Editar
                                        </button>
                                        )}
                                        <br />
                                    </>
                                )}
                                {permisos.includes('cambiar_estatus_solicitud_adquisicion') && (
                                    <button
                                    onClick={() =>
                                        openAprobarModal(
                                        solicitud.id_solicitud, "suficiencia"
                                        )
                                    }
                                    className="text-red-700"
                                    >
                                        Cambiar estatus
                                    </button>
                                )}
                                <br></br>
                                {permisos.includes('ver_detalles_solicitud_adquisicion_secretaria') && (
                                    <Link
                                        className="text-blue-800 hover:underline"
                                        href="./detalle_solicitudes"
                                        onClick={() => handleDetalleClick(solicitud.id_solicitud)}
                                        >
                                        Detalle de solicitudes
                                    </Link>
                                )}
                                <br></br>
                                {["en revisión", "aprobada"].includes(solicitud.estatus.toLowerCase()) && (
                                  <>
                                    {permisos.includes('adjudicar_comite_solicitud_adq') && (

                                        <Link
                                            className="text-pink-500 hover:underline"
                                            href="../../orden_dia"
                                            onClick={() => handleDetalleClick(solicitud.id_solicitud)}

                                        <button
                                            onClick={() =>
                                                openAdjudicarModal(
                                                solicitud.id_solicitud
                                                )
                                            }
                                            className="text-purple-800 hover:underline"

                                            >
                                                Ordenes de día
                                        </Link>
                                    )}
                                    <br></br>
                                    {permisos.includes('ver_detalles_comite_solicitud_adq') && (
                                        <Link
                                            className="text-dark-500 hover:underline"
                                            href="./detalle_solicitudes"
                                            onClick={() => handleDetalleClick(solicitud.id_solicitud)}
                                            >
                                                Detalle de cómite
                                        </Link>
                                    )}
                                  </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isEditModalOpen && solicitudAEditar !== null && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <ModificarSolicitud idSolicitud={solicitudAEditar} onClose={closeEditModal} onSolicitudUpdated={onSolicitudAdded} />
                  </div>
                </div>
            )}
            {isAprobarModalOpen && solicitudAAprobar !== null && tipoOrigenModal !== null && (
                <ModalConfirmacion
                    idDoc={solicitudAAprobar}
                    tipoOrigen={tipoOrigenModal}
                    onClose={closeAprobarModal}
                    onUpdateSuccess={onSolicitudAdded}
                />
            )}
            {isFirmaModalOpen && solicitudAFirmar !== null && (
                <ModalFirmaEnvio
                    idSolicitud={solicitudAFirmar}
                    onClose={closeFirmaModal}
                    onSuccess={onSolicitudAdded}
                />
            )}

            {isAdjudicarModalOpen && solicitudAdjudicar !== null && (
                    <ModalAdjudicar
                    idSolicitud={solicitudAdjudicar}
                    onClose={closeAdjudicarModal}
                    onSuccess={onSolicitudAdded}
                />
            )}


        </div>
      </div>
    );
};

export default TablaSolicitudes;
