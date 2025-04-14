// src/app/catalogos/proveedores/ListaProveedoresCatalogo.tsx
import React from 'react';
import { ProveedorCatalogo } from './interface'; // Ajusta ruta

interface ListaProps {
    proveedores: ProveedorCatalogo[];
    isLoading: boolean;
}

const ListaProveedoresCatalogo: React.FC<ListaProps> = ({ proveedores, isLoading }) => {

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Placeholder de carga */}
                {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!proveedores || proveedores.length === 0) {
        return <p className="text-center text-gray-500 mt-10">No se encontraron proveedores que coincidan con los criterios de búsqueda.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {proveedores.map((proveedor) => (
                <div key={proveedor.id_proveedor} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow duration-300 flex flex-col">
                    <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-blue-700 mb-1">{proveedor.nombre_o_razon_social}</h3>
                        <p className="text-sm text-gray-600 mb-2">RFC: {proveedor.rfc}</p>
                        {proveedor.giro_comercial && <p className="text-sm text-gray-700 mb-1">Giro: {proveedor.giro_comercial}</p>}
                        {proveedor.correo && <p className="text-sm text-gray-700 mb-1">Correo: <a href={`mailto:${proveedor.correo}`} className="text-blue-600 hover:underline">{proveedor.correo}</a></p>}
                        {proveedor.telefono_uno && <p className="text-sm text-gray-700 mb-1">Teléfono: {proveedor.telefono_uno}</p>}
                        {proveedor.pagina_web && <p className="text-sm text-gray-700 mb-3">Web: <a href={proveedor.pagina_web.startsWith('http') ? proveedor.pagina_web : `http://${proveedor.pagina_web}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{proveedor.pagina_web}</a></p>}

                        {/* Partidas */}
                        {proveedor.partidas && proveedor.partidas.length > 0 && (
                            <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-800 mb-1">Partidas/Giros:</h4>
                                <div className="flex flex-wrap gap-1">
                                    {proveedor.partidas.map(partida => (
                                        <span key={partida.codigo_partida} title={partida.descripcion} className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
                                            {partida.codigo_partida}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Artículos/Servicios */}
                        {proveedor.articulos && proveedor.articulos.length > 0 && (
                            <div className="mt-auto pt-3 border-t border-gray-200"> {/* Empuja artículos abajo si hay espacio */}
                                <h4 className="text-sm font-medium text-gray-800 mb-2">Artículos/Servicios Destacados:</h4>
                                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 text-xs"> {/* Limita altura y scroll */}
                                    {proveedor.articulos.map(articulo => (
                                        <li key={articulo.id_producto} className="border-b border-gray-100 pb-1">
                                            <p className="font-semibold text-gray-700">{articulo.nombre_producto}</p>
                                            <p className="text-gray-600">{articulo.descripcion.substring(0, 100)}{articulo.descripcion.length > 100 ? '...' : ''}</p> {/* Limita descripción */}
                                            <p className="text-gray-500">UDM: {articulo.unidad_medida} - Precio: {formatCurrency(articulo.precio)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {proveedor.articulos && proveedor.articulos.length === 0 && (
                             <p className="text-xs text-gray-400 mt-4 italic">Este proveedor no tiene artículos registrados.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListaProveedoresCatalogo;