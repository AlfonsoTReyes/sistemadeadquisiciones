import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { guardarDocumentoAdicional, obtenerDocumentosPorSolicitud, obtenerDocumentoPorId, eliminarDocumentoAdicionalPorId } from "../../../services/documentosoliservice";
import { unlink } from "fs/promises";
import cloudinary from '../../../lib/cloudinary';

// GET: obtener documentos por solicitud
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idSolicitud = searchParams.get("id_solicitud");

    if (!idSolicitud) {
      return NextResponse.json({ message: "id_solicitud es requerido" }, { status: 400 });
    }

    const docs = await obtenerDocumentosPorSolicitud(parseInt(idSolicitud));
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return NextResponse.json({ message: "error en servidor", error }, { status: 500 });
  }
}

// POST: subir documento
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("archivo") as File;
    const tipo_documento = formData.get("tipo_documento") as string;
    const id_solicitud = formData.get("id_solicitud") as string;
    const id_usuario = formData.get("userId") as string | null;

    if (!file || !tipo_documento || !id_solicitud || !id_usuario) {
      return NextResponse.json({ message: "faltan campos" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: `documentos_adicionales/${id_solicitud}`,
      public_id: `${tipo_documento}_${Date.now()}`,
      resource_type: file.type.startsWith("application/") ? "raw" : "auto",
    });

    
    const savedDoc = await guardarDocumentoAdicional({
      id_solicitud: parseInt(id_solicitud),
      tipo_documento,
      nombre_original: uploadResponse.public_id,
      ruta_archivo: uploadResponse.secure_url,
      id_usuario: parseInt(id_usuario),
      estatus: "pendiente"
    });

    return NextResponse.json(savedDoc);
  } catch (error) {
    console.error("Error al subir documento:", error);
    return NextResponse.json({ message: "error al subir documento", error }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "id es requerido" }, { status: 400 });
    }

    const documento = await obtenerDocumentoPorId(parseInt(id));

    if (!documento) {
      return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });
    }

    // eliminar archivo físico
    if (documento.nombre_original && documento.tipo_archivo) {
      let resourceType = "image";
      if (documento.tipo_archivo.startsWith("video/")) {
        resourceType = "video";
      } else if (
        documento.tipo_archivo.startsWith("application/") ||
        documento.tipo_archivo.startsWith("text/")
      ) {
        resourceType = "raw";
      }

      try {
        await cloudinary.uploader.destroy(documento.nombre_original, {
          resource_type: resourceType,
        });
      } catch (cloudError) {
        console.warn("⚠️ No se pudo eliminar de Cloudinary:", cloudError);
      }
    }

    // eliminar de la base de datos
    await eliminarDocumentoAdicionalPorId(parseInt(id));

    return NextResponse.json({ success: true, message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return NextResponse.json({ message: "Error al eliminar documento", error }, { status: 500 });
  }
}