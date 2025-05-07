import { NextRequest, NextResponse } from "next/server";
import { guardarDocumentoPreSuficiencia, obtenerTipoSuficiencia, getSuficienciaRespuesBySolicitud,
  obtenerDocumentoPorId, eliminarDocumentoAdicionalPorId, updateSuficienciaEstatusAtendido
} from "../../../services/suficienciaService";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { unlink } from "fs/promises";
import cloudinary from '../../../lib/cloudinary';


// GET: obtener todas o una suficiencia
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const suficiencia = await getSuficienciaRespuesBySolicitud(parseInt(id));
      if (!suficiencia) {
        return NextResponse.json({ message: "suficiencia no encontrada" }, { status: 404 });
      }
      return NextResponse.json(suficiencia);
    }
    
  } catch (error) {
    console.error("error al obtener suficiencias:", error);
    return NextResponse.json({ message: "error al obtener suficiencias", error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 🔹 Obtener los campos del formulario
    const archivo = formData.get("archivo") as File;
    const comentario = formData.get("comentario")?.toString() || "";
    const id_solicitud = formData.get("id_solicitud")?.toString();
    const userId = formData.get("userId")?.toString();

    // 🔍 Validación de campos
    if (!archivo || !id_solicitud || !userId) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (archivo.type !== "application/pdf") {
      return NextResponse.json({ message: "Solo se permiten archivos PDF" }, { status: 400 });
    }

    // ✅ **Subida directa a Cloudinary (usando Data URI)**
    const buffer = Buffer.from(await archivo.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataURI = `data:${archivo.type};base64,${base64}`;

    // 📌 **Obtener el tipo de suficiencia**
    const tipo = await obtenerTipoSuficiencia(Number(id_solicitud));

    // 🔍 **Determinar la carpeta según el tipo**
    const folderPath = tipo === "Suficiencia" ? "Suficiencia" : "Pre-suficiencia";

    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: `${folderPath}/${id_solicitud}`,
      public_id: `${tipo}_${Date.now()}`,
      resource_type: "auto",
    });


    // 🌐 **Guardar en la Base de Datos**
    const resultado = await guardarDocumentoPreSuficiencia({
      id_suficiencia: Number(id_solicitud),
      tipo_documento: tipo,
      nombre_original: uploadResponse.public_id,   // Guardamos el ID público generado
      ruta_archivo: uploadResponse.secure_url,     // Guardamos la URL de Cloudinary
      estatus: "Atendido",
      id_usuario: Number(userId),
    });

    // ✅ **Actualizar estatus**
    await updateSuficienciaEstatusAtendido(
      Number(id_solicitud),
      "Atendido"
    );

    // 🔄 **Respuesta exitosa**
    return NextResponse.json({ message: "Documento guardado correctamente", resultado }, { status: 200 });
  } catch (error) {
    console.error("Error al subir documento:", error);
    return NextResponse.json({ message: "Error al subir documento", error }, { status: 500 });
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

    // Eliminar desde Cloudinary
    if (documento.nombre_original) {
      try {
        await cloudinary.uploader.destroy(documento.nombre_original, {
          resource_type: "raw"
        });
      } catch (cloudError) {
        console.warn("⚠️ No se pudo eliminar de Cloudinary:", cloudError);
      }
    }

    // Eliminar de la base de datos
    await eliminarDocumentoAdicionalPorId(parseInt(id));

    return NextResponse.json({ success: true, message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return NextResponse.json({ message: "Error al eliminar documento", error }, { status: 500 });
  }
}
