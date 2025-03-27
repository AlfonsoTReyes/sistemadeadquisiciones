import React, { useState } from "react";
import { createPermiso } from "../../peticiones_api/fetchPermisos"; // Importamos las peticiones

interface AltaPermisoProps {
  onClose: () => void;
  onPermisoAdded: () => void; // Agregamos la función para actualizar la lista de usuarios
}

const AltaPermiso: React.FC<AltaPermisoProps> = ({ onClose, onPermisoAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sistema, setSistema] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nombre') setNombre(value);
    else if (name === 'descripcion') setDescripcion(value);
    else if (name === 'sistema') setSistema(value);

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
  
    const permisoData = { nombre, descripcion, sistema};
    
    try {
      await createPermiso(permisoData);
      setSuccessMessage('Alta exitosa');
      onPermisoAdded();
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
    <div>
      <h1 className="text-lg font-bold mb-4">Alta de Permisos</h1>
      {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="flex flex-col items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <p className="mt-2 text-white">Cargando...</p>
              </div>
            </div>
        )}
      <form onSubmit={handleSubmit} className="mx-autos" >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label>Nombre: <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" required
              className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange}/>
          </div>

          <div className="mb-4">
            <label>Descripción: </label>
            <input type="text" name="descripcion" 
              className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange}/>
          </div>
          <div className="mb-4">
            <label className="block font-medium">Sistema: <span className="text-red-500">*</span></label>
            <select name="sistema" onChange={handleInputChange} className="w-full p-2 border rounded" required>
              <option value="">Selecciona el sistema</option>
              <option value="PROVEEDORES">PROVEEDORES</option>
              <option value="ADQUISICIONES">ADQUISICIONES</option>
              <option value="FINANZAS">FINANZAS</option>
            </select>
          </div>
        </div>
        {(successMessage || error) && (
            <div className={`p-4 mb-4 border-l-4 ${successMessage ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`} role="alert">
              {successMessage && <p className="font-bold">{successMessage}</p>}
              {error && <p className="font-bold">{error}</p>}
            </div>
        )}
        <div className="flex justify-between mt-6">
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
  );
};

export default AltaPermiso;