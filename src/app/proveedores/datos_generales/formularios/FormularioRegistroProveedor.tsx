'use client';
import React, { useState, useEffect } from 'react';
import { createProveedor } from './fetchprovedoores'; // Ajusta ruta
import { useRouter } from 'next/navigation';

// Interfaz para un objeto Representante Legal individual
interface RepresentanteData {
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante?: string;
    // Podrías añadir más campos aquí si son relevantes para el representante
}

// Interfaz para el estado principal del formulario
interface ProveedorFormData {
    rfc: string;
    tipoProveedor: 'fisica' | 'moral' | '';
    // Física
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    curp: string;
    // Moral (Solo info de la entidad)
    razon_social: string;
    // Comunes
    giro_comercial: string;
    actividadSat: string;
    correo: string;
    calle: string;
    numero: string;
    colonia: string;
    codigo_postal: string;
    municipio: string;
    estado: string;
    telefono_uno: string;
    telefono_dos: string;
    pagina_web: string;
    camara_comercial: string;
    numero_registro_camara: string;
    numero_registro_imss: string;
    proveedorEventos: boolean;
    aceptaAviso1: boolean;
    aceptaAviso2: boolean;
}


interface FormularioProps {
    idUsuarioProveedor: number;
    onSuccess: (data: any) => void;
}

