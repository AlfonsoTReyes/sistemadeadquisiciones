//06 DE DICIEMBRE DE 2024
import React, { useState, useEffect } from "react";
import bcrypt from 'bcryptjs'; //Se importa Bcrypt.js es una biblioteca para manejar el cifrado seguro de contraseñas.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; //Se importa FontAwesomeIcon es el componente React utilizado para mostrar los íconos de Font Awesome.
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; //Se importa estos íconos pertenecen al paquete de íconos sólidos de Font Awesome y son importados desde @fortawesome/free-solid-svg-icons.

//import { updateUser } from "./fetchUsuarios";

import { updateUser } from "../../peticiones_api/fetchUsuarios";



// Se define las propiedades que va a recibir los objetos declarados en la interfaz
interface ModificarContraseñaUsuarioProps {
  usuarioId: number; //Identificador único del usuario cuya contraseña se va a modificar.
  onClose: () => void; //Función que se ejecuta cuando el usuario cierra el formulario/modal.
  onConstraseñaModificado: () => void; //Función que notifica al componente padre cuando la contraseña ha sido actualizada exitosamente.
}

const ModificarContraseña: React.FC<ModificarContraseñaUsuarioProps> = ({usuarioId, onClose, onConstraseñaModificado }) => {
  const [password, setPassword] = useState(''); //Almacena la contraseña ingresada por el usuario.
  const [error, setError] = useState(''); //Mensaje de error si ocurre algún problema durante el proceso.
  const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito cuando la contraseña es cambiada correctamente.
  const [showPassword, setShowPassword] = useState(false); //Controla si la contraseña se muestra en texto plano o está oculta.
  const [isLoading, setIsLoading] = useState(false); //Indica si la operación de modificación está en progreso.
  const [emailUsuario, setEmailUsuario] = useState('');
  

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail') || '';
    setEmailUsuario(email);
  }, [usuarioId]);

  //Maneja los cambios en el campo de entrada de contraseña.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    //Actualiza el estado password con el valor ingresado por el usuario.
    if (name === 'password') setPassword(value);
  };
  //Alterna entre mostrar y ocultar la contraseña.
  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };
  //Lógica para enviar el formulario.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      //Cifra la contraseña con bcrypt.hash antes de enviarla al servidor.
      const hashedPassword = await bcrypt.hash(password, 10);
      const usuarioData = { id_usuario: usuarioId, password: hashedPassword, emailUsuario };
      //Envía una solicitud PUT al endpoint /api/empleados con el id_usuario del empleado y la contraseña cifrada.
     
      await updateUser(usuarioData);
      setSuccessMessage('Contraseña cambiada con éxito');
      onConstraseñaModificado();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    }finally{
      setIsLoading(false); //Botón deshabilitado mientras el proceso está en curso (isLoading).
    }
  };

  return (
    //Genera la estructura de la interfaz que se va a mostrar
    <div>
      <h1 className="text-lg font-bold mb-4"> Modificar contraseña</h1>
      {/* Muestra una superposición de carga solo cuando isLoading es true. */}
      {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="flex flex-col items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <p className="mt-2 text-white">Cargando...</p>
              </div>
            </div>
        )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4 relative">
          <label className="block text-gray-700 mb-2">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            {/* Cambia su icono y funcionalidad según el estado showPassword. */}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleInputChange}
              required
              className="border border-gray-300 p-2 rounded w-full pr-10" // Espacio a la derecha para el botón
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
        {/* Se muestra solo si hay un mensaje de éxito (successMessage) o error (error). */}
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
            > {/* Llama a la función onClose para cerrar el formulario. */}
              Cerrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModificarContraseña;
