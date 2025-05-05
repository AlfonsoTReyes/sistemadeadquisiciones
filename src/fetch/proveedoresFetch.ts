// src/fetch/contratosFetch.ts
import {Proveedor, ProveedorDetallado } from "@/types/proveedor"; // Ajusta la ruta
import { handleFetchResponse } from '@/lib/fetchUtils';
const PROVEEDORES_API_URL = "/api/proveedores"; // O '/api/usuariosProveedores' si tienes una ruta específica

/**
 * Obtiene el perfil detallado de un proveedor usando el ID del usuario asociado.
 * @param {number} idUsuarioProveedor - El ID del usuario logueado (de usuarios_proveedores).
 * @returns {Promise<ProveedorDetallado | null>} - El perfil del proveedor o null si no se encuentra.
 * @throws {Error} - Si el ID es inválido o hay un error de API.
 */
export const fetchProveedorByUserId = async (
    idUsuarioProveedor: number
): Promise<ProveedorDetallado | null> => {
    const logPrefix = `FETCH fetchProveedorByUserId (User ID: ${idUsuarioProveedor}):`;
    // Asume que tu API en /api/proveedores puede manejar un query param como ?userId=...
    // O ajusta la URL si tienes un endpoint dedicado como /api/usuariosProveedores/profile
    const apiUrl = `${PROVEEDORES_API_URL}?id_usuario_proveedor=${idUsuarioProveedor}`;

    if (typeof idUsuarioProveedor !== "number" || isNaN(idUsuarioProveedor)) {
        const errorMsg = `${logPrefix} Error: ID de usuario inválido.`;
        console.error(errorMsg);
        throw new Error("ID de usuario inválido.");
    }

    console.log(`${logPrefix} Calling GET ${apiUrl}`);

    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        // Si el usuario no tiene perfil asociado, la API podría devolver 404
        if (response.status === 404) {
            console.warn(
                `${logPrefix} Proveedor no encontrado (404) para este usuario.`
            );
            return null; // Indica que no se encontró perfil
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudo obtener el perfil del proveedor.`
            );
        }
        if (!data || typeof data !== "object" || data === null) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Respuesta inválida del servidor. Response:`,
                data
            );
            throw new Error(
                "Respuesta inesperada del servidor al obtener perfil del proveedor."
            );
        }

        console.log(`${logPrefix} Success. Profile data received.`);
        return data as ProveedorDetallado;
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido en fetch"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};
/**
 * Obtiene la lista de proveedores formateada para usar en un <select>.
 * @returns Promise<Array<{ id: number; label: string }>>
 */
export const fetchProveedoresForSelect = async (): Promise<
    { id: number; label: string }[]
> => {
    const logPrefix = "FETCH fetchProveedoresForSelect:";
    const apiUrl = `${PROVEEDORES_API_URL}?forSelect=true`; // <-- Usa el nuevo query param

    console.log(`${logPrefix} Calling GET ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store", // Quizás quieras cachear esta lista si no cambia mucho
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: Status ${response.status}. Response:`,
                data
            );
            throw new Error(
                data?.message ||
                `Error ${response.status}: No se pudo obtener la lista de proveedores.`
            );
        }
        if (!Array.isArray(data)) {
            console.error(
                `${logPrefix} Error GET ${apiUrl}: La respuesta no es un array. Response:`,
                data
            );
            throw new Error("Respuesta inesperada del servidor.");
        }

        console.log(`${logPrefix} Success. Received ${data.length} options.`);
        return data as { id: number; label: string }[];
    } catch (error) {
        const errorToThrow =
            error instanceof Error
                ? error
                : new Error(String(error || "Error desconocido"));
        console.error(`${logPrefix} Exception:`, errorToThrow.message);
        throw errorToThrow;
    }
};
/**
 * Busca proveedores por término de búsqueda para usar en selectores/autocompletado.
 * @param {string} term - Término de búsqueda (nombre, RFC, etc.). Mínimo 3 caracteres.
 * @returns {Promise<Proveedor[]>} - Array de proveedores básicos que coinciden.
 */
export const searchProveedoresForSelector = async (term: string): Promise<Proveedor[]> => {
    const logPrefix = `FETCH searchProveedoresForSelector (Term: ${term}):`;
    if (!term || term.length < 3) { return []; }
    const apiUrl = `${PROVEEDORES_API_URL}?search=${encodeURIComponent(term)}`;
    console.log(`${logPrefix} Calling GET ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        // Ahora handleFetchResponse está definido porque se importó
        return await handleFetchResponse<Proveedor[]>(response);
    } catch (error) {
        console.error(`${logPrefix} Exception caught.`);
        throw error;
    }
};