// 📂 /components/modalConfirmacion.tsx
"use client";
import React, { useState } from "react";
import { updateSolicitudEstatus } from "../../peticiones_api/peticionSolicitudesDetalle";


interface ModalConfirmacionProps {
  onClose: () => void;
  idDoc: number;
  tipoOrigen: string;
  onUpdateSuccess: () => void; // Para recargar después de actualizar
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  onClose, idDoc, tipoOrigen, onUpdateSuccess,}) => {
    // Estado para manejar el nuevo estatus seleccionado
    const [nuevoEstatus, setNuevoEstatus] = useState<string>("pendiente");
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
  

  // 🔥 Función para actualizar el estatus
  const actualizarEstatus = async () => {
    setIsUpdating(true);

    const estatusData = {
        idDoc,
        tipoOrigen,
        nuevoEstatus,
      };

      console.log(nuevoEstatus);
    try {
        await updateSolicitudEstatus(estatusData);
      
        setSuccessMessage("Actualización del estatus correcta");
        onUpdateSuccess();
        setTimeout(() => {
            onClose();
        }, 1000);
    } catch (error) {
      console.error("Error al actualizar estatus:", error);
      alert("❌ Ocurrió un error al actualizar el estatus.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmación</h2>
        <p className="text-gray-600 mb-6">¿Estás seguro de actualizar el estatus?</p>

        {successMessage && (
          <div className="mb-4 p-3 text-green-800 bg-green-100 border border-green-300 rounded-lg">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-green-800 bg-green-100 border border-green-300 rounded-lg">
            {error}
          </div>
        )}


        {/* Selector de estatus */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Selecciona el nuevo estatus:
          </label>
          <select
            value={nuevoEstatus}
            onChange={(e) => setNuevoEstatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="Rechazada">Rechazada</option>
            <option value="Cancelada">Cancelada</option>

          </select>
        </div>

        {/* Botones de Confirmar/Cancelar */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white py-2 px-4 rounded-xl hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={actualizarEstatus}
            className={`bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition ${
              isUpdating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isUpdating}
          >
            {isUpdating ? "Actualizando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
