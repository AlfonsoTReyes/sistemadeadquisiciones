// src/app/api/catalogos/partidas/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Ajusta la ruta a tu archivo de servicio real
import {
    getAllSelectablePartidas
} from '@/services/partidasService'; // O '../services/partidasService' etc.
// --- GET: Obtener todas las partidas seleccionables del catálogo general ---
export async function GET(req: NextRequest) {
    try {
        // No se necesita ID de proveedor aquí

        // Opcional: Añadir lógica de autorización si el catálogo no es público.
        // const isAuthorized = await checkUserIsAuthenticated(req);
        // if (!isAuthorized) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

        const catalogo = await getAllSelectablePartidas();

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