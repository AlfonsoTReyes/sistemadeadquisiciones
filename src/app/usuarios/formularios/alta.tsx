import React, { useState, useEffect, useRef } from "react";
import { fetchRoles, createUser, fetchSecretarias, fetchDependencias } from "../../peticiones_api/fetchUsuarios"; // Importamos las peticiones

interface AltaUsuarioProps {
  onClose: () => void;
  onUsuarioAdded: () => void;
}

const AltaUsuario: React.FC<AltaUsuarioProps> = ({ onClose, onUsuarioAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [nomina, setNomina] = useState("");
  const [secretaria, setSecretaria] = useState("");
  const [sistemas, setSistemas] = useState("");
  const [dependencia, setDependencia] = useState("");
  const [puesto, setPuesto] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [secretarias, setSecretarias] = useState<{ id_secretaria: string; nombre: string }[]>([]);
  const [dependencias, setDependencias] = useState<{ id_dependencia: string; nombre: string; id_secretaria: string }[]>([]);
  const [dependenciasFiltradas, setDependenciasFiltradas] = useState<{ id_dependencia: string; nombre: string }[]>([]);
  
  const [roles, setRoles] = useState<{ id_rol: string; nombre: string }[]>([]);
  const [emailUsuario, setEmailUsuario] = useState("");
  

  useEffect(() => {
    const loadOpciones = async () => {
      try {
        const roles = await fetchRoles();
        setRoles(roles);

        const secretariasData = await fetchSecretarias();
        setSecretarias(secretariasData);

        const dependenciasData = await fetchDependencias();
        setDependencias(dependenciasData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    loadOpciones();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "nombre") setNombre(value);
    else if (name === "apellidos") setApellidos(value);
    else if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "rol") setRol(value);
    else if (name === "nomina") setNomina(value);
    else if (name === "sistemas") setSistemas(value);
    else if (name === "secretaria") setSecretaria(value);
    else if (name === "dependencia") setDependencia(value);
    else if (name === "puesto") setPuesto(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const usuarioData = {
        nombre,
        apellidos,
        email,
        password,
        rol,
        nomina,
        emailUsuario: 'ggg',
        secretaria,
        sistemas,
        dependencia,
        puesto
      };
      

      await createUser(usuarioData); // Llamamos a la función separada
      setSuccessMessage("Alta exitosa de usuario");
      onUsuarioAdded();
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecretariaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSecretaria = e.target.value;
    setSecretaria(selectedSecretaria);
    
    // Filtrar dependencias que pertenecen a la secretaría seleccionada
    const dependenciasFiltradas = dependencias.filter(dep => String(dep.id_secretaria) === selectedSecretaria);
    setDependenciasFiltradas(dependenciasFiltradas);
    
    // Reiniciar la dependencia seleccionada
    setDependencia("");
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Alta de Usuario</h1>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Cargando...</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="mb-4">
            <label>Nómina: <span className="text-red-500">*</span></label>
            <input type="text" name="nomina" required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label>Nombre: <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label>Apellidos: <span className="text-red-500">*</span></label>
            <input type="text" name="apellidos" required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label>Correo: <span className="text-red-500">*</span></label>
            <input type="email" name="email" required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label>Contraseña: <span className="text-red-500">*</span></label>
            <input type="password" name="password" required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange} />
          </div>
          <div>
            <label>Secretaría:</label>
            <select name="secretaria" value={secretaria} onChange={handleSecretariaChange} required className="border p-2 rounded w-full">
              <option value="">Seleccione una Secretaría</option>
              {secretarias.map(sec => (
                <option key={sec.id_secretaria} value={sec.id_secretaria}>
                  {sec.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Dependencia:</label>
            <select name="dependencia" value={dependencia} onChange={handleInputChange} required className="border p-2 rounded w-full" disabled={!secretaria}>
              <option value="">Seleccione una Dependencia</option>
              {dependenciasFiltradas.map(dep => (
                <option key={dep.id_dependencia} value={dep.id_dependencia}>
                  {dep.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-medium">Puesto: <span className="text-red-500">*</span></label>
            <input type="text" name="puesto" required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange} />
          </div>
          <div className="mb-4">
            <label className="block font-medium">Sistema: <span className="text-red-500">*</span></label>
            <select name="sistemas" onChange={handleInputChange} className="w-full p-2 border rounded" required>
              <option value="">Selecciona el sistema</option>
              <option value="PROVEEDORES">PROVEEDORES</option>
              <option value="ADQUISICIONES">ADQUISICIONES</option>
              <option value="FINANZAS">FINANZAS</option>
              <option value="SOLICITANTES">SOLICITANTES</option>
              <option value="UNIVERSAL">UNIVERSAL</option>

            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Rol: <span className="text-red-500">*</span></label>
            <select 
              name="rol"  // Antes decía "id_rol", pero en handleInputChange se usa "rol"
              value={rol} 
              onChange={handleInputChange} 
              required 
              className="border border-gray-300 p-2 rounded w-full"
            >
              <option value="">Seleccione un Rol</option>
              {roles.map((rolOption) => (
                <option key={rolOption.id_rol} value={rolOption.id_rol}>
                  {rolOption.nombre}
                </option>
              ))}
            </select>

          </div>
        </div>
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-between mt-6">
          <button type="submit" disabled={isLoading} className={`w-1/2 p-2 rounded ${isLoading ? 'bg-gray-500' : 'bg-blue-500'} text-white`}>
            {isLoading ? 'Cargando...' : 'Guardar'}
          </button>
          <button type="button" onClick={onClose} className="bg-red-500 text-white p-2 rounded w-1/2 hover:bg-red-600">
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AltaUsuario;
