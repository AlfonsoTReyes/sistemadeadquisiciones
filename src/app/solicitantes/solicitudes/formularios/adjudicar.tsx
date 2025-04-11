"use client";
import { useEffect, useState } from "react";
import { getUsers } from '../../../peticiones_api/fetchUsuarios';
import { fetchEventos } from '../../../peticiones_api/peticionEventos';
import { fetchAdjudicaciones } from '../../../peticiones_api/peticionCatalogoAdjudicaciones';

interface ModalAdjudicarProps {
  idSolicitud: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface Usuario {
  id_usuario: number;
  nombre_u: string;
  nombre_s: string;
  puesto: string;
  rol: string;
  email: string;
  estatus: string;
}


interface Adjudicacion {
  id_tipo_adjudicacion: number;
  nombre: string;
  tipo_adquisicion: string;
  descripcion: string;
  estatus: string;
  monto_max: number;
  monto_min: number;
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


const ModalAdjudicar: React.FC<ModalAdjudicarProps> = ({
  idSolicitud,
  onClose,
  onSuccess,
}) => {
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<Usuario[]>([]);

  const [adjudicaciones, setAdjudicaciones] = useState<Adjudicacion[]>([]);
  const [adjudicacionSeleccionada, setAdjudicacionSeleccionada] = useState<Adjudicacion | null>(null);

  const [invitados, setInvitados] = useState<string[]>([]);
  const [nuevoInvitado, setNuevoInvitado] = useState("");
  const [asunto, setAsunto] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState<EventoComite[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoComite | null>(null);
  

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [resFechas, resUsuarios, resAdjudicacion] = await Promise.all([
          fetchEventos(),
          getUsers(),
          fetchAdjudicaciones(),
        ]);

        const fechas = resFechas;
        const usuariosData =  resUsuarios;
        const adjudicacionData: Adjudicacion[] = resAdjudicacion;
        setAdjudicaciones(adjudicacionData);

        setFechasDisponibles(fechas || []);
        setUsuarios(usuariosData || []);
        setAdjudicaciones(adjudicacionData || []);
      } catch (error) {
        console.error("error al cargar datos del comité:", error);
      }
    };

