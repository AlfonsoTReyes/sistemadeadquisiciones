"use client";
import { useState, useEffect } from "react";
import Pie from "../pie";
import TablaConcursos from "./tablaConcursos";
import MenuPrincipal from "../menu";
import AltaConcurso from "./formularios/alta";
import { fetchConcursos } from "../peticiones_api/peticionConcurso";

const ConcursoPage = () => {
  const [concursos, setConcursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAltaModalOpen, setIsAltaModalOpen] = useState(false);
  const [userSecre, setUserSecre] = useState<string | null>(null);
  const [userSistema, setUserSistema] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // ✅ Obtener valores de sessionStorage solo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const secre = sessionStorage.getItem("userSecre");
      const sistema = sessionStorage.getItem("userSistema");

      setUserSecre(secre);
      setUserSistema(sistema);
      setSessionLoaded(true); // ✅ Indicar que ya se leyeron
    }
  }, []);

  const getConcursos = async () => {
    if (!sessionLoaded || !userSecre || !userSistema) return; // ⛔ No ejecutar si aún no están disponibles
    setLoading(true);
    try {
      const data = await fetchConcursos(userSecre, userSistema); // ✅ Pasar secre y sistema
      setConcursos(data);
      console.log(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Llamar la función solo cuando sessionStorage haya sido leído
  useEffect(() => {
    if (sessionLoaded && userSecre && userSistema) {
      getConcursos();
    }
  }, [sessionLoaded, userSecre, userSistema]);

  return (
    <div>

      <MenuPrincipal />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">Lista de Concursos</h1>

        <div className="flex mb-4">
          <button
            onClick={() => setIsAltaModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
          >
            Nuevo Concurso
          </button>
        </div>

        {loading && <p>Cargando concursos...</p>}
        {error && <p>Error: {error}</p>}

        {sessionLoaded ? (
          <TablaConcursos concursos={concursos} onConcursoUpdated={getConcursos} />
        ) : (
          <p className="text-gray-500">Esperando datos de sesión...</p>
        )}

        {/* Modal de alta */}
        {isAltaModalOpen && (
              <AltaConcurso onClose={() => setIsAltaModalOpen(false)} onCreated={getConcursos} />
        )}
      </div>
      <Pie />
    </div>
  );
};

export default ConcursoPage;
