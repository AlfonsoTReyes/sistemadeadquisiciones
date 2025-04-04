import { NextRequest, NextResponse } from "next/server";
import { guardarDocumentoPreSuficiencia, obtenerTipoSuficiencia, getSuficienciaRespuesBySolicitud,
  obtenerDocumentoPorId, eliminarDocumentoAdicionalPorId, updateSuficienciaEstatusAtendido
} from "../../../services/suficienciaService";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { unlink } from "fs/promises";


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

    const archivo = formData.get("archivo") as File;
    const comentario = formData.get("comentario")?.toString() || "";
    const id_solicitud = formData.get("id_solicitud")?.toString();
    const userId = formData.get("userId")?.toString();

    if (!archivo || !id_solicitud || !userId) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (archivo.type !== "application/pdf") {
      return NextResponse.json({ message: "Solo se permiten archivos PDF" }, { status: 400 });
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());

    // Ruta: public/pre-suficiencia/{id_solicitud}
    const folderPath = path.join(process.cwd(), "public", "pre-suficiencia", id_solicitud);
    await mkdir(folderPath, { recursive: true });

    const fileName = `presuficiencia_${uuidv4()}_${archivo.name}`;
    const filePath = path.join(folderPath, fileName);
    await writeFile(filePath, buffer);

    const ruta_archivo = `pre-suficiencia/${id_solicitud}/${fileName}`;

    const tipo = await obtenerTipoSuficiencia(Number(id_solicitud));

    const resultado = await guardarDocumentoPreSuficiencia({
      id_suficiencia: Number(id_solicitud),
      tipo_documento: tipo,
      nombre_original: archivo.name,
      ruta_archivo,
      estatus: "Atendido",
      id_usuario: Number(userId),
    });

    const resultadoActivo = await updateSuficienciaEstatusAtendido(
      Number(id_solicitud),
      "Atendido"
    );

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

    // eliminar archivo físico
    const filePath = path.join(process.cwd(), "public", documento.ruta_archivo);
    try {
      await unlink(filePath);
    } catch (fsError) {
      console.warn("No se pudo eliminar el archivo físico:", fsError);
      // no detenemos el proceso si el archivo ya no existe
    }

    // eliminar de la base de datos
    await eliminarDocumentoAdicionalPorId(parseInt(id));

    return NextResponse.json({ success: true, message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return NextResponse.json({ message: "Error al eliminar documento", error }, { status: 500 });
  }
}