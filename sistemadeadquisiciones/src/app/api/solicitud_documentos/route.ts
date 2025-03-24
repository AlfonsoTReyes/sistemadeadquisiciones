import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { guardarDocumentoAdicional, obtenerDocumentosPorSolicitud } from "../../../services/documentosoliservice";

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

    // crea la carpeta public/tipo/id_solicitud
    const folderPath = path.join(
      process.cwd(),
      "public",
      tipo_documento,
      id_solicitud
    );
    await mkdir(folderPath, { recursive: true });

    const fileName = `${tipo_documento}_${uuidv4()}_${file.name}`;
    const filePath = path.join(folderPath, fileName);

    await writeFile(filePath, buffer);

    const ruta_archivo = `${tipo_documento}/${id_solicitud}/${fileName}`;

    const savedDoc = await guardarDocumentoAdicional({
      id_solicitud: parseInt(id_solicitud),
      tipo_documento,
      nombre_original: file.name,
      ruta_archivo,
      id_usuario: parseInt(id_usuario),
      estatus: "pendiente"
    });

    return NextResponse.json(savedDoc);
  } catch (error) {
    console.error("Error al subir documento:", error);
    return NextResponse.json({ message: "error al subir documento", error }, { status: 500 });
  }
}
