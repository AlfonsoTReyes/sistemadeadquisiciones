import React, { useState, useEffect } from 'react';
import { getPermisoById, updatePermiso } from './fetchPermisos';

interface ModificarPermisoProps {
  permisoId: number; // ID del usuario que se va a modificar
  onClose: () => void;
  onPermisoModificado: () => void; // Para notificar al componente padre que el usuario fue modificado
}

const ModificarPermiso: React.FC<ModificarPermisoProps> = ({ permisoId, onClose, onPermisoModificado }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sistema, setSistemas] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchRol = async () => {
      try {
        
        setIsLoading(true);
        const data = await getPermisoById(permisoId);
        setNombre(data.nombre_permiso || '');
        setDescripcion(data.descripcion || '');
        setSistemas(data.sistema || ''); 
      } catch (err) {
        console.log(err)
        setError((err as Error).message);
      }finally {
        setIsLoading(false);
      }
    };

    fetchRol();
  }, [permisoId]);

  // Manejar la modificación del usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const permisoData = { id_permiso: permisoId, nombre, descripcion, sistema};

    try {
      await updatePermiso(permisoData);
      setSuccessMessage('Modificación exitosa');
      onPermisoModificado();
      setTimeout(() => {
        onClose();
      }, 1000); 
    } catch (err) {
      setError((err as Error).message);
    }finally{
      setIsLoading(false);
    }

  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4 text-center">Modificar Permisos</h2>
        {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="flex flex-col items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <p className="mt-2 text-white">Cargando...</p>
              </div>
            </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb">
            <label className="block mb-2">Nombre: <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded" required/>
          </div>

          <div className="mb">
            <label className="block mb-2">Descripción:</label>
            <input type="text" name="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-2 border rounded"/>
          </div>
          <div className="mb">
            <label className="block mb-2">Sistema: <span className="text-red-500">*</span></label>
            <select 
              name="sistemas" 
              value={sistema || ''} // 👈 Asegurar siempre un valor
              onChange={(e) => setSistemas(e.target.value)}
              className="w-full p-2 border rounded" 
              required
              >
              <option value="">Selecciona el sistema</option>
              <option value="PROVEEDORES">PROVEEDORES</option>
              <option value="ADQUISICIONES">ADQUISICIONES</option>
              <option value="FINANZAS">FINANZAS</option>
            </select>
          </div>


          {(successMessage || error) && (
            <div className={`p-4 mb-4 border-l-4 ${successMessage ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`} role="alert">
              {successMessage && <p className="font-bold">{successMessage}</p>}
              {error && <p className="font-bold">{error}</p>}
            </div>
          )}
          <div className="flex justify-between mt-4">
            <button
                type="submit"
                disabled={isLoading} // Deshabilitar botón mientras carga
                className={`w-1/2 p-2 rounded ${isLoading ? 'bg-gray-500' : 'bg-blue-500'} text-white`}
              >
                {isLoading ? 'Cargando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white p-2 rounded w-1/2 hover:bg-red-600"
              >
                Cerrar
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModificarPermiso;
