// --- NUEVO ARCHIVO: src/components/proveedores/modal_actualizar_usuario.tsx ---
import React, { useState, useEffect } from 'react';

// Define una interfaz para los datos del usuario (ajusta según lo que devuelva tu API/servicio)
interface UsuarioProveedorData {
  id_usuario: number;
  usuario: string;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo: string;
  estatus: boolean; // 'activo', 'inactivo', etc.
  contraseña: string;
}

interface ModalUsuarioProps {
  userData: UsuarioProveedorData; // Datos iniciales del usuario
  onClose: () => void;
  isOpen: boolean;
  onSubmit: (payload: any) => Promise<void>; // Función para guardar
  isLoading: boolean; // Estado de carga del guardado
  error: string | null; // Error del guardado
}

const ModalActualizarUsuarioProveedor: React.FC<ModalUsuarioProps> = ({
  userData,
  onClose,
  onSubmit,
  isLoading,
  error: apiError, // Renombrar para claridad
}) => {
  // Estado del formulario inicializado con los datos del usuario
  const [form, setForm] = useState({
    usuario: userData.usuario || '',
    nombre: userData.nombre || '',
    apellido_p: userData.apellido_p || '', // Asegúrate que los nombres coincidan con tu interfaz
    apellido_m: userData.apellido_m || '',
    correo: userData.correo || '',
    estatus: userData.estatus === true ? 'activo' : 'inactivo',
    contraseña: '', // Default si no viene
  });
  const [internalError, setInternalError] = useState(''); // Para validaciones internas

  // Efecto para resetear el formulario si cambian los datos iniciales (poco probable aquí, pero buena práctica)
  useEffect(() => {
    setForm({
        usuario: userData.usuario || '',
        nombre: userData.nombre || '',
        apellido_p: userData.apellido_p || '',
        apellido_m: userData.apellido_m || '',
        correo: userData.correo || '',
        estatus: userData.estatus === true ? 'activo' : 'inactivo',
        contraseña: '',
    });
    setInternalError(''); // Limpiar errores internos si cambian los datos
  }, [userData]);

  // Handler genérico para cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler para enviar el formulario
// Handler para enviar el formulario
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setInternalError('');

  if (!form.usuario || !form.nombre || !form.apellido_p || !form.correo) {
      setInternalError("Los campos Usuario, Nombre, Apellido Paterno y Correo son obligatorios.");
      return;
  }

  // Prepara el payload sin contraseña por defecto
  const payload: any = {
      id_usuario: userData.id_usuario,
      usuario: form.usuario,
      nombre: form.nombre,
      apellido_p: form.apellido_p,
      apellido_m: form.apellido_m,
      correo: form.correo,
      estatus: form.estatus,
  };

  // Solo incluye la contraseña si se ingresó algo en el campo
  if (form.contraseña.trim()) {
      payload.contraseña = form.contraseña;
  }


  await onSubmit(payload);
};

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          aria-label="Cerrar modal"
        >
          × {/* Símbolo de 'x' para cerrar */}
        </button>
        <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">Editar Usuario Asociado</h3>

        {/* Mostrar errores (internos o de API) */}
        {(internalError || apiError) && (
          <div className="my-3 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
            <strong>Error:</strong> {internalError || apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={`mt-4 space-y-4 ${internalError ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* --- Campos del Formulario --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">Usuario</label>
              <input
                type="text" name="usuario" id="usuario" value={form.usuario} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                type="email" name="correo" id="correo" value={form.correo} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre(s)</label>
              <input
                type="text" name="nombre" id="nombre" value={form.nombre} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="apellido_p" className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
              <input
                type="text" name="apellido_p" id="apellido_p" value={form.apellido_p} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="apellido_m" className="block text-sm font-medium text-gray-700">Apellido Materno</label>
              <input
                type="text" name="apellido_m" id="apellido_m" value={form.apellido_m} onChange={handleChange} // Requerido o no según tu lógica
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
             <div>
              <label htmlFor="estatus" className="block text-sm font-medium text-gray-700">Estatus</label>
              <select
                name="estatus" id="estatus" value={form.estatus} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                {/* Añade otros estados si los tienes */}
              </select>
            </div>
            <div>
            <label htmlFor="contraseña" className="block text-sm font-medium text-gray-700">
              Contraseña (dejar vacío para no modificar)
            </label>
            <input
              type="password"
              name="contraseña"
              id="contraseña"
              value={form.contraseña}
              onChange={handleChange}
              placeholder="Ingrese nueva contraseña si desea modificarla"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading} // Deshabilita si está cargando
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !!internalError} // Deshabilita si carga o hay error interno
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium ${isLoading || internalError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalActualizarUsuarioProveedor;