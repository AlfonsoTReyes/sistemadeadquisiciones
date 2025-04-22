"use client";

import { useEffect, useState } from "react";
import ModalParticipantes from "./modalparticipantes";
import ModalDetalleSolicitud from "./modalsolicitudes";
import ModalCambiarEstatusOrden from "./formularios/estatusorden";
import ModalEditarOrden from "./formularios/adjudicarGeneralEditat"; 
import AdjudicarPuntosEditar from "./formularios/adjudicarPuntosEditat";
import generarPDF from "../PDF/ordendia";
import generarPDFActa from "../PDF/dictamenordendia";

import ModalActaSesion from "./formularios/ModalActaSesion"; 

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

interface ActaSesion {
  id_acta: number;
  fecha_sesion: string;
  hora_inicio: string;
  hora_cierre: string | null;
  puntos_tratados: string[];
  asuntos_generales: string;
  estatus: string;
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
  estatus: "activa" | "cancelada" | "terminada";
  acta?: ActaSesion | null;
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
  const [mostrarModalCambiarEstatus, setMostrarModalCambiarEstatus] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false); // ✅ nuevo
  const [mostrarModalPuntos, setMostrarModalPuntos] = useState(false);
  const [mostrarModalActa, setMostrarModalActa] = useState(false);


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
        {ordenes.flatMap((orden) => {
          const ordenCard = (
            <div
              key={`orden-${orden.id_orden_dia}`}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-200 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold mb-2">Orden del día #{orden.id_orden_dia}</h3>
              <p><strong>Asunto:</strong> {orden.asunto_general}</p>
              <p><strong>Oficio:</strong> {orden.no_oficio}</p>
              <p><strong>Lugar:</strong> {orden.lugar}</p>
              <p><strong>Hora:</strong> {orden.hora}</p>
              <p><strong>Fecha:</strong> {new Date(orden.fecha_inicio).toLocaleDateString()}</p>
              <p><strong>Creación:</strong> {new Date(orden.created_at).toLocaleString()}</p>
  
              {orden.puntos_tratar?.length > 0 ? (
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
  
                {orden.estatus === "cancelada" && (
                  <button
                    onClick={() => {
                      setIdOrdenSeleccionada(orden.id_orden_dia);
                      setMostrarModalCambiarEstatus(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Cambiar estatus
                  </button>
                )}
  
                <button
                  onClick={() => generarPDF(orden.id_orden_dia)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Generar PDF
                </button>
  
                {!orden.acta && (
                  <>
                    <button
                      onClick={() => {
                        setIdOrdenSeleccionada(orden.id_orden_dia);
                        setMostrarModalPuntos(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Editar puntos y participantes
                    </button>
                    <button
                      onClick={() => {
                        setIdOrdenSeleccionada(orden.id_orden_dia);
                        setMostrarModalEditar(true);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                    onClick={() => {
                      setIdOrdenSeleccionada(orden.id_orden_dia);
                      setMostrarModalActa(true);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                  >
                    Crear acta de sesión
                  </button>
                  </>
                )}
              </div>
            </div>
          );
  
          const actaCard = orden.acta && (
            <div
              key={`acta-${orden.acta.id_acta}`}
              className="bg-gray-100 shadow-md rounded-xl p-6 border border-gray-300 hover:shadow-xl transition"
            >
              <h4 className="text-lg font-bold mb-2 text-gray-800">📄 Acta de Sesión #{orden.acta.id_acta}</h4>
              <p><strong>Fecha de sesión:</strong> {new Date(orden.acta.fecha_sesion).toLocaleDateString()}</p>
              <p><strong>Hora de inicio:</strong> {orden.acta.hora_inicio}</p>
              <p><strong>Hora de cierre:</strong> {orden.acta.hora_cierre || "Sin registrar"}</p>
              <p><strong>Asuntos generales:</strong> {orden.acta.asuntos_generales || "Sin registrar"}</p>
              <p><strong>Estatus:</strong>
                <span className={`ml-1 font-semibold ${orden.acta.estatus === "Pendiente" ? "text-yellow-600" : "text-green-600"}`}>
                  {orden.acta.estatus}
                </span>
              </p>
  
              {orden.acta.puntos_tratados?.length > 0 && (
                <div className="mt-2">
                  <strong>Puntos tratados:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {orden.acta.puntos_tratados.map((p: string, idx: number) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
  
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => {
                    setIdOrdenSeleccionada(orden.id_orden_dia);
                    setMostrarModalActa(true);
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                >
                  Editar acta
                </button>
  
                {orden.acta?.id_acta && (
                  <button
                    onClick={() => generarPDFActa(orden.acta!.id_acta)} // `!` le dice a TypeScript que sí existe
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Generar PDF
                  </button>
                )}

              </div>
            </div>
          );
  
          return actaCard ? [ordenCard, actaCard] : [ordenCard];
        })}
      </div>
  
      {/* Participantes */}
      {mostrarModal && idOrdenSeleccionada !== null && (
        <ModalParticipantes
          idOrdenDia={idOrdenSeleccionada}
          onClose={() => setMostrarModal(false)}
        />
      )}
  
      {/* Solicitud */}
      {mostrarModalSolicitud && idSolicitudSeleccionada && (
        <ModalDetalleSolicitud
          idSolicitud={idSolicitudSeleccionada}
          onClose={() => setMostrarModalSolicitud(false)}
        />
      )}
  
      {/* Estatus */}
      {mostrarModalCambiarEstatus && idOrdenSeleccionada !== null && (
        <ModalCambiarEstatusOrden
          idOrden={idOrdenSeleccionada}
          onClose={() => setMostrarModalCambiarEstatus(false)}
          onSuccess={() => {
            setMostrarModalCambiarEstatus(false);
            onActualizar();
          }}
        />
      )}
  
      {/* Editar orden */}
      {mostrarModalEditar && idOrdenSeleccionada !== null && (
        <ModalEditarOrden
          idOrden={idOrdenSeleccionada}
          onClose={() => setMostrarModalEditar(false)}
          onSuccess={() => {
            setMostrarModalEditar(false);
            onActualizar();
          }}
        />
      )}
  
      {/* Editar puntos */}
      {mostrarModalPuntos && idOrdenSeleccionada !== null && (
        <AdjudicarPuntosEditar
          idOrden={idOrdenSeleccionada}
          onClose={() => setMostrarModalPuntos(false)}
          onSuccess={() => {
            setMostrarModalPuntos(false);
            onActualizar();
          }}
        />
      )}
  
      {/* Crear o editar acta */}
      {mostrarModalActa && idOrdenSeleccionada !== null && (
        <ModalActaSesion
          idOrden={idOrdenSeleccionada}
          onClose={() => setMostrarModalActa(false)}
          onSuccess={() => {
            setMostrarModalActa(false);
            onActualizar();
          }}
        />
      )}
    </>
  );
  
  
};

export default TablaOrdenesDia;
