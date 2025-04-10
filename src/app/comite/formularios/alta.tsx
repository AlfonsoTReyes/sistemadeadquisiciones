"use client";
import { useState, useEffect } from "react";
import { crearEvento } from "@/app/peticiones_api/peticionEventos"; // ajusta la ruta si es necesario

interface Props {
  evento: {
    id_evento?: number;
    titulo?: string;
    descripcion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    tipo_evento?: string;
    estatus?: string;
  } | null;
  fechaSeleccionada: string;
  onClose: () => void;
  onSaveSuccess: () => void; // ✅ se usará para recargar desde el padre tras éxito
  onDelete?: (id_evento: number) => void;
}

const coloresPorTipo: Record<string, string> = {
  ordinario: "#2B6CB0",         
  extraordinario: "#C53030",    
  revisión: "#38A169",          
  vacaciones: "#D69E2E",        
  cierre: "#805AD5",            
};

const ModalEventoComite: React.FC<Props> = ({
  evento,
  fechaSeleccionada,
  onClose,
  onSaveSuccess,
  onDelete,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState(fechaSeleccionada);
  const [fechaFin, setFechaFin] = useState(fechaSeleccionada);
  const [tipoEvento, setTipoEvento] = useState("ordinario");
  const [estatus, setEstatus] = useState("programado");
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      
      const userId = sessionStorage.getItem("userId");
      
    }, []);

  useEffect(() => {
    if (evento) {
      setTitulo(evento.titulo || "");
      setDescripcion(evento.descripcion || "");
      setFechaInicio(evento.fecha_inicio || fechaSeleccionada);
      setFechaFin(evento.fecha_fin || fechaSeleccionada);
      setTipoEvento(evento.tipo_evento || "ordinario");
      setEstatus(evento.estatus || "programado");
    }
  }, [evento, fechaSeleccionada]);

  const handleSave = async () => {
    setIsLoading(true);
    const id_usuario = parseInt(sessionStorage.getItem("userId") || "0", 10);
    const color = coloresPorTipo[tipoEvento] || "#718096";

    try {
      const nuevoEvento = {
        titulo,
        descripcion,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        tipo_evento: tipoEvento,
        estatus,
        id_usuario,
        color
      };

      const response = await crearEvento(nuevoEvento);

      if (response?.id_evento) {
        onSaveSuccess(); // ✅ notificar al padre para recargar
        onClose();        // ✅ cerrar modal
      } else {
        alert("No se pudo guardar el evento.");
      }
    } catch (error) {
      console.error("error al guardar evento:", error);
      alert("Ocurrió un error al guardar el evento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg md:max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
      <h1 className="text-lg font-bold mb-4">Alta de fecha de cómite</h1>
        {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="flex flex-col items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <p className="mt-2 text-white">Cargando...</p>
              </div>
            </div>
        )}

        <label className="block mb-2 text-sm font-semibold">Título:</label>
        <input
          className="w-full border rounded p-2 mb-3"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Comité ordinario de adquisiciones"
        />

        <label className="block mb-2 text-sm font-semibold">Descripción:</label>
        <textarea
          className="w-full border rounded p-2 mb-3"
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <label className="block mb-2 text-sm font-semibold">Fecha inicio:</label>
        <input
          type="datetime-local"
          className="w-full border rounded p-2 mb-3"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <label className="block mb-2 text-sm font-semibold">Fecha fin:</label>
        <input
          type="datetime-local"
          className="w-full border rounded p-2 mb-3"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <label className="block mb-2 text-sm font-semibold">Tipo de evento:</label>
        <select
          className="w-full border rounded p-2 mb-3"
          value={tipoEvento}
          onChange={(e) => setTipoEvento(e.target.value)}
        >
          <option value="ordinario">Ordinario</option>
          <option value="extraordinario">Extraordinario</option>
          <option value="revisión">Recepción de requisiciones</option>
          <option value="vacaciones">Vacaciones</option>
          <option value="cierre">Cierre anual</option>
        </select>

        <label className="block mb-2 text-sm font-semibold">Estatus:</label>
        <select
          className="w-full border rounded p-2 mb-4"
          value={estatus}
          onChange={(e) => setEstatus(e.target.value)}
        >
          <option value="programado">Programado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        <div className="flex justify-end gap-2">
          {evento?.id_evento && onDelete && (
            <button
              onClick={() => onDelete(evento.id_evento!)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </button>
        </div>
      </div>
  </div>
  );
};

export default ModalEventoComite;
