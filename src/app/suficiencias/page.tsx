"use client";
import { useState, useEffect } from "react";
import MenuPrincipal from "../menu";
import Pie from "../pie";
import TablaPreSuficiencia from "./tablaPreSuficiencia";
import { fetchSoliPreSuficiencia } from "../peticiones_api/peticionPreSuficiencia";

const SolicitudPage = () => {
  const [idSolicitud, setIdSolicitud] = useState<string | null>(null);
  const [detallesSolicitud, setDetallesSolicitud] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedId = sessionStorage.getItem("solicitudId");
    if (storedId) setIdSolicitud(storedId);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchSoliPreSuficiencia();
      setDetallesSolicitud(data);
    } catch (err) {
      console.error("error al obtener detalles de la solicitud:", err);
      setError("no se pudo cargar la solicitud.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [idSolicitud]);

  return (
    <div>
      <MenuPrincipal />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">
          Solicitud de la pre - suficiencia
        </h1>

        {loading && <p>Cargando solicitudes de pre suficiencias...</p>}
        {error && <p className="text-red-500">error: {error}</p>}

        {detallesSolicitud && <TablaPreSuficiencia datos={detallesSolicitud} onPreSufi={fetchData}/>}
      </div>
      <Pie />
    </div>
  );
};

export default SolicitudPage;
