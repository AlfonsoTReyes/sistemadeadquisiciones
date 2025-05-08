// app/usuarios/PageUsuarios.tsx
"use client";

import { useEffect, useState } from 'react';
import Menu from '../menu';
import AltaUsuario from './formularios/alta';
import Pie from '../pie';
import TablaUsuarios from './tableUsuarios';
import useUsuarios from './useUsuario';

export default function PageUsuarios() {
  const { usuarios, loading, error, fetchUsuarios } = useUsuarios();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div>
      <Menu />
      <div className="min-h-screen p-4" style={{ marginTop: 150 }}>
        <h1 className="text-2xl text-center font-bold mb-4">Lista de Usuarios</h1>
        <button onClick={openModal} className="bg-green-500 text-white p-2 rounded">
          Dar de alta nuevo usuario
        </button>

        {loading && <p>Cargando usuarios...</p>}
        {error && <p>Error: {error}</p>}

        <TablaUsuarios usuarios={usuarios} onUsuarioAdded={fetchUsuarios} />
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
}
