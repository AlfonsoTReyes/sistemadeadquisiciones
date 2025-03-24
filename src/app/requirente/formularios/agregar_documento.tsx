import React from "react";

interface ModalProps {
    idFolio: number | null;
    onClose: () => void;
}

const ModalDocumentos: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        {/* Contenido con scroll */}
        <div className="max-h-[80vh] overflow-y-auto p-2">
          {/* Título */}
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Subir Documentos
          </h2>

          {/* Formulario */}
          <form className="space-y-6">
            {/* Campo de folio */}
            <div className="mb-6">
              <label className="block font-medium mb-2">
                Folio:
              </label>
              <input
                readOnly
                type="text"
                className="w-full p-3 border rounded"
                value="12345"
              />
            </div>

            {/* Sección de archivos */}
            <div className="border p-4 rounded-lg mb-6">
              <h3 className="font-bold mb-4 text-lg">
                Evidencia Documento
              </h3>

              {/* Input de archivo */}
              <div className="mb-4">
                <label className="block mb-2 font-medium">
                  Subir archivo PDF:
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full border rounded p-3"
                />
              </div>
            </div>

            {/* Botón para agregar más refacciones */}
            <button
              type="button"
              className="bg-gray-700 text-white px-4 py-2 rounded w-full"
            >
              + Agregar otra evidencia
            </button>

            {/* Botón de subir */}
            <button
              type="submit"
              className="w-full py-3 text-white rounded text-lg font-medium bg-blue-600 hover:bg-blue-700"
            >
              Subir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalDocumentos;
