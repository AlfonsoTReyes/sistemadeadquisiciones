'use client';
import { useState, useEffect } from 'react';
import Menu from '../menu_solicitante';
import Pie from '../../pie';
import TablaSolicitudes from './tablaDetalle';
import AltaSolicitud from './formularios/alta';

import { fetchSolicitudesDetalles } from './formularios/peticionSolicitudesDetalle';

const SolicitudPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idSolicitud, setIdSolicitud] = useState<string | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchSolicitudesData = async () => {
        setLoading(true);
        try {
            const data = await fetchSolicitudesDetalles();
            setSolicitudes(data);
            console.log(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudesData();
    }, []);

    useEffect(() => {
        const idSolicitud = sessionStorage.getItem("solicitudId");
        setIdSolicitud(idSolicitud);
      }, []);

    return (
        <div>
            <Menu />
            <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
                <h1 className="text-2xl text-center font-bold mb-4">Lista de Solicitudes {idSolicitud}</h1>

                <button onClick={openModal} className="bg-green-500 text-white p-2 rounded">
                    Dar de alta nueva solicitud
                </button>

                {loading && <p>Cargando solicitudes...</p>}
                {error && <p>Error: {error}</p>}

                <TablaSolicitudes solicitudes={solicitudes} onSolicitudAdded={fetchSolicitudesData} />

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <AltaSolicitud onClose={closeModal} onSolicitudAdded={fetchSolicitudesData} />
                        </div>
                    </div>
                )}
            </div>
            <Pie />
        </div>
    );
};

export default SolicitudPage;
