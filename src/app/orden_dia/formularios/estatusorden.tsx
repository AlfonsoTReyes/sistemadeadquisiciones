"use client";
import { useEffect, useState } from "react";
import { getUsers } from "../../peticiones_api/fetchUsuarios";

interface Usuario {
  id_usuario: number;
  nombre_u: string;
  nombre_s: string;
  puesto: string;
  email: string;
}

interface ModalCambiarEstatusOrdenProps {
  idOrden: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalCambiarEstatusOrden: React.FC<ModalCambiarEstatusOrdenProps> = ({
  idOrden,
  onClose,
  onSuccess,
}) => {
  const [estatus, setEstatus] = useState<"Terminado" | "Cancelado">("Cancelado");
  const [noOficio, setNoOficio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [desarrollo, setDesarrollo] = useState("");

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [base, setBase] = useState<Usuario[]>([]);
  const [invitados, setInvitados] = useState<Usuario[]>([]);
  const [requirentes, setRequirentes] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<"base" | "invitado" | "requirente">("base");

  useEffect(() => {
    if (estatus === "Terminado") {
      getUsers().then(setUsuarios).catch(() => alert("Error al cargar usuarios"));
    }
  }, [estatus]);

  const agregarUsuario = () => {
    if (!usuarioSeleccionado) return;
    const yaExiste = [...base, ...invitados, ...requirentes].some(
      u => u.id_usuario === usuarioSeleccionado.id_usuario
    );
    if (yaExiste) return;

    if (grupoSeleccionado === "base") setBase((prev) => [...prev, usuarioSeleccionado]);
    else if (grupoSeleccionado === "invitado") setInvitados((prev) => [...prev, usuarioSeleccionado]);
    else if (grupoSeleccionado === "requirente") setRequirentes((prev) => [...prev, usuarioSeleccionado]);

    setUsuarioSeleccionado(null);
  };

  const eliminarUsuario = (id: number, grupo: "base" | "invitado" | "requirente") => {
    if (grupo === "base") setBase((prev) => prev.filter(u => u.id_usuario !== id));
    if (grupo === "invitado") setInvitados((prev) => prev.filter(u => u.id_usuario !== id));
    if (grupo === "requirente") setRequirentes((prev) => prev.filter(u => u.id_usuario !== id));
  };

  const handleGuardar = async () => {
    if (!noOficio.trim()) return alert("Debes ingresar número de oficio");

    if (estatus === "Terminado" && (!fecha || !hora || !desarrollo.trim())) {
      return alert("Llena todos los campos requeridos");
    }

    const payload: any = {
      id_orden_dia: idOrden,
      estatus,
      no_oficio: noOficio,
      asunto_general: estatus === "Cancelado" ? "CANCELACIÓN DE CONVOCATORIA" : "CONVOCATORIA",
    };

    if (estatus === "Terminado") {
      payload.fecha_termino = fecha;
      payload.hora_termino = hora;
      payload.desarrollo_sesion = desarrollo;
      payload.participantes_base = base.map(u => u.id_usuario);
      payload.usuarios_invitados = invitados.map(u => u.id_usuario);
      payload.usuarios_requirentes = requirentes.map(u => u.id_usuario);
    }

    try {
      const res = await fetch("/api/ordendia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Actualizado correctamente");
        onSuccess();
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert("Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Actualizar Estatus</h2>

        {/* Estatus + No Oficio */}
        <label className="block font-semibold">Estatus</label>
        <select
          value={estatus}
          onChange={(e) => setEstatus(e.target.value as "Terminado" | "Cancelado")}
          className="w-full border rounded p-2 mb-4"
        >
          <option value="Terminado">Terminado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <label className="block font-semibold">No. de oficio</label>
        <input
          type="text"
          value={noOficio}
          onChange={(e) => setNoOficio(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        {estatus === "Terminado" && (
          <>
            {/* Fecha, hora, desarrollo */}
            <label className="block font-semibold">Fecha de término</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />

            <label className="block font-semibold">Hora de término</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />

            <label className="block font-semibold">Desarrollo de la sesión</label>
            <textarea
              rows={4}
              value={desarrollo}
              onChange={(e) => setDesarrollo(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="Describa lo ocurrido..."
            />

            {/* Usuarios seleccionados */}
            <label className="block font-semibold mb-1">Seleccionar usuario</label>
            <select
              className="w-full border rounded p-2 mb-2"
              onChange={(e) => {
                const user = usuarios.find(u => u.id_usuario.toString() === e.target.value);
                setUsuarioSeleccionado(user || null);
              }}
              defaultValue=""
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre_u} - {u.nombre_s} - {u.puesto}
                </option>
              ))}
            </select>

            <label className="block font-semibold">¿A qué grupo pertenece?</label>
            <select
              value={grupoSeleccionado}
              onChange={(e) => setGrupoSeleccionado(e.target.value as any)}
              className="w-full border rounded p-2 mb-4"
            >
              <option value="base">Base</option>
              <option value="invitado">Invitado</option>
              <option value="requirente">Área requirente</option>
            </select>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
              onClick={agregarUsuario}
            >
              Agregar usuario
            </button>

            {/* Listado */}
            {([
  { titulo: "Usuarios base", lista: base, grupo: "base" },
  { titulo: "Invitados", lista: invitados, grupo: "invitado" },
  { titulo: "Área requirente", lista: requirentes, grupo: "requirente" },
] as { titulo: string; lista: Usuario[]; grupo: "base" | "invitado" | "requirente" }[]).map(({ titulo, lista, grupo }) => (
  <div key={grupo} className="mb-4">
    <h4 className="font-bold">{titulo}</h4>
    {lista.length === 0 && <p className="text-sm text-gray-400">Ninguno</p>}
    <ul className="text-sm list-disc list-inside mt-2">
      {lista.map((u) => (
        <li key={u.id_usuario} className="flex justify-between bg-gray-100 p-2 rounded my-1">
          <span>{u.nombre_u} - {u.puesto}</span>
          <button
            className="text-red-500 text-xs underline"
            onClick={() => eliminarUsuario(u.id_usuario, grupo)}
          >
            Quitar
          </button>
        </li>
      ))}
    </ul>
  </div>
))}

          </>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
          <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambiarEstatusOrden;
