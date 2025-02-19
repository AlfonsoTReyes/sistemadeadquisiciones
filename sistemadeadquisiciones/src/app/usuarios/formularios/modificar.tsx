//06 DE DICIEMBRE DE 2024
import React, { useState, useEffect } from 'react';

//Define las propiedades que el componente ModificarUsuario
interface ModificarUsuarioProps {
  usuarioId: number; //Identificador único del usuario que se va a modificar.
  onClose: () => void; //Callback para cerrar el modal después de completar la operación.
  onUsuarioModificado: () => void; // Callback que se ejecuta cuando se modifica correctamente el usuario, para actualizar la vista padre.
}
//Define la estructura de los datos de un rol
interface Rol {
  id_rol: number;
  nombre: string;
}
//Este componente se encarga de proporcionar una interfaz para editar los datos de un usuario. Realiza solicitudes a la API para obtener y actualizar los datos del usuario y maneja los estados de carga, éxito y error
const ModificarUsuario: React.FC<ModificarUsuarioProps> = ({ usuarioId, onClose, onUsuarioModificado }) => {
  const [isLoading, setIsLoading] = useState(false); //Controla si el componente está en proceso de carga (en espera de una respuesta de la API).
  const [nombre, setNombre] = useState(''); //Campos del formulario que permiten al usuario modificar el nombre, correo, número de nómina y rol de un usuario.
  const [email, setEmail] = useState('');
  const [nomina, setNomina] = useState('');
  const [secretaria, setSecretaria] = useState('');
  const [rol, setRol] = useState('');
  const [roles, setRoles] = useState<Rol[]>([]); //Lista de roles disponibles para asignar al usuario.
  const [error, setError] = useState<string | null>(null); //Mensaje de error si ocurre algún fallo durante la carga de datos o la actualización del usuario.
  const [successMessage, setSuccessMessage] = useState(''); //Mensaje de éxito que se muestra al usuario después de una modificación exitosa.
  const [emailUsuario, setEmailUsuario] = useState('');
  

  //Se ejecuta una vez cuando el componente se monta y cada vez que cambia el usuarioId.
  useEffect(() => {
    const email = sessionStorage.getItem('userEmail') || '';
    setEmailUsuario(email);
    //Realiza una solicitud para obtener los detalles de un usuario utilizando su usuarioId y los establece en el estado del componente.
    const fetchUsuario = async () => {
      try {
        //Se hace una solicitud GET a la API para obtener los datos del usuario a través de su usuarioId y se almacenan en el estado local.
        const response = await fetch(`/api/usuarios?id_usuario=${usuarioId}`);
        if (!response.ok) {
          throw new Error('Error al obtener los datos del usuario');
        }
        const data = await response.json();
        setNombre(data.nombre);
        setEmail(data.email);
        setNomina(data.nomina);
        setSecretaria(data.secretaria);
        setRol(data.id_rol);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    //Realiza una solicitud para obtener la lista de roles y los establece en el estado.
    const fetchRoles = async () => {
      try {
        //Realiza una solicitud GET para obtener la lista de roles disponibles para asignar al usuario.
        const response = await fetch('/api/roles');
        if (!response.ok) {
          throw new Error('Error al obtener la lista de roles');
        }
        const data = await response.json();
        setRoles(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchUsuario();
    fetchRoles();
  }, [usuarioId]);

  useEffect(() => {
    if (roles.length > 0 && rol) {
      const usuarioRol = roles.find((r) => r.id_rol === Number(rol));
      if (usuarioRol) {
        setRol(usuarioRol.id_rol.toString());
      }
    }
  }, [roles, rol]);

  //Se ejecuta cuando el usuario envía el formulario.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); //Evita que el formulario se envíe de forma tradicional, lo cual recargaría la página.
    setError(''); //Limpia cualquier mensaje de error previo.
    setSuccessMessage('');
    setIsLoading(true);
    //Crea un objeto usuarioData con los datos del usuario que se van a enviar al servidor (ID del usuario, nombre, correo, rol y nómina).
    const usuarioData = { id_usuario: usuarioId, nombre, email, rol, nomina, emailUsuario, secretaria };

    try {
      //Se realiza una solicitud fetch a la URL /api/usuarios, utilizando el método PUT para actualizar los datos del usuario.
      const response = await fetch('/api/usuarios', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioData),
      });
      if (!response.ok) {
        //Si la respuesta de la API no es exitosa (!response.ok), se deshabilita el estado de carga (setIsLoading(false)) y se lanza un error. 
        setIsLoading(false);
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Error al modificar el usuario. Contacte con el administrador');
      }
      //Si la respuesta es exitosa, se muestra el mensaje de éxito Modificación exitosa de usuario y se ejecuta el callback onUsuarioModificado() para indicar que el usuario ha sido modificado con éxito.
      setSuccessMessage('Modificación exitosa de usuario');
      onUsuarioModificado();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    }finally{ //asegura de que el estado isLoading se establezca en false después de completar la solicitud, independientemente de si fue exitosa o no.
      setIsLoading(false);
    }
  };

  return (
    //Genera la estructura para que el usuario pueda editar un usuario al sistema
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4 text-center">Modificar Usuario</h2>
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Cargando...</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Nombre: <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded" required/>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Correo: <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded" required/>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Rol: <span className="text-red-500">*</span></label>
            <select name="rol" required value={rol} onChange={(e) => setRol(e.target.value)} className="border border-gray-300 p-2 rounded w-full">
              {/* Se realiza un mapeo para traer todos los datos de la api de los usuarios */}
              {roles.map((rolOption) => (
                <option key={rolOption.id_rol} value={rolOption.id_rol}>
                  {rolOption.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
          <label className="block font-medium">Secretaría: <span className="text-red-500">*</span></label>
            <select
              name="secretaria"
              onChange={(e) => setSecretaria(e.target.value)}
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
          {/* Se muestra solo si hay un mensaje de éxito (successMessage) o error (error). */}
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
              {isLoading ? 'Cargando...' : 'Guardar'} //Ejecuta el envío del formulario.
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
    </div>
  );
};

export default ModificarUsuario;
