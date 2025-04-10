"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MenuPrincipal from "../menu";
import Pie from "../pie";
import TablaPreSuficiencia from "./tablaPreSuficiencia";
import { fetchSoliPreSuficiencia, fetchSoliSuficiencia } from "../peticiones_api/peticionPreSuficiencia";

const SolicitudPage = () => {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo") === "suf" ? "suf" : "pre";
  
  const [idSolicitud, setIdSolicitud] = useState<string | null>(null);
  const [detallesSolicitud, setDetallesSolicitud] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSecre, setUserSecre] = useState<string | null>(null);
  const [userSistema, setUserSistema] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const secre = sessionStorage.getItem("userSecre");
      const sistema = sessionStorage.getItem("userSistema");
      const storedId = sessionStorage.getItem("solicitudId");

      setUserSecre(secre);
      setUserSistema(sistema);
      if (storedId) setIdSolicitud(storedId);
      setSessionLoaded(true); // ✅ Indica que sessionStorage fue leído
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data;
      if (tipo === "suf") {
        data = await fetchSoliSuficiencia(tipo, userSecre, userSistema);
      } else {
        data = await fetchSoliPreSuficiencia(tipo, userSecre, userSistema);
      }
      setDetallesSolicitud(data);
    } catch (err) {
      console.error("error al obtener detalles de la solicitud:", err);
      setError("no se pudo cargar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Espera a que se cargue la sesión antes de llamar fetchData
  useEffect(() => {
    if (sessionLoaded && userSecre && userSistema) {
      fetchData();
    }
  }, [sessionLoaded, userSecre, userSistema, tipo, idSolicitud]);

  return (
    <div>
      <MenuPrincipal />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">
          {tipo === "suf" ? "Solicitudes de suficiencia" : "Solicitudes de pre-suficiencia"}
        </h1>

        {loading && <p>cargando solicitudes...</p>}
        {error && <p className="text-red-500">error: {error}</p>}

        {detallesSolicitud && (
          <TablaPreSuficiencia datos={detallesSolicitud} onPreSufi={fetchData} />
        )}
      </div>
      <Pie />
    </div>
  );
};

export default SolicitudPage;
