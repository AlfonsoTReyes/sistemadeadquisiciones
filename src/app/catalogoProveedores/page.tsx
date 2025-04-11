// src/app/catalogos/proveedores/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Menu from '../menu_principal'; // Ajusta ruta
import Pie from "../pie"; // Ajusta ruta
import ListaProveedoresCatalogo from './formularios/ListaProveedoresCatalogo'; // Importa el componente de lista
import ModalVerArticulos from './formularios/ModalVerArticulos'; // <-- Importa el nuevo modal

// Importa las funciones fetch
import {
    fetchPartidasParaFiltro,
    fetchCatalogoProveedores
} from './formularios/fetchCatologoProveedores'; // Ajusta ruta

// Importa las interfaces
import { ProveedorCatalogo, CatalogoPartidaFiltro, ArticuloCatalogo } from './interface'; // Ajusta ruta

export default function CatalogoProveedoresPage() {
    const router = useRouter();

    // --- Estados existentes ---
    const [proveedores, setProveedores] = useState<ProveedorCatalogo[]>([]);
    const [partidasFiltro, setPartidasFiltro] = useState<CatalogoPartidaFiltro[]>([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>('');
    const [loadingProveedores, setLoadingProveedores] = useState<boolean>(true);
    const [loadingFiltros, setLoadingFiltros] = useState<boolean>(true);
    const [errorProveedores, setErrorProveedores] = useState<string | null>(null);
    const [errorFiltros, setErrorFiltros] = useState<string | null>(null);

    // --- NUEVOS ESTADOS PARA EL MODAL DE ARTÍCULOS ---
    const [isArticulosModalOpen, setIsArticulosModalOpen] = useState(false);
    const [articulosParaModal, setArticulosParaModal] = useState<ArticuloCatalogo[]>([]);
    const [proveedorModalNombre, setProveedorModalNombre] = useState<string>('');
    // --------------------------------------------------

    // 1. Cargar lista de partidas para el filtro al montar
    useEffect(() => {
        const cargarFiltros = async () => {
            setLoadingFiltros(true);
            setErrorFiltros(null);
            try {
                const data = await fetchPartidasParaFiltro();
                setPartidasFiltro(data || []);
            } catch (err: any) {
                console.error("Error al cargar partidas para filtro:", err);
                setErrorFiltros(err.message || 'Error al cargar filtros.');
            } finally {
                setLoadingFiltros(false);
            }
        };
        cargarFiltros();
    }, []); // Ejecutar solo una vez

    // 2. Cargar proveedores (sin cambios)
    const cargarProveedores = useCallback(async (codigoPartida: string | null) => {
        // ... (código igual) ...
        console.log(`PAGE: Cargando catálogo. Filtro: ${codigoPartida ?? 'Todos'}`);
        setLoadingProveedores(true); setErrorProveedores(null);
        try {
            const data = await fetchCatalogoProveedores(codigoPartida);
            setProveedores(data || []);
        } catch (err: any) {
            console.error("Error cargando proveedores:", err);
            setErrorProveedores(err.message || 'Error al cargar.');
            setProveedores([]);
        } finally { setLoadingProveedores(false); }
    }, []);

    // 3. Cargar inicial (sin cambios)
    useEffect(() => {
        if (!loadingFiltros) { cargarProveedores(null); }
    }, [loadingFiltros, cargarProveedores]);

    // 4. Handler filtro (sin cambios)
    const handleFiltroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoFiltro = event.target.value;
        setFiltroSeleccionado(nuevoFiltro);
        cargarProveedores(nuevoFiltro === '' ? null : nuevoFiltro);
    };

    // --- NUEVOS HANDLERS PARA MODAL DE ARTÍCULOS ---
    const handleVerArticulosClick = (proveedor: ProveedorCatalogo) => {
        console.log(`PAGE: Abriendo modal de artículos para proveedor: ${proveedor.nombre_o_razon_social} (ID: ${proveedor.id_proveedor})`);
        setArticulosParaModal(proveedor.articulos || []); // Pasa los artículos del proveedor clickeado
        setProveedorModalNombre(proveedor.nombre_o_razon_social || 'Proveedor'); // Pasa el nombre
        setIsArticulosModalOpen(true); // Abre el modal
    };

    const handleCloseArticulosModal = () => {
        setIsArticulosModalOpen(false);
        //Opcional: limpiar estados del modal al cerrar
        setArticulosParaModal([]);
        setProveedorModalNombre('');
    };
    // ----------------------------------------------

    // --- RENDERIZADO ---
    return (
        <div>
            <Menu />
            <div className="container mx-auto min-h-screen p-4 md:p-8 mt-16 bg-gray-100">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                    Catálogo de Proveedores
                </h1>

                {/* Sección de Filtro (sin cambios) */}
                <div className="mb-6 p-4 bg-white shadow rounded-lg">
                    {/* ... select de filtro ... */}
                     <label htmlFor="filtroPartida" className="block text-sm font-medium text-gray-700 mb-1">
                        Filtrar por Partida / Giro:
                    </label>
                    <select
                        id="filtroPartida" value={filtroSeleccionado} onChange={handleFiltroChange}
                        disabled={loadingFiltros || loadingProveedores}
                        className="block w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">-- Todas las Partidas --</option>
                        {loadingFiltros && <option disabled>Cargando filtros...</option>}
                        {errorFiltros && <option disabled>Error al cargar filtros</option>}
                        {!loadingFiltros && !errorFiltros && partidasFiltro.map((partida) => (
                            <option key={partida.codigo} value={partida.codigo}>
                                {partida.codigo} - {partida.descripcion}
                            </option>
                        ))}
                    </select>
                    {errorFiltros && <p className="text-red-500 text-xs mt-1">{errorFiltros}</p>}
                </div>

                {/* Mensaje de Error General (sin cambios) */}
                {errorProveedores && !loadingProveedores && ( <div className="...">{errorProveedores}</div> )}

                {/* Lista de Proveedores (AHORA PASA EL NUEVO HANDLER) */}
                <ListaProveedoresCatalogo
                    proveedores={proveedores}
                    isLoading={loadingProveedores}
                    onVerArticulos={handleVerArticulosClick} // <-- Pasa la función handler
                />

                 {/* --- RENDERIZADO CONDICIONAL DEL MODAL --- */}
                 {isArticulosModalOpen && (
                     <ModalVerArticulos
                         isOpen={isArticulosModalOpen}
                         onClose={handleCloseArticulosModal}
                         articulos={articulosParaModal}
                         nombreProveedor={proveedorModalNombre}
                     />
                 )}
                 {/* ---------------------------------------- */}

            </div>
            <Pie />
        </div>
    );
}