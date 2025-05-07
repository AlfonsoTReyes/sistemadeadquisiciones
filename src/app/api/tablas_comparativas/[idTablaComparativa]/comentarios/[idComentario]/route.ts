// src/app/api/tablas_comparativas/[idTablaComparativa]/comentarios/[idComentario]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Placeholder to make the file a valid module
export async function GET(request: NextRequest, { params }: { params: { idTablaComparativa: string, idComentario: string } }) {
    return NextResponse.json({ message: `GET handler for comentario ${params.idComentario} of tabla ${params.idTablaComparativa} - Not yet implemented` }, { status: 501 });
}

// Add other methods (POST, DELETE etc.) as needed