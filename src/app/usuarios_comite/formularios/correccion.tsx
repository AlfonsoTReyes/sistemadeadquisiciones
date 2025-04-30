"use client";
import React, { useState } from "react";

const ModalSolicitarCorreccion = ({
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
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviarCorreccion = async () => {
    if (!comentario.trim()) {
      alert("Por favor, escribe un comentario para solicitar la corrección.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/actas_sesion", {
        method: "PUT", // ← aquí el cambio
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: idUsuario,
          id_acta: idActa,
          comentario,
        }),
      });

      alert("✏️ Corrección solicitada con éxito.");
      setComentario("");
      onSuccess(); // actualiza estado o cierra modal en el padre
    } catch (error) {
      console.error("❌ Error al enviar la corrección:", error);
      alert("❌ No se pudo solicitar la corrección.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Solicitar corrección</h2>
        <textarea
          className="border w-full p-2 rounded resize-none"
          rows={4}
          placeholder="Explica por qué se requiere la corrección..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={enviarCorreccion}
            disabled={enviando}
            className={`${
              enviando ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
            } text-white px-4 py-2 rounded`}
          >
            {enviando ? "Enviando..." : "Enviar"}
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

export default ModalSolicitarCorreccion;
