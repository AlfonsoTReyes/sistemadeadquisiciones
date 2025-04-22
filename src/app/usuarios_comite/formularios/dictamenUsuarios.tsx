"use client";
import React, { useEffect, useState } from "react";
import { obtenerActaPorOrden } from "@/services/actaService";

const ModalDictamen = ({ idOrdenDia, onClose }: { idOrdenDia: number; onClose: () => void }) => {
  const [acta, setActa] = useState<any>(null);
  const { data: session } = useSession();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      const data = await obtenerActaPorOrden(idOrdenDia);
      setActa(data);
      setCargando(false);
    };
    cargarDatos();
  }, [idOrdenDia]);

  const usuarioYaFirmo = acta?.asistentes?.some((a: any) => a.id_usuario === session?.user?.id && a.firma);

  if (cargando) return <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">Cargando dictamen...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">📄 Dictamen</h2>

        <p><strong>Asunto:</strong> {acta?.asuntos_generales}</p>
        <p><strong>Fecha:</strong> {new Date(acta?.fecha_sesion).toLocaleDateString()}</p>
        <p><strong>Puntos tratados:</strong></p>
        <ul className="list-disc pl-6">
          {acta?.puntos_tratados?.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        <hr className="my-4" />

        <h3 className="font-semibold mb-2">🧑‍🤝‍🧑 Participantes</h3>
        <ul>
          {acta?.asistentes?.map((a: any, idx: number) => (
            <li key={idx} className="text-sm">
              {a.usuario?.nombre} {a.usuario?.apellidos} — 
              <span className={a.firma ? "text-green-600" : "text-red-600"}>
                {a.firma ? " ✅ Firmado" : " ❌ Sin firma"}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-3 mt-6">
          {!usuarioYaFirmo && (
            <>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Firmar
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Pedir corrección
              </button>
            </>
          )}
          <button onClick={onClose} className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500 text-white">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDictamen;
