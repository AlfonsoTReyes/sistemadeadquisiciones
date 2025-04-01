// --- START OF FILE src/components/proveedores/dashboard/ProveedorInfo.tsx ---
'use client';
import React, { useEffect, useState } from 'react';
import { getProveedor } from './fetchdashboard';
import ModalActualizarProveedor from './modalActualizarProveedor';


interface DatosGeneralesProps {
    idProveedor: number; // ID of the main provider profile being viewed
  }
  
  const DatosGenerales: React.FC<DatosGeneralesProps> = ({ idProveedor }) => {
    const [datos, setDatos] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
  
    const cargarProveedor = async () => {
      setLoading(true);
      setError('');
      try {
         console.log(`DatosGenerales: Fetching provider data for ID: ${idProveedor}`);
         // Ensure getProveedor fetches data including tipo_proveedor
        const data = await getProveedor(idProveedor);
        console.log("DatosGenerales: Fetched data:", data);
        if (!data || !data.id_proveedor) { // Basic check for valid data
            throw new Error("No se recibieron datos válidos del proveedor.");
        }
        setDatos(data);
      } catch (err: any) {
        console.error("DatosGenerales: Error loading provider:", err);
        console.error("DatosGenerales: Error loading provider:", err);
        setError(err.message || "Error al cargar los datos del proveedor.");
      } finally {
        setLoading(false);
      }
    };
  
    // Reload data when ID changes or when update is successful
    useEffect(() => {
      if (idProveedor) {
          cargarProveedor();
      } else {
          setError("ID de Proveedor no proporcionado.");
          setLoading(false);
      }
    }, [idProveedor]);
  
    const abrirModal = () => {
        if (datos) { // Only open modal if data is loaded
           setModalAbierto(true);
        } else {
            setError("No hay datos para actualizar. Intente recargar.");
        }
    };
    const cerrarModal = () => setModalAbierto(false);
  
    // Function to refresh data after update
    const handleUpdateSuccess = () => {
        cerrarModal();
        cargarProveedor(); // Re-fetch the data
    };
  
  
    if (loading) return <div className="text-center p-10">Cargando...</div>;
    if (error) return <div className="text-center p-10 text-red-600">Error: {error}</div>;
    if (!datos) return <div className="text-center p-10">No se encontraron datos del proveedor.</div>; // Handle case where data is null after loading
  
  
    // Helper function for displaying data safely
    const displayData = (value: any, fallback: string = 'N/A') => value || fallback;
    // Helper for formatting dates/times (requires refinement based on actual types)
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        try {
            // Attempt to create a Date object - might need adjustments for TIME vs TIMESTAMP
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Return original if invalid
             // Example formatting - adjust as needed
            if (dateString.includes('T') || dateString.includes(':')) { // Crude check for timestamp/time
               return date.toLocaleString();
            } else {
                return date.toLocaleDateString(); // Assume date only if no time part
            }
        } catch (e) {
            return dateString; // Return original string if parsing fails
        }
    };
  
  
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <h1 className="text-2xl text-center font-bold mb-6 text-gray-800">Datos Generales del Proveedor</h1>
  
         {/* Display Provider Type */}
         <div className="mb-4 text-lg font-semibold text-center text-indigo-700">
              Tipo: {datos.tipo_proveedor === 'moral' ? 'Persona Moral' : datos.tipo_proveedor === 'fisica' ? 'Persona Física' : 'Desconocido'}
         </div>
  
        {/* Use grid for better alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
           {/* Display fields conditionally based on type */}
            {datos.tipo_proveedor === 'moral' && (
              <>
                <div><strong>Razón Social:</strong> {displayData(datos.razon_social)}</div>
                <div><strong>Representante:</strong> {`${displayData(datos.nombre_representante)} ${displayData(datos.apellido_p_representante)} ${displayData(datos.apellido_m_representante, '')}`}</div>
              </>
            )}
             {datos.tipo_proveedor === 'fisica' && (
              <>
                <div><strong>Nombre:</strong> {`${displayData(datos.nombre_fisica)} ${displayData(datos.apellido_p_fisica)} ${displayData(datos.apellido_m_fisica, '')}`}</div>
                <div><strong>CURP:</strong> {displayData(datos.curp)}</div>
              </>
            )}
  
            {/* Common Fields */}
            <div className="md:col-span-2"><strong>Domicilio Fiscal:</strong> {`${displayData(datos.calle)}, ${displayData(datos.numero)}, ${displayData(datos.colonia)}, ${displayData(datos.municipio)}, ${displayData(datos.estado)}, CP ${displayData(datos.codigo_postal)}`}</div>
            <div><strong>RFC:</strong> {displayData(datos.rfc)}</div>
            <div><strong>Giro Comercial:</strong> {displayData(datos.giro_comercial)}</div>
            <div><strong>Registro IMSS:</strong> {displayData(datos.numero_registro_imss)}</div>
            <div><strong>Registro Cámara:</strong> {`${displayData(datos.camara_comercial)} - ${displayData(datos.numero_registro_camara)}`}</div>
            <div><strong>Correo electrónico:</strong> {displayData(datos.correo)}</div>
            <div><strong>Teléfonos:</strong> {`${displayData(datos.telefono_uno)} / ${displayData(datos.telefono_dos)}`}</div>
            <div><strong>Página Web:</strong> {displayData(datos.pagina_web)}</div>
            {/* Display new date fields */}
             <div><strong>Fecha Inscripción:</strong> {formatDate(datos.fecha_inscripcion)}</div>
             <div><strong>Fecha Vigencia:</strong> {formatDate(datos.fecha_vigencia)}</div>
             <div><strong>Fecha Solicitud:</strong> {formatDate(datos.fecha_solicitud)}</div>
             <div><strong>Última Actualización:</strong> {formatDate(datos.updated_at)}</div>
             <div><strong>Estatus:</strong> {datos.estatus ? 'Activo' : 'Inactivo'}</div>
        </div>
  
        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8 justify-center">
          <button
              onClick={abrirModal}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition duration-150 ease-in-out"
              disabled={!datos} // Disable if no data
          >
              Actualizar Datos
          </button>
          <button className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded shadow transition duration-150 ease-in-out">
              Generar PDF (Pendiente)
          </button>
        </div>
  
        {/* Render Modal Conditionally */}
        {modalAbierto && datos && (
          <ModalActualizarProveedor
            datos={datos} // Pass the full data object
            onClose={cerrarModal}
            onUpdated={handleUpdateSuccess} // Pass the refresh handler
          />
        )}
      </div>
    );
  };
  
  export default DatosGenerales;