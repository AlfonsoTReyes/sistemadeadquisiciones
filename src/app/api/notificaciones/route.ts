import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idRol = searchParams.get("idrol");

    if (!idRol) {
      return NextResponse.json({ message: "Debe proporcionar usuario o rol" }, { status: 400 });
    }

    const rolArrayLiteral = `{${Number(idRol)}}`; // PostgreSQL array syntax

    const result = await sql`
      SELECT * FROM notificaciones
      WHERE
        fue_leida = false
        AND destino_tipo = 'rol'
        AND id_rol_destino && ${rolArrayLiteral}::int[]
      ORDER BY fecha_creacion DESC
      LIMIT 30;
    `;

    return NextResponse.json({ notificaciones: result.rows });
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Falta el ID de la notificación" }, { status: 400 });
    }

    console.log(id);

    const result = await sql`
      UPDATE notificaciones
      SET fue_leida = true,
          fecha_leida = NOW()
      WHERE id_notificacion = ${id}
      RETURNING *;
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Notificación no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notificación marcada como leída", notificacion: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar notificación:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
