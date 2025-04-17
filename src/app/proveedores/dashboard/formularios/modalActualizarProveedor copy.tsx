// --- START OF FILE src/app/proveedores/dashboard/formularios/ModalActualizarProveedor.tsx ---
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { updateProveedor } from './fetchdashboard'; // Asegúrate que la ruta es correcta

// Interfaz para los datos que vienen de la API (props)
interface ProveedorDataFromAPI {
    id_proveedor: number;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    rfc?: string;
    giro_comercial?: string | null;
    actividad_sat?: string | null; // snake_case de la API
    correo?: string | null;
    calle?: string | null;
    numero?: string | null;
    colonia?: string | null;
    codigo_postal?: string | null;
    municipio?: string | null;
    estado?: string | null;
    telefono_uno?: string | null;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    proveedor_eventos?: boolean | null; // snake_case de la API
    // Campos específicos
    razon_social?: string | null;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;
    // ... otros campos que pueda devolver tu API ...
    estatus?: boolean; // Si es editable o relevante mostrarlo
    [key: string]: any; // Para flexibilidad
}

// Interfaz para el estado interno del formulario (camelCase)
interface ProveedorFormData {
    rfc: string;
    tipoProveedor: 'moral' | 'fisica' | ''; // Mantenemos para lógica condicional
    // Física
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    curp: string;
    // Moral
    razon_social: string;
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante: string;
    // Comunes
    giro_comercial: string;
    actividadSat: string;       // <--- camelCase para el estado/form
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
    proveedorEventos: boolean; // <--- camelCase para el estado/form
    // estatus?: boolean; // Incluir si es editable
}


// Props del componente Modal
interface ModalProps {
    isOpen: boolean;
    onClose: () => void; // Función para cerrar
    proveedorData: ProveedorDataFromAPI; // Datos actuales para prellenar
    onUpdateSuccess: () => void; // Callback al guardar con éxito
}

