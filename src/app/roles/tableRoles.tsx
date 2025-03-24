'use client';
import { useState } from 'react';
import ModificarRol from './formularios/modificar';
import AsignarPermiso from './formularios/asignar'; //Formulario que permite asignar el rol de un usuario existente. 
import {fetchRoles} from './formularios/fetchRoles';

interface Rol {
    id_rol: number;
    nombre: string;
    descripcion: string;
    sistema: string;
}

interface TablaUsuariosProps {
  roles: Rol[];
  onRolAdded: () => void;
}

const TablaUsuarios: React.FC<TablaUsuariosProps> = ({ roles, onRolAdded }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); //Controlan los modales de edición.
    const [rolAEditar, setRolAEditar] = useState<number | null>(null);
    const [permisoAsignar, setPermisoAsignar] = useState<number | null>(null);
    const [isAsignarOpen, setIsAsignarOpen] = useState(false);

    //Abre el modal de edición para el rol especificado por su ID.
    const openEditModal = (id: number) => {
        setRolAEditar(id);
        setIsEditModalOpen(true);
    };
    //Cierra el modal
    const closeEditModal = () => {
        setRolAEditar(null);
        setIsEditModalOpen(false);
    };
    //Abre el modal de asignar rol para el usuario especificado por su ID.
    const openEditAsignar = (id: number) => {
        setPermisoAsignar(id);
        setIsAsignarOpen(true);
    }

    const closeEditAsignar = () =>{
        setPermisoAsignar(null);
        setIsAsignarOpen(false);
    }


    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border mt-4 table-auto">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="border px-4 py-2">Nombre</th>
                        <th className="border px-4 py-2">Descripcion</th>
                        <th className="border px-4 py-2">Sistema</th>
                        <th className="border px-4 py-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                {roles.map((rol) => (
                    <tr key={rol.id_rol}>
                        <td className="border px-4 py-2">{rol.nombre}</td>
                        <td className="border px-4 py-2">{rol.descripcion}</td>
                        <td className="border px-4 py-2">{rol.sistema}</td>
                        <td className="border px-4 py-2">
                            <button onClick={() => openEditModal(rol.id_rol)} className="text-yellow-800 hover:underline">
                                Editar
                            </button>
                            <br></br>
                            <button onClick={() => openEditAsignar(rol.id_rol)} className="text-orange-800 hover:underline">
                                Asignar permisos
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Abre el modal para Editar un Rol */}
            {isEditModalOpen && rolAEditar !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ModificarRol rolId={rolAEditar} onClose={closeEditModal} onRolModificado={onRolAdded} />
                    </div>
                </div>
            )}
            {/* Abre el modal para Asignar un Rol */}
            {isAsignarOpen && permisoAsignar !== null && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AsignarPermiso rolId={permisoAsignar} onClose={closeEditAsignar} onRolAsignar={onRolAdded} />
                    </div>
                </div>
            )}

        </div>
    );
};

export default TablaUsuarios;
