// src/app/adminProveedores/altaproveedor/page.tsx
// (CON FILTRO DE NOMBRE/RAZÓN SOCIAL AÑADIDO)

"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Menu from '../../menu';
import Pie from "../../pie";
import TablaDocumentos from './tablaProveedores'; // O TablaAdministradorProveedores según tu export

import { ProveedorAdminListData, ProveedorCompletoData, UsuarioProveedorData } from './interface';

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

    const [proveedores, setProveedores] = useState<ProveedorAdminListData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingStatusChange, setLoadingStatusChange] = useState<{ [key: number]: boolean }>({});
    const [isLoadingRevisionChange, setIsLoadingRevisionChange] = useState<{ [key: number]: boolean }>({});

    // Estados de los filtros
    const [filtroRfc, setFiltroRfc] = useState('');
    const [filtroCorreo, setFiltroCorreo] = useState('');
    // *** NUEVO ESTADO PARA EL FILTRO DE NOMBRE/RAZÓN SOCIAL ***
    const [filtroNombreRazonSocial, setFiltroNombreRazonSocial] = useState('');
    const [filtroEstatusGeneral, setFiltroEstatusGeneral] = useState<string>('todos');
    const [filtroEstatusRevision, setFiltroEstatusRevision] = useState<string>('todos');


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
    const [adminUserId, setAdminUserId] = useState<number | null>(null);

    const cargarProveedores = useCallback(async (showLoadingIndicator = false) => {
         if (showLoadingIndicator) setLoading(true);
         setError(null);
         try {
             const data = await fetchAllProveedores();
             const validData = data || [];
             setProveedores(validData);
             const count = validData.filter(p => p.estatus_revision === 'PENDIENTE_REVISION').length;
             setPendientesCount(count);
         } catch (err: any) { setError(err.message || "Error cargando proveedores."); setProveedores([]); setPendientesCount(0); }
         finally { if (showLoadingIndicator) setLoading(false); }
    }, []);

    useEffect(() => {
        setLoading(true);
        cargarProveedores(true);
        const storedAdminId = sessionStorage.getItem("userId");
        if (storedAdminId) {
            const parsedId = parseInt(storedAdminId, 10);
            if (!isNaN(parsedId)) {
                setAdminUserId(parsedId);
            } else {
                console.error("AdminPage: ID de admin en sessionStorage no es un número válido:", storedAdminId);
                setError("Error interno: No se pudo identificar al administrador.");
            }
        } else {
            console.error("AdminPage: No se encontró 'userId' de admin en sessionStorage.");
            setError("Error interno: Sesión de administrador no encontrada.");
        }
    }, [cargarProveedores]);

    const handleViewDocuments = (idProveedor: number) => {
         sessionStorage.setItem('adminSelectedProveedorId', idProveedor.toString());
         router.push('/adminProveedores/documentos');
    };

    const handleChangeStatus = async (idProveedor: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        const proveedorSeleccionado = proveedores.find(p => p.id_proveedor === idProveedor);
        const confirmationText = newStatus
            ? `¿ACTIVAR proveedor ${proveedorSeleccionado?.rfc ?? idProveedor}?`
            : `¿DESACTIVAR proveedor ${proveedorSeleccionado?.rfc ?? idProveedor}?`;

        if (window.confirm(confirmationText)) {
            setLoadingStatusChange(prev => ({ ...prev, [idProveedor]: true }));
            setError(null);
            try {
                await updateProveedorStatus(idProveedor, newStatus);
                await cargarProveedores();
            } catch (err) {
                setError(`Error al cambiar estado: ${(err as Error).message}`);
            } finally {
                setLoadingStatusChange(prev => ({ ...prev, [idProveedor]: false }));
            }
        }
    };

    // --- MODIFICADO: proveedoresFiltrados para incluir nuevo filtro de Nombre/Razón Social ---
    const proveedoresFiltrados = useMemo(() => {
        const rfcLower = filtroRfc.toLowerCase().trim();
        const correoLower = filtroCorreo.toLowerCase().trim();
        const nombreRazonSocialLower = filtroNombreRazonSocial.toLowerCase().trim(); // Nuevo

        // Si no hay ningún filtro activo, retornar todos los proveedores
        if (!rfcLower && !correoLower && !nombreRazonSocialLower && filtroEstatusGeneral === 'todos' && filtroEstatusRevision === 'todos') {
            return proveedores;
        }

        return proveedores.filter(p => {
            const matchRfc = rfcLower ? p.rfc.toLowerCase().includes(rfcLower) : true;
            const matchCorreo = correoLower ? (p.correo || '').toLowerCase().includes(correoLower) : true;
            // Nuevo match para nombre_display
            const matchNombreRazonSocial = nombreRazonSocialLower ? (p.nombre_display || '').toLowerCase().includes(nombreRazonSocialLower) : true;


            let matchEstatusGeneral = true;
            if (filtroEstatusGeneral === 'activos') {
                matchEstatusGeneral = p.estatus === true;
            } else if (filtroEstatusGeneral === 'inactivos') {
                matchEstatusGeneral = p.estatus === false;
            }

            let matchEstatusRevision = true;
            if (filtroEstatusRevision !== 'todos') {
                const currentRevisionStatus = p.estatus_revision || 'NO_SOLICITADO';
                matchEstatusRevision = currentRevisionStatus === filtroEstatusRevision;
            }

            return matchRfc && matchCorreo && matchNombreRazonSocial && matchEstatusGeneral && matchEstatusRevision;
        });
    }, [proveedores, filtroRfc, filtroCorreo, filtroNombreRazonSocial, filtroEstatusGeneral, filtroEstatusRevision]); // <-- Añadir filtroNombreRazonSocial como dependencia

    const handleEditProfileClick = async (idProveedor: number) => {
        setIsFetchingEditData(true);
        setUpdateProfileError(null);
        setEditingProviderData(null);
        setIsEditProfileModalOpen(false);
        try {
            const data = await getProveedorProfileById(idProveedor);
            if (!data) throw new Error(`Perfil no encontrado (ID: ${idProveedor}).`);
            setEditingProviderData(data as ProveedorCompletoData);
            setIsEditProfileModalOpen(true);
        } catch (err: any) {
            setError(err.message || 'Error al cargar datos para editar.');
        } finally {
            setIsFetchingEditData(false);
        }
    };

    const handleCloseEditProfileModal = () => {
        setIsEditProfileModalOpen(false);
        setEditingProviderData(null);
        setUpdateProfileError(null);
    };

    const handleSaveProfileUpdate = async (payloadFromModal: any) => {
        if (!payloadFromModal?.id_proveedor || !payloadFromModal.tipoProveedor) {
            setUpdateProfileError("Error interno: Datos incompletos recibidos desde el formulario.");
            return;
        }
        setIsUpdatingProfile(true);
        setUpdateProfileError(null);
        try {
            await updateProveedorProfile(payloadFromModal);
            handleCloseEditProfileModal();
            await cargarProveedores();
            alert("Perfil del proveedor actualizado exitosamente.");
        } catch (err: any) {
            setUpdateProfileError(err.message || 'Error desconocido al guardar el perfil.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleEditUserClick = async (idProveedor: number) => {
        setIsFetchingEditData(true);
        setUpdateUserError(null);
        setEditingUserData(null);
        try {
            const data = await getUsuarioProveedorByProveedorId(idProveedor);
            if (data && typeof data.id_usuario === 'number') {
                setEditingUserData(data as UsuarioProveedorData);
                setIsEditUserModalOpen(true);
            } else {
                alert("Este proveedor no tiene un usuario asociado o no se pudieron cargar los datos.");
            }
        } catch (err: any) {
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

    const handleSaveUserUpdate = async (payloadFromModal: any) => {
        if (!payloadFromModal?.id_usuario || typeof payloadFromModal.id_usuario !== 'number') {
            const errorMsg = "Error Interno (Page): El payload recibido del modal no contiene un 'id_usuario' numérico válido.";
            setUpdateUserError(errorMsg);
            return;
        }
        setIsUpdatingUser(true);
        setUpdateUserError(null);
        try {
            await updateUsuarioProveedor(payloadFromModal);
            handleCloseEditUserModal();
            alert("Usuario del proveedor actualizado exitosamente.");
            await cargarProveedores();
        } catch (err: any) {
            setUpdateUserError(err.message || "Ocurrió un error desconocido al actualizar el usuario.");
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const handleChangeRevisionStatus = async (idProveedor: number, nuevoEstatus: string) => {
        if (adminUserId === null) {
            setError("Error interno: No se pudo identificar al administrador para registrar la acción.");
            return;
        }
        setIsLoadingRevisionChange(prev => ({ ...prev, [idProveedor]: true }));
        setError(null);
        const estadoPrevio = proveedores.find(p => p.id_proveedor === idProveedor)?.estatus_revision;
        setProveedores(prevProvs => prevProvs.map(p => p.id_proveedor === idProveedor ? { ...p, estatus_revision: nuevoEstatus } : p));
        if (estadoPrevio === 'PENDIENTE_REVISION' || nuevoEstatus === 'PENDIENTE_REVISION') {
             const currentPendientes = proveedores.filter(p => p.estatus_revision === 'PENDIENTE_REVISION').length;
             let countChange = 0;
             if (estadoPrevio === 'PENDIENTE_REVISION' && nuevoEstatus !== 'PENDIENTE_REVISION') countChange = -1;
             if (estadoPrevio !== 'PENDIENTE_REVISION' && nuevoEstatus === 'PENDIENTE_REVISION') countChange = 1;
             setPendientesCount(prev => Math.max(0, prev + countChange));
        }
        try {
            await updateAdminRevisionStatus(idProveedor, nuevoEstatus, adminUserId);
        } catch (err: any) {
            setError(`Error al actualizar estado: ${err.message}`);
            setProveedores(prevProvs => prevProvs.map(p => p.id_proveedor === idProveedor ? { ...p, estatus_revision: estadoPrevio ?? 'NO_SOLICITADO' } : p));
            await cargarProveedores();
        } finally {
            setIsLoadingRevisionChange(prev => ({ ...prev, [idProveedor]: false }));
        }
    };

    // Para determinar si algún filtro está activo (además de "todos")
    const activeFiltersExist = filtroRfc || filtroCorreo || filtroNombreRazonSocial || filtroEstatusGeneral !== 'todos' || filtroEstatusRevision !== 'todos';


    return (
        <div className="flex flex-col min-h-screen">
            <Menu />
            <main className="flex-grow p-4 md:p-8 pt-20 md:pt-24 bg-gray-100">
                 <h1 className="text-3xl text-center font-bold mb-6 text-gray-800 relative">
                    Administración de Proveedores
                    {pendientesCount > 0 && (<span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-white absolute top-0 -right-2 transform -translate-y-1/2 translate-x-1/2 ring-2 ring-white" title={`${pendientesCount} pendiente(s)`}>{pendientesCount}</span>)}
                </h1>

                 {/* --- ÁREA DE FILTROS MODIFICADA --- */}
                 {/* Ajustado a 5 columnas para el nuevo filtro, o responsive grid */}
                 <div className="mb-6 p-4 bg-white shadow rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <div>
                        <label htmlFor="filtroRfc" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por RFC:</label>
                        <input type="text" id="filtroRfc" value={filtroRfc} onChange={(e) => setFiltroRfc(e.target.value)} placeholder="Buscar RFC..." className="w-full input-style" />
                    </div>
                    {/* NUEVO FILTRO: NOMBRE/RAZÓN SOCIAL */}
                    <div>
                        <label htmlFor="filtroNombreRazonSocial" className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social:</label>
                        <input
                            type="text"
                            id="filtroNombreRazonSocial"
                            value={filtroNombreRazonSocial}
                            onChange={(e) => setFiltroNombreRazonSocial(e.target.value)}
                            placeholder="Buscar nombre..."
                            className="w-full input-style"
                        />
                    </div>
                    <div>
                        <label htmlFor="filtroCorreo" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Correo:</label>
                        <input type="email" id="filtroCorreo" value={filtroCorreo} onChange={(e) => setFiltroCorreo(e.target.value)} placeholder="Buscar correo..." className="w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="filtroEstatusGeneral" className="block text-sm font-medium text-gray-700 mb-1">Estatus General:</label>
                        <select
                            id="filtroEstatusGeneral"
                            value={filtroEstatusGeneral}
                            onChange={(e) => setFiltroEstatusGeneral(e.target.value)}
                            className="w-full input-style"
                        >
                            <option value="todos">Todos</option>
                            <option value="activos">Activos</option>
                            <option value="inactivos">Inactivos</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="filtroEstatusRevision" className="block text-sm font-medium text-gray-700 mb-1">Estatus Revisión:</label>
                        <select
                            id="filtroEstatusRevision"
                            value={filtroEstatusRevision}
                            onChange={(e) => setFiltroEstatusRevision(e.target.value)}
                            className="w-full input-style"
                        >
                            <option value="todos">Todos</option>
                            <option value="NO_SOLICITADO">No Solicitado</option>
                            <option value="PENDIENTE_REVISION">Pendiente Revisión</option>
                            <option value="EN_REVISION">En Revisión</option>
                            <option value="PENDIENTE_PAGO">Pendiente Pago</option>
                            <option value="APROBADO">Aprobado</option>
                            <option value="RECHAZADO">Rechazado</option>
                        </select>
                    </div>
                </div>

                 {error && !loading && (<p className="text-center text-red-600 bg-red-100 p-3 rounded border border-red-400 mb-4">Error: {error}</p>)}
                 {loading && (<p className="text-center text-blue-500 py-5">Cargando lista de proveedores...</p>)}

                 {!loading && !error && (
                    <TablaDocumentos // Asegúrate que el nombre del componente importado coincida
                        proveedores={proveedoresFiltrados}
                        onViewDocuments={handleViewDocuments}
                        onChangeStatus={handleChangeStatus}
                        onChangeRevisionStatus={handleChangeRevisionStatus}
                        isLoadingRevisionChange={isLoadingRevisionChange}
                        onEditProfile={handleEditProfileClick}
                        onEditUser={handleEditUserClick}
                        isLoadingStatusChange={loadingStatusChange}
                        isFetchingEditData={isFetchingEditData}
                    />
                )}
                 {!loading && !error && proveedoresFiltrados.length === 0 && activeFiltersExist && (
                    <p className="text-center text-gray-500 mt-6">No se encontraron proveedores con los filtros aplicados.</p>
                 )}
                 {!loading && !error && proveedores.length === 0 && !activeFiltersExist && (
                    <p className="text-center text-gray-500 mt-6">No hay proveedores registrados.</p>
                 )}

            </main>
            <Pie />

            {isEditProfileModalOpen && editingProviderData && (
                <ModalActualizarProveedor
                    isOpen={isEditProfileModalOpen}
                    onClose={handleCloseEditProfileModal}
                    proveedorData={editingProviderData}
                    onSubmit={handleSaveProfileUpdate}
                    isLoading={isUpdatingProfile}
                    error={updateProfileError}
                />
            )}
            {isEditUserModalOpen && editingUserData && (
                <ModalActualizarUsuarioProveedor
                    isOpen={isEditUserModalOpen}
                    onClose={handleCloseEditUserModal}
                    userData={editingUserData}
                    onSubmit={handleSaveUserUpdate}
                    // isLoading={isUpdatingUser}
                    // error={updateUserError}
                />
            )}

            <style jsx global>{`
                    .input-style {
                        display: block;
                        width: 100%;
                        padding: 0.5rem 0.75rem;
                        border: 1px solid #d1d5db; /* gray-300 */
                        border-radius: 0.375rem; /* rounded-md */
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
                        outline: none;
                        background-color: white;
                        line-height: 1.5;
                    }
                    .input-style:focus {
                         border-color: #4f46e5; /* indigo-500 */
                         box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3); /* focus:ring-indigo-500 */
                    }
                 `}</style>
        </div>
    );
};