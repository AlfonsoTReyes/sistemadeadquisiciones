"use client";
import React, { useEffect, useState } from "react";
import { obtenerActaPorOrden } from "../../peticiones_api/peticionActaSesion";
import ModalConfirmarFirma from "./confirmaFirma";
import ModalSolicitarCorreccion from "./correccion";

const ModalDictamen = ({
  idOrdenDia,
  onClose,
}: {
  idOrdenDia: number;
  onClose: () => void;
}) => {
  const [acta, setActa] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [modalFirmaVisible, setModalFirmaVisible] = useState(false);
  const [modalCorreccionVisible, setModalCorreccionVisible] = useState(false);

  useEffect(() => {
    const storedId = sessionStorage.getItem("userId");
    if (storedId) setUserId(parseInt(storedId));
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const data = await obtenerActaPorOrden(idOrdenDia);
        setActa(data);
      } catch (error) {
        console.error("❌ Error al cargar el acta:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [idOrdenDia]);

  const usuarioYaFirmo = acta?.asistentes?.some(
    (a: any) => a.id_usuario === userId && a.firma
  );

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
        Cargando dictamen...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4">📄 Dictamen</h2>

        <p><strong>Asunto:</strong> {acta?.asuntos_generales}</p>
        <p><strong>Fecha:</strong> {new Date(acta?.fecha_sesion).toLocaleDateString("es-MX")}</p>

        <p><strong>Puntos tratados:</strong></p>
        <ul className="list-disc pl-6 mb-4">
          {acta?.puntos_tratados?.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        <h3 className="font-semibold mb-2">🧑‍🤝‍🧑 Participantes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-300 mb-4">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Nombre</th>
                <th className="border px-4 py-2">Puesto</th>
                <th className="border px-4 py-2">Correo</th>
                <th className="border px-4 py-2">Firma</th>
              </tr>
            </thead>
            <tbody>
              {acta?.asistentes?.map((a: any, idx: number) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">{a.nombre} {a.apellidos}</td>
                  <td className="border px-4 py-2">{a.puesto}</td>
                  <td className="border px-4 py-2">{a.email}</td>
                  <td className="border px-4 py-2">
                    <span className={a.firma ? "text-green-600" : "text-red-600"}>
                      {a.firma ? "✅ Firmado" : "❌ Sin firma"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!usuarioYaFirmo && (
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => setModalFirmaVisible(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Firmar
            </button>

            <button
              onClick={() => setModalCorreccionVisible(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Pedir corrección
            </button>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-500 text-white"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* ✅ Modal Confirmar Firma */}
      {modalFirmaVisible && (
        <ModalConfirmarFirma
          idUsuario={userId!}
          idActa={acta.id_acta}
          onSuccess={async () => {
            setModalFirmaVisible(false);
            const dataActualizada = await obtenerActaPorOrden(idOrdenDia);
            setActa(dataActualizada);
          }}
          onCancel={() => setModalFirmaVisible(false)}
        />
      )}

      {/* ✅ Modal Pedir Corrección */}
      {modalCorreccionVisible && (
        <ModalSolicitarCorreccion
          idUsuario={userId!}
          idActa={acta.id_acta}
          onSuccess={() => {
            setModalCorreccionVisible(false);
            onClose(); // opcional
          }}
          onCancel={() => setModalCorreccionVisible(false)}
        />
      )}
    </div>
  );
};

export default ModalDictamen;
