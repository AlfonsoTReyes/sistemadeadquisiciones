// src/app/api/proveedor/partidas/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Ajusta la ruta a tu archivo de servicio real
import {
    getPartidasByProveedorId,
    syncProveedorPartidas
} from '@/services/partidasService'; // O '../services/partidasService' etc.
console.log("***** MODULE LOADED: /api/proveedor/partidas/route.ts *****"); // <-- AÑADIR AQUÍ
// --- GET: Obtener las partidas seleccionadas por un proveedor específico ---
// Espera: /api/proveedor/partidas?id_proveedor=NUMERO
export async function GET(req: NextRequest) {
    console.log("--- HIT: GET /api/proveedor/partidas ---");
    try {
        const { searchParams } = req.nextUrl;
        const idProveedorParam = searchParams.get("id_proveedor");

        // Validación del parámetro id_proveedor
        if (!idProveedorParam) {
            console.error("API ROUTE GET /proveedor/partidas: Missing 'id_proveedor' query parameter.");
            return NextResponse.json({ message: "El parámetro 'id_proveedor' es requerido." }, { status: 400 });
        }
        const idProveedor = parseInt(idProveedorParam, 10);
        if (isNaN(idProveedor)) {
            console.error("API ROUTE GET /proveedor/partidas: Invalid 'id_proveedor' (not a number). Value:", idProveedorParam);
            return NextResponse.json({ message: "El parámetro 'id_proveedor' debe ser un número válido." }, { status: 400 });
        }

        console.log(`API ROUTE GET /proveedor/partidas: Fetching partidas for supplier ID: ${idProveedor}`);
        const partidasSeleccionadas = await getPartidasByProveedorId(idProveedor);

        console.log(`API ROUTE GET /proveedor/partidas: Successfully fetched ${partidasSeleccionadas.length} partidas for supplier ${idProveedor}`);
        return NextResponse.json(partidasSeleccionadas);

    } catch (error: any) {
        console.error("API ROUTE GET /proveedor/partidas Error:", error);
        let status = 500;
        if (error.message.includes("inválido")) { status = 400; }
        // Si getPartidasByProveedorId lanza "no encontrado" para el proveedor
        // podríamos devolver 404, pero un 400 por ID inválido parece razonable aquí también.
        return NextResponse.json(
            { message: error.message || "Error al obtener las partidas del proveedor." },
            { status }
        );
    }
}

// --- POST: Sincronizar (reemplazar) las partidas de un proveedor específico ---
// Espera en el cuerpo: { "id_proveedor": number, "partidas": ["codigo1", "codigo2", ...] }
export async function POST(req: NextRequest) {
    console.log("--- HIT: POST /api/proveedor/partidas ---");
    let requestData;
    try {
        requestData = await req.json();
        console.log(`API ROUTE POST /proveedor/partidas: Received payload:`, JSON.stringify(requestData, null, 2));

        // Validación del payload
        const { id_proveedor, partidas } = requestData;

        if (typeof id_proveedor !== 'number' || isNaN(id_proveedor)) {
            console.error("API ROUTE POST /proveedor/partidas: Invalid/missing 'id_proveedor' in body.");
            return NextResponse.json({ message: 'Se requiere un "id_proveedor" numérico válido en el cuerpo.' }, { status: 400 });
        }
        if (!Array.isArray(partidas)) {
            console.error("API ROUTE POST /proveedor/partidas: Invalid/missing 'partidas' array in body.");
            return NextResponse.json({ message: 'Se requiere un array "partidas" en el cuerpo.' }, { status: 400 });
        }
        // Limpieza de los códigos de partida
        const codigosPartida: string[] = partidas
            .map(p => p != null ? String(p).trim() : '')
            .filter(p => p !== '');

        console.log(`API ROUTE POST /proveedor/partidas: Calling syncProveedorPartidas for supplier ${id_proveedor} with ${codigosPartida.length} partidas.`);
        await syncProveedorPartidas(id_proveedor, codigosPartida);

        console.log(`API ROUTE POST /proveedor/partidas: Partidas synced successfully for supplier ${id_proveedor}`);
        return NextResponse.json({ message: 'Partidas actualizadas correctamente.' });

    } catch (error: any) {
        console.error("API ROUTE POST /proveedor/partidas Error:", error);
         if (error instanceof SyntaxError && error.message.includes('JSON')) {
             return NextResponse.json({ message: 'Error: El formato del cuerpo de la solicitud (JSON) es inválido.' }, { status: 400 });
        }
        let status = 500;
        // Mapear errores del servicio a códigos HTTP
        if (error.message.includes("inválido") || error.message.includes("no existe") || error.message.includes("array") || error.message.includes("requiere") || error.message.includes("Error: La partida") || error.message.includes("Error: El proveedor")) {
            status = 400;
        } else if (error.message.includes("ya está en uso")) { // Por si acaso, aunque sync elimina primero
             status = 409;
        }
        return NextResponse.json(
            { message: error.message || "Error al actualizar las partidas del proveedor." },
            { status }
        );
    }
}
