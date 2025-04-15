// --- START OF FILE src/components/proveedores/dashboard/ProveedorInfo.tsx ---
'use client';
import React, { useState } from 'react';
import { updateProveedor } from './fetchdashboard'; // Asegúrate que la ruta sea correcta
import ModalActualizarProveedor from './modalActualizarProveedor'; // Importa el modal
import { generateProveedorPdfClientSide } from '../../../PDF/usuarioProveedor'; // Ajusta ruta
import { revalidacionProveedores } from '../../../PDF/revalidacionProveedores'; // Ajusta ruta

// 1. Define la interfaz para los datos del proveedor (ACTUALIZADA)
interface ProveedorData {
  id_proveedor: number;
  rfc: string;
  giro_comercial?: string | null;
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
  fecha_inscripcion?: string | null;
  fecha_vigencia?: string | null;
  estatus?: boolean;
  created_at?: string;
  updated_at?: string;
  fecha_solicitud?: string;
  id_usuario_proveedor?: number;
  tipo_proveedor: 'moral' | 'fisica' | 'desconocido';

  // **NUEVOS CAMPOS (snake_case como vienen de la API)**
  actividad_sat?: string | null;
  proveedor_eventos?: boolean | null;

  // Campos Morales
  razon_social?: string | null;
  nombre_representante?: string | null;
  apellido_p_representante?: string | null;
  apellido_m_representante?: string | null;

  // Campos Físicas
  nombre_fisica?: string | null;
  apellido_p_fisica?: string | null;
  apellido_m_fisica?: string | null;
  curp?: string | null;

  // Permite otros campos si es necesario
   [key: string]: any;
}

// 2. Define la interfaz para las Props (Ajustada)
interface ProveedorInfoProps {
  providerData: ProveedorData | null;
  loading: boolean;
  error: string | null;
  // onUpdateClick ya no es necesaria porque este componente maneja la apertura
  // onPdfClick puede quedarse si la lógica PDF se mantiene aquí
  onManageDocumentsClick: () => void; // Para navegar a documentos
   // Opcional: añadir onUpdateSuccess si page.tsx necesita saber del éxito
   // onUpdateSuccess?: () => void;
}

// --- Componente Helper para mostrar info (Opcional pero útil) ---
const InfoFieldDisplay: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <p className="text-sm text-gray-700 mb-1 break-words">
        <span className="font-semibold text-gray-800">{label}:</span>
        <span className="ml-1">{value ?? <span className="text-gray-400 italic">N/A</span>}</span>
    </p>
);


