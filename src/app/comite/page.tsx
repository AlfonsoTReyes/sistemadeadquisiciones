"use client";
import { useEffect, useState } from "react";
import MenuPrincipal from "../menu";
import Pie from "../pie";
import TablaEventos from "./tablaComite";
import ModalEventoComite from "./formularios/alta";
import {
  fetchEventos,
  crearEvento,
  eliminarEvento,
} from "../peticiones_api/peticionEventos";

const CalendarioEventosPage = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(new Date().toISOString().slice(0, 16));

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await fetchEventos();
      setEventos(data || []);
    } catch (err) {
      setError("No se pudieron cargar los eventos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const handleNuevoEvento = () => {
    setEventoSeleccionado(null);
    setFechaSeleccionada(new Date().toISOString().slice(0, 16));
    setIsModalOpen(true);
  };


  return (
    <div>
      <MenuPrincipal />
      <div className="min-h-screen p-4" style={{ marginTop: 120 }}>
        <h1 className="text-2xl text-center font-bold mb-4">Calendario de eventos del comité</h1>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 mb-4"
          onClick={handleNuevoEvento}
        >
          Registrar evento
        </button>

        {loading && <p>Cargando eventos...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && (
            <TablaEventos
                eventos={eventos}
                onEventoCambiado={cargarEventos}
            />

        )}

        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                <ModalEventoComite
                    evento={eventoSeleccionado}
                    fechaSeleccionada={fechaSeleccionada}
                    onClose={() => setIsModalOpen(false)}
                    onSaveSuccess={() => {
                        setIsModalOpen(false);
                        cargarEventos();
                    }}
                />

                </div>
            </div>
        )}
      </div>
      <Pie />
    </div>
  );
};

export default CalendarioEventosPage;
