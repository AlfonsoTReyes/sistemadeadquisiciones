// src/app/proveedores/articulos/TablaArticulos.tsx
import React from 'react';
import { ArticuloProveedor } from './interface'; // Ajusta la ruta si es necesario

interface TablaArticulosProps {
    articulos: ArticuloProveedor[];
    onEdit: (articulo: ArticuloProveedor) => void;
    onDelete: (idArticulo: number) => void;
    isLoading: boolean; // Para mostrar un estado de carga en la tabla
    // Podríamos añadir isLoadingDelete aquí si quisiéramos spinners individuales
}

const TablaArticulos: React.FC<TablaArticulosProps> = ({
    articulos,
    onEdit,
    onDelete,
    isLoading
}) => {

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    };

    const formatStock = (value: number): string => {
        // Formatea con separadores de miles, sin decimales si es entero
        return new Intl.NumberFormat('es-MX', {
            maximumFractionDigits: 2, // Ajusta si necesitas más decimales para stock
        }).format(value);
    };


    if (isLoading) {
        return <p className="text-center text-gray-500 py-5">Cargando artículos...</p>;
    }

    if (!articulos || articulos.length === 0) {
        return <p className="text-center text-gray-500 mt-6">No se encontraron artículos registrados para este proveedor.</p>;
    }

    return (
        <div className="overflow-x-auto shadow-md sm:rounded-lg mt-6">
            <table className="w-full text-sm text-left text-gray-500 ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
                    <tr>
                        <th scope="col" className="px-6 py-3">Descripción / Características</th>
                        <th scope="col" className="px-6 py-3">UDM</th>
                        <th scope="col" className="px-6 py-3 text-right">Stock</th>
                        <th scope="col" className="px-6 py-3 text-right">Precio Unitario</th>
                        <th scope="col" className="px-6 py-3 text-center">Estatus</th>
                        <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {articulos.map((articulo) => (
                        <tr key={articulo.id_articulo} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-pre-wrap max-w-sm"> {/* Permite saltos de línea y limita ancho */}
                                {articulo.descripcion}
                            </td>
                            <td className="px-6 py-4">
                                {articulo.unidad_medida}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {formatStock(Number(articulo.stock))} {/* Asegurar que sea número */}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {formatCurrency(Number(articulo.precio_unitario))} {/* Asegurar que sea número */}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    articulo.estatus
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {articulo.estatus ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                                <button
                                    onClick={() => onEdit(articulo)}
                                    className="font-medium text-blue-600 hover:underline"
                                    aria-label={`Editar artículo ${articulo.id_articulo}`}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => onDelete(articulo.id_articulo)}
                                    className="font-medium text-red-600 hover:underline"
                                     aria-label={`Eliminar artículo ${articulo.id_articulo}`}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TablaArticulos;