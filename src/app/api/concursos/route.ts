// src/app/api/concursos/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Asegúrate de importar la función correcta del servicio
import { getConcursosForSelect } from '@/services/concursosService'; // Ajusta la ruta

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const forSelect = searchParams.get('forSelect');

    try {
        if (forSelect === 'true') {
            console.log("API GET /concursos: Request for select options");
            const options = await getConcursosForSelect();
            return NextResponse.json(options);
        }

        // Aquí iría la lógica para otras solicitudes GET si las tienes
        console.log("API GET /concursos: Invalid or missing parameters.");
        return NextResponse.json({ message: 'Parámetro ?forSelect=true requerido o endpoint no implementado.' }, { status: 400 });

    } catch (error: any) {
        console.error("API GET /api/concursos Error:", error);
        return NextResponse.json({ message: error.message || 'Error en el servidor al obtener concursos' }, { status: 500 });
    }
}