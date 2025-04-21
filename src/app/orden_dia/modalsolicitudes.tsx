"use client";
import React, { useEffect, useState } from "react";
import { DetallesSolicitud } from "../solicitantes/detalle_solicitudes/interfaces";
import { fetchSolicitudesDetalles } from "../peticiones_api/peticionSolicitudesDetalle";
import ModalComentarios from "../comentarios_documentos/modal"; 

interface ModalResumenProps {
  idSolicitud: number;
  onClose: () => void;
}

type TipoPDF = "solicitud" | "justificacion" | "presupuesto";

const ModalResumenSolicitud: React.FC<ModalResumenProps> = ({ idSolicitud, onClose }) => {
  const [detalles, setDetalles] = useState<DetallesSolicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentariosModal, setComentariosModal] = useState<{ id: number; tipo: string } | null>(null);

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

  const generarPDF = async (id: number, tipo: TipoPDF) => {
    try {
      if (tipo === "solicitud") {
        const { default: generarPDFSolicitud } = await import("../PDF/solicitud");
        await generarPDFSolicitud(id);
      } else if (tipo === "justificacion") {
        const { default: generarPDFJustificacion } = await import("../PDF/justificacion");
        await generarPDFJustificacion(id);
      } else if (tipo === "presupuesto") {
        const { default: generarPDFPreSuficiencia } = await import("../PDF/solicitudTecho");
        await generarPDFPreSuficiencia(id);
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un error al generar el PDF.");
    }
  };

  if (loading) return null;
  if (error || !detalles) return <p className="text-red-600 text-center p-4">{error}</p>;

  const { solicitud, justificacion, techoPresupuestal, documentos_adicionales } = detalles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">📋 Resumen de la Solicitud</h2>

        {/* Sección Solicitud */}
        {solicitud && (
          <div className="mb-6 border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📄 Solicitud</h3>
            <p><strong>Folio:</strong> {solicitud.id_solicitud}</p>
            <p><strong>Solicitante:</strong> {solicitud.nomina_solicitante}</p>
            <p><strong>Motivo:</strong> {solicitud.motivo}</p>
            <p><strong>Monto:</strong> ${solicitud.monto}</p>
            <p><strong>Fecha:</strong> {new Date(solicitud.fecha_solicitud).toLocaleString()}</p>
            <p><strong>Estatus:</strong> {solicitud.estatus}</p>
            <button
              onClick={() => generarPDF(solicitud.id_solicitud, "solicitud")}
              className="mt-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded"
            >
              Generar PDF
            </button>
            <button
              onClick={() => setComentariosModal({ id: solicitud.id_solicitud, tipo: "suficiencia" })}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
            >
              Ver Comentarios
            </button>
          </div>
        )}


        {/* Sección Justificación */}
        {justificacion && (
          <div className="mb-6 border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📜 Justificación</h3>
            <p><strong>Asunto:</strong> {justificacion.asunto}</p>
            <p><strong>Dirigido a:</strong> {justificacion.nombre_dirigido}</p>
            <p><strong>Fecha:</strong> {new Date(justificacion.fecha_hora).toLocaleString()}</p>
            <p><strong>Estatus:</strong> {justificacion.estatus}</p>
            <button
              onClick={() => generarPDF(justificacion.id_justificacion, "justificacion")}
              className="mt-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded"
            >
              Generar PDF
            </button>
            <button
              onClick={() => setComentariosModal({ id: justificacion.id_justificacion, tipo: "justificacion" })}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
            >
              Ver Comentarios
            </button>
          </div>
        )}

        {/* Sección Presupuesto */}
        {techoPresupuestal && (
          <div className="mb-6 border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Pre-suficiencia</h3>
            <p><strong>Folio:</strong> {techoPresupuestal.oficio}</p>
            <p><strong>Fecha creación:</strong> {new Date(techoPresupuestal.created_at).toLocaleString()}</p>
            <p><strong>Estatus:</strong> {techoPresupuestal.estatus}</p>
            <button
              onClick={() => generarPDF(techoPresupuestal.id_suficiencia, "presupuesto")}
              className="mt-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded"
            >
              Generar PDF
            </button>
            <button
              onClick={() => setComentariosModal({ id: techoPresupuestal.id_suficiencia, tipo: "adquisicion" })}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
            >
              Ver Comentarios
            </button>
          </div>
        )}

        {/* Sección Documentos Adicionales */}
        {documentos_adicionales && documentos_adicionales.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">📁 Documentos Adicionales</h3>
            {documentos_adicionales.map((doc) => (
              <div key={doc.id_doc_solicitud} className="border rounded p-3 mb-2">
                <p><strong>Tipo:</strong> {doc.tipo_documento}</p>
                <p><strong>Nombre:</strong> {doc.nombre_original}</p>
                <p><strong>Fecha:</strong> {new Date(doc.created_at).toLocaleString()}</p>
                <p><strong>Estatus:</strong> {doc.estatus}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <a
                    href={`/${doc.ruta_archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Ver Documento
                  </a>
                  <button
                    onClick={() =>
                      setComentariosModal({
                        id: doc.id_doc_solicitud,
                        tipo: "documento",
                      })
                    }
                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                  >
                    Ver Comentarios
                  </button>
                  {/* Comentarios podrías mostrar desde otro modal */}
                  <span className="text-gray-500 italic">Comentarios disponibles en sección detallada</span>
                </div>
              </div>
            ))}
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
      {comentariosModal && (
        <ModalComentarios
          idSol={idSolicitud}
          idOrigen={comentariosModal.id}
          tipoOrigen={comentariosModal.tipo}
          onClose={() => setComentariosModal(null)}
        />
      )}
    </div>
  );
};

export default ModalResumenSolicitud;
