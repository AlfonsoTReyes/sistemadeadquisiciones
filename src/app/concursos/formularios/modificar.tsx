"use client";
import { useState, useEffect } from "react";
import { getConcursoById, modificarConcurso } from "../../peticiones_api/peticionConcurso";

interface ModificarConcursoProps {
  idConcurso: number;
  onClose: () => void;
  onUpdated: () => void;
}

const ModificarConcurso: React.FC<ModificarConcursoProps> = ({ idConcurso, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    numero_concurso: "",
    nombre_concurso: "",
    tipo_concurso: "",
    estatus_concurso: "Pendiente",
    fecha_creacion: "",
    fecha_fin: "",
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // 🔥 NUEVO: Estado para error

  useEffect(() => {
    const fetchConcurso = async () => {
      try {
        const data = await getConcursoById(idConcurso);
        setForm({
          numero_concurso: data.numero_concurso || "",
          nombre_concurso: data.nombre_concurso || "",
          tipo_concurso: data.tipo_concurso || "",
          estatus_concurso: data.estatus_concurso || "pendiente",
          fecha_creacion: data.fecha_creacion ? data.fecha_creacion.split("T")[0] : "",
          fecha_fin: data.fecha_fin ? data.fecha_fin.split("T")[0] : "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar concurso:", error);
        setLoading(false);
      }
    };

    fetchConcurso();
  }, [idConcurso]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); // 🔥 Reiniciar errores cada vez que se intenta

    try {
      const result = await modificarConcurso(idConcurso, form);
      if (!result) {
        throw new Error("No se pudo actualizar el concurso.");
      }
      onUpdated();  // Refrescar lista
      onClose();    // Cerrar solo si todo salió bien
    } catch (error: any) {
      console.error("Error al modificar concurso:", error);
      setErrorMessage(error.message || "Error desconocido al actualizar."); // 🔥 Mostrar mensaje
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded shadow-lg p-8">
          <p>Cargando datos del concurso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✖
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-bold mb-4 text-center">Modificar Concurso</h2>

          {/* 🔥 Si hay error, mostrarlo */}
          {errorMessage && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          {/* Tus campos */}
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Número de Concurso:</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={form.numero_concurso}
              onChange={(e) => setForm({ ...form, numero_concurso: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Nombre del Concurso:</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={form.nombre_concurso}
              onChange={(e) => setForm({ ...form, nombre_concurso: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Tipo de Concurso:</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={form.tipo_concurso}
              onChange={(e) => setForm({ ...form, tipo_concurso: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Fecha de Creación:</label>
            <input
              type="date"
              required
              className="w-full border rounded p-2"
              value={form.fecha_creacion}
              onChange={(e) => setForm({ ...form, fecha_creacion: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Fecha de Finalización:</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={form.fecha_fin}
              onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold mb-1">Estatus del Concurso:</label>
            <select
              className="w-full border rounded p-2"
              value={form.estatus_concurso}
              onChange={(e) => setForm({ ...form, estatus_concurso: e.target.value })}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En Proceso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          <div className="flex justify-between mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Actualizar
            </button>
            <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModificarConcurso;
