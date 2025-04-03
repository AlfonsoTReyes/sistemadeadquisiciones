// --- START OF FILE src/components/proveedores/modal_actualizar_proveedor.tsx (MODIFIED) ---
import React, { useState, useEffect } from 'react';
// --- Ensure correct import path ---

interface ModalProps {
  datos: any; // El objeto ProveedorData original
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>; // Función para enviar los datos actualizados
  isLoading: boolean; // Para mostrar feedback de carga
  error: string | null; // Para mostrar errores de la API
}

const ModalActualizarProveedor: React.FC<ModalProps> = ({
  datos,
  onClose,
  onSubmit, // Recibe la función de guardado
  isLoading, // Recibe el estado de carga
  error: apiError, // Recibe el error de la API (renombrado para evitar colisión)
}) => {
  // Initialize form state from props, including tipoProveedor (read-only)
  const [form, setForm] = useState({
    // General fields
    rfc: datos.rfc || '',
    giro_comercial: datos.giro_comercial || '',
    correo: datos.correo || '',
    calle: datos.calle || '',
    numero: datos.numero || '',
    colonia: datos.colonia || '',
    codigo_postal: datos.codigo_postal || '',
    municipio: datos.municipio || '',
    estado: datos.estado || '',
    telefono_uno: datos.telefono_uno || '',
    telefono_dos: datos.telefono_dos || '',
    pagina_web: datos.pagina_web || '',
    camara_comercial: datos.camara_comercial || '',
    numero_registro_camara: datos.numero_registro_camara || '',
    numero_registro_imss: datos.numero_registro_imss || '',
    estatus: datos.estatus ?? true, // Handle boolean status
    // You might add fecha_inscripcion, fecha_vigencia here if editable

    // Moral fields (initialize even if type is fisica, might be easier)
    razon_social: datos.razon_social || '',
    nombre_representante: datos.nombre_representante || '',
    apellido_p_representante: datos.apellido_p_representante || '',
    apellido_m_representante: datos.apellido_m_representante || '',

    // Física fields (initialize even if type is moral)
    nombre: datos.nombre_fisica || '', // Use alias from getProveedorById if needed
    apellido_p: datos.apellido_p_fisica || '', // Use alias
    apellido_m: datos.apellido_m_fisica || '', // Use alias
    curp: datos.curp || '',
  });

  // Store the original provider type - should not be changed in update form
  const [tipoProveedorOriginal] = useState<'moral' | 'fisica' | null>(datos.tipo_proveedor || null);

  const [internalError, setInternalError] = useState(''); // Para errores de validación interna

  useEffect(() => {
    console.log("ModalActualizarProveedor received data:", datos);
    if (!tipoProveedorOriginal) {
        console.error("Modal Error: tipo_proveedor is missing in initial data:", datos);
        setInternalError("Error: No se pudo determinar el tipo de proveedor (Moral/Física). No se puede editar.");
    } else {
        setInternalError(''); // Limpiar error si los datos son correctos
    }
}, [datos, tipoProveedorOriginal]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;
  // Podrías necesitar manejar checkboxes o tipos específicos
  setForm(prev => ({ ...prev, [name]: value }));
};

  // --- Handler para el Submit del Formulario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(''); // Limpiar errores internos previos

    // Validación básica interna (opcional)
    if (!form.rfc) {
        setInternalError("El RFC es obligatorio.");
        return;
    }
    // ... más validaciones ...

    // Preparar el payload para la API
    const payload = {
        ...form, // Los datos actuales del formulario
        id_proveedor: datos.id_proveedor, // El ID original (no editable)
        tipoProveedor: tipoProveedorOriginal // El tipo original (no editable, pero requerido por tu API PUT)
    };

     // Limpieza opcional de campos no relevantes para el tipo (si es necesario)
     if (tipoProveedorOriginal === 'fisica') {
         delete payload.razon_social;
         delete payload.nombre_representante;
         delete payload.apellido_p_representante;
         delete payload.apellido_m_representante;
     } else if (tipoProveedorOriginal === 'moral'){
         delete payload.nombre;
         delete payload.apellido_p;
         delete payload.apellido_m;
         delete payload.curp;
     }

    console.log("Modal sending payload:", payload);

    // Llama a la función onSubmit pasada desde ProveedorInfo
    // El manejo de isLoading y apiError se hace en ProveedorInfo
    await onSubmit(payload);
  };

  return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
        <div className="relative mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Editar Proveedor ({tipoProveedorOriginal === 'moral' ? 'Moral' : 'Físico'})</h3>
  
          {(internalError || apiError) && (
            <div className="my-3 p-3 bg-red-100 text-red-700 border border-red-400 rounded">
              Error: {internalError || apiError}
            </div>
          )}
  
          <form onSubmit={handleSubmit} className={`mt-4 space-y-4 ${internalError ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b pb-4">
            <div>
              <label htmlFor="rfc" className="block text-sm font-medium text-gray-700"><strong>RFC</strong></label>
              <input
                type="text" name="rfc" id="rfc" value={form.rfc} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="giro_comercial" className="block text-sm font-medium text-gray-700"><strong>Giro Comercial</strong></label>
              <input
                type="text" name="giro_comercial" id="giro_comercial" value={form.giro_comercial} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700"><strong>Correo</strong></label>
              <input
                type="text" name="correo" id="correo" value={form.correo} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="calle" className="block text-sm font-medium text-gray-700"><strong>Calle</strong></label>
              <input
                type="text" name="calle" id="calle" value={form.calle} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-gray-700"><strong>Numero</strong></label>
              <input
                type="text" name="numero" id="numero" value={form.numero} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="colonia" className="block text-sm font-medium text-gray-700"><strong>Colonia</strong></label>
              <input
                type="text" name="colonia" id="colonia" value={form.colonia} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="codigo_postal" className="block text-sm font-medium text-gray-700"><strong>Codigo Costal</strong></label>
              <input
                type="text" name="codigo_postal" id="codigo_postal" value={form.codigo_postal} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="municipio" className="block text-sm font-medium text-gray-700"><strong>Municipio</strong></label>
              <input
                type="text" name="municipio" id="municipio" value={form.municipio} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700"><strong>Estado</strong></label>
              <input
                type="text" name="estado" id="estado" value={form.estado} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="telefono_uno" className="block text-sm font-medium text-gray-700"><strong>Telefono 1</strong></label>
              <input
                type="text" name="telefono_uno" id="telefono_uno" value={form.telefono_uno} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="telefono_dos" className="block text-sm font-medium text-gray-700"><strong>Telefono 2</strong></label>
              <input
                type="text" name="telefono_dos" id="telefono_dos" value={form.telefono_dos} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="pagina_web" className="block text-sm font-medium text-gray-700"><strong>Pagina Web</strong></label>
              <input
                type="text" name="pagina_web" id="pagina_web" value={form.pagina_web} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="camara_comercial" className="block text-sm font-medium text-gray-700"><strong>Camara Comercial</strong></label>
              <input
                type="text" name="camara_comercial" id="camara_comercial" value={form.camara_comercial} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="numero_registro_camara" className="block text-sm font-medium text-gray-700"><strong>Numero Registro Camara</strong></label>
              <input
                type="text" name="numero_registro_camara" id="numero_registro_camara" value={form.numero_registro_camara} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="numero_registro_imss" className="block text-sm font-medium text-gray-700"><strong>Numero Registro IMSS</strong></label>
              <input
                type="text" name="numero_registro_imss" id="numero_registro_imss" value={form.numero_registro_imss} onChange={handleChange} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            </div>
            {/* Campos Condicionales */}
            {tipoProveedorOriginal === 'moral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b pb-4">
              <>
                <div>
                  <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700"><strong>Razón Social</strong></label>
                  <input type="text" name="razon_social" id="razon_social" value={form.razon_social} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="nombre_representante" className="block text-sm font-medium text-gray-700"><strong>Nombre Representante</strong></label>
                  <input type="text" name="nombre_representante" id="nombre_representante" value={form.nombre_representante} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="apellido_p_representante" className="block text-sm font-medium text-gray-700"><strong>Apellido Materno</strong></label>
                  <input type="text" name="apellido_p_representante" id="apellido_p_representante" value={form.apellido_p_representante} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="apellido_m_representante" className="block text-sm font-medium text-gray-700"><strong>Apellido Materno</strong></label>
                  <input type="text" name="apellido_m_representante" id="apellido_m_representante" value={form.apellido_m_representante} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </>
              </div>
            )}
            {tipoProveedorOriginal === 'fisica' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b pb-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700"><strong>Nombre(s)</strong></label>
                  <input type="text" name="nombre" id="nombre" value={form.nombre} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="apellido_p" className="block text-sm font-medium text-gray-700"><strong>Apellido paterno</strong></label>
                  <input type="text" name="apellido_p" id="apellido_p" value={form.apellido_p} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="apellido_m" className="block text-sm font-medium text-gray-700"><strong>Apellido Materno</strong></label>
                  <input type="text" name="apellido_m" id="apellido_m" value={form.apellido_m} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="curp" className="block text-sm font-medium text-gray-700"><strong>CURP</strong></label>
                  <input type="text" name="curp" id="curp" value={form.curp} onChange={handleChange} required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
  
            {/* --- BOTONES --- */}
            <div className="items-center px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading || !!internalError} // Deshabilita si carga o hay error interno
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isLoading || internalError ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading} // Deshabilita si está cargando
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default ModalActualizarProveedor;