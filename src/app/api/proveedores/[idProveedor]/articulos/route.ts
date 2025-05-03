// src/app/api/proveedores/[idProveedor]/articulos/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { buscarArticulosPorProveedorYTermino } from '@/services/catalogoProveedoresService'; // Ajusta la ruta
import { ArticuloCatalogo } from '@/types/catalogoProveedores'; // Ajusta la ruta

interface RouteContext { // Renombrado de RouteParams para claridad
    params: {
        idProveedor: string;
    }
}

export async function GET(request: NextRequest, context: RouteContext) {
    const { params } = context;
    const { idProveedor } = params;
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    const logPrefix = `API GET /proveedores/${idProveedor}/articulos (Search: ${searchTerm}):`;
    console.log(logPrefix);

    const proveedorIdNum = parseInt(idProveedor, 10);
    if (isNaN(proveedorIdNum)) {
        return NextResponse.json({ message: 'ID de proveedor inválido.' }, { status: 400 });
    }

    if (!searchTerm || searchTerm.trim().length < 3) {
        console.log(`${logPrefix} Search term too short, returning empty array.`);
        return NextResponse.json([]);
    }

    try {
        // Llamar a la función del servicio correcto
        const articulos: ArticuloCatalogo[] = await buscarArticulosPorProveedorYTermino(proveedorIdNum, searchTerm);
        console.log(`${logPrefix} Found ${articulos.length} articles.`);
        return NextResponse.json(articulos);

    } catch (error: any) {
        console.error(`${logPrefix} Error:`, error);
        return NextResponse.json(
            { message: 'Error al buscar artículos del proveedor', error: error.message },
            { status: 500 }
        );
    }
}