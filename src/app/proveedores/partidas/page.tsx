// src/app/proveedores/partidas/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from 'react'; // useCallback removed
import { useRouter } from 'next/navigation';
import Menu from '../../menu_proveedor';
import Pie from "../../pie";

import {
    fetchAllSelectablePartidas,
    fetchProveedorPartidas,
    syncProveedorPartidasFetch
} from './formularios/fetchPartidas';

// ProveedorPartidaSeleccionada removed as it was unused
import { CatalogoPartida } from './interface';

export default function GestionPartidasProveedorPage() {
    const router = useRouter();

    const [idProveedor, setIdProveedor] = useState<number | null>(null);
    const [catalogoCompleto, setCatalogoCompleto] = useState<CatalogoPartida[]>([]);
    const [partidasSeleccionadasCodigos, setPartidasSeleccionadasCodigos] = useState<string[]>([]);
    const [filtroBusqueda, setFiltroBusqueda] = useState('');
    const [mostrarSoloSeleccionadas, setMostrarSoloSeleccionadas] = useState<boolean>(false);

    const [loadingPage, setLoadingPage] = useState<boolean>(true);
    const [loadingCatalogo, setLoadingCatalogo] = useState<boolean>(false);
    const [loadingSeleccionadas, setLoadingSeleccionadas] = useState<boolean>(false);
    const [loadingSync, setLoadingSync] = useState<boolean>(false);

    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [errorData, setErrorData] = useState<string | null>(null);
    const [errorSync, setErrorSync] = useState<string | null>(null);

    useEffect(() => {
        let providerIdFound: number | null = null;
        let errorFound: string | null = null;
        if (typeof window !== "undefined") {
            const storedId = sessionStorage.getItem("proveedorId");
            if (storedId) {
                const parsedId = parseInt(storedId, 10);
                providerIdFound = !isNaN(parsedId) ? parsedId : null;
                if (!providerIdFound) errorFound = "ID de proveedor inválido.";
            } else {
                errorFound = "No se encontró ID de proveedor en sesión.";
            }
        } else { errorFound = "Entorno no válido."; }
        if (errorFound) { setErrorPage(errorFound); setIdProveedor(null); }
        else { setIdProveedor(providerIdFound); setErrorPage(null); }
        setLoadingPage(false);
    }, [router]); // router dependency is fine if you might navigate based on error

    useEffect(() => {
        if (!idProveedor || loadingPage) return;
        const cargarDatosIniciales = async () => {
            setLoadingCatalogo(true); setLoadingSeleccionadas(true); setErrorData(null);
            try {
                const [catalogoData, seleccionadasData] = await Promise.all([
                    fetchAllSelectablePartidas(),
                    fetchProveedorPartidas(idProveedor)
                ]);
                setCatalogoCompleto(catalogoData || []);
                const codigos = seleccionadasData?.map(p => p.codigo_partida) || [];
                setPartidasSeleccionadasCodigos(codigos);
            } catch (errUnknown: unknown) { // CORREGIDO: any -> unknown
                console.error("Error al cargar datos:", errUnknown);
                if (errUnknown instanceof Error) {
                    setErrorData(errUnknown.message || 'Error al cargar datos.');
                } else {
                    setErrorData('Ocurrió un error desconocido al cargar datos.');
                }
                setCatalogoCompleto([]); setPartidasSeleccionadasCodigos([]);
            } finally {
                setLoadingCatalogo(false); setLoadingSeleccionadas(false);
            }
        };
        cargarDatosIniciales();
    }, [idProveedor, loadingPage]);

    const catalogoFiltradoPorTexto = useMemo(() => {
        if (!filtroBusqueda) return catalogoCompleto;
        const filtroLower = filtroBusqueda.toLowerCase();
        return catalogoCompleto.filter(partida =>
            partida.codigo.toLowerCase().includes(filtroLower) ||
            partida.descripcion.toLowerCase().includes(filtroLower)
        );
    }, [catalogoCompleto, filtroBusqueda]);

    const partidasParaMostrar = useMemo(() => {
        if (mostrarSoloSeleccionadas) {
            return catalogoCompleto.filter(partida =>
                partidasSeleccionadasCodigos.includes(partida.codigo)
            );
        } else {
            return catalogoFiltradoPorTexto;
        }
    }, [mostrarSoloSeleccionadas, catalogoCompleto, partidasSeleccionadasCodigos, catalogoFiltradoPorTexto]);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value: codigoPartida, checked } = event.target;
        setErrorSync(null);
        setPartidasSeleccionadasCodigos(prevCodigos => {
            if (checked) {
                return [...prevCodigos, codigoPartida];
            } else {
                return prevCodigos.filter(codigo => codigo !== codigoPartida);
            }
        });
    };

    const handleGuardarCambios = async () => {
        if (!idProveedor) {
            setErrorSync("ID de proveedor no disponible.");
            return;
        }
        setLoadingSync(true); setErrorSync(null);
        console.log("PAGE: Guardando partidas:", partidasSeleccionadasCodigos);
        try {
            await syncProveedorPartidasFetch(idProveedor, partidasSeleccionadasCodigos);
            alert("Partidas guardadas.");
        } catch (errUnknown: unknown) { // CORREGIDO: any -> unknown
            console.error("Error al guardar:", errUnknown);
            if (errUnknown instanceof Error) {
                setErrorSync(errUnknown.message || "Error al guardar.");
            } else {
                setErrorSync("Ocurrió un error desconocido al guardar.");
            }
        } finally {
            setLoadingSync(false);
        }
    };

    const handleMostrarSoloSeleccionadasChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMostrarSoloSeleccionadas(event.target.checked);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Menu />
            <main className="flex-grow container mx-auto p-4 md:p-8 pt-20 md:pt-24 bg-gray-50">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Gestionar Partidas/Giros Ofrecidos
                </h1>

                {loadingPage && <p className="text-center text-gray-600">Cargando...</p>}
                {errorPage && !loadingPage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong>Error: </strong><span className="block sm:inline">{errorPage}</span>
                    </div>
                )}

                {!loadingPage && idProveedor && !errorPage && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="mb-4 text-gray-700">
                            Marque las casillas de las partidas o giros que su empresa ofrece.
                        </p>

                        {(loadingCatalogo || loadingSeleccionadas) && (
                            <p className="text-blue-600 my-4">Cargando lista de partidas...</p>
                        )}
                        {errorData && !loadingCatalogo && !loadingSeleccionadas && (
                            <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                                <strong>Error al cargar datos:</strong> {errorData}
                            </div>
                        )}

                        {!errorData && !loadingCatalogo && (
                            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
                                <div className="flex-grow w-full sm:w-auto">
                                    <label htmlFor="filtroPartida" className="block text-sm font-medium text-gray-700 mb-1">Buscar Partida:</label>
                                    <input
                                        type="text"
                                        id="filtroPartida"
                                        value={filtroBusqueda}
                                        onChange={(e) => setFiltroBusqueda(e.target.value)}
                                        placeholder="Filtrar por código o descripción..."
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        disabled={loadingCatalogo || loadingSeleccionadas || mostrarSoloSeleccionadas}
                                    />
                                </div>
                                <div className="flex-shrink-0 pt-5">
                                    <div className="flex items-center">
                                        <input
                                            id="mostrarSeleccionadas"
                                            type="checkbox"
                                            checked={mostrarSoloSeleccionadas}
                                            onChange={handleMostrarSoloSeleccionadasChange}
                                            disabled={loadingCatalogo || loadingSeleccionadas}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor="mostrarSeleccionadas" className="ml-2 block text-sm text-gray-900">
                                            Mostrar solo seleccionadas ({partidasSeleccionadasCodigos.length})
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!errorData && !loadingCatalogo && !loadingSeleccionadas && (
                            <div className="mb-6 border border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto space-y-2">
                                {partidasParaMostrar.length > 0 ? (
                                    partidasParaMostrar.map((partida) => (
                                        <div key={partida.codigo} className="flex items-center">
                                            <input
                                                id={`partida-${partida.codigo}`}
                                                type="checkbox"
                                                value={partida.codigo}
                                                checked={partidasSeleccionadasCodigos.includes(partida.codigo)}
                                                onChange={handleCheckboxChange}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`partida-${partida.codigo}`} className="ml-2 block text-sm text-gray-900">
                                                {partida.codigo} - {partida.descripcion}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">
                                        {mostrarSoloSeleccionadas ? 'No hay partidas seleccionadas.' : catalogoCompleto.length === 0 ? 'No hay partidas disponibles en el catálogo.' : 'No se encontraron partidas con el filtro actual.'}
                                    </p>
                                )}
                            </div>
                        )}

                        {errorSync && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                                <strong>Error al guardar:</strong> {errorSync}
                            </div>
                        )}

                        <div className="text-right mt-6 border-t pt-4">
                            <button
                                onClick={handleGuardarCambios}
                                disabled={loadingSync || loadingCatalogo || loadingSeleccionadas || !!errorData}
                                className={`px-6 py-2 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(loadingSync || loadingCatalogo || loadingSeleccionadas || !!errorData)
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {loadingSync ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Pie />
        </div>
    );
}