export default function FormularioRegistroProveedor({ idUsuarioProveedor, onSuccess }: FormularioProps) {
    const router = useRouter();

    // Estado principal del formulario (sin campos de representante individuales)
    const [formData, setFormData] = useState<ProveedorFormData>({
        rfc: '',
        tipoProveedor: '',
        nombre: '',
        apellido_p: '',
        apellido_m: '',
        curp: '',
        razon_social: '', // Solo razón social para moral aquí
        giro_comercial: '',
        actividadSat: '',
        correo: '',
        calle: '',
        numero: '',
        colonia: '',
        codigo_postal: '',
        municipio: '',
        estado: '',
        telefono_uno: '',
        telefono_dos: '',
        pagina_web: '',
        camara_comercial: '',
        numero_registro_camara: '',
        numero_registro_imss: '',
        proveedorEventos: false,
        aceptaAviso1: false,
        aceptaAviso2: false,
    });

    // --- NUEVO: Estados para manejar múltiples representantes ---
    const [representantes, setRepresentantes] = useState<RepresentanteData[]>([]); // Array de representantes añadidos
    const [nuevoRepNombre, setNuevoRepNombre] = useState('');
    const [nuevoRepApellidoP, setNuevoRepApellidoP] = useState('');
    const [nuevoRepApellidoM, setNuevoRepApellidoM] = useState('');
    const [repError, setRepError] = useState<string | null>(null); // Errores específicos de la sección de representantes
    // --- FIN NUEVOS ESTADOS ---

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null); // Errores generales del formulario

    // --- handleChange (Maneja campos del formulario principal) ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setError(null); // Limpiar error general

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            // Manejar checkboxes del formulario principal
            if (name === 'aceptaAviso1' || name === 'aceptaAviso2' || name === 'proveedorEventos') {
                setFormData(prev => ({ ...prev, [name]: checked }));
            }
            // Añadir lógica si hay otros checkboxes principales
        } else {
            let finalValue = value;
            if (name === 'rfc' || name === 'curp') {
                finalValue = value.toUpperCase().trim();
            }
            // Actualizar solo campos que pertenecen a ProveedorFormData
            if (name in formData) {
                setFormData(prev => ({ ...prev, [name]: finalValue }));
            }
        }

        // Limpiar campos/estado de tipo opuesto
        if (name === 'tipoProveedor') {
            const limpiarMoral = { razon_social: '' };
            const limpiarFisica = { nombre: '', apellido_p: '', apellido_m: '', curp: '' };
            setRepresentantes([]); // Limpiar lista de representantes al cambiar tipo

            if (value === 'fisica') {
                setFormData(prev => ({ ...prev, tipoProveedor: 'fisica', ...limpiarMoral }));
            } else if (value === 'moral') {
                setFormData(prev => ({ ...prev, tipoProveedor: 'moral', ...limpiarFisica }));
            } else {
                setFormData(prev => ({ ...prev, tipoProveedor: '', ...limpiarMoral, ...limpiarFisica }));
            }
        }
    };
    // --- FIN handleChange ---

    // --- NUEVO: handleChange para los inputs del NUEVO representante ---
    const handleRepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRepError(null); // Limpiar error de representante
        if (name === 'nuevoRepNombre') setNuevoRepNombre(value);
        else if (name === 'nuevoRepApellidoP') setNuevoRepApellidoP(value);
        else if (name === 'nuevoRepApellidoM') setNuevoRepApellidoM(value);
    };
    // --- FIN handleRepChange ---

    // --- NUEVO: Añadir representante a la lista ---
    const handleAddRepresentante = () => {
        setRepError(null);
        // Validar campos del nuevo representante
        if (!nuevoRepNombre.trim() || !nuevoRepApellidoP.trim()) {
            setRepError('Nombre y Apellido Paterno del representante son obligatorios.');
            return;
        }

        const nuevoRepresentante: RepresentanteData = {
            nombre_representante: nuevoRepNombre.trim(),
            apellido_p_representante: nuevoRepApellidoP.trim(),
            apellido_m_representante: nuevoRepApellidoM.trim() || undefined, // Guardar undefined si está vacío
        };

        setRepresentantes(prev => [...prev, nuevoRepresentante]); // Añadir al array

        // Limpiar campos del formulario de nuevo representante
        setNuevoRepNombre('');
        setNuevoRepApellidoP('');
        setNuevoRepApellidoM('');
    };
    // --- FIN handleAddRepresentante ---

    // --- NUEVO: Eliminar representante de la lista ---
    const handleRemoveRepresentante = (indexToRemove: number) => {
        setRepresentantes(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    // --- FIN handleRemoveRepresentante ---


    // --- handleSubmit (ADAPTADO) ---
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Limpiar error general
        setRepError(null); // Limpiar error de rep

        // --- VALIDACIÓN (Adaptada) ---
        if (!formData.tipoProveedor) { setError('Seleccione el Tipo de Proveedor.'); return; }
        if (!formData.rfc || (formData.rfc.length !== 12 && formData.rfc.length !== 13)) { setError('RFC debe tener 12 o 13 caracteres.'); return; }
        if (!formData.actividadSat.trim()) { setError('Actividad Económica (SAT) obligatoria.'); return; }
        if (!formData.correo.trim() || !/\S+@\S+\.\S+/.test(formData.correo)) { setError('Correo electrónico inválido.'); return; }
        // ... validaciones comunes ...
        if (!formData.calle.trim() || !formData.numero.trim() || !formData.colonia.trim() || !formData.codigo_postal.trim() || !formData.municipio.trim() || !formData.estado.trim()) { setError('Todos los campos de dirección son obligatorios.'); return; }
        if (!formData.telefono_uno.trim()) { setError('Teléfono Principal obligatorio.'); return; }

        // Validación específica por tipo
        if (formData.tipoProveedor === 'fisica') {
            if (!formData.nombre.trim() || !formData.apellido_p.trim() || !formData.curp.trim()) { setError('Para Persona Física: Nombre, Apellido Paterno y CURP obligatorios.'); return; }
            if (formData.curp.length !== 18) { setError('CURP debe tener 18 caracteres.'); return; }
        } else if (formData.tipoProveedor === 'moral') {
            if (!formData.razon_social.trim()) { setError('Para Persona Moral: Razón Social obligatoria.'); return; }
            // **NUEVO: Validar que haya al menos un representante**
            if (representantes.length === 0) {
                setRepError('Debe añadir al menos un representante legal.'); // Mostrar error en sección de reps
                return;
            }
        }

        if (!formData.aceptaAviso1 || !formData.aceptaAviso2) { setError('Debe aceptar ambos Avisos de Privacidad.'); return; }
        // --- FIN VALIDACIÓN ---

        setIsSubmitting(true);

        try {
            // --- CONSTRUCCIÓN DEL PAYLOAD (Adaptado) ---
            let dataToSubmit: any = {
                id_usuario_proveedor: idUsuarioProveedor,
                tipoProveedor: formData.tipoProveedor,
                // Campos comunes siempre presentes
                rfc: formData.rfc,
                giro_comercial: formData.giro_comercial,
                actividadSat: formData.actividadSat,
                correo: formData.correo,
                calle: formData.calle,
                numero: formData.numero,
                colonia: formData.colonia,
                codigo_postal: formData.codigo_postal,
                municipio: formData.municipio,
                estado: formData.estado,
                telefono_uno: formData.telefono_uno,
                telefono_dos: formData.telefono_dos || null, // Enviar null si vacío
                pagina_web: formData.pagina_web || null,
                camara_comercial: formData.camara_comercial || null,
                numero_registro_camara: formData.numero_registro_camara || null,
                numero_registro_imss: formData.numero_registro_imss || null,
                proveedorEventos: formData.proveedorEventos,
                // No enviar aceptaAviso1/2 al backend
            };

            // Añadir campos específicos según el tipo
            if (formData.tipoProveedor === 'fisica') {
                dataToSubmit = {
                    ...dataToSubmit,
                    nombre: formData.nombre,
                    apellido_p: formData.apellido_p,
                    apellido_m: formData.apellido_m || null,
                    curp: formData.curp,
                };
            } else if (formData.tipoProveedor === 'moral') {
                dataToSubmit = {
                    ...dataToSubmit,
                    razon_social: formData.razon_social,
                    // **NUEVO: Enviar el array de representantes**
                    representantes: representantes,
                };
            }
            // --- FIN CONSTRUCCIÓN PAYLOAD ---

            console.log("FormularioRegistroProveedor: Enviando datos:", dataToSubmit);
            const result = await createProveedor(dataToSubmit);
            console.log("FormularioRegistroProveedor: Respuesta API:", result);
            onSuccess(result);

        } catch (err: any) {
            console.error("FormularioRegistroProveedor: Error al enviar:", err);
            setError(err.message || 'Ocurrió un error inesperado al registrar.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Función de clases dinámicas (Sin cambios) ---
    const getInputClasses = (fieldName: 'rfc' | 'curp'): string => {
        const baseClasses = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
        const value = formData[fieldName];
        const length = value.length;

        if (length === 0) {
            // Clase por defecto si está vacío
            return `${baseClasses} border-gray-300 focus:border-indigo-500 focus:ring-indigo-500`;
        }

        let isValidLength = false;
        if (fieldName === 'rfc') {
            isValidLength = length === 12 || length === 13;
        } else if (fieldName === 'curp') {
            isValidLength = length === 18;
        }

        if (isValidLength) {
            // Clases si la longitud es válida
            return `${baseClasses} border-green-500 focus:border-green-700 focus:ring-green-500`;
        } else {
            // Clases si la longitud es inválida (pero no vacío)
            return `${baseClasses} border-red-500 focus:border-red-700 focus:ring-red-500`;
        }
    };

    // --- Clases de estilo comunes (Sin cambios) ---
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const fieldsetStyle = "border border-gray-300 p-4 rounded-md mb-6";
    const legendStyle = "text-lg font-medium text-gray-700 px-2";
    const requiredMark = <span className="text-red-500">*</span>;
    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"; // Definir una clase base

    // --- RENDERIZADO ---
    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 shadow-xl rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Registro de Datos del Proveedor</h2>
            {error && (<div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">{error}</div>)}


            <div className="mb-4">
                <label htmlFor="tipoProveedor" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proveedor <span className="text-red-500">*</span></label>
                <select
                    id="tipoProveedor"
                    name="tipoProveedor"
                    value={formData.tipoProveedor}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">-- Seleccione --</option>
                    <option value="fisica">Persona Física</option>
                    <option value="moral">Persona Moral</option>
                </select>
            </div>

            {/* --- SECCIÓN PERSONA FÍSICA (Sin cambios en la estructura interna) --- */}
            {formData.tipoProveedor === 'fisica' && (
                <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                    <legend className="text-lg font-medium text-gray-700 px-2">Datos Persona Física</legend>
                    {/* Nombre, Apellidos, CURP */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="apellido_p" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                            <input type="text" id="apellido_p" name="apellido_p" value={formData.apellido_p} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="apellido_m" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                            <input type="text" id="apellido_m" name="apellido_m" value={formData.apellido_m} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="mb-1"> {/* Menos margen inferior para el helper text */}
                        <label htmlFor="curp" className={labelStyle}>CURP {requiredMark}</label>
                        <input
                            type="text"
                            id="curp"
                            name="curp"
                            value={formData.curp}
                            onChange={handleChange}
                            required
                            maxLength={18}
                            className={getInputClasses('curp')}
                            aria-invalid={formData.curp.length > 0 && formData.curp.length !== 18} // Para accesibilidad
                            aria-describedby="curp-helper"
                        />
                        {/* Helper text opcional */}
                        <p id="curp-helper" className={`text-xs mt-1 ${formData.curp.length === 18 ? 'text-green-600' : (formData.curp.length > 0 ? 'text-red-600' : 'text-gray-500')}`}>
                            {formData.curp.length} / 18 caracteres
                        </p>
                    </div>
                </fieldset>
            )}

            {/* --- SECCIÓN PERSONA MORAL (MODIFICADA) --- */}
            {formData.tipoProveedor === 'moral' && (
                <fieldset className={fieldsetStyle}>
                    <legend className={legendStyle}>Datos Persona Moral</legend>
                    {/* Razón Social (Único para la entidad) */}
                    <div className="mb-5">
                        <label htmlFor="razon_social" className={labelStyle}>Razón Social {requiredMark}</label>
                        <input type="text" id="razon_social" name="razon_social" value={formData.razon_social} onChange={handleChange} required className={inputStyle} />
                    </div>

                    {/* --- Sub-sección para Añadir Representantes --- */}
                    <div className="border border-dashed border-indigo-300 p-4 rounded-md bg-indigo-50 mb-4">
                        <p className="text-md font-semibold text-indigo-800 mb-3">Añadir Representante Legal</p>
                        {repError && <p className="text-red-600 text-sm mb-2">{repError}</p>}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="nuevoRepNombre" className={`${labelStyle} text-xs`}>Nombre(s) {requiredMark}</label>
                                <input type="text" id="nuevoRepNombre" name="nuevoRepNombre" value={nuevoRepNombre} onChange={handleRepChange} className={`${inputStyle} input-sm`} />
                            </div>
                            <div>
                                <label htmlFor="nuevoRepApellidoP" className={`${labelStyle} text-xs`}>Apellido Paterno {requiredMark}</label>
                                <input type="text" id="nuevoRepApellidoP" name="nuevoRepApellidoP" value={nuevoRepApellidoP} onChange={handleRepChange} className={`${inputStyle} input-sm`} />
                            </div>
                            <div>
                                <label htmlFor="nuevoRepApellidoM" className={`${labelStyle} text-xs`}>Apellido Materno</label>
                                <input type="text" id="nuevoRepApellidoM" name="nuevoRepApellidoM" value={nuevoRepApellidoM} onChange={handleRepChange} className={`${inputStyle} input-sm`} />
                            </div>
                        </div>
                        <button
                            type="button" // Importante: type="button" para no enviar el formulario
                            onClick={handleAddRepresentante}
                            className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            disabled={!nuevoRepNombre || !nuevoRepApellidoP || isSubmitting} // Deshabilitar si faltan campos o está enviando form principal
                        >
                            + Añadir Representante
                        </button>
                    </div>
                    {/* --- Fin Sub-sección --- */}

                    {/* --- Lista de Representantes Añadidos --- */}
                    {representantes.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Representantes Añadidos:</h4>
                            <ul className="space-y-2 list-disc list-inside pl-1 text-sm">
                                {representantes.map((rep, index) => (
                                    <li key={index} className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded">
                                        <span>{rep.nombre_representante} {rep.apellido_p_representante} {rep.apellido_m_representante || ''}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRepresentante(index)}
                                            className="ml-4 text-red-500 hover:text-red-700 text-xs font-semibold"
                                            title="Eliminar este representante"
                                            disabled={isSubmitting}
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {/* --- Fin Lista --- */}
                </fieldset>
            )}
            {/* --- FIN SECCIÓN PERSONA MORAL --- */}


            {/* --- SECCIÓN DATOS GENERALES / FISCALES --- */}
            <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-medium text-gray-700 px-2">Datos Generales y Fiscales</legend>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="rfc" className={labelStyle}>RFC {requiredMark}</label>
                        <input
                            type="text"
                            id="rfc"
                            name="rfc"
                            value={formData.rfc}
                            onChange={handleChange}
                            required
                            maxLength={13}
                            // **Aplicar clases dinámicas**
                            className={getInputClasses('rfc')}
                            aria-invalid={formData.rfc.length > 0 && formData.rfc.length !== 12 && formData.rfc.length !== 13}
                            aria-describedby="rfc-helper"
                        />
                        {/* Helper text opcional */}
                        <p id="rfc-helper" className={`text-xs mt-1 ${formData.rfc.length === 12 || formData.rfc.length === 13 ? 'text-green-600' : (formData.rfc.length > 0 ? 'text-red-600' : 'text-gray-500')}`}>
                            {formData.rfc.length} / 12 ó 13 caracteres
                        </p>
                    </div>
                    <div>
                        <label htmlFor="giro_comercial" className="block text-sm font-medium text-gray-700 mb-1">Giro Comercial</label>
                        <input type="text" id="giro_comercial" name="giro_comercial" value={formData.giro_comercial} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                {/* <<<--- NUEVO CAMPO: ACTIVIDAD SAT --- >>> */}
                <div className="mb-4">
                    <label htmlFor="actividadSat" className="block text-sm font-medium text-gray-700 mb-1">
                        Actividad Económica (SAT) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="actividadSat"
                        name="actividadSat"
                        value={formData.actividadSat}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ej. Servicios de consultoría en informática"
                    />
                </div>
                {/* <<<--- FIN NUEVO CAMPO --- >>> */}

                <div className="mb-4">
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="camara_comercial" className="block text-sm font-medium text-gray-700 mb-1">Cámara Comercial</label>
                        <input type="text" id="camara_comercial" name="camara_comercial" value={formData.camara_comercial} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="numero_registro_camara" className="block text-sm font-medium text-gray-700 mb-1">No. Registro Cámara</label>
                        <input type="text" id="numero_registro_camara" name="numero_registro_camara" value={formData.numero_registro_camara} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="numero_registro_imss" className="block text-sm font-medium text-gray-700 mb-1">No. Registro IMSS</label>
                        <input type="text" id="numero_registro_imss" name="numero_registro_imss" value={formData.numero_registro_imss} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>

                {/* <<<--- NUEVO CAMPO: PROVEEDOR EVENTOS (CHECKBOX) --- >>> */}
                <div className="mb-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="proveedorEventos"
                            name="proveedorEventos"
                            checked={formData.proveedorEventos}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="proveedorEventos" className="ml-2 block text-sm text-gray-900">
                            ¿Proveedor relevante para eventos? (Implica posible documentación adicional)
                        </label>
                    </div>
                </div>
                {/* <<<--- FIN NUEVO CAMPO --- >>> */}

            </fieldset>
            {/* --- SECCIÓN DIRECCIÓN --- */}
            <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-medium text-gray-700 px-2">Dirección</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label htmlFor="calle" className="block text-sm font-medium text-gray-700 mb-1">Calle <span className="text-red-500">*</span></label>
                        <input type="text" id="calle" name="calle" value={formData.calle} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">Número (Ext/Int) <span className="text-red-500">*</span></label>
                        <input type="text" id="numero" name="numero" value={formData.numero} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="colonia" className="block text-sm font-medium text-gray-700 mb-1">Colonia <span className="text-red-500">*</span></label>
                        <input type="text" id="colonia" name="colonia" value={formData.colonia} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="codigo_postal" className="block text-sm font-medium text-gray-700 mb-1">Código Postal <span className="text-red-500">*</span></label>
                        <input type="text" id="codigo_postal" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} required maxLength={5} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-1">Municipio/Alcaldía <span className="text-red-500">*</span></label>
                        <input type="text" id="municipio" name="municipio" value={formData.municipio} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado <span className="text-red-500">*</span></label>
                    <input type="text" id="estado" name="estado" value={formData.estado} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </fieldset>
            {/* --- SECCIÓN CONTACTO --- */}
            <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-medium text-gray-700 px-2">Contacto</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="telefono_uno" className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal <span className="text-red-500">*</span></label>
                        <input type="tel" id="telefono_uno" name="telefono_uno" value={formData.telefono_uno} onChange={handleChange} required maxLength={12} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="telefono_dos" className="block text-sm font-medium text-gray-700 mb-1">Teléfono Secundario</label>
                        <input type="tel" id="telefono_dos" name="telefono_dos" value={formData.telefono_dos} onChange={handleChange} maxLength={12} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="pagina_web" className="block text-sm font-medium text-gray-700 mb-1">Página Web</label>
                    <input type="url" id="pagina_web" name="pagina_web" value={formData.pagina_web} onChange={handleChange} placeholder="https://ejemplo.com" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
            </fieldset>
            {/* --- **NUEVO: SECCIÓN AVISOS DE PRIVACIDAD** --- */}
            <fieldset className={`border-yellow-400 bg-yellow-50`}>
                <legend className={`text-yellow-800`}>Avisos de Privacidad</legend>
                <div className="space-y-4 mt-2">
                    {/* Aviso 1 */}
                    <div className="flex items-start">
                        <input
                            id="aceptaAviso1"
                            name="aceptaAviso1"
                            type="checkbox"
                            checked={formData.aceptaAviso1}
                            onChange={handleChange}
                            className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-400 rounded"
                            required // HTML5 validation (opcional si ya validas en JS)
                        />
                        <label htmlFor="aceptaAviso1" className="ml-3 block text-sm text-gray-800">
                            He leído y acepto el <a href="/aviso-privacidad-general" target="_blank" className="font-medium text-indigo-600 hover:text-indigo-800 underline">Aviso de Privacidad General</a>.
                            {/* Reemplaza '/aviso-privacidad-general' con la ruta real */}
                        </label>
                    </div>
                    {/* Aviso 2 */}
                    <div className="flex items-start">
                        <input
                            id="aceptaAviso2"
                            name="aceptaAviso2"
                            type="checkbox"
                            checked={formData.aceptaAviso2}
                            onChange={handleChange}
                            className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-400 rounded"
                            required
                        />
                        <label htmlFor="aceptaAviso2" className="ml-3 block text-sm text-gray-800">
                            Entiendo y acepto las <a href="/condiciones-uso-proveedores" target="_blank" className="font-medium text-indigo-600 hover:text-indigo-800 underline ">Condiciones de Uso para Proveedores</a>.
                        </label>
                    </div>
                </div>
            </fieldset>
            {/* --- FIN SECCIÓN AVISOS --- */}

            {/* --- BOTÓN DE ENVÍO --- */}
            <div className="mt-8 text-right">
                <button
                    type="submit"
                    disabled={isSubmitting || !formData.aceptaAviso1 || !formData.aceptaAviso2}
                    className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${(isSubmitting || !formData.aceptaAviso1 || !formData.aceptaAviso2)
                            ? 'bg-gray-400 cursor-not-allowed' // Estilo deshabilitado
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' // Estilo habilitado
                        }`}
                    title={!formData.aceptaAviso1 || !formData.aceptaAviso2 ? "Debe aceptar ambos avisos de privacidad para registrar" : ""} // Tooltip opcional
                >
                    {isSubmitting ? 'Registrando...' : 'Registrar Proveedor'}
                </button>
            </div>
        </form>
    );
}