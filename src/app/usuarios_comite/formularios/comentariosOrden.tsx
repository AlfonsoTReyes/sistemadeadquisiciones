"use client";

import React, { useEffect, useState } from "react";

interface Comentario {
  id_comentario: number;
  id_origen: number;
  tipo_origen: string;
  comentario: string;
  id_usuario: number;
  nombre_usuario?: string;
  respuesta_a: number | null;
  created_at: string;
}

interface ModalComentarioOrdenProps {
  idOrdenDia: number;
  onClose: () => void;
}

const ModalComentarioOrden: React.FC<ModalComentarioOrdenProps> = ({ idOrdenDia, onClose }) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState<string>("");
  const [respuestaA, setRespuestaA] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const tipoOrigen = "orden_dia"; // fijo para este módulo

  const fetchComentarios = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ordendiaParticipantes?origen=${idOrdenDia}&tipo=${tipoOrigen}`);
      const data = await res.json();
      setComentarios(Array.isArray(data) ? data : []);
      console.log(data);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, [idOrdenDia]);

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      alert("El comentario no puede estar vacío");
      return;
    }

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      alert("No se encontró el usuario. Inicia sesión.");
      return;
    }

    const body = {
      id_origen: idOrdenDia,
      tipo_origen: tipoOrigen,
      comentario: nuevoComentario,
      respuesta_a: respuestaA,
      id_usuario: parseInt(userId),
    };

    try {
      const res = await fetch(`/api/ordendiaParticipantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const nuevo = await res.json();
        setComentarios((prev) => [...prev, nuevo]);
        setNuevoComentario("");
        setRespuestaA(null);
      } else {
        alert("Error al guardar comentario");
      }
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      alert("Error inesperado al comentar.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">
          💬 Observaciones de la orden del día
        </h2>

        {isLoading ? (
          <p className="text-center text-gray-500">Cargando comentarios...</p>
        ) : comentarios.length === 0 ? (
          <p className="text-center text-gray-500">No hay comentarios aún.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
            {comentarios.map((c) => (
              <div
                key={c.id_comentario}
                className={`p-4 rounded-lg ${
                  c.respuesta_a ? "bg-blue-50 border-l-4 border-blue-500" : "bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-center text-sm text-gray-700">
                  <span className="font-semibold">
                    {c.nombre_usuario || `Usuario #${c.id_usuario}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-800">{c.comentario}</p>
                <div className="text-right mt-2">
                  <button
                    onClick={() => setRespuestaA(c.id_comentario)}
                    className="text-blue-500 text-xs hover:underline"
                  >
                    ↪️ Responder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Campo de nuevo comentario */}
        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder={respuestaA ? "Respondiendo a un comentario..." : "Escribe tu comentario..."}
          className="w-full border p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-between items-center">
          {respuestaA && (
            <button
              onClick={() => setRespuestaA(null)}
              className="text-red-500 text-sm hover:text-red-700"
            >
              ❌ Cancelar respuesta
            </button>
          )}
          <button
            onClick={enviarComentario}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            ➡️ Enviar
          </button>
        </div>

        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white py-2 px-6 rounded hover:bg-gray-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalComentarioOrden;
