import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { guardarDocumentoUsuarioAdicional, obtenerDocumentosPorProveedor, obtenerDocumentoProveedorPorId, eliminarDocumentoAdicionalPorId } from "../../../services/documentoproveedorservice";
import { unlink } from "fs/promises";


// GET: obtener documentos por solicitud
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idProveedor = searchParams.get("id_proveedor");

    if (!idProveedor) {
      return NextResponse.json({ message: "id_proveedor es requerido" }, { status: 400 });
    }

    const docs = await obtenerDocumentosPorProveedor(parseInt(idProveedor));
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
    const id_proveedor = formData.get("id_proveedor") as string;
    const id_usuario = formData.get("userId") as string | null;

    if (!file || !tipo_documento || !id_proveedor || !id_usuario) {
      return NextResponse.json({ message: "faltan campos" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // crea la carpeta public/tipo/id_proveedor
    const folderPath = path.join(
      process.cwd(),
      "public",
      tipo_documento,
      id_proveedor
    );
    await mkdir(folderPath, { recursive: true });

    const fileName = `${tipo_documento}_${uuidv4()}_${file.name}`;
    const filePath = path.join(folderPath, fileName);

    await writeFile(filePath, buffer);

    const ruta_archivo = `${tipo_documento}/${id_proveedor}/${fileName}`;

    const savedDoc = await guardarDocumentoUsuarioAdicional({
      id_proveedor: parseInt(id_proveedor),
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


export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "id es requerido" }, { status: 400 });
    }

    const documento = await obtenerDocumentoProveedorPorId(parseInt(id));

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