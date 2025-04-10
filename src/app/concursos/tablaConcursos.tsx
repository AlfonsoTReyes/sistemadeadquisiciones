"use client";
import { useState, useMemo } from "react";
import ModificarSolicitud from "./formularios/modificar";
import Link from "next/link";
import ModalConfirmacion from "../detalle_solicitudes/formularios/modificarEstatus";
import ModalFirmaEnvio from "./formularios/firmar";

interface Solicitud {
  id_solicitud: number;
  nomina_solicitante: string;
  secretaria: string;
  motivo: string;
  fecha_solicitud: string;
  estatus: string;
  id_adjudicacion: number;
  folio: string;
  fecha_aprobacion: string | null;
  id_usuario: number;
  monto: number;
  tipo_adquisicion: string;
  dependencia: string;
}

const TablaSolicitudes: React.FC<{
  solicitudes: Solicitud[];
  onSolicitudAdded: () => Promise<void>;
}> = ({ solicitudes, onSolicitudAdded }) => {
  const [solicitudAEditar, setSolicitudAEditar] = useState<number | null>(null);
  const [solicitudAAprobar, setSolicitudAAprobar] = useState<number | null>(null);
  const [tipoOrigenModal, setTipoOrigenModal] = useState<string>("");
  const [isFirmaModalOpen, setIsFirmaModalOpen] = useState(false);
  const [solicitudAFirmar, setSolicitudAFirmar] = useState<number | null>(null);
  const [filtroSecretaria, setFiltroSecretaria] = useState<string>("todas");
  const [filtroEstatus, setFiltroEstatus] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const secretarias = useMemo(() => {
    const uniques = new Set(solicitudes.map((s) => s.secretaria));
    return Array.from(uniques);
  }, [solicitudes]);

  const estatusUnicos = useMemo(() => {
    const uniques = new Set(solicitudes.map((s) => s.estatus.toLowerCase()));
    return Array.from(uniques);
  }, [solicitudes]);

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const cumpleSecretaria = filtroSecretaria === "todas" || s.secretaria === filtroSecretaria;
    const cumpleEstatus = filtroEstatus === "todos" || s.estatus.toLowerCase() === filtroEstatus;

    const fechaReferencia = new Date(s.fecha_solicitud);
    const desdeOk = !fechaDesde || new Date(fechaDesde) <= fechaReferencia;
    const hastaOk = !fechaHasta || new Date(fechaHasta) >= fechaReferencia;

    return cumpleSecretaria && cumpleEstatus && desdeOk && hastaOk;
  });

  return (
    <div className="overflow-x-auto">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <label className="font-semibold mr-2">Secretaría:</label>
          <select
            value={filtroSecretaria}
            onChange={(e) => setFiltroSecretaria(e.target.value)}
            className="border rounded p-2"
          >
            <option value="todas">Todas</option>
            {secretarias.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold mr-2">Estatus:</label>
          <select
            value={filtroEstatus}
            onChange={(e) => setFiltroEstatus(e.target.value)}
            className="border rounded p-2"
          >
            <option value="todos">Todos</option>
            {estatusUnicos.map((est) => (
              <option key={est} value={est}>
                {est.charAt(0).toUpperCase() + est.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold mr-2">Desde:</label>
          <input type="date" className="border rounded p-2" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold mr-2">Hasta:</label>
          <input type="date" className="border rounded p-2" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
        </div>
      </div>

      {/* Tabla */}
      <table className="min-w-full border table-auto">
        <thead className="bg-yellow-600 text-white">
          <tr>
            <th className="border px-4 py-2">Folio</th>
            <th className="border px-4 py-2">Solicitante</th>
            <th className="border px-4 py-2">Secretaría</th>
            <th className="border px-4 py-2">Motivo</th>
            <th className="border px-4 py-2">Fecha</th>
            <th className="border px-4 py-2">Monto</th>
            <th className="border px-4 py-2">Estatus</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudesFiltradas.map((s) => (
            <tr key={s.id_solicitud}>
              <td className="border px-4 py-2">{s.folio}</td>
              <td className="border px-4 py-2">{s.nomina_solicitante}</td>
              <td className="border px-4 py-2">{s.secretaria}</td>
              <td className="border px-4 py-2">{s.motivo}</td>
              <td className="border px-4 py-2">
                {new Date(
                  ["cancelada", "terminada"].includes(s.estatus.toLowerCase())
                    ? s.fecha_aprobacion || s.fecha_solicitud
                    : s.fecha_solicitud
                ).toLocaleString("es-MX")}
              </td>
              <td className="border px-4 py-2">${s.monto.toLocaleString()}</td>
              <td className="border px-4 py-2 capitalize">{s.estatus}</td>
              <td className="border px-4 py-2 space-y-1">
                {!["en revisión", "aprobada"].includes(s.estatus.toLowerCase()) && (
                  <>
                    <button
                      onClick={() => {
                        setSolicitudAFirmar(s.id_solicitud);
                        setIsFirmaModalOpen(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Firmar y enviar
                    </button>
                    <br />
                    <button
                      onClick={() => setSolicitudAEditar(s.id_solicitud)}
                      className="text-yellow-600 hover:underline"
                    >
                      Editar
                    </button>
                    <br />
                  </>
                )}
                <button
                  onClick={() => {
                    setSolicitudAAprobar(s.id_solicitud);
                    setTipoOrigenModal("suficiencia");
                    setIsFirmaModalOpen(false);
                  }}
                  className="text-red-700 hover:underline"
                >
                  Cambiar estatus
                </button>
                <br />
                <Link
                  className="text-orange-500 hover:underline"
                  href="./detalle_solicitudes"
                  onClick={() => sessionStorage.setItem("solicitudId", s.id_solicitud.toString())}
                >
                  Detalle de solicitudes
                </Link>
                <br />
                {["en revisión", "aprobada"].includes(s.estatus.toLowerCase()) && (
                  <Link
                    className="text-gray-700 hover:underline"
                    href="./detalle_solicitudes"
                    onClick={() => sessionStorage.setItem("solicitudId", s.id_solicitud.toString())}
                  >
                    Detalle de comité
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modales */}
      {solicitudAEditar && (
        <ModificarSolicitud idSolicitud={solicitudAEditar} onClose={() => setSolicitudAEditar(null)} onSolicitudUpdated={onSolicitudAdded} />
      )}

      {solicitudAAprobar && tipoOrigenModal && (
        <ModalConfirmacion
          idDoc={solicitudAAprobar}
          tipoOrigen={tipoOrigenModal}
          onClose={() => setSolicitudAAprobar(null)}
          onUpdateSuccess={onSolicitudAdded}
        />
      )}

      {isFirmaModalOpen && solicitudAFirmar !== null && (
        <ModalFirmaEnvio idSolicitud={solicitudAFirmar} onClose={() => setIsFirmaModalOpen(false)} onSuccess={onSolicitudAdded} />
      )}
    </div>
  );
};

export default TablaSolicitudes;
