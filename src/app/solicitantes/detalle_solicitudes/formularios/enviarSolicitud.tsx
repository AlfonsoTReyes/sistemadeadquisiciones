"use client";
import React, { useState } from "react";
import { updateSolicitudEstatus } from "../../../peticiones_api/peticionSolicitudesDetalle";

interface ModalEnvioProps {
  onClose: () => void;
  idDoc: number;
  tipoOrigen: string;
  onUpdateSuccess: () => void;
}

const ModalEnvioConfirmacion: React.FC<ModalEnvioProps> = ({
  onClose, idDoc, tipoOrigen, onUpdateSuccess,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const enviarSolicitud = async () => {
    setIsUpdating(true);

    const estatusData = {
      idDoc,
      tipoOrigen,
      nuevoEstatus: "Enviado para atender",
    };

    try {
      await updateSolicitudEstatus(estatusData);
      setSuccessMessage("✅ Enviada la solicitud. Finanzas elaborará su documento correspondiente.");
      onUpdateSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("error al enviar solicitud:", error);
      alert("❌ ocurrió un error al enviar la solicitud.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmación</h2>
        <p className="text-gray-600 mb-6">¿Deseas enviar la solicitud a Finanzas?</p>

        {successMessage && (
          <div className="mb-4 p-3 text-green-800 bg-green-100 border border-green-300 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white py-2 px-4 rounded-xl hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            onClick={enviarSolicitud}
            className={`bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition ${
              isUpdating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isUpdating}
          >
            {isUpdating ? "Enviando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEnvioConfirmacion;
