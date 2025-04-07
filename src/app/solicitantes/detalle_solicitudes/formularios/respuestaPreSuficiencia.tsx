"use client";
import React from "react";

interface Respuesta {
  id_documento_suficiencia: number;
  nombre_original: string;
  ruta_archivo: string;
  nombre_usuario: string;
  tipo: string;
  created_at: string;
  fecha_respuesta: string;
}

const ModalRespuestasTecho = ({
  respuestas,
  onClose,
}: {
  respuestas: Respuesta[];
  onClose: () => void;
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Respuestas del techo presupuestal</h2>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {respuestas.map((r) => (
          <div key={r.id_documento_suficiencia} className="border p-4 rounded-lg shadow bg-gray-50">
            <p><strong>Documento:</strong> {r.nombre_original}</p>
            <p><strong>Subido por:</strong> {r.nombre_usuario}</p>
            <p><strong>Tipo:</strong> {r.tipo}</p>
            <p><strong>Fecha de respuesta:</strong> {new Date(r.fecha_respuesta).toLocaleString()}</p>
            <a
              href={`/${r.ruta_archivo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline block mt-2"
            >
              Ver documento
            </a>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalRespuestasTecho;
