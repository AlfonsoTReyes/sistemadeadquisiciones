import { NextRequest, NextResponse } from 'next/server';
import {
  updateJustificacion,
  createJustificacionDocumento, deleteJustificacionDetalle,
  getJustificacionDetalleById, getJustificacionDetalledByDOCS
} from '../../../../services/justificacionservice';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
    runtime: "nodejs"
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id_just');

    if (id) {
      const justificacion = await getJustificacionDetalledByDOCS(id);
      console.log(justificacion);
      if (!justificacion) {
        return NextResponse.json({ message: 'Justificación no encontrada' }, { status: 404 });
      }
      return NextResponse.json(justificacion);
    }

  } catch (error) {
    return NextResponse.json({ message: 'Error al obtener justificaciones', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";
  
      // Paso 2: Guardar documento (multipart/form-data)
      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
  
        const archivo = formData.get("archivo") as File;
        const seccion = formData.get("seccion")?.toString();
        const id_usuario = formData.get("id_usuario")?.toString();
        const comentario = formData.get("comentario")?.toString() || "";
        const id_justificacion = formData.get("id_justificacion")?.toString();
  
        if (!archivo || !seccion || !id_justificacion || !id_usuario) {
          return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
        }
  
        const extPermitidas = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
        if (!extPermitidas.includes(archivo.type)) {
          return NextResponse.json({ message: "Tipo de archivo no permitido" }, { status: 400 });
        }
  
        // Convertir archivo a buffer
        const buffer = Buffer.from(await archivo.arrayBuffer());
  
        // Crear carpeta: public/justificacion/{id_justificacion}
        const folderPath = path.join(process.cwd(), "public", "justificacion_detalle", id_justificacion);
        await mkdir(folderPath, { recursive: true });
  
        // Generar nombre único y guardar
        const nombreOriginal = archivo.name;
        const nombreArchivo = `${uuidv4()}_${nombreOriginal}`;
        const filePath = path.join(folderPath, nombreArchivo);
        await writeFile(filePath, buffer);
  
        const rutaPublica = `justificacion/${id_justificacion}/${nombreArchivo}`;
  
        // Registrar en la base de datos
        await createJustificacionDocumento({
          id_justificacion: Number(id_justificacion),
          seccion,
          nombre_original: nombreOriginal,
          ruta_archivo: rutaPublica,
          tipo_archivo: archivo.type,
          id_usuario: Number(id_usuario),
          comentario,
          estatus: "Activo",
        });
  
        return NextResponse.json({ success: true, message: "Archivo guardado y registrado correctamente" });
      }
  
      return NextResponse.json({ message: "Tipo de contenido no soportado" }, { status: 400 });
    } catch (error) {
        console.log(error);
      console.error("❌ Error al subir archivo:", error);
      return NextResponse.json({ message: "Error interno", error }, { status: 500 });
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
    const id = searchParams.get("id");
  
    if (!id) {
      return NextResponse.json({ message: "ID no proporcionado" }, { status: 400 });
    }
  
    try {
      // Paso 1: Obtener el documento desde la BD
      const documento = await getJustificacionDetalleById(id);
      if (!documento) {
        return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });
      }
  
      // Paso 2: Eliminar el archivo físico
      const rutaFisica = path.join(process.cwd(), "public", documento.ruta_archivo);
      try {
        await unlink(rutaFisica);
      } catch (fsError) {
        console.warn("⚠️ No se pudo eliminar el archivo físico:", fsError);
        // no detenemos el proceso si el archivo ya no existe
      }
  
      // Paso 3: Eliminar registro en base de datos
      await deleteJustificacionDetalle(parseInt(id));
  
      return NextResponse.json({ success: true, message: "Documento eliminado correctamente" });
    } catch (error) {
      console.error("❌ Error al eliminar documento:", error);
      return NextResponse.json({ message: "Error interno", error }, { status: 500 });
    }
  }
