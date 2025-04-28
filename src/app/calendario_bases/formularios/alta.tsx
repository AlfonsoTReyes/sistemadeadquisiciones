"use client";
import { useState } from "react";
import { crearEvento } from "../../peticiones_api/peticionCalendarioEventos";

const AltaEvento = ({ idConcurso, onClose }: { idConcurso: number; onClose: () => void }) => {
  const [form, setForm] = useState({
    acto: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion_adicional: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await crearEvento(idConcurso, form);
      onClose();
    } catch (error) {
      console.error("Error al crear evento:", error);
      alert("❌ Ocurrió un error al crear el evento. Intenta de nuevo.");
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
        {/* Botón cerrar arriba */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl">
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Nuevo Evento</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Acto */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Acto:</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={form.acto}
              onChange={(e) => setForm({ ...form, acto: e.target.value })}
            />
          </div>

          {/* Campo Fecha Inicio */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Fecha de Inicio:</label>
            <input
              type="date"
              required
              className="w-full border rounded p-2"
              value={form.fecha_inicio}
              onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            />
          </div>

          {/* Campo Fecha Fin */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Fecha de Fin (opcional):</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={form.fecha_fin}
              onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            />
          </div>

          {/* Campo Hora Inicio */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Hora de Inicio (opcional):</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={form.hora_inicio}
              onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
            />
          </div>

          {/* Campo Hora Fin */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Hora de Fin (opcional):</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={form.hora_fin}
              onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
            />
          </div>

          {/* Campo Descripción */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Descripción Adicional (opcional):</label>
            <textarea
              className="w-full border rounded p-2"
              value={form.descripcion_adicional}
              onChange={(e) => setForm({ ...form, descripcion_adicional: e.target.value })}
            />
          </div>

          {/* Botones Guardar y Cerrar */}
          <div className="flex justify-between mt-6">
            <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AltaEvento;
