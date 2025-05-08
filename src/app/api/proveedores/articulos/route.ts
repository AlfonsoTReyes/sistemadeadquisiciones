// src/app/api/proveedor/articulos/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Ajusta la ruta a tu archivo de servicio de artículos
import {
    createArticuloProveedor,
    getArticulosByProveedorId,
    updateArticuloProveedor,
    deleteArticuloProveedor
} from '@/services/articuloservice'; // Ajusta la ruta si es necesario


// --- GET: Obtener todos los artículos de un proveedor específico ---
// Espera: /api/proveedor/articulos?id_proveedor=NUMERO[&activoOnly=true|false]
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const idProveedorParam = searchParams.get("id_proveedor");
        const activoOnlyParam = searchParams.get("activoOnly");

        // 1. Validar id_proveedor (viene del cliente via query param)
        if (!idProveedorParam) {
            console.error("API ROUTE GET /proveedor/articulos: Missing 'id_proveedor' query parameter.");
            return NextResponse.json({ message: "El parámetro 'id_proveedor' es requerido." }, { status: 400 });
        }
        const idProveedor = parseInt(idProveedorParam, 10);
        if (isNaN(idProveedor)) {
            console.error("API ROUTE GET /proveedor/articulos: Invalid 'id_proveedor' (not a number). Value:", idProveedorParam);
            return NextResponse.json({ message: "El parámetro 'id_proveedor' debe ser un número válido." }, { status: 400 });
        }

        // *** ADVERTENCIA DE SEGURIDAD (Placeholder) ***
        // ¡Verificar aquí que el usuario autenticado tiene permiso para VER este idProveedor!
        // **********************************************

        const activoOnly = activoOnlyParam !== 'false';

        // 2. Llamar al servicio (que ahora devuelve partida_descripcion)
        const articulos = await getArticulosByProveedorId(idProveedor, activoOnly);

        return NextResponse.json(articulos);

    } catch (error: any) {
        console.error("API ROUTE GET /proveedor/articulos Error:", error);
        const status = error.message?.includes("inválido") ? 400 : 500;
        return NextResponse.json(
            { message: error.message || "Error al obtener los artículos." },
            { status }
        );
    }
}

// --- POST: Crear un nuevo artículo para un proveedor específico ---
// Espera en el cuerpo: { id_proveedor: number, codigo_partida: string, descripcion, unidad_medida, stock, precio_unitario, [estatus] }
export async function POST(req: NextRequest) {
    let requestData;
    try {
        requestData = await req.json();

        // 1. Validar el payload (incluyendo id_proveedor y codigo_partida)
        const { id_proveedor, codigo_partida, descripcion, unidad_medida, stock, precio_unitario } = requestData;

        if (typeof id_proveedor !== 'number' || isNaN(id_proveedor)) {
            return NextResponse.json({ message: 'Se requiere "id_proveedor" numérico válido en el cuerpo.' }, { status: 400 });
        }
        if (typeof codigo_partida !== 'string' || !codigo_partida.trim()) {
             return NextResponse.json({ message: 'Se requiere "codigo_partida" válido en el cuerpo.' }, { status: 400 });
        }
        if (!descripcion || !unidad_medida || stock === undefined || precio_unitario === undefined) {
             return NextResponse.json({ message: 'Faltan campos requeridos (descripcion, unidad_medida, stock, precio_unitario).' }, { status: 400 });
        }

        // *** ADVERTENCIA DE SEGURIDAD (Placeholder) ***
        // ¡Verificar aquí que el usuario autenticado tiene permiso para CREAR para este id_proveedor!
        // **********************************************

        // 2. Llamar al servicio
        // Pasamos requestData completo, ya que incluye todos los campos necesarios
        const nuevoArticulo = await createArticuloProveedor(requestData);

        return NextResponse.json(nuevoArticulo, { status: 201 }); // 201 Created

    } catch (error: any) {
        console.error("API ROUTE POST /proveedor/articulos Error:", error);
        let status = 500;
        let message = error.message || "Error al crear el artículo.";
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
             status = 400; message = 'Error: Formato JSON inválido.';
        } else if (error.message.includes("requerido") || error.message.includes("inválido") || error.message.includes("negativos") || error.message.includes("no existe") || error.message.includes("partida con código") ) {
            status = 400; // Error de validación del servicio o FK
        }
        return NextResponse.json({ message }, { status });
    }
}

