// --- START OF FILE src/components/proveedores/dashboard/ProveedorInfo.tsx ---
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProveedor } from './fetchdashboard';
import ModalActualizarProveedor from './modalActualizarProveedor';


// 1. Define la interfaz para los datos del proveedor (basado en tu servicio)
//    Asegúrate que coincida EXACTAMENTE con lo que retorna tu API/servicio
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
  fecha_inscripcion?: string | null; // Asumiendo que son strings de fecha/timestamp
  fecha_vigencia?: string | null;
  estatus?: boolean;
  created_at?: string;
  updated_at?: string;
  fecha_solicitud?: string;
  id_usuario_proveedor?: number;
  tipo_proveedor: 'moral' | 'fisica' | 'desconocido'; // Incluido por el servicio

  // Campos Morales (pueden ser null si es física)
  razon_social?: string | null;
  nombre_representante?: string | null;
  apellido_p_representante?: string | null;
  apellido_m_representante?: string | null;

  // Campos Físicas (pueden ser null si es moral)
  nombre_fisica?: string | null; // O simplemente 'nombre' si ajustaste el servicio/tipo
  apellido_p_fisica?: string | null; // O simplemente 'apellido_p'
  apellido_m_fisica?: string | null; // O simplemente 'apellido_m'
  curp?: string | null;
}

// 2. Define la interfaz para las Props del componente
interface ProveedorInfoProps {
  providerData: ProveedorData | null;
  loading: boolean;
  error: string | null;
  onUpdateClick: () => void; // Función del padre (actualmente placeholder)
  onPdfClick: (id: number) => void; // Función del padre para PDF
  onManageDocumentsClick: () => void; // <-- Nueva prop

}

