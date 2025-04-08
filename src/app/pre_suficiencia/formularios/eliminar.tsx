// components/modales/ModalEliminarDocumento.tsx
import React from "react";

interface Props {
  nombreDocumento: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ModalEliminarDocumento: React.FC<Props> = ({ nombreDocumento, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <h2 className="text-lg font-semibold mb-4">¿Deseas eliminar este documento?</h2>
        <p className="mb-4 text-gray-700">{nombreDocumento}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarDocumento;
