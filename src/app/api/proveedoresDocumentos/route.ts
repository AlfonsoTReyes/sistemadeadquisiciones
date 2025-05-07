// src/app/api/proveedoresDocumentos/route.ts <-- Ruta para acciones del PROVEEDOR sobre sus docs/comentarios

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
// Importar funciones del servicio del PROVEEDOR
import {
    guardarDocumentoProveedor,
    obtenerDocumentosPorProveedor,
    obtenerDocumentoProveedorPorId, // Necesaria para verificar pertenencia y obtener ruta
    eliminarDocumentoProveedor,
    obtenerComentariosPorDocumentoParaProveedor
} from "../../../services/documentoproveedorservice"; // Asegúrate que esta ruta sea correcta

// Importar función para obtener datos del proveedor logueado (del servicio de proveedor)
import { getProveedorByUserId } from "../../../services/proveedoresservice"; // Ajusta ruta a tu servicio principal de proveedor

// --- GET: Obtener documentos O comentarios ---
export async function GET(req: NextRequest) {
  console.log("API GET /proveedoresDocumentos (SIN AUTH - ¡RIESGO!)");
  try {
    const { searchParams } = new URL(req.url);
    const idProveedor = searchParams.get("id_proveedor");
    const idDocParaComentarios = searchParams.get("documentoIdParaComentarios");

    // --- Obtener Comentarios ---
    if (idDocParaComentarios) {
        const idDocumento = parseInt(idDocParaComentarios, 10);
        if (isNaN(idDocumento)) return NextResponse.json({ message: 'ID documento inválido.' }, { status: 400 });
        // Falta validación de pertenencia!
        const comentarios = await obtenerComentariosPorDocumentoParaProveedor(idDocumento);
        return NextResponse.json(comentarios ?? []);
    }
    // --- Obtener Documentos ---
    else if (idProveedor) {
        const providerIdNum = parseInt(idProveedor, 10);
        if (isNaN(providerIdNum)) return NextResponse.json({ message: 'ID proveedor inválido.' }, { status: 400 });
        // Falta validación de pertenencia!
        const docs = await obtenerDocumentosPorProveedor(providerIdNum);
        return NextResponse.json(docs ?? []);
    }
    else {
        return NextResponse.json({ message: 'Se requiere "id_proveedor" o "documentoIdParaComentarios".' }, { status: 400 });
    }

  } catch (error: any) {
      console.error("Error GET /proveedoresDocumentos (Proveedor):", error);
      return NextResponse.json({ message: error.message || 'Error en el servidor al obtener datos.' }, { status: 500 });
  }
}

// --- POST: Subir nuevo documento por el PROVEEDOR ---
// (Asumiendo que el proveedor NO crea comentarios)
export async function POST(req: NextRequest) {
  console.log("API POST /proveedoresDocumentos (SIN AUTH - ¡RIESGO!): Handling file upload.");
  try {
      const formData = await req.formData();
      const file = formData.get("archivo") as File | null;
      const tipo_documento = formData.get("tipo_documento") as string | null;
      const id_proveedor_str = formData.get("id_proveedor") as string | null; // ID del proveedor al que pertenece
      const id_usuario_str = formData.get("userId") as string | null;      // ID del usuario que supuestamente sube

      // Validaciones básicas de los datos recibidos del form
      if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ message: "Archivo inválido o faltante." }, { status: 400 });
      if (!tipo_documento?.trim()) return NextResponse.json({ message: "Tipo de documento requerido." }, { status: 400 });
      if (!id_proveedor_str || isNaN(parseInt(id_proveedor_str, 10))) return NextResponse.json({ message: "ID de proveedor inválido." }, { status: 400 });
      if (!id_usuario_str || isNaN(parseInt(id_usuario_str, 10))) return NextResponse.json({ message: "ID de usuario (userId) inválido." }, { status: 400 });

      const id_proveedor = parseInt(id_proveedor_str, 10);
      const id_usuario = parseInt(id_usuario_str, 10); // Se asume que este es el id_usuario_proveedor

      // --- Lógica para guardar archivo ---
      const buffer = Buffer.from(await file.arrayBuffer());
      // Usar el ID PROVEEDOR proporcionado en la ruta
      const folderPath = path.join(process.cwd(), "public", "uploads", tipo_documento, id_proveedor_str);
      await mkdir(folderPath, { recursive: true });
      const uniqueSuffix = uuidv4();
      const fileExtension = path.extname(file.name);
      const baseName = path.basename(file.name, fileExtension);
      const safeBaseName = baseName.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);
      const fileName = `${tipo_documento}_${safeBaseName}_${uniqueSuffix}${fileExtension}`;
      const filePath = path.join(folderPath, fileName);
      await writeFile(filePath, buffer);
      // Guardar ruta relativa a 'public'
      const ruta_archivo = `uploads/${tipo_documento}/${id_proveedor_str}/${fileName}`;
      // --- Fin lógica guardar archivo ---

      console.log(`API POST: Calling service guardarDocumentoProveedor with provided IDs`);
      // Llama al servicio pasando los IDs recibidos del formulario
      const savedDoc = await guardarDocumentoProveedor({
          id_proveedor: id_proveedor,
          tipo_documento,
          nombre_original: file.name,
          ruta_archivo,
          id_usuario_proveedor: id_usuario, // Se usa el ID enviado en 'userId'
          estatusInicial: "PENDIENTE_REVISION"
      });

      return NextResponse.json(savedDoc, { status: 201 });

  } catch (error: any) {
      console.error("Error POST /proveedoresDocumentos (Upload SIN AUTH):", error);
      // Simplificar mensaje de error ya que no hay contexto de sesión
      return NextResponse.json({ message: error.message || "Error al subir documento" }, { status: 500 });
  }
}


// --- DELETE: Proveedor elimina SUS documentos ---
export async function DELETE(req: NextRequest) {
  try {
     const { searchParams } = new URL(req.url);
     const idDocParam = searchParams.get('id_documento_proveedor');
     if (!idDocParam) return NextResponse.json({ message: 'Falta "id_documento_proveedor".' }, { status: 400 });

     const idDocumento = parseInt(idDocParam, 10);
     if (isNaN(idDocumento)) return NextResponse.json({ message: 'ID de documento inválido.' }, { status: 400 });

     console.log(`API DELETE /proveedoresDocumentos (SIN AUTH): Request delete doc ID: ${idDocumento}`);

     // Obtener info del doc para borrar archivo físico
     const documento = await obtenerDocumentoProveedorPorId(idDocumento);
     if (!documento) return NextResponse.json({ message: "Documento no encontrado" }, { status: 404 });

     const filePath = path.join(process.cwd(), "public", documento.ruta_archivo);

     await eliminarDocumentoProveedor(idDocumento); // Llama al servicio

        // Intentar eliminar archivo físico
        try { await unlink(filePath); console.log(`API DELETE: Physical file deleted: ${filePath}`); }
        catch (fsError: any) { /* ... warning si no existe ... */ }

        return NextResponse.json({ success: true, message: "Documento eliminado." });

     } catch (error: any) {
        console.error("API Route DELETE /proveedoresDocumentos Error:", error);
        let status = 500; 
        const message = error.message || 'Error inesperado al eliminar.';
        if (message.includes("no encontrado")) status = 404;
        if (message.includes("inválido")) status = 400;
        // Capturar error de FK si el doc tiene comentarios y la FK es RESTRICT
        if (message.includes("tiene comentarios asociados")) status = 409; // Conflict
        return NextResponse.json({ message: message }, { status });
     }
}