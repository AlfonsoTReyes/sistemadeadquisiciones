// src/app/api/admin/proveedores/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Ajusta la ruta a tu archivo de servicio
import {
    getAllProveedoresForAdmin, // Para GET (obtener todos)
    updateProveedorEstatus,     // Para PUT (actualizar estatus)
 } from '@/services/adminproveedoresservice';

// --- GET: Obtener TODOS los proveedores para la tabla de admin ---
export async function GET(req: NextRequest) {
    console.log("DEBUG API GET /api/admin/proveedores: Request received.");
    try {
        // Llama a la función específica del servicio para la tabla de admin
        const proveedores = await getAllProveedoresForAdmin();

        console.log(`DEBUG API GET /api/admin/proveedores: Found ${proveedores.length} providers.`);
        return NextResponse.json(proveedores);

    } catch (error: any) {
        console.error("ERROR GET /api/admin/proveedores:", error);
        return NextResponse.json(
            { message: error.message || 'Error al obtener la lista de proveedores para administración.', error: error.message },
            { status: 500 }
        );
    }
}

// --- PUT: Actualizar el ESTATUS de UN proveedor ---
// Espera { "id_proveedor": number, "estatus": boolean } en el cuerpo
export async function PUT(req: NextRequest) {
    console.log(`DEBUG API PUT /api/admin/proveedores: Request received for status update.`);
    try {
        // 1. Leer el cuerpo de la solicitud
        const data = await req.json();
        const { id_proveedor, estatus } = data; // Extraer ID y estatus del body

        console.log(`DEBUG API PUT /api/admin/proveedores - Received Body:`, data);

        // 2. Validar los datos recibidos del body
        if (typeof id_proveedor !== 'number' || isNaN(id_proveedor)) {
             console.log("DEBUG API PUT: Invalid or missing 'id_proveedor' in body.");
             return NextResponse.json({ message: 'Se requiere un "id_proveedor" numérico válido en el cuerpo de la solicitud.' }, { status: 400 });
        }
        if (typeof estatus !== 'boolean') {
            console.log("DEBUG API PUT: Invalid or missing 'estatus' in body.");
            return NextResponse.json({ message: 'Se requiere un valor booleano para "estatus" en el cuerpo de la solicitud.' }, { status: 400 });
        }

        console.log(`DEBUG API PUT: Calling service updateProveedorEstatus for ID ${id_proveedor} to ${estatus}`);
        // 3. Llamar al servicio con los datos del body
        const proveedorActualizado = await updateProveedorEstatus(id_proveedor, estatus);

        console.log(`DEBUG API PUT: Service call successful for ID ${id_proveedor}.`);
        // 4. Devolver respuesta exitosa
        return NextResponse.json(proveedorActualizado);

    } catch (error: any) {
        console.error("ERROR PUT /api/admin/proveedores:", error);
        // Manejar error si el proveedor no se encontró para actualizar
        if (error.message.includes("no encontrado para actualizar")) {
            // Intenta obtener el ID del error si está disponible en el mensaje
            const failedIdMatch = error.message.match(/ID (\d+)/);
            const failedId = failedIdMatch ? failedIdMatch[1] : 'desconocido';
            console.log(`DEBUG API PUT: Provider not found (ID: ${failedId})`);
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        // Error genérico
        return NextResponse.json(
            { message: error.message || 'Error al actualizar el estatus del proveedor.', error: error.message },
            { status: 500 }
        );
    }
}
