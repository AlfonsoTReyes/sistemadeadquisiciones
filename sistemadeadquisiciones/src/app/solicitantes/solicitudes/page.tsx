'use client';
import { useState, useEffect } from 'react';
import Menu from '../menu_solicitante';
import Pie from '../../pie';
import TablaSolicitudes from './tablaSolicitudes';
import AltaSolicitud from './formularios/alta';
import DynamicMenu from "../../dinamicMenu";


import { fetchSolicitudes } from './formularios/peticionSolicitudes';

const SolicitudPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userSecre = sessionStorage.getItem("userSecre");
    const userSistema = sessionStorage.getItem("userSistema");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchSolicitudesData = async () => {
        setLoading(true);
        try {
            const data = await fetchSolicitudes(userSecre, userSistema);
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

    return (
        <div>
            <DynamicMenu />
            <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
                <h1 className="text-2xl text-center font-bold mb-4">Lista de Solicitudes</h1>

                <button onClick={openModal} className="bg-green-500 text-white p-2 rounded">
                    Dar de alta nueva solicitud
                </button>

                {loading && <p>Cargando solicitudes... {userSecre}</p>}
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