const ProveedorInfo: React.FC<ProveedorInfoProps> = ({
  providerData,
  loading,
  error,
  // onUpdateClick, // Ya no necesitamos la del padre para ABRIR el modal
  onPdfClick,
  // onUpdateSuccess // Si quieres que el padre refresque
  onManageDocumentsClick
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Estado para feedback de actualización
  const [updateError, setUpdateError] = useState<string | null>(null); // Estado para errores de actualización

  // --- Handlers para el Modal ---
  const handleOpenModal = () => {
      if (providerData) {
          setUpdateError(null); // Limpiar errores previos
          setModalAbierto(true);
      } else {
          console.error("No hay datos de proveedor para editar.");
          // Podrías mostrar una notificación
      }
  };

  const handleCloseModal = () => {
      setModalAbierto(false);
  };
  const handleDetalleClick = (id_proveedor: number) => {
    sessionStorage.setItem("usuarioProveedorid", id_proveedor.toString()); // Convierte el ID a string
};
  const handleSaveUpdate = async (updatedDataFromModal: any) => { // Renombrado para claridad
    // La validación de providerData no es estrictamente necesaria aquí
    // porque el modal no se abriría sin él, pero es buena práctica.
    if (!providerData) {
        console.error("Intento de guardar sin datos de proveedor originales.");
        setUpdateError("Error interno: Faltan datos originales.");
        return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    // YA NO es necesario añadir id_proveedor y tipoProveedor aquí si
    // el modal los prepara correctamente en su propio handleSubmit.
    // Solo pasamos lo que el modal nos da.
    console.log("ProveedorInfo: Received data from modal:", updatedDataFromModal);

    try {
        // Llama a la función de fetchdashboard para actualizar
        // Asumiendo que updatedDataFromModal ya incluye id_proveedor y tipoProveedor
        // como lo espera la API. Si no, necesitas añadirlos aquí o (mejor) en el modal.
        await updateProveedor(updatedDataFromModal);
        console.log("ProveedorInfo: Update successful");
        handleCloseModal();
        window.location.reload(); // <--- AÑADIR ESTA LÍNEA
        //alert("Proveedor actualizado con éxito!");
        // TODO: Añadir lógica para refrescar datos (e.g., llamar a una función onUpdateSuccess pasada desde page.tsx)

    } catch (err: any) {
        console.error("ProveedorInfo: Error saving update:", err);
        // El error se mostrará DENTRO del modal si se lo pasas como prop.
        // Si quieres mostrarlo fuera después de cerrar, necesitas otro estado.
        setUpdateError(err.message || "Error desconocido al guardar.");
        // NO cierres el modal en caso de error para que el usuario vea el mensaje.
        // handleCloseModal(); // <-- NO CERRAR AQUÍ EN ERROR
    } finally {
        setIsUpdating(false);
    }
};

  // --- Renderizado Condicional ---
  if (loading) {
      return <div className="text-center p-10">Cargando datos del proveedor...</div>;
  }

  if (error) {
      // Muestra el error específico de carga inicial
      // Podrías tener un botón para reintentar si es apropiado
      return <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded text-center">{error}</div>;
  }

  if (!providerData) {
      // Caso donde no hay loading, no hay error, pero no hay datos (podría pasar si la API devuelve null correctamente)
      return <div className="text-center p-10">No se encontraron datos del proveedor.</div>;
  }

  // --- Renderizado de Datos (Si todo está bien) ---
  const { tipo_proveedor } = providerData;

  return (
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Información del Proveedor</h1>

          {/* Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b pb-4">
              <p><strong>RFC:</strong> {providerData.rfc}</p>
              <p><strong>Correo Electrónico:</strong> {providerData.correo ?? 'N/A'}</p>
              <p><strong>Giro Comercial:</strong> {providerData.giro_comercial ?? 'N/A'}</p>
              <p><strong>Teléfono 1:</strong> {providerData.telefono_uno ?? 'N/A'}</p>
              <p><strong>Teléfono 2:</strong> {providerData.telefono_dos ?? 'N/A'}</p>
              <p><strong>Página Web:</strong> {providerData.pagina_web ? <a href={providerData.pagina_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{providerData.pagina_web}</a> : 'N/A'}</p>
              <p><strong>Estatus:</strong> <span className={`px-2 py-1 rounded text-xs font-medium ${providerData.estatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{providerData.estatus ? 'Activo' : 'Inactivo'}</span></p>
          </div>

          {/* Dirección */}
          <div className="mb-6 border-b pb-4">
              <h2 className="text-xl font-medium mb-2 text-gray-700">Dirección</h2>
              <p>{providerData.calle ?? ''} {providerData.numero ?? ''}, <strong>Col.</strong> {providerData.colonia ?? ''}</p>
              <p>{providerData.municipio ?? ''}, {providerData.estado ?? ''}, <strong>C.P.</strong> {providerData.codigo_postal ?? ''}</p>
          </div>

          {/* Datos Específicos (Moral / Física) */}
          <div className="mb-6 border-b pb-4">
              <h2 className="text-xl font-medium mb-2 text-gray-700">
                  Datos Específicos ({tipo_proveedor === 'moral' ? 'Persona Moral' : tipo_proveedor === 'fisica' ? 'Persona Física' : 'Tipo Desconocido'})
              </h2>
              {tipo_proveedor === 'moral' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p><strong>Razón Social:</strong> {providerData.razon_social ?? 'N/A'}</p>
                      <p><strong>Representante:</strong> {`${providerData.nombre_representante ?? ''} ${providerData.apellido_p_representante ?? ''} ${providerData.apellido_m_representante ?? ''}`.trim() || 'N/A'}</p>
                  </div>
              )}
              {tipo_proveedor === 'fisica' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p><strong>Nombre Completo:</strong> {`${providerData.nombre_fisica ?? ''} ${providerData.apellido_p_fisica ?? ''} ${providerData.apellido_m_fisica ?? ''}`.trim() || 'N/A'}</p>
                      <p><strong>CURP:</strong> {providerData.curp ?? 'N/A'}</p>
                  </div>
              )}
               {tipo_proveedor === 'desconocido' && (
                  <p className="text-orange-600">No se pudieron determinar los datos específicos (Moral/Física).</p>
               )}
          </div>

          {/* Registros Adicionales */}
          <div className="mb-6">
               <h2 className="text-xl font-medium mb-2 text-gray-700">Registros</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Cámara Comercial:</strong> {providerData.camara_comercial ?? 'N/A'}</p>
                  <p><strong>No. Reg. Cámara:</strong> {providerData.numero_registro_camara ?? 'N/A'}</p>
                  <p><strong>No. Reg. IMSS:</strong> {providerData.numero_registro_imss ?? 'N/A'}</p>
                  {/* Fechas (formatear si es necesario) */}
                  <p><strong>Fecha Solicitud:</strong> {providerData.fecha_solicitud ? providerData.fecha_solicitud : 'N/A'}</p>
                  <p><strong>Última Actualización:</strong> {providerData.updated_at ? new Date(providerData.updated_at).toLocaleString() : 'N/A'}</p>
               </div>
          </div>


          <div className="flex justify-end space-x-3 mt-6">
              <button
                  onClick={handleOpenModal}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                  Modificar Información
                  
              </button>
              <button
                  onClick={() => onPdfClick(providerData.id_proveedor)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
              >
                  Generar PDF
              </button>
              <button
             onClick={onManageDocumentsClick} // <-- Usar la nueva prop
             className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded shadow transition duration-150 ease-in-out"
             // Opcional: deshabilitar si falta id_proveedor explícitamente
             // disabled={!providerData?.id_proveedor}
         >
             Gestionar Documentos
         </button>
          </div>

          {/* --- Integración del Modal --- */}
          {modalAbierto && providerData && (
              <ModalActualizarProveedor
                  datos={providerData} // <--- PASAR providerData
                  onClose={handleCloseModal}
                  onSubmit={handleSaveUpdate} // Pasa la función que llama a la API
                  // Pasa también el estado de carga y error si el modal los va a mostrar
                  isLoading={isUpdating}
                  error={updateError}
              />
          )}
      </div>
  );
};

export default ProveedorInfo;