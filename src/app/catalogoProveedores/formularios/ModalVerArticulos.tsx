// src/app/catalogos/proveedores/ModalVerArticulos.tsx
import React, { useState, useMemo } from 'react'; // Importa useState y useMemo
import { ArticuloCatalogo } from './interface'; // Ajusta la ruta

interface ModalVerArticulosProps {
    isOpen: boolean;
    onClose: () => void;
    articulos: ArticuloCatalogo[];
    nombreProveedor: string;
}

const ModalVerArticulos: React.FC<ModalVerArticulosProps> = ({
    isOpen,
    onClose,
    articulos, // La lista COMPLETA de artículos de este proveedor
    nombreProveedor,
}) => {
    // --- NUEVO ESTADO PARA EL FILTRO ---
    const [filtro, setFiltro] = useState('');
    // -----------------------------------

    const formatCurrency = (value: number): string => {
         if (isNaN(value) || value === null || value === undefined) return 'N/A';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    };

    // --- FILTRAR ARTÍCULOS BASADO EN EL ESTADO DEL FILTRO ---
    const articulosFiltrados = useMemo(() => {
        if (!filtro) {
            return articulos; // Si no hay filtro, muestra todos
        }
        const filtroLower = filtro.toLowerCase();
        return articulos.filter(articulo =>
            // Busca en la descripción (puedes añadir más campos si quieres)
            articulo.descripcion.toLowerCase().includes(filtroLower)
            // Opcional: buscar también en unidad de medida
            // || articulo.unidad_medida.toLowerCase().includes(filtroLower)
        );
    }, [articulos, filtro]); // Depende de la lista original y del texto del filtro
    // ------------------------------------------------------

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="relative mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
                    aria-label="Cerrar modal"
                >
                    ×
                </button>
                <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                    Artículos de: {nombreProveedor}
                </h3>

                <div className="mb-4">
                    <label htmlFor="filtroArticulosModal" className="sr-only">Filtrar artículos</label>
                    <input
                        type="text"
                        id="filtroArticulosModal"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        placeholder="Buscar por descripción..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
 

                <div className="mt-2 max-h-[55vh] overflow-y-auto"> 
                    {articulosFiltrados && articulosFiltrados.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0"><tr>
                                <th scope="col" className="px-4 py-2">Descripción</th>
                                <th scope="col" className="px-4 py-2">UDM</th>
                                <th scope="col" className="px-4 py-2 text-right">Precio Unitario</th>
                            </tr></thead>
                            <tbody>
                                {articulosFiltrados.map((articulo) => (
                                    <tr key={articulo.id_articulo} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-medium text-gray-900">{articulo.descripcion}</td>
                                        <td className="px-4 py-2">{articulo.unidad_medida}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(articulo.precio_unitario)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-5">
                            {articulos.length === 0
                                ? 'Este proveedor no tiene artículos activos registrados.'
                                : 'No se encontraron artículos que coincidan con el filtro.'}
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