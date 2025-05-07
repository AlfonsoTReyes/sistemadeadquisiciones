// src/app/administradorProveedores/documentos/page.tsx (PÁGINA ESTÁTICA)

"use client"; // Necesario para hooks de cliente y sessionStorage
import React, { useState, useEffect, useCallback } from 'react'; // Añade useCallback
import { useRouter } from 'next/navigation';
import Menu from '../../menu';
import Pie from "../../pie";
//import DynamicMenu from "@/components/dinamicMenu"; // Ajusta ruta si es necesario
// Importa el componente que SÓLO muestra y permite editar estatus
import VistaDocumentosAdmin from './formularios/vistaDocumentos'; // <-- Ajusta ruta al componente correcto
import { ProveedorHeaderData } from './interfaces'; // Ajusta ruta a tu interfaz

// Importa las funciones fetch necesarias para ESTA vista de admin
import {
    fetchProveedorDetallesPorIdAdmin, // Obtiene detalles del proveedor
} from './formularios/fetchAdminDocumentosProveedores'; // <-- Ajusta ruta/nombre de archivo fetch (donde definimos las fetch para admin)

export default function DocumentosProveedorAdminPage() {
    const router = useRouter();

    // Estados: ID leído, info BÁSICA del proveedor, carga, error
    const [idProveedor, setIdProveedor] = useState<number | null>(null);
    const [providerInfo, setProviderInfo] = useState<ProveedorHeaderData | null>(null); // Estado para info básica
    const [idAdminLogueado, setIdAdminLogueado] = useState<number | null>(null);
    const [loadingPage, setLoadingPage] = useState<boolean>(true);
    const [errorPage, setErrorPage] = useState<string | null>(null);

    // 1. Efecto para leer IDs de sessionStorage
    useEffect(() => {
        let providerIdFound: number | null = null;
        let adminIdFound: number | null = null;
        let errorFound: string | null = null;

        if (typeof window !== "undefined") {
            // Leer ID Proveedor (seleccionado por admin)
            const storedProviderId = sessionStorage.getItem('adminSelectedProveedorId'); // Clave correcta para el proveedor seleccionado
            if (storedProviderId) {
                const parsedId = parseInt(storedProviderId, 10);
                providerIdFound = !isNaN(parsedId) ? parsedId : null;
                if (!providerIdFound) errorFound = "ID de proveedor inválido en sesión.";
            } else {
                errorFound = "No se ha seleccionado un proveedor.";
            }

            if (!errorFound) {
                const storedAdminId = sessionStorage.getItem('userId'); // <-- Usar la clave del menú
                if (storedAdminId) {
                    const parsedAdminId = parseInt(storedAdminId, 10);
                    adminIdFound = !isNaN(parsedAdminId) ? parsedAdminId : null;
                    if (!adminIdFound) {
                        errorFound = "ID de administrador inválido en sesión. Inicie sesión de nuevo.";
                        providerIdFound = null; // Invalidar si admin falla
                    }
                } else {
                    // Si no existe 'userId', el admin no está logueado correctamente
                    errorFound = "No se encontró ID de administrador en sesión. Inicie sesión de nuevo.";
                    providerIdFound = null; // Invalidar
                }
            }

        } else { errorFound = "Entorno no válido."; }

        // Actualizar estados
        if (errorFound) {
            setErrorPage(errorFound);
            setIdProveedor(null);
            setIdAdminLogueado(null);
        } else {
            setIdProveedor(providerIdFound);
            setIdAdminLogueado(adminIdFound); // Guardar ID admin leído
            setErrorPage(null);
        }
        setLoadingPage(false);

    }, [router]); // Quitar 'router' si no se usa para redirección aquí

    // 2. Efecto para cargar los DETALLES BÁSICOS del proveedor una vez que tenemos ID
    useEffect(() => {
        // Ejecutar solo si tenemos un idProveedor válido y no estamos ya cargando/con error
        if (idProveedor !== null && !loadingPage && !errorPage && !providerInfo) {

            const loadProviderDetails = async (id: number) => {
                // Podríamos poner un loading específico para esto si quisiéramos
                try {
                    // Llama a fetch para obtener detalles básicos
                    const provData = await fetchProveedorDetallesPorIdAdmin(id); // Asumiendo que esta función devuelve al menos id, rfc, tipo, nombre/razón

                    if (provData && provData.id_proveedor) {
                        // Guardar solo la info necesaria para la cabecera
                        setProviderInfo({
                            id_proveedor: provData.id_proveedor,
                            rfc: provData.rfc,
                            tipo_proveedor: provData.tipo_proveedor,
                            nombre_o_razon_social: provData.nombre_o_razon_social // Asegúrate que fetch lo devuelva
                        });
                    } else {
                        // Si fetch devuelve null o datos incompletos
                        throw new Error(`No se encontró información básica para el proveedor con ID ${id}.`);
                    }
                } catch (err: any) {
                    console.error("Error fetching provider details for admin docs page:", err);
                    setErrorPage(err.message || 'Error al cargar la información del proveedor.');
                    setProviderInfo(null); // Limpiar por si acaso
                } finally {
                    // No modificamos loadingPage aquí, se controla en el efecto anterior
                }
            };

            loadProviderDetails(idProveedor);
        }
    }, [idProveedor, loadingPage, errorPage, providerInfo]); // Dependencias correctas

    // Función para volver
    const handleGoBack = () => {
        sessionStorage.removeItem('adminSelectedProveedorId'); // Limpiar al salir
        router.push('/adminProveedores/altaProveedor');
    };

    // --- Renderizado ---
    return (
        <div>
            <Menu />
            <div className="min-h-screen p-4 md:p-8 bg-gray-100" style={{ marginTop: '60px' }}> {/* Ajusta margen si es necesario */}

                {/* Botón Volver */}
                <button
                    onClick={handleGoBack}
                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 shadow text-sm"
                >
                    ← Volver a Lista
                </button>

                <h1 className="text-2xl md:text-3xl text-center font-bold mb-2 text-gray-800">
                    Revisión de Documentos y Comentarios
                </h1>

                {/* Mostrar Info Básica del Proveedor o Loading/Error */}
                <div className="text-center mb-6 border-b pb-4">
                    {loadingPage ? (
                        <p className="text-gray-500 italic">Cargando información...</p>
                    ) : errorPage ? (
                        <p className="text-red-600 font-semibold">Error: {errorPage}</p>
                    ) : providerInfo ? (
                        <p className="text-lg text-gray-700">
                            Proveedor: <span className="font-semibold text-gray-900">{providerInfo.nombre_o_razon_social || providerInfo.rfc}</span> (RFC: {providerInfo.rfc})
                        </p>
                    ) : (
                        <p className="text-gray-500 italic">No se pudo cargar la información del proveedor.</p>
                    )}
                </div>


                {/* Renderizar el componente principal de documentos/comentarios */}
                {/* Solo si tenemos ID y no hubo error inicial VistaDocumentosAdmin */}

                {!loadingPage && !errorPage && typeof idProveedor === 'number' && typeof idAdminLogueado === 'number' ? (
                    <VistaDocumentosAdmin
                        idProveedor={idProveedor}
                        idUsuarioAdminLogueado={idAdminLogueado}
                    />
                ) : !loadingPage && !errorPage ? (
                    <p className="text-center text-red-500 mt-10">
                        {errorPage || "No se pudo cargar la información necesaria."} {/* Mostrar error específico si existe */}
                    </p>
                ) : null /* No mostrar nada mientras carga */}

            </div>
            <Pie />
        </div>
    );
}