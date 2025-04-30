"use client";
import { useState, useEffect } from "react";
import { getEventoById, modificarEvento } from "../../peticiones_api/peticionCalendarioEventos";

const ModificarEvento = ({ idEvento, onClose }: { idEvento: number; onClose: () => void }) => {
  const [form, setForm] = useState({
    acto: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    descripcion_adicional: "",
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 🛠️ Cargar el evento al abrir el modal
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const data = await getEventoById(idEvento);
        setForm({
          acto: data.acto || "",
          fecha_inicio: data.fecha_inicio ? data.fecha_inicio.split("T")[0] : "",
          fecha_fin: data.fecha_fin ? data.fecha_fin.split("T")[0] : "",
          hora_inicio: data.hora_inicio || "",
          hora_fin: data.hora_fin || "",
          descripcion_adicional: data.descripcion_adicional || "",
        });
        setLoading(false);
      } catch (error: any) {
        console.error("Error al cargar evento:", error);
        setErrorMessage(error.message || "Error al cargar evento");
        setLoading(false);
      }
    };

    fetchEvento();
  }, [idEvento]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
        await modificarEvento(idEvento, form);
        onClose();
    } catch (error: any) {
      console.error("Error al modificar evento:", error);
      alert("❌ Ocurrió un error al modificar el evento. Intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg">
          <p>Cargando datos del evento...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg">
          <p className="text-red-600">{errorMessage}</p>
          <div className="mt-4 text-center">
            <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg relative">
        {/* Botón cerrar arriba */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl">
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Modificar Evento</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos */}
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

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Fecha de Fin (opcional):</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={form.fecha_fin}
              onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Hora de Inicio (opcional):</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={form.hora_inicio}
              onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Hora de Fin (opcional):</label>
            <input
              type="time"
              className="w-full border rounded p-2"
              value={form.hora_fin}
              onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Descripción Adicional (opcional):</label>
            <textarea
              className="w-full border rounded p-2"
              value={form.descripcion_adicional}
              onChange={(e) => setForm({ ...form, descripcion_adicional: e.target.value })}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-between mt-6">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
              Guardar Cambios
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

export default ModificarEvento;
