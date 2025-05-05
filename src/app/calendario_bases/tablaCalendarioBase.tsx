"use client";
import { useState } from "react";
import ModificarEvento from "./formularios/modificar";
import ModalEliminarEvento from "./formularios/eliminar";
import ModalInvitacionComite from "../invitacion_oferentes/modalBasesCalendario"


interface Evento {
  id_evento_calendario: number;
  id_concurso: number;
  acto: string;
  fecha_inicio: string;
  fecha_fin: string;
  hora_inicio: string;
  hora_fin: string;
  descripcion_adicional: string;
}

interface TablaProps {
  eventos: Evento[];
  onReload: () => void;
}

const TablaCalendarioEventos: React.FC<TablaProps> = ({ eventos, onReload }) => {
  const [eventoEditar, setEventoEditar] = useState<number | null>(null);
  const [eventoEliminar, setEventoEliminar] = useState<number | null>(null); // 🔥 ESTADO PARA MODAL ELIMINAR
  const [mostrarModalInvitacion, setMostrarModalInvitacion] = useState(false);

  return (
    <div className="overflow-x-auto">
      {eventos.length === 0 && (
        <div className="text-center text-gray-500 mb-4">
          No hay eventos en el calendario.
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setMostrarModalInvitacion(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          📤 Enviar fechas a comité
        </button>
      </div>

      <table className="min-w-full table-auto border">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="border px-4 py-2">Acto</th>
            <th className="border px-4 py-2">Fecha Inicio</th>
            <th className="border px-4 py-2">Fecha Fin</th>
            <th className="border px-4 py-2">Hora Inicio</th>
            <th className="border px-4 py-2">Hora Fin</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((evento) => (
            <tr key={evento.id_evento_calendario}>
              <td className="border px-4 py-2">{evento.acto}</td>
              <td className="border px-4 py-2">{evento.fecha_inicio?.split("T")[0]}</td>
              <td className="border px-4 py-2">{evento.fecha_fin?.split("T")[0] || "-"}</td>
              <td className="border px-4 py-2">{evento.hora_inicio || "-"}</td>
              <td className="border px-4 py-2">{evento.hora_fin || "-"}</td>
              <td className="border px-4 py-2 space-y-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setEventoEditar(evento.id_evento_calendario)}
                >
                  ✏️ Editar
                </button>
                <br />
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => setEventoEliminar(evento.id_evento_calendario)}
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de modificar evento */}
      {eventoEditar !== null && (
        <ModificarEvento
          idEvento={eventoEditar}
          onClose={() => {
            setEventoEditar(null);
            onReload();
          }}
        />
      )}

      {/* Modal de eliminar evento */}
      {eventoEliminar !== null && (
        <ModalEliminarEvento
          idEvento={eventoEliminar}
          onClose={() => setEventoEliminar(null)}
          onDeleted={() => {
            setEventoEliminar(null);
            onReload();
          }}
        />
      )}
      {mostrarModalInvitacion && (
        <ModalInvitacionComite
          idConcurso={eventos[0]?.id_concurso ?? 0}
          onClose={() => setMostrarModalInvitacion(false)}
        />
      )}

    </div>
  );
};

export default TablaCalendarioEventos;
