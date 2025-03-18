import { NextRequest, NextResponse } from 'next/server';
import { getPermiso, getPermisoById, createPermiso, updatePermiso, deletePermiso, getPermissionsByRole} from '../../../services/persmisoservice';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id_permiso');
    const idrol = searchParams.get('idrol');

    if (id) {
      // Si existe el id, obtenemos solo ese usuario
      const permiso = await getPermisoById(parseInt(id));
      if (!permiso) {
        return NextResponse.json({ message: 'Permiso no encontrado' }, { status: 404 });
      }
      return NextResponse.json(permiso);
    }

    if (idrol) {
      // Si existe el id, obtenemos solo ese usuario
      const permiso = await getPermissionsByRole(parseInt(idrol));
      if (!permiso) {
        return NextResponse.json({ message: 'No tiene permisos' }, { status: 404 });
      }
      return NextResponse.json(permiso);
    }

    // Si no hay id, traemos todos los usuarios
    const permisos = await getPermiso();
    return NextResponse.json(permisos);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener permisos', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, sistema} = await req.json();
    const nuevoPermiso = await createPermiso(nombre, descripcion, sistema);
    return NextResponse.json(nuevoPermiso);
  } catch (error) {
    console.error('Error en POST /api/permiso:', error);
    return NextResponse.json({ message: 'Error al crear permiso', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id_permiso, nombre, descripcion, sistema} = await req.json();

    // Asegúrate de que los parámetros sean correctos
    if (!id_permiso) {
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
    }
    const permisoActualizado = await updatePermiso(id_permiso, { nombre, descripcion, sistema}); 
    if (!permisoActualizado) {
      return NextResponse.json({ message: 'Permiso no encontrado' }, { status: 404 });
    }

    return NextResponse.json(permisoActualizado);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar permiso', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id_permiso');
  if (!id) {
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
  }
  const permisoEliminado = await deletePermiso(parseInt(id));
  
  if (!permisoEliminado) {
      return NextResponse.json({ message: 'Permiso no encontrado' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Permiso eliminado correctamente' });
}

