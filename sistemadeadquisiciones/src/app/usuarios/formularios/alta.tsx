//06 DE DICIEMBRE DE 2024
import React, { useState, useEffect, useRef } from "react";
import bcrypt from "bcryptjs"; //Se importa Bcrypt.js es una biblioteca para manejar el cifrado seguro de contraseñas.
import * as faceapi from "face-api.js"; //Se importa Face API es una biblioteca para reconocimiento y análisis facial basada en TensorFlow.js.
import * as tf from '@tensorflow/tfjs'; //Se importa TensorFlow.js es una biblioteca de aprendizaje automático que permite ejecutar modelos en JavaScript.

//Se declara la interfaz para definir las propiedades que debe de tener los objetos
interface AltaUsuarioProps {
  onClose: () => void; //Se utiliza para cerrar el formulario o modal. El componente AltaEmpleado la invoca cuando el usuario desea cancelar la operación o cerrar la ventana.
  onUsuarioAdded: () => void; //Notifica al componente padre que un empleado ha sido agregado exitosamente. 
}

//Este componente gestiona la creación de Usuarios. Utiliza un enfoque basado en estados para 
// manejar la interacción del usuario y los datos.
const AltaUsuario: React.FC<AltaUsuarioProps> = ({ onClose, onUsuarioAdded }) => {//Utiliza React para construir el componente y manejar el estado interno.
  const [isLoading, setIsLoading] = useState(false);//Indica si la operación de creación del usuario está en curso.
  const [nombre, setNombre] = useState(""); //Capturan los valores de los campos del modal.
  const [email, setEmail] = useState("");
  const [nomina, setNomina] = useState("");
  const [secretaria, setSecretaria] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("1");
  const [error, setError] = useState(""); //Almacena mensajes de error en caso de fallos.
  const [successMessage, setSuccessMessage] = useState(""); //Mensaje que se muestra si la operación fue exitosa.
  const [roles, setRoles] = useState<{ id_rol: string; nombre: string }[]>([]);
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
      await fetchRoles();
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
  
  // Obtener roles desde la API
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (!response.ok) {
        throw new Error("Error al obtener los roles");
      }
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      setError((err as Error).message);
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

  //Captura los cambios realizados en los campos del formulario.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    //Actualiza el estado correspondiente en función del campo editado.
    const { name, value } = e.target;
    if (name === "nombre") setNombre(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "id_rol") setRol(value);
    else if (name === "nomina") setNomina(value);
    else if (name === "secretaria") setSecretaria(value);

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
      const hashedPassword = await bcrypt.hash(password, 10);
      const usuarioData = {
        nombre,
        email,
        password: hashedPassword,
        rol,
        nomina,
        descriptor,
        emailUsuario,
        secretaria,
      };
      //Valida y envía los datos del empleado mediante una solicitud POST a la API (/api/empleados).
      const response = await fetch("/api/usuarios", {
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
      onUsuarioAdded();
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
      <h1 className="text-lg font-bold mb-4">Alta de Usuario</h1>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Cargando...</p>{/* Un indicador de carga aparece mientras se realiza el registro. */}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mx-auto">
        {/* Inputs y select para roles */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label>Nombre: <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="nombre"
              required
              className="border border-gray-300 p-2 rounded w-full"
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label>Correo: <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              required
              className="border border-gray-300 p-2 rounded w-full"
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-4">
            <label>Contraseña: <span className="text-red-500">*</span></label>
            <input
              type="password"
              name="password"
              required
              className="border border-gray-300 p-2 rounded w-full"
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-4">
          <label className="block font-medium">Secretaría: <span className="text-red-500">*</span></label>
            <select
              name="secretaria"
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required>
              <option value="">Selecciona una secretaría</option>
              <option value="JEFATURA DE OFICINA PRESIDENCIA">JEFATURA DE OFICINA PRESIDENCIA</option>
              <option value="SECRETARIA PARTICULAR">SECRETARIA PARTICULAR</option>
              <option value="JEFATURA DE GABINETE">JEFATURA DE GABINETE</option>
              <option value="PRESIDENCIA">PRESIDENCIA</option>
              <option value="SECRETARIA DE GOBIERNO">SECRETARÍA DE GOBIERNO</option>
              <option value="SECRETARIA DE SEGURIDAD PUBLICA">SECRETARÍA DE SEGURIDAD PÚBLICA</option>
              <option value="SECRETARIA DE SERVICIOS PUBLICOS MUNICIPALES">SECRETARÍA DE SERVICIOS PÚBLICOS MUNICIPALES</option>
              <option value="SECRETARIA DE OBRAS PUBLICAS Y DESARROLLO URBANO">SECRETARÍA DE OBRAS PÚBLICAS Y DESARROLLO URBANO</option>
              <option value="SECRETARIA DE ORGANO INTERNO DE CONTROL">SECRETARÍA DE ÓRGANO INTERNO DE CONTROL</option>
              <option value="SECRETARIA DE AYUNTAMIENTO">SECRETARÍA DE AYUNTAMIENTO</option>
              <option value="SECRETARIA DE FINANZAS">SECRETARÍA DE FINANZAS</option>
              <option value="SECRETARIA DE ADMINISTRACION">SECRETARÍA DE ADMINISTRACIÓN</option>
              <option value="SECRETARIA DE DESARROLLO AGROPECUARIO">SECRETARÍA DE DESARROLLO AGROPECUARIO</option>
              <option value="SECRETARIA DE LA MUJER">SECRETARÍA DE LA MUJER</option>
              <option value="SECRETARIA DE DESARROLLO SOCIAL">SECRETARÍA DE DESARROLLO SOCIAL</option>
              <option value="SECRETARIA DE DESARROLLO INTEGRAL Y ECONOMICO">SECRETARÍA DE DESARROLLO INTEGRAL Y ECONÓMICO</option>
              <option value="SECRETARIA DE ATENCION CIUDADANA">SECRETARIA DE ATENCION CIUDADANA</option>
              <option value="SUB-SECRETARIA DE DESARROLLO INTEGRAL">SUB-SECRETARÍA DE DESARROLLO INTEGRAL</option>
              <option value="SUB-SECRETARIA DE DESARROLLO ECONOMICO, NEGOCIOS, EMPRESARIAL Y TURISMO">
                SUB-SECRETARÍA DE DESARROLLO ECONÓMICO, NEGOCIOS, EMPRESARIAL Y TURISMO
              </option>
              <option value="SUB-SECRETARIA DE SEGURIDAD PUBLICA">SUB-SECRETARÍA DE SEGURIDAD PÚBLICA</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Rol: <span className="text-red-500">*</span></label>
            <select name="rol" required className="border border-gray-300 p-2 rounded w-full">
              {/* Se realiza un mapeo para traer todos los datos de la api de los roles */}
              {roles.map((rolOption) => (
                <option key={rolOption.id_rol} value={rolOption.id_rol}>
                  {rolOption.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
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