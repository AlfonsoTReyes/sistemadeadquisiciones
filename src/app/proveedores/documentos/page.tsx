"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Menu from '../../menu_principal'; // Ajusta ruta
import { useRouter } from 'next/navigation';
import Pie from '../../../app/pie'; // Ajusta ruta
import TablaDocumentosProveedor from './tablaDocProveedores'; // Ajusta ruta
import GestionDocumentosProveedor from './formularios/altaDocProveedores'; // Ajusta ruta
// Importa la función para obtener el PERFIL COMPLETO por ID de usuario
import { fetchDocumentosPorProveedor, getProveedorForUser } from './formularios/fetchDocumentosProveedores'; // Ajusta ruta
import { DocumentoProveedor, ProveedorCompletoData } from "./interfaces"; // Ajusta ruta e importa la interfaz completa
import ModalDoc from '../../../componentes/ModalDoc/modalDoc'; // Ajusta ruta


const DocumentosProveedorPage = () => {
    const router = useRouter();

    // --- Estados ---
    const [idUsuarioLogueado, setIdUsuarioLogueado] = useState<number | null>(null);
    const [providerProfileData, setProviderProfileData] = useState<ProveedorCompletoData | null>(null);
    const [documentos, setDocumentos] = useState<DocumentoProveedor[]>([]);
    const [loadingPage, setLoadingPage] = useState<boolean>(true); // Cubre carga de perfil Y documentos iniciales
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    // --- 1. Efecto para obtener ID de usuario y luego cargar perfil ---
    useEffect(() => {
        let userIdFound: number | null = null;
        let errorFound: string | null = null;

        if (typeof window !== "undefined") {
            const storedUserId = sessionStorage.getItem("proveedorUserId"); // Clave correcta para usuario
            if (storedUserId) {
                const parsedUserId = parseInt(storedUserId, 10);
                userIdFound = !isNaN(parsedUserId) ? parsedUserId : null;
                if (!userIdFound) errorFound = "ID de usuario inválido en sesión.";
            } else {
                errorFound = "No se encontró ID de usuario en sesión.";
            }
        } else {
            errorFound = "Entorno no válido.";
        }

        if (errorFound) {
            setErrorPage(errorFound);
            setIdUsuarioLogueado(null);
            setProviderProfileData(null); // Limpiar perfil
            setLoadingPage(false);
            // Considerar redirigir a login si falta el ID de usuario
            // router.push('/proveedores/login');
        } else if (userIdFound) {
            setIdUsuarioLogueado(userIdFound);
            // Iniciar carga del perfil usando el ID de usuario encontrado
            fetchProfileData(userIdFound);
        }
        // No llamar a fetchDocsCallback aquí, se hará después de cargar el perfil

    }, [router]); // Solo depende de router (para posible redirección)

    // --- 2. Función para cargar el PERFIL COMPLETO del proveedor ---
    const fetchProfileData = useCallback(async (userId: number) => {
        console.log(`DocumentosPage: Cargando perfil para usuario ID: ${userId}`);
        setLoadingPage(true); // Iniciar estado de carga general
        setErrorPage(null);
        try {
            // Llama a la función fetch que devuelve el perfil completo
            const profileData = await getProveedorForUser(userId);

            if (profileData && profileData.id_proveedor && profileData.tipo_proveedor) {
                console.log("DocumentosPage: Perfil cargado:", profileData); // Verificar que vengan los nuevos campos
                setProviderProfileData(profileData as ProveedorCompletoData); // Guardar perfil completo
                // Ahora que tenemos el perfil (y el id_proveedor), cargamos los documentos
                fetchDocsCallback(profileData.id_proveedor);
            } else {
                // Si getProveedorForUser devuelve null o datos incompletos
                throw new Error('Perfil de proveedor no encontrado o incompleto asociado a este usuario.');
            }
        } catch (err: any) {
            console.error("Error al cargar perfil del proveedor:", err);
            setErrorPage(`Error al cargar perfil: ${err.message}`);
            setProviderProfileData(null); // Limpiar en caso de error
            setDocumentos([]); // Limpiar documentos también
            setLoadingPage(false); // Detener carga si falla el perfil
        }
        // setLoadingPage(false) se llamará en fetchDocsCallback o en el catch
    }, []); // No necesita dependencias si getProveedorForUser es estable

    // --- 3. Función para cargar/recargar los DOCUMENTOS (depende de idProveedor) ---
    const fetchDocsCallback = useCallback(async (idProveedor: number) => {
        if (!idProveedor) {
            setDocumentos([]);
            setLoadingPage(false); // Termina la carga si no hay ID para buscar docs
            return;
        }
        console.log(`DocumentosPage: Cargando documentos para proveedor ID: ${idProveedor}`);
        // No resetear errorPage aquí, solo error específico de docs si hubiera
        // setLoadingDocs(true); // Podríamos usar un loading específico para docs si quisiéramos
        try {
            const data = await fetchDocumentosPorProveedor(idProveedor);
            setDocumentos(data || []);
            console.log(`DocumentosPage: Documentos cargados (${data?.length || 0}).`);
        } catch (err: any) {
            console.error("Error al obtener documentos del proveedor:", err);
            setErrorPage((prevError) => prevError ? `${prevError} Y Error al cargar documentos: ${err.message}` : `Error al cargar documentos: ${err.message}`); // Añadir al error existente si lo hay
            setDocumentos([]);
        } finally {
            // setLoadingDocs(false);
            setLoadingPage(false); // Termina la carga general aquí (después de perfil y docs)
        }
    }, []); // Sin dependencias, idProveedor se pasa como argumento


    // --- Handlers Modal y Navegación (Ajustados para usar providerProfileData) ---
    const handleOpenDocumentsModal = () => {
        // Necesita el perfil completo para pasar esProveedorEventos
        if (providerProfileData?.id_proveedor && providerProfileData?.tipo_proveedor) {
            console.log(`Opening documents modal for ID: ${providerProfileData.id_proveedor}, Type: ${providerProfileData.tipo_proveedor}, Eventos: ${providerProfileData.proveedor_eventos}`);
            openModal();
        } else {
            console.error("Faltan datos del perfil para abrir modal de documentos.", providerProfileData);
            setErrorPage("No se pueden gestionar los documentos: Faltan datos del perfil del proveedor.");
            alert("Error al cargar datos del proveedor. Intente recargar la página.");
        }
    };

    const handleRegresar = () => {
        router.push('/proveedores/dashboard'); // O la ruta correcta
    };

    const handleCloseAndReload = () => {
        closeModal();
        // Recargar datos SIN recargar toda la página
        if (idUsuarioLogueado) {
            fetchProfileData(idUsuarioLogueado); // Vuelve a cargar perfil y documentos
        } else {
            // Si se perdió el id de usuario, es mejor recargar o redirigir
            window.location.reload();
        }
    };

    // --- Renderizado ---
    return (
        <div>
            <Menu />
            <div className="min-h-screen p-4 md:p-8 bg-gray-50" style={{ marginTop: '80px' }}> {/* Ajusta margen si es necesario */}
                <h1 className="text-2xl text-center sm:text-left font-bold mb-6 text-gray-800">
                    Documentos del Proveedor
                </h1>

                {/* Estado de Carga Inicial */}
                {loadingPage && <p className="text-center text-blue-600 py-5">Cargando información...</p>}

                {/* Error de Carga Inicial */}
                {errorPage && !loadingPage && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{errorPage}</p>
                    </div>
                )}

                {/* Contenido Principal (si no hay error y terminó la carga inicial) */}
                {!loadingPage && !errorPage && providerProfileData && (
                    <>
                        {/* Botones de Acción */}
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <button
                                onClick={handleRegresar}
                                className="w-full sm:w-auto px-5 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                            >
                                Regresar al Dashboard
                            </button>
                             <button
                                onClick={handleOpenDocumentsModal}
                                className="w-full sm:w-auto px-5 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                            >
                                Gestionar Documentos (Subir/Eliminar)
                            </button>
                        </div>

                        {/* Tabla Resumen de Documentos */}
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">Documentos Actuales</h2>
                        <TablaDocumentosProveedor
                            documentos={documentos}
                            // isLoading lo controlamos arriba, aquí pasamos false si ya cargó perfil+docs
                            isLoading={loadingPage} // Podríamos pasar un `loadingDocs` específico si lo tuviéramos
                        />
                    </>
                )}

                {/* Mensaje si no hay perfil y terminó carga */}
                {!loadingPage && !errorPage && !providerProfileData && (
                    <p className="text-center text-gray-500 mt-10">No se pudo cargar la información del perfil del proveedor.</p>
                )}

                {/* --- MODAL --- */}
                {/* Renderizar ModalDoc y pasar GestionDocumentosProveedor como children */}
                <ModalDoc isOpen={isModalOpen} onClose={closeModal} title="Gestionar Documentos">
                    {/* Renderizar condicionalmente basado en si tenemos los datos necesarios */}
                    {providerProfileData?.id_proveedor && providerProfileData?.tipo_proveedor && idUsuarioLogueado ? (
                        <GestionDocumentosProveedor
                            idProveedor={providerProfileData.id_proveedor}
                            tipoProveedor={providerProfileData.tipo_proveedor}
                            // **PASAR LA NUEVA PROP**
                            esProveedorEventos={providerProfileData.proveedor_eventos ?? false} // Usa el valor del perfil
                            onClose={handleCloseAndReload} // Función que cierra y recarga datos
                            // Nota: idUsuarioLogueado no es una prop de GestionDocumentosProveedor
                            // ese componente lo obtiene de sessionStorage internamente.
                        />
                    ) : (
                        // Mostrar un mensaje dentro del modal si faltan datos
                        <div className="p-6 text-center">
                            <p className="text-red-600">Error: No se pudo cargar la información necesaria para gestionar documentos.</p>
                            <button onClick={closeModal} className="mt-4 button-secondary">Cerrar</button>
                        </div>
                    )}
                </ModalDoc>

                {/* Estilos rápidos (mover a CSS/Tailwind config si es posible) */}
                <style jsx global>{`
                    .button-primary { padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border-radius: 0.375rem; font-weight: 500; }
                    .button-primary:hover:not(:disabled) { background-color: #4338ca; }
                    .button-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                    .button-secondary { padding: 0.5rem 1rem; background-color: #e5e7eb; color: #374151; border-radius: 0.375rem; font-weight: 500; }
                    .button-secondary:hover:not(:disabled) { background-color: #d1d5db; }
                    .button-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
                `}</style>

            </div>
            <Pie />
        </div>
    );
};

export default DocumentosProveedorPage;