"use client";

import { useEffect, useState } from "react";
import { verificarInvitacionPorConcurso } from "../peticiones_api/peticionInvitacion";
import ModalEliminarInvitacion from "./formularios/eliminar";
import ModalAltaUsuario from "./formularios/altaUsuario";
import ModalAltaInvitacionComite from "./formularios/alta";
import ModalModificarInvitacionComite from "./formularios/modificacion"; // ✅ Nuevo modal agregado
import generarInvitacionComitePDF  from "../PDF/invitacionoferentes";

interface ModalInvitacionComiteProps {
  idConcurso: number;
  onClose: () => void;
}

interface ParticipanteEnviado {
  nombre: string;
  tipo: string;
  id_usuario: number;
}

interface Evento {
  acto: string;
  fecha_inicio: string;
  hora_inicio: string;
}

const ModalInvitacionComite: React.FC<ModalInvitacionComiteProps> = ({ idConcurso, onClose }) => {
  const [yaEnviado, setYaEnviado] = useState(false);
  const [infoEnvio, setInfoEnvio] = useState<{ numero_oficio: string; fecha_hora_envio: string } | null>(null);
  const [participantesEnviados, setParticipantesEnviados] = useState<ParticipanteEnviado[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [usuarioEliminar, setUsuarioEliminar] = useState<ParticipanteEnviado | null>(null);
  const [mostrarAltaInvitacion, setMostrarAltaInvitacion] = useState(false);
  const [mostrarAltaUsuario, setMostrarAltaUsuario] = useState(false);
  const [mostrarModificar, setMostrarModificar] = useState(false);

  const cargarEstado = async () => {
    try {
      const estado = await verificarInvitacionPorConcurso(idConcurso);
      console.log(estado);
      if (estado?.yaFueEnviado) {
        setYaEnviado(true);
        setInfoEnvio({
          numero_oficio: estado.numero_oficio,
          fecha_hora_envio: estado.fecha_hora_envio,
        });

        setParticipantesEnviados(estado.participantes || []);
        setEventos(estado.eventos || []);
      }
    } catch (err) {
      console.error("Error al verificar invitación:", err);
    }
  };

  useEffect(() => {
    cargarEstado();
  }, [idConcurso]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-5xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Estado de envío a comité</h2>

        {yaEnviado ? (
          <>
            <div className="bg-green-100 border border-green-300 p-4 rounded mb-4">
              <p className="font-semibold">✅ Ya se envió este calendario.</p>
              <p><strong>Oficio:</strong> {infoEnvio?.numero_oficio}</p>
              <p><strong>Fecha de envío:</strong> {new Date(infoEnvio?.fecha_hora_envio || "").toLocaleString()}</p>
            </div>

            {eventos.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Eventos del calendario:</h3>
                <table className="w-full border text-sm rounded shadow-sm">
                  <thead className="bg-gray-200 text-left">
                    <tr>
                      <th className="border p-2">Acto</th>
                      <th className="border p-2">Fecha inicio</th>
                      <th className="border p-2">Hora inicio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.map((ev, i) => (
                      <tr key={i}>
                        <td className="border p-2">{ev.acto}</td>
                        <td className="border p-2">{new Date(ev.fecha_inicio).toLocaleDateString()}</td>
                        <td className="border p-2">{ev.hora_inicio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mb-4">

              <table className="w-full border text-sm rounded shadow-sm">
                <thead className="bg-gray-200 text-left">
                  <tr>
                    <th className="border p-2">Nombre</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {participantesEnviados.map((p, i) => (
                    <tr key={i}>
                      <td className="border p-2">{p.nombre}</td>
                      <td className="border p-2 capitalize">{p.tipo}</td>
                      <td className="border p-2">
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => setUsuarioEliminar(p)}
                        >
                          Eliminar invitación
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-4">
            <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => generarInvitacionComitePDF(idConcurso)}

            >
                Generar PDF
            </button>
              <button className="bg-yellow-600 text-white px-4 py-2 rounded">✉️ Recordar</button>
              <button className="bg-blue-700 text-white px-4 py-2 rounded" onClick={() => setMostrarModificar(true)}>
                ✏️ Modificar
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
                Cerrar
              </button>
            </div>

            {/* Modal eliminar */}
            {usuarioEliminar && (
              <ModalEliminarInvitacion
                idConcurso={idConcurso}
                usuario={usuarioEliminar}
                onClose={() => setUsuarioEliminar(null)}
                onSuccess={() => {
                  setUsuarioEliminar(null);
                  cargarEstado();
                }}
              />
            )}

            {/* Modal agregar usuario */}
            {mostrarAltaUsuario && (
              <ModalAltaUsuario
                idConcurso={idConcurso}
                onClose={() => setMostrarAltaUsuario(false)}
                onSuccess={() => {
                  setMostrarAltaUsuario(false);
                  cargarEstado();
                }}
              />
            )}

            {/* Modal modificar invitación */}
            {mostrarModificar && (
              <ModalModificarInvitacionComite
                idConcurso={idConcurso}
                onClose={() => setMostrarModificar(false)}
                onSuccess={() => {
                  setMostrarModificar(false);
                  cargarEstado();
                }}
              />
            )}
          </>
        ) : (
          <>
            <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-4 text-yellow-800">
              <p>⚠️ Aún no se ha enviado el calendario a comité.</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => setMostrarAltaInvitacion(true)}
              >
                ➕ Dar de alta invitación
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>
                Cancelar
              </button>
            </div>

            {/* Modal alta si aún no fue enviado */}
            {mostrarAltaInvitacion && (
              <ModalAltaInvitacionComite
                idConcurso={idConcurso}
                onClose={() => setMostrarAltaInvitacion(false)}
                onSuccess={() => {
                  setMostrarAltaInvitacion(false);
                  cargarEstado();
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModalInvitacionComite;
