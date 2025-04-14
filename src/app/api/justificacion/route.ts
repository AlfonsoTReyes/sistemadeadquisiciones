import { NextRequest, NextResponse } from 'next/server';
import {
  getJustificaciones,
  getJustificacionById,
  getJustificacionByIdPDF,
  createJustificacion,
  updateJustificacion,
  deleteJustificacion
} from '../../../services/justificacionservice';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id_just');
    const id_j = searchParams.get('id');

    if (id_j) {
      const justificacion = await getJustificacionByIdPDF(parseInt(id_j));
      if (!justificacion) {
        return NextResponse.json({ message: 'Justificación no encontrada' }, { status: 404 });
      }
      return NextResponse.json(justificacion);
    }

    if (id) {
      const justificacion = await getJustificacionById(parseInt(id));
      if (!justificacion) {
        return NextResponse.json({ message: 'Justificación no encontrada' }, { status: 404 });
      }
      return NextResponse.json(justificacion);
    }

    const justificaciones = await getJustificaciones();
    return NextResponse.json(justificaciones);
  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener justificaciones', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const nuevaJustificacion = await createJustificacion(data);
    return NextResponse.json(nuevaJustificacion);
  } catch (error) {
    return NextResponse.json({ message: 'Error al crear justificación', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id_justificacion } = data;

    if (!id_justificacion) {
      return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
    }

    const justificacionActualizada = await updateJustificacion(id_justificacion, data);
    if (!justificacionActualizada) {
      return NextResponse.json({ message: 'Justificación no encontrada' }, { status: 404 });
    }

    return NextResponse.json(justificacionActualizada);
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar justificación', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id_justificacion');

  if (!id) {
    return NextResponse.json({ message: 'ID no proporcionado' }, { status: 400 });
  }

  const justificacionEliminada = await deleteJustificacion(parseInt(id));
  if (!justificacionEliminada) {
    return NextResponse.json({ message: 'Justificación no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Justificación eliminada correctamente' });
}
