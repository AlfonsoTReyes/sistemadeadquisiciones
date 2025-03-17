import React, { useState, useEffect } from "react";

// props para manejar la ventana modal de confirmación
interface ConfirmDeleteProps {
  usuarioId: string; // identificador único del usuario cuya contraseña se va a modificar
  onClose: () => void; // función que se ejecuta cuando se cierra el modal
  onDeleteConfirmed: () => void; // función que se ejecuta cuando el usuario confirma la eliminación
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteProps> = ({ usuarioId, onClose, onDeleteConfirmed }) => {
  const [isLoading, setIsLoading] = useState(false); // indica si está en proceso de eliminación
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // mensaje de error
  const [emailUsuario, setEmailUsuario] = useState('');
  
  // Cargar modelos y roles al montar el componente
  useEffect(() => {
    const email = sessionStorage.getItem('userEmail') || '';
    setEmailUsuario(email);
  }, []);
  

  // función para manejar la confirmación de la eliminación
  const handleDelete = async () => {
    
    setIsLoading(true); // inicia el estado de carga
    setErrorMessage(null); // resetea cualquier error previo
    try {
      // aquí corregimos la construcción de la url
      const response = await fetch(`/api/usuarios?usuarioId=${usuarioId}&email=${emailUsuario}`, { method: "DELETE" });
  
      if (!response.ok) {
        // si la respuesta no es exitosa, lanza un error con el mensaje de la api
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el usuario");
      }
  
      // eliminación exitosa
      onDeleteConfirmed(); // confirma la eliminación
      onClose(); // cierra el modal
    } catch (error: any) {
      // maneja errores y muestra el mensaje en el modal
      setErrorMessage(error.message || "Error al eliminar el usuario");
    } finally {
      setIsLoading(false); // finaliza el estado de carga
    }
  };
  

  return (
    <div>
      {/* superposición de fondo para el modal */}
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4">¿Deseas dar de baja (eliminar) este usuario?</h2>
          <p>una vez eliminado, no podrás recuperar al usuario.</p>

          {/* mensaje de error si ocurre un problema */}
          {errorMessage && (
            <div className="bg-red-100 text-red-800 border border-red-400 p-2 rounded mt-4">
              {errorMessage}
            </div>
          )}

          {/* mensaje de carga si está en proceso de eliminación */}
          {isLoading && (
            <div className="mt-4 flex justify-center items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="ml-2">eliminando...</p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {/* botón de confirmación */}
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-1/2"
              disabled={isLoading}
            >
              {isLoading ? "eliminando..." : "confirmar"}
            </button>
            {/* botón de cancelación */}
            <button
              onClick={onClose}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 w-1/2"
              disabled={isLoading}
            >
              cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
