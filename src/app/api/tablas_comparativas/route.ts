// src/app/api/tablas-comparativas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getTablasComparativasLista,
    crearTablaComparativa,
} from '@/services/tablasComparativasService'; // Ajusta la ruta si es necesario
import { CrearTablaComparativaInput } from '@/types/tablaComparativa'; // Ajusta la ruta

// --- GET /api/tablas-comparativas ---
// Obtiene una lista de todas las tablas comparativas (datos básicos).
export async function GET(request: NextRequest) {
    try {
        // TODO: Implementar filtros y paginación si es necesario, leyendo query params de request.url
        const tablas = await getTablasComparativasLista();
        return NextResponse.json(tablas, { status: 200 });

    } catch (error: any) {
        console.error('API ERROR [GET /api/tablas-comparativas]:', error);
        return NextResponse.json(
            { message: 'Error al obtener la lista de tablas comparativas', error: error.message },
            { status: 500 }
        );
    }
}

// --- POST /api/tablas-comparativas ---
// Crea una nueva tabla comparativa.
export async function POST(request: NextRequest) {
    try {
        // 1. Obtener los datos del cuerpo de la solicitud
        const body = await request.json();

        // 2. Validar los datos de entrada (Ejemplo básico)
        //    Se recomienda usar una librería como Zod para validación más robusta.
        const inputData: CrearTablaComparativaInput = body;
        if (!inputData.nombre || typeof inputData.nombre !== 'string') {
            return NextResponse.json(
                { message: 'El campo "nombre" es requerido y debe ser un string.' },
                { status: 400 } // Bad Request
            );
        }
        // Añadir más validaciones según sea necesario (ej. id_usuario_creador)

        // 3. Llamar al servicio para crear la tabla
        const nuevaTabla = await crearTablaComparativa(inputData);

        // 4. Devolver la tabla recién creada
        return NextResponse.json(nuevaTabla, { status: 201 }); // 201 Created

    } catch (error: any) {
        console.error('API ERROR [POST /api/tablas-comparativas]:', error);
        // Podrías tener errores específicos de validación o de base de datos
        return NextResponse.json(
            { message: 'Error al crear la tabla comparativa', error: error.message },
            { status: 500 } // Internal Server Error (o 400 si fue error de validación no capturado antes)
        );
    }
}