import { NextRequest, NextResponse } from "next/server";
import {
  obtenerOrdenesDia,
  obtenerOrdenDiaPorId, obtenerOrdenDiaParticipantesPorId, obtenerOrdenDiaParticipantesConfirmacionPorId,
  crearOrdenDia, obtenerOrdenDiaParticipantesAll,
  actualizarOrdenDia, eliminarParticipantesOrdenDia, actualizarPuntosOrdenDia, 
  eliminarOrdenDia, obtenerOrdenDiaPorIdUno, actualizarEstatusOrdenDia
} from "../../../services/ordendiaservice";
import {
    createConfirmacion, 
  } from "../../../services/confirmacionordenservices";
import {
  obtenerActaPorOrden, 
} from "../../../services/actaservice";
import { updateSolicitudEstatus } from "../../../services/solicitudeservice";
import { enviarNotificacionUsuario } from "../../../services/notificaciooneservice";


// GET: obtener todas o una por solicitud
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const solicitud = searchParams.get("solicitud");
    const participantes = searchParams.get("participantes");
    const usuario = searchParams.get("usuario");
    const sistema = searchParams.get("sistema");
    const id = searchParams.get("id");

    if (solicitud) {
      const ordenes = await obtenerOrdenDiaPorId(parseInt(solicitud));
    
      if (!ordenes) {
        return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
      }
    
      // Consultar acta para cada orden
      const ordenesConActa = await Promise.all(
        ordenes.map(async (orden) => {
          const acta = await obtenerActaPorOrden(orden.id_orden_dia);
          return {
            ...orden,
            acta: acta || null,
          };
        })
      );
    
      return NextResponse.json(ordenesConActa);
    }
    
    
    

    if (id) {
        const orden = await obtenerOrdenDiaPorIdUno(parseInt(id));
        if (!orden) {
            return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
        }
        return NextResponse.json(orden);
    }

    if (participantes) {
      const orden = await obtenerOrdenDiaParticipantesPorId(parseInt(participantes));
      if (!orden) {
          return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
      }
      return NextResponse.json(orden);
    }


    if(sistema !=='UNIVERSAL'){
      if (usuario) {
        const orden = await obtenerOrdenDiaParticipantesConfirmacionPorId(parseInt(usuario));
        if (!orden) {
            return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
        }
        return NextResponse.json(orden);
      }
    }else{
      const solicitud = await obtenerOrdenDiaParticipantesAll();
        if (!solicitud) {
          return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
        }
        return NextResponse.json(solicitud);
    }


    const ordenes = await obtenerOrdenesDia();
    return NextResponse.json(ordenes);
  } catch (error) {
    console.error("error al obtener órdenes del día:", error);
    return NextResponse.json({ message: "error interno", error }, { status: 500 });
  }
}

// POST: crear nueva orden del día
export async function POST(req: NextRequest) {
  try {
    const {
      id_solicitud,
      id_evento,
      asunto_general,
      no_oficio,
      hora,
      puntos_tratar,
      participantes_base,
      usuarios_invitados,
      userId
    } = await req.json();

    if (!id_solicitud || !asunto_general || !no_oficio || !hora || !puntos_tratar || !participantes_base || !usuarios_invitados) {
      return NextResponse.json({ message: "faltan campos obligatorios" }, { status: 400 });
    }

    const nueva = await crearOrdenDia({
      id_solicitud,
      asunto_general,
      no_oficio,
      lugar: 'San Juan del Rio, qro',
      hora: hora.split("T")[1] + ":00",
      puntos_tratar,
      id_evento
    });

    const id_orden_dia = nueva.id_orden_dia;

    // 🟢 Registrar participantes base
    for (const id_usuario of participantes_base) {
      await createConfirmacion({
        id_orden_dia,
        id_usuario,
        tipo_usuario: 'base'
      });

      await enviarNotificacionUsuario({
        titulo: `Invitación para Orden del Día ${asunto_general}`,
        mensaje: `Orden del Día ${no_oficio} con el asunto "${asunto_general} a la hora: ${hora}".`,
        tipo: 'Invitación',
        id_usuario_origen: userId, // Aquí puedes cambiar el ID del origen si es necesario
        id_usuario_destino: id_usuario,
        destino_tipo: 'usuario',
      });
    }

    // 🟢 Registrar usuarios invitados
    for (const id_usuario of usuarios_invitados) {
      await createConfirmacion({
        id_orden_dia,
        id_usuario,
        tipo_usuario: 'invitado'
      });

      await enviarNotificacionUsuario({
        titulo: `Invitación para Orden del Día ${asunto_general}`,
        mensaje: `Orden del Día ${no_oficio} con el asunto "${asunto_general} a la hora: ${hora}".`,
        tipo: 'Invitación',
        id_usuario_origen:userId, // Aquí puedes cambiar el ID del origen si es necesario
        id_usuario_destino: id_usuario,
        destino_tipo: 'usuario',
      });
    }

    const resultado = await updateSolicitudEstatus(id_solicitud, "En comite");

    return NextResponse.json(nueva);
  } catch (error) {
    console.error("error al crear orden del día:", error);
    return NextResponse.json({ message: "error al crear orden del día", error }, { status: 500 });
  }
}

// PUT: actualizar orden del día
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id_orden_dia,
      estatus,
      asunto_general,
      no_oficio,
      id_evento,
      hora,
      puntos_tratar,
      participantes_base,
      usuarios_invitados,
      tipo_formulario,
    } = body;

    if (!id_orden_dia) {
      return NextResponse.json({ message: "id requerido para actualizar" }, { status: 400 });
    }

    // 👉 Si viene estatus y NO viene tipo_formulario, significa que solo quieres actualizar estatus
    if (estatus && !tipo_formulario) {
      const actualizado = await actualizarEstatusOrdenDia(id_orden_dia, estatus);

      if (!actualizado) {
        return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Estatus actualizado correctamente" });
    }

    // 👉 Si viene tipo_formulario 1 (actualizar info general)
    if (tipo_formulario == 1) {
      const actualizado = await actualizarOrdenDia(id_orden_dia, {
        id_evento,
        hora: hora.split("T")[1] + ":00",
        no_oficio,
        asunto_general,
      });

      if (!actualizado) {
        return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
      }
      return NextResponse.json(actualizado);
    } 
    // 👉 Si tipo_formulario NO es 1 (actualizar puntos y participantes)
    else {
      const eliminar = await eliminarParticipantesOrdenDia(id_orden_dia);

      const actualizado = await actualizarPuntosOrdenDia(id_orden_dia, {
        puntos_tratar,
      });

      for (const id_usuario of participantes_base) {
        await createConfirmacion({
          id_orden_dia,
          id_usuario,
          tipo_usuario: "base",
        });
      }

      for (const id_usuario of usuarios_invitados) {
        await createConfirmacion({
          id_orden_dia,
          id_usuario,
          tipo_usuario: "invitado",
        });
      }

      if (!actualizado && !eliminar) {
        return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
      }
      return NextResponse.json(actualizado);
    }

  } catch (error) {
    console.error("error al actualizar orden del día:", error);
    return NextResponse.json({ message: "error al actualizar orden del día", error }, { status: 500 });
  }
}


// DELETE: eliminar orden del día
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "id requerido para eliminar" }, { status: 400 });
    }

    const eliminado = await eliminarOrdenDia(parseInt(id));
    if (!eliminado) {
      return NextResponse.json({ message: "orden del día no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "orden del día eliminada con éxito" });

  } catch (error) {
    console.error("error al eliminar orden del día:", error);
    return NextResponse.json({ message: "error al eliminar orden del día", error }, { status: 500 });
  }
}
