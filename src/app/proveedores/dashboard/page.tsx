// --- START OF FILE src/app/proveedores/dashboard/page.tsx (CORREGIDO) ---
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PieP from "../../pie"; // Asegúrate que la ruta sea correcta
import DynamicMenu from "../../menu_proveedor"; // Asegúrate que la ruta sea correcta
// import PusherClient from 'pusher-js'; // <-- Ya no se necesita importar aquí
import ProveedorInfo from './formularios/ProveedorInfo'; // Ajusta ruta
import ModalActualizarProveedor from './formularios/modalActualizarProveedor'; // Ajusta ruta
import { getProveedorForUser } from './formularios/fetchdashboard'; // Ajusta ruta
import { ProveedorData as ProveedorCompletoData } from './formularios/ProveedorInfo'; // Ajusta ruta e interfaz

// Define la URL de login una sola vez para consistencia
const LOGIN_URL = '/proveedores/proveedoresusuarios';

export default function PageProveedorDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [providerData, setProviderData] = useState<ProveedorCompletoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estados para el modal si los necesita como props
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateProfileError, setUpdateProfileError] = useState<string | null>(null);


  // --- Función para Cargar/Refrescar Datos del Proveedor (Sin cambios) ---
  const fetchProviderData = useCallback(async (idUsuario: number) => {
    if (!idUsuario) return;
    console.log(`Dashboard: Fetching/Refreshing data for user ID: ${idUsuario}`);
    setError(null);
    try {
      const data = await getProveedorForUser(idUsuario);
      if (data && data.id_proveedor && data.tipo_proveedor) {
        setProviderData(data as ProveedorCompletoData);
        console.log("Dashboard: Provider data loaded/refreshed:", data);
        // Guardar/Actualizar IDs en sessionStorage
        sessionStorage.setItem('proveedorId', data.id_proveedor.toString());
        sessionStorage.setItem('proveedorTipo', data.tipo_proveedor);
      } else {
        console.warn("Dashboard: Profile not found or incomplete after fetch for user ID:", idUsuario);
        setProviderData(null);
        sessionStorage.removeItem('proveedorId');
        sessionStorage.removeItem('proveedorTipo');
        setError('No se encontró un perfil de proveedor completo.');
      }
    } catch (err: any) {
      console.error("Dashboard: Error fetching provider data:", err);
      setProviderData(null);
      sessionStorage.removeItem('proveedorId');
      sessionStorage.removeItem('proveedorTipo');
      setError(err.message || 'Error al cargar los datos del proveedor.');
    } finally {
      // No es necesario setLoading(false) aquí si el caller lo maneja
    }
  }, []);

  // --- Efecto para Carga Inicial (Sin cambios) ---
  useEffect(() => {
    console.log("Dashboard: Montando componente y ejecutando useEffect de carga inicial...");
    setLoading(true);
    const storedUserId = sessionStorage.getItem('proveedorUserId');
    console.log(`Dashboard: Leyendo 'proveedorUserId' de sessionStorage. Valor obtenido: [${storedUserId}]`);

    if (storedUserId) {
      const userIdNum = parseInt(storedUserId, 10);
      if (!isNaN(userIdNum)) {
        console.log(`Dashboard: 'proveedorUserId' válido: ${userIdNum}. Buscando datos.`);
        setUserId(userIdNum);
        fetchProviderData(userIdNum).finally(() => {
          console.log("Dashboard: fetchProviderData finalizó.");
          setLoading(false);
        });
      } else {
        console.error(`Dashboard: 'proveedorUserId' ('${storedUserId}') inválido.`);
        setError("ID de usuario en sesión inválido.");
        setLoading(false);
        router.push(LOGIN_URL);
      }
    } else {
      console.warn("Dashboard: 'proveedorUserId' NO encontrado. Redirigiendo a login.");
      setError("Usuario no autenticado.");
      setLoading(false);
      router.push(LOGIN_URL);
    }
  }, [router, fetchProviderData]);


  // --- useEffect para Suscripción Pusher (ELIMINADO) ---
  // La lógica de Pusher ahora está en el hook usePusherNotifications,
  // que se inicializa dentro del componente del Menú.


  // --- Handlers Modal Edición (Sin cambios) ---
  const handleOpenEditModal = () => {
    if (providerData) {
      setUpdateProfileError(null);
      setIsModalOpen(true);
    } else {
      alert("No hay datos de proveedor cargados para editar.");
    }
  };
  const handleCloseModal = () => setIsModalOpen(false);

  // Callback para el éxito del modal (Sin cambios)
  const handleUpdateSuccess = () => {
    console.log("Dashboard: Modal informó éxito. Recargando datos del proveedor...");
    handleCloseModal();
    if (userId) {
      fetchProviderData(userId); // Recarga los datos
    }
  };

  // --- Handler para Documentos (Sin cambios) ---
  const handleManageDocumentsClick = () => {
    if (providerData && providerData.id_proveedor && providerData.tipo_proveedor) {
      // Asegurarse que los IDs estén en sessionStorage antes de navegar
      sessionStorage.setItem('proveedorId', providerData.id_proveedor.toString());
      sessionStorage.setItem('proveedorTipo', providerData.tipo_proveedor);
      console.log("Dashboard: Navigating to documents page...");
      router.push('/proveedores/documentos');
    } else {
      alert("Datos del proveedor no disponibles para gestionar documentos.");
      console.warn("Dashboard: Cannot navigate to documents, missing provider data.");
    }
  };

  // --- Renderizado (Sin cambios en la estructura) ---
  return (
    <div className="flex flex-col min-h-screen">
      <DynamicMenu /> {/* El Menú ahora contiene el listener de Pusher */}
      <main className="flex-grow p-4 md:p-8 bg-gray-50 pt-20 md:pt-24">

        {/* Loading / Error */}
        {loading && <p className="text-center text-gray-600 py-10">Cargando información...</p>}
        {error && !loading && (
          <div className="text-center py-10 text-red-600 bg-red-100 border border-red-400 p-4 rounded-md max-w-lg mx-auto shadow-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Contenido Principal: ProveedorInfo */}
        {!loading && !error && providerData && (
          <ProveedorInfo
            providerData={providerData}
            loading={false} // Ya no está cargando la página
            error={null}    // No hay error de página
            onManageDocumentsClick={handleManageDocumentsClick}
            onEditProfileClick={handleOpenEditModal}
            // Pasar la función de refresh para que ProveedorInfo la use si es necesario
            onDataRefreshNeeded={() => { if (userId) fetchProviderData(userId); }}
          />
        )}

        {/* Mensaje si no hay datos */}
        {!loading && !error && !providerData && (
          <p className="text-center text-gray-500 py-10">No se encontró información del perfil del proveedor.</p>
        )}

      </main>
      <PieP />

      {/* Modal de Edición */}
      {isModalOpen && providerData && (
        <ModalActualizarProveedor
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialData={providerData}
          onUpdateSuccess={handleUpdateSuccess}
          // Pasa isLoading y error si el modal los necesita como props
          // isLoading={isUpdatingProfile}
          // error={updateProfileError}
        />
      )}
    </div>
  );
}
// --- END OF FILE ---