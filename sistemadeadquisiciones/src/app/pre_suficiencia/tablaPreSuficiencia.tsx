"use client";
import { useState } from "react";
import Link from 'next/link';
import { DetallesSolicitud } from "./interfaces";
import ModalJustificacion from "../justificaciones/alta";
import ModalSuficiencia from "../../pre_suficiencia/formularios/alta";



const TablaSolicitudes: React.FC<{ 
  solicitudes: DetallesSolicitud;
  onSolicitudAdded: () => Promise<void>;
}> = ({ solicitudes, onSolicitudAdded }) => {
  const [isJustificacionModalOpen, setJustificacionModalOpen] = useState(false);
  const [isSuficienciaModalOpen, setSuficienciaModalOpen] = useState(false);


  if (!solicitudes?.solicitud) {
    return <p className="text-gray-500">No hay detalles disponibles.</p>;
  }

  const { solicitud, justificacion, techoPresupuestal } = solicitudes;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card de Solicitud */}
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 hover:shadow-2xl transition duration-300">
            <div className="text-5xl text-center mb-4">📄</div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Solicitud</h2>
            <p><strong>Folio:</strong> {solicitud.id_solicitud}</p>
            <p><strong>Solicitante:</strong> {solicitud.nomina_solicitante}</p>
            <p><strong>Secretaría:</strong> {solicitud.secretaria}</p>
            <p><strong>Motivo:</strong> {solicitud.motivo}</p>
            <p><strong>Monto:</strong> ${solicitud.monto}</p>
            <p><strong>Fecha Solicitud:</strong> {solicitud.fecha_solicitud}</p>
            <p className={`font-semibold ${solicitud.estatus === "pendiente" ? "text-yellow-500" : "text-green-600"}`}>
            Estatus: {solicitud.estatus}
            </p>
            <div className="mt-4 flex flex-col gap-2">
                <button className="bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 transition">Ver Comentarios</button>
            </div>
        </div>

        {/* Card de Justificación */}
        {justificacion ? (
            <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-200 hover:shadow-2xl transition duration-300">
                <div className="text-5xl text-center mb-4">📜</div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Justificación</h2>
                <p><strong>Asunto:</strong> {justificacion.asunto}</p>
                <p><strong>Lugar:</strong> {justificacion.lugar}</p>
                <p><strong>Planteamiento:</strong> {justificacion.planteamiento}</p>
                <p><strong>Fundamento Legal:</strong> {justificacion.fundamento_legal}</p>
                <p><strong>Uso:</strong> {justificacion.uso}</p>
                <p><strong>Fecha:</strong> {justificacion.fecha_hora}</p>
                <div className="mt-4 flex flex-col gap-2">
                    <button className="bg-blue-500 text-white py-2 rounded-xl shadow hover:bg-blue-600 transition">Generar PDF</button>
                    <button className="bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 transition">Ver Comentarios</button>
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
                    className="bg-blue-500 text-white py-2 px-4 rounded-xl shadow hover:bg-blue-600 transition"
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
                <h2 className="text-xl font-bold text-center text-gray-800 mb-4">Techo Presupuestal</h2>
                <p><strong>Monto Aprobado:</strong> ${techoPresupuestal.monto_aprobado}</p>
                <p><strong>No. Folio:</strong> {techoPresupuestal.no_folio}</p>
                <p><strong>Comentario:</strong> {techoPresupuestal.comentario}</p>
                <p><strong>Firma Finanzas:</strong> {techoPresupuestal.firma_digital_finanzas}</p>
                <p><strong>Fecha Aprobación:</strong> {techoPresupuestal.fecha_aprobacion}</p>
                <div className="mt-4 flex flex-col gap-2">
                    <button className="bg-blue-500 text-white py-2 rounded-xl shadow hover:bg-blue-600 transition">Generar PDF</button>
                    <button className="bg-purple-500 text-white py-2 rounded-xl shadow hover:bg-purple-600 transition">Ver Comentarios</button>
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
                    className="bg-blue-500 text-white py-2 px-4 rounded-xl shadow hover:bg-blue-600 transition"
                >
                    Generar Justificación
                </button>
                </div>
            </div>
        )}

        {isJustificacionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <ModalJustificacion
                onClose={() => setJustificacionModalOpen(false)}
                onSubmit={(data) => {
                setJustificacionModalOpen(false);
                onSolicitudAdded(); // recargar o actualizar vista si es necesario
                }}
            />
            </div>
        </div>
        )}
        
        {isSuficienciaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
            <ModalSuficiencia
                idSolicitud={solicitud.id_solicitud} // ✅ pasa el ID
                onClose={() => setSuficienciaModalOpen(false)}
                onSubmit={(data) => {
                    setSuficienciaModalOpen(false);
                    onSolicitudAdded();
                }}
            />

            </div>
        </div>
        )}


    </div>
  );
};

export default TablaSolicitudes;
