// --- START OF FILE src/app/proveedores/dashboard/formularios/ModalActualizarProveedor.tsx ---
'use client';
import React, { useState, useEffect, useCallback } from 'react';
// La función onSubmit viene de props, no se llama fetch directamente aquí

// --- INTERFACES (ADAPTADAS) ---

// Cómo esperamos que venga un representante de la API
interface RepresentanteLegalOutput {
    id_morales: number; // El PK de la fila en proveedores_morales
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    // añadir otros campos si los hubiera
}

// Cómo manejamos un representante en el estado del formulario
interface RepresentanteEditable extends RepresentanteLegalOutput {
    // Podríamos añadir flags como _isNew/_isDeleted/_isModified si la API lo requiere,
    // pero la lógica de sincronización en el servicio debe deducirlo.
}

// Cómo esperamos los datos del proveedor que vienen en las props
interface ProveedorDataFromAPI {
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
    // Físicos
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;
    // Morales (Solo razón social + array)
    razon_social?: string | null;
    representantes?: RepresentanteLegalOutput[]; // <--- Array
    estatus?: boolean;
    [key: string]: any;
}

// Estado interno del formulario principal (SIN representantes individuales)
interface ProveedorFormData {
    rfc: string;
    // Física
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    curp: string;
    // Moral
    razon_social: string; // Solo razón social
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
}

// --- Props del Modal (Sin cambios en nombres) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedorData: ProveedorDataFromAPI;
  onSubmit: (payload: any) => Promise<void>; // onSubmit del padre
  isLoading: boolean; // isLoading del padre
  error: string | null; // error del padre
}

