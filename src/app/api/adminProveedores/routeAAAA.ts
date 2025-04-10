import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProveedoresForAdmin,
  getProveedorProfileByIdForAdmin,
  updateProveedorEstatus,
  updateProveedorProfileForAdmin,
  getUsuarioProveedorByProveedorId,
  updateUsuarioProveedor
} from '@/services/adminproveedoresservice';

// GET: Obtener TODOS los proveedores o UNO específico por ID
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const idProveedorParam = searchParams.get('id_proveedor');
  const idProveedorUsuarioParam = searchParams.get('id_proveedor_usuario');

  if (idProveedorUsuarioParam) {
    const idProveedorUsuario = parseInt(idProveedorUsuarioParam, 10);

    if (isNaN(idProveedorUsuario)) {
      return NextResponse.json({ message: 'El parámetro "id_proveedor_usuario" debe ser un número válido.' }, { status: 400 });
    }

    try {
      const usuarioProveedor = await getUsuarioProveedorByProveedorId(idProveedorUsuario);
      if (!usuarioProveedor) {
        return NextResponse.json({ message: 'Usuario proveedor no encontrado.' }, { status: 404 });
      }
      return NextResponse.json(usuarioProveedor);
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Error al obtener usuario proveedor.' },
        { status: 500 }
      );
    }
  } else if (idProveedorParam) {
    const idProveedor = parseInt(idProveedorParam, 10);

    if (isNaN(idProveedor)) {
      return NextResponse.json({ message: 'El parámetro "id_proveedor" debe ser un número válido.' }, { status: 400 });
    }

    try {
      const proveedor = await getProveedorProfileByIdForAdmin(idProveedor);
      return NextResponse.json(proveedor);
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Error al obtener el perfil del proveedor.' },
        { status: error.message.includes("no encontrado") ? 404 : 500 }
      );
    }
  } else {
    try {
      const proveedores = await getAllProveedoresForAdmin();
      return NextResponse.json(proveedores);
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Error al obtener la lista de proveedores.' },
        { status: 500 }
      );
    }
  }
}

// PUT: Actualizar ESTATUS o PERFIL COMPLETO de un proveedor o usuario proveedor
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("PUT "+data);
    if (!data.id_proveedor || isNaN(data.id_proveedor)) {
      return NextResponse.json({ message: 'Se requiere un "id_proveedor" numérico válido.' }, { status: 400 });
    }

    const isStatusUpdateOnly = Object.keys(data).length === 2 && 'estatus' in data;

    if (isStatusUpdateOnly) {
      const proveedorActualizado = await updateProveedorEstatus(data.id_proveedor, data.estatus);
      return NextResponse.json(proveedorActualizado);
    } else if ('tipoProveedor' in data) {
      const proveedorActualizado = await updateProveedorProfileForAdmin(data);
      return NextResponse.json(proveedorActualizado);
    } else if ('id_usuario' in data) {
      const usuarioProveedorActualizado = await updateUsuarioProveedor(data);
      return NextResponse.json(usuarioProveedorActualizado);
    } else {
      return NextResponse.json({ message: 'Solicitud de actualización no válida.' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Error al procesar la solicitud de actualización.' },
      { status: error.message.includes("no encontrado") ? 404 : 500 }
    );
  }
}