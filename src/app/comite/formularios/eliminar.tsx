"use client";
import { useState } from "react";
import { eliminarEvento } from "@/app/peticiones_api/peticionEventos";

interface Props {
  id_evento: number;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

const ModalEliminarEvento: React.FC<Props> = ({ id_evento, onClose, onDeleteSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await eliminarEvento(id_evento);
      if (result?.success) {
        onDeleteSuccess(); 
        onClose();         
      } else {
        alert("No se pudo eliminar el evento.");
      }
    } catch (error) {
      console.error("error al eliminar evento:", error);
      alert("Ocurrió un error al eliminar el evento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">¿Eliminar evento?</h2>
        <p className="mb-6 text-center text-gray-700">Esta acción no se puede deshacer.</p>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Cargando...</p>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarEvento;
