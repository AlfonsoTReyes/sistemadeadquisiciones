'use client';
import {useState } from 'react';
import ModificarUsuario from './formularios/modificar';
import ModificarContraseña from './formularios/modificarContraseña';

interface Usuario {
    id_usuario: number;
    nombre: string;
    email: string;
    nomina: string;
    password: string;
    rol: string;
    estatus: boolean;
    secretaria: string;
}

interface TablaUsuariosProps {
    usuarios: Usuario[];
    onUsuarioAdded: () => void;

}

const TablaUsuarios: React.FC<TablaUsuariosProps> = ({ usuarios, onUsuarioAdded }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false);
    const [usuarioAEditar, setUsuarioAEditar] = useState<number | null>(null);
    const [contraseñaEditar, setContraseñaAEditar] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const email = sessionStorage.getItem('userEmail') || '';

    const openEditModal = (id: number) => {
        setUsuarioAEditar(id);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setUsuarioAEditar(null);
        setIsEditModalOpen(false);
    };
    const openEditPassModal = (id: number) => {
        setContraseñaAEditar(id);
        setIsPassEditModalOpen(true);
    };
    const closeEditPassModal = () => {
        setContraseñaAEditar(null);
        setIsPassEditModalOpen(false);
    };

    const handleDeleteConfirmation = (id: number) => {
        setConfirmDeleteId(id); // Marca el id del usuario que se va a eliminar
    };

    const eliminarUsuario = async () => {
        if (confirmDeleteId === null) return;
        try {
          const res = await fetch(`/api/usuarios?id_usuario=${confirmDeleteId}&eliminar=true&email=${email}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Error al eliminar usuario');
        } catch (error) {
          console.error(error);
        } finally {
          setConfirmDeleteId(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border mt-4 table-auto">
                <thead className="bg-gray-800 text-white">
                <tr>
                    <th className="border px-4 py-2">Nombre</th>
                    <th className="border px-4 py-2">Correo</th>
                    <th className="border px-4 py-2">Rol</th>
                    <th className="border px-4 py-2">Secretaria</th>
                    <th className="border px-4 py-2">Estatus</th>
                    <th className="border px-4 py-2">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {usuarios.map((usuario) => (
                    <tr key={usuario.id_usuario}>
                    <td className="border px-4 py-2">{usuario.nombre}</td>
                    <td className="border px-4 py-2">{usuario.email}</td>
                    <td className="border px-4 py-2">{usuario.rol}</td>
                    <td className="border px-4 py-2">{usuario.secretaria}</td>
                    <td className="border px-4 py-2">{usuario.estatus ? "Activo" : "Inactivo"}</td>
                    <td className="border px-4 py-2">
                        <button onClick={() => openEditModal(usuario.id_usuario)} className="text-yellow-500 hover:underline">Editar</button>
                        <button onClick={() => openEditPassModal(usuario.id_usuario)} className="text-blue-500 hover:underline">Modificar contraseña</button>
                        <button onClick={() => handleDeleteConfirmation(usuario.id_usuario)} className="text-red-500 hover:underline">Eliminar</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>

        
              {isEditModalOpen && usuarioAEditar !== null && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <ModificarUsuario usuarioId={usuarioAEditar} onClose={closeEditModal} onUsuarioModificado={onUsuarioAdded} />
                  </div>
                </div>
              )}
        
              {isEditPassModalOpen && contraseñaEditar !== null && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <ModificarContraseña usuarioId={contraseñaEditar} onClose={closeEditPassModal} onConstraseñaModificado={onUsuarioAdded} />
                  </div>
                </div>
              )}
        
              {confirmDeleteId !== null && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h2 className="text-lg font-bold mb-4">¿Deseas eliminar este usuario?</h2>
                    <p>Una vez eliminado, no podrás recuperar al usuario.</p>
                    <div className="flex justify-between mt-6">
                      <button onClick={eliminarUsuario} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">Confirmar</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="bg-gray-500 text-white p-2 rounded hover:bg-blue-600">Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
        </div>
    );
};

export default TablaUsuarios;