// --- PUT: Actualizar un artículo existente ---
// Espera: /api/proveedor/articulos?id_articulo=NUMERO
// Y en el cuerpo: { id_proveedor: number, [codigo_partida], [descripcion], [unidad_medida], [stock], [precio_unitario], [estatus] }
export async function PUT(req: NextRequest) {
    let requestData;
    try {
        // 1. Obtener id_articulo de la URL
        const { searchParams } = req.nextUrl;
        const idArticuloParam = searchParams.get("id_articulo");

        if (!idArticuloParam) {
            return NextResponse.json({ message: "El parámetro 'id_articulo' es requerido en la URL." }, { status: 400 });
        }
        const idArticulo = parseInt(idArticuloParam, 10);
        if (isNaN(idArticulo)) {
            return NextResponse.json({ message: "El parámetro 'id_articulo' debe ser un número válido." }, { status: 400 });
        }

        // 2. Leer el cuerpo con los datos
        requestData = await req.json();

        // 3. Validar que id_proveedor venga en el cuerpo (necesario para la verificación en el servicio)
        const { id_proveedor } = requestData;
         if (typeof id_proveedor !== 'number' || isNaN(id_proveedor)) {
            console.error("API ROUTE PUT /proveedor/articulos: Invalid/missing 'id_proveedor' in body.");
            return NextResponse.json({ message: 'Se requiere un "id_proveedor" numérico válido en el cuerpo para la verificación.' }, { status: 400 });
        }

        // *** ADVERTENCIA DE SEGURIDAD (Placeholder) ***
        // ¡Verificar aquí que el usuario autenticado tiene permiso para MODIFICAR datos de este id_proveedor!
        // **********************************************

        // 4. Llamar al servicio de actualización
        // Pasamos idArticulo, idProveedor (para verificación) y el resto de requestData
        const articuloActualizado = await updateArticuloProveedor(idArticulo, id_proveedor, requestData);

        return NextResponse.json(articuloActualizado); // El servicio ya devuelve los detalles actualizados

    } catch (error: any) {
        console.error(`API ROUTE PUT /proveedor/articulos Error for article ID ${req.nextUrl.searchParams.get("id_articulo")}:`, error);
        let status = 500;
        let message = error.message || "Error al actualizar el artículo.";
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
             status = 400; message = 'Error: Formato JSON inválido.';
        } else if (error.message.includes("no encontrado") || error.message.includes("no pertenece")) {
            status = 404;
        } else if (error.message.includes("inválido") || error.message.includes("requerido") || error.message.includes("negativos") || error.message.includes("Formato inválido") || error.message.includes("partida con código")) {
            status = 400; // Error de validación o FK
        }
        return NextResponse.json({ message }, { status });
    }
}

// --- DELETE: Eliminar un artículo ---
// Espera: /api/proveedor/articulos?id_articulo=NUMERO&id_proveedor=NUMERO
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const idArticuloParam = searchParams.get("id_articulo");
        const idProveedorParam = searchParams.get("id_proveedor"); // Se recibe del cliente

        // 1. Validar ambos IDs
        if (!idArticuloParam || !idProveedorParam) {
            return NextResponse.json({ message: "Se requieren los parámetros 'id_articulo' y 'id_proveedor'." }, { status: 400 });
        }
        const idArticulo = parseInt(idArticuloParam, 10);
        const idProveedor = parseInt(idProveedorParam, 10);
        if (isNaN(idArticulo) || isNaN(idProveedor)) {
            return NextResponse.json({ message: "Los parámetros 'id_articulo' y 'id_proveedor' deben ser números válidos." }, { status: 400 });
        }

        // *** ADVERTENCIA DE SEGURIDAD (Placeholder) ***
        // ¡Verificar aquí que el usuario autenticado tiene permiso para ELIMINAR para este id_proveedor!
        // **********************************************


        // 2. Llamar al servicio de eliminación (que verifica pertenencia)
        const deleted = await deleteArticuloProveedor(idArticulo, idProveedor);

        if (deleted) {
            return NextResponse.json({ success: true, message: "Artículo eliminado correctamente." });
        } else {
            // El servicio devolvió false, lo que significa que no se encontró o no pertenecía
            console.warn(`API ROUTE DELETE /proveedor/articulos: Article ${idArticulo} not found or not owned by supplier ${idProveedor}.`);
            return NextResponse.json({ message: "Artículo no encontrado o no pertenece a este proveedor." }, { status: 404 });
        }

    } catch (error: any) {
        console.error(`API ROUTE DELETE /proveedor/articulos Error for article ID ${req.nextUrl.searchParams.get("id_articulo")}:`, error);
        const status = (error.message?.includes("inválido")) ? 400 : 500;
        return NextResponse.json(
            { message: error.message || "Error al eliminar el artículo." },
            { status }
        );
    }
}