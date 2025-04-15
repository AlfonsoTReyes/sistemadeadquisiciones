"use client";

import { useEffect, useState } from "react";
import ModalParticipantes from "./modalparticipantes"; // debes crear este componente
import ModalDetalleSolicitud from "./modalsolicitudes"; // opcional si quieres mostrar info de solicitud

interface Participante {
  id_usuario: number;
  nombre: string;
  email: string;
  puesto: string;
  confirmado: boolean;
  fecha_visto: string | null;
  fecha_confirmado: string | null;
  observaciones: string | null;
}

interface OrdenDia {
  id_orden_dia: number;
  id_solicitud: number;
  asunto_general: string;
  no_oficio: string;
  lugar: string;
  hora: string;
  puntos_tratar: string[];
  participantes_base: Participante[];
  usuarios_invitados: Participante[];
  created_at: string;
  fecha_inicio: string;
}

interface TablaOrdenesDiaProps {
  ordenes: OrdenDia[];
  onActualizar: () => void;
}

const TablaOrdenesDia: React.FC<TablaOrdenesDiaProps> = ({ ordenes, onActualizar }) => {
  const [permisos, setPermisos] = useState<string[]>([]);
  const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalSolicitud, setMostrarModalSolicitud] = useState(false);
  const [idSolicitudSeleccionada, setIdSolicitudSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    const storedPermisos = sessionStorage.getItem("userPermissions");
    if (storedPermisos) {
      setPermisos(JSON.parse(storedPermisos));
    }
  }, []);

  if (!ordenes || ordenes.length === 0) {
    return <p className="text-center text-gray-500">No hay órdenes del día registradas.</p>;
  }

  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordenes.map((orden) => (
            <div
                key={orden.id_orden_dia}
                className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-xl transition"
            >
                <h3 className="text-xl font-bold mb-2">Orden del día #{orden.id_orden_dia}</h3>
                <p><strong>Asunto:</strong> {orden.asunto_general}</p>
                <p><strong>Oficio:</strong> {orden.no_oficio}</p>
                <p><strong>Lugar:</strong> {orden.lugar}</p>
                <p><strong>Hora:</strong> {orden.hora}</p>
                <p><strong>Fecha:</strong> {new Date(orden.fecha_inicio).toLocaleDateString()}</p>
                <p><strong>Creación:</strong> {new Date(orden.created_at).toLocaleString()}</p>

                {Array.isArray(orden.puntos_tratar) && orden.puntos_tratar.length > 0 ? (
                <div className="mt-2">
                    <strong>Puntos a tratar:</strong>
                    <ul className="list-disc list-inside">
                    {orden.puntos_tratar.map((p, idx) => <li key={idx}>{p}</li>)}
                    </ul>
                </div>
                ) : (
                <p className="mt-2 italic text-gray-500">Sin puntos registrados</p>
                )}

                <div className="flex flex-col gap-2 mt-4">
                <button
                    onClick={() => {
                        setIdOrdenSeleccionada(orden.id_orden_dia);
                        setMostrarModal(true);
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Ver participantes
                </button>



                <button
                    onClick={() => {
                    setIdSolicitudSeleccionada(orden.id_solicitud);
                    setMostrarModalSolicitud(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Ver solicitud
                </button>
                </div>
            </div>
            ))}
        </div>

        {mostrarModal && idOrdenSeleccionada !== null && (
            <ModalParticipantes
                idOrdenDia={idOrdenSeleccionada}
                onClose={() => setMostrarModal(false)}
        />
        )}

        {mostrarModalSolicitud && idSolicitudSeleccionada && (
            <ModalDetalleSolicitud
            idSolicitud={idSolicitudSeleccionada}
            onClose={() => setMostrarModalSolicitud(false)}
            />
        )}
    </>
  );
};

export default TablaOrdenesDia;
