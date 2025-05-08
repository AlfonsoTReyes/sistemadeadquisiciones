// src/app/api/admin/proveedores/route.ts <-- Ruta para operaciones admin sobre docs/comentarios

import { NextRequest, NextResponse } from 'next/server';
// *** CORRECCIÓN: Importar TODO desde el servicio de documentos ***
import {
    obtenerDocumentosPorProveedor,
    updateEstatusDocumentoProveedor,
    obtenerComentariosPorDocumento,
    crearComentarioDocumento,
    eliminarComentarioDocumento
} from '../../../services/documentoproveedorservice'; // <--- Asegúrate que esta ruta sea correcta

// --- GET: Obtener documentos O comentarios ---
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idProveedor = searchParams.get("id_proveedor");
    const idDocParaComentarios = searchParams.get("documentoIdParaComentarios");


    try {
        // --- CASO 1: Obtener Comentarios ---
        if (idDocParaComentarios) {
            const idDocumento = parseInt(idDocParaComentarios, 10);
            if (isNaN(idDocumento)) return NextResponse.json({ message: 'Parámetro "documentoIdParaComentarios" inválido.' }, { status: 400 });

            const comentarios = await obtenerComentariosPorDocumento(idDocumento);
            return NextResponse.json(comentarios ?? []);

        }
        // --- CASO 2: Obtener Documentos de un Proveedor ---
        else if (idProveedor) {
            const providerIdNum = parseInt(idProveedor, 10);
            if (isNaN(providerIdNum)) return NextResponse.json({ message: '"id_proveedor" inválido.' }, { status: 400 });

            const docs = await obtenerDocumentosPorProveedor(providerIdNum);
            return NextResponse.json(docs ?? []);
        }
        // --- CASO 3: Solicitud inválida ---
        else {
            return NextResponse.json({ message: 'Se requiere "id_proveedor" (para docs) o "documentoIdParaComentarios" (para comentarios).' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("API ROUTE GET /admin/proveedores (Docs/Comments) Error:", error);
        const status = error.message?.includes("no encontrado") ? 404 : 500; // Asumiendo que el servicio lanza "no encontrado"
        return NextResponse.json({ message: error.message || 'Error en el servidor al obtener datos.' }, { status });
    }
}

// --- PUT: Actualizar ESTATUS de un documento ---
export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const { id_documento_proveedor, estatus: nuevoEstatus } = data;

        // Validaciones
        if (typeof id_documento_proveedor !== 'number' || isNaN(id_documento_proveedor)) {
            return NextResponse.json({ message: 'Se requiere "id_documento_proveedor" numérico válido.' }, { status: 400 });
        }
        if (nuevoEstatus === undefined || nuevoEstatus === null) {
            return NextResponse.json({ message: 'Se requiere "estatus".' }, { status: 400 });
        }
        // ... (Validación opcional del valor de nuevoEstatus) ...

        // Llama a la función correcta del servicio importado
        const documentoActualizado = await updateEstatusDocumentoProveedor(id_documento_proveedor, nuevoEstatus);
        return NextResponse.json(documentoActualizado);

    } catch (error: any) {
        console.error("ERROR PUT /admin/proveedores (Doc Status):", error);
        const status = error.message.includes("no encontrado") ? 404 : 500;
        return NextResponse.json({ message: error.message || "Error al actualizar estatus del documento." }, { status });
    }
}

// --- POST: Crear Comentarios ---
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Asumir que POST aquí es solo para crear comentarios
        const { id_documento_proveedor, comentario, id_usuario_admin } = data; // Recibe id_usuario_admin del body

        // --- VALIDACIÓN DEL ID DE ADMIN RECIBIDO ---
        if (typeof id_usuario_admin !== 'number' || isNaN(id_usuario_admin)) {
            console.error("POST /adminProveedores: ID de admin inválido o faltante en el body.", data);
            return NextResponse.json({ message: 'ID de usuario administrador inválido o faltante.' }, { status: 400 });
        }
        // --- FIN VALIDACIÓN ID ADMIN ---

        // --- OBTENER ID REAL (SI USAS SEGURIDAD CORRECTA - RECOMENDADO) ---
        // DESCOMENTA y REEMPLAZA la línea anterior si implementas la seguridad:
        // const session = await auth(); // o tu método de sesión/token
        // if (!session?.user?.id) {
        //    return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
        // }
        // const idUsuarioAdminReal = parseInt(session.user.id, 10);
        // if (isNaN(idUsuarioAdminReal)) {
        //     return NextResponse.json({ message: 'ID de sesión inválido.' }, { status: 400 });
        // }
        // ------------------------------------------------------------------


        if (typeof id_documento_proveedor !== 'number' || isNaN(id_documento_proveedor)) {
            return NextResponse.json({ message: 'Se requiere "id_documento_proveedor" válido.' }, { status: 400 });
        }
        if (typeof comentario !== 'string' || comentario.trim() === '') {
            return NextResponse.json({ message: 'Se requiere "comentario" no vacío.' }, { status: 400 });
        }


        const nuevoComentarioData = {
            id_documento_proveedor,
            // Usar el ID validado del body (menos seguro) o el de la sesión (más seguro)
            id_usuario_admin: id_usuario_admin, // O idUsuarioAdminReal
            comentario: comentario.trim()
        };

        const comentarioCreado = await crearComentarioDocumento(nuevoComentarioData);
        return NextResponse.json(comentarioCreado, { status: 201 });

    } catch (error: any) {
        console.error("API Route POST /admin/proveedores Error Caught:", error);
        const status = 500;
        const message = error.message || 'Error inesperado al crear comentario.';
        // ... (manejo de errores específicos) ...
        return NextResponse.json({ message: message }, { status });
    }
}



// --- DELETE: Eliminar Comentarios ---
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        // Usar un nombre específico para el parámetro de comentario
        const idComentarioParam = searchParams.get('id_comentario');

        if (!idComentarioParam) {
            return NextResponse.json({ message: 'Falta el parámetro "id_comentario" para eliminar.' }, { status: 400 });
        }

        const idComentario = parseInt(idComentarioParam, 10);
        if (isNaN(idComentario)) {
            return NextResponse.json({ message: 'Parámetro "id_comentario" inválido.' }, { status: 400 });
        }


        // !!! VERIFICAR PERMISOS ADMIN AUTENTICADO !!!
        // const idUsuarioAdmin = await getIdFromSessionOrToken(req);
        // if (!idUsuarioAdmin) return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
        // ... (Opcional: verificar autoría si solo el creador puede borrar)
        // -----------------------------------------

        // Llama a la función correcta del servicio importado
        const resultado = await eliminarComentarioDocumento(idComentario);

        if (!resultado.success) {
            const status = resultado.message?.includes("no encontrado") ? 404 : 500;
            return NextResponse.json({ message: resultado.message || "Error al eliminar comentario." }, { status });
        }

        // Éxito
        return NextResponse.json({ message: 'Comentario eliminado exitosamente.' });

    } catch (error: any) {
        console.error("API Route DELETE /admin/proveedores (Comment) Error:", error);
        let status = 500;
        const message = error.message || 'Error inesperado al eliminar comentario.';
        if (message.includes("no encontrado")) status = 404;
        if (message.includes("inválido")) status = 400;
        return NextResponse.json({ message: message }, { status });
    }
}