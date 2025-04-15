import React, { useEffect, useState } from "react";
import { DetallesSolicitud } from "../solicitantes/detalle_solicitudes/interfaces";
import { fetchSolicitudesDetalles } from "../peticiones_api/peticionSolicitudesDetalle";

interface ModalResumenProps {
  idSolicitud: number;
  onClose: () => void;
}

const ModalResumenSolicitud: React.FC<ModalResumenProps> = ({ idSolicitud, onClose }) => {
  const [detalles, setDetalles] = useState<DetallesSolicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSolicitudesDetalles(idSolicitud.toString());
        setDetalles(data);
      } catch (err) {
        setError("No se pudo cargar la información de la solicitud.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idSolicitud]);

  if (loading) return null;
  if (error || !detalles) return null;

  const { solicitud, justificacion, techoPresupuestal } = detalles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Resumen de la Solicitud</h2>

        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">📄 Solicitud</h3>
          <p><strong>Folio:</strong> {solicitud?.id_solicitud}</p>
          <p><strong>Solicitante:</strong> {solicitud?.nomina_solicitante}</p>
          <p><strong>Motivo:</strong> {solicitud?.motivo}</p>
          <p><strong>Monto:</strong> ${solicitud?.monto}</p>
          <p><strong>Fecha:</strong> {new Date(solicitud?.fecha_solicitud ?? '').toLocaleString()}</p>
          <p><strong>Estatus:</strong> {solicitud?.estatus}</p>
        </div>

        {justificacion && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">📜 Justificación</h3>
            <p><strong>Asunto:</strong> {justificacion.asunto}</p>
            <p><strong>Dirigido a:</strong> {justificacion.nombre_dirigido}</p>
            <p><strong>Fecha:</strong> {new Date(justificacion.fecha_hora).toLocaleString()}</p>
            <p><strong>Estatus:</strong> {justificacion.estatus}</p>
          </div>
        )}

        {techoPresupuestal && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">💰 Pre-suficiencia</h3>
            <p><strong>Folio:</strong> {techoPresupuestal.oficio}</p>
            <p><strong>Fecha de creación:</strong> {new Date(techoPresupuestal.created_at).toLocaleString()}</p>
            <p><strong>Estatus:</strong> {techoPresupuestal.estatus}</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalResumenSolicitud;
