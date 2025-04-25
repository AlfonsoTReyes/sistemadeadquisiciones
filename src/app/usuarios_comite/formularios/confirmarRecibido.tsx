"use client";

import React, { useState } from "react";

interface Props {
  idOrdenDia: number;
  onClose: () => void;
}

const ModalConfirmarRecibido: React.FC<Props> = ({ idOrdenDia, onClose }) => {
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    setLoading(true);
    try {
      const id_usuario = parseInt(sessionStorage.getItem("userId") || "0"); // o como lo manejes
      await fetch(`/api/ordendiaParticipantes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idOrdenDia, id_usuario }),
      });
      alert("Confirmado exitosamente.");
      onClose();
    } catch (error) {
      console.error("❌ Error al confirmar:", error);
      alert("Error al confirmar recibido.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Confirmar recepción</h2>
        <p>¿Estás seguro de que has recibido y leído la orden del día #{idOrdenDia}?</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">Cancelar</button>
          <button onClick={confirmar} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
            {loading ? "Confirmando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarRecibido;
