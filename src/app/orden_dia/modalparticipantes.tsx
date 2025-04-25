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

const ModalParticipantes: React.FC<ModalParticipantesProps> = ({
  idOrdenDia,
  onClose,
}) => {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipantes = async () => {
      try {
        const res = await fetch(`/api/ordendia?participantes=${idOrdenDia}`);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const base = (data[0]?.participantes_base || []).map((p: Participante) => ({
            ...p,
            tipo_usuario: "base" as const,
          }));
          
          const invitados = (data[0]?.usuarios_invitados || []).map((p: Participante) => ({
            ...p,
            tipo_usuario: "invitado" as const,
          }));
          

          setParticipantes([...base, ...invitados]);
        } else {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-center">
          Participantes - Orden #{idOrdenDia}
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center">Cargando participantes...</p>
        ) : participantes.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No hay participantes registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border text-sm text-left shadow-md rounded">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="border px-4 py-2">Nombre</th>
                  <th className="border px-4 py-2">Puesto</th>
                  <th className="border px-4 py-2">Tipo</th>
                  <th className="border px-4 py-2">¿Visto?</th>
                  <th className="border px-4 py-2">¿Confirmado?</th>
                  <th className="border px-4 py-2">Fecha de Visto</th>
                  <th className="border px-4 py-2">Fecha de Confirmación</th>
                </tr>
              </thead>
              <tbody>
                {participantes.map((p) => (
                  <tr key={`base-${p.id_usuario}-${p.id_confirmacion}`} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{p.nombre}</td>
                    <td className="border px-4 py-2">{p.puesto}</td>
                    <td className="border px-4 py-2 capitalize">{p.tipo_usuario}</td>
                    <td className="border px-4 py-2 text-center">
                      {p.fecha_visto ? "✅" : "❌"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {p.confirmado ? "✅" : "❌"}
                    </td>
                    <td className="border px-4 py-2">
                      {p.fecha_visto
                        ? new Date(p.fecha_visto).toLocaleString()
                        : "—"}
                    </td>
                    <td className="border px-4 py-2">
                      {p.fecha_confirmado
                        ? new Date(p.fecha_confirmado).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
