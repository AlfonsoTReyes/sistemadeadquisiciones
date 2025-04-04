/*
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pie from "../../pie"; // Ajusta ruta
import TablaAdministradorProveedores from './tablaProveedores'; // Ajusta ruta
import { ProveedorData } from './interface'; // Ajusta ruta a tu interfaz

// --- IMPORTA LAS NUEVAS FUNCIONES FETCH ---
import { fetchAllProveedores, updateProveedorStatus } from './formularios/fetchAltaProveedor'; // <-- AJUSTA RUTA/NOMBRE DE ARCHIVO
*/

// src/app/administradorProveedores/documentos/[id]/page.tsx

"use client"; // Necesario para hooks de cliente
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Importa useParams y useRouter
import Pie from "../../pie"; // Ajusta ruta
//import DynamicMenu from "@/components/dinamicMenu"; // Ajusta ruta si es necesario
import TablaDocumentos from './tablaProveedores';
import { ProveedorData } from './interface'; // Ajusta ruta a tu interfaz de proveedor

// Importa las funciones fetch CORRECTAS para esta página
import {
    fetchAllProveedores,
    updateProveedorStatus
} from './formularios/fetchAltaProveedor'; // Ajusta ruta/nombre de archivo fetch

export default function DocumentosProveedorPage() {
    const router = useRouter();
    const params = useParams();

    // Estados específicos para esta página
    const [idProveedor, setIdProveedor] = useState<number | null>(null); // ID obtenido de la URL
    const [providerInfo, setProviderInfo] = useState<ProveedorData | null>(null); // Info del proveedor actual
    const [documentos, setDocumentos] = useState<DocumentoData[]>([]); // Lista de documentos
    const [loading, setLoading] = useState(true); // Estado de carga general
    const [error, setError] = useState<string | null>(null); // Estado de error general

    // 1. Efecto para obtener y validar el ID de la URL
    useEffect(() => {
        const idParam = params?.id; // Obtiene el valor de [id] de la URL
        // console.log("Documentos Page - Raw ID param:", idParam); // Debug

        if (idParam) {
            const parsedId = parseInt(idParam as string, 10);
            if (!isNaN(parsedId)) {
                setIdProveedor(parsedId);
                // console.log("Documentos Page - Parsed ID:", parsedId); // Debug
            } else {
                setError("El ID del proveedor en la URL es inválido.");
                setLoading(false);
            }
        } else {
            // Esto no debería ocurrir si la ruta está bien definida, pero por si acaso
            setError("No se encontró el ID del proveedor en la URL.");
            setLoading(false);
        }
    }, [params?.id]); // Se ejecuta cuando cambia el parámetro id de la URL

    // 2. Efecto para cargar los datos una vez que tenemos un ID válido
    useEffect(() => {
        // Solo ejecutar si tenemos un idProveedor válido
        if (idProveedor === null) {
             if (!loading && !error) { // Si no está cargando y no hay error previo, muestra mensaje
                 setError("Esperando ID de proveedor...");
             }
             return; // No hacer fetch si no hay ID
        }

        const loadData = async (id: number) => {
            setLoading(true);
            setError(null); // Limpia errores previos
            setProviderInfo(null); // Limpia datos previos
            setDocumentos([]);
            // console.log(`Documentos Page - Fetching data for ID: ${id}`); // Debug

            try {
                // Llama a las dos funciones fetch en paralelo
                const [provData, docsData] = await Promise.all([
                    fetchProveedorDetallesPorId(id),
                    fetchDocumentosDelProveedor(id)
                ]);

                // --- Validación de datos del proveedor ---
                if (provData && provData.id_proveedor) {
                    setProviderInfo(provData);
                } else {
                     // Si no se encontraron datos del proveedor, aún podríamos mostrar documentos si existen,
                     // pero es mejor lanzar un error o mostrar un mensaje claro.
                    console.warn("No se encontró información detallada del proveedor con ID:", id);
                    throw new Error(`No se encontró información para el proveedor con ID ${id}.`);
                }

                // Asigna los documentos (puede ser un array vacío)
                setDocumentos(docsData || []);
                 // console.log("Documentos Page - Data loaded:", { provData, docsData }); // Debug

            } catch (err: any) {
                console.error("Error fetching data for documents page:", err);
                setError(err.message || 'Error al cargar los datos.');
                 setProviderInfo(null); // Limpia en caso de error
                 setDocumentos([]);
            } finally {
                setLoading(false);
            }
        };

        loadData(idProveedor);

    }, [idProveedor]); // Dependencia: se ejecuta cuando idProveedor cambia (después de parsear)

    // Función para volver a la página anterior (lista de proveedores)
    const handleGoBack = () => {
        router.back(); // Navegación simple hacia atrás
    };

    // --- Renderizado de la página ---
    return (
        <div>
            
            <div className="min-h-screen p-4 md:p-8 bg-gray-100" style={{ marginTop: 100 }}> {/* Ajusta margen si es necesario */}

                {/* Botón para Volver */}
                <button
                    onClick={handleGoBack}
                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 shadow"
                >
                    ← Volver a Proveedores
                </button>

                {/* Indicador de Carga */}
                {loading && <p className="text-center text-lg text-blue-600 py-4">Cargando información...</p>}

                {/* Mensaje de Error */}
                {error && (
                    <p className="text-center text-red-600 bg-red-100 p-4 rounded border border-red-400 my-4">
                        Error: {error}
                    </p>
                )}

                {/* Contenido Principal: Título e Información del Proveedor + Tabla de Documentos */}
                {/* Se muestra solo si no hay carga, no hay error, y tenemos info del proveedor */}
                {!loading && !error && providerInfo && (
                    <div>
                        <h1 className="text-2xl md:text-3xl text-center font-bold mb-2 text-gray-800">
                            Gestión de Documentos
                        </h1>
                        <p className="text-center text-lg text-gray-600 mb-6">
                            Proveedor: <span className="font-semibold">{providerInfo.rfc}</span> ({providerInfo.tipo_proveedor?.charAt(0).toUpperCase() + providerInfo.tipo_proveedor?.slice(1)})
                        </p>

                        {/* Componente de Tabla para mostrar los documentos */}
                        <TablaDocumentos documentos={documentos} />
                    </div>
                )}

                 {/* Mensaje si terminó de cargar pero no encontró proveedor */}
                 {!loading && !error && !providerInfo && idProveedor && (
                     <p className="text-center text-orange-500 mt-6">
                         No se pudo cargar la información del proveedor con ID {idProveedor}.
                     </p>
                 )}

            </div>
            <Pie /> {/* Pie de página */}
        </div>
    );
}