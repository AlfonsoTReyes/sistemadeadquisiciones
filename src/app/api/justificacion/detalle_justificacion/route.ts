import { NextRequest, NextResponse } from 'next/server';
import {
  updateJustificacion,
  createJustificacionDocumento, deleteJustificacionDetalle,
  getJustificacionDetalleById, getJustificacionDetalledByDOCS
} from '../../../../services/justificacionservice';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../../../../lib/cloudinary';

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

        const buffer = Buffer.from(await archivo.arrayBuffer());
        const base64 = buffer.toString('base64');
        const dataURI = `data:${archivo.type};base64,${base64}`;
  
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: `justificacion_detalle/${id_justificacion}`,
          public_id: archivo.name.split('.').slice(0, -1).join('') + `_${Date.now()}`,
          resource_type: "auto",
        });
  
        // Registrar en la base de datos
        await createJustificacionDocumento({
          id_justificacion: Number(id_justificacion),
          seccion,
          nombre_original: uploadResponse.public_id,
          ruta_archivo: uploadResponse.secure_url,
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
      if (documento.nombre_original && documento.tipo_archivo) {
        let resourceType = "image";
      
        if (documento.tipo_archivo.startsWith("video/")) {
          resourceType = "video";
        } else if (
          documento.tipo_archivo.startsWith("application/") ||
          documento.tipo_archivo.startsWith("text/")
        ) {
          resourceType = "raw"; // para PDF, Word, Excel, etc.
        }
      
        try {
          await cloudinary.uploader.destroy(documento.nombre_original, {
            resource_type: resourceType,
          });
        } catch (cloudError) {
          console.warn("⚠️ No se pudo eliminar de Cloudinary:", cloudError);
        }
      }
      
  
      // Paso 3: Eliminar registro en base de datos
      await deleteJustificacionDetalle(parseInt(id));
  
      return NextResponse.json({ success: true, message: "Documento eliminado correctamente" });
    } catch (error) {
      console.error("❌ Error al eliminar documento:", error);
      return NextResponse.json({ message: "Error interno", error }, { status: 500 });
    }
  }
