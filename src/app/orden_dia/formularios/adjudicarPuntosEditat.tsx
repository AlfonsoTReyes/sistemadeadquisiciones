"use client";
import { useEffect, useState } from "react";
import { getUsers } from "../../peticiones_api/fetchUsuarios";
import { getOrdenDiaById, updateOrdenDia } from "../../peticiones_api/peticionOrdenDia";

interface ModalEditarParticipantesProps {
  idOrden: number;
  onSuccess: () => void;
  onClose: () => void;
}

interface Usuario {
  id_usuario: number;
  nombre_u: string;
  nombre_s: string;
  puesto: string;
  email: string;
}

const ModalEditarParticipantes: React.FC<ModalEditarParticipantesProps> = ({
  idOrden,
  onSuccess,
  onClose,
}) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [puntos, setPuntos] = useState<string[]>([]);
  const [nuevoPunto, setNuevoPunto] = useState("");
  const [base, setBase] = useState<number[]>([]);
  const [invitados, setInvitados] = useState<number[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuariosData, orden] = await Promise.all([
          getUsers(),
          getOrdenDiaById(idOrden),
        ]);
        setUsuarios(usuariosData || []);
        setPuntos(orden.puntos_tratar || []);
  
        const participantes = orden.participantes || [];
  
        // separa por tipo_usuario
        const baseIds = participantes
          .filter((p: any) => p.tipo_usuario === "base")
          .map((p: any) => p.id_usuario);
  
        const invitadosIds = participantes
          .filter((p: any) => p.tipo_usuario === "invitado")
          .map((p: any) => p.id_usuario);
  
        setBase(baseIds);
        setInvitados(invitadosIds);
      } catch (error) {
        console.error("Error al cargar datos del orden:", error);
      }
    };
  
    cargarDatos();
  }, [idOrden]);
  

  const handleGuardar = async () => {
    try {
      const datos = {
        id_orden_dia: idOrden,
        puntos_tratar: puntos,
        participantes_base: base,
        usuarios_invitados: invitados,
        tipo_formulario: 2
      };

      await updateOrdenDia(datos); // ⚠️ asegúrate que tu backend lo acepta así
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Ocurrió un error al guardar los cambios.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
       <div className="bg-white rounded-lg shadow-md w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Editar participantes y puntos</h2>

        {/* PUNTOS */}
        <label className="block font-semibold mb-1">Agregar punto</label>
        <div className="flex gap-2">
          <input
            className="w-full border p-2 rounded"
            value={nuevoPunto}
            onChange={(e) => setNuevoPunto(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              if (nuevoPunto.trim()) {
                setPuntos([...puntos, nuevoPunto.trim()]);
                setNuevoPunto("");
              }
            }}
          >
            Agregar
          </button>
        </div>

        <ul className="mt-2">
          {puntos.map((p, i) => (
            <li key={i} className="flex justify-between items-center border-b py-1">
              {p}
              <button className="text-red-500" onClick={() => setPuntos(puntos.filter((_, idx) => idx !== i))}>
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* USUARIOS BASE */}
        <label className="block font-semibold mt-4 mb-1">Usuarios de base</label>
        <select
          className="w-full border p-2 rounded"
          onChange={(e) => {
            const id = parseInt(e.target.value);
            if (!base.includes(id)) setBase([...base, id]);
          }}
          defaultValue=""
        >
          <option value="">Selecciona un usuario</option>
          {usuarios.map(u => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {`${u.nombre_u} - ${u.puesto}`}
            </option>
          ))}
        </select>

        <ul className="mt-2">
          {base.map((id) => {
            const u = usuarios.find((u) => u.id_usuario === id);
            return (
              <li key={id} className="flex justify-between items-center border-b py-1">
                {u?.nombre_u || id}
                <button onClick={() => setBase(base.filter((b) => b !== id))} className="text-red-500">✕</button>
              </li>
            );
          })}
        </ul>

        {/* USUARIOS INVITADOS */}
        <label className="block font-semibold mt-4 mb-1">Usuarios invitados</label>
        <select
          className="w-full border p-2 rounded"
          onChange={(e) => {
            const id = parseInt(e.target.value);
            if (!invitados.includes(id)) setInvitados([...invitados, id]);
          }}
          defaultValue=""
        >
          <option value="">Selecciona un invitado</option>
          {usuarios.map(u => (
            <option key={u.id_usuario} value={u.id_usuario}>
              {`${u.nombre_u} - ${u.puesto}`}
            </option>
          ))}
        </select>

        <ul className="mt-2">
          {invitados.map((id) => {
            const u = usuarios.find((u) => u.id_usuario === id);
            return (
              <li key={id} className="flex justify-between items-center border-b py-1">
                {u?.nombre_u || id}
                <button onClick={() => setInvitados(invitados.filter((i) => i !== id))} className="text-red-500">✕</button>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-center mt-4 gap-4">
          <button
            onClick={handleGuardar}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarParticipantes;
