"use client";

import { useState, useEffect } from "react";
import DynamicMenu from "../menu";
import Pie from "../pie";
import TablaSolicitudes from "./tableOrdenDia";
import ModalAdjudicar from "./formularios/adjudicar";
import { fetchOrdenesDia } from "../peticiones_api/peticionOrdenDia";

const SolicitudPage = () => {
  const [idSolicitud, setIdSolicitud] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hayOrdenActiva, setHayOrdenActiva] = useState<boolean>(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = sessionStorage.getItem("solicitudId");
      if (storedId) {
        setIdSolicitud(storedId);
      }
    }
  }, []);

  const fetchData = async () => {
    if (!idSolicitud) return;
  
    setLoading(true);
    try {
      const data = await fetchOrdenesDia(idSolicitud);
  
      if (data.length === 0) {
        setError("No hay órdenes del día registradas."); // ⬅️ Mensaje especial
        setOrdenes([]); // Limpias ordenes
        setHayOrdenActiva(false);
      } else {
        setOrdenes(data);
  
        const existeActiva = data.some(
          (orden: any) => orden.estatus !== "Cancelada" && orden.estatus !== "Terminada"
        );
        setHayOrdenActiva(existeActiva);
      }
    } catch (err: any) {
      console.error("Error al obtener las órdenes del día:", err.message || err);
      setError("Error al obtener las órdenes del día."); // ⬅️ Solo error real
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    fetchData();
  }, [idSolicitud]);

  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">Órdenes del día</h1>

        {loading && <p className="text-center">Cargando órdenes...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="flex justify-end mb-4">
          {hayOrdenActiva ? (
            <p className="text-red-600 font-semibold text-sm bg-red-100 px-4 py-2 rounded shadow border border-red-300">
              Ya existe una orden del día activa. Solo puedes crear una nueva si la anterior fue cancelada o terminada.
            </p>
          ) : (
            <button
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Nueva orden del día
            </button>
          )}
        </div>

        <TablaSolicitudes ordenes={ordenes} onActualizar={fetchData} />
      </div>

      {isModalOpen && (
        <ModalAdjudicar
          idSolicitud={parseInt(idSolicitud!)}
          onClose={closeModal}
          onSuccess={fetchData}
        />
      )}

      <Pie />
    </div>
  );
};

export default SolicitudPage;
