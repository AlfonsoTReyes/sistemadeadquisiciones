// src/app/api/catalogos/partidas/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Ajusta la ruta a tu archivo de servicio real
import {
    getAllSelectablePartidas
} from '@/services/partidasService'; // O '../services/partidasService' etc.
console.log("***** MODULE LOADED: /api/catalogos/partidas/route.ts *****"); // <-- AÑADIR AQUÍ
// --- GET: Obtener todas las partidas seleccionables del catálogo general ---
export async function GET(req: NextRequest) {
    console.log("--- HIT: GET /api/catalogos/partidas ---");
    try {
        // No se necesita ID de proveedor aquí

        // Opcional: Añadir lógica de autorización si el catálogo no es público.
        // const isAuthorized = await checkUserIsAuthenticated(req);
        // if (!isAuthorized) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

        console.log("API ROUTE GET /catalogos/partidas: Fetching all selectable partidas...");
        const catalogo = await getAllSelectablePartidas();

        console.log(`API ROUTE GET /catalogos/partidas: Successfully fetched ${catalogo.length} catalog partidas.`);
        return NextResponse.json(catalogo);

    } catch (error: any) {
        console.error("API ROUTE GET /catalogos/partidas Error:", error);
        // Devolver error genérico del servidor
        return NextResponse.json(
            { message: error.message || "Error al obtener el catálogo de partidas." },
            { status: 500 }
        );
    }
}

// Probablemente no se necesiten POST, PUT, DELETE para esta ruta de solo lectura del catálogo.