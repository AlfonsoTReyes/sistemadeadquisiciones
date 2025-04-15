// --- START OF FILE src/app/proveedores/dashboard/formularios/modalActualizarProveedor.tsx ---
'use client';
import React, { useState, useEffect, useCallback } from 'react';
// import { updateProveedor } from './fetchdashboard'; // El modal no llama a fetch directamente en esta estructura

// --- INTERFACES (Mantenidas como antes, incluyendo nuevos campos) ---
interface ProveedorModalData { // Datos recibidos como prop
    id_proveedor: number;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    rfc?: string;
    giro_comercial?: string | null;
    actividad_sat?: string | null;
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
    proveedor_eventos?: boolean | null;
    razon_social?: string | null;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;
    [key: string]: any;
}

interface ProveedorFormData { // Estado interno del formulario
    rfc: string;
    // tipoProveedor: 'moral' | 'fisica' | ''; // No necesario en el form state si no es editable
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    curp: string;
    razon_social: string;
    nombre_representante: string;
    apellido_p_representante: string;
    apellido_m_representante: string;
    giro_comercial: string;
    actividadSat: string; // camelCase
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
    proveedorEventos: boolean; // camelCase
}

// --- 3. PROPS DEL MODAL (CORREGIDO) ---
interface ModalProps {
  isOpen: boolean; // Controla si el modal está visible
  onClose: () => void; // Función para cerrar
  // **CAMBIO: Esperar la prop como 'proveedorData'**
  proveedorData: ProveedorModalData; // Datos iniciales para prellenar
  onSubmit: (payload: any) => Promise<void>; // Función para guardar (recibe el payload del form)
  isLoading: boolean; // Estado de carga externo
  error: string | null; // Errores externos
}

