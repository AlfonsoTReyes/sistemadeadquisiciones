import React, { useEffect, useState } from "react";
//import { X, FileText } from "lucide-react"; // Agregamos el icono de PDF
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faX, faFile } from "@fortawesome/free-solid-svg-icons";

interface ModalDocumentosProps {
  idFolio: number | null;
  onClose: () => void;
}

const VerEvidencia: React.FC<ModalDocumentosProps> = ({ idFolio, onClose }) => {
  const [documentos, setDocumentos] = useState<{ url: string; descripcion: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idFolio) return;

    const fetchDocumentos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/facturas?orden_id=${idFolio}`);
        if (!response.ok) throw new Error("Error al obtener documentos");
        const data = await response.json();
        setDocumentos(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentos();
  }, [idFolio]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl relative">
        {/* Botón de cierre */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition">
          
          <FontAwesomeIcon icon={faX}/>
        </button>

        {/* Título */}
        <h2 className="text-2xl font-semibold text-center text-gray-800">Documentos de la Solicitud #{idFolio}</h2>

        {/* Contenedor con scroll si hay muchos documentos */}
        <div className="mt-4 max-h-[350px] overflow-y-auto space-y-3">
          {loading && <p className="text-center text-gray-500">Cargando documentos...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {documentos.length > 0 ? (
            <ul className="space-y-4">
              {documentos.map((doc, index) => (
                <li
                  key={index}
                  className="flex items-center p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-100 hover:bg-gray-200 transition"
                >
                  {/* Icono PDF */}
                  <FontAwesomeIcon icon={faFile} />

                  {/* Información del documento */}
                  <div className="flex-1">
                    <p className="text-gray-700 font-semibold">Descripción:</p>
                    <p className="text-gray-600">{doc.descripcion}</p>
                  </div>

                  {/* Botón para ver PDF */}
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                  >
                    Ver PDF
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            !loading && <p className="text-center text-gray-500">No hay documentos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerEvidencia;
