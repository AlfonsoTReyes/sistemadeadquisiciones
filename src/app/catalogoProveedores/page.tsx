// src/app/catalogos/proveedores/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Menu from '../menu'; // Ajusta ruta
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
    const [filtroPartidaSeleccionada, setFiltroPartidaSeleccionada] = useState<string>(''); // Para el <select> de partida
    const [filtroRfc, setFiltroRfc] = useState<string>(''); // <-- NUEVO
    const [filtroGiro, setFiltroGiro] = useState<string>(''); // <-- NUEVO
    const [filtroNombre, setFiltroNombre] = useState<string>(''); // <-- NUEVO
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
    // 4. Handler para el filtro de Partida (dispara recarga de API)
    const handleFiltroPartidaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoFiltro = event.target.value;
        setFiltroPartidaSeleccionada(nuevoFiltro);
        // Limpiar otros filtros de texto cuando cambia la partida? (Opcional)
        // setFiltroRfc('');
        // setFiltroGiro('');
        // setFiltroNombre('');
        cargarProveedores(nuevoFiltro === '' ? null : nuevoFiltro); // Llama a la API
    };

    // --- NUEVO: Lógica de Filtrado Frontend Combinada ---
    const proveedoresFiltrados = useMemo(() => {
        // Empezar con la lista obtenida de la API (ya filtrada por partida si aplica)
        let itemsFiltrados = [...proveedores];

        // Aplicar filtro RFC (frontend)
        if (filtroRfc) {
            const rfcLower = filtroRfc.toLowerCase().trim();
            itemsFiltrados = itemsFiltrados.filter(p =>
                p.rfc.toLowerCase().includes(rfcLower)
            );
        }

        // Aplicar filtro Giro Comercial (frontend)
        if (filtroGiro) {
            const giroLower = filtroGiro.toLowerCase().trim();
            itemsFiltrados = itemsFiltrados.filter(p =>
                (p.giro_comercial || '').toLowerCase().includes(giroLower) // Maneja null
            );
        }

        // Aplicar filtro Nombre/Razón Social (frontend)
        if (filtroNombre) {
            const nombreLower = filtroNombre.toLowerCase().trim();
            itemsFiltrados = itemsFiltrados.filter(p =>
                p.nombre_o_razon_social.toLowerCase().includes(nombreLower)
            );
        }

        return itemsFiltrados;
    }, [proveedores, filtroRfc, filtroGiro, filtroNombre]); // Dependencias: lista de API y filtros de texto

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
                <div className="mb-6 p-4 bg-white shadow rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Filtro Partida */}
                    <div>
                        <label htmlFor="filtroPartida" className="block text-sm font-medium text-gray-700 mb-1">
                            Partida / Giro:
                        </label>
                        <select
                            id="filtroPartida" value={filtroPartidaSeleccionada} onChange={handleFiltroPartidaChange}
                            disabled={loadingFiltros || loadingProveedores}
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Todas --</option>
                            {/* ... opciones de partidas ... */}
                            {!loadingFiltros && !errorFiltros && partidasFiltro.map((partida) => (
                                <option key={partida.codigo} value={partida.codigo}>
                                    {partida.codigo} - {partida.descripcion}
                                </option>
                            ))}
                        </select>
                        {errorFiltros && <p className="text-xs text-red-500 mt-1">{errorFiltros}</p>}
                    </div>

                    {/* Filtro RFC */}
                    <div>
                        <label htmlFor="filtroRfc" className="block text-sm font-medium text-gray-700 mb-1">
                            RFC:
                        </label>
                        <input
                            type="text" id="filtroRfc" value={filtroRfc}
                            onChange={(e) => setFiltroRfc(e.target.value)}
                            placeholder="Buscar por RFC..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={loadingProveedores}
                        />
                    </div>

                    {/* Filtro Nombre/Razón Social */}
                    <div>
                        <label htmlFor="filtroNombre" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre / Razón Social:
                        </label>
                        <input
                            type="text" id="filtroNombre" value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                            placeholder="Buscar por nombre..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={loadingProveedores}
                        />
                    </div>

                    {/* Filtro Giro Comercial */}
                    <div>
                        <label htmlFor="filtroGiro" className="block text-sm font-medium text-gray-700 mb-1">
                            Giro Comercial:
                        </label>
                        <input
                            type="text" id="filtroGiro" value={filtroGiro}
                            onChange={(e) => setFiltroGiro(e.target.value)}
                            placeholder="Buscar por giro..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={loadingProveedores}
                        />
                    </div>

                </div>

                {/* Mensaje de Error General (sin cambios) */}
                {errorProveedores && !loadingProveedores && (<div className="...">{errorProveedores}</div>)}

                {/* Lista de Proveedores (AHORA PASA EL NUEVO HANDLER) */}
                <ListaProveedoresCatalogo
                    proveedores={proveedoresFiltrados}
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
                        partidasCatalogo={partidasFiltro} // Usa la misma lista cargada para el filtro principal
                    />
                )}
                {/* ---------------------------------------- */}

            </div>
            <Pie />
        </div>
    );
}