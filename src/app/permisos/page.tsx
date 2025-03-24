'use client';
import { useEffect, useState } from 'react';
import Menu from '../menu';
import Pie from '../pie';
import AltaPermiso from './formularios/alta';
import ModificarPermiso from './formularios/modificar';
import TablaPermisos from './tablePermisos';
import { fetchPermisos } from './formularios/fetchPermisos';


interface Permiso {
    id_permiso: number;
    nombre_permiso: string;
    descripcion: string;
    sistema: string;
}

const PermisosPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [permisoAEditar, setPermisoAEditar] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const openEditModal = (id: number) => {
        setPermisoAEditar(id);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setPermisoAEditar(null);
        setIsEditModalOpen(false);
    };

    const fetchPermisosData = async () => {
        setLoading(true);
        try {
            const data = await fetchPermisos();
            setPermisos(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermisosData();
    }, []);

//   useEffect(() => {
//     fetchPermisos();
//     const role = sessionStorage.getItem('userRole');
//     const permisos = sessionStorage.getItem('userPermissions');
//     if (permisos) setPermissions(JSON.parse(permisos));
//   }, []);

//   if (!permissions || permissions.length === 0) {
//     return (
//       <div className="bg-custom-color text-white w-full p-4 text-center">
//         <p>No tienes acceso al sistema. Por favor, contacta al administrador.</p>
//       </div>
//     );
//   }

  return (
    <div>
        <Menu />
            <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
                <h1 className="text-2xl text-center font-bold mb-4">Lista de Permisos</h1>
                {/* {permissions.includes('agregar_permiso') && ( */}
                    <button onClick={openModal} className="bg-green-500 text-white p-2 rounded">
                        Dar de alta nuevo permiso
                    </button>
                {/* )} */}
                {loading && <p>Cargando Permisos...</p>}
                {error && <p>Error: {error}</p>}
                
                <TablaPermisos 
                permisos={permisos} 
                onEdit={openEditModal} 
                fetchPermisos={fetchPermisosData} 
                permissions={permissions} 
                />

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <AltaPermiso onClose={closeModal} onPermisoAdded={fetchPermisosData} />
                        </div>
                    </div>
                )}

                {isEditModalOpen && permisoAEditar !== null && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <ModificarPermiso permisoId={permisoAEditar} onClose={closeEditModal} onPermisoModificado={fetchPermisosData} />
                        </div>
                    </div>
                )}
            </div>
        <Pie />
    </div>
  );
};

export default PermisosPage;
