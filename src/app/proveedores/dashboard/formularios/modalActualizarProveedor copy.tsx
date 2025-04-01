// --- START OF FILE src/components/proveedores/modal_actualizar_proveedor.tsx (MODIFIED) ---
import React, { useState, useEffect } from 'react';
// --- Ensure correct import path ---
import { updateProveedor } from './fetchdashboard'; // Or fetchprovedoores.js?

interface ModalProps {
  datos: any; // Initial data including tipo_proveedor, id_proveedor, etc.
  onClose: () => void;
  onUpdated: () => void; // Callback after successful update
}

const ModalActualizarProveedor: React.FC<ModalProps> = ({ datos, onClose, onUpdated }) => {
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

   useEffect(() => {
       // Log initial data and type when modal opens
       console.log("ModalActualizarProveedor received data:", datos);
       if (!tipoProveedorOriginal) {
        console.log("ModalActualizarProveedor received data:", datos);
           setError("Error: No se pudo determinar el tipo de proveedor (Moral/Física).");
       }
   }, [datos, tipoProveedorOriginal]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    // Handle boolean checkbox for estatus if you add it
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tipoProveedorOriginal) {
        setError("Error crítico: No se puede actualizar sin tipo de proveedor.");
        return;
    }
    setIsLoading(true);

    // Construct data object to send, including the original type and ID
    const dataToSubmit = {
      ...form,
      id_proveedor: datos.id_proveedor, // Include the ID
      tipoProveedor: tipoProveedorOriginal, // Include the original type
       // Ensure nulls are sent correctly if fields are cleared
       telefono_dos: form.telefono_dos || null,
       pagina_web: form.pagina_web || null,
       camara_comercial: form.camara_comercial || null,
       numero_registro_camara: form.numero_registro_camara || null,
       numero_registro_imss: form.numero_registro_imss || null,
       apellido_m_representante: form.apellido_m_representante || null,
       apellido_m: form.apellido_m || null,
    };

    console.log("ModalActualizarProveedor submitting data:", dataToSubmit);

    try {
      // Call the refined update function
      await updateProveedor(dataToSubmit);
      onUpdated(); // Refresh data in the parent component
      onClose(); // Close the modal
    } catch (err: any) {
      console.error("Error updating provider from modal:", err);
      setError(err.message || "Error al actualizar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

   // Helper to generate input fields
   const renderInput = (name: keyof typeof form, label: string, required = false, type = 'text') => (
    <div className="mb-3">
      <label htmlFor={`update-${name}`} className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={`update-${name}`} // Ensure unique IDs if multiple forms exist
        name={name}
        value={form[name as keyof typeof form] ?? ''} // Handle potential null/undefined
        onChange={handleChange}
        required={required}
        className="mt-1 block w-full input-style" // Use consistent styling
      />
    </div>
   );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"> {/* Adjusted width and added overflow */}
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-800">Actualizar Datos del Proveedor ({tipoProveedorOriginal === 'moral' ? 'Moral' : 'Física'})</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {error && <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>}
        {/* Display message if type couldn't be determined */}
        {!tipoProveedorOriginal && !error && <p className="text-orange-600 bg-orange-100 p-2 rounded mb-4">No se pudo determinar el tipo de proveedor.</p>}


        {/* Render form only if type is known */}
        {tipoProveedorOriginal && (
            <form onSubmit={handleSubmit}>
                {/* --- Datos Generales --- */}
                <h3 className="text-lg font-medium text-gray-900 border-b pb-1 mb-3">Datos Generales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    {renderInput('rfc', 'RFC', true)}
                    {renderInput('giro_comercial', 'Giro Comercial', true)}
                    {renderInput('correo', 'Correo Electrónico', true, 'email')}
                    {renderInput('telefono_uno', 'Teléfono Principal', true)}
                    {renderInput('telefono_dos', 'Teléfono Secundario')}
                    {renderInput('pagina_web', 'Página Web', false, 'url')}
                    {renderInput('numero_registro_imss', 'No. Registro IMSS')}
                    {renderInput('camara_comercial', 'Cámara Comercial')}
                    {renderInput('numero_registro_camara', 'No. Registro Cámara')}
                    {/* Add estatus checkbox if needed */}
                </div>

                {/* --- Domicilio Fiscal --- */}
                <h3 className="text-lg font-medium text-gray-900 border-b pb-1 mb-3 mt-4">Domicilio Fiscal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                    {renderInput('calle', 'Calle', true)}
                    {renderInput('numero', 'Número (Ext/Int)', true)}
                    {renderInput('colonia', 'Colonia', true)}
                    {renderInput('codigo_postal', 'Código Postal', true)}
                    {renderInput('municipio', 'Municipio', true)}
                    {renderInput('estado', 'Estado', true)}
                </div>

                 {/* --- Conditional Sections --- */}
                {tipoProveedorOriginal === 'moral' && (
                    <div className="mt-4 pt-4 border-t">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-1 mb-3">Datos Persona Moral</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        {renderInput('razon_social', 'Razón Social', true)}
                        {renderInput('nombre_representante', 'Nombre(s) Representante', true)}
                        {renderInput('apellido_p_representante', 'Apellido Paterno Representante', true)}
                        {renderInput('apellido_m_representante', 'Apellido Materno Representante')}
                    </div>
                    </div>
                )}

                {tipoProveedorOriginal === 'fisica' && (
                    <div className="mt-4 pt-4 border-t">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-1 mb-3">Datos Persona Física</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        {renderInput('nombre', 'Nombre(s)', true)}
                        {renderInput('apellido_p', 'Apellido Paterno', true)}
                        {renderInput('apellido_m', 'Apellido Materno')}
                        {renderInput('curp', 'CURP', true)}
                    </div>
                    </div>
                )}


                {/* --- Actions --- */}
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
                    Cancelar
                    </button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
         )} {/* End conditional form rendering */}

          {/* Simple style definition */}
          <style jsx>{`
            .input-style {
                padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); width: 100%;
            }
            .input-style:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; }
          `}</style>
      </div>
    </div>
  );
};

export default ModalActualizarProveedor;
// --- END OF FILE src/components/proveedores/modal_actualizar_proveedor.tsx ---