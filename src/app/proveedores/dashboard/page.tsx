// --- START OF FILE src/app/proveedores/dashboard/page.tsx ---
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PieP from "../../pie";
import DynamicMenu from "../../menu_proveedor";
import PusherClient from 'pusher-js';
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
  // Añade estos estados si tu ModalActualizarProveedor los necesita como props
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateProfileError, setUpdateProfileError] = useState<string | null>(null);


  // --- Función para Cargar/Refrescar Datos del Proveedor (Sin cambios aquí) ---
  const fetchProviderData = useCallback(async (idUsuario: number) => {
    // ... (código existente sin cambios) ...
    if (!idUsuario) return;
    console.log(`Dashboard: Fetching/Refreshing data for user ID: ${idUsuario}`);
    setError(null); // Limpiar error anterior antes de intentar cargar
    try {
      const data = await getProveedorForUser(idUsuario);
      if (data && data.id_proveedor && data.tipo_proveedor) {
        setProviderData(data as ProveedorCompletoData);
        console.log("Dashboard: Provider data loaded/refreshed:", data);
        // Es buena práctica asegurarse de que estos también estén actualizados
        sessionStorage.setItem('proveedorId', data.id_proveedor.toString());
        sessionStorage.setItem('proveedorTipo', data.tipo_proveedor);
      } else {
        console.warn("Dashboard: Profile not found or incomplete after fetch for user ID:", idUsuario);
        setProviderData(null);
        sessionStorage.removeItem('proveedorId');
        sessionStorage.removeItem('proveedorTipo');
        setError('No se encontró un perfil de proveedor completo.'); // Error más específico
      }
    } catch (err: any) {
      console.error("Dashboard: Error fetching provider data:", err);
       setProviderData(null);
       sessionStorage.removeItem('proveedorId');
       sessionStorage.removeItem('proveedorTipo');
       setError(err.message || 'Error al cargar los datos del proveedor.'); // Error más específico
    } finally {
      // setLoading(false); // El finally de la llamada original se encarga del loading
    }
  }, []); // Dependencias vacías están bien aquí

  // --- Efecto para Carga Inicial (CON LOGGING MEJORADO) ---
  useEffect(() => {
    console.log("Dashboard: Montando componente y ejecutando useEffect de carga inicial...");
    setLoading(true); // Iniciar estado de carga visual

    // Intentar leer el ID del usuario desde sessionStorage
    const storedUserId = sessionStorage.getItem('proveedorUserId');
    console.log(`Dashboard: Leyendo 'proveedorUserId' de sessionStorage. Valor obtenido: [${storedUserId}]`); // Log DETALLADO

    if (storedUserId) {
      // Se encontró algo en sessionStorage con esa clave
      const userIdNum = parseInt(storedUserId, 10);

      if (!isNaN(userIdNum)) {
        // El valor encontrado es un número válido
        console.log(`Dashboard: 'proveedorUserId' encontrado y es un número válido: ${userIdNum}. Procediendo a buscar datos.`);
        setUserId(userIdNum); // Guardar el ID en el estado
        // Llamar a fetchProviderData para obtener los detalles del proveedor
        fetchProviderData(userIdNum).finally(() => {
          console.log("Dashboard: fetchProviderData finalizó (éxito o error).");
          setLoading(false); // Finalizar estado de carga visual DESPUÉS de intentar el fetch
        });
      } else {
        // Se encontró algo, pero no se pudo convertir a número (inesperado)
        console.error(`Dashboard: 'proveedorUserId' encontrado ('${storedUserId}') pero NO es un número válido tras parseInt.`);
        setError("ID de usuario en sesión inválido."); // Mensaje de error específico
        setLoading(false); // Finalizar carga
        // Considerar redirigir también en este caso, ya que la sesión está corrupta
        console.log(`Dashboard: Redirigiendo a login debido a ID inválido.`);
        router.push(LOGIN_URL);
      }
    } else {
      // NO se encontró la clave 'proveedorUserId' en sessionStorage (Este es tu caso)
      console.warn("Dashboard: 'proveedorUserId' NO encontrado en sessionStorage. Asumiendo usuario no autenticado.");
      setError("Usuario no autenticado."); // Establecer mensaje de error
      setLoading(false); // Finalizar carga
      console.log(`Dashboard: Redirigiendo a login (${LOGIN_URL})...`);
      // Redirigir al usuario a la página de login
      router.push(LOGIN_URL);
    }
    // La limpieza de Pusher NO va aquí, va en su propio useEffect o al desmontar.
  }, [router, fetchProviderData]); // Dependencias correctas: router para push, fetchProviderData para llamarla


  // --- useEffect para Suscripción Pusher (Sin cambios aquí) ---
  useEffect(() => {
    // ... (código existente de Pusher sin cambios) ...
      if (providerData?.id_proveedor && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
      const providerId = providerData.id_proveedor;
      const channelName = `proveedor-updates-${providerId}`;
      const eventName = 'cambio_estado_proveedor';

      console.log(`Dashboard Proveedor: Initializing Pusher for channel ${channelName}...`);
      const pusherClient = new PusherClient(pusherKey, { cluster: pusherCluster });
      const channel = pusherClient.subscribe(channelName);

      channel.bind('pusher:subscription_succeeded', () => { console.log(`Subscribed to ${channelName}`); });
      channel.bind('pusher:subscription_error', (status: any) => { console.error(`Pusher subscription error for ${channelName}:`, status); });

      const handleStatusUpdate = (data: any) => {
          console.log(`PUSHER RECEIVED (Proveedor): ${eventName}`, data);
          if (data?.idProveedor === providerId) {
               const displayMessage = data.mensaje || `El estado de revisión de su cuenta cambió a: ${data.nuevoEstatus}.`;
               alert(`Notificación:\n${displayMessage}`);

               setProviderData(prevData => {
                   if (prevData && prevData.id_proveedor === data.idProveedor) {
                       return { ...prevData, estatus_revision: data.nuevoEstatus };
                   }
                   return prevData;
               });
          } else { console.warn("Pusher event ID mismatch."); }
      };

      channel.bind(eventName, handleStatusUpdate);

      // Limpieza al desmontar o cuando providerId cambie
      return () => {
          console.log(`Dashboard Proveedor: Unsubscribing from ${channelName}`);
          // Es importante desvincular ANTES de desuscribir para evitar leaks
          channel.unbind(eventName, handleStatusUpdate);
          pusherClient.unsubscribe(channelName);
          // Opcional: Desconectar pusher si ya no se usa en ningún otro lado
          // pusherClient.disconnect();
      };
  } else {
      if (!providerData?.id_proveedor) {
          // console.log("Dashboard Pusher: No provider ID yet, skipping Pusher setup.");
      }
      if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
          console.warn("Dashboard Pusher: Pusher environment variables not set.");
      }
  }
  }, [providerData?.id_proveedor]); // Dependencia correcta


  // --- Handlers Modal Edición (Verificar props del Modal) ---
 const handleOpenEditModal = () => {
    if (providerData) {
      setUpdateProfileError(null); // Limpiar errores previos
      setIsModalOpen(true);
    } else {
      alert("No hay datos de proveedor cargados para editar.");
    }
 };
 const handleCloseModal = () => setIsModalOpen(false);

 // Callback para el éxito del modal
 const handleUpdateSuccess = () => {
    console.log("Dashboard: Modal informó éxito. Recargando datos del proveedor...");
    handleCloseModal(); // Cierra el modal
    if (userId) {
        // Opcional: Mostrar un indicador de carga brevemente mientras recarga
        // setLoading(true); // Podrías reactivar el loading general
        fetchProviderData(userId); // Recarga los datos
            // .finally(() => setLoading(false)); // Asegúrate de quitar el loading si lo pusiste
    }
 };

  // --- Handler para Documentos (Sin cambios aquí) ---
 const handleManageDocumentsClick = () => {
    // ... (código existente sin cambios) ...
    if (providerData && providerData.id_proveedor && providerData.tipo_proveedor) {
      sessionStorage.setItem('proveedorId', providerData.id_proveedor.toString());
      sessionStorage.setItem('proveedorTipo', providerData.tipo_proveedor);
      console.log("Dashboard: Navigating to documents page...");
      router.push('/proveedores/documentos');
  } else {
      alert("Datos del proveedor no disponibles para gestionar documentos.");
      console.warn("Dashboard: Cannot navigate to documents, missing provider data.");
  }
};

 // --- Renderizado (Asegurarse que las props del modal sean correctas) ---
 return (
  // Contenedor General Flexbox
  <div className="flex flex-col min-h-screen">
      <DynamicMenu /> {/* <-- MENÚ ARRIBA */}

      {/* Contenedor Principal del Contenido */}
      {/* AJUSTA pt-XX según la altura real de tu menú */}
      <main className="flex-grow p-4 md:p-8 bg-gray-50 pt-20 md:pt-24"> {/* <-- PADDING SUPERIOR y flex-grow */}

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
                  loading={false}
                  error={null}
                  onManageDocumentsClick={handleManageDocumentsClick}
                  onEditProfileClick={handleOpenEditModal} // Asegúrate que ProveedorInfo tenga este botón/handler
                  onDataRefreshNeeded={() => { if (userId) fetchProviderData(userId); }}
              />
          )}

          {/* Mensaje si no hay datos */}
          {!loading && !error && !providerData && (
              <p className="text-center text-gray-500 py-10">No se encontró información del perfil del proveedor.</p>
          )}

          {/* --- El Modal se renderiza fuera del flujo principal --- */}

      </main> {/* <-- FIN Contenedor Principal */}

      <PieP /> {/* <-- PIE ABAJO */}

      {/* Modal de Edición (fuera del <main>, pero dentro del return general) */}
      {/* Se posicionará fixed/absolute sobre toda la pantalla */}
      {isModalOpen && providerData && (
          <ModalActualizarProveedor
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              initialData={providerData}
              onUpdateSuccess={handleUpdateSuccess}
          />
      )}
  </div> // <-- FIN Contenedor General
);
}
// --- END OF FILE ---