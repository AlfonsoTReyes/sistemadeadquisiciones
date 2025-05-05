// src/components/tablas_comparativas/SelectorProveedores.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Proveedor } from '@/types/proveedor'; // Tipo básico
import { searchProveedoresForSelector } from '@/fetch/proveedoresFetch'; // Ajusta la ruta si es necesario
import { debounce } from 'lodash';

interface SelectorProveedoresProps {
    onSelectProveedor: (proveedor: Proveedor) => void;
    excludedIds?: number[];
}

export const SelectorProveedores: React.FC<SelectorProveedoresProps> = ({ onSelectProveedor, excludedIds = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const debouncedFetch = useCallback(
        debounce(async (term: string) => {
            if (term.length < 3) {
                setResults([]); setIsLoading(false); return;
            }
            setIsLoading(true); setError(null);
            try {
                // *** CAMBIO: Usar la función fetch real ***
                const fetchedProveedores = await searchProveedoresForSelector(term);
                setResults(fetchedProveedores.filter(p => !excludedIds.includes(p.id_proveedor)));
            } catch (err: any) {
                console.error("Error searching providers:", err);
                setError(err.message || 'Error al buscar proveedores.');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500),
        [excludedIds]
    );

    useEffect(() => {
        debouncedFetch(searchTerm);
        return () => debouncedFetch.cancel();
    }, [searchTerm, debouncedFetch]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setIsOpen(true);
    };

    const handleSelect = (proveedor: Proveedor) => {
        onSelectProveedor(proveedor);
        setSearchTerm('');
        setResults([]);
        setIsOpen(false);
    };

    // --- Renderizado (sin cambios) ---
    return (
        <div className="relative w-full md:w-1/2">
            <label htmlFor="proveedor-search" className="block text-sm font-medium text-gray-700">
                Buscar y Agregar Proveedor
            </label>
            <input
                type="text"
                id="proveedor-search"
                placeholder="Buscar por nombre o RFC..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {isOpen && (searchTerm.length > 0 || isLoading || error || results.length > 0) && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && <div className="p-2 text-gray-500 text-sm">Buscando...</div>}
                    {error && <div className="p-2 text-red-500 text-sm">{error}</div>}
                    {!isLoading && !error && results.length === 0 && searchTerm.length >= 3 && (
                        <div className="p-2 text-gray-500 text-sm">No se encontraron proveedores.</div>
                    )}
                    {!isLoading && !error && results.map((proveedor) => (
                        <div
                            key={proveedor.id_proveedor}
                            onClick={() => handleSelect(proveedor)}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                            {proveedor.nombre_o_razon_social} ({proveedor.rfc})
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};