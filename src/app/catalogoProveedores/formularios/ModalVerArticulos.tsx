// src/app/catalogos/proveedores/ModalVerArticulos.tsx
import React, { useState, useMemo } from 'react';
// Asegúrate que estas interfaces estén definidas correctamente o importadas
import { ArticuloCatalogo, CatalogoPartidaFiltro } from '../interface'; // Ajusta la ruta

interface ModalVerArticulosProps {
    isOpen: boolean;
    onClose: () => void;
    articulos: ArticuloCatalogo[]; // Ya incluye codigo_partida
    nombreProveedor: string;
    partidasCatalogo: CatalogoPartidaFiltro[]; // <-- NUEVA PROP: Para el filtro interno
}

const ModalVerArticulos: React.FC<ModalVerArticulosProps> = ({
    isOpen,
    onClose,
    articulos,
    nombreProveedor,
    partidasCatalogo, // <-- Recibir catálogo de partidas
}) => {
    // Estados para los filtros internos del modal
    const [filtroDescripcion, setFiltroDescripcion] = useState(''); // Renombrado para claridad
    const [filtroPartidaModal, setFiltroPartidaModal] = useState(''); // '' significa todas

    const formatCurrency = (value: number): string => {
        if (isNaN(value) || value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    };

    // Filtrar artículos basado en AMBOS filtros del modal
    const articulosFiltrados = useMemo(() => {
        let itemsFiltrados = articulos || []; // Empezar con todos los artículos pasados

        // 1. Filtrar por Descripción
        if (filtroDescripcion) {
            const descLower = filtroDescripcion.toLowerCase();
            itemsFiltrados = itemsFiltrados.filter(articulo =>
                (articulo.descripcion_articulo || '').toLowerCase().includes(descLower)
            );
        }

        // 2. Filtrar por Partida (sobre el resultado anterior)
        if (filtroPartidaModal) {
            itemsFiltrados = itemsFiltrados.filter(articulo =>
                articulo.codigo_partida === filtroPartidaModal
            );
        }

        return itemsFiltrados;
    }, [articulos, filtroDescripcion, filtroPartidaModal]); // Dependencias


    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            {/* Contenedor del Modal */}
            <div className="relative mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white"> {/* Un poco más ancho */}
                {/* Botón de Cierre */}
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
                    aria-label="Cerrar modal"
                > × </button>

                {/* Título */}
                <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                    Artículos de: {nombreProveedor}
                </h3>

                {/* --- Sección de Filtros del Modal --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded bg-gray-50">
                    {/* Filtro por Descripción */}
                    <div>
                        <label htmlFor="filtroArticulosDescModal" className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar por Descripción:
                        </label>
                        <input
                            type="text"
                            id="filtroArticulosDescModal"
                            value={filtroDescripcion}
                            onChange={(e) => setFiltroDescripcion(e.target.value)}
                            placeholder="Filtrar descripción..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    {/* Filtro por Partida */}
                    <div>
                        <label htmlFor="filtroArticulosPartidaModal" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrar por Partida:
                        </label>
                        <select
                            id="filtroArticulosPartidaModal"
                            value={filtroPartidaModal}
                            onChange={(e) => setFiltroPartidaModal(e.target.value)}
                            // Podrías deshabilitarlo si no hay partidas o artículos
                            className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">-- Todas las Partidas --</option>
                            {/* Opciones basadas en las partidas DISPONIBLES en el catálogo */}
                            {partidasCatalogo && partidasCatalogo.length > 0 ? (
                                partidasCatalogo.map((partida) => (
                                    <option key={partida.codigo} value={partida.codigo}>
                                        {partida.codigo} - {partida.descripcion}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Cargando partidas...</option>
                            )}
                            {/* Opcional: Podrías mostrar solo las partidas que realmente tienen los artículos de este proveedor */}
                        </select>
                    </div>
                </div>
                {/* --- Fin Sección de Filtros --- */}


                {/* Contenedor de la Tabla */}
                <div className="mt-2 max-h-[50vh] overflow-y-auto"> {/* Ajusta altura si es necesario */}
                    {articulosFiltrados && articulosFiltrados.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-1"><tr>
                                {/* Columna de Partida Añadida */}
                                <th scope="col" className="px-4 py-2">Partida</th>
                                <th scope="col" className="px-4 py-2">Descripción</th>
                                <th scope="col" className="px-4 py-2">UDM</th>
                                <th scope="col" className="px-4 py-2 text-right">Precio Unitario</th>
                            </tr></thead>
                            <tbody>
                                {articulosFiltrados.map((articulo) => (
                                    <tr key={articulo.id_articulo} className="bg-white border-b hover:bg-gray-50">
                                        {/* Celda de Partida Añadida */}
                                        <td className="px-4 py-2 text-xs text-gray-600">{articulo.codigo_partida}</td>
                                        <td className="px-4 py-2 font-medium text-gray-900">{articulo.descripcion_articulo}</td>
                                        <td className="px-4 py-2">{articulo.unidad_medida}</td>
                                        <td className="px-4 py-2 text-right">{articulo.precio_unitario}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-5">
                            {articulos.length === 0
                                ? 'Este proveedor no tiene artículos activos registrados.'
                                : 'No se encontraron artículos que coincidan con los filtros aplicados.'}
                        </p>
                    )}
                </div>

                {/* Botón de Cerrar abajo */}
                <div className="pt-4 flex justify-end border-t border-gray-200 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 text-sm font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalVerArticulos;