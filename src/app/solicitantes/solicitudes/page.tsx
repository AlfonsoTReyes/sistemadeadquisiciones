"use client";
import { useState, useEffect } from 'react';
import Menu from '../menu_solicitante';
import Pie from '../../pie';
import TablaSolicitudes from './tablaSolicitudes';
import AltaSolicitud from './formularios/alta';
import DynamicMenu from "../../dinamicMenu";
import { fetchSolicitudes } from '../../peticiones_api/peticionSolicitudes';

const SolicitudPage = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            setSessionLoaded(true); // ✅ Indica que sessionStorage fue leído
        }
    }, []);

    const fetchSolicitudesData = async () => {
        if (!sessionLoaded || !userSecre || !userSistema) return; // ⛔ No ejecutar si los valores aún no están listos
        setLoading(true);
        try {
            const data = await fetchSolicitudes(userSecre, userSistema);
            setSolicitudes(data);
            console.log("Solicitudes cargadas:", data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Llamar la función solo cuando sessionStorage haya sido leído
    useEffect(() => {
        if (sessionLoaded && userSecre && userSistema) {
            fetchSolicitudesData();
        }
    }, [sessionLoaded, userSecre, userSistema]);

    return (
        <div>
            <DynamicMenu />
            <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
                <h1 className="text-2xl text-center font-bold mb-4">Lista de Solicitudes</h1>

                <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white p-2 rounded">
                    Dar de alta nueva solicitud
                </button>

                {loading && <p>Cargando solicitudes...</p>}
                {error && <p>Error: {error}</p>}

                {sessionLoaded ? (
                    <TablaSolicitudes solicitudes={solicitudes} onSolicitudAdded={fetchSolicitudesData} />
                ) : (
                    <p className="text-gray-500">Esperando datos de sesión...</p>
                )}

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <AltaSolicitud onClose={() => setIsModalOpen(false)} onSolicitudAdded={fetchSolicitudesData} />
                        </div>
                    </div>
                )}
            </div>
            <Pie />
        </div>
    );
};

export default SolicitudPage;
