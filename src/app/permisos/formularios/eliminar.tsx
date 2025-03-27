'use client';
import React, { useState } from 'react';
import { deletePermiso } from '../../peticiones_api/fetchPermisos';

interface EliminarPermisoProps {
  permisoId: number | null;
  onClose: () => void;
  fetchPermisos: () => void;
}

const EliminarPermiso: React.FC<EliminarPermisoProps> = ({ permisoId, onClose, fetchPermisos }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (permisoId === null) return null;

  const eliminarPermiso = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await deletePermiso(permisoId); // Ahora se pasa el ID correcto
      setSuccessMessage('Permiso eliminado correctamente.');
      
      setTimeout(() => {
        fetchPermisos(); // Refresca la lista después de eliminar
        onClose(); // Cierra el modal
      }, 1000);
      
    } catch (error) {
      setError('Hubo un error al eliminar el permiso.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-lg font-bold mb-4">¿Deseas eliminar este permiso?</h2>
        <p>Una vez eliminado, no podrás recuperarlo.</p>

        {isLoading && <p className="text-blue-500">Eliminando...</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-between mt-6">
          <button
            onClick={eliminarPermiso}
            disabled={isLoading}
            className={`p-2 rounded ${isLoading ? 'bg-gray-500' : 'bg-red-500 hover:bg-red-600'} text-white`}
          >
            {isLoading ? 'Eliminando...' : 'Confirmar'}
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white p-2 rounded hover:bg-blue-600">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EliminarPermiso;
