// src/app/api/solicitudes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSolicitudesForSelect } from '@/services/solicituddetalleservice'; // Ajusta la ruta

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const forSelect = searchParams.get('forSelect');

    try {
        if (forSelect === 'true') {
            console.log("API GET /solicitudes: Request for select options");
            const options = await getSolicitudesForSelect();
            return NextResponse.json(options);
        }

        // Aquí iría la lógica para otras solicitudes GET (ej: obtener detalles por ID)
        // Si no es para select, indicar que falta parámetro o no implementado
        console.log("API GET /solicitudes: Invalid or missing parameters.");
        return NextResponse.json({ message: 'Parámetro ?forSelect=true requerido o endpoint no implementado.' }, { status: 400 });

    } catch (error: any) {
        console.error("API GET /api/solicitudes Error:", error);
        return NextResponse.json({ message: error.message || 'Error en el servidor al obtener solicitudes' }, { status: 500 });
    }
}

// Implementa POST, PUT, DELETE si necesitas gestionar solicitudes desde la API