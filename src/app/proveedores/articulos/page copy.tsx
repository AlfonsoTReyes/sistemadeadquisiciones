// src/app/proveedores/articulos/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Menu from '../../menu_principal'; // Ajusta ruta
import Pie from "../../pie"; // Ajusta ruta
import TablaArticulos from './tablaArticulos'; // Importa la tabla
import ModalArticulo from './formularios/modalArtuculo'; // Importa el modal

// Importa las funciones fetch
import {
    fetchArticulosProveedor,
    createArticuloProveedorFetch,
    updateArticuloProveedorFetch,
    deleteArticuloProveedorFetch
} from './formularios/fetchArticulos'; // Ajusta ruta

// Importa las interfaces
import { ArticuloProveedor, ArticuloFormData } from './interface'; // Ajusta ruta

export default function GestionArticulosProveedorPage() {
    const router = useRouter();

    // Estados principales
    const [idProveedor, setIdProveedor] = useState<number | null>(null);
    const [articulos, setArticulos] = useState<ArticuloProveedor[]>([]);

    // Estados de Carga
    const [loadingPage, setLoadingPage] = useState<boolean>(true); // Carga inicial ID Proveedor
    const [loadingArticulos, setLoadingArticulos] = useState<boolean>(false); // Carga de la tabla
    const [isSaving, setIsSaving] = useState<boolean>(false); // Carga del modal (Crear/Actualizar)
    const [isDeleting, setIsDeleting] = useState<number | null>(null); // ID del artículo que se está borrando

    // Estados de Error
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [errorArticulos, setErrorArticulos] = useState<string | null>(null); // Error al cargar/borrar tabla
    const [modalError, setModalError] = useState<string | null>(null); // Error a mostrar en el modal

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticulo, setEditingArticulo] = useState<ArticuloProveedor | null>(null); // null para crear, objeto para editar

    // 1. Obtener idProveedor desde sessionStorage
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
                errorFound = "No se encontró ID de proveedor en sesión. Por favor, inicie sesión.";
            }
        } else { errorFound = "Entorno no válido."; }

        if (errorFound) {
            setErrorPage(errorFound);
            setIdProveedor(null);
            // Podrías redirigir al login o mostrar un mensaje más prominente
        } else {
            setIdProveedor(providerIdFound);
            setErrorPage(null);
        }
        setLoadingPage(false);
    }, [router]); // Quitar router si no se usa para redirigir aquí

    // 2. Función para cargar/recargar artículos
    const cargarArticulos = useCallback(async () => {
        if (!idProveedor) {
            setArticulos([]);
            return;
        };
        console.log(`PAGE: Cargando artículos para proveedor ${idProveedor}`);
        setLoadingArticulos(true);
        setErrorArticulos(null);
        try {
            // Decidimos si cargar solo activos o todos (aquí cargamos todos por defecto para el CRUD)
            const data = await fetchArticulosProveedor(idProveedor, false); // false para obtener activos e inactivos
            setArticulos(data || []);
        } catch (err: any) {
            console.error("Error al cargar artículos:", err);
            setErrorArticulos(err.message || 'Error al cargar la lista de artículos.');
            setArticulos([]);
        } finally {
            setLoadingArticulos(false);
        }
    }, [idProveedor]); // Depende de idProveedor

    // 3. Efecto para cargar artículos cuando idProveedor esté listo
    useEffect(() => {
        if (idProveedor && !loadingPage) {
            cargarArticulos();
        }
    }, [idProveedor, loadingPage, cargarArticulos]);

    // --- Funciones para el Modal ---
    const handleOpenModal = (articulo: ArticuloProveedor | null = null) => {
        console.log(articulo ? `PAGE: Abriendo modal para editar artículo ID: ${articulo.id_articulo}` : 'PAGE: Abriendo modal para crear artículo');
        setEditingArticulo(articulo); // null para crear, objeto para editar
        setModalError(null);      // Limpiar errores previos del modal
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingArticulo(null);
        setModalError(null);
    };

    // --- Función de Guardado (se pasa al Modal como onSubmit) ---
    const handleSaveArticulo = async (formDataWithIds: ArticuloFormData & { id_proveedor: number, id_articulo?: number }) => {
        setIsSaving(true);
        setModalError(null);
        const isEditing = !!formDataWithIds.id_articulo;
        console.log(`PAGE: Intentando ${isEditing ? 'actualizar' : 'crear'} artículo. Data:`, formDataWithIds);

        try {
            if (isEditing) {
                // Actualizar
                 if (!formDataWithIds.id_articulo) { // Doble chequeo
                      throw new Error("Falta ID del artículo para actualizar.");
                 }
                 // Prepara el payload para actualizar (puede que no necesites pasar id_articulo en el body si está en la URL)
                 const updatePayload = {
                     id_proveedor: formDataWithIds.id_proveedor, // Necesario para PUT API
                     descripcion: formDataWithIds.descripcion,
                     unidad_medida: formDataWithIds.unidad_medida,
                     stock: formDataWithIds.stock, // Ya es número desde el modal
                     precio_unitario: formDataWithIds.precio_unitario, // Ya es número
                     estatus: formDataWithIds.estatus
                 };
                await updateArticuloProveedorFetch(formDataWithIds.id_articulo, updatePayload);
                alert("Artículo actualizado correctamente.");
            } else {
                // Crear
                 const createPayload = {
                     id_proveedor: formDataWithIds.id_proveedor, // Necesario para POST API
                     descripcion: formDataWithIds.descripcion,
                     unidad_medida: formDataWithIds.unidad_medida,
                     stock: formDataWithIds.stock, // Ya es número
                     precio_unitario: formDataWithIds.precio_unitario, // Ya es número
                     estatus: formDataWithIds.estatus
                 };
                await createArticuloProveedorFetch(createPayload);
                alert("Artículo agregado correctamente.");
            }
            handleCloseModal(); // Cierra el modal en caso de éxito
            await cargarArticulos(); // Recarga la lista de artículos

        } catch (err: any) {
            console.error(`Error al ${isEditing ? 'actualizar' : 'crear'} artículo:`, err);
            setModalError(err.message || `Ocurrió un error al ${isEditing ? 'actualizar' : 'crear'}.`);
            // No cerramos el modal si hay error, para que el usuario vea el mensaje
        } finally {
            setIsSaving(false);
        }
    };

    // --- Función de Eliminación ---
    const handleDeleteArticulo = async (idArticulo: number) => {
        if (!idProveedor) {
            setErrorArticulos("No se puede eliminar, falta el ID del proveedor.");
            return;
        }
        // Buscar el artículo para mostrar su descripción en la confirmación
        const articuloAEliminar = articulos.find(a => a.id_articulo === idArticulo);
        const confirmacion = window.confirm(
            `¿Está seguro de que desea eliminar el artículo "${articuloAEliminar?.descripcion || `ID ${idArticulo}`}"? Esta acción no se puede deshacer.`
        );

        if (confirmacion) {
            console.log(`PAGE: Intentando eliminar artículo ID: ${idArticulo} para proveedor ID: ${idProveedor}`);
            setIsDeleting(idArticulo); // Marcar como borrando (para posible spinner)
            setErrorArticulos(null);
            try {
                await deleteArticuloProveedorFetch(idArticulo, idProveedor);
                alert("Artículo eliminado correctamente.");
                await cargarArticulos(); // Recargar la lista
            } catch (err: any) {
                console.error("Error al eliminar artículo:", err);
                setErrorArticulos(err.message || "Error al eliminar el artículo.");
            } finally {
                setIsDeleting(null); // Quitar marca de borrando
            }
        }
    };


    // --- RENDERIZADO ---
    return (
        <div>
            <Menu />
            <div className="container mx-auto min-h-screen p-4 md:p-8 mt-16 bg-gray-50">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Gestionar Mis Artículos / Servicios
                </h1>

                {/* Mensajes de estado inicial */}
                {loadingPage && <p className="text-center text-gray-600">Cargando...</p>}
                {errorPage && !loadingPage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong>Error: </strong><span className="block sm:inline">{errorPage}</span>
                    </div>
                )}

                {/* Contenido principal (solo si hay ID de proveedor) */}
                {!loadingPage && idProveedor && !errorPage && (
                    <>
                        <div className="mb-4 text-right">
                            <button
                                onClick={() => handleOpenModal(null)} // null para indicar creación
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Agregar Nuevo Artículo
                            </button>
                        </div>

                        {/* Mensaje de error de la tabla/lista */}
                         {errorArticulos && !loadingArticulos && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                                <strong>Error:</strong> {errorArticulos}
                            </div>
                         )}

                        {/* Tabla de Artículos */}
                        <TablaArticulos
                            articulos={articulos}
                            onEdit={handleOpenModal} // Pasa la misma función para abrir modal en modo edición
                            onDelete={handleDeleteArticulo}
                            isLoading={loadingArticulos} // Pasa el estado de carga de la tabla
                            // Podrías pasar isDeleting para mostrar un spinner en la fila que se borra
                        />
                    </>
                )}

                 {/* Modal para Crear/Editar Artículo */}
                 <ModalArticulo
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleSaveArticulo}
                    initialData={editingArticulo} // Pasa el artículo a editar o null
                    isLoading={isSaving} // Pasa el estado de carga del guardado
                    error={modalError} // Pasa el error específico del modal
                    idProveedor={idProveedor} // Pasa el ID del proveedor para usar al crear
                 />

            </div>
            <Pie />
        </div>
    );
}