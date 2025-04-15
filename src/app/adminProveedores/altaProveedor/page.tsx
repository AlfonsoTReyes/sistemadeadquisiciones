"use client";
import React, { useState, useEffect, useMemo, useCallback  } from 'react'; 
import { useRouter } from 'next/navigation';
import Menu from '../../menu_principal';
import Pie from "../../pie";
import TablaDocumentos from './tablaProveedores';
import { ProveedorData, UsuarioProveedorData  } from './interface';
import ModalActualizarProveedor from './formularios/modalActualizarProveedor';
import ModalActualizarUsuarioProveedor from './formularios/modalActualizarUsuario';
import {
    fetchAllProveedores,
    updateProveedorStatus,
    getProveedorProfileById,
    updateProveedorProfile,
    updateUsuarioProveedor,
    getUsuarioProveedorByProveedorId
} from './formularios/fetchAltaProveedor';

export default function AdministradorProveedoresPage() {
    const router = useRouter();

    // Estados para la lista de proveedores, carga y errores
    const [proveedores, setProveedores] = useState<ProveedorData[]>([]); // Lista para la tabla
    const [loading, setLoading] = useState(true);          // Carga inicial
    const [error, setError] = useState<string | null>(null); // Errores generales/fetch lista
    const [loadingStatusChange, setLoadingStatusChange] = useState<{ [key: number]: boolean }>({}); // Carga cambio estatus
    const [filtroRfc, setFiltroRfc] = useState('');       // Filtro RFC
    const [filtroCorreo, setFiltroCorreo] = useState('');    // Filtro Correo

    // Estados para Modales y sus datos
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false); // Modal Perfil Proveedor
    const [editingProviderData, setEditingProviderData] = useState<ProveedorData | null>(null); // Datos para editar perfil
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false); // Modal Usuario Proveedor
    const [editingUserData, setEditingUserData] = useState<UsuarioProveedorData | null>(null); // Datos para editar usuario

    // Estados de Carga/Error específicos de los Modales
    const [isFetchingEditData, setIsFetchingEditData] = useState(false); // Carga de datos *para* el modal
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false); // Guardado modal perfil
    const [updateProfileError, setUpdateProfileError] = useState<string | null>(null); // Error modal perfil
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);       // Guardado modal usuario
    const [updateUserError, setUpdateUserError] = useState<string | null>(null); // Error modal usuario

    // --- Carga Inicial de la Lista de Proveedores ---
    const cargarProveedores = useCallback(async () => {
        console.log("AdminPage: Iniciando carga de lista de proveedores...");
        setLoading(true);
        setError(null);
        try {
            // fetchAllProveedores devuelve la lista resumida
            const data = await fetchAllProveedores();
            console.log(`AdminPage: Lista de proveedores cargada (${data?.length || 0} registros).`);
            // Asegúrate que la data coincida con la parte básica de ProveedorData
            setProveedores(data || []);
        } catch (err: any) {
            console.error("AdminPage: Error cargando lista de proveedores:", err);
            setError(err.message || "Error desconocido al cargar proveedores.");
        } finally {
            setLoading(false);
        }
    }, []);

  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);
    // --- 2. HANDLER PARA VER DOCUMENTOS ---
    
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
        console.log("AdminPage: Abriendo modal de perfil para proveedor ID:", idProveedor);
        setIsFetchingEditData(true);
        setUpdateProfileError(null); // Limpiar errores previos del modal de perfil
        setEditingProviderData(null); // Limpiar datos anteriores
        setIsEditProfileModalOpen(false); // Asegurar que esté cerrado mientras carga

        try {
            // LLAMA A getProveedorProfileById QUE YA DEVUELVE LOS NUEVOS CAMPOS
            const data = await getProveedorProfileById(idProveedor);
            if (!data) {
                // Lanzar error si no se encontró el proveedor para editar
                throw new Error(`No se encontró el perfil del proveedor con ID ${idProveedor}.`);
            }
            console.log("AdminPage: Datos COMPLETOS recibidos para editar perfil:", data); // Verifica que actividad_sat y proveedor_eventos estén aquí
            // Guarda los datos COMPLETOS en el estado
            setEditingProviderData(data as ProveedorData); // Asegurar el tipo
            setIsEditProfileModalOpen(true); // Abrir el modal DESPUÉS de cargar los datos

        } catch (err: any) {
            console.error("AdminPage: Error cargando datos para editar perfil:", err);
            // Mostrar error general, o uno específico si el modal no se abre
            setError(err.message || 'Error al cargar los datos del proveedor para editar.');
            // No abrir el modal si falló la carga
        } finally {
            setIsFetchingEditData(false); // Terminar la carga (para modal)
        }
    };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
    setEditingProviderData(null); // Limpiar datos al cerrar
    setUpdateProfileError(null); // Limpiar error del modal al cerrar
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
                    <TablaDocumentos // Renombrar este componente si es confuso (e.g., TablaProveedoresAdmin)
                    proveedores={proveedoresFiltrados}
                    onViewDocuments={handleViewDocuments}
                    onChangeStatus={handleChangeStatus}
                    onEditProfile={handleEditProfileClick} // Pasa la función correcta
                    onEditUser={handleEditUserClick}
                    isLoadingStatusChange={loadingStatusChange} // Pasar el estado de carga individual
                    isFetchingEditData={isFetchingEditData} // Pasar estado de carga general para modales
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