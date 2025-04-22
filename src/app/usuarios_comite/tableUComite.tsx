"use client";

import React, { useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

import ModalParticipantes from "../orden_dia/modalparticipantes";
import ModalDetalleSolicitud from "../orden_dia/modalsolicitudes";
import ModalComentarioOrden from "./formularios/comentariosOrden";
import ModalConfirmarRecibido from "./formularios/confirmarRecibido";
import ModalDictamen from "./formularios/dictamenUsuarios";

const animatedComponents = makeAnimated();

interface OrdenDia {
  id_orden_dia: number;
  id_solicitud: number;
  no_oficio: string;
  asunto_general: string;
  fecha_inicio: string;
  lugar: string;
  hora: string;
  estatus: string;
  nomenclatura: string;
  tipo_evento: string;
  confirmado: boolean;
}

interface OpcionSelect {
  value: string;
  label: string;
  key: string;
}

const TablaUComite: React.FC<{ ordenes: OrdenDia[] }> = ({ ordenes }) => {
  const [ordenActiva, setOrdenActiva] = useState<OrdenDia | null>(null);
  const [modal, setModal] = useState<"" | "confirmar" | "solicitud" | "participantes" | "comentario" | "dictamen">("");

  const [filtroAsunto, setFiltroAsunto] = useState<OpcionSelect | null>(null);
  const [filtroNomenclatura, setFiltroNomenclatura] = useState<OpcionSelect | null>(null);
  const [filtroEstatus, setFiltroEstatus] = useState<OpcionSelect | null>(null);
  const [filtroFecha, setFiltroFecha] = useState<OpcionSelect | null>(null);

  const abrirModal = (orden: OrdenDia, tipo: typeof modal) => {
    setOrdenActiva(orden);
    setModal(tipo);
  };

  const cerrarModal = () => {
    setOrdenActiva(null);
    setModal("");
  };

  const opcionesUnicas = (campo: keyof OrdenDia): OpcionSelect[] =>
    Array.from(new Set(ordenes.map((o) => o[campo])))
      .filter(Boolean)
      .map((val, idx) => ({
        value: val as string,
        label: val as string,
        key: `${campo}-${val}-${idx}`,
      }));

  const ordenesFiltradas = ordenes.filter((o) => {
    return (
      (!filtroAsunto || o.asunto_general === filtroAsunto.value) &&
      (!filtroNomenclatura || o.nomenclatura === filtroNomenclatura.value) &&
      (!filtroEstatus || o.estatus === filtroEstatus.value) &&
      (!filtroFecha || o.fecha_inicio === filtroFecha.value)
    );
  });

  if (!ordenes || ordenes.length === 0) {
    return <p className="text-center text-gray-500">No estás asignado a ninguna orden del día.</p>;
  }

  return (
    <>
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 mb-4 bg-white rounded shadow">
        <div>
          <label className="block font-semibold text-sm mb-1">🔍 Filtrar por Asunto</label>
          <Select<OpcionSelect>
            options={opcionesUnicas("asunto_general")}
            value={filtroAsunto}
            onChange={setFiltroAsunto}
            placeholder="Selecciona un asunto"
            components={animatedComponents}
            isClearable
            getOptionValue={(option) => option.key}
          />
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1">🗂️ Filtrar por Nomenclatura</label>
          <Select<OpcionSelect>
            options={opcionesUnicas("nomenclatura")}
            value={filtroNomenclatura}
            onChange={setFiltroNomenclatura}
            placeholder="Selecciona nomenclatura"
            components={animatedComponents}
            isClearable
            getOptionValue={(option) => option.key}
          />
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1">✅ Filtrar por Estatus</label>
          <Select<OpcionSelect>
            options={opcionesUnicas("estatus")}
            value={filtroEstatus}
            onChange={setFiltroEstatus}
            placeholder="Selecciona estatus"
            components={animatedComponents}
            isClearable
            getOptionValue={(option) => option.key}
          />
        </div>
        <div>
          <label className="block font-semibold text-sm mb-1">📅 Filtrar por Fecha</label>
          <Select<OpcionSelect>
            options={opcionesUnicas("fecha_inicio")}
            value={filtroFecha}
            onChange={setFiltroFecha}
            placeholder="Filtrar por Fecha"
            components={animatedComponents}
            isClearable
            getOptionValue={(option) => option.key}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-yellow-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Oficio</th>
              <th className="px-4 py-2 text-left">Asunto</th>
              <th className="px-4 py-2 text-left">Lugar</th>
              <th className="px-4 py-2 text-left">Nomenclatura</th>
              <th className="px-4 py-2 text-left">Fecha y hora</th>
              <th className="px-4 py-2 text-left">Estatus</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ordenesFiltradas.map((orden) => (
              <tr key={orden.id_orden_dia}>
                <td className="px-4 py-2">{orden.no_oficio}</td>
                <td className="px-4 py-2">{orden.asunto_general}</td>
                <td className="px-4 py-2">{orden.lugar}</td>
                <td className="px-4 py-2">{orden.nomenclatura} - {orden.tipo_evento}</td>
                <td className="px-4 py-2">{new Date(orden.fecha_inicio).toLocaleDateString()} - {orden.hora}</td>
                <td className="px-4 py-2 font-semibold text-green-700">{orden.estatus}</td>
                <td className="px-4 py-2 text-sm space-y-1">
                  {!orden.confirmado && (
                    <button
                      onClick={() => abrirModal(orden, "confirmar")}
                      className="text-red-500 hover:underline block"
                    >
                      Confirmar recibido
                    </button>
                  )}
                  <button
                    onClick={() => abrirModal(orden, "solicitud")}
                    className="text-blue-500 hover:underline block"
                  >
                    Ver la solicitud
                  </button>
                  <button
                    onClick={() => abrirModal(orden, "participantes")}
                    className="text-dark-500 hover:underline block"
                  >
                    Ver participantes
                  </button>
                  <button
                    onClick={() => abrirModal(orden, "comentario")}
                    className="text-pink-500 hover:underline block"
                  >
                    Hacer observación
                  </button>

                  <button
                    onClick={() => abrirModal(orden, "dictamen")}
                    className="text-purple-600 hover:underline block"
                  >
                    Ver dictamen
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {modal === "confirmar" && ordenActiva && (
        <ModalConfirmarRecibido
          idOrdenDia={ordenActiva.id_orden_dia}
          onClose={cerrarModal}
        />
      )}
      {modal === "solicitud" && ordenActiva && (
        <ModalDetalleSolicitud
          idSolicitud={ordenActiva.id_solicitud}
          onClose={cerrarModal}
        />
      )}
      {modal === "participantes" && ordenActiva && (
        <ModalParticipantes
          idOrdenDia={ordenActiva.id_orden_dia}
          onClose={cerrarModal}
        />
      )}
      {modal === "comentario" && ordenActiva && (
        <ModalComentarioOrden
          idOrdenDia={ordenActiva.id_orden_dia}
          onClose={cerrarModal}
        />
      )}
      {modal === "dictamen" && ordenActiva && (
        <ModalDictamen
          idOrdenDia={ordenActiva.id_orden_dia}
          onClose={cerrarModal}
        />
      )}
    </>
  );
};

export default TablaUComite;
