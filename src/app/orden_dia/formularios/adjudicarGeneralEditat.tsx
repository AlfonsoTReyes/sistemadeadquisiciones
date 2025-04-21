"use client";
import { useEffect, useState } from "react";
import { fetchEventos } from "../../peticiones_api/peticionEventos";
import { getOrdenDiaById, updateOrdenDia } from "../../peticiones_api/peticionOrdenDia";

interface ModalEditarGeneralesProps {
  idOrden: number;
  onSuccess: () => void;
  onClose: () => void;
}

interface EventoComite {
  id_evento: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_evento: string;
  estatus: string;
}

const ModalEditarGenerales: React.FC<ModalEditarGeneralesProps> = ({
  idOrden,
  onSuccess,
  onClose,
}) => {
  const [fechasDisponibles, setFechasDisponibles] = useState<EventoComite[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoComite | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [noOficio, setNoOficio] = useState("");
  const [asuntoGeneral, setAsuntoGeneral] = useState("");

  // Obtener eventos y datos actuales de la orden
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [eventos, orden] = await Promise.all([
          fetchEventos(),
          getOrdenDiaById(idOrden),
        ]);

        setFechasDisponibles(eventos || []);
        setFechaSeleccionada(orden.id_evento?.toString() || "");
        setNoOficio(orden.no_oficio || "");
        setAsuntoGeneral(orden.asunto_general || "");
        const hora = orden.hora?.substring(0, 5) || "";
        setHoraSeleccionada(hora);
        const eventoSel = eventos.find((e: EventoComite) => e.id_evento === orden.id_evento);
        setEventoSeleccionado(eventoSel || null);

      } catch (error) {
        console.error("Error al cargar datos para editar:", error);
      }
    };

    cargarDatos();
  }, [idOrden]);

  const handleGuardar = async () => {
    try {
      const fechaEvento = fechasDisponibles.find(f => f.id_evento.toString() === fechaSeleccionada);
      const fechaConHora = `${new Date(fechaEvento?.fecha_inicio || "").toISOString().split("T")[0]}T${horaSeleccionada}`;

      const datos = {
        id_orden_dia: idOrden,
        id_evento: parseInt(fechaSeleccionada),
        hora: fechaConHora,
        no_oficio: noOficio,
        asunto_general: asuntoGeneral,
        tipo_formulario: 1
      };

      await updateOrdenDia(datos);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      alert("Ocurrió un error al actualizar.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
       <div className="bg-white rounded-lg shadow-md w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Editar datos generales</h2>

        <label className="block font-semibold mb-1">Fecha</label>
        <select
          className="w-full border p-2 rounded"
          value={fechaSeleccionada}
          onChange={(e) => {
            setFechaSeleccionada(e.target.value);
            const evento = fechasDisponibles.find(f => f.id_evento.toString() === e.target.value);
            setEventoSeleccionado(evento || null);
          }}
        >
          <option value="">Selecciona</option>
          {fechasDisponibles.map((f) => (
            <option key={f.id_evento} value={f.id_evento}>
              {f.titulo} - {new Date(f.fecha_inicio).toLocaleDateString()}
            </option>
          ))}
        </select>

        <label className="block font-semibold mt-3 mb-1">Hora</label>
        <input
          type="time"
          className="w-full border p-2 rounded"
          value={horaSeleccionada}
          onChange={(e) => setHoraSeleccionada(e.target.value)}
        />

        <label className="block font-semibold mt-3 mb-1">No. de oficio</label>
        <input
          className="w-full border p-2 rounded"
          type="text"
          value={noOficio}
          onChange={(e) => setNoOficio(e.target.value)}
        />

        <label className="block font-semibold mt-3 mb-1">Asunto general</label>
        <select
          className="w-full border p-2 rounded"
          value={asuntoGeneral}
          onChange={(e) => setAsuntoGeneral(e.target.value)}
        >
          <option value="">Selecciona un asunto</option>
          <option value="CONVOCATORIA">CONVOCATORIA</option>
          <option value="CANCELACIÓN DE CONVOCATORIA">CANCELACIÓN DE CONVOCATORIA</option>
        </select>

        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={handleGuardar}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Guardar cambios
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-6 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarGenerales;
