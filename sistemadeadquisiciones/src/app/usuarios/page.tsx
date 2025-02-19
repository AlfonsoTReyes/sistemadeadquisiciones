// 06 DE DICIEMBRE DE 2024
'use client';
import { useEffect, useState } from 'react';
import Menu from '../menu'; //Importa el menú de navegación principal de la aplicación.
import AltaUsuario from './formularios/alta'; //Importa un formulario reutilizable que permite registrar un nuevo usuario. 
import ModificarUsuario from './formularios/modificar'; //Formulario que permite editar la información de un usuario existente. 
import ModificarContraseña from './formularios/modificarContraseña';  //Importa un formulario específico para modificar la contraseña de un usuario.
import Pie from '../pie'; //Importa un componente que representa el pie de página de la aplicación.
// import { rolesConfig } from '../../context/PermissionsContext';

// Se crea la interfaz donde se almacena los datos a mostrar en la tabla, y que se utilizarán para el mapeo
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
//Se define un componente de React llamado UsuariosPage, 
//encargado de gestionar las operaciones relacionadas con usuarios en un sistema.
const UsuariosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); //Controlan los modales de edición.
  const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false); //Controlan los modales de edición de la contraseña.
  const [usuarioAEditar, setUsuarioAEditar] = useState<number | null>(null);
  const [contraseñaEditar, setContraseñaAEditar] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null); //Almacena el ID del usuario a eliminar.
  const [permissions, setPermissions] = useState<string[]>([]); //Controla los permisos de usuario.
  const [email, setEmail] = useState('');


  //Controlan el modal para agregar usuarios.
  const openModal = () => { setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); };

  //Abre el modal de edición para el usuario especificado por su ID.
  const openEditModal = (id: number) => {
    setUsuarioAEditar(id);
    setIsEditModalOpen(true);
  };

  //Cierra el modal
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

  // Recupera la lista de usuarios desde la API.
  const fetchUsuarios = async () => {
    setLoading(true); //Muestra un indicador de carga (loading).
    setError(null); //Si ocurre un error, lo almacena en error.
    try {
      //Llama al endpoint /api/usuarios para obtener los datos.
      const response = await fetch('/api/usuarios');
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      const data = await response.json();
      setUsuarios(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  //Marca al usuario que se desea eliminar almacenando su id en confirmDeleteId.
  const handleDeleteConfirmation = (id: number) => {
    setConfirmDeleteId(id); // Marca el id del usuario que se va a eliminar
  };

  //Elimina al usuario marcado mediante una solicitud DELETE al endpoint /api/usuarios.
  const eliminarUsuario = async () => {
    if (confirmDeleteId === null) return; // Si no hay usuario para eliminar, no hacer nada
    try {
      const res = await fetch(`/api/usuarios?id_usuario=${confirmDeleteId}&eliminar=true&email=${email}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar usuario');

      await fetchUsuarios(); // Refrescar la lista después de la eliminación
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmDeleteId(null); // Restablece el estado de confirmación de eliminación
    }
  };

  //Efectos secundarios como la obtención de datos de la API.
  useEffect(() => {
    fetchUsuarios();
    const role = sessionStorage.getItem('userRole');
    const permisos = sessionStorage.getItem('userPermissions');
    const email = sessionStorage.getItem('userEmail') || '';
    setEmail(email);
    if (permisos) {
      setPermissions(JSON.parse(permisos));
    }
  }, []);


  // Si los permisos son los correctos da acceso al sistema
  return (
    <div>
      <Menu />{/* Manda a llamar al componente MENU (Es el menú de navegación) */} 
      <div className="min-h-screen p-4" style={{marginTop: 150}}>
        <h1 className="text-2xl text-center font-bold mb-4">Lista de Usuarios</h1>
        {/* Comprueba si el administrador tiene el permiso agregar_usuarios antes de mostrar el botón. */}
        
        <button onClick={openModal} className="bg-green-500 text-white p-2 rounded">
          Dar de alta nuevo usuario
        </button>
        

        {loading && <p>Cargando usuarios...</p>} {/* Carga los datos de los usuarios y muestra un mensaje */}
        {error && <p>Error: {error}</p>}{/* Mostrar un mensaje de error si ocurre un problema. */}
        {/* Estructura de la tabla que se muestra en la interfaz */}
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
              {/* Se realiza un mapeo para traer todos los datos de la api de los usuarios */}
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td className="border px-4 py-2">{usuario.nombre}</td>
                  <td className="border px-4 py-2">{usuario.email}</td>
                  <td className="border px-4 py-2">{usuario.rol}</td>
                  <td className="border px-4 py-2">{usuario.secretaria}</td>
                  <td className="border px-4 py-2">{usuario.estatus ? "Activo" : "Inactivo"}</td>

                  <td className="border px-4 py-2">
                    {/* Comprueba si el administrador tiene el permiso editar_usuarios antes de mostrar el botón. */}
                    
                    <button onClick={() => openEditModal(usuario.id_usuario)} className="text-yellow-500 hover:underline">
                      Editar
                    </button>
                    
                    <br></br>
                    {/* Comprueba si el administrador tiene el permiso editar_contraseña antes de mostrar el botón. */}
                    
                    <button onClick={() => openEditPassModal(usuario.id_usuario)} className="text-blue-500 hover:underline">
                      Modificar contraseña
                    </button>
                    
                    <br></br>
                    {/* Comprueba si el administrador tiene el permiso borrar_usuarios antes de mostrar el botón. */}
                    
                    <button onClick={() => handleDeleteConfirmation(usuario.id_usuario)} className="text-red-500 hover:underline">
                      Eliminar
                    </button>
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Abre el modal para registrar un nuevo usuario. */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Ejecuta fetchUsuarios tras el registro exitoso. */}
            <AltaUsuario onClose={closeModal} onUsuarioAdded={fetchUsuarios} />
          </div>
        </div>
      )}
      {/* Abre el modal para Editar un Usuario */}
      {isEditModalOpen && usuarioAEditar !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ModificarUsuario usuarioId={usuarioAEditar} onClose={closeEditModal} onUsuarioModificado={fetchUsuarios} />
          </div>
        </div>
      )}
      {/* Abre el modal para Editar la Contraseña del Usuario */}
      {isEditPassModalOpen && contraseñaEditar !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ModificarContraseña usuarioId={contraseñaEditar} onClose={closeEditPassModal} onConstraseñaModificado={fetchUsuarios} />
          </div>
        </div>
      )}
      {/* Abrir el modal para eliminar a un usuario donde tiene el id del mismo. 
        Muestra un mensaje para confirmar la eliminación del usuario */}
      {confirmDeleteId !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-lg font-bold mb-4" >¿Deseas eliminar este usuario?</h2>
            <p>Una vez eliminado, no podrás recuperar al usuario.</p>
            <div className="flex justify-between mt-6">
              <button onClick={eliminarUsuario} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                Confirmar
              </button>
              <button onClick={() => setConfirmDeleteId(null)} className="bg-gray-500 text-white p-2 rounded hover:bg-blue-600">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Se llama el componente Pie que se mostrará en la página */}
      <Pie />
    </div>
  );
};

export default UsuariosPage;