// src/app/api/tablas-comparativas/[idTablaComparativa]/proveedores/[idTablaComparativaProveedor]/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarItemAProveedor } from '@/services/tablasComparativasService';
import { AgregarItemInput } from '@/types/tablaComparativa';

// Definir tipo para el contexto con ambos parámetros
interface RouteContext {
    params: {
        idTablaComparativa: string;
        idTablaComparativaProveedor: string;
    };
}

// Cambiar la firma para recibir 'context'
export async function POST(request: NextRequest, context: RouteContext) {
    // Acceder a params desde context
    const { params } = context;
    const { idTablaComparativa, idTablaComparativaProveedor } = params; // Ahora esto funciona

    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/proveedores/${idTablaComparativaProveedor}/items:`;
    console.log(logPrefix);

    // 1. Validar IDs de Ruta
    const idTabla = parseInt(idTablaComparativa, 10);
    const idTablaProv = parseInt(idTablaComparativaProveedor, 10);
    if (isNaN(idTabla) || isNaN(idTablaProv)) {
        return NextResponse.json({ message: 'IDs inválidos en la ruta.' }, { status: 400 });
    }

    try {
        // 2. Obtener y Validar Cuerpo
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        // --- Validación (¡Usar Zod!) ---
        const inputData = body as AgregarItemInput;
        if (!inputData || typeof inputData !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }
        if (inputData.id_tabla_comparativa_proveedor !== idTablaProv) {
            return NextResponse.json({ message: 'El ID de proveedor en el cuerpo no coincide con el ID de la ruta.' }, { status: 400 });
        }
        if (!inputData.descripcion_item || inputData.cantidad == null || inputData.precio_unitario == null || !inputData.udm) {
            return NextResponse.json({ message: 'Faltan campos requeridos para el ítem (descripción, cantidad, precio, udm).' }, { status: 400 });
        }
        if (typeof inputData.cantidad !== 'number' || inputData.cantidad <= 0 || typeof inputData.precio_unitario !== 'number' || inputData.precio_unitario < 0) {
            return NextResponse.json({ message: 'Cantidad debe ser número positivo, Precio Unitario debe ser número no negativo.' }, { status: 400 });
        }
        // --- Fin Validación ---

        // 3. Llamar al Servicio
        const nuevoItem = await agregarItemAProveedor(inputData);

        // 4. Devolver Respuesta Exitosa
        return NextResponse.json(nuevoItem, { status: 201 });

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        if (error.message.includes('no encontrado')) { return NextResponse.json({ message: error.message }, { status: 404 }); }
        return NextResponse.json({ message: 'Error al agregar el ítem', error: error.message }, { status: 500 });
    }
}