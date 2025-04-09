import React, { useState, useEffect } from 'react';

// Interfaz para las props (asumiendo que la defines en otro lado o aquí)
interface ProveedorModalData {
    id_proveedor: number;
    rfc: string;
    giro_comercial: string;
    correo: string;
    calle: string;
    numero: string;
    colonia: string;
    codigo_postal: string;
    municipio: string;
    estado: string;
    telefono_uno: string;
    telefono_dos?: string | null; // Hacer opcionales los que pueden ser null
    pagina_web?: string | null;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    estatus: boolean;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido'; // Tipo determinado por el servicio

    // Campos de Persona Moral (pueden ser null si es física)
    razon_social?: string | null;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;

    // Campos de Persona Física (pueden ser null si es moral)
    nombre_fisica?: string | null; // Nombre que viene del JOIN
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;

    // Otros campos que vengan...
    created_at?: string | Date;
    updated_at?: string | Date;
    id_usuario_proveedor?: number;
     // etc.
}


interface ModalProps {
  datos: ProveedorModalData; // Usa la interfaz definida
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ModalActualizarProveedor: React.FC<ModalProps> = ({
  datos,
  onClose,
  onSubmit,
  isLoading,
  error: apiError,
}) => {
    console.log("MODAL RECIBIÓ DATOS:", datos); // Mantenemos este log para confirmar

    // --- ESTADO DEL FORMULARIO: CORRECCIÓN EN LA INICIALIZACIÓN ---
    const [form, setForm] = useState(() => { // Usar una función para inicializar es más limpio
        // Lógica para inicializar campos específicos de física/moral
        const initialFormState = {
            // Campos comunes (siempre presentes)
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
            // estatus no suele ser editable en este modal, pero si lo fuera:
            // estatus: datos.estatus ?? true,

            // Campos de Persona Moral (inicializar con datos recibidos o vacío)
            razon_social: datos.razon_social || '',
            nombre_representante: datos.nombre_representante || '',
            apellido_p_representante: datos.apellido_p_representante || '',
            apellido_m_representante: datos.apellido_m_representante || '',

            // Campos de Persona Física (¡IMPORTANTE! Usa los nombres correctos de las props)
            // El modal internamente puede usar 'nombre', 'apellido_p', etc.
            // pero debe leer de 'nombre_fisica', 'apellido_p_fisica' que vienen en 'datos'
            nombre: datos.nombre_fisica || '', // Lee de 'nombre_fisica' que viene del JOIN
            apellido_p: datos.apellido_p_fisica || '', // Lee de 'apellido_p_fisica'
            apellido_m: datos.apellido_m_fisica || '', // Lee de 'apellido_m_fisica'
            curp: datos.curp || '',
        };
        console.log("MODAL - Estado inicial del formulario:", initialFormState);
        return initialFormState;
    });
    // --- FIN CORRECCIÓN ESTADO FORMULARIO ---

    // El tipo original no debe cambiar en la edición
    const [tipoProveedorOriginal] = useState<'moral' | 'fisica' | 'desconocido'>(datos.tipo_proveedor || 'desconocido');

    const [internalError, setInternalError] = useState('');

    // Efecto para manejar errores si falta el tipo original (no debería pasar ahora)
    useEffect(() => {
        console.log("ModalActualizarProveedor received data (effect check):", datos);
        if (tipoProveedorOriginal === 'desconocido') {
            console.error("Modal Error: tipo_proveedor no se pudo determinar en los datos iniciales:", datos);
            setInternalError("Error: No se pudo determinar el tipo de proveedor (Moral/Física). No se puede editar.");
        } else {
            setInternalError('');
        }
    }, [datos, tipoProveedorOriginal]); // Dependencias del efecto

    // Handler para cambios en inputs (sin cambios)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Handler para enviar (Ajustar payload si es necesario)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInternalError('');

        // --- Preparar Payload para enviar a la API ---
        const payload = {
            // Incluye todos los campos comunes del estado 'form'
            ...form,
             // Incluye los campos específicos del tipo DE FORMA CORRECTA
             // La API PUT/Servicio espera los nombres de columna de la DB
             nombre_fisica: form.nombre,        // Mapea form.nombre -> nombre_fisica
             apellido_p_fisica: form.apellido_p, // Mapea form.apellido_p -> apellido_p_fisica
             apellido_m_fisica: form.apellido_m, // Mapea form.apellido_m -> apellido_m_fisica
             // Los campos de moral ya tienen el nombre correcto en el estado 'form'
             // razon_social: form.razon_social, etc.

            // --- DATOS NO EDITABLES PERO NECESARIOS PARA LA API ---
            id_proveedor: datos.id_proveedor, // El ID original
            tipoProveedor: tipoProveedorOriginal, // El tipo original (tu API PUT lo necesita)
             // No envíes estatus si no es editable aquí, se maneja aparte
        };



        console.log("Modal enviando payload:", payload);
        await onSubmit(payload); // Llama a la función del padre
    };

