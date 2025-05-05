// src/components/tablas_comparativas/SelectorProductosServicios.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArticuloCatalogo } from '@/types/catalogoProveedores';
// *** CAMBIO: Importar la nueva función fetch real ***
import { searchArticulosPorProveedor } from '@/fetch/articulosFetch'; // Ajusta la ruta
import { debounce } from 'lodash';

interface SelectorProductosServiciosProps {
    idProveedor: number;
    onSelectItem: (item: ArticuloCatalogo) => void;
    excludedItemIds?: number[];
}

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

    const debouncedFetch = useCallback(
        debounce(async (term: string) => {
            // La validación de longitud mínima ahora la hace el fetcher/API
            // if (term.length < 3) { setResults([]); setIsLoading(false); return; }

            setIsLoading(true);
            setError(null);
            try {
                // *** CAMBIO: Usar la función fetch real ***
                const fetchedItems = await searchArticulosPorProveedor(idProveedor, term);
                // Filtrar los ya excluidos (se mantiene esta lógica aquí)
                setResults(fetchedItems.filter(item => !excludedItemIds?.includes(item.id_articulo)));

            } catch (err: any) {
                console.error("Error fetching items:", err);
                setError(err.message || 'Error al buscar artículos.');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500), // Ajusta el tiempo de debounce si es necesario
        [idProveedor, excludedItemIds]
    );

    useEffect(() => {
        // Llama a debouncedFetch solo si hay término (o ajusta si quieres buscar al inicio)
        if (searchTerm.trim().length >= 3) {
            debouncedFetch(searchTerm);
        } else {
            // Si el término es corto, limpiar resultados y cancelar fetch pendiente
            setResults([]);
            debouncedFetch.cancel();
            setIsLoading(false); // Asegurar que no se quede cargando
        }
        return () => debouncedFetch.cancel();
    }, [searchTerm, debouncedFetch]);

    // Resetear al cambiar proveedor
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

    // --- Renderizado (sin cambios funcionales) ---
    return (
        <div className="relative w-full md:w-1/2 mt-4">
            <label htmlFor={`item-search-${idProveedor}`} className="block text-sm font-medium text-gray-700">
                Buscar Producto/Servicio {/* (Proveedor ID: {idProveedor}) Ya no es necesario mostrar ID aquí */}
            </label>
            <input
                type="text"
                id={`item-search-${idProveedor}`}
                placeholder="Buscar por descripción (mín. 3 caracteres)..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                // Considerar onBlur para cerrar el dropdown
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {isOpen && (searchTerm.length >= 3 || isLoading || error || results.length > 0) && ( // Mostrar si hay término largo, carga, error o resultados
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && <div className="p-2 text-gray-500 text-sm italic">Buscando...</div>}
                    {error && <div className="p-2 text-red-500 text-sm">{error}</div>}
                    {!isLoading && !error && results.length === 0 && searchTerm.length >= 3 && (
                        <div className="p-2 text-gray-500 text-sm italic">No se encontraron artículos.</div>
                    )}
                    {!isLoading && !error && results.map((item) => (
                        <div
                            key={item.id_articulo}
                            onClick={() => handleSelect(item)}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {item.descripcion} <span className="text-xs text-gray-500">(UDM: {item.unidad_medida}, PU: {item.precio_unitario.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })})</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};