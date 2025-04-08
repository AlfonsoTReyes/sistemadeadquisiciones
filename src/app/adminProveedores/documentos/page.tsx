// src/app/administradorProveedores/documentos/page.tsx (PÁGINA ESTÁTICA)

"use client"; // Necesario para hooks de cliente y sessionStorage
import React, { useState, useEffect, useCallback } from 'react'; // Añade useCallback
import { useRouter } from 'next/navigation';
import Menu from '../../menu_principal';

import Pie from '../../../app/pie'; // Ajusta ruta
//import DynamicMenu from "@/components/dinamicMenu"; // Ajusta ruta si es necesario
// Importa el componente que SÓLO muestra y permite editar estatus
import VistaDocumentosAdmin from './formularios/vistaDocumentos'; // <-- Ajusta ruta al componente correcto
import { ProveedorData } from './interfaces'; // Ajusta ruta a tu interfaz

// Importa las funciones fetch necesarias para ESTA vista de admin
import {
    fetchProveedorDetallesPorIdAdmin, // Obtiene detalles del proveedor
    fetchDocumentosPorProveedorAdmin  // Obtiene documentos (renombrada para claridad)
} from './formularios/fetchAdminDocumentosProveedores'; // <-- Ajusta ruta/nombre de archivo fetch (donde definimos las fetch para admin)

export default function DocumentosProveedorAdminPage() {
    const router = useRouter();

    // Estados: ID leído de sesión, info del proveedor, lista de documentos, carga, error
    const [idProveedor, setIdProveedor] = useState<number | null>(null);
    const [providerInfo, setProviderInfo] = useState<ProveedorData | null>(null);
    // No necesitamos estado para 'documentos' aquí si VistaDocumentosAdmin los carga internamente,
    // pero si VistaDocumentosAdmin los recibe como prop, mantenlo:
    // const [documentos, setDocumentos] = useState<DocumentoData[]>([]);
    const [loadingPage, setLoadingPage] = useState<boolean>(true); // Carga inicial del ID y detalles prov.
    const [errorPage, setErrorPage] = useState<string | null>(null);

    // 1. Efecto para leer el ID del proveedor seleccionado por el admin de sessionStorage
    useEffect(() => {
        const storageKey = 'adminSelectedProveedorId'; // Clave que guardamos en la página anterior
        const storedProviderId = sessionStorage.getItem(storageKey);
        // console.log("Admin Docs Page - Retrieved Provider ID from session:", storedProviderId); // Debug

        if (storedProviderId) {
            const providerIdNum = parseInt(storedProviderId, 10);
            if (!isNaN(providerIdNum)) {
                setIdProveedor(providerIdNum);
                // No llamamos a fetch aquí, esperamos al siguiente efecto
            } else {
                setErrorPage("ID de proveedor inválido encontrado en sesión (Admin).");
                setLoadingPage(false);
            }
        } else {
            setErrorPage("No se ha seleccionado un proveedor desde la página de administración.");
            setLoadingPage(false);
            // Opcional: redirigir si no hay ID
            // router.replace('/administradorProveedores');
        }
    }, [router]); // Dependencia para posible redirección

    // 2. Efecto para cargar los DETALLES del proveedor una vez que tenemos ID
    //    (La carga de DOCUMENTOS la hará el componente VistaDocumentosAdmin internamente)
    useEffect(() => {
        if (idProveedor === null) {
            // Si aún no hay ID o ya hubo error al leerlo, no hacemos nada.
             if (!loadingPage && !errorPage) setErrorPage("Esperando ID de proveedor...");
            return;
        }

        const loadProviderDetails = async (id: number) => {
            setLoadingPage(true); // Podríamos usar un loading diferente, pero este sirve
            setErrorPage(null);
            setProviderInfo(null);
            // console.log(`Admin Docs Page - Fetching provider details for ID: ${id}`); // Debug

            try {
                // Llama a la función fetch para obtener SOLO los detalles del proveedor
                const provData = await fetchProveedorDetallesPorIdAdmin(id);

                if (provData && provData.id_proveedor) {
                    setProviderInfo(provData);
                } else {
                    throw new Error(`No se encontró información para el proveedor con ID ${id}.`);
                }
            } catch (err: any) {
                console.error("Error fetching provider details for admin docs page:", err);
                setErrorPage(err.message || 'Error al cargar la información del proveedor.');
                setProviderInfo(null);
            } finally {
                 // La carga principal termina después de obtener los detalles del proveedor.
                 // La carga de documentos la manejará el componente hijo.
                setLoadingPage(false);
            }
        };

        loadProviderDetails(idProveedor);

    }, [idProveedor]); // Dependencia: se ejecuta cuando idProveedor cambia


    // Función para volver a la lista de administración
    const handleGoBack = () => {
        // Opcional: limpiar el ID de sesión al volver
        // sessionStorage.removeItem('adminSelectedProveedorId');
        router.push('/adminProveedores/altaProveedor'); // Ir a la página de la lista
    };

    // --- Renderizado ---
    return (
        <div>
            <Menu />
            <div className="min-h-screen p-4 md:p-8 bg-gray-100">

                <button
                    onClick={handleGoBack}
                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 shadow"
                >
                    ← Volver a Lista de Proveedores
                </button>

                {/* Indicador de Carga INICIAL (ID y Detalles del Proveedor) */}
                {loadingPage && <p className="text-center text-lg text-blue-600 py-4">Cargando información del proveedor...</p>}

                {/* Mensaje de Error de Carga INICIAL */}
                {errorPage && (
                    <p className="text-center text-red-600 bg-red-100 p-4 rounded border border-red-400 my-4">
                        Error: {errorPage}
                    </p>
                )}

                {/* Contenido: Título + Componente de Documentos */}
                {/* Se muestra solo si NO hay carga inicial, NO hay error inicial, y TENEMOS un ID de proveedor */}
                {!loadingPage && !errorPage && idProveedor && (
                    <div>
                        <h1 className="text-2xl md:text-3xl text-center font-bold mb-2 text-gray-800">
                            Revisión de Documentos
                        </h1>
                        {/* Muestra info del proveedor si ya se cargó */}
                        {providerInfo ? (
                            <p className="text-center text-lg text-gray-600 mb-6">
                                Proveedor: <span className="font-semibold">{providerInfo.rfc}</span> ({providerInfo.tipo_proveedor?.charAt(0).toUpperCase() + providerInfo.tipo_proveedor?.slice(1)})
                            </p>
                        ) : (
                            <p className="text-center text-gray-500 mb-6">Cargando detalles del proveedor...</p>
                        )}

                        {/* Componente que carga y muestra la tabla de documentos */}
                        {/* Le pasamos el idProveedor para que cargue sus propios datos */}
                        <VistaDocumentosAdmin idProveedor={idProveedor} />
                    </div>
                )}

            </div>
            <Pie />
        </div>
    );
}