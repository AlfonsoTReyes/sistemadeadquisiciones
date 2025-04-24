// src/app/catalogos/proveedores/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Podría no ser necesario aquí
import Menu from '../menu_principal'; // Ajusta ruta
import Pie from "../pie"; // Ajusta ruta
import ListaProveedoresCatalogo from './formularios/ListaProveedoresCatalogo'; // Importa el componente de lista

// Importa las funciones fetch para este catálogo
import {
    fetchPartidasParaFiltro,
    fetchCatalogoProveedores
} from './formularios/fetchCatologoProveedores'; // Ajusta ruta

// Importa las interfaces
import { ProveedorCatalogo, CatalogoPartidaFiltro } from './interface'; // Ajusta ruta

export default function CatalogoProveedoresPage() {
    const router = useRouter(); // Mantener por si se necesita en el futuro

    // Estados
    const [proveedores, setProveedores] = useState<ProveedorCatalogo[]>([]);
    const [partidasFiltro, setPartidasFiltro] = useState<CatalogoPartidaFiltro[]>([]);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>(''); // Almacena el código de partida seleccionado

    // Estados de Carga
    const [loadingProveedores, setLoadingProveedores] = useState<boolean>(true);
    const [loadingFiltros, setLoadingFiltros] = useState<boolean>(true);

    // Estados de Error
    const [errorProveedores, setErrorProveedores] = useState<string | null>(null);
    const [errorFiltros, setErrorFiltros] = useState<string | null>(null);

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

    // 2. Función para cargar (o recargar) la lista de proveedores
    const cargarProveedores = useCallback(async (codigoPartida: string | null) => {
        console.log(`PAGE: Cargando catálogo de proveedores. Filtro: ${codigoPartida ?? 'Todos'}`);
        setLoadingProveedores(true);
        setErrorProveedores(null);
        try {
            const data = await fetchCatalogoProveedores(codigoPartida);
            setProveedores(data || []);
        } catch (err: any) {
            console.error("Error al cargar catálogo de proveedores:", err);
            setErrorProveedores(err.message || 'Error al cargar proveedores.');
            setProveedores([]);
        } finally {
            setLoadingProveedores(false);
        }
    }, []); // No necesita dependencias si siempre se llama manualmente

    // 3. Cargar proveedores inicialmente (sin filtro) después de cargar filtros
    useEffect(() => {
        if (!loadingFiltros) { // Solo carga proveedores una vez que los filtros estén listos (o hayan fallado)
            cargarProveedores(null); // Carga inicial sin filtro
        }
    }, [loadingFiltros, cargarProveedores]);

    // 4. Handler para el cambio en el select de filtro
    const handleFiltroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoFiltro = event.target.value;
        setFiltroSeleccionado(nuevoFiltro);
        // Llama a cargarProveedores con el nuevo filtro (o null si se selecciona "Todos")
        cargarProveedores(nuevoFiltro === '' ? null : nuevoFiltro);
    };

    // --- RENDERIZADO ---
    return (
        <div>
            <Menu />
            <div className="container mx-auto min-h-screen p-4 md:p-8 mt-16 bg-gray-100"> {/* Ajusta margen si es necesario */}
                <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                    Catálogo de Proveedores
                </h1>

                {/* Sección de Filtro */}
                <div className="mb-6 p-4 bg-white shadow rounded-lg">
                    <label htmlFor="filtroPartida" className="block text-sm font-medium text-gray-700 mb-1">
                        Filtrar por Partida / Giro:
                    </label>
                    <select
                        id="filtroPartida"
                        value={filtroSeleccionado}
                        onChange={handleFiltroChange}
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

                {/* Mensaje de Error General al cargar proveedores */}
                {errorProveedores && !loadingProveedores && (
                    <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                        <strong>Error al cargar proveedores:</strong> {errorProveedores}
                    </div>
                )}

                {/* Lista de Proveedores */}
                <ListaProveedoresCatalogo
                    proveedores={proveedores}
                    isLoading={loadingProveedores}
                />

            </div>
            <Pie />
        </div>
    );
}