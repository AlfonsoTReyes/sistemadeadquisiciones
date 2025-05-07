"use client";
import { useEffect, useState } from "react";
import { getUsers } from '../../peticiones_api/fetchUsuarios';
import { fetchEventos } from '../../peticiones_api/peticionEventos';
import { fetchOrdenesDia, createOrdenDia } from '../../peticiones_api/peticionOrdenDia';

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
  const [noOficio, setNoOficio] = useState("DAQ/"); 
  const [invitados, setInvitados] = useState<Usuario[]>([]);
  const [asunto, setAsunto] = useState("");
  const [puntoTemporal, setPuntoTemporal] = useState("");
  const [asunto_general, setAsuntoGeneral] = useState("");
  const [puntosATratar, setPuntosATratar] = useState<string[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [fechasDisponibles, setFechasDisponibles] = useState<EventoComite[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoComite | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [resFechas, resUsuarios] = await Promise.all([
          fetchEventos(),
          getUsers(),
        ]);

        const fechas = resFechas;
        const usuariosData =  resUsuarios;

        setFechasDisponibles(fechas || []);
        setUsuarios(usuariosData || []);
      } catch (error) {
        console.error("error al cargar datos del comité:", error);
      }
    };

    fetchDatos();
  }, []);


  const handleConvocar = async () => {
    if (!fechaSeleccionada || !horaSeleccionada || !asunto_general) {
      alert("Selecciona fecha, hora y asunto.");
      return;
    }
    
    const userId = sessionStorage.getItem("userId");

    const fechaEvento = fechasDisponibles.find(f => f.id_evento.toString() === fechaSeleccionada);
    const fechaConHora = horaSeleccionada
      ? `${new Date(fechaEvento?.fecha_inicio || "").toISOString().split("T")[0]}T${horaSeleccionada}`
      : fechaEvento?.fecha_inicio;
    

    const formData = {
      id_solicitud: idSolicitud,
      asunto_general,
      no_oficio: noOficio,
      hora: fechaConHora, 
      puntos_tratar: puntosATratar,
      participantes_base: usuariosSeleccionados.map(u => u.id_usuario), 
      usuarios_invitados: invitados.map(u => u.id_usuario),
      id_evento: parseInt(fechaSeleccionada),
      userId,
    };



    try {
      await createOrdenDia(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("error al convocar comité:", error);
      alert("ocurrió un error.");
    }
  };

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">

        <h2 className="text-xl font-bold mb-4">Convocar comité / orden de día</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fechas */}
          <div className="md:col-span-2">
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

            {/* Hora manual editable */}
            <label className="mt-4 block font-semibold">Hora del comité</label>
            <input
              type="time"
              className="w-full border p-2 rounded"
              value={horaSeleccionada}
              onChange={(e) => setHoraSeleccionada(e.target.value)}
            />


          </div>

          <div className="md:col-span-2">
            <label className="font-semibold block mb-1">No. de oficio</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={noOficio}
              onChange={(e) => setNoOficio(e.target.value)}
              placeholder="Ej. DAQ/001/2025"
            />
          </div>


          <div className="md:col-span-2">
          <label className="font-semibold block mb-1">Puntos a tratar</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Escribe un punto"
                className="w-full border p-2 rounded"
                value={puntoTemporal}
                onChange={(e) => setPuntoTemporal(e.target.value)}
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (puntoTemporal.trim()) {
                    setPuntosATratar((prev) => [...prev, puntoTemporal.trim()]);
                    setPuntoTemporal("");
                  }
                }}
              >
                Agregar
              </button>
            </div>

            {puntosATratar.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {puntosATratar.map((punto, idx) => (
                  <div key={idx} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                    <span className="text-sm">{punto}</span>
                    <button
                      type="button"
                      className="text-red-500 text-xs"
                      onClick={() =>
                        setPuntosATratar((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* SELECCIÓN DE USUARIOS DE CAJÓN */}
          <div className="md:col-span-2">
            <label className="font-semibold block mb-1">Usuarios de base</label>
            <select
              className="w-full border rounded p-2"
              onChange={(e) => {
                const seleccionado = usuarios.find((u) => u.id_usuario.toString() === e.target.value);
                if (seleccionado && !usuariosSeleccionados.some(u => u.id_usuario === seleccionado.id_usuario)) {
                  setUsuariosSeleccionados(prev => [...prev, seleccionado]);
                }
              }}
              defaultValue=""
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {`${u.nombre_u.toUpperCase()} - ${u.nombre_s} - ${u.puesto}`}
                </option>
              ))}
            </select>

            {usuariosSeleccionados.length > 0 && (
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                {usuariosSeleccionados.map((u) => (
                  <li key={u.id_usuario} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{u.nombre_u} - {u.nombre_s} - {u.email}</span>
                    <button
                      className="text-red-500 text-xs underline"
                      onClick={() => setUsuariosSeleccionados(prev => prev.filter(p => p.id_usuario !== u.id_usuario))}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* SELECCIÓN DE USUARIOS INVITADOS */}
          <div className="md:col-span-2">
            <label className="font-semibold block mb-1">Usuarios invitados</label>
            <select
              className="w-full border rounded p-2"
              onChange={(e) => {
                const seleccionado = usuarios.find((u) => u.id_usuario.toString() === e.target.value);
                if (seleccionado && !invitados.some(u => u.id_usuario === seleccionado.id_usuario)) {
                  setInvitados(prev => [...prev, seleccionado]);
                }
              }}
              defaultValue=""
            >
              <option value="">Selecciona un invitado</option>
              {usuarios.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {`${u.nombre_u.toUpperCase()} - ${u.nombre_s} - ${u.puesto}`}
                </option>
              ))}
            </select>

            {invitados.length > 0 && (
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                {invitados.map((u) => (
                  <li key={u.id_usuario} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{u.nombre_u} - {u.nombre_s} - {u.email}</span>
                    <button
                      className="text-red-500 text-xs underline"
                      onClick={() => setInvitados(prev => prev.filter(i => i.id_usuario !== u.id_usuario))}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>






          <div>
            <label className="font-semibold block mb-1">Asunto</label>
            <div className="flex gap-2 mb-4">
            <select
              className="w-full border rounded p-2"
              value={asunto_general}
              onChange={(e) => setAsuntoGeneral(e.target.value)}
            >
              <option value="">Selecciona un asunto</option>
              <option value="CONVOCATORIA">CONVOCATORIA</option>
              <option value="CANCELACIÓN DE CONVOCATORIA">CANCELACIÓN DE CONVOCATORIA</option>
            </select>
            </div>

            <div className="flex justify-center gap-4">
              <button
                className="bg-blue-600 text-white w-1/2 p-2 rounded"
                onClick={handleConvocar}
              >
                Enviar a comité
              </button>
              <button
                onClick={onClose}
                className="bg-red-500 text-white w-1/2 p-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalAdjudicar;