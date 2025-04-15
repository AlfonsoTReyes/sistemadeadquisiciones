
import React, { useState } from "react";
import { createRol } from "../../peticiones_api/fetchRoles"; // Importamos las peticiones

//Se declara la interfaz para definir las propiedades que debe de tener los objetos
interface AltaRolProps {
  onClose: () => void; //Se utiliza para cerrar el formulario o modal. El componente AltaRol la invoca cuando el usuario desea cancelar la operación o cerrar la ventana.
  onRolAdded: () => void; //Notifica al componente padre que un rol ha sido agregado exitosamente. 
}

const AltaRol: React.FC<AltaRolProps> = ({ onClose, onRolAdded }) => { //Utiliza React para construir el componente y manejar el estado interno.
  const [isLoading, setIsLoading] = useState(false); //Indica si la operación de creación del usuario está en curso.
  const [nombre, setNombre] = useState('');//Capturan los valores de los campos del formulario.
  const [descripcion, setDescripcion] = useState('');//Capturan los valores de los campos del formulario.
  const [sistema, setSistemas] = useState('');//Capturan los valores de los campos del formulario.
  const [error, setError] = useState<string | null>(null); //Almacena mensajes de error en caso de fallos.
  const [successMessage, setSuccessMessage] = useState(''); //Mensaje que se muestra si la operación fue exitosa.

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nombre') setNombre(value);
    else if (name === 'descripcion') setDescripcion(value);
    else if (name === 'sistema') setSistemas(value);

  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
  
    const rolData = { nombre, descripcion, sistema};
    try {
      await createRol(rolData);
      setSuccessMessage('Alta exitosa');
      onRolAdded();
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
    //Genera la estructura para que el usuario pueda agregar un nuevo usuario al sistema
    <div>
      <h1 className="text-lg font-bold mb-4">Alta de Rol</h1>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Cargando...</p> {/* Un indicador de carga aparece mientras se realiza el registro. */}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mx-autos" >
        {/* Inputs y select para roles */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label>Nombre: <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" required
              className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange}/>
          </div>
          <div className="mb-4">
            <label>Descripcion: <span className="text-red-500">*</span></label>
            <input type="text" name="descripcion" required
              className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange}/>
          </div>
          <div className="mb-4">
            <label className="block font-medium">Sistema: <span className="text-red-500">*</span></label>
            <select name="sistema" onChange={handleInputChange} className="w-full p-2 border rounded" required>
              <option value="">Selecciona el sistema</option>
              <option value="PROVEEDORES">PROVEEDORES</option>
              <option value="ADQUISICIONES">ADQUISICIONES</option>
              <option value="FINANZAS">FINANZAS</option>
              <option value="COMITE">COMITE</option>
            </select>
          </div>
        </div>
        {/* Errores y mensajes */}
        {(successMessage || error) && (
            <div className={`p-4 mb-4 border-l-4 ${successMessage ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`} role="alert">
              {successMessage && <p className="font-bold">{successMessage}</p>}
              {error && <p className="font-bold">{error}</p>}
            </div>
        )}
        <div className="flex justify-between mt-6">
        {/* Botones */}
        <button
              type="submit"
              disabled={isLoading} // Deshabilitar botón mientras carga
              className={`w-1/2 p-2 rounded ${isLoading ? 'bg-gray-500' : 'bg-blue-500'} text-white`}
            >
              {isLoading ? 'Cargando...' : 'Guardar'} {/* Envío del formulario, deshabilitado durante la carga. */}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 text-white p-2 rounded w-1/2 hover:bg-red-600"
            > {/* Permite cancelar la operación y cerrar el formulario. */}
              Cerrar
            </button>
        </div>
      </form>
    </div>
  );
};

export default AltaRol;