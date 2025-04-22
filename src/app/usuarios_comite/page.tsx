"use client";

import { useEffect, useState } from "react";
import DynamicMenu from "../menu";
import Pie from "../pie";
import TablaUComite from "./tableUComite";
import { fetchOrdenesUsuario } from "../peticiones_api/peticionOrdenDia";

const ComitePage = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [userSistema, setUserSistema] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("userId");
    const sistema = sessionStorage.getItem("userSistema");

    if (stored && sistema ) {
      setIdUsuario(parseInt(stored));
      setUserSistema(sistema);
    }
  }, []);

  const fetchOrdenes = async () => {
    if (!idUsuario) return;

    setLoading(true);
    try {
      const data = await fetchOrdenesUsuario(idUsuario, userSistema); // <- Petición personalizada por usuario
      setOrdenes(data);
    } catch (err) {
      setError("No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idUsuario) fetchOrdenes();
  }, [idUsuario]);

  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">Cómites</h1>

        {loading && <p className="text-center">Cargando...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <TablaUComite ordenes={ordenes} />
      </div>
      <Pie />
    </div>
  );
};

export default ComitePage;
