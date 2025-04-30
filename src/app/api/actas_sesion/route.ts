import { NextRequest, NextResponse } from "next/server";
import { guardarActaSesion, guardarAsistentesActa, firmarAsistente,
  obtenerActaPorActa, obtenerAsistentesPorOrdenDia, solicitarCorreccionActa
 } from "../../../services/actaservice";



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usuario = searchParams.get("usuario");
    const sistema = searchParams.get("sistema");
    const id = searchParams.get("id");
    const acta = searchParams.get("orden");

    if (id) {
        const orden = await obtenerActaPorActa(parseInt(id));
        if (!orden) {
            return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
        }
        return NextResponse.json(orden);
    }

    if (acta) {
      const orden = await obtenerAsistentesPorOrdenDia(parseInt(acta));
      if (!orden) {
          return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
      }
      return NextResponse.json(orden);
  }


    // if(sistema !=='UNIVERSAL'){
    //   if (usuario) {
    //     const orden = await obtenerOrdenDiaParticipantesConfirmacionPorId(parseInt(usuario));
    //     if (!orden) {
    //         return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
    //     }
    //     return NextResponse.json(orden);
    //   }
    // }else{
    //   const solicitud = await obtenerOrdenDiaParticipantesAll();
    //     if (!solicitud) {
    //       return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    //     }
    //     return NextResponse.json(solicitud);
    // }


  } catch (error) {
    console.error("error al obtener órdenes del día:", error);
    return NextResponse.json({ message: "error interno", error }, { status: 500 });
  }
}

// POST: Guardar acta de sesión
export async function POST(req: NextRequest) {
  try {
    const {
      id_orden_dia,
      fecha_sesion,
      hora_inicio,
      hora_cierre,
      puntos_tratados,
      asuntos_generales,
      estatus,
      asistentes, 
    } = await req.json();

    if (
      !id_orden_dia || !fecha_sesion || !hora_inicio || !puntos_tratados || !Array.isArray(asistentes)
    ) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 🟢 Insertar acta
    const acta = await guardarActaSesion({
      id_orden_dia,
      fecha_sesion,
      hora_inicio,
      hora_cierre,
      puntos_tratados,
      asuntos_generales,
      estatus: estatus || "Pendiente",
    });

    // 🟢 Insertar asistentes vinculados al acta
    const id_acta = acta.id_acta;
    for (const asistente of asistentes) {
      await guardarAsistentesActa({
        id_acta,
        id_usuario: asistente.id_usuario,
        tipo_asistente: asistente.tipo_asistente,
        firma: asistente.firma || null,
        confirmado: asistente.confirmado || false,
      });
    }

    return NextResponse.json({ success: true, id_acta });
  } catch (error) {
    console.error("❌ Error al guardar acta de sesión:", error);
    return NextResponse.json({ message: "Error al guardar acta", error }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const { id_acta, id_usuario, comentario } = await req.json();

    if (!id_acta || !id_usuario) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (comentario) {
      // 👉 Es una solicitud de corrección
      const actualizado = await solicitarCorreccionActa(id_acta, id_usuario, comentario);
      if (!actualizado) {
        return NextResponse.json({ message: "No se pudo solicitar la corrección" }, { status: 404 });
      }
      return NextResponse.json({ success: true, tipo: "correccion" });
    }

    // 👉 Si no hay comentario, es firma
    const firmado = await firmarAsistente(id_acta, id_usuario);
    if (!firmado) {
      return NextResponse.json({ message: "Asistente no encontrado o no actualizado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, tipo: "firma", firmado });

  } catch (error) {
    console.error("❌ Error en PUT actas_sesion:", error);
    return NextResponse.json({ message: "Error interno", error }, { status: 500 });
  }
}

