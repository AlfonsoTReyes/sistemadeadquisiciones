import { NextRequest, NextResponse } from 'next/server';
import { updateProveedorEstatus } from '@/services/adminproveedoresservice';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const idProveedorStr = params.id;

  try {
    const idProveedor = parseInt(idProveedorStr, 10);
    if (isNaN(idProveedor)) {
      return NextResponse.json({ message: 'ID de proveedor inválido en la URL' }, { status: 400 });
    }

    const body = await req.json();
    const { estatus } = body;
    if (typeof estatus !== 'boolean') {
      return NextResponse.json({ message: 'El valor de "estatus" debe ser booleano (true/false)' }, { status: 400 });
    }

    const proveedorActualizado = await updateProveedorEstatus(idProveedor, estatus);
    return NextResponse.json(proveedorActualizado);

  } catch (error: unknown) {
    let errorMessage = 'Error al actualizar el estatus del proveedor.';
    let statusCode = 500;
    let errorDetails: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.message;
      if (error.message.includes("no encontrado para actualizar")) {
        statusCode = 404;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorDetails = error;
    }

    return NextResponse.json({ message: errorMessage, error: errorDetails }, { status: statusCode });
  }
}
