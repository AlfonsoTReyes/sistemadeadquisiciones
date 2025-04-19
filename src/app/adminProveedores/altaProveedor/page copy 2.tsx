"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'; 
import { useRouter } from 'next/navigation';
import Menu from '../../menu_principal';
import Pie from "../../pie";
import TablaDocumentos from './tablaProveedores';
import PusherClient from 'pusher-js'; // Importar cliente Pusher
import { ProveedorData, UsuarioProveedorData  } from './interface';
import ModalActualizarProveedor from './formularios/modalActualizarProveedor';
import ModalActualizarUsuarioProveedor from './formularios/modalActualizarUsuario';
import {
    fetchAllProveedores,
    updateProveedorStatus,
    getProveedorProfileById,
    updateProveedorProfile,
    updateUsuarioProveedor,
    getUsuarioProveedorByProveedorId,
    updateAdminRevisionStatus
} from './formularios/fetchAltaProveedor';

export default function AdministradorProveedoresPage() {
    const router = useRouter();

    // Estados para la lista de proveedores, carga y errores
    const [proveedores, setProveedores] = useState<ProveedorAdminListData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingStatusChange, setLoadingStatusChange] = useState<{ [key: number]: boolean }>({});
    const [isLoadingRevisionChange, setIsLoadingRevisionChange] = useState<{ [key: number]: boolean }>({});
    const [filtroRfc, setFiltroRfc] = useState('');
    const [filtroCorreo, setFiltroCorreo] = useState('');
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [editingProviderData, setEditingProviderData] = useState<ProveedorCompletoData | null>(null);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editingUserData, setEditingUserData] = useState<UsuarioProveedorData | null>(null);
    const [isFetchingEditData, setIsFetchingEditData] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [updateProfileError, setUpdateProfileError] = useState<string | null>(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    const [updateUserError, setUpdateUserError] = useState<string | null>(null);
    const [pendientesCount, setPendientesCount] = useState(0);
    const pusherClientRef = useRef<PusherClient | null>(null);
    const channelRef = useRef<any>(null);

    // --- Carga Inicial de la Lista de Proveedores ---
    const cargarProveedores = useCallback(async () => {
        console.log("AdminPage: Cargando lista proveedores...");
        setLoading(true); setError(null);
        try {
            const data = await fetchAllProveedores(); // Obtiene lista resumida
            setProveedores(data || []);
        } catch (err: any) { setError(err.message || "Error cargando proveedores."); }
        finally { setLoading(false); }
    }, []);
    // --- NUEVO: useEffect para Pusher ---
    useEffect(() => {
        // Solo inicializar si las variables de entorno existen
        if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            console.error("Pusher client keys not found in environment variables.");
            return;
        }
        console.log("AdminPage: Initializing Pusher Client...");
        // Usar claves públicas desde .env.local
        const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            // Otras opciones si son necesarias (authEndpoint si usas canales privados/presencia)
        });
                // Suscribirse al canal de notificaciones del admin
        // Usar el mismo nombre de canal que en el backend ('admin-notifications')
        const channel = pusherClient.subscribe('admin-notifications');
        console.log("AdminPage: Subscribed to Pusher channel 'admin-notifications'");
                // Escuchar el evento específico que envía el backend
        // Usar el mismo nombre de evento ('nueva-solicitud-revision')
        channel.bind('nueva-solicitud-revision', (data: any) => {
            console.log("PUSHER RECEIVED EVENT: nueva-solicitud-revision", data);

            // --- Lógica para manejar la notificación ---
            // 1. Mostrar un Toast/Notificación
            //    Usa una librería como react-toastify, sonner, etc.
            //    toast.info(`Nueva solicitud de revisión de ${data.nombreProveedor || data.rfc}`);
            alert(`¡Nueva solicitud de revisión!\nProveedor: ${data.nombreProveedor || data.rfc}\nMensaje: ${data.mensaje}`); // Alert simple como ejemplo

            // 2. Opcional: Refrescar la lista de proveedores para ver el nuevo estado
            //    Podrías añadir un indicador visual de "nuevo" o simplemente recargar.
            //    Llama a la función que recarga la lista:
            fetchProvidersList();

            // 3. Opcional: Actualizar un contador de notificaciones en el menú, etc.
        });
                // Limpieza al desmontar el componente
                return () => {
                    console.log("AdminPage: Unsubscribing from Pusher channel 'admin-notifications'");
                    pusherClient.unsubscribe('admin-notifications');
                    // Opcional: Desconectar si ya no se necesita en otras partes
                    // pusherClient.disconnect();
                };
            }, []);
  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);
    // --- 2. HANDLER PARA VER DOCUMENTOS ---
    const fetchProvidersList = useCallback(async () => {
        // ... (lógica como antes)
        console.log("AdminPage: Fetching/Refreshing providers list...");
        setError(null);
        try {
            const data = await fetchAllProveedores();
            const validData = data || [];
            setProveedores(validData);
            const count = validData.filter(p => p.estatus_revision === 'PENDIENTE_REVISION').length;
            setPendientesCount(count);
        } catch (err: any) { /* ... */ }
    }, []);
     const handleViewDocuments = (idProveedor: number) => {
        if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
             console.error("handleViewDocuments - ID inválido:", idProveedor);
             alert("Error: No se pudo seleccionar el proveedor (ID inválido).");
             return;
        }
        console.log("Admin Page - Preparing to view documents for Provider ID:", idProveedor);

        // Guarda el ID del PROVEEDOR seleccionado en sessionStorage
        // Usamos una clave específica para esta acción desde admin
        sessionStorage.setItem('adminSelectedProveedorId', idProveedor.toString());

        // Navega a la página (estática) de documentos
        router.push('/adminProveedores/documentos'); // Ajusta si la ruta es diferente
    };

    // --- 3. HANDLER PARA CAMBIAR ESTATUS ---
    const handleChangeStatus = async (idProveedor: number, currentStatus: boolean) => {
        if (typeof idProveedor !== 'number' || isNaN(idProveedor)) {
             console.error("handleChangeStatus - ID inválido:", idProveedor);
             alert("Error: No se pudo seleccionar el proveedor (ID inválido).");
             return;
        }

        const newStatus = !currentStatus;
        const proveedorSeleccionado = proveedores.find(p => p.id_proveedor === idProveedor);
        const confirmationText = newStatus
            ? `¿Estás seguro de que deseas ACTIVAR al proveedor con RFC ${proveedorSeleccionado?.rfc ?? idProveedor}?`
            : `¿Estás seguro de que deseas DESACTIVAR al proveedor con RFC ${proveedorSeleccionado?.rfc ?? idProveedor}?`;

        if (window.confirm(confirmationText)) {
            setLoadingStatusChange(prev => ({ ...prev, [idProveedor]: true })); // Inicia carga para esta fila
            setError(null); // Limpia errores previos específicos de esta acción

            // console.log(`Admin Page - Attempting status change for ID ${idProveedor} to ${newStatus}`); // Debug

            try {
                await updateProveedorStatus(idProveedor, newStatus);
                // console.log(`Admin Page - Status updated for ID ${idProveedor}. Refreshing list...`); // Debug

                // Vuelve a cargar la lista completa para reflejar el cambio
                // (Llamamos a la misma función del useEffect inicial)
                await fetchAllProveedores().then(data => {
                    setProveedores(data || []);
                }).catch(err => {
                     // Maneja error específico del refresh si ocurre
                     console.error("Error refreshing provider list after status change:", err);
                     setError((err as Error).message || 'Error al refrescar la lista después de actualizar.');
                });


            } catch (err) {
                 const updateError = `Error al cambiar el estado del proveedor ${idProveedor}: ${(err as Error).message}`;
                 console.error(updateError);
                 setError(updateError); // Muestra error en la UI
                 // Podrías usar un toast aquí
            } finally {
                setLoadingStatusChange(prev => ({ ...prev, [idProveedor]: false })); // Finaliza carga para esta fila
            }
        }
    };
    // --- FILTRAR ---
    const proveedoresFiltrados = useMemo(() => {
      // Si no hay filtros, devuelve la lista completa
      if (!filtroRfc && !filtroCorreo) {
          return proveedores;
      }

      // Normaliza los filtros (minúsculas y sin espacios extra)
      const rfcLower = filtroRfc.toLowerCase().trim();
      const correoLower = filtroCorreo.toLowerCase().trim();

      return proveedores.filter(proveedor => {
          // Comprueba si el RFC coincide (si hay filtro RFC)
          const rfcMatch = rfcLower
              ? proveedor.rfc.toLowerCase().includes(rfcLower)
              : true; // Si no hay filtro RFC, siempre coincide

          // Comprueba si el Correo coincide (si hay filtro Correo)
          // Maneja el caso de correo null/undefined
          const correoMatch = correoLower
              ? (proveedor.correo || '').toLowerCase().includes(correoLower)
              : true; // Si no hay filtro Correo, siempre coincide

          // El proveedor debe coincidir con AMBOS filtros activos
          return rfcMatch && correoMatch;
      });
  }, [proveedores, filtroRfc, filtroCorreo]); // Dependencias del memo

    // --- Handlers para Modal Editar PERFIL Proveedor ---
    const handleEditProfileClick = async (idProveedor: number) => {
        console.log("AdminPage: Abriendo modal perfil ID:", idProveedor);
        setIsFetchingEditData(true);
        setUpdateProfileError(null);
        setEditingProviderData(null);
        setIsEditProfileModalOpen(false);
        try {
            // Llama a fetch para obtener datos COMPLETOS (incluye array representantes)
            const data = await getProveedorProfileById(idProveedor);
            if (!data) throw new Error(`Perfil no encontrado (ID: ${idProveedor}).`);

            // **Añadir log detallado aquí para verificar 'representantes'**
            console.log("AdminPage: Datos COMPLETOS recibidos para modal perfil:", JSON.stringify(data, null, 2));

            setEditingProviderData(data as ProveedorCompletoData); // Guardar datos completos
            setIsEditProfileModalOpen(true); // Abrir modal

        } catch (err: any) {
            console.error("AdminPage: Error cargando datos para editar perfil:", err);
            setError(err.message || 'Error al cargar datos para editar.'); // Error general en la página
        } finally {
            setIsFetchingEditData(false);
        }
    };

    const handleCloseEditProfileModal = () => {
        setIsEditProfileModalOpen(false);
        setEditingProviderData(null);
        setUpdateProfileError(null);
    };

    // Handler para guardar cambios del PERFIL (SIN CAMBIOS FUNCIONALES NECESARIOS)
    // Recibe el payload del modal (que ya debe incluir los nuevos campos si se editaron)
    // y lo pasa a la función fetch 'updateProveedorProfile' que ya está preparada.
    const handleSaveProfileUpdate = async (payloadFromModal: any) => {
        // Validar payload básico recibido del modal
         if (!payloadFromModal?.id_proveedor || !payloadFromModal.tipoProveedor) {
             console.error("AdminPage handleSaveProfileUpdate: Payload inválido desde el modal", payloadFromModal);
             setUpdateProfileError("Error interno: Datos incompletos recibidos desde el formulario.");
             return; // No continuar
         }
        setIsUpdatingProfile(true); // Inicia estado de guardado (para modal perfil)
        setUpdateProfileError(null); // Limpia error previo del modal
        try {
            console.log("AdminPage: Enviando datos actualizados del perfil a fetch:", payloadFromModal);
            await updateProveedorProfile(payloadFromModal); // Llama al fetch que ya maneja los nuevos campos
            console.log("AdminPage: Perfil actualizado exitosamente.");
            handleCloseEditProfileModal(); // Cierra el modal
            await cargarProveedores(); // Recarga la lista principal
            alert("Perfil del proveedor actualizado exitosamente.");

        } catch (err: any) {
            console.error("AdminPage: Error guardando perfil:", err);
            // Mostrar el error DENTRO DEL MODAL
            setUpdateProfileError(err.message || 'Error desconocido al guardar el perfil.');
            // NO CERRAR el modal en caso de error
        } finally {
            setIsUpdatingProfile(false); // Termina estado de guardado (para modal perfil)
        }
    };

  // --- Editar USUARIO Proveedor ---
  const handleEditUserClick = async (idProveedor: number) => {
    console.log("PAGE: Buscando usuario asociado al proveedor ID:", idProveedor);
    setIsFetchingEditData(true);
    setUpdateUserError(null);
    setEditingUserData(null);
    try {
        // Llama a la función fetch para obtener los datos del USUARIO asociado por el ID del PROVEEDOR
        const data = await getUsuarioProveedorByProveedorId(idProveedor);
        console.log("PAGE: Datos del USUARIO recibidos para modal:", data); // Verifica qué llega aquí
        if (data && typeof data.id_usuario === 'number') { // Verifica que obtuvo un usuario válido
            // Guarda los datos que contienen 'id_usuario'
            setEditingUserData(data as UsuarioProveedorData); // Forzar tipo si es necesario
            setIsEditUserModalOpen(true); // Abre el modal de usuario
        } else {
            // Manejo si no se encuentra usuario o la respuesta es inesperada
            console.warn("PAGE: No se encontró usuario asociado o respuesta inválida para proveedor ID:", idProveedor, data);
            alert("Este proveedor no tiene un usuario asociado o no se pudieron cargar los datos.");
            // setUpdateUserError("No se encontró un usuario asociado para este proveedor.");
        }
    } catch (err: any) {
        console.error("PAGE: Error al obtener datos del usuario para editar:", err);
        setUpdateUserError(err.message || 'Error al cargar datos del usuario.');
    } finally {
        setIsFetchingEditData(false);
    }
};