    // --- RENDERIZADO DEL FORMULARIO (SIN CAMBIOS IMPORTANTES EN LA ESTRUCTURA JSX) ---
    // Asegúrate que los 'name' de los inputs coincidan con las claves del estado 'form'
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
        <div className="relative mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
         <button onClick={onClose} className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
          <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">Editar Proveedor ({tipoProveedorOriginal === 'moral' ? 'Moral' : tipoProveedorOriginal === 'fisica' ? 'Físico' : 'Desconocido'})</h3>

          {(internalError || apiError)}

          <form onSubmit={handleSubmit} className={`mt-4 space-y-6 ${internalError ? 'opacity-50 pointer-events-none' : ''}`}>

            {/* Sección Campos Comunes */}
            <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-800 px-2">Información General</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"> {/* 3 columnas */}
                    {/* RFC, Giro Comercial, Correo */}
                    <div>
                        <label htmlFor="rfc" className="block text-sm font-medium text-gray-700">RFC</label>
                        <input type="text" name="rfc" id="rfc" value={form.rfc} onChange={handleChange} required className="input-style"/>
                    </div>
                    <div>
                        <label htmlFor="giro_comercial" className="block text-sm font-medium text-gray-700">Giro Comercial</label>
                        <input type="text" name="giro_comercial" id="giro_comercial" value={form.giro_comercial} onChange={handleChange} required className="input-style"/>
                    </div>
                     <div>
                        <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo</label>
                        <input type="email" name="correo" id="correo" value={form.correo} onChange={handleChange} required className="input-style"/>
                     </div>
                    {/* Teléfono 1, Teléfono 2, Página Web */}
                    <div>
                        <label htmlFor="telefono_uno" className="block text-sm font-medium text-gray-700">Teléfono 1</label>
                        <input type="tel" name="telefono_uno" id="telefono_uno" value={form.telefono_uno} onChange={handleChange} required className="input-style"/>
                    </div>
                    <div>
                        <label htmlFor="telefono_dos" className="block text-sm font-medium text-gray-700">Teléfono 2</label>
                        <input type="tel" name="telefono_dos" id="telefono_dos" value={form.telefono_dos} onChange={handleChange} className="input-style"/>
                    </div>
                    <div>
                        <label htmlFor="pagina_web" className="block text-sm font-medium text-gray-700">Página Web</label>
                        <input type="url" name="pagina_web" id="pagina_web" value={form.pagina_web} onChange={handleChange} className="input-style" placeholder="https://..."/>
                    </div>
                </div>
            </fieldset>

             {/* Sección Dirección */}
             <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-800 px-2">Dirección</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                     {/* Calle, Número, Colonia */}
                     <div>
                        <label htmlFor="calle" className="block text-sm font-medium text-gray-700">Calle</label>
                        <input type="text" name="calle" id="calle" value={form.calle} onChange={handleChange} required className="input-style"/>
                     </div>
                     <div>
                        <label htmlFor="numero" className="block text-sm font-medium text-gray-700">Número Ext./Int.</label>
                        <input type="text" name="numero" id="numero" value={form.numero} onChange={handleChange} required className="input-style"/>
                     </div>
                     <div>
                        <label htmlFor="colonia" className="block text-sm font-medium text-gray-700">Colonia</label>
                        <input type="text" name="colonia" id="colonia" value={form.colonia} onChange={handleChange} required className="input-style"/>
                     </div>
                     {/* CP, Municipio, Estado */}
                     <div>
                        <label htmlFor="codigo_postal" className="block text-sm font-medium text-gray-700">Código Postal</label>
                        <input type="text" name="codigo_postal" id="codigo_postal" value={form.codigo_postal} onChange={handleChange} required className="input-style"/>
                     </div>
                     <div>
                        <label htmlFor="municipio" className="block text-sm font-medium text-gray-700">Municipio</label>
                        <input type="text" name="municipio" id="municipio" value={form.municipio} onChange={handleChange} required className="input-style"/>
                     </div>
                     <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado</label>
                        <input type="text" name="estado" id="estado" value={form.estado} onChange={handleChange} required className="input-style"/>
                     </div>
                 </div>
             </fieldset>

