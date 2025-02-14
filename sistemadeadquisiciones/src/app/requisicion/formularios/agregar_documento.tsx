import React, { useState } from "react";

interface ModalProps {
  idFolio: number | null;
  onClose: () => void;
}

const ModalDocumentos: React.FC<ModalProps> = ({ idFolio, onClose }) => {
  const [comentario, setComentario] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold mb-4 text-center">
          Registro comentario
        </h2>

        {/* Campo Documento */}
        <div className="mb-4">
          <label className="block font-medium">Documento:</label>
          <span className="ml-2 text-gray-700 font-semibold">
            Oficio Solicitud
          </span>
        </div>

        {/* Campo Comentario */}
        <div className="mb-4">
          <label className="block font-medium">Comentario:</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full p-2 border-2 border-purple-400 rounded-md resize-none"
            rows={4}
          />
        </div>

        {/* Botón Agregar */}
        <div className="flex justify-center">
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            onClick={onClose}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDocumentos;
