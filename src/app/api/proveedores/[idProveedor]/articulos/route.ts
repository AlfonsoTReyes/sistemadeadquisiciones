// src/app/api/proveedores/[idProveedor]/articulos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buscarArticulosPorProveedorYTermino } from '@/services/catalogoProveedoresService';
import { ArticuloCatalogo } from '@/types/catalogoProveedores';

// export const dynamic = 'force-dynamic'; // Try adding this

export async function GET(
    request: NextRequest
    // { params }: { params: { idProveedor: string } } // Temporarily remove for workaround
) {
    // WORKAROUND: Extract idProveedor from pathname
    const pathnameParts = request.nextUrl.pathname.split('/');
    // Expected path: /api/proveedores/[idProveedor]/articulos
    // Array indices:    0   1      2            3           4
    const idProveedor = pathnameParts[3]; // Adjust index if your base path is different

    if (!idProveedor) {
        console.error("Error: Could not extract idProveedor from pathname.", request.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'No se pudo determinar el ID del proveedor desde la URL' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    const logPrefix = `API GET /proveedores/${idProveedor}/articulos (Search: ${searchTerm}):`;

    const proveedorIdNum = parseInt(idProveedor, 10);
    if (isNaN(proveedorIdNum)) {
        return NextResponse.json({ message: 'ID de proveedor inválido (extraído del pathname).' }, { status: 400 });
    }

    if (!searchTerm || searchTerm.trim().length < 3) {
        return NextResponse.json([]);
    }

    try {
        const articulos: Partial<ArticuloCatalogo>[] = await buscarArticulosPorProveedorYTermino(proveedorIdNum, searchTerm);
        return NextResponse.json(articulos);

    } catch (error: unknown) {
        console.error(`${logPrefix} Error:`, error);
        let message = 'Error al buscar artículos del proveedor';
        let errorDetail: string | undefined;
        if (error instanceof Error) {
            message = error.message || message;
            errorDetail = error.message;
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