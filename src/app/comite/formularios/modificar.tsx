"use client";
import { useState, useEffect } from "react";
import { getEventoById, modificarEvento } from "@/app/peticiones_api/peticionEventos";
import sesionesComite from "../sesiones.json";

interface Props {
  evento: { id_evento: number };
  fechaSeleccionada: string;
  onClose: () => void;
  onSaveSuccess: () => void;
  onDelete?: (id_evento: number) => void;
}

const coloresPorTipo: Record<string, string> = {
  ordinario: "#2B6CB0",
  extraordinario: "#C53030",
  revisión: "#38A169",
  vacaciones: "#D69E2E",
  cierre: "#805AD5",
};

const ModificarEvento: React.FC<Props> = ({
  evento,
  fechaSeleccionada,
  onClose,
  onSaveSuccess,
  onDelete,
}) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nomenclatura, setNomenclatura] = useState("");
  const [fechaInicio, setFechaInicio] = useState(fechaSeleccionada);
  const [fechaFin, setFechaFin] = useState(fechaSeleccionada);
  const [tipoEvento, setTipoEvento] = useState("ordinario");
  const [estatus, setEstatus] = useState("programado");
  const [isLoading, setIsLoading] = useState(false);
  const [usaSesionOrdinaria, setUsaSesionOrdinaria] = useState<boolean | null>(null);
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual.toString());

  const formatDateForInput = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchEvento = async () => {
      setIsLoading(true);
      try {
        const datos = await getEventoById(evento.id_evento);
        if (datos) {
          setTitulo(datos.titulo || "");
          setAnio(datos.anio || "");
          setDescripcion(datos.descripcion || "");
          setFechaInicio(formatDateForInput(datos.fecha_inicio));
          setFechaFin(formatDateForInput(datos.fecha_fin));
          setTipoEvento(datos.tipo_evento || "ordinario");
          setEstatus(datos.estatus || "programado");

          const sesion = sesionesComite.find(s => s.nombre === datos.titulo);
          if (sesion && datos.tipo_evento === "ordinario") {
            setUsaSesionOrdinaria(true);
            setNomenclatura(`${sesion.nomenclatura}-${anioActual}`);
          } else {
            setUsaSesionOrdinaria(false);
            setNomenclatura(datos.clave_evento || "");
          }
        }
      } catch (error) {
        console.error("Error al cargar evento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvento();
  }, [evento.id_evento, fechaSeleccionada]);

  const handleSave = async () => {
    setIsLoading(true);
    const id_usuario = parseInt(sessionStorage.getItem("id_usuario") || "0", 10);
    const color = coloresPorTipo[tipoEvento] || "#718096";

    const eventoData = {
      id_evento: evento.id_evento,
      titulo,
      descripcion,
      clave_evento: nomenclatura,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      tipo_evento: tipoEvento,
      estatus,
      id_usuario,
      color,
      nomenclatura,
      anio
    };

    try {
      const response = await modificarEvento(eventoData);
      if (response?.id_evento) {
        onSaveSuccess();
        onClose();
      } else {
        alert("No se pudo modificar el evento.");
      }
    } catch (error) {
      console.error("Error al modificar evento:", error);
      alert("Ocurrió un error al modificar el evento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg md:max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h1 className="text-lg font-bold mb-4">Modificar evento de comité</h1>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Cargando...</p>
            </div>
          </div>
        )}

        {tipoEvento === "ordinario" && (
          <>
            <label className="block mb-2 text-sm font-semibold">¿Agregar número de sesión ordinaria?</label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="usaSesion"
                  checked={usaSesionOrdinaria === true}
                  onChange={() => {
                    setUsaSesionOrdinaria(true);
                    setTitulo("");
                    setDescripcion("");
                    setNomenclatura("");
                  }}
                />
                Sí
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="usaSesion"
                  checked={usaSesionOrdinaria === false}
                  onChange={() => {
                    setUsaSesionOrdinaria(false);
                    setTitulo("");
                    setDescripcion("");
                    setNomenclatura("");
                  }}
                />
                No
              </label>
            </div>
          </>
        )}

        {tipoEvento === "ordinario" && usaSesionOrdinaria === true ? (
          <>
            <label className="block mb-2 text-sm font-semibold">Número de sesión ordinaria:</label>
            <select
              className="w-full border rounded p-2 mb-3"
              value={titulo}
              onChange={(e) => {
                const seleccion = sesionesComite.find((s) => s.nombre === e.target.value);
                if (seleccion) {
                  const claveGenerada = `${seleccion.nomenclatura}-${anioActual}`;
                  setTitulo(seleccion.nombre);
                  setDescripcion(`Sesión ordinaria del comité - ${claveGenerada}`);
                  setNomenclatura(claveGenerada);
                }
              }}
            >
              <option value="">Selecciona una sesión</option>
              {sesionesComite.map((sesion, idx) => (
                <option key={idx} value={sesion.nombre}>
                  {sesion.nombre}
                </option>
              ))}
            </select>

            <label className="block mb-2 text-sm font-semibold">Nomenclatura:</label>
            <input
              className="w-full border rounded p-2 mb-3"
              value={nomenclatura}
              onChange={(e) => setNomenclatura(e.target.value)}
              placeholder="Ej: MSJR-CA-ORD-05-2025"
            />
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm font-semibold">Título:</label>
            <input
              className="w-full border rounded p-2 mb-3"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Evento especial de cierre"
            />
            
            <label className="block mb-2 text-sm font-semibold">Nomenclatura:</label>
            <input
              className="w-full border rounded p-2 mb-3"
              value={nomenclatura}
              onChange={(e) => setNomenclatura(e.target.value)}
              placeholder="Ej: MSJR-OTRO-999-2025"
            />
          </>
        )}

        <label className="block mb-2 text-sm font-semibold">Año:</label>
        <input
          type="number"
          className="w-full border rounded p-2 mb-3"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
          min="2000"
          max="2100"
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
          onChange={(e) => {
            setTipoEvento(e.target.value);
            setUsaSesionOrdinaria(null);
          }}
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
          {onDelete && (
            <button
              onClick={() => onDelete(evento.id_evento)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar"}
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

export default ModificarEvento;