// --- Componente Modal ---
const ModalActualizarProveedor: React.FC<ModalProps> = ({
  isOpen, // Usar isOpen para controlar renderizado
  onClose,
  // **CAMBIO: Recibir la prop como 'proveedorData'**
  proveedorData,
  onSubmit, // onSubmit llama a handleSaveProfileUpdate en el padre
  isLoading, // Para mostrar estado de carga del guardado
  error: apiError, // Para mostrar errores del guardado
}) => {

    // **Verificación temprana**: Si no hay datos, no intentes mapear.
    // Aunque el padre no debería renderizar el modal sin datos, esto es una salvaguarda.
    if (!proveedorData) {
        console.error("ModalActualizarProveedor: Se intentó renderizar sin 'proveedorData'.");
        return null; // O mostrar un mensaje de error interno
    }

    console.log("MODAL RECIBIÓ DATOS (Prop 'proveedorData'):", proveedorData);

    // --- 4. ESTADO DEL FORMULARIO (Ahora usa 'proveedorData') ---
    const mapApiToForm = useCallback((apiData: ProveedorModalData | null): ProveedorFormData => {
        // Si apiData es null o undefined, devuelve un estado inicial vacío
        if (!apiData) {
             console.warn("mapApiToForm recibió datos nulos, devolviendo estado vacío.");
             return {
                rfc: '', giro_comercial: '', correo: '', calle: '', numero: '', colonia: '', codigo_postal: '', municipio: '', estado: '', telefono_uno: '', telefono_dos: '', pagina_web: '', camara_comercial: '', numero_registro_camara: '', numero_registro_imss: '', actividadSat: '', proveedorEventos: false, razon_social: '', nombre_representante: '', apellido_p_representante: '', apellido_m_representante: '', nombre: '', apellido_p: '', apellido_m: '', curp: '',
            };
        }
        // Si hay datos, mapea como antes
        return {
            rfc: apiData.rfc || '',
            // tipoProveedor ya no está en el form state
            nombre: apiData.nombre_fisica || '', // Mapea desde _fisica
            apellido_p: apiData.apellido_p_fisica || '', // Mapea desde _fisica
            apellido_m: apiData.apellido_m_fisica || '', // Mapea desde _fisica
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
        };
    }, []); // useCallback sin dependencias externas ahora

    // **CAMBIO: Usar 'proveedorData' en la inicialización de useState**
    const [form, setForm] = useState<ProveedorFormData>(() => mapApiToForm(proveedorData));

    // Guardar el tipo original para lógica condicional (no editable)
    const [tipoProveedorOriginal] = useState<'moral' | 'fisica' | 'desconocido'>(proveedorData.tipo_proveedor || 'desconocido');

    // Estado para errores INTERNOS de validación del formulario
    const [formError, setFormError] = useState<string | null>(null);

    // --- Efecto para resetear el form si los datos iniciales cambian ---
    // **CAMBIO: Usar 'proveedorData' como dependencia**
    useEffect(() => {
        if (proveedorData) { // Asegurar que no sea null/undefined
             console.log("Modal useEffect: Reseteando estado del form por cambio en proveedorData");
             setForm(mapApiToForm(proveedorData));
             setFormError(null);
        } else {
             console.warn("Modal useEffect: proveedorData es null/undefined, no se puede resetear form.");
        }
    }, [proveedorData, mapApiToForm]);

    // --- Handler para cambios en inputs (sin cambios) ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormError(null);
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setForm(prev => ({ ...prev, [name]: checked }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Handler para enviar (sin cambios en la lógica de construcción del payload) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // --- VALIDACIÓN (Como estaba antes, incluyendo nuevos campos) ---
         if (!form.rfc || form.rfc.trim().length < 12) { setFormError('RFC inválido.'); return; }
         if (!form.correo || !/\S+@\S+\.\S+/.test(form.correo)) { setFormError('Correo inválido.'); return; }
         if (!form.calle || !form.numero || !form.colonia || !form.codigo_postal || !form.municipio || !form.estado ) { setFormError('Campos de dirección obligatorios.'); return; }
         if (!form.telefono_uno) { setFormError('Teléfono Principal obligatorio.'); return; }
         if (!form.actividadSat || form.actividadSat.trim() === '') { setFormError('Actividad Económica (SAT) obligatoria.'); return; }
         if (tipoProveedorOriginal === 'fisica') {
             if (!form.nombre || !form.apellido_p || !form.curp) { setFormError('Para Persona Física: Nombre, Apellido P y CURP obligatorios.'); return; }
             if (form.curp.trim().length !== 18) { setFormError('CURP debe tener 18 caracteres.'); return; }
         } else if (tipoProveedorOriginal === 'moral') {
             if (!form.razon_social || !form.nombre_representante || !form.apellido_p_representante) { setFormError('Para Persona Moral: Razón Social, Nombre Rep. y Apellido P Rep. obligatorios.'); return; }
         } else {
              setFormError('Error interno: Tipo de proveedor no reconocido.'); return;
         }
        // --- FIN VALIDACIÓN ---


        // --- CONSTRUCCIÓN DEL PAYLOAD (Como estaba antes) ---
        const payload = {
            id_proveedor: proveedorData.id_proveedor,
            tipoProveedor: tipoProveedorOriginal, // El tipo original NO cambia
            ...form, // Incluye actividadSat y proveedorEventos del estado del form
        };
         // Limpiar campos no relevantes (como estaba antes)
         if (tipoProveedorOriginal === 'fisica') {
            // Delete moral fields from payload
            delete (payload as any).razon_social;
            delete (payload as any).nombre_representante;
            delete (payload as any).apellido_p_representante;
            delete (payload as any).apellido_m_representante;
            // Map form fields back to the expected API fields if necessary (or handle in service)
            // payload.nombre_fisica = payload.nombre; delete payload.nombre; // Example if API needs snake_case
        } else if (tipoProveedorOriginal === 'moral') {
            // Delete fisica fields from payload
            delete (payload as any).nombre;
            delete (payload as any).apellido_p;
            delete (payload as any).apellido_m;
            delete (payload as any).curp;
        }


        console.log("Modal enviando payload a onSubmit:", payload);
        // Llama a la función onSubmit pasada por el padre
        await onSubmit(payload);
        // El padre (page.tsx) es ahora responsable de manejar isLoading y apiError
        // basado en la ejecución de esta promesa.
    };

    // --- RENDERIZADO DEL MODAL ---
    if (!isOpen) {
        return null;
    }

    // (El JSX del formulario se mantiene como en la respuesta anterior,
    // asegurándose de que los 'name' de los inputs coincidan con las claves
    // camelCase de la interfaz ProveedorFormData: actividadSat, proveedorEventos, etc.)
    // ... JSX del modal ...
    const inputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const readOnlyStyle = `${inputStyle} bg-gray-100 cursor-not-allowed`;
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const requiredMark = <span className="text-red-500">*</span>;

    return (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                    <h3 id="modal-title" className="text-xl md:text-2xl font-semibold text-gray-800">
                         Editar Proveedor ({tipoProveedorOriginal === 'moral' ? 'Moral' : tipoProveedorOriginal === 'fisica' ? 'Físico' : 'Desconocido'})
                    </h3>
                    <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 text-3xl leading-none disabled:opacity-50" aria-label="Cerrar">×</button>
                 </div>

                  {/* Mostrar error (ya sea de API o de validación interna) */}
                 {(apiError || formError) && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                      <p><strong>Error:</strong> {apiError || formError}</p>
                    </div>
                 )}

                 <form onSubmit={handleSubmit} noValidate>
                    {/* Tipo Proveedor (No editable) */}
                    <div className="mb-5">
                         <label htmlFor="modal_tipoProveedor_display" className={labelStyle}>Tipo de Proveedor</label>
                         <input type="text" id="modal_tipoProveedor_display" value={tipoProveedorOriginal === 'moral' ? 'Persona Moral' : tipoProveedorOriginal === 'fisica' ? 'Persona Física' : 'Indefinido'} readOnly className={readOnlyStyle} />
                    </div>

                     {/* --- Secciones Condicionales --- */}
                    {tipoProveedorOriginal === 'fisica' && (
                        <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                           <legend className="text-base font-medium text-gray-700 px-2 mb-2">Datos Persona Física</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="modal_nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_nombre" name="nombre" value={form.nombre} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_p" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_apellido_p" name="apellido_p" value={form.apellido_p} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_m" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                                    <input type="text" id="modal_apellido_m" name="apellido_m" value={form.apellido_m} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                             <div className="mt-4">
                                <label htmlFor="modal_curp" className="block text-sm font-medium text-gray-700 mb-1">CURP <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_curp" name="curp" value={form.curp} onChange={handleChange} required maxLength={18} minLength={18} className={inputStyle} />
                            </div>
                        </fieldset>
                     )}
                      {tipoProveedorOriginal === 'moral' && (
                         <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                           <legend className="text-base font-medium text-gray-700 px-2 mb-2">Datos Persona Moral</legend>
                            <div className="mb-4">
                                <label htmlFor="modal_razon_social" className="block text-sm font-medium text-gray-700 mb-1">Razón Social <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_razon_social" name="razon_social" value={form.razon_social} onChange={handleChange} required className={inputStyle} />
                             </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Representante Legal</p>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="modal_nombre_representante" className="block text-xs font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_nombre_representante" name="nombre_representante" value={form.nombre_representante} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_p_representante" className="block text-xs font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_apellido_p_representante" name="apellido_p_representante" value={form.apellido_p_representante} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_m_representante" className="block text-xs font-medium text-gray-700 mb-1">Apellido Materno</label>
                                    <input type="text" id="modal_apellido_m_representante" name="apellido_m_representante" value={form.apellido_m_representante} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                         </fieldset>
                     )}

                    {/* --- Datos Generales y Fiscales --- */}
                     <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                         <legend className="text-base font-medium text-gray-700 px-2 mb-3">Datos Generales y Fiscales</legend>
                        {/* ... (Inputs para RFC, Giro, Correo) ... */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             <div>
                                 <label htmlFor="modal_rfc" className={labelStyle}>RFC {requiredMark}</label>
                                 <input type="text" id="modal_rfc" name="rfc" value={form.rfc} onChange={handleChange} required maxLength={13} minLength={12} className={inputStyle} disabled={isLoading}/>
                             </div>
                             <div>
                                 <label htmlFor="modal_giro_comercial" className={labelStyle}>Giro Comercial</label>
                                 <input type="text" id="modal_giro_comercial" name="giro_comercial" value={form.giro_comercial} onChange={handleChange} className={inputStyle} disabled={isLoading}/>
                             </div>
                             <div>
                                 <label htmlFor="modal_correo" className={labelStyle}>Correo Electrónico {requiredMark}</label>
                                 <input type="email" id="modal_correo" name="correo" value={form.correo} onChange={handleChange} required className={inputStyle} disabled={isLoading}/>
                             </div>
                         </div>
                         {/* --- Actividad SAT --- */}
                         <div className="mb-4">
                             <label htmlFor="modal_actividadSat" className={labelStyle}>Actividad Económica (SAT) {requiredMark}</label>
                             <input type="text" id="modal_actividadSat" name="actividadSat" value={form.actividadSat} onChange={handleChange} required className={inputStyle} disabled={isLoading} placeholder="Desc..." />
                         </div>
                         {/* --- Registros Adicionales --- */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             {/* ... (Inputs para Cámara, Reg. Cámara, Reg. IMSS) ... */}
                             <div>
                                 <label htmlFor="modal_camara_comercial" className={labelStyle}>Cámara Comercial</label>
                                 <input type="text" id="modal_camara_comercial" name="camara_comercial" value={form.camara_comercial} onChange={handleChange} className={inputStyle} disabled={isLoading}/>
                             </div>
                             <div>
                                 <label htmlFor="modal_numero_registro_camara" className={labelStyle}>No. Reg. Cámara</label>
                                 <input type="text" id="modal_numero_registro_camara" name="numero_registro_camara" value={form.numero_registro_camara} onChange={handleChange} className={inputStyle} disabled={isLoading}/>
                             </div>
                             <div>
                                 <label htmlFor="modal_numero_registro_imss" className={labelStyle}>No. Reg. IMSS</label>
                                 <input type="text" id="modal_numero_registro_imss" name="numero_registro_imss" value={form.numero_registro_imss} onChange={handleChange} className={inputStyle} disabled={isLoading}/>
                             </div>
                         </div>
                         {/* --- Proveedor Eventos --- */}
                         <div className="mb-1">
                             <div className="flex items-center">
                                 <input type="checkbox" id="modal_proveedorEventos" name="proveedorEventos" checked={form.proveedorEventos} onChange={handleChange} disabled={isLoading} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-70"/>
                                 <label htmlFor="modal_proveedorEventos" className="ml-2 block text-sm text-gray-900">Proveedor relevante para eventos</label>
                             </div>
                         </div>
                     </fieldset>

                     {/* --- Dirección --- */}
                    <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                         <legend className="text-base font-medium text-gray-700 px-2 mb-3">Dirección</legend>
                         {/* ... (Inputs para Calle, Numero, Colonia, CP, Municipio, Estado vinculados a 'form') ... */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             <div className="md:col-span-2">
                                 <label htmlFor="modal_calle" className={labelStyle}>Calle {requiredMark}</label>
                                 <input type="text" id="modal_calle" name="calle" value={form.calle} onChange={handleChange} required className={inputStyle} disabled={isLoading}/>
                             </div>
                             <div>
                                 <label htmlFor="modal_numero" className={labelStyle}>Número (Ext/Int) {requiredMark}</label>
                                 <input type="text" id="modal_numero" name="numero" value={form.numero} onChange={handleChange} required className={inputStyle} disabled={isLoading}/>
                             </div>
                         </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             <div>
                                 <label htmlFor="modal_colonia" className={labelStyle}>Colonia {requiredMark}</label>
                                 <input type="text" id="modal_colonia" name="colonia" value={form.colonia} onChange={handleChange} required className={inputStyle} disabled={isLoading}/>
                             </div>
                              <div>
                                 <label htmlFor="modal_codigo_postal" className={labelStyle}>Código Postal {requiredMark}</label>
                                 <input type="text" id="modal_codigo_postal" name="codigo_postal" value={form.codigo_postal} onChange={handleChange} required maxLength={5} className={inputStyle} disabled={isLoading}/>
                             </div>
                             <div>
                                 <label htmlFor="modal_municipio" className={labelStyle}>Municipio/Alcaldía {requiredMark}</label>
                                 <input type="text" id="modal_municipio" name="municipio" value={form.municipio} onChange={handleChange} required className={inputStyle} disabled={isLoading}/>
                             </div>
                         </div>
                         <div className="mb-1">
                              <label htmlFor="modal_estado" className={labelStyle}>Estado {requiredMark}</label>
                              <input type="text" id="modal_estado" name="estado" value={form.estado} onChange={handleChange} required className={inputStyle} disabled={isLoading}/>
                          </div>
                     </fieldset>

                     {/* --- Contacto --- */}
                     <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                          <legend className="text-base font-medium text-gray-700 px-2 mb-3">Contacto</legend>
                          {/* ... (Inputs para Teléfonos, Página Web vinculados a 'form') ... */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <div>
                                 <label htmlFor="modal_telefono_uno" className={labelStyle}>Teléfono Principal {requiredMark}</label>
                                 <input type="tel" id="modal_telefono_uno" name="telefono_uno" value={form.telefono_uno} onChange={handleChange} required maxLength={12} className={inputStyle} disabled={isLoading}/>
                             </div>
                              <div>
                                 <label htmlFor="modal_telefono_dos" className={labelStyle}>Teléfono Secundario</label>
                                 <input type="tel" id="modal_telefono_dos" name="telefono_dos" value={form.telefono_dos} onChange={handleChange} maxLength={12} className={inputStyle} disabled={isLoading}/>
                             </div>
                         </div>
                         <div className="mb-1">
                             <label htmlFor="modal_pagina_web" className={labelStyle}>Página Web</label>
                             <input type="url" id="modal_pagina_web" name="pagina_web" value={form.pagina_web} onChange={handleChange} placeholder="https://..." className={inputStyle} disabled={isLoading}/>
                         </div>
                     </fieldset>


                    {/* --- Botones de Acción --- */}
                     <div className="mt-8 pt-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isLoading || !!formError} className={`inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${isLoading || formError ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'} disabled:opacity-60`}>
                            {isLoading ? ( <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Guardando...</> ) : ( 'Guardar Cambios' )}
                        </button>
                    </div>
                 </form>
            </div>
        </div>
    );
};

export default ModalActualizarProveedor;
// --- END OF FILE ---