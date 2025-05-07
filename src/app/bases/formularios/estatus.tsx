"use client";
import React, { useState } from "react";
import { changeStatusBases } from "../../peticiones_api/peticionBases";

interface ModalEstatusConcursoProps {
  idBases: number;
  estatusActual: string;
  onClose: () => void;
  onUpdated: () => void;
}

const opcionesEstatus = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "En proceso", value: "En proceso" },
  { label: "Dictamen emitido", value: "Dictamen emitido" },
  { label: "Fallo publicado", value: "Fallo publicado" },
  { label: "En contrato", value: "En contrato" },
  { label: "Finalizado", value: "Finalizado" },
];

const ModalEstatusConcurso: React.FC<ModalEstatusConcursoProps> = ({
  idBases,
  estatusActual,
  onClose,
  onUpdated,
}) => {
  const [nuevoEstatus, setNuevoEstatus] = useState(estatusActual || "Pendiente");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleActualizar = async () => {
    setCargando(true);
    try {
      await changeStatusBases(idBases, nuevoEstatus);
      setMensaje("✅ Estatus actualizado correctamente.");
      setTimeout(() => {
        setMensaje("");
        onUpdated();
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error al actualizar el estatus:", error);
      setMensaje("❌ Error al actualizar el estatus.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6 border border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Actualizar Estatus del Concurso</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Concurso ID: <strong>{idBases}</strong></p>

        <label className="block mb-2 font-medium text-gray-700">Nuevo Estatus</label>
        <select
          value={nuevoEstatus}
          onChange={(e) => setNuevoEstatus(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-blue-500 focus:border-blue-500"
        >
          {opcionesEstatus.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {mensaje && (
          <div className="text-center text-sm py-2 px-3 rounded bg-gray-100 border mb-4">
            {mensaje}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleActualizar}
            disabled={cargando}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {cargando ? "Actualizando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEstatusConcurso;
