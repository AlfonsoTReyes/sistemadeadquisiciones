'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { createProveedor } from './fetchprovedoores'; // Adjust path if needed

interface FormularioRegistroProveedorProps {
  // Expect the ID of the logged-in provider user who needs to create their profile
  idUsuarioProveedor: number;
  onSuccess?: (newProviderData: any) => void;
}

// Renamed component to avoid confusion with the USER registration form
const FormularioRegistroProveedor: React.FC<FormularioRegistroProveedorProps> = ({ idUsuarioProveedor, onSuccess }) => {
  const [tipoProveedor, setTipoProveedor] = useState<'moral' | 'fisica' | ''>('');
  const [formData, setFormData] = useState({
    // Initialize fields (same as before)
    rfc: '', giro_comercial: '', correo: '', calle: '', numero: '', colonia: '', codigo_postal: '', municipio: '', estado: '', telefono_uno: '', telefono_dos: '', pagina_web: '', camara_comercial: '', numero_registro_camara: '', numero_registro_imss: '',
    razon_social: '', nombre_representante: '', apellido_p_representante: '', apellido_m_representante: '',
    nombre: '', apellido_p: '', apellido_m: '', curp: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

   useEffect(() => {
    // Log the received user ID when the component mounts
    console.log("FormularioRegistroProveedorDatos received user ID:", idUsuarioProveedor);
    if (!idUsuarioProveedor) {
        setError("No se pudo identificar al usuario proveedor. Por favor, inicie sesión de nuevo.");
    }
   }, [idUsuarioProveedor]);


  // --- IMPLEMENTATION ADDED ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- IMPLEMENTATION ADDED ---
  const handleTipoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTipo = e.target.value as 'moral' | 'fisica';
    setTipoProveedor(newTipo);
    // Optionally clear fields of the *other* type when switching
    if (newTipo === 'moral') {
        setFormData(prev => ({ ...prev, nombre: '', apellido_p: '', apellido_m: '', curp: '' }));
    } else if (newTipo === 'fisica') {
         setFormData(prev => ({ ...prev, razon_social: '', nombre_representante: '', apellido_p_representante: '', apellido_m_representante: '' }));
    }
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

     if (!idUsuarioProveedor) {
        setError("Error crítico: Falta ID de usuario proveedor. No se puede registrar.");
        return;
    }
    if (!tipoProveedor) { setError("Seleccione si es Persona Moral o Física."); return; }

    setIsLoading(true);

    const dataToSubmit = {
      ...formData,
      id_usuario_proveedor: idUsuarioProveedor, // --- Include the user ID ---
      tipoProveedor: tipoProveedor,
      // Clean up empty optional fields to avoid sending empty strings if DB expects NULL
      telefono_dos: formData.telefono_dos || undefined,
      pagina_web: formData.pagina_web || undefined,
      camara_comercial: formData.camara_comercial || undefined,
      numero_registro_camara: formData.numero_registro_camara || undefined,
      numero_registro_imss: formData.numero_registro_imss || undefined,
      apellido_m_representante: formData.apellido_m_representante || undefined, // Optional moral field
      apellido_m: formData.apellido_m || undefined, // Optional fisica field
    };

    // Basic required field validation based on type
    const requiredCommon = ['rfc', 'giro_comercial', 'correo', 'calle', 'numero', 'colonia', 'codigo_postal', 'municipio', 'estado', 'telefono_uno'];
    const requiredMoral = ['razon_social', 'nombre_representante', 'apellido_p_representante'];
    const requiredFisica = ['nombre', 'apellido_p', 'curp'];

    let missingFields: string[] = [];
    requiredCommon.forEach(field => {
        if (!formData[field as keyof typeof formData]) missingFields.push(field);
    });

    if (tipoProveedor === 'moral') {
        requiredMoral.forEach(field => {
            if (!formData[field as keyof typeof formData]) missingFields.push(field);
        });
    } else { // tipoProveedor === 'fisica'
        requiredFisica.forEach(field => {
            if (!formData[field as keyof typeof formData]) missingFields.push(field);
        });
    }

    if (missingFields.length > 0) {
        setError(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
    }


    try {
      const result = await createProveedor(dataToSubmit);
      setSuccessMessage(`Proveedor registrado exitosamente con ID: ${result.id_proveedor}`);
      setIsLoading(false);
      // Optionally reset form or call onSuccess callback
       setFormData({ // Reset form fields
           rfc: '', giro_comercial: '', correo: '', calle: '', numero: '', colonia: '',
           codigo_postal: '', municipio: '', estado: '', telefono_uno: '', telefono_dos: '',
           pagina_web: '', camara_comercial: '', numero_registro_camara: '', numero_registro_imss: '',
           razon_social: '', nombre_representante: '', apellido_p_representante: '', apellido_m_representante: '',
           nombre: '', apellido_p: '', apellido_m: '', curp: ''
       });
       setTipoProveedor('');
       if (onSuccess) onSuccess(result);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al registrar el proveedor.");
      setIsLoading(false);
    }
  };

  // Helper to generate input fields reducing repetition
  const renderInput = (name: keyof typeof formData, label: string, required = false, type = 'text') => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        required={required}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Registrar Nuevo Proveedor</h2>

      {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {successMessage && <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">{successMessage}</div>}

      {/* --- Section: Tipo de Proveedor --- */}
      <fieldset className="mb-6">
        <legend className="text-lg font-medium text-gray-900 mb-2">Tipo de Proveedor <span className="text-red-500">*</span></legend>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tipoProveedor"
              value="moral"
              checked={tipoProveedor === 'moral'}
              onChange={handleTipoChange}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
              required
            />
            <span className="ml-2 text-sm text-gray-700">Persona Moral</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tipoProveedor"
              value="fisica"
              checked={tipoProveedor === 'fisica'}
              onChange={handleTipoChange}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
              required
            />
            <span className="ml-2 text-sm text-gray-700">Persona Física</span>
          </label>
        </div>
      </fieldset>

      {/* --- Section: Datos Generales (Tabla proveedores) --- */}
      {tipoProveedor && ( // Only show general fields after type is selected
        <>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Datos Generales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('rfc', 'RFC', true)}
                {renderInput('giro_comercial', 'Giro Comercial', true)}
                {renderInput('correo', 'Correo Electrónico', true, 'email')}
                {renderInput('telefono_uno', 'Teléfono Principal', true)}
                {renderInput('telefono_dos', 'Teléfono Secundario')}
                {renderInput('pagina_web', 'Página Web', false, 'url')}
                {renderInput('numero_registro_imss', 'No. Registro IMSS')}
                {renderInput('camara_comercial', 'Cámara Comercial')}
                {renderInput('numero_registro_camara', 'No. Registro Cámara')}
            </div>

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-6">Domicilio Fiscal</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInput('calle', 'Calle', true)}
                {renderInput('numero', 'Número (Ext/Int)', true)}
                {renderInput('colonia', 'Colonia', true)}
                {renderInput('codigo_postal', 'Código Postal', true)}
                {renderInput('municipio', 'Municipio', true)}
                {renderInput('estado', 'Estado', true)}
            </div>
        </>
      )}


      {/* --- Section: Datos Persona Moral (Conditional) --- */}
      {tipoProveedor === 'moral' && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Datos Persona Moral</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {renderInput('razon_social', 'Razón Social', true)}
             {renderInput('nombre_representante', 'Nombre(s) Representante', true)}
             {renderInput('apellido_p_representante', 'Apellido Paterno Representante', true)}
             {renderInput('apellido_m_representante', 'Apellido Materno Representante')}
          </div>
        </div>
      )}

      {/* --- Section: Datos Persona Física (Conditional) --- */}
      {tipoProveedor === 'fisica' && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Datos Persona Física</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('nombre', 'Nombre(s)', true)}
                {renderInput('apellido_p', 'Apellido Paterno', true)}
                {renderInput('apellido_m', 'Apellido Materno')}
                {renderInput('curp', 'CURP', true)}
            </div>
        </div>
      )}

      {/* --- Submit Button --- */}
      {tipoProveedor && ( // Only show submit button after type selected
        <div className="pt-5">
            <div className="flex justify-end">
            <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
                {isLoading ? 'Registrando...' : 'Registrar Proveedor'}
            </button>
            </div>
        </div>
       )}
    </form>
  );
};

export default FormularioRegistroProveedor;