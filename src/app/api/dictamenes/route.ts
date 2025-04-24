// src/app/api/dictamenes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDictamenesForSelect } from '@/services/dictamenComiteService'; // Ajusta la ruta

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const forSelect = searchParams.get('forSelect');

    try {
        if (forSelect === 'true') {
            console.log("API GET /dictamenes: Request for select options");
            const options = await getDictamenesForSelect();
            return NextResponse.json(options);
        }

        console.log("API GET /dictamenes: Invalid or missing parameters.");
        return NextResponse.json({ message: 'Parámetro ?forSelect=true requerido o endpoint no implementado.' }, { status: 400 });

    } catch (error: any) {
        console.error("API GET /api/dictamenes Error:", error);
        return NextResponse.json({ message: error.message || 'Error en el servidor al obtener dictámenes' }, { status: 500 });
    }
}