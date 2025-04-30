// src/components/tablas_comparativas/SelectorProveedores.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProveedorDetallado } from '@/types/proveedor'; // Asume que tienes este tipo definido
// import { fetchProveedoresParaSelector } from '@/fetch/proveedoresFetch'; // Necesitarás una función fetch
import { debounce } from 'lodash'; // Necesitas instalar lodash: npm install lodash @types/lodash

interface SelectorProveedoresProps {
    onSelectProveedor: (proveedor: ProveedorDetallado) => void;
    excludedIds?: number[]; // IDs de proveedores ya añadidos para no mostrarlos
}

// Mock de función fetch (reemplazar con la real)
const fetchProveedoresParaSelector = async (term: string): Promise<Proveedor[]> => {
    console.log("Fetching providers for term:", term);
    // Simulación: Reemplazar con llamada a /api/proveedores?search=... o similar
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
     if (!term) return [];
    const mockProveedores: Proveedor[] = [
        { id_proveedor: 101, rfc: 'XAXX010101000', nombre_o_razon_social: `Proveedor ${term} A`, /* otros campos */ },
        { id_proveedor: 102, rfc: 'XEXX010101000', nombre_o_razon_social: `Proveedor ${term} B`, /* otros campos */ },
    ];
    return mockProveedores;
}


export const SelectorProveedores: React.FC<SelectorProveedoresProps> = ({ onSelectProveedor, excludedIds = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false); // Para controlar visibilidad del dropdown

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(
        debounce(async (term: string) => {
            if (term.length < 3) { // No buscar si el término es muy corto
                setResults([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                // // TODO: Implementar fetch real, pasando el término de búsqueda
                const fetchedProveedores = await fetchProveedoresParaSelector(term);
                 // Filtrar los ya excluidos
                 setResults(fetchedProveedores.filter(p => !excludedIds.includes(p.id_proveedor)));

            } catch (err: any) {
                console.error("Error fetching providers:", err);
                setError(err.message || 'Error al buscar proveedores.');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 500), // Debounce de 500ms
        [excludedIds] // Depende de excludedIds para refiltrar si cambia
    );

    useEffect(() => {
        debouncedFetch(searchTerm);
        // Cleanup del debounce al desmontar o cambiar la función
        return () => debouncedFetch.cancel();
    }, [searchTerm, debouncedFetch]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setIsOpen(true); // Abrir dropdown al escribir
    };

    const handleSelect = (proveedor: Proveedor) => {
        onSelectProveedor(proveedor);
        setSearchTerm(''); // Limpiar input después de seleccionar
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full md:w-1/2">
            {/* // TODO: Aplicar estilos */}
            <label htmlFor="proveedor-search" className="block text-sm font-medium text-gray-700">
                Buscar y Agregar Proveedor
            </label>
            <input
                type="text"
                id="proveedor-search"
                placeholder="Buscar por nombre o RFC..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)} // Abrir al enfocar
                // onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Cerrar con delay para permitir click en item
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {isOpen && (searchTerm.length > 0 || isLoading || error || results.length > 0) && (
                 <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && <div className="p-2 text-gray-500">Buscando...</div>}
                    {error && <div className="p-2 text-red-500">{error}</div>}
                    {!isLoading && !error && results.length === 0 && searchTerm.length >= 3 && (
                        <div className="p-2 text-gray-500">No se encontraron proveedores.</div>
                    )}
                    {!isLoading && !error && results.map((proveedor) => (
                         <div
                            key={proveedor.id_proveedor}
                            onClick={() => handleSelect(proveedor)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {proveedor.nombre_o_razon_social} ({proveedor.rfc})
                        </div>
                    ))}
                </div>
             )}
             {/* // TODO: Botón para cerrar explícitamente o manejar onBlur correctamente */}
        </div>
    );
};