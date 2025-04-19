// --- START OF FILE src/app/proveedores/dashboard/page.tsx ---
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PieP from "../../pie"; // Ajusta ruta
import DynamicMenu from "../../menu_principal"; // Ajusta ruta
import PusherClient from 'pusher-js'; // Importar cliente Pusher
import ProveedorInfo from './formularios/ProveedorInfo'; // Ajusta ruta
import ModalActualizarProveedor from './formularios/modalActualizarProveedor'; // Ajusta ruta
// Asumiendo que fetchdashboard tiene getProveedorForUser
import { getProveedorForUser } from './formularios/fetchdashboard'; // Ajusta ruta
// Importar interfaz completa si no está definida en ProveedorInfo
import { ProveedorData as ProveedorCompletoData } from './formularios/ProveedorInfo'; // Ajusta ruta e interfaz

export default function PageProveedorDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [providerData, setProviderData] = useState<ProveedorCompletoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Para el modal de edición

  // --- Función para Cargar/Refrescar Datos del Proveedor ---
  const fetchProviderData = useCallback(async (idUsuario: number) => {
    if (!idUsuario) return;
    console.log(`Dashboard: Fetching/Refreshing data for user ID: ${idUsuario}`);
    setError(null);
    try {
      const data = await getProveedorForUser(idUsuario); // Llama al fetch
      if (data && data.id_proveedor && data.tipo_proveedor) {
        setProviderData(data as ProveedorCompletoData); // Guarda los datos completos
        console.log("Dashboard: Provider data loaded/refreshed:", data);
        // Actualizar sessionStorage si es necesario
        sessionStorage.setItem('proveedorId', data.id_proveedor.toString());
        sessionStorage.setItem('proveedorTipo', data.tipo_proveedor);
      } else {
        // Manejar caso donde el perfil no se encuentra o es incompleto tras un refresh
        console.warn("Dashboard: Profile not found or incomplete after fetch for user ID:", idUsuario);
        setProviderData(null);
        sessionStorage.removeItem('proveedorId');
        sessionStorage.removeItem('proveedorTipo');
        setError('No se encontró un perfil de proveedor completo.');
      }
    } catch (err: any) {
      console.error("Dashboard: Error fetching provider data:", err);
       setProviderData(null); // Limpiar en caso de error
       sessionStorage.removeItem('proveedorId');
       sessionStorage.removeItem('proveedorTipo');
       setError(err.message || 'Error al cargar los datos.');
    } finally {
      // setLoading(false); // Quitar loading si se activó al inicio
    }
  }, []); // Vacío porque userId se pasa como argumento

  // --- Efecto para Carga Inicial ---
  useEffect(() => {
    setLoading(true); // Iniciar carga de página
    const storedUserId = sessionStorage.getItem('proveedorUserId');
    if (storedUserId) {
      const userIdNum = parseInt(storedUserId, 10);
      if (!isNaN(userIdNum)) {
        setUserId(userIdNum);
        fetchProviderData(userIdNum).finally(() => setLoading(false)); // Carga inicial y quita loading de página
      } else { setError("ID usuario inválido."); setLoading(false); }
    } else {
      setError("Usuario no autenticado."); setLoading(false);
      router.push('/proveedores/login'); // Redirigir
    }
  }, [router, fetchProviderData]); // Depender de fetchProviderData
 // --- **NUEVO: useEffect para Suscripción Pusher del Proveedor** ---
 useEffect(() => {
  // Solo suscribirse si tenemos los datos del proveedor (especialmente el ID)
  // y las claves de Pusher están disponibles.
  if (providerData?.id_proveedor && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
      const providerId = providerData.id_proveedor;
      const channelName = `admin-notifications`; // Canal específico del proveedor

      console.log(`Dashboard Proveedor: Initializing Pusher Client for channel ${channelName}...`);
      const pusherClient = new PusherClient(pusherKey, { cluster: pusherCluster });

      // Suscribirse al canal específico
      const channel = pusherClient.subscribe(channelName);
      console.log(`Dashboard Proveedor: Subscribed to Pusher channel ${channelName}`);

      // Escuchar el evento de actualización de estado de revisión
      channel.bind('nueva-solicitud-revision', (data: any) => {
          console.log("PUSHER RECEIVED (Proveedor): estatus_revision_actualizado", data);

          // Validar que el evento sea para este proveedor (extra seguridad)
          if (data?.idProveedor === providerId) {
               // 1. Mostrar Notificación al Proveedor
               alert(`Actualización de Revisión:\n${data.mensaje}`);
               // O usar un toast: toast.info(data.mensaje);

               // 2. Actualizar el Estado Local Inmediatamente
               setProviderData(prevData => {
                   if (prevData && prevData.id_proveedor === data.idProveedor) {
                       console.log(`Updating local status from ${prevData.estatus_revision} to ${data.nuevoEstatus}`);
                       return { ...prevData, estatus_revision: data.nuevoEstatus };
                   }
                   return prevData; // No cambiar si no coincide (no debería pasar)
               });

               // 3. Opcional: Si el estado cambió a RECHAZADO o APROBADO, podrías
               //    querer hacer alguna acción adicional en la UI.
               if (data.nuevoEstatus === 'APROBADO') {
                   // Quizás mostrar confeti? :)
               } else if (data.nuevoEstatus === 'RECHAZADO') {
                  // Quizás resaltar la sección de documentos?
               }
          } else {
              console.warn("Pusher event received, but provider ID doesn't match.", data);
          }
      });

      // Limpieza al desmontar o cuando cambie el idProveedor
      return () => {
          console.log(`Dashboard Proveedor: Unsubscribing from Pusher channel ${channelName}`);
          pusherClient.unsubscribe(channelName);
           // pusherClient.disconnect(); // Desconectar solo si no se usa en ningún otro lado
      };
  } else {
      if (!providerData?.id_proveedor) console.log("Dashboard Proveedor: Pusher not initialized - missing provider ID.");
      // else console.log("Dashboard Proveedor: Pusher not initialized - missing env keys.");
  }
// Depender de providerData.id_proveedor para re-suscribirse si cambia el proveedor mostrado
// (aunque en un dashboard de proveedor, esto normalmente no cambia)
}, [providerData?.id_proveedor]);
// --- FIN useEffect Pusher Proveedor ---
 // --- Handlers Modal Edición ---
 const handleOpenEditModal = () => {
    if (providerData) { setIsModalOpen(true); }
    else { alert("No hay datos para editar."); }
 };
 const handleCloseModal = () => setIsModalOpen(false);

 // Callback para CUANDO EL MODAL GUARDA CON ÉXITO (llamado por onSubmit del modal)
 const handleUpdateSuccess = () => {
    console.log("Dashboard: Modal reported update success! Refetching data...");
    handleCloseModal(); // Cierra el modal
    if (userId) {
        fetchProviderData(userId); // <--- Recarga los datos llamando a fetchProviderData
    }
 };

 // --- Handler para Documentos (sin cambios) ---
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

         {/* Loading / Error */}
         {loading && <p className="text-center py-10">Cargando información del proveedor...</p>}
         {error && !loading && (
             <div className="text-center py-10 text-red-600 bg-red-50 border border-red-300 p-4 rounded-md max-w-md mx-auto">{error}</div>
         )}

         {/* Componente ProveedorInfo (si no hay loading ni error y hay datos) */}
         {!loading && !error && providerData && (
            <ProveedorInfo
                providerData={providerData}
                loading={false}
                error={null}
                onManageDocumentsClick={handleManageDocumentsClick}
                // Pasar la función de refresh para que ProveedorInfo la use
                onDataRefreshNeeded={() => { if (userId) fetchProviderData(userId); }}
            />
         )}

          {/* Mensaje si no hay datos y no está cargando/error */}
          {!loading && !error && !providerData && (
               <p className="text-center text-gray-500 py-10">No se encontró información del proveedor.</p>
          )}

      </div>
      <PieP />

      {/* Modal de Edición */}
      {isModalOpen && providerData && (
         <ModalActualizarProveedor
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            // Pasar prop como la espera el modal (ej. 'initialData')
            initialData={providerData} // Asegúrate que el nombre coincida con el modal
            // Pasar el handler correcto que recarga datos
            onSubmit={handleUpdateSuccess} // Este handler llama a fetchProviderData
            isLoading={isUpdatingProfile} // DEBES tener un estado isUpdatingProfile si el modal no lo maneja
            error={updateProfileError}    // DEBES tener un estado updateProfileError si el modal no lo maneja
         />
         // NOTA: Necesitarás añadir los estados isUpdatingProfile y updateProfileError
         // y modificar handleUpdateSuccess para que los gestione si tu modal
         // depende de estas props (como en el ejemplo del modal de admin).
         // Si tu modal de proveedor maneja su propia carga/error de submit, no necesitas pasarlos.
      )}
    </div>
  );
}
// --- END OF FILE ---