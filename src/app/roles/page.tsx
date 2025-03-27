'use client';
import { useState, useEffect } from 'react';
import Menu from '../menu';
import Pie from '../pie';
import AltaRol from './formularios/alta';
import TablaRoles from './tableRoles';
import { fetchRoles } from '../peticiones_api/fetchRoles';

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchRolesData = async () => {
        setLoading(true);
        try {
            const data = await fetchRoles();
            setRoles(data);
            console.log(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRolesData();
    }, []);

    return (
        <div>
            <Menu />
            <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
                <h1 className="text-2xl text-center font-bold mb-4">Lista de Roles</h1>

                <button onClick={openModal} className="bg-green-500 text-white p-2 rounded">
                    Dar de alta nuevo rol
                </button>

                {loading && <p>Cargando roles...</p>}
                {error && <p>Error: {error}</p>}

                <TablaRoles roles={roles} onRolAdded={fetchRolesData} />

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <AltaRol onClose={closeModal} onRolAdded={fetchRolesData} />
                        </div>
                    </div>
                )}
            </div>
            <Pie />
        </div>
    );
};

export default RolesPage;
