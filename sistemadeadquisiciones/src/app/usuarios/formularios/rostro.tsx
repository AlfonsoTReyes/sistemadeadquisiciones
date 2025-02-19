//06 DE DICIEMBRE DE 2024
import React, { useState, useEffect, useRef } from "react";
import bcrypt from "bcryptjs"; //Se importa Bcrypt.js es una biblioteca para manejar el cifrado seguro de contraseñas.
import * as faceapi from "face-api.js"; //Se importa Face API es una biblioteca para reconocimiento y análisis facial basada en TensorFlow.js.
import * as tf from '@tensorflow/tfjs'; //Se importa TensorFlow.js es una biblioteca de aprendizaje automático que permite ejecutar modelos en JavaScript.

//Se declara la interfaz para definir las propiedades que debe de tener los objetos
interface AltaUsuarioProps {
    usuarioId: number; //Identificador único del usuario que se va a modificar.
    onClose: () => void; //Callback para cerrar el modal después de completar la operación.
    onUsuarioModificado: () => void; // Callback que se ejecuta cuando se modifica correctamente el usuario, para actualizar la vista padre.
}

//Este componente gestiona la creación de Usuarios. Utiliza un enfoque basado en estados para 
// manejar la interacción del usuario y los datos.
const AltaUsuario: React.FC<AltaUsuarioProps> = ({ usuarioId, onClose, onUsuarioModificado }) => {//Utiliza React para construir el componente y manejar el estado interno.
  const [isLoading, setIsLoading] = useState(false);//Indica si la operación de creación del usuario está en curso.
  const [error, setError] = useState(""); //Almacena mensajes de error en caso de fallos.
  const [successMessage, setSuccessMessage] = useState(""); //Mensaje que se muestra si la operación fue exitosa.
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [descriptor, setDescriptor] = useState<number[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [emailUsuario, setEmailUsuario] = useState('');
  

  // Cargar modelos y roles al montar el componente
  useEffect(() => {
    const email = sessionStorage.getItem('userEmail') || '';
    setEmailUsuario(email);
    const initialize = async () => {
      await loadFaceApiModels();
    };
    initialize();
  }, []);

  // Cargar los modelos de Face API
  const loadFaceApiModels = async () => {
    try {
      setIsLoadingModels(true);
      const MODEL_URL = "/models"; // Ruta donde se encuentran los modelos
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setIsLoadingModels(false);
      console.log("Modelos cargados correctamente.");
    } catch (err) {
      console.error("Error al cargar los modelos de Face API:", err);
      setError(`Error al cargar los modelos: ${err instanceof Error ? err.message : "Error desconocido"}`);
    }
  };
  

  // Iniciar la cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error al iniciar la cámara:", err);
      setError("No se pudo iniciar la cámara");
    }
  };

  // Capturar descriptor facial
  const captureDescriptor = async () => {
    setIsLoading(true);
    if (isLoadingModels) {
      return; // Detiene la ejecución si los modelos no han sido cargados
    }
    if (!videoRef.current) return;
    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections?.descriptor) {
        setIsLoading(false);
        setDescriptor(Array.from(detections.descriptor));
        alert("Rostro capturado exitosamente");
      } else {
        setIsLoading(false);
        setError("No se pudo capturar el rostro. Intente nuevamente.");
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Error durante la detección facial:", err);
      setError("Ocurrió un error durante la detección facial. Intente nuevamente.");
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage('');
    setIsLoading(true);

    if (!descriptor) {
      setIsLoading(false);
      setError("Debes capturar tu rostro antes de continuar.");
      return;
    }
    try {
      const usuarioData = {
        id_usuario: usuarioId, descriptor, emailUsuario
      };
      //Valida y envía los datos del empleado mediante una solicitud POST a la API (/api/empleados).
      const response = await fetch("/api/rostro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioData),
      });
      if (!response.ok) {
        setIsLoading(false);
        //Maneja posibles errores y muestra mensajes de éxito o error según el caso.
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Error al crear el usuario. Contacte con el administrador');
      }
      setSuccessMessage("Alta exitosa de usuario");
      onUsuarioModificado();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error al crear el usuario:", err);
      setError((err as Error).message);
    }finally{
      setIsLoading(false);
    }
  };

  return (
    //Genera la estructura para que el usuario pueda agregar un nuevo usuario al sistema
    <div>
      <h1 className="text-lg font-bold mb-4">Rostro de Usuario</h1>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Cargando...</p>{/* Un indicador de carga aparece mientras se realiza el registro. */}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mx-auto">
        {/* Cámara y captura */}
        <div className="mb-4">
          <label>Captura tu rostro: <span className="text-red-500">*</span></label>
          <div>
            <video ref={videoRef} autoPlay muted width="640" height="480" className="border border-gray-300"></video>
            <button type="button" onClick={startCamera} className="bg-blue-500 text-white p-2 rounded mr-2" disabled={isLoadingModels}>
              {isLoadingModels ? 'Cargando...' : 'Iniciar Cámara'}
            </button>
            <button type="button" disabled={isLoading} onClick={captureDescriptor} className="bg-green-500 text-white p-2 rounded">Capturar Rostro</button>
          </div>
        </div>
        {/* Errores y mensajes */}
        {(successMessage || error) && (
          <div
            className={`p-4 mb-4 border-l-4 ${
              successMessage
                ? "bg-green-100 border-green-500 text-green-700"
                : "bg-red-100 border-red-500 text-red-700"
            }`}
            role="alert"
          >
            {successMessage && <p className="font-bold">{successMessage}</p>}
            {error && <p className="font-bold">{error}</p>}
          </div>
        )}
        {/* Botones */}
        <div className="flex justify-between mt-6">
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

export default AltaUsuario;