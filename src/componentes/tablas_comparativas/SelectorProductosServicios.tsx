// src/components/tablas_comparativas/SelectorProductosServicios.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArticuloCatalogo } from '@/types/catalogoProveedores'; // Asume que tienes este tipo de tu otro servicio
// import { fetchArticulosPorProveedor } from '@/fetch/articulosFetch'; // Necesitarás una función fetch
import { debounce } from 'lodash';

interface SelectorProductosServiciosProps {
    idProveedor: number; // Proveedor para el cual buscar artículos
    onSelectItem: (item: ArticuloCatalogo) => void;
    excludedItemIds?: number[]; // IDs de artículos ya añadidos para este proveedor
}

// Mock de función fetch (reemplazar con la real)
const fetchArticulosPorProveedor = async (idProveedor: number, term: string): Promise<ArticuloCatalogo[]> => {
    console.log(`Fetching items for provider ${idProveedor} with term: ${term}`);
    // Simulación: Reemplazar con llamada a /api/proveedores/[id]/articulos?search=...
    await new Promise(resolve => setTimeout(resolve, 400));
     if (!term) return [];
    const mockItems: ArticuloCatalogo[] = [
        { id_articulo: 201, codigo_partida: '21101', descripcion: `Artículo ${term} X para Prov ${idProveedor}`, unidad_medida: 'PZA', precio_unitario: 100.50 },
        { id_articulo: 202, codigo_partida: '21101', descripcion: `Servicio ${term} Y para Prov ${idProveedor}`, unidad_medida: 'SERV', precio_unitario: 500.00 },
    ];
    return mockItems;
};

export const SelectorProductosServicios: React.FC<SelectorProductosServiciosProps> = ({
    idProveedor,
    onSelectItem,
    excludedItemIds = [],
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<ArticuloCatalogo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
     const [isOpen, setIsOpen] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(
        debounce(async (term: string) => {
            if (term.length < 3) {
                setResults([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                // // TODO: Implementar fetch real
                const fetchedItems = await fetchArticulosPorProveedor(idProveedor, term);
                // Filtrar los ya excluidos
                setResults(fetchedItems.filter(item => !excludedItemIds.includes(item.id_articulo)));

            } catch (err: any) {
                console.error("Error fetching items:", err);
                setError(err.message || 'Error al buscar artículos.');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500),
        [idProveedor, excludedItemIds] // Depende de idProveedor y excludedItemIds
    );

    useEffect(() => {
        debouncedFetch(searchTerm);
        return () => debouncedFetch.cancel();
    }, [searchTerm, debouncedFetch]);

     // Resetear si el proveedor cambia
     useEffect(() => {
        setSearchTerm('');
        setResults([]);
        setError(null);
        setIsOpen(false);
    }, [idProveedor]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setIsOpen(true);
    };

    const handleSelect = (item: ArticuloCatalogo) => {
        onSelectItem(item);
        setSearchTerm('');
        setResults([]);
        setIsOpen(false);
    };

    return (
         <div className="relative w-full md:w-1/2 mt-4"> {/* // TODO: Ajustar layout y estilos */}
             <label htmlFor={`item-search-${idProveedor}`} className="block text-sm font-medium text-gray-700">
                 Buscar Producto/Servicio (Proveedor ID: {idProveedor})
            </label>
             <input
                type="text"
                id={`item-search-${idProveedor}`}
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {isOpen && (searchTerm.length > 0 || isLoading || error || results.length > 0) && (
                 <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && <div className="p-2 text-gray-500">Buscando...</div>}
                    {error && <div className="p-2 text-red-500">{error}</div>}
                    {!isLoading && !error && results.length === 0 && searchTerm.length >= 3 && (
                        <div className="p-2 text-gray-500">No se encontraron artículos.</div>
                    )}
                    {!isLoading && !error && results.map((item) => (
                         <div
                            key={item.id_articulo}
                            onClick={() => handleSelect(item)}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                             {item.descripcion} (UDM: {item.unidad_medida}, PU: ${item.precio_unitario.toFixed(2)})
                        </div>
                    ))}
                </div>
             )}
        </div>
    );
};