// --- START OF FILE src/app/proveedores/dashboard/formularios/ModalActualizarProveedor.tsx ---
'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Representante como viene de la API (con id_morales)
interface RepresentanteLegalOutput {
    id_morales: number;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
}

// Representante como se maneja en el estado del formulario de edición
interface RepresentanteEditable extends RepresentanteLegalOutput {
    // Podríamos añadir un flag _isNew o _isDeleted si la API lo necesitara,
    // pero la lógica actual lo deduce comparando con la lista inicial.
    // Opcional: estado de edición si se edita inline
    // _isEditing?: boolean;
}

// Datos del proveedor recibidos como props (ADAPTADA)
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
    // Campos Físicos
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;
    // Campos Morales
    razon_social?: string | null;
    representantes?: RepresentanteLegalOutput[];
    // ... otros campos ...
    estatus?: boolean;
    [key: string]: any;
}

// Estado interno del formulario principal (sin representantes individuales)
interface ProveedorFormData {
    rfc: string;
    // Física
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    curp: string;
    // Moral
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
}

// --- Props del Modal (sin cambios en nombres) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  proveedorData: ProveedorDataFromAPI; // Sigue llamándose proveedorData aquí
  onSubmit: (payload: any) => Promise<void>; // onSubmit sigue siendo el callback del padre
  isLoading: boolean; // Estado de carga del padre
  error: string | null; // Error del padre
}

