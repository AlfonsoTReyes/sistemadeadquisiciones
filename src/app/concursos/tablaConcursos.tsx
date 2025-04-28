"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ModificarConcurso from "./formularios/modificar"; // 👈 importa el formulario

interface Concurso {
  id_concurso: number;
  id_solicitud: number;
  id_dictamen: number;
  numero_concurso: string;
  nombre_concurso: string;
  tipo_concurso: string;
  estatus_concurso: string;
  fecha_creacion: string;
  fecha_fin: string;
}

const TablaConcursos: React.FC<{
  concursos: Concurso[];
  onConcursoUpdated: () => Promise<void>;
}> = ({ concursos, onConcursoUpdated }) => {
  const [filtroEstatus, setFiltroEstatus] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [idConcursoEditar, setIdConcursoEditar] = useState<number | null>(null); // 👈 estado para abrir ventana modificar
  const router = useRouter();

  const estatusUnicos = useMemo(() => {
    const uniques = new Set(concursos.map((c) => c.estatus_concurso.toLowerCase()));
    return Array.from(uniques);
  }, [concursos]);

  const concursosFiltrados = concursos.filter((c) => {
    const cumpleEstatus = filtroEstatus === "todos" || c.estatus_concurso.toLowerCase() === filtroEstatus;
    const fechaRef = new Date(c.fecha_creacion);
    const desdeOk = !fechaDesde || new Date(fechaDesde) <= fechaRef;
    const hastaOk = !fechaHasta || new Date(fechaHasta) >= fechaRef;
    return cumpleEstatus && desdeOk && hastaOk;
  });

  return (
    <div className="overflow-x-auto">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
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
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="border px-4 py-2">Identificador</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Tipo</th>
            <th className="border px-4 py-2">Solicitud</th>
            <th className="border px-4 py-2">Estatus</th>
            <th className="border px-4 py-2">Fecha Creación</th>
            <th className="border px-4 py-2">Fecha Fin</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {concursosFiltrados.map((c) => (
            <tr key={c.id_concurso}>
              <td className="border px-4 py-2">{c.numero_concurso}</td>
              <td className="border px-4 py-2">{c.nombre_concurso}</td>
              <td className="border px-4 py-2">{c.tipo_concurso}</td>
              <td className="border px-4 py-2">{c.id_solicitud}</td>
              <td className="border px-4 py-2">{c.estatus_concurso}</td>
              <td className="border px-4 py-2">
                {c.fecha_creacion ? c.fecha_creacion.split("T")[0] : "-"}
              </td>
              <td className="border px-4 py-2">
                {c.fecha_fin ? c.fecha_fin.split("T")[0] : "-"}
              </td>
              <td className="border px-4 py-2 space-y-1">
                <button
                  className="text-blue-700"
                  onClick={() => setIdConcursoEditar(c.id_concurso)}
                >
                  Editar
                </button>
                <br />
                <button className="text-red-700">Bases</button>
                <br />
                <button
                  className="text-yellow-700"
                  onClick={() => {
                    sessionStorage.setItem('id_concurso_actual', c.id_concurso.toString());
                    router.push("/calendario_bases");
                  }}
                >
                  Calendario de eventos
                </button>

                <br />
                <button className="text-dark-700">Enviar invitación a oferentes</button>
                <br />
                <button className="text-green-700">Estatus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Modificar */}
      {idConcursoEditar !== null && (
        <ModificarConcurso
          idConcurso={idConcursoEditar}
          onClose={() => setIdConcursoEditar(null)}
          onUpdated={onConcursoUpdated}
        />
      )}
    </div>
  );
};

export default TablaConcursos;