// --- Componente ---
export default function ModalActualizarProveedor({
    isOpen,
    onClose,
    proveedorData,
    onUpdateSuccess
}: ModalProps) {

    // Función para mapear datos de API (snake_case) a estado de formulario (camelCase)
    const mapApiToFormData = useCallback((apiData: ProveedorDataFromAPI): ProveedorFormData => {
       return {
            rfc: apiData.rfc || '',
            tipoProveedor: apiData.tipo_proveedor === 'moral' ? 'moral' : (apiData.tipo_proveedor === 'fisica' ? 'fisica' : ''),
            nombre: apiData.nombre_fisica || '',
            apellido_p: apiData.apellido_p_fisica || '',
            apellido_m: apiData.apellido_m_fisica || '',
            curp: apiData.curp || '',
            razon_social: apiData.razon_social || '',
            nombre_representante: apiData.nombre_representante || '',
            apellido_p_representante: apiData.apellido_p_representante || '',
            apellido_m_representante: apiData.apellido_m_representante || '',
            giro_comercial: apiData.giro_comercial || '',
            actividadSat: apiData.actividad_sat || '', // Mapeo
            correo: apiData.correo || '',
            calle: apiData.calle || '',
            numero: apiData.numero || '',
            colonia: apiData.colonia || '',
            codigo_postal: apiData.codigo_postal || '',
            municipio: apiData.municipio || '',
            estado: apiData.estado || '',
            telefono_uno: apiData.telefono_uno || '',
            telefono_dos: apiData.telefono_dos || '',
            pagina_web: apiData.pagina_web || '',
            camara_comercial: apiData.camara_comercial || '',
            numero_registro_camara: apiData.numero_registro_camara || '',
            numero_registro_imss: apiData.numero_registro_imss || '',
            proveedorEventos: apiData.proveedor_eventos || false, // Mapeo
            // estatus: apiData.estatus === undefined ? true : apiData.estatus, // Manejar estatus si es editable
        };
    }, []);

    // Estado local para el formulario
    const [formData, setFormData] = useState<ProveedorFormData>(() => mapApiToFormData(proveedorData));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Efecto para resetear el formulario si los datos iniciales cambian (cuando se reabre el modal)
    useEffect(() => {
        console.log("Modal: proveedorData prop changed, resetting form state.");
        setFormData(mapApiToFormData(proveedorData));
        setError(null); // Limpiar errores al reabrir/refrescar
        setIsSubmitting(false); // Asegurarse que no esté en estado de envío
    }, [proveedorData, mapApiToFormData]); // Depender de los datos y la función de mapeo

    // Handler genérico para cambios en inputs/selects/textareas
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            console.log(`Modal handleChange: Checkbox "${name}" changed to ${checked}`);
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            console.log(`Modal handleChange: Input "${name}" changed to "${value}"`);
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handler para el envío del formulario
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Limpiar error antes de validar/enviar

        // --- Validación Client-Side (Esencial) ---
        if (!formData.rfc || formData.rfc.trim().length < 12) { // Ejemplo de validación RFC básica
            setError('El RFC es obligatorio y debe tener al menos 12 caracteres.'); return;
        }
        if (!formData.actividadSat || formData.actividadSat.trim() === '') {
             setError('La Actividad Económica (SAT) es obligatoria.'); return;
        }
        if (!formData.correo || !/\S+@\S+\.\S+/.test(formData.correo)) {
            setError('Ingrese un correo electrónico válido.'); return;
        }
         if (!formData.calle || !formData.numero || !formData.colonia || !formData.codigo_postal || !formData.municipio || !formData.estado ) {
            setError('Todos los campos de dirección son obligatorios.'); return;
        }
         if (!formData.telefono_uno) {
            setError('El Teléfono Principal es obligatorio.'); return;
        }
        // Validación específica por tipo
        if (formData.tipoProveedor === 'fisica') {
            if (!formData.nombre || !formData.apellido_p || !formData.curp) {
                setError('Para Persona Física: Nombre, Apellido Paterno y CURP son obligatorios.'); return;
            }
             if (formData.curp.trim().length !== 18) {
                 setError('El CURP debe tener 18 caracteres.'); return;
             }
        } else if (formData.tipoProveedor === 'moral') {
            if (!formData.razon_social || !formData.nombre_representante || !formData.apellido_p_representante) {
                setError('Para Persona Moral: Razón Social, Nombre y Apellido Paterno del Representante son obligatorios.'); return;
            }
        } else {
            setError('Error interno: Tipo de proveedor no determinado.'); return; // No debería pasar si se inicializa bien
        }
        // --- Fin Validación ---

        setIsSubmitting(true); // Iniciar estado de carga

        try {
            // Objeto listo para enviar a la API (ya incluye id_proveedor)
            const dataToSubmit = {
                id_proveedor: proveedorData.id_proveedor, // Tomado de los props originales
                ...formData, // Todos los campos del estado del formulario (camelCase)
                // La API / Servicio debe manejar la conversión camelCase -> snake_case si es necesario,
                // o aceptar camelCase directamente. Si la API ESPERA snake_case, la conversión
                // debe hacerse aquí o en la capa fetch ANTES de enviar.
                // Asumiendo que la API/Servicio maneja camelCase o la conversión:
            };

            console.log("ModalActualizarProveedor: Enviando datos para API:", dataToSubmit);
            await updateProveedor(dataToSubmit); // Llama a la función fetch
            console.log("ModalActualizarProveedor: Update API call successful.");

            onUpdateSuccess(); // Llama al callback del padre (que usualmente cierra y refresca)

        } catch (err: any) {
            console.error("ModalActualizarProveedor: Error durante el envío:", err);
            // Mostrar el mensaje de error de la API o uno genérico
            setError(err.message || 'Ocurrió un error al intentar guardar los cambios.');
            // NO llamar a onClose ni onUpdateSuccess en caso de error
        } finally {
            setIsSubmitting(false); // Terminar estado de carga
        }
    };

    // Renderizado del Modal
    if (!isOpen) {
        return null; // No renderizar si no está abierto
    }

    // Clases de estilo comunes para inputs (ejemplo)
    const inputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const readOnlyStyle = `${inputStyle} bg-gray-100 cursor-not-allowed`;

    return (
        // Overlay
        <div className="fixed inset-0 bg-gray-800 bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
            {/* Contenedor del Modal */}
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100">
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Actualizar Información</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting} // Deshabilitar mientras guarda
                        className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-semibold outline-none focus:outline-none disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} noValidate>
                    {/* Mensaje de Error */}
                    {error && (
                        <div className="mb-5 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* --- SECCIONES DEL FORMULARIO --- */}

                    {/* Tipo Proveedor (No editable) */}
                    <div className="mb-4">
                         <label htmlFor="modal_tipoProveedor_display" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proveedor</label>
                         <input
                            type="text"
                            id="modal_tipoProveedor_display"
                            value={formData.tipoProveedor === 'moral' ? 'Persona Moral' : (formData.tipoProveedor === 'fisica' ? 'Persona Física' : 'Indefinido')}
                            readOnly
                            className={readOnlyStyle}
                         />
                         {/* Es importante enviar el valor real ('moral'/'fisica') aunque el input visible sea texto */}
                         <input type="hidden" name="tipoProveedor" value={formData.tipoProveedor|| ''} />
                    </div>

                     {/* --- Secciones Condicionales --- */}
                     {formData.tipoProveedor === 'fisica' && (
                        <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                           <legend className="text-base font-medium text-gray-700 px-2 mb-2">Datos Persona Física</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="modal_nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_nombre" name="nombre" value={formData.nombre|| ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_p" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_apellido_p" name="apellido_p" value={formData.apellido_p|| ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_m" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                                    <input type="text" id="modal_apellido_m" name="apellido_m" value={formData.apellido_m|| ''} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                             <div className="mt-4">
                                <label htmlFor="modal_curp" className="block text-sm font-medium text-gray-700 mb-1">CURP <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_curp" name="curp" value={formData.curp|| ''} onChange={handleChange} required maxLength={18} minLength={18} className={inputStyle} />
                            </div>
                        </fieldset>
                     )}
                      {formData.tipoProveedor === 'moral' && (
                         <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                           <legend className="text-base font-medium text-gray-700 px-2 mb-2">Datos Persona Moral</legend>
                            <div className="mb-4">
                                <label htmlFor="modal_razon_social" className="block text-sm font-medium text-gray-700 mb-1">Razón Social <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_razon_social" name="razon_social" value={formData.razon_social|| ''} onChange={handleChange} required className={inputStyle} />
                             </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Representante Legal</p>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="modal_nombre_representante" className="block text-xs font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_nombre_representante" name="nombre_representante" value={formData.nombre_representante|| ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_p_representante" className="block text-xs font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_apellido_p_representante" name="apellido_p_representante" value={formData.apellido_p_representante|| ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_m_representante" className="block text-xs font-medium text-gray-700 mb-1">Apellido Materno</label>
                                    <input type="text" id="modal_apellido_m_representante" name="apellido_m_representante" value={formData.apellido_m_representante|| ''} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                         </fieldset>
                     )}

                    {/* --- Datos Generales y Fiscales --- */}
                     <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                         <legend className="text-base font-medium text-gray-700 px-2 mb-2">Datos Generales y Fiscales</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <div>
                                <label htmlFor="modal_rfc" className="block text-sm font-medium text-gray-700 mb-1">RFC <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_rfc" name="rfc" value={formData.rfc|| ''} onChange={handleChange} required maxLength={13} minLength={12} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_giro_comercial" className="block text-sm font-medium text-gray-700 mb-1">Giro Comercial</label>
                                <input type="text" id="modal_giro_comercial" name="giro_comercial" value={formData.giro_comercial|| ''} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                        {/* --- Actividad SAT --- */}
                        <div className="mb-4">
                            <label htmlFor="modal_actividadSat" className="block text-sm font-medium text-gray-700 mb-1">
                                Actividad Económica (SAT) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="modal_actividadSat"
                                name="actividadSat" // camelCase
                                value={formData.actividadSat|| ''}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                                placeholder="Descripción según Constancia de Situación Fiscal"
                            />
                        </div>
                        {/* --- Correo --- */}
                        <div className="mb-4">
                            <label htmlFor="modal_correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                            <input type="email" id="modal_correo" name="correo" value={formData.correo|| ''} onChange={handleChange} required className={inputStyle} />
                        </div>
                         {/* --- Registros --- */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label htmlFor="modal_camara_comercial" className="block text-sm font-medium text-gray-700 mb-1">Cámara Comercial</label>
                                <input type="text" id="modal_camara_comercial" name="camara_comercial" value={formData.camara_comercial|| ''} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_numero_registro_camara" className="block text-sm font-medium text-gray-700 mb-1">No. Registro Cámara</label>
                                <input type="text" id="modal_numero_registro_camara" name="numero_registro_camara" value={formData.numero_registro_camara|| ''} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_numero_registro_imss" className="block text-sm font-medium text-gray-700 mb-1">No. Registro IMSS</label>
                                <input type="text" id="modal_numero_registro_imss" name="numero_registro_imss" value={formData.numero_registro_imss|| ''} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                        {/* --- Proveedor Eventos --- */}
                        <div className="mb-1"> {/* Menos margen inferior para el checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="modal_proveedorEventos"
                                    name="proveedorEventos" // camelCase
                                    checked={formData.proveedorEventos || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="modal_proveedorEventos" className="ml-2 block text-sm text-gray-900">
                                    Proveedor relevante para eventos
                                </label>
                            </div>
                        </div>
                     </fieldset>

                    {/* --- Dirección --- */}
                     <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                         <legend className="text-base font-medium text-gray-700 px-2 mb-2">Dirección</legend>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <label htmlFor="modal_calle" className="block text-sm font-medium text-gray-700 mb-1">Calle <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_calle" name="calle" value={formData.calle|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_numero" className="block text-sm font-medium text-gray-700 mb-1">Número (Ext/Int) <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_numero" name="numero" value={formData.numero|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label htmlFor="modal_colonia" className="block text-sm font-medium text-gray-700 mb-1">Colonia <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_colonia" name="colonia" value={formData.colonia|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="modal_codigo_postal" className="block text-sm font-medium text-gray-700 mb-1">Código Postal <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_codigo_postal" name="codigo_postal" value={formData.codigo_postal|| ''} onChange={handleChange} required maxLength={5} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_municipio" className="block text-sm font-medium text-gray-700 mb-1">Municipio/Alcaldía <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_municipio" name="municipio" value={formData.municipio|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>
                        <div className="mb-1">
                            <label htmlFor="modal_estado" className="block text-sm font-medium text-gray-700 mb-1">Estado <span className="text-red-500">*</span></label>
                            <input type="text" id="modal_estado" name="estado" value={formData.estado|| ''} onChange={handleChange} required className={inputStyle} />
                        </div>
                    </fieldset>

                    {/* --- Contacto --- */}
                    <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                         <legend className="text-base font-medium text-gray-700 px-2 mb-2">Contacto</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="modal_telefono_uno" className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal <span className="text-red-500">*</span></label>
                                <input type="tel" id="modal_telefono_uno" name="telefono_uno" value={formData.telefono_uno|| ''} onChange={handleChange} required maxLength={12} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_telefono_dos" className="block text-sm font-medium text-gray-700 mb-1">Teléfono Secundario</label>
                                <input type="tel" id="modal_telefono_dos" name="telefono_dos" value={formData.telefono_dos|| ''} onChange={handleChange} maxLength={12} className={inputStyle} />
                            </div>
                        </div>
                        <div className="mb-1">
                            <label htmlFor="modal_pagina_web" className="block text-sm font-medium text-gray-700 mb-1">Página Web</label>
                            <input type="url" id="modal_pagina_web" name="pagina_web" value={formData.pagina_web|| ''} onChange={handleChange} placeholder="https://ejemplo.com" className={inputStyle} />
                        </div>
                    </fieldset>

                    {/* --- Botones de Acción del Modal --- */}
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${
                                isSubmitting
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            } disabled:opacity-60`}
                        >
                            {isSubmitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// --- END OF FILE ---