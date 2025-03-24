import React, { useState } from "react";

interface ModalProps {
  idFolio: number | null;
  onClose: () => void;
}

const ModalAdjudicar: React.FC<ModalProps> = ({ idFolio, onClose }) => {
  const [fecha, setFecha] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);

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
        <h2 className="text-xl font-bold mb-4 text-center">Adjudicar</h2>

        {/* Sección Convocar comité */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Convocar comité</label>
          <select
            className="w-full border px-3 py-2 rounded-lg bg-white text-gray-700"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          >
            <option value="">Seleccionar fecha</option>
            <option value="2025-02-27">27 de febrero de 2025</option>
            <option value="2025-03-05">5 de marzo de 2025</option>
            <option value="2025-03-10">10 de marzo de 2025</option>
          </select>
        </div>

        {/* Sección Generar Acta */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Generar Acta</label>
          <input
            type="file"
            className="w-full border px-3 py-2 rounded-lg bg-gray-200 text-gray-700"
            onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-1/2 mr-2"
          >
            Subir
          </button>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-1/2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAdjudicar;
