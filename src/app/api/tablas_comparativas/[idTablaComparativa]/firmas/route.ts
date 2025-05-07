// src/app/api/tablas_comparativas/[idTablaComparativa]/firmas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { agregarFirma } from '@/services/tablasComparativasService';
import { AgregarFirmaInput } from '@/types/tablaComparativa';

// export const dynamic = 'force-dynamic'; // Keep this if you added it

export async function POST(
    request: NextRequest,
    // Use a more generic type for the context object initially
    context: { params?: { [key: string]: string | string[] | undefined } }
) {
    // Type assertion/check for params and idTablaComparativa
    if (!context.params || typeof context.params.idTablaComparativa !== 'string') {
        console.error("API POST Firmas: Invalid or missing idTablaComparativa in params", context.params);
        return NextResponse.json({ message: 'ID de tabla comparativa no encontrado en la ruta.' }, { status: 400 });
    }
    const { idTablaComparativa } = context.params as { idTablaComparativa: string };

    const logPrefix = `API POST /tablas-comparativas/${idTablaComparativa}/firmas:`;
    console.log(logPrefix);

    const idTabla = parseInt(idTablaComparativa, 10);
    if (isNaN(idTabla)) {
        return NextResponse.json({ message: 'ID de tabla comparativa inválido.' }, { status: 400 });
    }

    // TODO: Authentication
    // const idUsuarioDeSesion = ...

    try {
        const body = await request.json();
        console.log(`${logPrefix} Request body:`, body);

        const inputDataFromClient = body as Partial<AgregarFirmaInput>;

        if (!inputDataFromClient || typeof inputDataFromClient !== 'object') {
            return NextResponse.json({ message: 'Cuerpo de solicitud inválido.' }, { status: 400 });
        }
        if (!inputDataFromClient.id_usuario || typeof inputDataFromClient.id_usuario !== 'number') {
            return NextResponse.json({ message: 'ID de usuario inválido o faltante. (Debe obtenerse de la sesión)' }, { status: 400 });
        }
        if (!inputDataFromClient.tipo_firma || typeof inputDataFromClient.tipo_firma !== 'string' || !inputDataFromClient.tipo_firma.trim()) {
            return NextResponse.json({ message: 'El tipo de firma es requerido.' }, { status: 400 });
        }

        const dataForService: AgregarFirmaInput = {
            id_tabla_comparativa: idTabla,
            id_usuario: inputDataFromClient.id_usuario, // Replace with session user ID
            tipo_firma: inputDataFromClient.tipo_firma,
            comentario_firma: inputDataFromClient.comentario_firma || null,
        };

        const nuevaFirma = await agregarFirma(dataForService);
        return NextResponse.json(nuevaFirma, { status: 201 });

    } catch (error: unknown) {
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al agregar la firma';
        let errorDetail: string | undefined;

        if (error instanceof Error) {
            message = error.message || message;
            errorDetail = error.message;
            if (error.message.includes('no encontrado')) {
                return NextResponse.json({ message: message }, { status: 404 });
            }
        } else if (typeof error === 'string') {
            message = error;
            errorDetail = error;
        }
        return NextResponse.json(
            { message: message, error: errorDetail },
            { status: 500 }
        );
    }
}