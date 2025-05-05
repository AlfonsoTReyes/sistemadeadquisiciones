// src/app/proveedores/articulos/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Menu from '../../menu_proveedor'; // Ajusta ruta
import Pie from "../../pie"; // Ajusta ruta
import TablaArticulos from './tablaArticulos'; // Importa la tabla
import ModalArticulo from './formularios/modalArtuculo'; // Corregido: Nombre de archivo

// Importa las funciones fetch
import {
    fetchArticulosProveedor,
    createArticuloProveedorFetch,
    updateArticuloProveedorFetch,
    deleteArticuloProveedorFetch,
} from './formularios/fetchArticulos'; // Ajusta ruta
import { fetchPartidasParaFiltro } from '../../catalogoProveedores/formularios/fetchCatologoProveedores';

// Importa las interfaces
import { ArticuloProveedor, ArticuloFormData, CatalogoPartidaFiltro } from './interface'; // Ajusta ruta

export default function GestionArticulosProveedorPage() {
    const router = useRouter();

    // Estados principales
    const [idProveedor, setIdProveedor] = useState<number | null>(null);
    const [articulos, setArticulos] = useState<ArticuloProveedor[]>([]);
    const [partidasCatalogo, setPartidasCatalogo] = useState<CatalogoPartidaFiltro[]>([]); // <-- NUEVO: Para el select del modal

    // Estados de Carga
    const [loadingPage, setLoadingPage] = useState<boolean>(true); // Carga inicial ID Proveedor
    const [loadingArticulos, setLoadingArticulos] = useState<boolean>(false); // Carga de la tabla
    const [loadingPartidas, setLoadingPartidas] = useState<boolean>(false); // <-- NUEVO: Carga del catálogo de partidas
    const [isSaving, setIsSaving] = useState<boolean>(false); // Carga del modal (Crear/Actualizar)
    const [isDeleting, setIsDeleting] = useState<number | null>(null); // ID del artículo que se está borrando

    // Estados de Error
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [errorArticulos, setErrorArticulos] = useState<string | null>(null); // Error al cargar/borrar tabla
    const [errorPartidas, setErrorPartidas] = useState<string | null>(null); // <-- NUEVO: Error al cargar partidas
    const [modalError, setModalError] = useState<string | null>(null); // Error a mostrar en el modal

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticulo, setEditingArticulo] = useState<ArticuloProveedor | null>(null); // null para crear, objeto para editar

    // --- Estados de Filtro ---
    const [filtroPartida, setFiltroPartida] = useState<string>(''); // '' significa todas
    const [filtroDescripcion, setFiltroDescripcion] = useState<string>('');
    const [filtroEstatus, setFiltroEstatus] = useState<string>('todos'); // 'todos', 'activo', 'inactivo'

    // 1. Obtener idProveedor desde sessionStorage (sin cambios)
    useEffect(() => {
        let providerIdFound: number | null = null;
        let errorFound: string | null = null;
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("proveedorId");
            if (storedId) {
                const parsedId = parseInt(storedId, 10);
                providerIdFound = !isNaN(parsedId) ? parsedId : null;
                if (!providerIdFound) errorFound = "ID de proveedor inválido en sesión.";
            } else {
                errorFound = "No se encontró ID de proveedor en sesión.";
            }
        } else { errorFound = "Entorno no válido."; }

        if (errorFound) {
            setErrorPage(errorFound);
            setIdProveedor(null);
        } else {
            setIdProveedor(providerIdFound);
            setErrorPage(null);
        }
        setLoadingPage(false);
    }, []); // Ejecutar solo al montar

    // 2. Función para cargar/recargar artículos (sin cambios en la lógica principal)
    const cargarArticulos = useCallback(async () => {
        if (!idProveedor) { setArticulos([]); return; };
        setLoadingArticulos(true); setErrorArticulos(null);
        try {
            const data = await fetchArticulosProveedor(idProveedor, false); // Obtener todos (activos e inactivos)
            setArticulos(data || []);
        } catch (err: any) {
            console.error("Error al cargar artículos:", err);
            setErrorArticulos(err.message || 'Error al cargar artículos.');
            setArticulos([]);
        } finally {
            setLoadingArticulos(false);
        }
    }, [idProveedor]);

    // 3. Función para cargar el catálogo de partidas (para el modal)
    const cargarPartidasCatalogo = useCallback(async () => {
        setLoadingPartidas(true); setErrorPartidas(null);
        try {
            // Usa la función fetch que obtiene TODAS las partidas seleccionables (nivel 3 usualmente)
            const data = await fetchPartidasParaFiltro(); // Reutilizamos la función del catálogo público
            setPartidasCatalogo(data || []);
            console.log(`PAGE: Catálogo de ${data?.length || 0} partidas cargado para modal.`);
        } catch (err: any) {
            console.error("Error al cargar catálogo de partidas:", err);
            setErrorPartidas(err.message || 'Error al cargar catálogo de partidas.');
            setPartidasCatalogo([]);
        } finally {
            setLoadingPartidas(false);
        }
    }, []);

    // 4. Efecto para cargar datos iniciales (artículos y partidas)
    useEffect(() => {
        if (!loadingPage && idProveedor) {
            cargarArticulos();
            cargarPartidasCatalogo(); // Carga el catálogo de partidas también
        }
    }, [idProveedor, loadingPage, cargarArticulos, cargarPartidasCatalogo]); // Incluir dependencias

    // --- Funciones para el Modal (sin cambios) ---
    const handleOpenModal = (articulo: ArticuloProveedor | null = null) => {
        console.log(articulo ? `EDITANDO Articulo ID: ${articulo.id_articulo}` : 'CREANDO Nuevo Artículo');
        setEditingArticulo(articulo);
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingArticulo(null);
        setModalError(null);
    };

    // --- Función de Guardado (Actualizada para esperar codigo_partida del modal) ---
    // Ahora la interfaz de entrada debe reflejar que el modal enviará codigo_partida
    interface FormDataFromModal extends ArticuloFormData {
        codigo_partida: string; // El modal AHORA enviará esto
        id_proveedor: number;
        id_articulo?: number;
    }

    const handleSaveArticulo = async (formDataFromModal: FormDataFromModal) => {
        setIsSaving(true);
        setModalError(null);
        const isEditing = !!formDataFromModal.id_articulo;
        console.log(`PAGE: Guardando artículo. Es edición: ${isEditing}. Data:`, formDataFromModal);

        // Validar que codigo_partida venga del modal
        if (!formDataFromModal.codigo_partida) {
            setModalError("Error: Se debe seleccionar una partida para el artículo.");
            setIsSaving(false);
            return;
        }

        try {
            // El payload ya contiene id_proveedor y codigo_partida
            const payload = {
                id_proveedor: formDataFromModal.id_proveedor,
                codigo_partida: formDataFromModal.codigo_partida,
                descripcion: formDataFromModal.descripcion,
                unidad_medida: formDataFromModal.unidad_medida,
                stock: formDataFromModal.stock, // El modal ya debe convertir a número si es necesario
                precio_unitario: formDataFromModal.precio_unitario, // El modal ya debe convertir
                estatus: formDataFromModal.estatus
            };

            if (isEditing && formDataFromModal.id_articulo) {
                // Llamada a Actualizar - Pasamos idArticulo y el payload
                await updateArticuloProveedorFetch(formDataFromModal.id_articulo, payload);
                alert("Artículo actualizado correctamente.");
            } else {
                // Llamada a Crear - Pasamos el payload completo
                await createArticuloProveedorFetch(payload);
                alert("Artículo agregado correctamente.");
            }
            handleCloseModal();
            await cargarArticulos();

        } catch (err: any) {
            console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} artículo:`, err);
            setModalError(err.message || `Ocurrió un error.`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Función de Eliminación (sin cambios) ---
    const handleDeleteArticulo = async (idArticulo: number) => {
        if (!idProveedor) return;
        const articuloAEliminar = articulos.find(a => a.id_articulo === idArticulo);
        const confirmacion = window.confirm(`Eliminar "${articuloAEliminar?.descripcion || `ID ${idArticulo}`}"?`);
        if (confirmacion) {
            setIsDeleting(idArticulo); setErrorArticulos(null);
            try {
                await deleteArticuloProveedorFetch(idArticulo, idProveedor);
                alert("Artículo eliminado.");
                await cargarArticulos();
            } catch (err: any) {
                console.error("Error al eliminar:", err);
                setErrorArticulos(err.message || "Error al eliminar.");
            } finally {
                setIsDeleting(null);
            }
        }
    };

    // --- NUEVO: Lógica de Filtrado Frontend ---
    const articulosFiltrados = useMemo(() => {
        // Copia original para no mutar el estado
        let itemsFiltrados = [...articulos];

        // 1. Filtrar por Partida
        if (filtroPartida) {
            itemsFiltrados = itemsFiltrados.filter(item => item.codigo_partida === filtroPartida);
        }

        // 2. Filtrar por Descripción (case-insensitive)
        if (filtroDescripcion) {
            const descLower = filtroDescripcion.toLowerCase();
            itemsFiltrados = itemsFiltrados.filter(item =>
                item.descripcion.toLowerCase().includes(descLower)
            );
        }

        // 3. Filtrar por Estatus
        if (filtroEstatus !== 'todos') {
            const estatusBuscado = filtroEstatus === 'activo'; // true si es 'activo', false si es 'inactivo'
            itemsFiltrados = itemsFiltrados.filter(item => item.estatus === estatusBuscado);
        }

        return itemsFiltrados;
    }, [articulos, filtroPartida, filtroDescripcion, filtroEstatus]); // Dependencias
    // --- FIN Lógica de Filtrado ---

    // --- RENDERIZADO ---
    return (
        // Contenedor General Flexbox
        <div className="flex flex-col min-h-screen">
            {/* Reemplaza 'Menu' por 'DynamicMenu' si es necesario */}
            <Menu /> {/* <-- MENÚ ARRIBA */}

            {/* Contenedor Principal del Contenido */}
            {/* AJUSTA pt-XX según la altura real de tu menú */}
            <main className="flex-grow container mx-auto p-4 md:p-8 pt-20 md:pt-24 bg-gray-50"> {/* <-- AJUSTES: <main>, flex-grow, pt-XX, quitado mt-16 y min-h-screen */}
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Gestionar Mis Artículos / Servicios
                </h1>

                {/* Estado de carga/error inicial */}
                {loadingPage && <p className="text-center text-gray-600">Cargando...</p>}
                {errorPage && !loadingPage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong>Error: </strong><span className="block sm:inline">{errorPage}</span>
                    </div>
                )}

                {/* Contenido principal visible solo si hay ID de proveedor y sin error de página */}
                {!loadingPage && idProveedor && !errorPage && (
                    <>
                        {/* --- SECCIÓN DE FILTROS --- */}
                        <div className="mb-6 p-4 bg-white shadow rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {/* Filtro Partida */}
                            <div>
                                <label htmlFor="filtroPartida" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Partida:</label>
                                <select id="filtroPartida" value={filtroPartida} onChange={(e) => setFiltroPartida(e.target.value)} disabled={loadingPartidas || loadingArticulos || !!errorPartidas} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100">
                                    <option value="">-- Todas --</option>
                                    {loadingPartidas && <option disabled>Cargando...</option>}
                                    {!loadingPartidas && partidasCatalogo.map((p) => (<option key={p.codigo} value={p.codigo}>{p.codigo} - {p.descripcion}</option>))}
                                </select>
                                {errorPartidas && <p className="text-xs text-red-500 mt-1">{errorPartidas}</p>}
                            </div>
                            {/* Filtro Descripción */}
                            <div>
                                <label htmlFor="filtroDescripcion" className="block text-sm font-medium text-gray-700 mb-1">Buscar por Descripción:</label>
                                <input type="text" id="filtroDescripcion" value={filtroDescripcion} onChange={(e) => setFiltroDescripcion(e.target.value)} placeholder="Escriba para buscar..." className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" disabled={loadingArticulos} />
                            </div>
                            {/* Filtro Estatus */}
                            <div>
                                <label htmlFor="filtroEstatus" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estatus:</label>
                                <select id="filtroEstatus" value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)} disabled={loadingArticulos} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                    <option value="todos">Todos</option>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                        {/* --- FIN SECCIÓN DE FILTROS --- */}

                        {/* Botón Agregar */}
                        <div className="mb-4 text-right">
                            <button
                                onClick={() => handleOpenModal(null)}
                                disabled={loadingPartidas || !!errorPartidas}
                                className={`font-bold py-2 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${(loadingPartidas || !!errorPartidas) ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'}`}
                                title={(loadingPartidas || !!errorPartidas) ? "Cargando o error al cargar partidas" : "Agregar Nuevo Artículo"}
                            >
                                Agregar Nuevo Artículo
                            </button>
                            {errorPartidas && <p className="text-xs text-red-500 text-right mt-1">Error al cargar partidas: {errorPartidas}</p>}
                        </div>

                        {/* Error de carga/borrado de artículos */}
                        {errorArticulos && !loadingArticulos && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                                <strong>Error:</strong> {errorArticulos}
                            </div>
                        )}

                        {/* Tabla de Artículos */}
                        <TablaArticulos
                            articulos={articulosFiltrados}
                            onEdit={handleOpenModal}
                            onDelete={handleDeleteArticulo}
                            isLoading={loadingArticulos} // Pasa el estado de carga a la tabla
                        />
                    </>
                )}

                {/* --- El Modal se renderiza fuera del flujo principal del <main> --- */}

            </main> {/* <-- FIN Contenedor Principal (<main>) */}

            <Pie /> {/* <-- PIE ABAJO */}

            {/* Modal para Crear/Editar Artículo (fuera de <main>) */}
            {/* Se renderiza condicionalmente pero su posición es manejada por CSS (fixed/absolute) */}
            {!loadingPage && idProveedor && !errorPage && ( // Asegurar que el modal solo se renderice si el proveedor es válido
                <ModalArticulo
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveArticulo}
                    initialData={editingArticulo}
                    isLoading={isSaving || loadingPartidas}
                    error={modalError}
                    idProveedor={idProveedor}
                    partidasDisponibles={partidasCatalogo}
                />
            )}

        </div> // <-- FIN Contenedor General
    );
}