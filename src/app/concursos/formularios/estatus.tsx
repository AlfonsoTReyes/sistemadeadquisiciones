"use client";
import React, { useState } from "react";
import { actualizarEstatusConcurso } from "../../peticiones_api/peticionConcurso"; // Asegúrate que exista este método

interface ModalEstatusConcursoProps {
  idConcurso: number;
  onClose: () => void;
  onUpdated: () => void;
}

const estatusConcurso = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "En proceso", value: "En proceso" },
  { label: "Dictamen emitido", value: "Dictamen emitido" },
  { label: "En fallo", value: "Fallo publicado" },
  { label: "En contrato", value: "En contrato" },
  { label: "Finalizado", value: "Finalizado" },
];

const ModalEstatusConcurso: React.FC<ModalEstatusConcursoProps> = ({
  idConcurso,
  onClose,
  onUpdated,
}) => {
  const [nuevoEstatus, setNuevoEstatus] = useState("pendiente");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleActualizar = async () => {
    setCargando(true);
    try {
        await actualizarEstatusConcurso(idConcurso, { estatus_concurso: nuevoEstatus });
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Actualizar Estatus del Concurso</h2>
            <p className="text-gray-600 mb-4">Selecciona el nuevo estatus para el concurso #{idConcurso}</p>

            <select
            value={nuevoEstatus}
            onChange={(e) => setNuevoEstatus(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded mb-4"
            >
            {estatusConcurso.map((opt) => (
                <option key={opt.value} value={opt.value}>
                {opt.label}
                </option>
            ))}
            </select>

            {mensaje && (
            <div className="mb-4 p-2 text-sm text-center rounded bg-gray-100 text-gray-800 border">
                {mensaje}
            </div>
            )}

            <div className="flex justify-end gap-3">
            <button
                onClick={onClose}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
                Cancelar
            </button>
            <button
                onClick={handleActualizar}
                disabled={cargando}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {cargando ? "Actualizando..." : "Confirmar"}
            </button>
            </div>
        </div>
    </div>
  );
};

export default ModalEstatusConcurso;
