"use client";
import React, { useState } from "react";

const ModalConfirmarFirma = ({
  idUsuario,
  idActa,
  onSuccess,
  onCancel,
}: {
  idUsuario: number;
  idActa: number;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [enviando, setEnviando] = useState(false);

  const firmar = async () => {
    if (!idUsuario || !idActa) return;
  
    setEnviando(true);
    try {
      const res = await fetch("/api/actas_sesion", {
        method: "PUT", // CAMBIA A PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: idUsuario, id_acta: idActa }),
      });
  
      if (!res.ok) throw new Error("Error al firmar el acta");
  
      alert("✅ Firma registrada correctamente.");
      onSuccess(); // se notifica al componente padre
    } catch (error) {
      console.error("❌ Error al firmar:", error);
      alert("❌ No se pudo registrar la firma.");
    } finally {
      setEnviando(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-lg font-bold mb-4">¿Deseas firmar esta acta?</h2>
        <p className="text-sm text-gray-700 mb-6">
          Una vez firmada, ya no podrás solicitar correcciones.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={firmar}
            disabled={enviando}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {enviando ? "Firmando..." : "Confirmar Firma"}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarFirma;
