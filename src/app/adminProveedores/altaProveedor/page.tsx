
"use client"; // Necesario para hooks de cliente

import React, { useState, useEffect, useMemo } from 'react'; // Añade useMemo
import { useRouter } from 'next/navigation'; // Para navegación
import Pie from "../../pie"; // Ajusta ruta
//import DynamicMenu from "@/components/dinamicMenu"; // Ajusta ruta si es necesario
import TablaDocumentos from './tablaProveedores';
import { ProveedorData, DocumentoData } from './interface'; // Ajusta ruta a tu interfaz de proveedor

// Importa las funciones fetch CORRECTAS para la página de admin
import {
    fetchAllProveedores,
    updateProveedorStatus
} from './formularios/fetchAltaProveedor'; // Ajusta ruta/nombre de archivo fetch

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
    // --- 1. EFECTO PARA CARGAR LA LISTA INICIAL DE PROVEEDORES ---
    useEffect(() => {
        const fetchProveedoresData = async () => {
            // console.log("Admin Page - Fetching initial provider list..."); // Debug
            setLoading(true);
            setError(null);
            try {
                // Llama a la función fetch que obtiene TODOS los proveedores para admin
                const data = await fetchAllProveedores();
                setProveedores(data || []); // Asegura que sea un array
                // console.log("Admin Page - Providers loaded:", data.length); // Debug
            } catch (err) {
                console.error("Error fetching provider list for admin:", err);
                setError((err as Error).message || 'Error al cargar la lista de proveedores.');
                setProveedores([]); // Limpia en caso de error
            } finally {
                setLoading(false);
            }
        };

        fetchProveedoresData();
    }, []); // El array vacío [] asegura que se ejecute solo una vez al montar

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
                // Llama a la función fetch que usa PUT /api/admin/proveedores
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
    // --- NUEVA LÓGICA PARA FILTRAR ---
    // Usamos useMemo para evitar recalcular la lista filtrada en cada renderizado
    // si los proveedores o los filtros no han cambiado.
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
    // --- RENDERIZADO DE LA PÁGINA ---
    return (
        <div>
            <div className="min-h-screen p-4 md:p-8 bg-gray-100" style={{ marginTop: 100 }}>
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
                        onViewDocuments={handleViewDocuments}
                        onChangeStatus={handleChangeStatus}
                        isLoadingStatusChange={loadingStatusChange}
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

            </div>
            <Pie />
        </div>
    );
};