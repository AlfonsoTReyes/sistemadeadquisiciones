// src/app/api/admin/proveedores/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Ajusta la ruta a tu archivo de servicio
import {
    getProveedorById,
    updateEstatusDocumentoProveedor // NECESITAS esta función del servicio
 } from '../../../services/adminproveedoresservice';
 import { obtenerDocumentosPorProveedor} from "../../../services/documentoproveedorservice";

// --- GET: Obtener documentos por id_proveedor (EXISTENTE Y CORRECTO) ---
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

// --- PUT: Actualizar ESTATUS de un documento específico (NUEVO/MODIFICADO) ---
// Espera { "id_documento_proveedor": number, "estatus": string | boolean } en el cuerpo
export async function PUT(req: NextRequest) {
    console.log("DEBUG API PUT /api/documentosProveedores: Request for document status update received.");
    try {
        // 1. Leer el cuerpo
        const data = await req.json();
        const { id_documento_proveedor, estatus: nuevoEstatus } = data; // Renombrar 'estatus' para claridad

        console.log(`DEBUG API PUT: Received body:`, data);

        // 2. Validar datos del cuerpo
        if (typeof id_documento_proveedor !== 'number' || isNaN(id_documento_proveedor)) {
            console.log("DEBUG API PUT: Invalid or missing 'id_documento_proveedor'.");
            return NextResponse.json({ message: 'Se requiere un "id_documento_proveedor" numérico válido en el cuerpo.' }, { status: 400 });
        }
        // Valida que el estatus exista (podrías validar valores específicos si usas strings)
        if (nuevoEstatus === undefined || nuevoEstatus === null) { // Ajusta si boolean '' es válido
             console.log("DEBUG API PUT: Missing 'estatus'.");
             return NextResponse.json({ message: 'Se requiere un valor para "estatus" en el cuerpo.' }, { status: 400 });
        }
         // VALIDACIÓN EXTRA (Opcional): Si usas strings, valida que sea uno de los permitidos
         /*
         const allowedStatus = ['Aprobado', 'Rechazado', 'Pendiente'];
         if (typeof nuevoEstatus === 'string' && !allowedStatus.includes(nuevoEstatus)) {
             return NextResponse.json({ message: `Estatus inválido. Valores permitidos: ${allowedStatus.join(', ')}` }, { status: 400 });
         }
         */

        console.log(`DEBUG API PUT: Calling service updateEstatusDocumentoProveedor for doc ID ${id_documento_proveedor} to status ${nuevoEstatus}`);
        // 3. Llamar al servicio para actualizar
        const documentoActualizado = await updateEstatusDocumentoProveedor(id_documento_proveedor, nuevoEstatus);

        console.log(`DEBUG API PUT: Document status update successful for ID ${id_documento_proveedor}`);
        // 4. Devolver respuesta
        return NextResponse.json(documentoActualizado);

    } catch (error: any) {
        console.error("ERROR PUT /api/documentosProveedores:", error);
        // Manejar error si el documento no se encontró
        if (error.message.includes("no encontrado")) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json(
            { message: error.message || "Error al actualizar el estatus del documento.", error: error.message },
            { status: 500 }
        );
    }
}
