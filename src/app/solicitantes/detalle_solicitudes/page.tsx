"use client";
import { useState, useEffect } from 'react';
import DynamicMenu from "../../dinamicMenu";
import Pie from '../../pie';
import TablaSolicitudes from './tablaDetalle';
import AltaSolicitud from './formularios/alta';
import { fetchSolicitudesDetalles } from './formularios/peticionSolicitudesDetalle';
import { DetallesSolicitud } from "./interfaces";

const SolicitudPage = () => {
  const [idSolicitud, setIdSolicitud] = useState<string | null>(null);
  const [detallesSolicitud, setDetallesSolicitud] = useState<DetallesSolicitud | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // ✅ Solo lee sessionStorage cuando window esté disponible
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = sessionStorage.getItem("solicitudId");
      if (storedId) {
        setIdSolicitud(storedId);
      }
    }
  }, []);

  // ✅ Solo ejecuta cuando idSolicitud ya está disponible
  useEffect(() => {
    const fetchData = async () => {
      if (!idSolicitud) return;

      setLoading(true);
      try {
        const data = await fetchSolicitudesDetalles(idSolicitud);
        setDetallesSolicitud(data);
      } catch (err) {
        console.error("Error al obtener detalles de la solicitud:", err);
        setError("No se pudo cargar la solicitud.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idSolicitud]);

  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">Detalles de la solicitud</h1>

        {loading && <p>Cargando solicitudes...</p>}
        {error && <p>Error: {error}</p>}

        <TablaSolicitudes solicitudes={detallesSolicitud ?? { solicitud: null, justificacion: null, techoPresupuestal: null, documentos_adicionales: null }} onSolicitudAdded={fetchSolicitudesDetalles} />

      </div>
      <Pie />
    </div>
  );
};

export default SolicitudPage;
