// src/app/api/tablas-comparativas/[idTablaComparativa]/observaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarObservacion } from '@/services/tablasComparativasService'; // ¡IMPLEMENTAR ESTA FUNCIÓN!
import { AgregarObservacionInput } from '@/types/tablaComparativa';
// import { ZodError } from 'zod';

interface RouteParams {
    params: { idTablaComparativa: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa } = params;
    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/observaciones:`;
    console.log(logPrefix);

    // 1. Validar ID de Tabla
    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    try {
        // 2. Obtener y Validar Cuerpo
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        // --- Validación (¡Usar Zod!) ---
        const inputData = body as AgregarObservacionInput; // Cast temporal
        if (!inputData || typeof inputData !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }
        // ¡Importante! Verificar que el idTablaComparativaProveedor exista y pertenezca a esta idTabla
        // Esta validación debería hacerse idealmente en el servicio.
        if (!inputData.id_tabla_comparativa_proveedor || typeof inputData.id_tabla_comparativa_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor en tabla faltante o inválido.' }, { status: 400 });
        }
        if (!inputData.descripcion_validacion) {
            return NextResponse.json({ message: 'La descripción de la validación es requerida.' }, { status: 400 });
        }
        if (typeof inputData.cumple !== 'boolean') {
            return NextResponse.json({ message: 'El campo "cumple" debe ser booleano.' }, { status: 400 });
        }
        // --- Fin Validación ---

        // 3. Llamar al Servicio
        const nuevaObservacion = await agregarObservacion(inputData); // El servicio debe validar la pertenencia del proveedor a la tabla

        // 4. Devolver Respuesta Exitosa
        return NextResponse.json(nuevaObservacion, { status: 201 });

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        // if (error instanceof ZodError) { ... }
        if (error.message.includes('no encontrado')) { // Ej: idTablaComparativaProveedor no existe o no pertenece a idTabla
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json(
            { message: 'Error al agregar la observación', error: error.message },
            { status: 500 }
        );
    }
}