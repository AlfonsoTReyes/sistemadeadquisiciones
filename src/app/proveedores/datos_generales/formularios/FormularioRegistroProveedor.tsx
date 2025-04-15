'use client';
import React, { useState } from 'react';
import { createProveedor } from './fetchprovedoores'; // Ajusta la ruta a tu archivo fetch
import { useRouter } from 'next/navigation'; // Para posible navegación tras error

// Define la interfaz para los datos del formulario (¡incluye los nuevos campos!)
interface ProveedorFormData {
    rfc: string;
    // Tipo de proveedor (fundamental para lógica condicional)
    tipoProveedor: 'fisica' | 'moral' | ''; // Iniciar como vacío o tipo por defecto
    // Campos Persona Física
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    curp: string;
    // Campos Persona Moral
    razon_social: string;
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante: string;
    // Campos Comunes
    giro_comercial: string;
    actividadSat: string;       // <-- NUEVO CAMPO (Actividad SAT)
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
    proveedorEventos: boolean; // <-- NUEVO CAMPO (Checkbox)
    // Campos que no suelen estar en el formulario inicial pero podrían añadirse:
    // acta_constitutiva: string; // Moral - Usualmente es carga de archivo
    // poder_notarial: string; // Moral - Usualmente es carga de archivo
}


interface FormularioProps {
    idUsuarioProveedor: number; // Recibe el ID del usuario logueado
    onSuccess: (data: any) => void; // Función a llamar en caso de éxito
}

