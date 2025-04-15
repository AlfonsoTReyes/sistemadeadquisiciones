// --- START OF FILE src/app/proveedores/dashboard/page.tsx ---
'use client';
/*
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PieP from "../../pie";
import DynamicMenu from "../../menu_principal";
import ProveedorData from './formularios/ProveedorInfo';
import { getProveedorForUser } from './formularios/fetchdashboard'; // Import fetch function
*/
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useRouter } from 'next/navigation';
import PieP from "../../pie";
import DynamicMenu from "../../menu_principal";
import ProveedorData from './formularios/ProveedorInfo'; // Asumiendo que este es ProveedorInfo
import ModalActualizarProveedor from './formularios/modalActualizarProveedor'; // Importar el Modal
import { getProveedorForUser } from './formularios/fetchdashboard'; // Import fetch function (asumiendo es el mismo)

export default function PageProveedorDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [providerData, setProviderData] = useState<{ id_proveedor: number, tipo_proveedor: string, [key: string]: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State for Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para obtener datos (envuelta en useCallback para estabilidad)
  const fetchProviderData = useCallback(async (idUsuario: number) => {
    if (!idUsuario) return; // Evitar llamadas si no hay ID
    setError(null);
    setLoading(true);
    console.log(`Dashboard: Fetching data for user ID: ${idUsuario}`);
    try {
      const data = await getProveedorForUser(idUsuario); // Usa fetch del dashboard
      // LA RESPUESTA 'data' YA DEBERÍA CONTENER actividad_sat y proveedor_eventos
      if (data && data.id_proveedor && data.tipo_proveedor) {
        setProviderData(data);
        console.log("Dashboard: Provider data loaded:", data); // Verificar si vienen los nuevos campos
        // Guardar en sessionStorage (opcional, si otras partes lo necesitan)
        if (typeof window !== "undefined") {
          sessionStorage.setItem('proveedorId', data.id_proveedor.toString());
          sessionStorage.setItem('proveedorTipo', data.tipo_proveedor);
        }
      } else {
        console.warn("Dashboard: Datos del proveedor recibidos incompletos o sin ID/Tipo:", data);
        setProviderData(null); // Limpiar datos
        if (typeof window !== "undefined") { // Limpiar sessionStorage
             sessionStorage.removeItem('proveedorId');
             sessionStorage.removeItem('proveedorTipo');
        }
        // Mostrar error específico si no se encontraron datos válidos
        setError('No se encontró un perfil de proveedor completo asociado.');
      }
    } catch (err: any) {
      console.error("Dashboard: Error fetching provider data:", err);
       setProviderData(null); // Limpiar datos en caso de error
       if (typeof window !== "undefined") { // Limpiar sessionStorage
           sessionStorage.removeItem('proveedorId');
           sessionStorage.removeItem('proveedorTipo');
       }
       setError(err.message || 'Error al cargar los datos del proveedor.');
       // Si el error es 'Perfil no encontrado', podrías ofrecer ir al registro
       // if (err.message?.includes('Perfil de proveedor no encontrado')) { ... }
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias, ya que idUsuario se pasa como argumento

  // Efecto para obtener el User ID y llamar a fetch inicial
  useEffect(() => {
    const storedUserId = sessionStorage.getItem('proveedorUserId');
    console.log("Dashboard Effect: Checking user ID in session:", storedUserId);
    if (storedUserId) {
      const userIdNum = parseInt(storedUserId, 10);
      if (!isNaN(userIdNum)) {
        setUserId(userIdNum);
        fetchProviderData(userIdNum); // Llamar fetch aquí
      } else {
        setError("ID de usuario inválido en sesión.");
        setLoading(false);
      }
    } else {
      setError("Usuario no autenticado. Por favor, inicie sesión.");
      setLoading(false);
      // Redirigir a login si no hay ID
      router.push('/proveedores/login');
    }
  }, [router, fetchProviderData]); // Depender de fetchProviderData

 // --- Funciones para manejar el Modal ---
 const handleOpenEditModal = () => {
    if (providerData) { // Solo abrir si hay datos para editar
      setIsModalOpen(true);
      console.log("Dashboard: Opening edit modal.");
    } else {
        console.error("Dashboard: Cannot open edit modal, provider data is missing.");
        alert("No hay datos de proveedor cargados para editar.");
    }
 };

 const handleCloseModal = () => {
    setIsModalOpen(false);
    console.log("Dashboard: Closing edit modal.");
 };

 // Función que se llama desde el modal tras una actualización exitosa
 const handleUpdateSuccess = () => {
    console.log("Dashboard: Update successful! Refetching data...");
    handleCloseModal(); // Cerrar el modal
    if (userId) {
        fetchProviderData(userId); // Volver a cargar los datos frescos
    }
 };

 // --- Función para Documentos (sin cambios) ---
 const handleManageDocumentsClick = () => {
    if (providerData && providerData.id_proveedor && providerData.tipo_proveedor) {
        // Guardar info necesaria en sessionStorage antes de navegar
        sessionStorage.setItem('proveedorId', providerData.id_proveedor.toString());
        sessionStorage.setItem('proveedorTipo', providerData.tipo_proveedor);
        console.log("Dashboard: Navigating to documents page...");
        router.push('/proveedores/documentos');
    } else {
        alert("No se pueden gestionar los documentos porque los datos del proveedor no están cargados.");
        console.warn("Dashboard: Cannot navigate to documents, missing provider data.");
    }
 };

 // --- Renderizado ---
  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4 md:p-8 bg-gray-50" style={{ marginTop: 100 }}>
         {/* Componente para mostrar la info */}
         <ProveedorData
            providerData={providerData}
            loading={loading}
            error={error}
            onEditClick={handleOpenEditModal} // Pasar la función para abrir el modal
            onManageDocumentsClick={handleManageDocumentsClick}
         />
      </div>
      <PieP />

      {/* Renderizar el Modal condicionalmente */}
      {isModalOpen && providerData && (
         <ModalActualizarProveedor
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            proveedorData={providerData} // Pasar los datos actuales al modal
            onUpdateSuccess={handleUpdateSuccess} // Pasar la función de callback
         />
      )}
    </div>
  );
}
// --- END OF FILE ---