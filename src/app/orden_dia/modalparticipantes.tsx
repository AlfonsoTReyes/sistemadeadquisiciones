"use client";

import { useEffect, useState } from "react";

interface Participante {
  id_confirmacion: number;
  id_orden_dia: number;
  id_usuario: number;
  nombre: string;
  puesto: string;
  confirmado: boolean;
  observaciones: string | null;
  fecha_visto: string | null;
  fecha_confirmado: string | null;
  tipo_usuario: "base" | "invitado";
}

interface ModalParticipantesProps {
    idOrdenDia: number;
    onClose: () => void;  
}

const ModalParticipantes: React.FC<ModalParticipantesProps> = ({ idOrdenDia, onClose }) => {
    const [participantes, setParticipantes] = useState<Participante[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParticipantes = async () => {
          try {
            const res = await fetch(`/api/ordendia?participantes=${idOrdenDia}`);
            const data = await res.json();

            console.log(data);
            if (Array.isArray(data)) {
              setParticipantes(data);
            } else {
              console.warn("Respuesta inesperada:", data);
              setParticipantes([]);
            }
          } catch (error) {
            console.error("Error al obtener participantes:", error);
            setParticipantes([]);
          } finally {
            setLoading(false);
          }
        };
      
        fetchParticipantes();
      }, [idOrdenDia]);
      

    const base = participantes.filter((p) => p.tipo_usuario === "base");
    const invitados = participantes.filter((p) => p.tipo_usuario === "invitado");

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Participantes - Orden #{idOrdenDia}</h2>

            {loading ? (
            <p className="text-gray-500">Cargando participantes...</p>
            ) : (
            <>
                {/* PARTICIPANTES BASE */}
                <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Usuarios de base</h3>
                {base.length === 0 ? (
                    <p className="text-sm text-gray-500">Ninguno registrado.</p>
                ) : (
                    <ul className="space-y-2">
                    {base.map((p) => (
                        <li key={p.id_confirmacion} className="bg-gray-100 rounded p-3">
                        <p><strong>Nombre:</strong> {p.nombre}</p>
                        <p><strong>Puesto:</strong> {p.puesto}</p>
                        <p><strong>Confirmado:</strong> {p.confirmado ? "✅ Sí" : "❌ No"}</p>
                        <p><strong>Visto:</strong> {p.fecha_visto ? new Date(p.fecha_visto).toLocaleString() : "—"}</p>
                        <p><strong>Confirmado el:</strong> {p.fecha_confirmado ? new Date(p.fecha_confirmado).toLocaleString() : "—"}</p>
                        {p.observaciones && <p><strong>Observaciones:</strong> {p.observaciones}</p>}
                        </li>
                    ))}
                    </ul>
                )}
                </div>

                {/* USUARIOS INVITADOS */}
                <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Usuarios invitados</h3>
                {invitados.length === 0 ? (
                    <p className="text-sm text-gray-500">Ninguno registrado.</p>
                ) : (
                    <ul className="space-y-2">
                    {invitados.map((p) => (
                        <li key={p.id_confirmacion} className="bg-gray-50 rounded p-3">
                        <p><strong>Nombre:</strong> {p.nombre}</p>
                        <p><strong>Puesto:</strong> {p.puesto}</p>
                        <p><strong>Confirmado:</strong> {p.confirmado ? "✅ Sí" : "❌ No"}</p>
                        <p><strong>Visto:</strong> {p.fecha_visto ? new Date(p.fecha_visto).toLocaleString() : "—"}</p>
                        <p><strong>Confirmado el:</strong> {p.fecha_confirmado ? new Date(p.fecha_confirmado).toLocaleString() : "—"}</p>
                        {p.observaciones && <p><strong>Observaciones:</strong> {p.observaciones}</p>}
                        </li>
                    ))}
                    </ul>
                )}
                </div>
            </>
            )}

            <div className="text-center mt-6">
            <button
                onClick={onClose}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
                Cerrar
            </button>
            </div>
        </div>
        </div>
    );
};

export default ModalParticipantes;
