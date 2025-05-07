// src/app/proveedores/dashboard/page.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PieP from "../../pie";
import DynamicMenu from "../../menu_proveedor";
import ProveedorInfo from './formularios/ProveedorInfo';
import ModalActualizarProveedor from './formularios/modalActualizarProveedor';
import { getProveedorForUser } from './formularios/fetchdashboard';
import { ProveedorData as ProveedorCompletoData } from './formularios/ProveedorInfo';

const LOGIN_URL = '/proveedores/proveedoresusuarios';

export default function PageProveedorDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [providerData, setProviderData] = useState<ProveedorCompletoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // REMOVED: These states were defined but never used.
  // If ModalActualizarProveedor needs them, uncomment and pass as props.
  // const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  // const [updateProfileError, setUpdateProfileError] = useState<string | null>(null);


  const fetchProviderData = useCallback(async (idUsuario: number) => {
    if (!idUsuario) return;
    console.log(`Dashboard: Fetching/Refreshing data for user ID: ${idUsuario}`);
    setError(null);
    try {
      const data = await getProveedorForUser(idUsuario);
      if (data && data.id_proveedor && data.tipo_proveedor) {
        setProviderData(data as ProveedorCompletoData);
        console.log("Dashboard: Provider data loaded/refreshed:", data);
        sessionStorage.setItem('proveedorId', data.id_proveedor.toString());
        sessionStorage.setItem('proveedorTipo', data.tipo_proveedor);
      } else {
        console.warn("Dashboard: Profile not found or incomplete after fetch for user ID:", idUsuario);
        setProviderData(null);
        sessionStorage.removeItem('proveedorId');
        sessionStorage.removeItem('proveedorTipo');
        setError('No se encontró un perfil de proveedor completo.');
      }
    } catch (errUnknown: unknown) { // CORREGIDO: any -> unknown
      console.error("Dashboard: Error fetching provider data:", errUnknown);
      setProviderData(null);
      sessionStorage.removeItem('proveedorId');
      sessionStorage.removeItem('proveedorTipo');
      if (errUnknown instanceof Error) {
        setError(errUnknown.message || 'Error al cargar los datos del proveedor.');
      } else {
        setError('Ocurrió un error desconocido al cargar los datos del proveedor.');
      }
    } finally {
      // setLoading(false); // Caller (useEffect) handles this
    }
  }, []);

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

  const handleOpenEditModal = () => {
    if (providerData) {
      // setUpdateProfileError(null); // Uncomment if updateProfileError state is used
      setIsModalOpen(true);
    } else {
      alert("No hay datos de proveedor cargados para editar.");
    }
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleUpdateSuccess = () => {
    console.log("Dashboard: Modal informó éxito. Recargando datos del proveedor...");
    handleCloseModal();
    if (userId) {
      fetchProviderData(userId);
    }
  };

  const handleManageDocumentsClick = () => {
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

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicMenu />
      <main className="flex-grow p-4 md:p-8 bg-gray-50 pt-20 md:pt-24">

        {loading && <p className="text-center text-gray-600 py-10">Cargando información...</p>}
        {error && !loading && (
          <div className="text-center py-10 text-red-600 bg-red-100 border border-red-400 p-4 rounded-md max-w-lg mx-auto shadow-md">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && providerData && (
          <ProveedorInfo
            providerData={providerData}
            loading={false}
            error={null}
            onManageDocumentsClick={handleManageDocumentsClick}
            // onEditProfileClick={handleOpenEditModal} // Assuming ProveedorInfo has its own edit button or this is handled differently
            onDataRefreshNeeded={() => { if (userId) fetchProviderData(userId); }}
          />
        )}
        {/* Button to open modal can be placed here or within ProveedorInfo */}
        {/*
        {!loading && !error && providerData && (
            <div className="text-center mt-6">
                <button
                    onClick={handleOpenEditModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-md transition duration-150 ease-in-out"
                >
                    Editar Perfil (Desde Dashboard)
                </button>
            </div>
        )}

        */}
        {!loading && !error && !providerData && (
          <p className="text-center text-gray-500 py-10">No se encontró información del perfil del proveedor.</p>
        )}

      </main>
      <PieP />

      {isModalOpen && providerData && (
        <ModalActualizarProveedor
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          // initialData={providerData} // Assuming ModalActualizarProveedor fetches its own data or receives it differently
          proveedorData={providerData} // Pass providerData if modal uses it directly
          onUpdateSuccess={handleUpdateSuccess}
          // Pass isLoading and error if the modal needs them as props
          // isLoading={isUpdatingProfile} // Uncomment if state is used
          // error={updateProfileError}    // Uncomment if state is used
        />
      )}
    </div>
  );
}