'use client';
import { useState } from 'react';
import ModificarUsuario from './formularios/modificar';
import ModificarContraseña from './formularios/modificarContraseña';
import EliminarUsuario from './formularios/eliminar'; // Importamos el nuevo componente
import useUsuarios from './useUsuario';

interface Usuario {
  id_usuario: number;
  nombre_u: string;
  apellidos:string;
  email: string;
  nomina: string;
  password: string;
  rol: string;
  estatus: boolean;
  nombre_s: string;
  nombre_d: string;
  puesto:string;
  sistema:string;
}

interface TablaUsuariosProps {
  usuarios: Usuario[];
  onUsuarioAdded: () => void;
}

const TablaUsuarios: React.FC<TablaUsuariosProps> = ({ usuarios, onUsuarioAdded }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false);
    const [usuarioAEditar, setUsuarioAEditar] = useState<number | null>(null);
    const [contraseñaEditar, setContraseñaAEditar] = useState<number | null>(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 10;
    const totalPaginas = Math.ceil(usuarios.length / registrosPorPagina);
    const indexUltimoRegistro = paginaActual * registrosPorPagina;
    const indexPrimerRegistro = indexUltimoRegistro - registrosPorPagina;
    const usuariosPaginados = usuarios.slice(indexPrimerRegistro, indexUltimoRegistro);

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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border mt-4 table-auto">
                <thead className="bg-gray-800 text-white">
                <tr>
                    <th className="border px-4 py-2">Nombre</th>
                    <th className="border px-4 py-2">Correo</th>
                    <th className="border px-4 py-2">Rol</th>
                    <th className="border px-4 py-2">Secretaria</th>
                    <th className="border px-4 py-2">Dependencia</th>
                    <th className="border px-4 py-2">Puesto</th>
                    <th className="border px-4 py-2">Estatus</th>
                    <th className="border px-4 py-2">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {usuarios.map((usuario) => (
                    <tr key={usuario.id_usuario}>
                    <td className="border px-4 py-2">{usuario.nombre_u} {usuario.apellidos}</td>
                    <td className="border px-4 py-2">{usuario.email}</td>
                    <td className="border px-4 py-2">{usuario.rol}</td>
                    <td className="border px-4 py-2">{usuario.nombre_s}</td>
                    <td className="border px-4 py-2">{usuario.nombre_d}</td>
                    <td className="border px-4 py-2">{usuario.puesto}</td>
                    <td className="border px-4 py-2">{usuario.estatus ? "Activo" : "Inactivo"}</td>
                    <td className="border px-4 py-2">
                        <button onClick={() => openEditModal(usuario.id_usuario)} className="text-yellow-500 hover:underline">Editar</button>
                        <button onClick={() => openEditPassModal(usuario.id_usuario)} className="text-blue-500 hover:underline">Modificar contraseña</button>
                        <button onClick={() => setConfirmDeleteId(usuario.id_usuario)} className="text-red-500 hover:underline">Eliminar</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4 space-x-2">
              <button 
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Anterior
              </button>
                <select 
                  value={paginaActual} 
                  onChange={(e) => setPaginaActual(Number(e.target.value))}
                  className="px-2 py-1 border rounded"
                >
                  {Array.from({ length: totalPaginas }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
              <button 
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>

            {isEditModalOpen && usuarioAEditar !== null && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <ModificarUsuario id_usuario={usuarioAEditar} onClose={closeEditModal} onUsuarioUpdated={onUsuarioAdded} />
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

            {/* <EliminarUsuario 
                usuarioId={confirmDeleteId} 
                onClose={() => setConfirmDeleteId(null)} 
                onDelete={eliminarUsuario} 
            /> */}
        </div>
    );
};

export default TablaUsuarios;