// --- Componente Modal ---
const ModalActualizarProveedor: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  proveedorData,
  onSubmit,
  isLoading,
  error: apiError, // Renombrar error de prop para evitar conflicto
}) => {

    if (!proveedorData) return null; // Guardia

    // --- Estados ---
    const [form, setForm] = useState<ProveedorFormData>({} as ProveedorFormData);
    const [representantes, setRepresentantes] = useState<RepresentanteEditable[]>([]);
    const [nuevoRepNombre, setNuevoRepNombre] = useState('');
    const [nuevoRepApellidoP, setNuevoRepApellidoP] = useState('');
    const [nuevoRepApellidoM, setNuevoRepApellidoM] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [repError, setRepError] = useState<string | null>(null);

    const tipoProveedorOriginal = proveedorData.tipo_proveedor || 'desconocido';

    // --- Efecto para inicializar/resetear estados ---
    useEffect(() => {
        // Solo ejecutar si proveedorData es válido
        if (proveedorData && proveedorData.id_proveedor) {
            console.log("Modal Admin useEffect: Reseteando estados con proveedorData:", proveedorData);

            // Inicializar formulario principal
            setForm({
                rfc: proveedorData.rfc || '',
                nombre: proveedorData.nombre_fisica || '', // Mapea desde _fisica
                apellido_p: proveedorData.apellido_p_fisica || '',
                apellido_m: proveedorData.apellido_m_fisica || '',
                curp: proveedorData.curp || '',
                razon_social: proveedorData.razon_social || '',
                giro_comercial: proveedorData.giro_comercial || '',
                actividadSat: proveedorData.actividad_sat || '', // Mapea _sat
                correo: proveedorData.correo || '',
                calle: proveedorData.calle || '',
                numero: proveedorData.numero || '',
                colonia: proveedorData.colonia || '',
                codigo_postal: proveedorData.codigo_postal || '',
                municipio: proveedorData.municipio || '',
                estado: proveedorData.estado || '',
                telefono_uno: proveedorData.telefono_uno || '',
                telefono_dos: proveedorData.telefono_dos || '',
                pagina_web: proveedorData.pagina_web || '',
                camara_comercial: proveedorData.camara_comercial || '',
                numero_registro_camara: proveedorData.numero_registro_camara || '',
                numero_registro_imss: proveedorData.numero_registro_imss || '',
                proveedorEventos: proveedorData.proveedor_eventos || false, // Mapea _eventos
            });

            // **CRUCIAL: Inicializar lista de representantes**
            // Asegurarse de que proveedorData.representantes sea un array antes de usarlo
            const repsIniciales = Array.isArray(proveedorData.representantes) ? proveedorData.representantes : [];
            setRepresentantes(repsIniciales);
            console.log("Modal Admin useEffect: Estado 'representantes' inicializado con:", repsIniciales);


            // Limpiar campos de nuevo representante y errores
            setNuevoRepNombre('');
            setNuevoRepApellidoP('');
            setNuevoRepApellidoM('');
            setFormError(null);
            setRepError(null);
        } else {
            console.warn("Modal Admin useEffect: proveedorData inválido o falta id_proveedor.");
        }
    }, [proveedorData]);

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormError(null);
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setForm(prev => ({ ...prev, [name]: checked }));
        } else {
            let finalValue = value;
            if (name === 'rfc' || name === 'curp') { finalValue = value.toUpperCase().trim(); }
             // Solo actualiza si el campo existe en el estado 'form'
            if (name in form) {
                 setForm(prev => ({ ...prev, [name]: finalValue }));
             } else {
                 console.warn(`Intento de actualizar campo no existente en form: ${name}`);
             }
        }
    };

    const handleRepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         const { name, value } = e.target;
         setRepError(null);
         if (name === 'nuevoRepNombre') setNuevoRepNombre(value);
         else if (name === 'nuevoRepApellidoP') setNuevoRepApellidoP(value);
         else if (name === 'nuevoRepApellidoM') setNuevoRepApellidoM(value);
     };

     const handleAddRepresentante = () => {
        setRepError(null);
        if (!nuevoRepNombre.trim() || !nuevoRepApellidoP.trim()) {
            setRepError('Nombre y Apellido Paterno del representante son obligatorios.'); return;
        }
        const temporalId = -(Date.now() + Math.random()); // ID Temporal para key y borrado
        const nuevoRepresentante: RepresentanteEditable = {
            id_morales: temporalId,
            nombre_representante: nuevoRepNombre.trim(),
            apellido_p_representante: nuevoRepApellidoP.trim(),
            apellido_m_representante: nuevoRepApellidoM.trim() || undefined,
        };
        setRepresentantes(prev => [...prev, nuevoRepresentante]);
        setNuevoRepNombre(''); setNuevoRepApellidoP(''); setNuevoRepApellidoM('');
     };

     const handleRemoveRepresentante = (idToRemove: number) => {
         setRepresentantes(prev => prev.filter(rep => rep.id_morales !== idToRemove));
     };

    // Handler para enviar el formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null); setRepError(null);

        // --- Validación Final ---
        // ... (Validaciones comunes como antes: RFC, Correo, Dirección, Teléfono, ActividadSAT) ...
        if (!form.rfc || (form.rfc.length !== 12 && form.rfc.length !== 13)) { setFormError('RFC debe tener 12 o 13 caracteres.'); return; }
        if (!form.actividadSat) { setFormError('Actividad Económica (SAT) obligatoria.'); return; }
        // ... resto validaciones comunes ...

        // Validación por tipo
        if (tipoProveedorOriginal === 'fisica') {
            if (!form.nombre || !form.apellido_p || !form.curp) { setFormError('Para Física: Nombre, Apellido P y CURP obligatorios.'); return; }
            if (form.curp.length !== 18) { setFormError('CURP debe tener 18 caracteres.'); return; }
        } else if (tipoProveedorOriginal === 'moral') {
            if (!form.razon_social) { setFormError('Para Moral: Razón Social obligatoria.'); return; }
            // Validar que haya al menos un representante y que tengan datos básicos
            if (representantes.length === 0) { setRepError('Debe haber al menos un representante legal.'); return; }
            for (const rep of representantes) {
                if (!rep.nombre_representante?.trim() || !rep.apellido_p_representante?.trim()) {
                    setRepError(`Faltan datos para el representante ${rep.nombre_representante || '(sin nombre)'}. Nombre y Apellido P son requeridos.`);
                    return;
                }
            }
        } else { setFormError('Error interno: Tipo de proveedor no reconocido.'); return; }
        // --- FIN VALIDACIÓN ---

        // --- CONSTRUCCIÓN DEL PAYLOAD (Adaptado) ---
        const payload: any = {
            id_proveedor: proveedorData.id_proveedor,
            tipoProveedor: tipoProveedorOriginal,
            // Campos comunes mapeados desde 'form'
            rfc: form.rfc,
            giro_comercial: form.giro_comercial,
            actividadSat: form.actividadSat, // camelCase enviado
            proveedorEventos: form.proveedorEventos, // camelCase enviado
            correo: form.correo,
            // ... resto de campos comunes ...
             calle: form.calle, numero: form.numero, colonia: form.colonia, codigo_postal: form.codigo_postal, municipio: form.municipio, estado: form.estado, telefono_uno: form.telefono_uno, telefono_dos: form.telefono_dos || null, pagina_web: form.pagina_web || null, camara_comercial: form.camara_comercial || null, numero_registro_camara: form.numero_registro_camara || null, numero_registro_imss: form.numero_registro_imss || null,

        };

        if (tipoProveedorOriginal === 'fisica') {
            payload.nombre = form.nombre;
            payload.apellido_p = form.apellido_p;
            payload.apellido_m = form.apellido_m || null;
            payload.curp = form.curp;
        } else if (tipoProveedorOriginal === 'moral') {
            payload.razon_social = form.razon_social;
            payload.representantes = representantes.map(rep => ({
                 id_morales: rep.id_morales < 0 ? undefined : rep.id_morales, // Clave para la sincronización del servicio
                 nombre_representante: rep.nombre_representante,
                 apellido_p_representante: rep.apellido_p_representante,
                 apellido_m_representante: rep.apellido_m_representante ?? null,
            }));
        }
        // --- FIN CONSTRUCCIÓN PAYLOAD ---

        console.log("Modal enviando payload a onSubmit:", payload);
        await onSubmit(payload); // Llama a la función del padre
    };

    // --- RENDERIZADO ---
    if (!isOpen) return null;

    // Estilos...
    const inputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const readOnlyStyle = `${inputStyle} bg-gray-100 cursor-not-allowed`;
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const requiredMark = <span className="text-red-500">*</span>;
    const fieldsetStyle = "border border-gray-200 p-4 rounded-md mb-6";
    const legendStyle = "text-base font-semibold text-gray-700 px-2 mb-3";
    const buttonPrimarySmall = "px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50";
    const buttonDangerSmall = "px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 disabled:opacity-50";


    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-80 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                {/* ... Encabezado ... */}
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Actualizar Información</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-semibold outline-none focus:outline-none disabled:opacity-50"
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </div>
                 {(apiError || formError || repError) && ( <div className="mb-5 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm"><p><strong>Error:</strong> {apiError || formError || repError}</p></div> )}

                 <form onSubmit={handleSubmit} noValidate>
                    {/* Tipo Proveedor (No editable) */}
                    <div className="mb-4">
                         <label htmlFor="modal_tipoProveedor_display" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Proveedor</label>
                         <input
                            type="text"
                            id="modal_tipoProveedor_display"
                            value={tipoProveedorOriginal === 'moral' ? 'Persona Moral' : (tipoProveedorOriginal === 'fisica' ? 'Persona Física' : 'Indefinido')}
                            readOnly
                            className={readOnlyStyle}
                         />
                         <input type="hidden" name="tipoProveedor" value={tipoProveedorOriginal} />
                    </div>

                    {/* --- Campos Físicos (Condicional) --- */}
                    {tipoProveedorOriginal === 'fisica' && (
                        <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                           <legend className="text-base font-medium text-gray-700 px-2 mb-2">Datos Persona Física</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="modal_nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre(s) <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_nombre" name="nombre" value={form.nombre|| ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_p" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                                    <input type="text" id="modal_apellido_p" name="apellido_p" value={form.apellido_p|| ''} onChange={handleChange} required className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="modal_apellido_m" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
                                    <input type="text" id="modal_apellido_m" name="apellido_m" value={form.apellido_m|| ''} onChange={handleChange} className={inputStyle} />
                                </div>
                            </div>
                             <div className="mt-4">
                                <label htmlFor="modal_curp" className="block text-sm font-medium text-gray-700 mb-1">CURP <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_curp" name="curp" value={form.curp|| ''} onChange={handleChange} required maxLength={18} minLength={18} className={inputStyle} />
                            </div>
                        </fieldset>
                     )}

                    {/* --- Campos Morales (MODIFICADO) --- */}
                    {tipoProveedorOriginal === 'moral' && (
                         <fieldset className={fieldsetStyle}>
                           <legend className={legendStyle}>Datos Persona Moral</legend>
                            {/* Razón Social (Editable) */}
                            <div className="mb-5">
                                <label htmlFor="modal_razon_social" className={labelStyle}>Razón Social {requiredMark}</label>
                                <input type="text" id="modal_razon_social" name="razon_social" value={form.razon_social|| ''} onChange={handleChange} required className={inputStyle} disabled={isLoading}/>
                             </div>

                            {/* --- Gestión de Representantes --- */}
                            <div className="mt-4 space-y-4">
                                <p className="text-md font-semibold text-gray-700">Representantes Legales</p>

                                {/* Lista de Representantes Actuales */}
                                {representantes.length > 0 && (
                                    <div className="space-y-2 border-t pt-3 mt-3">
                                        {representantes.map((rep, index) => (
                                            <div key={rep.id_morales} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded text-sm">
                                                <span>{rep.nombre_representante} {rep.apellido_p_representante} {rep.apellido_m_representante || ''}</span>
                                                <button type="button" onClick={() => handleRemoveRepresentante(rep.id_morales)} className="button-danger-small" title="Eliminar" disabled={isLoading}>Eliminar</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {representantes.length === 0 && (
                                     <p className="text-sm text-gray-500 italic">No hay representantes añadidos.</p>
                                )}

                                {/* Formulario Añadir Nuevo */}
                                <div className="border border-dashed border-indigo-300 p-4 rounded-md bg-indigo-50 mt-4">
                                    <p className="text-sm font-medium text-indigo-800 mb-2">Añadir Nuevo Representante</p>
                                    {repError && <p className="text-red-600 text-xs mb-2">{repError}</p>}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label htmlFor="nuevoRepNombre" className={`${labelStyle} text-xs`}>Nombre(s) {requiredMark}</label>
                                            <input type="text" id="nuevoRepNombre" name="nuevoRepNombre" value={nuevoRepNombre|| ''} onChange={handleRepChange} className={`${inputStyle} input-sm`} disabled={isLoading}/>
                                        </div>
                                        <div>
                                            <label htmlFor="nuevoRepApellidoP" className={`${labelStyle} text-xs`}>Apellido Paterno {requiredMark}</label>
                                            <input type="text" id="nuevoRepApellidoP" name="nuevoRepApellidoP" value={nuevoRepApellidoP|| ''} onChange={handleRepChange} className={`${inputStyle} input-sm`} disabled={isLoading}/>
                                        </div>
                                        <div>
                                            <label htmlFor="nuevoRepApellidoM" className={`${labelStyle} text-xs`}>Apellido Materno</label>
                                            <input type="text" id="nuevoRepApellidoM" name="nuevoRepApellidoM" value={nuevoRepApellidoM|| ''} onChange={handleRepChange} className={`${inputStyle} input-sm`} disabled={isLoading}/>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleAddRepresentante} className="mt-3 button-primary-small disabled:opacity-50" disabled={!nuevoRepNombre || !nuevoRepApellidoP || isLoading}>+ Añadir</button>
                                </div>
                            </div>
                         </fieldset>
                     )}
                     {/* --- FIN SECCIÓN MORAL --- */}

                    {/* --- Resto de Fieldsets --- */}
                    {/* --- Datos Generales y Fiscales --- */}
                    <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                         <legend className="text-base font-medium text-gray-700 px-2 mb-2">Datos Generales y Fiscales</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                             <div>
                                <label htmlFor="modal_rfc" className="block text-sm font-medium text-gray-700 mb-1">RFC <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_rfc" name="rfc" value={form.rfc|| ''} onChange={handleChange} required maxLength={13} minLength={12} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_giro_comercial" className="block text-sm font-medium text-gray-700 mb-1">Giro Comercial</label>
                                <input type="text" id="modal_giro_comercial" name="giro_comercial" value={form.giro_comercial|| ''} onChange={handleChange} className={inputStyle} />
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
                                value={form.actividadSat|| ''}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                                placeholder="Descripción según Constancia de Situación Fiscal"
                            />
                        </div>
                        {/* --- Correo --- */}
                        <div className="mb-4">
                            <label htmlFor="modal_correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                            <input type="email" id="modal_correo" name="correo" value={form.correo|| ''} onChange={handleChange} required className={inputStyle} />
                        </div>
                         {/* --- Registros --- */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label htmlFor="modal_camara_comercial" className="block text-sm font-medium text-gray-700 mb-1">Cámara Comercial</label>
                                <input type="text" id="modal_camara_comercial" name="camara_comercial" value={form.camara_comercial|| ''} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_numero_registro_camara" className="block text-sm font-medium text-gray-700 mb-1">No. Registro Cámara</label>
                                <input type="text" id="modal_numero_registro_camara" name="numero_registro_camara" value={form.numero_registro_camara|| ''} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_numero_registro_imss" className="block text-sm font-medium text-gray-700 mb-1">No. Registro IMSS</label>
                                <input type="text" id="modal_numero_registro_imss" name="numero_registro_imss" value={form.numero_registro_imss|| ''} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                        {/* --- Proveedor Eventos --- */}
                        <div className="mb-1"> {/* Menos margen inferior para el checkbox */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="modal_proveedorEventos"
                                    name="proveedorEventos" // camelCase
                                    checked={form.proveedorEventos|| false}
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
                                <input type="text" id="modal_calle" name="calle" value={form.calle|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_numero" className="block text-sm font-medium text-gray-700 mb-1">Número (Ext/Int) <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_numero" name="numero" value={form.numero|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label htmlFor="modal_colonia" className="block text-sm font-medium text-gray-700 mb-1">Colonia <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_colonia" name="colonia" value={form.colonia|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                             <div>
                                <label htmlFor="modal_codigo_postal" className="block text-sm font-medium text-gray-700 mb-1">Código Postal <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_codigo_postal" name="codigo_postal" value={form.codigo_postal|| ''} onChange={handleChange} required maxLength={5} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_municipio" className="block text-sm font-medium text-gray-700 mb-1">Municipio/Alcaldía <span className="text-red-500">*</span></label>
                                <input type="text" id="modal_municipio" name="municipio" value={form.municipio|| ''} onChange={handleChange} required className={inputStyle} />
                            </div>
                        </div>
                        <div className="mb-1">
                            <label htmlFor="modal_estado" className="block text-sm font-medium text-gray-700 mb-1">Estado <span className="text-red-500">*</span></label>
                            <input type="text" id="modal_estado" name="estado" value={form.estado|| ''} onChange={handleChange} required className={inputStyle} />
                        </div>
                    </fieldset>

                    {/* --- Contacto --- */}
                    <fieldset className="border border-gray-200 p-4 rounded-md mb-6">
                         <legend className="text-base font-medium text-gray-700 px-2 mb-2">Contacto</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="modal_telefono_uno" className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal <span className="text-red-500">*</span></label>
                                <input type="tel" id="modal_telefono_uno" name="telefono_uno" value={form.telefono_uno|| ''} onChange={handleChange} required maxLength={12} className={inputStyle} />
                            </div>
                            <div>
                                <label htmlFor="modal_telefono_dos" className="block text-sm font-medium text-gray-700 mb-1">Teléfono Secundario</label>
                                <input type="tel" id="modal_telefono_dos" name="telefono_dos" value={form.telefono_dos|| ''} onChange={handleChange} maxLength={12} className={inputStyle} />
                            </div>
                        </div>
                        <div className="mb-1">
                            <label htmlFor="modal_pagina_web" className="block text-sm font-medium text-gray-700 mb-1">Página Web</label>
                            <input type="url" id="modal_pagina_web" name="pagina_web" value={form.pagina_web || ''} onChange={handleChange} placeholder="https://ejemplo.com" className={inputStyle} />
                        </div>
                    </fieldset>

                    {/* --- Botones de Acción --- */}
                     <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-4">
                        <button type="button" className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-60"
                        onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" disabled={isLoading || !!formError || !!repError} 
                        className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500     
                        ${isLoading || formError || repError ? 'bg-indigo-400 cursor-not-allowed' : ''}`}> {isLoading ? 'Guardando...' : 'Guardar Cambios'} </button>
                    </div>
                 </form>
            </div>
        </div>
    );
};

export default ModalActualizarProveedor;
// --- END OF FILE ---