    fetchDatos();
  }, []);

  const handleAgregarInvitado = () => {
    if (nuevoInvitado.trim() && !invitados.includes(nuevoInvitado.trim())) {
      setInvitados((prev) => [...prev, nuevoInvitado.trim()]);
      setNuevoInvitado("");
    }
  };

  const handleConvocar = async () => {
    if (!fechaSeleccionada || !asunto) {
      alert("selecciona una fecha y escribe un asunto.");
      return;
    }

    try {
      const res = await fetch("/api/comite/convocar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idSolicitud,
          fecha: fechaSeleccionada,
          asunto,
          invitados,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert("error al convocar comité.");
      }
    } catch (error) {
      console.error("error al convocar comité:", error);
      alert("ocurrió un error.");
    }
  };

  const agregarUsuarioSeleccionado = () => {
    if (
      usuarioSeleccionado &&
      !usuariosSeleccionados.some((u) => u.id_usuario === usuarioSeleccionado.id_usuario)
    ) {
      setUsuariosSeleccionados((prev) => [...prev, usuarioSeleccionado]);
      setUsuarioSeleccionado(null); // opcional: limpiar la selección actual
    }
  };
  
  const eliminarUsuario = (id: number) => {
    setUsuariosSeleccionados((prev) => prev.filter((u) => u.id_usuario !== id));
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">

        <h2 className="text-xl font-bold mb-4">convocar comité</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fechas */}
          <div>
            <label className="font-semibold block mb-1">Seleccionar fecha</label>
            <select
              className="w-full border rounded p-2"
              value={fechaSeleccionada}
              onChange={(e) => {
                setFechaSeleccionada(e.target.value);
                const seleccionado = fechasDisponibles.find((f) => f.id_evento.toString() === e.target.value);
                setEventoSeleccionado(seleccionado || null);
              }}
            >
              <option value="">Selecciona</option>
              {fechasDisponibles.map((f) => (
                <option key={f.id_evento} value={f.id_evento}>
                  {f.titulo} - {new Date(f.fecha_inicio).toLocaleDateString()} / {new Date(f.fecha_fin).toLocaleDateString()}
                </option>
              ))}
            </select>

            {eventoSeleccionado && (
              <div className="mt-3 text-sm bg-gray-100 p-3 rounded">
                <p><strong>Descripción:</strong> {eventoSeleccionado.descripcion}</p>
                <p><strong>Estatus:</strong> {eventoSeleccionado.estatus}</p>
                <p><strong>Tipo de evento:</strong> {eventoSeleccionado.tipo_evento}</p>
              </div>
            )}
          </div>


          {/* Adjudicación + invitados */}
          <div>
            <label className="font-semibold mb-1 block">Tipo de adjudicación:</label>
            <select
              className="w-full border p-2 rounded mb-2 uppercase"
              value={adjudicacionSeleccionada?.id_tipo_adjudicacion || ""}
              onChange={(e) => {
                const seleccion = adjudicaciones.find(
                  (a) => a.id_tipo_adjudicacion.toString() === e.target.value
                );
                setAdjudicacionSeleccionada(seleccion || null);
              }}
            >
              <option value="">SELECCIONA TIPO DE ADJUDICACIÓN</option>
              {adjudicaciones.map((a) => (
                <option key={a.id_tipo_adjudicacion} value={a.id_tipo_adjudicacion}>
                  {a.nombre.toUpperCase()}
                </option>
              ))}
            </select>

            {adjudicacionSeleccionada && (
              <div className="mt-2 text-sm text-gray-700 space-y-1">
                <p><strong>Nombre:</strong> {adjudicacionSeleccionada.nombre}</p>
                <p><strong>Tipo:</strong> {adjudicacionSeleccionada.tipo_adquisicion}</p>
                <p><strong>Descripción:</strong> {adjudicacionSeleccionada.descripcion}</p>
                <p><strong>Estatus:</strong> {adjudicacionSeleccionada.estatus}</p>
                <p><strong>Monto mínimo:</strong> ${adjudicacionSeleccionada.monto_min}</p>
                <p><strong>Monto máximo:</strong> ${adjudicacionSeleccionada.monto_max}</p>
              </div>
            )}
          </div>


          <div className="mb-4">
            <label className="font-semibold block mb-1">Seleccionar usuario</label>
            <select
              className="w-full border rounded p-2"
              onChange={(e) => {
                const seleccionado = usuarios.find((u) => u.id_usuario.toString() === e.target.value);
                setUsuarioSeleccionado(seleccionado || null);
              }}
              value={usuarioSeleccionado?.id_usuario || ""}
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {`${u.nombre_u.toUpperCase()} - ${u.nombre_s} - ${u.puesto}`}
                </option>
              ))}
            </select>

            {usuarioSeleccionado && (
              <div className="mt-2 bg-gray-100 p-3 rounded text-sm">
                <p><strong>Rol:</strong> {usuarioSeleccionado.rol}</p>
                <p><strong>Nombre:</strong> {usuarioSeleccionado.nombre_s}</p>
                <p><strong>Email:</strong> {usuarioSeleccionado.email}</p>
                <p><strong>Estatus:</strong> {usuarioSeleccionado.estatus}</p>
                <button
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                  onClick={agregarUsuarioSeleccionado}
                >
                  Agregar a invitados
                </button>
              </div>
            )}
          </div>

          {usuariosSeleccionados.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Usuarios seleccionados:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {usuariosSeleccionados.map((u) => (
                  <li key={u.id_usuario} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{u.nombre_s} - {u.email}</span>
                    <button
                      className="text-red-500 text-xs underline"
                      onClick={() => eliminarUsuario(u.id_usuario)}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}


          {/* Asunto */}
          <div>
            <label className="font-semibold block mb-1">asunto</label>
            <input
              type="text"
              className="w-full border rounded p-2 mb-3"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white w-full p-2 rounded mb-2"
              onClick={handleConvocar}
            >
              convocar comité
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white w-full p-2 rounded"
            >
              cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAdjudicar;
