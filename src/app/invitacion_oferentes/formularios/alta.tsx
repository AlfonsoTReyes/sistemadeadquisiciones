"use client";

import { useEffect, useState } from "react";
import { getUsers } from "../../peticiones_api/fetchUsuarios";
import { createInvitacionComite } from "../../peticiones_api/peticionInvitacion";

interface ModalInvitacionComiteProps {
  idConcurso: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface Usuario {
  id_usuario: number;
  nombre_u: string;
  nombre_s: string;
  puesto: string;
  email: string;
  rol: string;
}

const ModalInvitacionComite: React.FC<ModalInvitacionComiteProps> = ({ idConcurso, onClose, onSuccess }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [numeroOficio, setNumeroOficio] = useState("DAQ/");
  const [fechaEnvio, setFechaEnvio] = useState("");

  const [participantesBase, setParticipantesBase] = useState<Usuario[]>([]);
  const [invitados, setInvitados] = useState<Usuario[]>([]);
  const [otros, setOtros] = useState<Usuario[]>([]);

  const usuarioLogeadoId = Number(sessionStorage.getItem("userId"));

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await getUsers();
        setUsuarios(res || []);
      } catch (err) {
        console.error("Error al cargar usuarios:", err);
      }
    };

    fetchUsuarios();
    setFechaEnvio(new Date().toISOString().slice(0, 10));
  }, []);

  const agregarUsuario = (id: number, tipo: "base" | "invitado" | "otro") => {
    const user = usuarios.find((u) => u.id_usuario === id);
    if (!user) return;
    const yaAgregado = [...participantesBase, ...invitados, ...otros].some(u => u.id_usuario === id);
    if (yaAgregado) return;
    if (tipo === "base") setParticipantesBase([...participantesBase, user]);
    if (tipo === "invitado") setInvitados([...invitados, user]);
    if (tipo === "otro") setOtros([...otros, user]);
  };

  const eliminarUsuario = (id: number, tipo: "base" | "invitado" | "otro") => {
    if (tipo === "base") setParticipantesBase(participantesBase.filter(u => u.id_usuario !== id));
    if (tipo === "invitado") setInvitados(invitados.filter(u => u.id_usuario !== id));
    if (tipo === "otro") setOtros(otros.filter(u => u.id_usuario !== id));
  };

  const handleEnviar = async () => {
    if (!numeroOficio || !fechaEnvio || participantesBase.length === 0) {
      alert("Faltan campos obligatorios.");
      return;
    }

    const payload = {
      id_concurso: idConcurso,
      numero_oficio: numeroOficio,
      fecha_hora_envio: new Date().toISOString(),
      id_usuario_envio: usuarioLogeadoId,
      participantes: [
        ...participantesBase.map(u => ({ id_usuario_recibe: u.id_usuario, tipo_participante: "base" })),
        ...invitados.map(u => ({ id_usuario_recibe: u.id_usuario, tipo_participante: "invitado" })),
        ...otros.map(u => ({ id_usuario_recibe: u.id_usuario, tipo_participante: "otro" })),
      ]
    };

    try {
        console.log(payload);
      await createInvitacionComite(payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al guardar invitación:", err);
      alert("Ocurrió un error al guardar.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">Enviar calendario a comité</h2>

        <label className="block font-semibold">Número de oficio</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={numeroOficio}
          onChange={e => setNumeroOficio(e.target.value)}
        />

        <label className="block font-semibold">Fecha de envío</label>
        <input
          type="date"
          className="w-full border p-2 rounded mb-4"
          value={fechaEnvio}
          onChange={e => setFechaEnvio(e.target.value)}
        />

        {/* Sección para seleccionar usuarios */}
        {["base", "invitado", "otro"].map(tipo => (
          <div key={tipo} className="mb-4">
            <label className="font-semibold capitalize block">Agregar participante ({tipo})</label>
            <select
              className="w-full border rounded p-2"
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id) agregarUsuario(id, tipo as any);
              }}
            >
              <option value="">Selecciona usuario</option>
              {usuarios.map(u => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre_u} - {u.nombre_s} - {u.puesto}
                </option>
              ))}
            </select>

            {/* Mostrar seleccionados */}
            <ul className="mt-2 text-sm">
              {(tipo === "base" ? participantesBase : tipo === "invitado" ? invitados : otros).map(u => (
                <li key={u.id_usuario} className="flex justify-between items-center bg-gray-100 p-2 rounded mt-1">
                  <span>{u.nombre_u} - {u.nombre_s}</span>
                  <button className="text-red-500 text-xs" onClick={() => eliminarUsuario(u.id_usuario, tipo as any)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex justify-end gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleEnviar}>Enviar</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalInvitacionComite;
