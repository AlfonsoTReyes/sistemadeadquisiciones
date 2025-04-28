"use client";
import { eliminarEvento } from "../../peticiones_api/peticionCalendarioEventos";

const ModalEliminarEvento = ({
  idEvento,
  onClose,
  onDeleted,
}: {
  idEvento: number;
  onClose: () => void;
  onDeleted: () => void;
}) => {

  const handleDelete = async () => {
    try {
      await eliminarEvento(idEvento);
      onDeleted(); // 🔥 Llama a reload cuando sí se eliminó
    } catch (error) {
      console.error("Error eliminando evento:", error);
      alert("❌ Error al eliminar evento.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md text-center relative">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Confirmar Eliminación</h2>
        <p className="text-gray-700 mb-6">
          ¿Seguro que deseas eliminar este evento? <br /> Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            Sí, eliminar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded"
          >
            Cancelar
          </button>
        </div>

        {/* Botón cerrar arriba a la derecha */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl">
          ✖
        </button>
      </div>
    </div>
  );
};

export default ModalEliminarEvento;
