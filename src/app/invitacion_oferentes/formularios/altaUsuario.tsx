"use client";

import { useEffect, useState } from "react";
import { getUsers } from "../../peticiones_api/fetchUsuarios";
import { createInvitacionComite } from "../../peticiones_api/peticionInvitacion";

interface Props {
  idConcurso: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface Usuario {
  id_usuario: number;
  nombre_u: string;
  nombre_s: string;
  puesto: string;
}

interface Evento {
  id_evento_calendario: number;
}

const ModalAgregarUsuarioInvitacion: React.FC<Props> = ({ idConcurso, onClose, onSuccess }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<number | null>(null);
  const [tipoParticipante, setTipoParticipante] = useState<"base" | "invitado" | "otro">("base");

  const idUsuarioEnvio = Number(sessionStorage.getItem("id_usuario"));

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resUsuarios = await getUsers();
        setUsuarios(resUsuarios || []);
      } catch (err) {
        console.error("Error al cargar usuarios/eventos:", err);
      }
    };

    cargarDatos();
  }, [idConcurso]);

  const handleGuardar = async () => {
    if (!usuarioSeleccionado || eventos.length === 0) {
      alert("Selecciona un usuario y asegúrate que haya eventos.");
      return;
    }

    const payload = eventos.map(ev => ({
      id_evento_calendario: ev.id_evento_calendario,
      id_usuario_envio: idUsuarioEnvio,
    }));

    try {
      await createInvitacionComite(payload);
      alert("Usuario agregado correctamente");
      onSuccess();
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      alert("Error al agregar usuario");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-lg font-bold mb-4">Agregar nuevo participantedfddfdfdfd</h2>

        <label className="block font-semibold mb-1">Selecciona un usuario:</label>
        <select
          className="w-full border p-2 rounded mb-4"
          value={usuarioSeleccionado || ""}
          onChange={(e) => setUsuarioSeleccionado(Number(e.target.value))}
        >
          <option value="">-- Selecciona --</option>
          {usuarios.map(u => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {u.nombre_u} {u.nombre_s} - {u.puesto}
            </option>
          ))}
        </select>

        <label className="block font-semibold mb-1">Tipo de participante:</label>
        <select
          className="w-full border p-2 rounded mb-4"
          value={tipoParticipante}
          onChange={(e) => setTipoParticipante(e.target.value as any)}
        >
          <option value="base">Base</option>
          <option value="invitado">Invitado</option>
          <option value="otro">Otro</option>
        </select>

        <div className="flex justify-end gap-3">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancelar</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleGuardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarUsuarioInvitacion;