// --- Componente Modal ---
const ModalActualizarProveedor: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  proveedorData, // Recibe los datos iniciales
  onSubmit, // Función del padre para guardar
  isLoading, // Indicador de carga del padre
  error: apiError, // Error del padre
}) => {

    if (!proveedorData) return null; // Guardia por si acaso

    // --- Estados ---
    // Estado para campos principales (sin representantes)
    const [form, setForm] = useState<ProveedorFormData>({} as ProveedorFormData); // Inicializar vacío, se llena en useEffect
    // Estado para la lista de representantes (editables)
    const [representantes, setRepresentantes] = useState<RepresentanteEditable[]>([]);
    // Estado para los campos del *nuevo* representante a añadir
    const [nuevoRepNombre, setNuevoRepNombre] = useState('');
    const [nuevoRepApellidoP, setNuevoRepApellidoP] = useState('');
    const [nuevoRepApellidoM, setNuevoRepApellidoM] = useState('');
    // Estado para errores locales (validación de form, errores de rep)
    const [formError, setFormError] = useState<string | null>(null);
    const [repError, setRepError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    // Tipo original (no editable)
    const tipoProveedorOriginal = proveedorData.tipo_proveedor;

    // --- Efecto para inicializar/resetear estados cuando los datos cambian ---
    useEffect(() => {
        console.log("Modal useEffect: Reseteando estado por cambio en proveedorData");
        if (proveedorData) {
            // Inicializar formulario principal
            setForm({
                rfc: proveedorData.rfc || '',
                nombre: proveedorData.nombre_fisica || '',
                apellido_p: proveedorData.apellido_p_fisica || '',
                apellido_m: proveedorData.apellido_m_fisica || '',
                curp: proveedorData.curp || '',
                razon_social: proveedorData.razon_social || '',
                giro_comercial: proveedorData.giro_comercial || '',
                actividadSat: proveedorData.actividad_sat || '',
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
                proveedorEventos: proveedorData.proveedor_eventos || false,
            });
            // Inicializar lista de representantes (si es moral y existen)
            setRepresentantes(proveedorData.representantes || []);
            // Limpiar campos de nuevo representante y errores
            setNuevoRepNombre('');
            setNuevoRepApellidoP('');
            setNuevoRepApellidoM('');
            setFormError(null);
            setRepError(null);
        }
    }, [proveedorData]); // Depende solo de los datos iniciales

    // --- Handlers ---
    // Para campos del formulario principal
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormError(null); // Limpiar error al editar
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setForm(prev => ({ ...prev, [name]: checked }));
        } else {
            let finalValue = value;
            if (name === 'rfc' || name === 'curp') { finalValue = value.toUpperCase().trim(); }
            setForm(prev => ({ ...prev, [name]: finalValue }));
        }
    };

    // Para campos del *nuevo* representante
    const handleRepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
         const { name, value } = e.target;
         setRepError(null);
         if (name === 'nuevoRepNombre') setNuevoRepNombre(value);
         else if (name === 'nuevoRepApellidoP') setNuevoRepApellidoP(value);
         else if (name === 'nuevoRepApellidoM') setNuevoRepApellidoM(value);
     };

    // Para añadir un representante a la lista
     const handleAddRepresentante = () => {
        setRepError(null);
        if (!nuevoRepNombre.trim() || !nuevoRepApellidoP.trim()) {
            setRepError('Nombre y Apellido Paterno del representante son obligatorios.'); return;
        }
        // Generar un ID temporal negativo para la key de React (importante!)
        // La API/Servicio ignorará este ID al insertar.
        const temporalId = -(Date.now() + Math.random());
        const nuevoRepresentante: RepresentanteEditable = {
            id_morales: temporalId, // ID Temporal solo para el frontend
            nombre_representante: nuevoRepNombre.trim(),
            apellido_p_representante: nuevoRepApellidoP.trim(),
            apellido_m_representante: nuevoRepApellidoM.trim() || undefined,
        };
        setRepresentantes(prev => [...prev, nuevoRepresentante]);
        setNuevoRepNombre(''); setNuevoRepApellidoP(''); setNuevoRepApellidoM(''); // Limpiar inputs
     };

    // Para eliminar un representante de la lista
     const handleRemoveRepresentante = (idToRemove: number) => {
         // Filtra manteniendo solo los que NO coinciden con el id (sea temporal o real)
         setRepresentantes(prev => prev.filter(rep => rep.id_morales !== idToRemove));
     };

    // Para enviar el formulario completo
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setRepError(null);

        // --- Validación Final ---
        if (!form.rfc || (form.rfc.length !== 12 && form.rfc.length !== 13)) { setFormError('RFC debe tener 12 o 13 caracteres.'); return; }
         if (!form.actividadSat || form.actividadSat.trim() === '') { setFormError('Actividad Económica (SAT) obligatoria.'); return; }
         if (!form.correo || !/\S+@\S+\.\S+/.test(form.correo)) { setFormError('Correo electrónico inválido.'); return; }
         if (!form.calle || !form.numero || !form.colonia || !form.codigo_postal || !form.municipio || !form.estado ) { setFormError('Campos de dirección obligatorios.'); return; }
         if (!form.telefono_uno) { setFormError('Teléfono Principal obligatorio.'); return; }

        // Validación por tipo
        if (tipoProveedorOriginal === 'fisica') {
            if (!form.nombre || !form.apellido_p || !form.curp) { setFormError('Para Física: Nombre, Apellido P y CURP obligatorios.'); return; }
            if (form.curp.length !== 18) { setFormError('CURP debe tener 18 caracteres.'); return; }
        } else if (tipoProveedorOriginal === 'moral') {
            if (!form.razon_social) { setFormError('Para Moral: Razón Social obligatoria.'); return; }
            // **Validar que haya al menos un representante en la lista final**
            if (representantes.length === 0) {
                 setRepError('Debe haber al menos un representante legal.'); return;
             }
             // Validar que los representantes en la lista tengan datos básicos
              for (const rep of representantes) {
                  if (!rep.nombre_representante || !rep.apellido_p_representante) {
                      setRepError(`Faltan datos para el representante ${rep.nombre_representante || '(sin nombre)'}. Nombre y Apellido P son requeridos.`);
                      return;
                  }
              }
        } else {
            setFormError('Error interno: Tipo de proveedor no reconocido.'); return;
        }
        // --- FIN VALIDACIÓN ---

        // --- CONSTRUCCIÓN DEL PAYLOAD ---
        const payload: any = {
            id_proveedor: proveedorData.id_proveedor,
            tipoProveedor: tipoProveedorOriginal, // Enviar siempre el tipo original
            // Datos comunes
            rfc: form.rfc,
            giro_comercial: form.giro_comercial,
            actividadSat: form.actividadSat,
            correo: form.correo,
            calle: form.calle,
            numero: form.numero,
            colonia: form.colonia,
            codigo_postal: form.codigo_postal,
            municipio: form.municipio,
            estado: form.estado,
            telefono_uno: form.telefono_uno,
            telefono_dos: form.telefono_dos || null,
            pagina_web: form.pagina_web || null,
            camara_comercial: form.camara_comercial || null,
            numero_registro_camara: form.numero_registro_camara || null,
            numero_registro_imss: form.numero_registro_imss || null,
            proveedorEventos: form.proveedorEventos,
            // estatus: form.estatus, // Si fuera editable
        };

        if (tipoProveedorOriginal === 'fisica') {
            payload.nombre = form.nombre;
            payload.apellido_p = form.apellido_p;
            payload.apellido_m = form.apellido_m || null;
            payload.curp = form.curp;
        } else if (tipoProveedorOriginal === 'moral') {
            payload.razon_social = form.razon_social;
            // Filtrar IDs temporales negativos antes de enviar si la API no los espera
            payload.representantes = representantes.map(rep => ({
                ...rep,
                // Si el ID es temporal (negativo), no lo enviamos o lo ponemos a null/undefined
                id_morales: rep.id_morales < 0 ? undefined : rep.id_morales,
            }));
        }
        // --- FIN CONSTRUCCIÓN PAYLOAD ---

        console.log("Modal enviando payload a onSubmit:", payload);
        await onSubmit(payload); // Llama a la función del padre (handleSave...)
    };

    // --- RENDERIZADO ---
    if (!isOpen) return null;

    // Clases de estilo
    const inputStyle = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const readOnlyStyle = `${inputStyle} bg-gray-100 cursor-not-allowed`;
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const requiredMark = <span className="text-red-500">*</span>;
    const fieldsetStyle = "border border-gray-200 p-4 rounded-md mb-6";
    const legendStyle = "text-base font-semibold text-gray-700 px-2 mb-3";


    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
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

                {/* Mostrar Error (API o Validación) */}
                {(apiError || formError) && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                        <p><strong>Error:</strong> {apiError || formError}</p>
                    </div>
                 )}

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

                                 {/* Formulario para Añadir Nuevo Representante */}
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
                            {/* --- Fin Gestión de Representantes --- */}
                         </fieldset>
                     )}
                    {/* --- FIN Campos Morales --- */}
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
             {/* Estilos adicionales */}
             <style jsx global>{`
                .input-sm { padding-top: 0.3rem; padding-bottom: 0.3rem; font-size: 0.875rem; }
                 /* ... (otros estilos base) ... */
             `}</style>
        </div>
    );
};

export default ModalActualizarProveedor;
// --- END OF FILE ---