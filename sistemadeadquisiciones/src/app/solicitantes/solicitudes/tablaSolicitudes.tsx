"use client";
import { useState, useEffect } from "react";
import ModificarSolicitud from "./formularios/modificar"; // formulario para editar solicitudes
import AprobarSolicitud from "./formularios/aprobar"; // formulario para aprobar solicitudes

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
    id_sesion_comite: number | null;
}

const TablaSolicitudes: React.FC<{ 
    solicitudes: Solicitud[];
    onSolicitudAdded: () => Promise<void>;
}> = ({ solicitudes, onSolicitudAdded }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
    const [solicitudAEditar, setSolicitudAEditar] = useState<number | null>(null);
    const [solicitudAAprobar, setSolicitudAAprobar] = useState<number | null>(null);

    const openEditModal = (id: number) => {
        setSolicitudAEditar(id);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setSolicitudAEditar(null);
        setIsEditModalOpen(false);
        onSolicitudAdded(); // recargar solicitudes después de la edición
    };

    const openAprobarModal = (id: number) => {
        setSolicitudAAprobar(id);
        setIsAprobarModalOpen(true);
    };

    const closeAprobarModal = () => {
        setSolicitudAAprobar(null);
        setIsAprobarModalOpen(false);
        onSolicitudAdded(); // recargar solicitudes después de la aprobación
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border mt-4 table-auto">
                <thead className="bg-gray-800 text-white">
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
                    {solicitudes.map((solicitud) => (
                        <tr key={solicitud.id_solicitud}>
                            <td className="border px-4 py-2">{solicitud.folio}</td>
                            <td className="border px-4 py-2">{solicitud.nomina_solicitante}</td>
                            <td className="border px-4 py-2">{solicitud.secretaria}</td>
                            <td className="border px-4 py-2">{solicitud.motivo}</td>
                            <td className="border px-4 py-2">{solicitud.fecha_solicitud}</td>
                            <td className="border px-4 py-2">${solicitud.monto.toLocaleString()}</td>
                            <td className="border px-4 py-2">{solicitud.estatus}</td>
                            <td className="border px-4 py-2">
                                <button
                                    onClick={() => openEditModal(solicitud.id_solicitud)}
                                    className="text-yellow-800 hover:underline"
                                >
                                    Editar
                                </button>
                                <br />
                                {solicitud.estatus === "pendiente" && (
                                    <button
                                        onClick={() => openAprobarModal(solicitud.id_solicitud)}
                                        className="text-green-800 hover:underline"
                                    >
                                        Aprobar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaSolicitudes;