const handleCloseEditUserModal = () => {
    setIsEditUserModalOpen(false);
    setEditingUserData(null);
    setUpdateUserError(null);
};
    // Esta función recibe el payload DEL MODAL, que YA debe contener 'id_usuario'
    const handleSaveUserUpdate = async (payloadFromModal: any) => {
      console.log("PAGE: Recibido payload del modal de usuario:", JSON.stringify(payloadFromModal, null, 2));

      // Validación: Asegurarse que el payload del modal tiene el id_usuario
      if (!payloadFromModal?.id_usuario || typeof payloadFromModal.id_usuario !== 'number') {
          const errorMsg = "Error Interno (Page): El payload recibido del modal no contiene un 'id_usuario' numérico válido.";
          console.error(errorMsg, payloadFromModal);
          setUpdateUserError(errorMsg); // Mostrar error en el modal
          return; // Detener si falta el ID
      }

      setIsUpdatingUser(true);
      setUpdateUserError(null); // Limpiar error previo
      try {
          // Llama a la función FETCH (updateUsuarioProveedor de fetchAltaProveedor.js)
          // que se encarga de hacer el PUT a /api/adminProveedores
          // Esta función ya tiene la validación interna y manejo de errores fetch
          const updatedUser = await updateUsuarioProveedor(payloadFromModal);

          console.log("PAGE: Usuario actualizado exitosamente via fetch. Respuesta:", updatedUser);
          handleCloseEditUserModal();
          alert("Usuario del proveedor actualizado exitosamente.");
          // Opcional pero recomendado: Recargar la lista principal si la tabla muestra info del usuario (como nombre/correo)
          await cargarProveedores();

      } catch (err: any) {
          // Captura errores lanzados por la función updateUsuarioProveedor (fetch)
          console.error("PAGE: Error al guardar usuario (capturado desde fetch):", err);
          // El mensaje de error ya debería venir formateado desde la función fetch o la API
          setUpdateUserError(err.message || "Ocurrió un error desconocido al actualizar el usuario.");
      } finally {
          setIsUpdatingUser(false); // Termina el estado de carga
      }
  };

    // --- Handler Cambiar Estatus de Revisión (CORREGIDO) ---
    const handleChangeRevisionStatus = async (idProveedor: number, nuevoEstatus: string) => {
        console.log(`AdminPage: Changing revision status ID ${idProveedor} to ${nuevoEstatus}`);
        setIsLoadingRevisionChange(prev => ({ ...prev, [idProveedor]: true }));
        setError(null);

        const estadoPrevio = proveedores.find(p => p.id_proveedor === idProveedor)?.estatus_revision;

        // Optimistic UI Update (Opcional pero recomendado)
        setProveedores(prevProvs => prevProvs.map(p =>
            p.id_proveedor === idProveedor ? { ...p, estatus_revision: nuevoEstatus } : p
        ));
         // Actualizar contador optimista
         if (estadoPrevio === 'PENDIENTE_REVISION' || nuevoEstatus === 'PENDIENTE_REVISION') {
            setPendientesCount(prev => {
                let currentPendientes = proveedores.filter(p => p.estatus_revision === 'PENDIENTE_REVISION').length;
                // Ajuste basado en el cambio REAL que se acaba de hacer en la UI optimista
                if (estadoPrevio === 'PENDIENTE_REVISION' && nuevoEstatus !== 'PENDIENTE_REVISION') currentPendientes--;
                if (estadoPrevio !== 'PENDIENTE_REVISION' && nuevoEstatus === 'PENDIENTE_REVISION') currentPendientes++;
                 // Re-evaluar sobre el estado ACTUALIZADO si no se usó optimista arriba
                 // const currentPendientes = proveedores.map(p => p.id_proveedor === idProveedor ? { ...p, estatus_revision: nuevoEstatus } : p).filter(p=>p.estatus_revision === 'PENDIENTE_REVISION').length;
                return Math.max(0, currentPendientes);
            });
         }


        try {
            // **LLAMAR A LA FUNCIÓN FETCH, NO AL SERVICIO**
            await updateAdminRevisionStatus(idProveedor, nuevoEstatus); // Usa la función importada de fetchAltaProveedor.js

            console.log(`AdminPage: Llamada fetch updateAdminRevisionStatus exitosa para ID ${idProveedor}`);
            // Si la llamada fetch fue exitosa, la UI optimista ya está correcta.
            // No es estrictamente necesario recargar toda la lista aquí.
            // Podrías mostrar un toast de éxito.

        } catch (err: any) {
            console.error(`AdminPage: Error en fetch updateAdminRevisionStatus ID ${idProveedor}:`, err);
            setError(`Error al actualizar estado: ${err.message}`);
            // **Revertir Optimistic UI**
            setProveedores(prevProvs => prevProvs.map(p =>
                p.id_proveedor === idProveedor ? { ...p, estatus_revision: estadoPrevio ?? 'NO_SOLICITADO' } : p
            ));
             // Recalcular contador si la reversión afectó PENDIENTE
             if (estadoPrevio === 'PENDIENTE_REVISION' || nuevoEstatus === 'PENDIENTE_REVISION') {
                 fetchProvidersList(); // Recargar para asegurar contador correcto tras error
             }
        } finally {
            setIsLoadingRevisionChange(prev => ({ ...prev, [idProveedor]: false }));
        }
    };
    // --- FIN Handler Estatus Revisión ---
    // --- RENDERIZADO DE LA PÁGINA ---
    return (
        <div>
                <Menu />
            <div className="min-h-screen p-4 md:p-8 bg-gray-100 pt-20"> {/* Añadir padding-top */}
                <h1 className="text-3xl text-center font-bold mb-6 text-gray-800">
                    Administración de Proveedores
                </h1>

                {/* Filtros */}
                <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                         <label htmlFor="filtroRfc" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por RFC:</label>
                         <input type="text" id="filtroRfc" value={filtroRfc} onChange={(e) => setFiltroRfc(e.target.value)} placeholder="Buscar RFC..." className="w-full input-style" />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="filtroCorreo" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Correo:</label>
                        <input type="email" id="filtroCorreo" value={filtroCorreo} onChange={(e) => setFiltroCorreo(e.target.value)} placeholder="Buscar correo..." className="w-full input-style" />
                    </div>
                </div>

                {/* Error General */}
                {error && !loading && ( <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-400 mb-4">Error: {error}</p> )}

                {/* Carga Inicial */}
                {loading && ( <p className="text-center text-blue-500 py-5">Cargando lista de proveedores...</p> )}

                {/* Tabla */}
                {!loading && !error && (
                    <TablaDocumentos
                        proveedores={proveedoresFiltrados}
                        onViewDocuments={handleViewDocuments}
                        onChangeStatus={handleChangeStatus} // Estatus general
                        onChangeRevisionStatus={handleChangeRevisionStatus} // Estatus revisión
                        isLoadingRevisionChange={isLoadingRevisionChange} // Carga revisión
                        onEditProfile={handleEditProfileClick}
                        onEditUser={handleEditUserClick}
                        isLoadingStatusChange={loadingStatusChange} // Carga estatus general
                        isFetchingEditData={isFetchingEditData}
                    />
                )}

                 {/* Mensajes "Sin resultados" */}
                {!loading && !error && proveedoresFiltrados.length === 0 && (filtroRfc || filtroCorreo) && (
                      <p className="text-center text-gray-500 mt-6">No se encontraron proveedores con los filtros aplicados.</p>
                )}
                {!loading && !error && proveedores.length === 0 && !(filtroRfc || filtroCorreo) && (
                      <p className="text-center text-gray-500 mt-6">No hay proveedores registrados.</p>
                )}

                {/* --- MODALES --- */}
                {/* Modal Editar PERFIL Proveedor */}
                {/* Se renderiza si está abierto Y hay datos para editar */}
                {isEditProfileModalOpen && editingProviderData && (
                    <ModalActualizarProveedor
                        // Props clave para el modal de perfil
                        isOpen={isEditProfileModalOpen}
                        onClose={handleCloseEditProfileModal}
                        proveedorData={editingProviderData}
                        onSubmit={handleSaveProfileUpdate} // <-- Cambiar nombre de la prop a 'onSubmit'
                        isLoading={isUpdatingProfile} // Pasar el estado de carga correcto
                        error={updateProfileError}    // Pasar el estado de error correcto
                        
                    />
                )}

                {/* Modal Editar USUARIO Proveedor */}
                {isEditUserModalOpen && editingUserData && (
                    <ModalActualizarUsuarioProveedor
                        // Props clave para el modal de usuario
                        isOpen={isEditUserModalOpen} // Controla visibilidad
                        onClose={handleCloseEditUserModal} // Función para cerrar
                        userData={editingUserData} // Datos del USUARIO para prellenar
                        onSubmit={handleSaveUserUpdate} // Función a llamar al GUARDAR con éxito desde el modal
                        // Pasar estados de carga/error específicos del modal de usuario
                        // isLoading={isUpdatingUser}
                        // error={updateUserError}
                    />
                )}

                 {/* Estilos globales rápidos (mover a CSS/Tailwind config si es posible) */}
                 <style jsx global>{`
                    .input-style {
                        display: block;
                        width: 100%;
                        padding: 0.5rem 0.75rem;
                        border: 1px solid #d1d5db; /* gray-300 */
                        border-radius: 0.375rem; /* rounded-md */
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
                        outline: none;
                    }
                    .input-style:focus {
                         border-color: #4f46e5; /* indigo-500 */
                         box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3); /* focus:ring-indigo-500 */
                    }
                 `}</style>

            </div>
            <Pie />
        </div>
    );
};