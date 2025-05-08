// --- URLs de API ---
// Endpoint para obtener la lista de proveedores para el catálogo (con filtro opcional)
const API_CATALOGO_PROVEEDORES_URL: string = "/api/catalogo/proveedores";
// Endpoint para obtener la lista de partidas (para el dropdown de filtro)
const API_CATALOGO_PARTIDAS_URL: string = "/api/catalogo/partidas";
import {CatalogoPartidaFiltro, ArticuloCatalogo, PartidaConArticulos, ProveedorCatalogo} from "../interface";

/**
 * Obtiene la lista completa de partidas genéricas (nivel 3) para el filtro.
 * Llama a GET /api/catalogo/partidas
 * @returns Array de partidas.
 * @throws Si la llamada fetch/API falla.
 */
export const fetchPartidasParaFiltro = async (): Promise<CatalogoPartidaFiltro[]> => {
    try {
        const response = await fetch(API_CATALOGO_PARTIDAS_URL, {
            cache: 'no-store',
        });

        if (!response.ok) {
            let errorData: { message?: string } = { message: `Error ${response.status}: ${response.statusText}` };
            try {
                const parsedError = await response.json();
                if (parsedError && typeof parsedError.message === 'string') {
                    errorData = parsedError;
                }
            } catch (e) { /* Ignorar */ }
            console.error(`FETCH Error GET ${API_CATALOGO_PARTIDAS_URL}: Status ${response.status}. Response:`, errorData);
            throw new Error(errorData.message || `Error al obtener catálogo de partidas: ${response.statusText}`);
        }

        const data: CatalogoPartidaFiltro[] = await response.json();

        return data.map(item => ({
            codigo: String(item.codigo),
            descripcion: String(item.descripcion),
        }));

    } catch (error: any) {
        const errorToThrow = error instanceof Error ? error : new Error(String(error || 'Error desconocido obteniendo partidas'));
        console.error("FETCH Exception en fetchPartidasParaFiltro:", errorToThrow.message);
        throw errorToThrow;
    }
};


/**
 * Obtiene la lista de proveedores activos con sus detalles (partidas y artículos).
 * Permite filtrar por código de partida.
 * Llama a GET /api/catalogo/proveedores[?codigo_partida=...]
 * @param codigoPartidaFiltro - El código de la partida para filtrar, o null/undefined para obtener todos.
 * @returns Una promesa que resuelve con un array de objetos ProveedorCatalogo.
 * @throws Si la llamada fetch/API falla.
 */
export const fetchCatalogoProveedores = async (
    codigoPartidaFiltro?: string | null
): Promise<ProveedorCatalogo[]> => {
    let apiUrl = API_CATALOGO_PROVEEDORES_URL;

    if (codigoPartidaFiltro) {
        const params = new URLSearchParams({ codigo_partida: codigoPartidaFiltro });
        apiUrl = `${API_CATALOGO_PROVEEDORES_URL}?${params.toString()}`;
    }

    try {
        const response = await fetch(apiUrl, { cache: 'no-store' });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data: any[] = await response.json();

        return data.map((proveedorData: any): ProveedorCatalogo => ({
            id_proveedor: Number(proveedorData.id_proveedor),
            nombre_empresa: proveedorData.nombre_empresa,
            rfc: proveedorData.rfc,
            nombre_o_razon_social: proveedorData.nombre_o_razon_social || proveedorData.nombre_empresa,
            giro_comercial: proveedorData.giro_comercial,
            correo: proveedorData.correo,
            partidas_asignadas: (proveedorData.partidas_asignadas || []).map((partidaData: any): PartidaConArticulos => ({
                codigo_partida: partidaData.codigo_partida,
                descripcion_partida: partidaData.descripcion_partida,
                articulos: (partidaData.articulos || []).map((articuloData: any): ArticuloCatalogo => ({
                    id_articulo: articuloData.id_articulo,
                    nombre_articulo: articuloData.nombre_articulo,
                    descripcion_articulo: articuloData.descripcion_articulo,
                })),
            })),
        }));
    } catch (error: any) {
        console.error("FETCH Exception:", error);
        throw new Error(error.message || 'Error desconocido al obtener el catálogo de proveedores');
    }
};