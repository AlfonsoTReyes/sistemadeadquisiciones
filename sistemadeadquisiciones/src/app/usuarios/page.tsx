'use client';
import { useEffect, useState } from 'react';
import Menu from '../menu';
import AltaUsuario from './formularios/alta';
import Pie from '../pie';
import TablaUsuarios from './tableUsuarios'; // Importamos la tabla

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

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchUsuarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error('Error al obtener usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchUsuarios();
      setEmail(sessionStorage.getItem('userEmail') || '');
    }, []);

    return (
      <div>
        <Menu />
        <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
            <h1 className="text-2xl text-center font-bold mb-4">Lista de Usuarios</h1>
            <button onClick={openModal} className="bg-green-500 text-white p-2 rounded">Dar de alta nuevo usuario</button>
            
            {loading && <p>Cargando usuarios...</p>}
            {error && <p>Error: {error}</p>}
            
            {/* Aquí llamamos al componente de la tabla */}
            <TablaUsuarios 
              usuarios={usuarios} 
              onUsuarioAdded={fetchUsuarios}
            />
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <AltaUsuario onClose={closeModal} onUsuarioAdded={fetchUsuarios} />
            </div>
          </div>
        )}
        <Pie />
      </div>
    );
};

export default UsuariosPage;
