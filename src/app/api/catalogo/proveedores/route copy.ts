import { NextRequest, NextResponse } from 'next/server';
// Ajusta la ruta a tu archivo de servicio real
import {
    getProveedoresConDetalles
} from '@/services/catalogoProveedoresService'; // O la ruta correcta a tu servicio

console.log("***** MODULE LOADED: /api/catalogo/proveedores/route.ts *****");

// --- GET: Obtener la lista de proveedores para el catálogo ---
// Opcionalmente filtra por partida: /api/catalogo/proveedores?codigo_partida=CODIGO
export async function GET(req: NextRequest) {
    console.log("--- HIT: GET /api/catalogo/proveedores ---");
    try {
        const { searchParams } = req.nextUrl;
        const codigoPartidaFiltro = searchParams.get("codigo_partida"); // Puede ser null

        // Validación opcional del parámetro (si se proporciona)
        if (codigoPartidaFiltro && typeof codigoPartidaFiltro !== 'string') {
             // Aunque get() devuelve string o null, una validación extra no hace daño
            console.error("API ROUTE GET /catalogo/proveedores: Invalid 'codigo_partida' format.");
            return NextResponse.json({ message: "El formato del parámetro 'codigo_partida' es inválido." }, { status: 400 });
        }

        console.log(`API ROUTE GET /catalogo/proveedores: Fetching provider catalog. Filter: ${codigoPartidaFiltro ?? 'None'}`);

        // Llamar al servicio, pasando el filtro (o null si no se especificó)
        const proveedoresConDetalles = await getProveedoresConDetalles(codigoPartidaFiltro);

        console.log(`API ROUTE GET /catalogo/proveedores: Found ${proveedoresConDetalles.length} providers matching criteria.`);
        // Devolver la lista completa de proveedores con sus detalles
        return NextResponse.json(proveedoresConDetalles);

    } catch (error: any) {
        console.error("API ROUTE GET /catalogo/proveedores Error:", error);
        // Devuelve un error genérico del servidor
        return NextResponse.json(
            { message: error.message || "Error al obtener el catálogo de proveedores." },
            { status: 500 }
        );
    }
}