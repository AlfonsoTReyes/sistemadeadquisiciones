"use client";
import React, { useState, useEffect, useMemo, useCallback  } from 'react'; 
import { useRouter } from 'next/navigation';
import Menu from '../../menu_principal';
import Pie from "../../pie";
import TablaDocumentos from './tablaProveedores';
import { ProveedorData } from './interface';
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

 interface UsuarioProveedorData {
   id_usuario: number;
   usuario: string;
   nombre: string;
   apellido_p: string;
   apellido_m: string;
   correo: string;
   estatus: string;
 }

export default function AdministradorProveedoresPage() {
    const router = useRouter();

    // Estados para la lista de proveedores, carga y errores
    const [proveedores, setProveedores] = useState<ProveedorData[]>([]);
    const [loading, setLoading] = useState(true); // Carga inicial de la lista
    const [error, setError] = useState<string | null>(null); // Errores generales o de fetch
    const [loadingStatusChange, setLoadingStatusChange] = useState<{ [key: number]: boolean }>({}); // Para botones Activar/Desactivar
    // --- NUEVOS ESTADOS PARA FILTROS ---
    const [filtroRfc, setFiltroRfc] = useState('');
    const [filtroCorreo, setFiltroCorreo] = useState('');

  // Estado para el modal de PERFIL de proveedor
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editingProviderData, setEditingProviderData] = useState<ProveedorData | null>(null);
  const [isFetchingEditData, setIsFetchingEditData] = useState(false); // Carga de datos para *cualquier* modal
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false); // Guardado del modal de perfil
  const [updateProfileError, setUpdateProfileError] = useState<string | null>(null); // Error del modal de perfil

  // Estado para el modal de USUARIO proveedor
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUserData, setEditingUserData] = useState<UsuarioProveedorData | null>(null); // Estado para los datos del *usuario* a editar
  const [isUpdatingUser, setIsUpdatingUser] = useState(false); // Estado de carga para la actualización del *usuario*
  const [updateUserError, setUpdateUserError] = useState<string | null>(null); // Estado de error para la actualización del *usuario*
  // Estado para carga de cambio de estatus individual
  const [isLoadingStatusChange, setIsLoadingStatusChange] = useState<{ [key: number]: boolean }>({});

      // --- Carga Inicial de Proveedores ---
  const cargarProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllProveedores();
      setProveedores(data);
    } catch (err: any) {
      setError(err.message);
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

     // --- Editar PERFIL Proveedor ---
  const handleEditProfileClick = async (idProveedor: number) => {
    console.log("Abriendo modal de perfil para proveedor ID:", idProveedor);
    setIsFetchingEditData(true); // Inicia carga de datos
    setUpdateProfileError(null); // Limpia error previo
    setEditingProviderData(null); // Limpia datos previos
    try {
      // Llama a la función del servicio para obtener perfil
      const data = await getProveedorProfileById(idProveedor); // Asegúrate que esta sea la función importada correcta
      console.log("DATOS RECIBIDOS DEL FETCH:", data); // <--- ¡AÑADE ESTE CONSOLE.LOG!
      setEditingProviderData(data); // Guarda los datos obtenidos
      setIsEditProfileModalOpen(true); // Abre el modal
    } catch (err: any) {
      setUpdateProfileError(err.message); // Muestra error si falla la carga
    } finally {
      setIsFetchingEditData(false); // Termina carga de datos
    }
  };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
    setEditingProviderData(null);
    setUpdateProfileError(null);
  };

  const handleSaveProfileUpdate = async (payloadFromModal: any) => {
    setIsUpdatingProfile(true); // Inicia estado de guardado
    setUpdateProfileError(null);
    try {
      await updateProveedorProfile(payloadFromModal); // Llama a la función de servicio para guardar
      handleCloseEditProfileModal(); // Cierra el modal
      await cargarProveedores(); // Recarga la lista principal para ver cambios
      alert("Perfil del proveedor actualizado exitosamente."); // Feedback
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setUpdateProfileError(err.message); // Muestra error en el modal
    } finally {
      setIsUpdatingProfile(false); // Termina estado de guardado
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
            <div className="min-h-screen p-4 md:p-8 bg-gray-100">
                <h1 className="text-3xl text-center font-bold mb-6 text-gray-800">
                    Administración de Proveedores
                </h1>

                {/* --- SECCIÓN DE FILTROS --- */}
                <div className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="filtroRfc" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por RFC:
                        </label>
                        <input
                            type="text"
                            id="filtroRfc"
                            name="filtroRfc"
                            value={filtroRfc}
                            onChange={(e) => setFiltroRfc(e.target.value)}
                            placeholder="Escriba RFC a buscar..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="filtroCorreo" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Correo:
                        </label>
                        <input
                            type="email"
                            id="filtroCorreo"
                            name="filtroCorreo"
                            value={filtroCorreo}
                            onChange={(e) => setFiltroCorreo(e.target.value)}
                            placeholder="Escriba correo a buscar..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
                {/* --- FIN SECCIÓN DE FILTROS --- */}


                {/* Mensaje de Error General */}
                {error && (
                    <p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-400 mb-4">
                        Error: {error}
                    </p>
                )}

                {/* Indicador de Carga Inicial */}
                {loading && !error && (
                    <p className="text-center text-blue-500 py-5">Cargando lista de proveedores...</p>
                )}

                {/* Tabla de Proveedores (AHORA USA DATOS FILTRADOS) */}
                {!loading && !error && (
                    <TablaDocumentos
                    proveedores={proveedoresFiltrados} // <-- Pasa la lista filtrada
                    onViewDocuments={handleViewDocuments}     // <-- Prop para documentos
                    onChangeStatus={handleChangeStatus}       // <-- Prop para estatus
                    onEditProfile={handleEditProfileClick} // <--- ¡ASEGÚRATE QUE ESTA LÍNEA ESTÉ EXACTAMENTE ASÍ!
                    onEditUser={handleEditUserClick}         // <-- Prop para usuario
                    isLoadingStatusChange={isLoadingStatusChange}
                    />
                )}

                 {/* Mensaje si NO hay resultados DESPUÉS de filtrar (y no hay error/carga) */}
                {!loading && !error && proveedoresFiltrados.length === 0 && (filtroRfc || filtroCorreo) && (
                      <p className="text-center text-gray-500 mt-6">No se encontraron proveedores que coincidan con los filtros aplicados.</p>
                )}

                 {/* Mensaje si NO hay proveedores en TOTAL (y no hay error/carga) */}
                {!loading && !error && proveedores.length === 0 && !(filtroRfc || filtroCorreo) && (
                      <p className="text-center text-gray-500 mt-6">No se encontraron proveedores registrados.</p>
                )}
      {/* Renderizar Modal Editar PERFIL Proveedor */}
      {isEditProfileModalOpen && editingProviderData && (
          <ModalActualizarProveedor
              datos={editingProviderData} // Pasa los datos cargados
              onClose={handleCloseEditProfileModal}
              onSubmit={handleSaveProfileUpdate} // Pasa el handler de guardado
              isLoading={isUpdatingProfile} // Pasa el estado de carga de guardado
              error={updateProfileError}
          />
      )}

      {/* Renderizar Modal Editar USUARIO Proveedor */}
         {isEditUserModalOpen && editingUserData && (
          <ModalActualizarUsuarioProveedor
              userData={editingUserData} // Pasa los datos del usuario con id_usuario
              onClose={handleCloseEditUserModal}
              onSubmit={handleSaveUserUpdate} // Llama a la función que usa fetch
              isLoading={isUpdatingUser || isFetchingEditData} // Puede estar cargando datos o guardando
              error={updateUserError} // Muestra el error específico del modal de usuario
          />
      )}
            </div>
            <Pie />
        </div>
    );
};