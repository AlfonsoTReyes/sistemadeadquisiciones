"use client";
import { useState, useMemo } from "react";
import ModificarEvento from "./formularios/modificar";
import ModalEliminarEvento from "./formularios/eliminar";

interface Evento {
  id_evento: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_evento: string;
  color: string;
  estatus: string;
}

const TablaEventos: React.FC<{
  eventos: Evento[];
  onEventoCambiado: () => Promise<void>;
}> = ({ eventos, onEventoCambiado }) => {
  const [eventoEditar, setEventoEditar] = useState<Evento | null>(null);
  const [eventoEliminar, setEventoEliminar] = useState<Evento | null>(null);

  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroEstatus, setFiltroEstatus] = useState<string>("todos");
  const [verPasados, setVerPasados] = useState<boolean>(false);

  const ahora = new Date();

  // 🔍 Obtener tipos únicos
  const tiposUnicos = useMemo(() => {
    const tipos = eventos.map((e) => e.tipo_evento.toLowerCase());
    return Array.from(new Set(tipos));
  }, [eventos]);

  // 🔍 Obtener estatus únicos
  const estatusUnicos = useMemo(() => {
    const estatus = eventos.map((e) => e.estatus.toLowerCase());
    return Array.from(new Set(estatus));
  }, [eventos]);

  // 📋 Filtro dinámico
  const eventosFiltrados = eventos.filter((evento) => {
    const cumpleTipo = filtroTipo === "todos" || evento.tipo_evento === filtroTipo;
    const cumpleEstatus = filtroEstatus === "todos" || evento.estatus === filtroEstatus;

    const esPasado =
      new Date(evento.fecha_fin) < ahora && evento.estatus.toLowerCase() !== "programado";
    const cumplePasado = verPasados ? esPasado : true;

    return cumpleTipo && cumpleEstatus && cumplePasado;
  });

  return (
    <div className="overflow-x-auto">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <label className="font-semibold mr-2">Filtrar por tipo:</label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="todos">Todos</option>
            {tiposUnicos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold mr-2">Filtrar por estatus:</label>
          <select
            value={filtroEstatus}
            onChange={(e) => setFiltroEstatus(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="todos">Todos</option>
            {estatusUnicos.map((estatus) => (
              <option key={estatus} value={estatus}>
                {estatus.charAt(0).toUpperCase() + estatus.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold mr-2">Eventos pasados:</label>
          <input
            type="checkbox"
            checked={verPasados}
            onChange={() => setVerPasados(!verPasados)}
          />
        </div>
      </div>

      {/* Tabla de eventos */}
      <table className="min-w-full table-auto border">
        <thead className="bg-yellow-600 text-white">
          <tr>
            <th className="border px-4 py-2">Título</th>
            <th className="border px-4 py-2">Tipo</th>
            <th className="border px-4 py-2">Descripción</th>
            <th className="border px-4 py-2">Fecha inicio</th>
            <th className="border px-4 py-2">Fecha fin</th>
            <th className="border px-4 py-2">Estatus</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {eventosFiltrados.map((evento) => (
            <tr key={evento.id_evento}>
              <td className="border px-4 py-2">
                <div className="flex flex-col">
                  <span>{evento.titulo}</span>
                  <span
                    className="mt-1 h-2 w-full rounded"
                    style={{ backgroundColor: evento.color }}
                    title={`Color del tipo: ${evento.tipo_evento}`}
                  />
                </div>
              </td>
              <td className="border px-4 py-2 capitalize">{evento.tipo_evento}</td>
              <td className="border px-4 py-2">{evento.descripcion}</td>
              <td className="border px-4 py-2">{new Date(evento.fecha_inicio).toLocaleString()}</td>
              <td className="border px-4 py-2">{new Date(evento.fecha_fin).toLocaleString()}</td>
              <td className="border px-4 py-2 capitalize">{evento.estatus}</td>
              <td className="border px-4 py-2 space-x-2">
                {evento.estatus !== "realizado" && evento.estatus !== "cancelado" ? (
                  <>
                    <button
                      onClick={() => setEventoEditar(evento)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <br />
                    <button
                      onClick={() => setEventoEliminar(evento)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </>
                ) : (
                  <span className="text-gray-500 italic">Sin acciones</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal editar */}
      {eventoEditar && (
        <ModificarEvento
          evento={eventoEditar}
          fechaSeleccionada={eventoEditar.fecha_inicio}
          onClose={() => setEventoEditar(null)}
          onSaveSuccess={onEventoCambiado}
        />
      )}

      {/* Modal eliminar */}
      {eventoEliminar && (
        <ModalEliminarEvento
          id_evento={eventoEliminar.id_evento}
          onClose={() => setEventoEliminar(null)}
          onDeleteSuccess={onEventoCambiado}
        />
      )}
    </div>
  );
};

export default TablaEventos;