            {/* Sección Información Adicional */}
             <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-800 px-2">Información Adicional</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {/* Cámara Comercial, No. Reg. Cámara, No. Reg. IMSS */}
                     <div>
                        <label htmlFor="camara_comercial" className="block text-sm font-medium text-gray-700">Cámara Comercial</label>
                        <input type="text" name="camara_comercial" id="camara_comercial" value={form.camara_comercial} onChange={handleChange} className="input-style"/>
                    </div>
                    <div>
                        <label htmlFor="numero_registro_camara" className="block text-sm font-medium text-gray-700">No. Reg. Cámara</label>
                        <input type="text" name="numero_registro_camara" id="numero_registro_camara" value={form.numero_registro_camara} onChange={handleChange} className="input-style"/>
                    </div>
                    <div>
                        <label htmlFor="numero_registro_imss" className="block text-sm font-medium text-gray-700">No. Reg. IMSS</label>
                        <input type="text" name="numero_registro_imss" id="numero_registro_imss" value={form.numero_registro_imss} onChange={handleChange} className="input-style"/>
                    </div>
                 </div>
             </fieldset>

            {/* --- CAMPOS CONDICIONALES --- */}

            {/* Campos Persona Moral */}
            {tipoProveedorOriginal === 'moral' && (
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-medium text-gray-800 px-2">Información Persona Moral</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                                <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700">Razón Social</label>
                                <input type="text" name="razon_social" id="razon_social" value={form.razon_social} onChange={handleChange} required className="input-style"/>
                            </div>
                            <div>
                                <label htmlFor="nombre_representante" className="block text-sm font-medium text-gray-700">Nombre Representante</label>
                                <input type="text" name="nombre_representante" id="nombre_representante" value={form.nombre_representante} onChange={handleChange} required className="input-style"/>
                            </div>
                             <div>
                                <label htmlFor="apellido_p_representante" className="block text-sm font-medium text-gray-700">Apellido Paterno Rep.</label>
                                <input type="text" name="apellido_p_representante" id="apellido_p_representante" value={form.apellido_p_representante} onChange={handleChange} required className="input-style"/>
                            </div>
                            <div>
                                <label htmlFor="apellido_m_representante" className="block text-sm font-medium text-gray-700">Apellido Materno Rep.</label>
                                <input type="text" name="apellido_m_representante" id="apellido_m_representante" value={form.apellido_m_representante} onChange={handleChange} className="input-style"/> {/* Opcional? */}
                            </div>
                    </div>
                </fieldset>
            )}

            {/* Campos Persona Física */}
            {tipoProveedorOriginal === 'fisica' && (
                 <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-medium text-gray-800 px-2">Información Persona Física</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* ¡Usa las claves del estado 'form'! */}
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                            <input type="text" name="nombre" id="nombre" value={form.nombre} onChange={handleChange} required className="input-style"/>
                        </div>
                        <div>
                            <label htmlFor="apellido_p" className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
                            <input type="text" name="apellido_p" id="apellido_p" value={form.apellido_p} onChange={handleChange} required className="input-style"/>
                        </div>
                         <div>
                            <label htmlFor="apellido_m" className="block text-sm font-medium text-gray-700">Apellido Materno</label>
                            <input type="text" name="apellido_m" id="apellido_m" value={form.apellido_m} onChange={handleChange} className="input-style"/> {/* Opcional? */}
                        </div>
                        <div>
                            <label htmlFor="curp" className="block text-sm font-medium text-gray-700">CURP</label>
                            <input type="text" name="curp" id="curp" value={form.curp} onChange={handleChange} required className="input-style"/>
                        </div>
                    </div>
                </fieldset>
            )}

            {/* --- Botones de Acción --- */}
            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-6">
                <button type="button" onClick={onClose} disabled={isLoading} className="button-secondary">Cancelar</button>
                <button type="submit" disabled={isLoading || !!internalError} className={`button-primary ${isLoading || internalError ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default ModalActualizarProveedor;