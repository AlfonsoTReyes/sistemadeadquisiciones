import { NextRequest, NextResponse } from 'next/server';
import { updateProveedorEstatus } from '@/services/adminproveedoresservice';

export async function PATCH(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const idProveedorStr = context.params.id;

  try {
    const idProveedor = parseInt(idProveedorStr, 10);
    if (isNaN(idProveedor)) {
      return NextResponse.json({ message: 'ID de proveedor inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { estatus } = body;
    if (typeof estatus !== 'boolean') {
      return NextResponse.json({ message: 'estatus debe ser booleano' }, { status: 400 });
    }

    const result = await updateProveedorEstatus(idProveedor, estatus);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
