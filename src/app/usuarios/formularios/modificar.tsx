import React, { useState, useEffect } from "react";
import { getUserById, fetchRoles, updateUser, fetchSecretarias, fetchDependencias } from "../../peticiones_api/fetchUsuarios";


interface EditarUsuarioProps {
  id_usuario: number;
  onClose: () => void;
  onUsuarioUpdated: () => void;
}

const EditarUsuario: React.FC<EditarUsuarioProps> = ({ id_usuario, onClose, onUsuarioUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [nomina, setNomina] = useState("");
  const [secretaria, setSecretaria] = useState("");
  const [sistemas, setSistemas] = useState("");
  const [dependencia, setDependencia] = useState("");
  const [puesto, setPuesto] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [secretarias, setSecretarias] = useState<{ id_secretaria: string; nombre: string }[]>([]);
  const [dependencias, setDependencias] = useState<{ id_dependencia: string; nombre: string; id_secretaria: string }[]>([]);
  const [dependenciasFiltradas, setDependenciasFiltradas] = useState<{ id_dependencia: string; nombre: string }[]>([]);
  const [roles, setRoles] = useState<{ id_rol: string; nombre: string }[]>([]);

  // Cargar datos del usuario y opciones iniciales
  useEffect(() => {
    const loadUsuario = async () => {
      try {
        setIsLoading(true);
        const usuarioData = await getUserById(id_usuario);
        setNombre(usuarioData.nombre_u);
        setApellidos(usuarioData.apellidos);
        setEmail(usuarioData.email);
        setNomina(usuarioData.nomina);
        setSecretaria(usuarioData.id_secretaria);
        setDependencia(usuarioData.id_dependencia); // ✅ Asegura que la dependencia se setea correctamente
        setPuesto(usuarioData.puesto);
        setSistemas(usuarioData.sistema || "");
        setRol(usuarioData.id_rol);
        const secretariasData = await fetchSecretarias();
        setSecretarias(secretariasData);
        const dependenciasData: { id_dependencia: string; nombre: string; id_secretaria: string }[] = await fetchDependencias();
        setDependencias(dependenciasData);
        const rolesData = await fetchRoles();
        setRoles(rolesData);
  
        // ✅ Filtrar dependencias asegurando que 'dep' tenga el tipo correcto
        const dependenciasFiltradas = dependenciasData.filter((dep) => 
          String(dep.id_secretaria) === String(usuarioData.id_secretaria)
        );
        
        setDependenciasFiltradas(dependenciasFiltradas);
  
        // ✅ Solo actualiza la dependencia si sigue siendo válida
        if (!dependenciasFiltradas.some((dep) => String(dep.id_dependencia) === String(usuarioData.id_dependencia))) {
          setDependencia("");
        }
  
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadUsuario();
  }, [id_usuario]);
  
  
  
  
  // Filtrar dependencias cuando cambie la secretaría seleccionada
  useEffect(() => {
    if (secretaria) {
      const nuevasDependencias = dependencias.filter(dep => String(dep.id_secretaria) === String(secretaria));
      setDependenciasFiltradas(nuevasDependencias);
  
      // ✅ Mantiene la dependencia seleccionada si es válida, en lugar de resetearla a ""
      if (!nuevasDependencias.some(dep => String(dep.id_dependencia) === String(dependencia))) {
        setDependencia("");
      }
    } else {
      setDependenciasFiltradas([]);
    }
  }, [secretaria, dependencias]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "nombre") setNombre(value);
    else if (name === "apellidos") setApellidos(value);
    else if (name === "email") setEmail(value);
    else if (name === "nomina") setNomina(value);
    else if (name === "secretaria") setSecretaria(value);
    else if (name === "dependencia") setDependencia(value);
    else if (name === "puesto") setPuesto(value);
    else if (name === "sistemas") setSistemas(value);
    else if (name === "rol") setRol(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const usuarioData = {
        id_usuario,
        nombre,
        apellidos,
        email,
        nomina,
        secretaria: secretaria,
        dependencia: dependencia,
        puesto,
        sistema: sistemas,
        rol: rol,
      };

      await updateUser(usuarioData);
      setSuccessMessage("Usuario actualizado correctamente");
      onUsuarioUpdated();
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Editar Usuario</h1>

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
          <div>
            <label>Nomina: <span className="text-red-500">*</span></label>
            <input type="text" name="nomina" value={nomina} onChange={handleInputChange} required className="border p-2 rounded w-full" />
          </div>
          <div>
            <label>Nombre: <span className="text-red-500">*</span></label>
            <input type="text" name="nombre" value={nombre} onChange={handleInputChange} required className="border p-2 rounded w-full" />
          </div>
          <div>
            <label>Apellidos: <span className="text-red-500">*</span></label>
            <input type="text" name="apellidos" value={apellidos} onChange={handleInputChange} required className="border p-2 rounded w-full" />
          </div>
          <div>
            <label>Correo: <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={email} onChange={handleInputChange} required className="border p-2 rounded w-full" />
          </div>

          {/* Secretaría y Dependencia */}
          <div>
            <label>Secretaría: <span className="text-red-500">*</span></label>
            <select name="secretaria" value={secretaria} onChange={handleInputChange} required className="border p-2 rounded w-full">
              {secretarias.map(sec => (
                <option key={sec.id_secretaria} value={sec.id_secretaria}>{sec.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Dependencia: <span className="text-red-500">*</span></label>
            <select name="dependencia" value={dependencia} onChange={handleInputChange} required className="border p-2 rounded w-full">
              {dependenciasFiltradas.map((dep: { id_dependencia: string; nombre: string }) => (
                <option key={dep.id_dependencia} value={dep.id_dependencia}>{dep.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Puesto: <span className="text-red-500">*</span></label>
            <input type="text" name="puesto" value={puesto} onChange={handleInputChange} required className="border p-2 rounded w-full" />
          </div>

          <div>
            <label>Rol: <span className="text-red-500">*</span></label>
            <select name="rol" value={rol} onChange={handleInputChange} required className="border p-2 rounded w-full">
              {roles.map(rolOption => (
                <option key={rolOption.id_rol} value={rolOption.id_rol}>{rolOption.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Sistema: <span className="text-red-500">*</span></label>
            <select 
              name="sistemas" 
              value={sistemas}  // ← Agregado para que se actualice
              onChange={handleInputChange} 
              className="w-full p-2 border rounded" 
              required
            >
              <option value="">Selecciona el sistema</option>
              <option value="PROVEEDORES">PROVEEDORES</option>
              <option value="ADQUISICIONES">ADQUISICIONES</option>
              <option value="FINANZAS">FINANZAS</option>
              <option value="SOLICITANTES">SOLICITANTES</option>
              <option value="UNIVERSAL">UNIVERSAL</option>


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

export default EditarUsuario;
