"use client";
import { useState, useEffect } from "react";
import { getEventosByConcurso } from "../peticiones_api/peticionCalendarioEventos";
import TablaCalendarioEventos from "./tablaCalendarioBase";
import AltaEvento from "./formularios/alta";
import Pie from "../pie";
import MenuPrincipal from "../menu";

const PageCalendarioEventos = () => {
    const [idConcurso, setIdConcurso] = useState<number | null>(null);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isAltaModalOpen, setIsAltaModalOpen] = useState(false);

    const cargarEventos = async (idConcurso: number) => {
        try {
        setLoading(true);
        const data = await getEventosByConcurso(idConcurso);
        setEventos(data);
        console.log(data);
        } catch (err) {
        setErrorMessage((err as Error).message);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        const id = sessionStorage.getItem("id_concurso_actual");
        if (id) {
          setIdConcurso(Number(id));
          cargarEventos(Number(id));
        }
      }, []);

      if (!idConcurso) {
        return <div className="p-4">No hay concurso seleccionado.</div>;
      }

    return (
        <div>
            <MenuPrincipal />
            <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
                <h1 className="text-2xl font-bold text-center mb-4">Calendario de Eventos</h1>

                <div className="flex justify-end mb-4">
                    <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => setIsAltaModalOpen(true)}
                    >
                    ➕ Nuevo Evento
                    </button>
                </div>

                {errorMessage && (
                    <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{errorMessage}</div>
                )}

                <TablaCalendarioEventos eventos={eventos} onReload={() => cargarEventos(idConcurso)} />

                {isAltaModalOpen && (
                    <AltaEvento idConcurso={idConcurso} onClose={() => {
                    setIsAltaModalOpen(false);
                    cargarEventos(idConcurso);
                    }} />
                )}    
            </div>
        </div>
    );
};

export default PageCalendarioEventos;
