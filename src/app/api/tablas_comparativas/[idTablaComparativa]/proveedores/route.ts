// src/app/api/tablas-comparativas/[idTablaComparativa]/proveedores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarProveedorATabla } from '@/services/tablasComparativasService'; // ¡IMPLEMENTAR ESTA FUNCIÓN!
import { AgregarProveedorInput } from '@/types/tablaComparativa';
// import { ZodError } from 'zod'; // Si usas Zod para validar

interface RouteParams {
    params: { idTablaComparativa: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { idTablaComparativa } = params;
    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/proveedores:`;
    console.log(logPrefix);

    // 1. Validar ID de Tabla
    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    try {
        // 2. Obtener y Validar Cuerpo de la Solicitud
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        // --- Validación (¡Usar Zod aquí!) ---
        const inputData = body as AgregarProveedorInput; // Cast temporal
        if (!inputData || typeof inputData !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }
        if (inputData.id_tabla_comparativa !== idTabla) {
            return NextResponse.json({ message: 'El ID de tabla en el cuerpo no coincide con el ID de la ruta.' }, { status: 400 });
        }
        if (!inputData.id_proveedor || typeof inputData.id_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor inválido o faltante.' }, { status: 400 });
        }
        if (!inputData.nombre_empresa_snapshot || !inputData.rfc_snapshot) {
            return NextResponse.json({ message: 'Nombre y RFC del snapshot son requeridos.' }, { status: 400 });
        }
        // Añadir más validaciones para los campos snapshot
        // --- Fin Validación ---

        // 3. Llamar al Servicio
        // La función del servicio necesita el objeto completo con los datos snapshot
        const nuevoProveedorEnTabla = await agregarProveedorATabla(inputData);

        // 4. Devolver Respuesta Exitosa
        return NextResponse.json(nuevoProveedorEnTabla, { status: 201 }); // 201 Created

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        // if (error instanceof ZodError) {
        //     return NextResponse.json({ message: 'Datos inválidos.', errors: error.errors }, { status: 400 });
        // }
        if (error.message.includes('duplicate key') || error.message.includes('ya existe')) {
            return NextResponse.json({ message: 'Este proveedor ya ha sido agregado a la tabla.' }, { status: 409 }); // Conflict
        }
        if (error.message.includes('no encontrada')) { // Ej: Tabla o Proveedor maestro no existe
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json(
            { message: 'Error al agregar el proveedor a la tabla', error: error.message },
            { status: 500 }
        );
    }
}