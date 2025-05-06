// src/app/api/notificaciones/route.ts (CORREGIDO Y CON MÁS LOGS)
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const idUsuarioParam = searchParams.get("idusuario");
        const idRolParam = searchParams.get("idrol");

        // Log para ver qué parámetros llegan
        console.log(`API GET Notificaciones - Received params: idusuario=${idUsuarioParam}, idrol=${idRolParam}`);

        // Convertir a número si existen, manejar NaN. Usar null si no viene o es inválido.
        const idUsuario = idUsuarioParam ? parseInt(idUsuarioParam, 10) : null;
        const idRol = idRolParam ? parseInt(idRolParam, 10) : null;

        // Validar que los parámetros parseados sean números si existían originalmente
        if (idUsuarioParam && (idUsuario === null || isNaN(idUsuario))) {
            console.error("API GET Notificaciones - Invalid idusuario:", idUsuarioParam);
            return NextResponse.json({ message: "ID de usuario inválido" }, { status: 400 });
        }
        if (idRolParam && (idRol === null || isNaN(idRol))) {
            console.error("API GET Notificaciones - Invalid idrol:", idRolParam);
            return NextResponse.json({ message: "ID de rol inválido" }, { status: 400 });
        }

        // *** CORRECCIÓN LÓGICA: Requiere al menos un ID VÁLIDO (numérico) ***
        if (idUsuario === null && idRol === null) {
            console.error("API GET Notificaciones - No valid idusuario or idrol provided.");
            // El mensaje original era confuso, este es más claro
            return NextResponse.json({ message: "Se requiere un ID de usuario o de rol válido." }, { status: 400 });
        }

        console.log(`API GET Notificaciones: Buscando para Usuario ${idUsuario}, Rol ${idRol}`);

        // Construir condiciones WHERE dinámicamente
        let conditions: string[] = [];
        let params: (number | string)[] = [];
        let paramIndex = 1;

        // Añadir condición de usuario SOLO si idUsuario es un número válido
        if (idUsuario !== null) {
            conditions.push(`(destino_tipo = 'usuario' AND id_usuario_destino = $${paramIndex++})`);
            params.push(idUsuario);
        }
        // Añadir condición de rol SOLO si idRol es un número válido
        if (idRol !== null) {
            conditions.push(`(destino_tipo = 'rol' AND $${paramIndex++} = ANY(id_rol_destino))`);
            params.push(idRol);
        }

        // Si no hay condiciones válidas (no debería pasar por el check anterior, pero por seguridad)
        if (conditions.length === 0) {
            console.warn("API GET Notificaciones: No conditions generated, returning empty.");
            return NextResponse.json({ notificaciones: [] });
        }

        // Unir condiciones con OR
        const whereClause = `WHERE fue_leida = false AND (${conditions.join(' OR ')})`;

        const query = `
      SELECT id_notificacion, mensaje, fue_leida, fecha_creacion
      FROM notificaciones
      ${whereClause}
      ORDER BY fecha_creacion DESC
      LIMIT 50;
    `;

        console.log("API GET Notificaciones Query:", query, "Params:", params);
        const result = await sql.query(query, params);
        console.log(`API GET Notificaciones: Encontradas ${result.rows.length} notificaciones.`);

        return NextResponse.json({ notificaciones: result.rows });

    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}

// --- La función PUT no necesita cambios ---
export async function PUT(req: NextRequest) {
    // ... (código PUT existente) ...
    try {
        const { searchParams } = new URL(req.url);
        const idParam = searchParams.get("id");

        if (!idParam) return NextResponse.json({ message: "Falta el ID de la notificación" }, { status: 400 });
        const id = parseInt(idParam, 10);
        if (isNaN(id)) return NextResponse.json({ message: "ID de notificación inválido" }, { status: 400 });

        console.log(`API PUT Notificaciones: Marcando como leída ID ${id}`);

        const result = await sql`
          UPDATE notificaciones
          SET fue_leida = true, fecha_leida = NOW()
          WHERE id_notificacion = ${id}
          RETURNING id_notificacion;
        `;

        if (result.rowCount === 0) return NextResponse.json({ message: "Notificación no encontrada" }, { status: 404 });

        console.log(`API PUT Notificaciones: Notificación ${id} marcada como leída.`);
        return NextResponse.json({ message: "Notificación marcada como leída" });

    } catch (error) {
        console.error("Error al actualizar notificación:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}