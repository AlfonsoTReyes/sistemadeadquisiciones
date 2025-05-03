// src/fetch/articulosFetch.ts

import { ArticuloCatalogo } from '@/types/catalogoProveedores';
import { handleFetchResponse } from '@/lib/fetchUtils';

export const searchArticulosPorProveedor = async (idProveedor: number, term: string): Promise<ArticuloCatalogo[]> => {
    const logPrefix = `FETCH searchArticulosPorProveedor (Prov ID: ${idProveedor}, Term: ${term}):`;

    if (isNaN(idProveedor) || idProveedor <= 0) {
        throw new Error("ID de proveedor inválido proporcionado al fetcher.");
    }
    // El servicio/API maneja la longitud mínima, pero podemos devolver vacío aquí también
    if (!term || term.trim().length < 3) {
        console.log(`${logPrefix} Search term too short, returning empty.`);
        return [];
    }

    const apiUrl = `/api/proveedores/${idProveedor}/articulos?search=${encodeURIComponent(term.trim())}`;
    console.log(`${logPrefix} Calling GET ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });
        return await handleFetchResponse<ArticuloCatalogo[]>(response);
    } catch (error) {
        console.error(`${logPrefix} Exception caught:`, error);
        throw error;
    }
};