export default function FormularioRegistroProveedor({ idUsuarioProveedor, onSuccess }: FormularioProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<ProveedorFormData>({
        rfc: '',
        tipoProveedor: '', // Iniciar sin seleccionar o con un default
        // Física
        nombre: '',
        apellido_p: '',
        apellido_m: '',
        curp: '',
        // Moral
        razon_social: '',
        nombre_representante: '',
        apellido_p_representante: '',
        apellido_m_representante: '',
        // Comunes
        giro_comercial: '',
        actividadSat: '',       // <-- Inicializar nuevo campo
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
        proveedorEventos: false, // <-- Inicializar checkbox como false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // Manejo especial para checkboxes
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Limpiar campos del tipo opuesto al seleccionar
        if (name === 'tipoProveedor') {
            if (value === 'fisica') {
                setFormData(prev => ({
                    ...prev,
                    tipoProveedor: 'fisica',
                    razon_social: '',
                    nombre_representante: '',
                    apellido_p_representante: '',
                    apellido_m_representante: '',
                }));
            } else if (value === 'moral') {
                setFormData(prev => ({
                    ...prev,
                    tipoProveedor: 'moral',
                    nombre: '',
                    apellido_p: '',
                    apellido_m: '',
                    curp: '',
                }));
            } else {
                 // Si vuelve a 'seleccione' (o ''), limpiar ambos
                 setFormData(prev => ({
                    ...prev,
                    tipoProveedor: '',
                    razon_social: '', nombre_representante: '', apellido_p_representante: '', apellido_m_representante: '',
                    nombre: '', apellido_p: '', apellido_m: '', curp: '',
                 }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Limpiar errores previos

        // --- VALIDACIÓN CLIENT-SIDE ---
        if (!formData.tipoProveedor) {
            setError('Por favor, seleccione el Tipo de Proveedor (Persona Física o Moral).');
            return;
        }
        if (!formData.rfc.trim()) {
            setError('El campo RFC es obligatorio.');
            return;
        }
         if (!formData.actividadSat.trim()) { // <-- Validar nuevo campo requerido
             setError('El campo "Actividad Económica (SAT)" es obligatorio.');
             return;
         }
        if (!formData.correo.trim() || !/\S+@\S+\.\S+/.test(formData.correo)) {
            setError('Por favor, ingrese un correo electrónico válido.');
            return;
        }
         // ... añadir más validaciones para campos comunes requeridos (calle, cp, etc.)

        // Validación específica por tipo
        if (formData.tipoProveedor === 'fisica') {
            if (!formData.nombre.trim() || !formData.apellido_p.trim() || !formData.curp.trim()) {
                setError('Para Persona Física, Nombre, Apellido Paterno y CURP son obligatorios.');
                return;
            }
        } else if (formData.tipoProveedor === 'moral') {
            if (!formData.razon_social.trim() || !formData.nombre_representante.trim() || !formData.apellido_p_representante.trim()) {
                setError('Para Persona Moral, Razón Social, Nombre y Apellido Paterno del Representante son obligatorios.');
                return;
            }
        }
        // --- FIN VALIDACIÓN ---


        setIsSubmitting(true);

        try {
            // Prepara el objeto final a enviar, asegurándose de incluir el idUsuarioProveedor
            const dataToSubmit = {
                ...formData,
                id_usuario_proveedor: idUsuarioProveedor,
            };

            console.log("FormularioRegistroProveedor: Enviando datos:", dataToSubmit); // Debug
            const result = await createProveedor(dataToSubmit);
            console.log("FormularioRegistroProveedor: Respuesta API:", result); // Debug
            onSuccess(result); // Llama a la función de éxito del padre

        } catch (err: any) {
            console.error("FormularioRegistroProveedor: Error al enviar:", err);
            setError(err.message || 'Ocurrió un error inesperado al registrar.');
            // Considerar si redirigir a login en caso de error 401/403
            // if (err.status === 401 || err.status === 403) router.push('/proveedores/login');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Registro de Datos del Proveedor</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                    {error}
                </div>
            )}

            {/* --- SECCIÓN TIPO DE PROVEEDOR --- */}
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

             {/* --- SECCIÓN PERSONA FÍSICA (Condicional) --- */}
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
                     <div className="mb-4">
                        <label htmlFor="curp" className="block text-sm font-medium text-gray-700 mb-1">CURP <span className="text-red-500">*</span></label>
                        <input type="text" id="curp" name="curp" value={formData.curp} onChange={handleChange} required maxLength={18} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </fieldset>
             )}

             {/* --- SECCIÓN PERSONA MORAL (Condicional) --- */}
             {formData.tipoProveedor === 'moral' && (
                 <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                    <legend className="text-lg font-medium text-gray-700 px-2">Datos Persona Moral</legend>
                     {/* Razón Social */}
                     <div className="mb-4">
                        <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700 mb-1">Razón Social <span className="text-red-500">*</span></label>
                        <input type="text" id="razon_social" name="razon_social" value={formData.razon_social} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                     </div>
                     {/* Datos Representante Legal */}
                    <p className="text-md font-medium text-gray-600 mb-2">Representante Legal</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="nombre_representante" className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                            <input type="text" id="nombre_representante" name="nombre_representante" value={formData.nombre_representante} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                         <div>
                            <label htmlFor="apellido_p_representante" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                            <input type="text" id="apellido_p_representante" name="apellido_p_representante" value={formData.apellido_p_representante} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                         <div>
                            <label htmlFor="apellido_m_representante" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                            <input type="text" id="apellido_m_representante" name="apellido_m_representante" value={formData.apellido_m_representante} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                     {/* Aquí irían campos para Acta Constitutiva / Poder Notarial si fueran inputs de texto o referencias */}
                 </fieldset>
             )}


            {/* --- SECCIÓN DATOS GENERALES / FISCALES --- */}
            <fieldset className="border border-gray-300 p-4 rounded-md mb-6">
                <legend className="text-lg font-medium text-gray-700 px-2">Datos Generales y Fiscales</legend>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="rfc" className="block text-sm font-medium text-gray-700 mb-1">RFC <span className="text-red-500">*</span></label>
                        <input type="text" id="rfc" name="rfc" value={formData.rfc} onChange={handleChange} required maxLength={13} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
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

            {/* --- BOTÓN DE ENVÍO --- */}
            <div className="mt-6 text-right">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                >
                    {isSubmitting ? 'Registrando...' : 'Registrar Proveedor'}
                </button>
            </div>
        </form>
    );
}

// Helper para estilos comunes de input (opcional, puedes usar clases de Tailwind directamente)
// Asegúrate de definir '.input-estilo' en tu CSS global o usar clases de Tailwind en cada input:
// className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"