// --- Componente Principal ---
const ProveedorInfo: React.FC<ProveedorInfoProps> = ({
  providerData,
  loading,
  error,
  // onPdfClick, // Descomentar si se usa
  onManageDocumentsClick
  // onUpdateSuccess // Descomentar si se usa
}) => {
  // Estados locales para el modal y la actualización (MANTENIDOS)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Estados locales para PDF (MANTENIDOS)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // --- Handlers para el Modal (MANTENIDOS) ---
  const handleOpenModal = () => {
      if (providerData) {
          setUpdateError(null); // Limpiar errores del modal anterior
          setModalAbierto(true);
          console.log("ProveedorInfo: Abriendo modal de edición.");
      } else {
          console.error("ProveedorInfo: No hay datos para editar.");
          alert("No se pueden editar los datos porque no se han cargado.");
      }
  };

  const handleCloseModal = () => {
      setModalAbierto(false);
      console.log("ProveedorInfo: Cerrando modal de edición.");
      // No limpiar updateError aquí, podría ser útil verlo si se reabre rápido
  };

 // --- Handler para Guardar Cambios (Llama a la API directamente) (MANTENIDO) ---
 const handleSaveUpdate = async (updatedDataFromModal: any) => {
    if (!providerData) {
        console.error("ProveedorInfo: Intento de guardar sin datos originales.");
        setUpdateError("Error interno: Faltan datos originales del proveedor.");
        return; // Salir temprano
    }
    // Validación: Asegurarse que los datos del modal incluyan id_proveedor y tipoProveedor
    if (!updatedDataFromModal || !updatedDataFromModal.id_proveedor || !updatedDataFromModal.tipoProveedor) {
         console.error("ProveedorInfo: Datos inválidos recibidos del modal para actualizar:", updatedDataFromModal);
         setUpdateError("Error interno: Datos incompletos desde el formulario de edición.");
         setIsUpdating(false); // Detener indicardor de carga
         return; // No continuar
    }


    setIsUpdating(true);
    setUpdateError(null); // Limpiar error antes de intentar

    console.log("ProveedorInfo: Enviando datos para actualizar:", updatedDataFromModal);

    try {
        // Llama a la función fetch de actualización directamente
        await updateProveedor(updatedDataFromModal);

        console.log("ProveedorInfo: Actualización exitosa.");
        alert("¡Proveedor actualizado con éxito!"); // Notificación simple
        handleCloseModal(); // Cierra el modal
        // **RECARGA LA PÁGINA para ver los cambios** (Simple, pero efectivo)
        // Alternativa: Llamar a una función onUpdateSuccess pasada desde page.tsx
        // para que page.tsx vuelva a hacer fetch sin recargar toda la página.
        window.location.reload();
        // if(onUpdateSuccess) onUpdateSuccess();


    } catch (err: any) {
        console.error("ProveedorInfo: Error al guardar la actualización:", err);
        // Mostrar el error DENTRO DEL MODAL
        setUpdateError(err.message || "Error desconocido al guardar los cambios.");
        // NO cerrar el modal para que el usuario vea el error
    } finally {
        setIsUpdating(false); // Terminar el estado de carga
    }
};


  // --- Handlers para PDF (MANTENIDOS) ---
    const handleGeneratePdfClick = async () => {
        if (!providerData) { setPdfError("No hay datos."); return; }
        setIsGeneratingPdf(true); setPdfError(null);
        try {
            await generateProveedorPdfClientSide(providerData); // Pasa los datos completos
        } catch (err: any) { setPdfError(err.message || "Error generando PDF Solicitud."); }
        finally { setIsGeneratingPdf(false); }
    };

    const handleRevalidadProveedores = async () => {
        if (!providerData) { setPdfError("No hay datos."); return; }
        setIsGeneratingPdf(true); setPdfError(null);
        try {
            await revalidacionProveedores(providerData); // Pasa los datos completos
        } catch (err: any) { setPdfError(err.message || "Error generando PDF Revalidación."); }
        finally { setIsGeneratingPdf(false); }
    };

  // --- Renderizado Condicional ---
  if (loading) {
      return <div className="text-center p-10 text-gray-600">Cargando datos del proveedor...</div>;
  }

  if (error) {
      return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg mx-auto text-center" role="alert">{error}</div>;
  }

  if (!providerData) {
      return <div className="text-center p-10 text-gray-500">No se encontraron datos del proveedor.</div>;
  }

  // --- Renderizado de Datos (ACTUALIZADO) ---
  const { tipo_proveedor } = providerData;
  const isMoral = tipo_proveedor === 'moral';
  const isFisica = tipo_proveedor === 'fisica';

  return (
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-4xl mx-auto">
          {pdfError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  <strong>Error de PDF:</strong> {pdfError}
              </div>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
                Información del Proveedor
          </h1>

          {/* --- Sección Datos Principales (ACTUALIZADA) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 mb-6 border-b pb-4">
              <InfoFieldDisplay label="RFC" value={providerData.rfc} />
              <InfoFieldDisplay label="Tipo" value={isMoral ? 'Persona Moral' : isFisica ? 'Persona Física' : 'Desconocido'} />
              <InfoFieldDisplay label="Correo Electrónico" value={providerData.correo} />
              <InfoFieldDisplay label="Giro Comercial" value={providerData.giro_comercial} />

              {/* --- NUEVO: Actividad SAT --- */}
              <InfoFieldDisplay label="Actividad Económica (SAT)" value={providerData.actividad_sat} />

              <InfoFieldDisplay label="Teléfono Principal" value={providerData.telefono_uno} />
              <InfoFieldDisplay label="Teléfono Secundario" value={providerData.telefono_dos} />
              <InfoFieldDisplay label="Página Web" value={providerData.pagina_web ? <a href={providerData.pagina_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{providerData.pagina_web}</a> : undefined} />
              <InfoFieldDisplay label="Estatus" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${providerData.estatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{providerData.estatus ? 'Activo' : 'Inactivo'}</span>} />

               {/* --- NUEVO: Proveedor Eventos --- */}
               <InfoFieldDisplay label="Proveedor para Eventos" value={providerData.proveedor_eventos ? 'Sí' : 'No'} />
          </div>

          {/* --- Dirección --- */}
          <div className="mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">Dirección</h2>
              <InfoFieldDisplay label="Dirección Completa" value={`${providerData.calle || ''} #${providerData.numero || ''}, Col. ${providerData.colonia || ''}, C.P. ${providerData.codigo_postal || ''}, ${providerData.municipio || ''}, ${providerData.estado || ''}`} />
          </div>

          {/* --- Datos Específicos --- */}
          <div className="mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                  Datos Específicos ({isMoral ? 'Persona Moral' : isFisica ? 'Persona Física' : 'Tipo Desconocido'})
              </h2>
              {isMoral && (
                  <>
                      <InfoFieldDisplay label="Razón Social" value={providerData.razon_social} />
                      <InfoFieldDisplay label="Representante Legal" value={`${providerData.nombre_representante || ''} ${providerData.apellido_p_representante || ''} ${providerData.apellido_m_representante || ''}`.trim()} />
                  </>
              )}
              {isFisica && (
                  <>
                      <InfoFieldDisplay label="Nombre Completo" value={`${providerData.nombre_fisica || ''} ${providerData.apellido_p_fisica || ''} ${providerData.apellido_m_fisica || ''}`.trim()} />
                      <InfoFieldDisplay label="CURP" value={providerData.curp} />
                  </>
              )}
               {!isMoral && !isFisica && tipo_proveedor !== 'desconocido' && (
                   <p className="text-gray-500 italic">Información específica no aplicable o no disponible.</p>
               )}
               {tipo_proveedor === 'desconocido' && (
                  <p className="text-orange-600 italic">No se pudo determinar el tipo de proveedor.</p>
               )}
          </div>

          {/* --- Registros Adicionales --- */}
          <div className="mb-6">
               <h2 className="text-xl font-semibold mb-3 text-gray-700">Registros Adicionales</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <InfoFieldDisplay label="Cámara Comercial" value={providerData.camara_comercial} />
                  <InfoFieldDisplay label="No. Reg. Cámara" value={providerData.numero_registro_camara} />
                  <InfoFieldDisplay label="No. Reg. IMSS" value={providerData.numero_registro_imss} />
                  <InfoFieldDisplay label="Fecha Solicitud" value={providerData.fecha_solicitud ? new Date(providerData.fecha_solicitud).toLocaleDateString() : undefined} />
                  <InfoFieldDisplay label="Última Actualización" value={providerData.updated_at ? new Date(providerData.updated_at).toLocaleString() : undefined} />
               </div>
          </div>

          {/* --- Botones de Acción --- */}
          <div className="flex flex-wrap justify-end gap-3 mt-6 pt-6 border-t">
              <button
                  onClick={handleOpenModal} // Llama al handler local para abrir
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                  disabled={isUpdating || isGeneratingPdf}
              >
                  Modificar Información
              </button>
              <button
                   onClick={handleGeneratePdfClick}
                   className={`bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={isGeneratingPdf || isUpdating}
               >
                   {isGeneratingPdf ? 'Generando Solicitud...' : 'Generar Solicitud PDF'}
               </button>
               <button
                   onClick={handleRevalidadProveedores}
                   className={`bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                   disabled={isGeneratingPdf || isUpdating}
               >
                   {isGeneratingPdf ? 'Generando Revalidación...' : 'Generar Revalidación PDF'}
               </button>
              <button
                 onClick={onManageDocumentsClick} // Llama a la prop del padre
                 className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                 disabled={isUpdating || isGeneratingPdf} // Deshabilitar si está actualizando/generando PDF
             >
                 Gestionar Documentos
             </button>
          </div>

          {/* --- Renderizado del Modal (Controlado localmente) --- */}
          {modalAbierto && providerData && (
              <ModalActualizarProveedor
                  // Props para el modal
                  isOpen={modalAbierto} // Pasa el estado local
                  onClose={handleCloseModal} // Pasa el handler local para cerrar
                  proveedorData={providerData} // Pasa los datos actuales
                  onUpdateSuccess={() => { // Define inline el callback de éxito para el modal
                      console.log("Modal reportó éxito, recargando página...");
                      handleCloseModal(); // Cierra el modal
                      window.location.reload(); // Recarga la página
                      // Opcional: llamar a onUpdateSuccess del padre si existe
                      // if (onUpdateSuccess) onUpdateSuccess();
                  }}
                  // Si el modal ya no maneja su propio estado de carga/error,
                  // pasa los estados locales de ProveedorInfo
                  // isLoading={isUpdating}
                  // error={updateError}
                  // Si el modal SÍ maneja su estado interno, no necesitas pasarle estos
              />
          )}
      </div>
  );
};

export default ProveedorInfo;
// --- END OF FILE ---