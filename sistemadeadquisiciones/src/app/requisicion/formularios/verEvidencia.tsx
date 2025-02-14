import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFile, faTimes } from "@fortawesome/free-solid-svg-icons";

interface ModalDocumentosProps {
  idFolio: number | null;
  onClose: () => void;
}

const VerEvidencia: React.FC<ModalDocumentosProps> = ({ idFolio, onClose }) => {
  const comentarios = [
    { comentario: "Comentario", usuario: "Noemí", hora: "11:27 am" },
    { comentario: "Comentario", usuario: "Comité", hora: "03:00 pm" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg border-2 border-purple-400 relative">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition text-2xl"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Título con idFolio */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Oficio {idFolio ? `#${idFolio}` : ""}
        </h2>

        {/* Ícono de documento */}
        <div className="flex justify-center">
          <FontAwesomeIcon icon={faFile} className="text-gray-700 text-6xl" />
        </div>

        {/* Botón Visualizar */}
        <div className="flex justify-center my-4">
          <button className="bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow">
            Visualizar
            <FontAwesomeIcon icon={faEye} className="text-yellow-500" />
          </button>
        </div>

        {/* Estado */}
        <div className="flex justify-center my-2">
          <span className="bg-gray-100 border px-4 py-1 rounded-lg text-gray-700">
            Estado: <span className="font-bold">PENDIENTE</span>
          </span>
        </div>

        {/* Tabla de Comentarios */}
        <div className="mt-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="p-2">Comentario</th>
                <th className="p-2">Usuario</th>
                <th className="p-2">Hora</th>
              </tr>
            </thead>
            <tbody>
              {comentarios.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 text-center">{item.comentario}</td>
                  <td className="p-2 text-center">{item.usuario}</td>
                  <td className="p-2 text-center">{item.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botón de cierre */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerEvidencia;
