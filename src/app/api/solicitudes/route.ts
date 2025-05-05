// 08 de diciembre de 2024

import { NextRequest, NextResponse } from "next/server";
import { getSolicitudes, getSolicitudesAll, getSolicitudByIdPDF, getSolicitudById, createSolicitud, updateSolicitud,
  getSolicitudByConcursos,
  getSolicitudesFiltradasPorEstatus,
  getSolicitudesAllFiltradasPorEstatus
 } from "../../../services/solicitudeservice";


// obtener todas las solicitudes o una en específico
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id_solicitud");
    const id_s = searchParams.get("id");
    const secretaria = searchParams.get("secretaria");
    const sistema = searchParams.get("sistema");
    const tipo = searchParams.get("tipo");
    const tipoordenes = searchParams.get("tipoordenes");

    if (tipo) {
      const solicitud = await getSolicitudByConcursos();
      if (!solicitud) {
        return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
      }
      return NextResponse.json(solicitud);
    }

    if (id) {
      const solicitud = await getSolicitudById(parseInt(id));
      if (!solicitud) {
        return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
      }
      return NextResponse.json(solicitud);
    }

    if (id_s) {
      const solicitud = await getSolicitudByIdPDF(parseInt(id_s));
      if (!solicitud) {
        return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
      }
      return NextResponse.json(solicitud);
    }
    const estatusPorTipo: Record<string, string[]> = {
      "1": ["En comite"],
      "2": ["En concurso"]
    };

    let solicitud;

    if (tipoordenes && estatusPorTipo[tipoordenes]) {
      // Es tipo 1 o 2 → usa método que filtra por estatus
      const estatus = estatusPorTipo[tipoordenes][0];

      if (sistema !== "UNIVERSAL") {
        if (secretaria) {
          solicitud = await getSolicitudesFiltradasPorEstatus(parseInt(secretaria), estatus);
        }
      } else {
        solicitud = await getSolicitudesAllFiltradasPorEstatus(estatus);
      }
    } else {
      // Otros tipos (sin filtro de estatus)
      if (sistema !== "UNIVERSAL") {
        if (secretaria) {
          solicitud = await getSolicitudes(parseInt(secretaria));
        }
      } else {
        solicitud = await getSolicitudesAll();
      }
    }

    if (!solicitud || solicitud.length === 0) {
      return NextResponse.json({ message: "No se encontraron solicitudes" }, { status: 404 });
    }

    return NextResponse.json(solicitud);
    // if(tipoordenes=="1"){
    //   if(sistema !=='UNIVERSAL'){
    //     if (secretaria) {
    //       const solicitud = await getSolicitudesOrdenes(parseInt(secretaria));
    //       if (!solicitud) {
    //         return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    //       }
    //       return NextResponse.json(solicitud);
    //     }
    //   }else{
    //     const solicitud = await getSolicitudesAllOrdenes();
    //       if (!solicitud) {
    //         return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    //       }
    //       return NextResponse.json(solicitud);
    //   }
    // } else{
    //   if(tipoordenes=="2"){
    //     if(sistema !=='UNIVERSAL'){
    //       if (secretaria) {
    //         const solicitud = await getSolicitudesConcursos(parseInt(secretaria));
    //         if (!solicitud) {
    //           return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    //         }
    //         return NextResponse.json(solicitud);
    //       }
    //     }else{
    //       const solicitud = await getSolicitudesAllConcursos();
    //         if (!solicitud) {
    //           return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    //         }
    //         return NextResponse.json(solicitud);
    //     }
    //   } else{
    //       if(sistema !=='UNIVERSAL'){
    //         if (secretaria) {
    //           const solicitud = await getSolicitudes(parseInt(secretaria));
    //           if (!solicitud) {
    //             return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    //           }
    //           return NextResponse.json(solicitud);
    //         }
    //       }else{
    //         const solicitud = await getSolicitudesAll();
    //           if (!solicitud) {
    //             return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    //           }
    //           return NextResponse.json(solicitud);
    //       }
    //   }
    // }

  } catch (error) {
    console.error("error al obtener solicitudes:", error);
    return NextResponse.json({ message: "error al obtener solicitudes", error }, { status: 500 });
  }
}

// registrar una nueva solicitud
export async function POST(req: NextRequest) {
  try {
    const { folio, motivo, monto, id_adjudicacion, secretaria, dependencia, lugar, asunto, necesidad, cotizacion, compra_servicio, nomina, usuario } = await req.json();
    let tipo;
    console.log(folio, motivo, monto, id_adjudicacion, secretaria, dependencia, lugar, asunto, necesidad, cotizacion, compra_servicio, nomina, usuario);
    if (!folio || !nomina || !secretaria || !motivo || !monto || !id_adjudicacion || !usuario) {
      return NextResponse.json({ message: "todos los campos son obligatorios" }, { status: 400 });
    }

    if(id_adjudicacion == 1 || id_adjudicacion == 3){
      tipo= 7;
    }else{
      tipo = 8;
    }
    const nuevaSolicitud = await createSolicitud({
      folio, motivo, monto, dependencia, nomina, secretaria,
      id_adjudicacion, estatus: "Pendiente", tipo, usuario, lugar, asunto, necesidad,
      cotizacion, compra_servicio
    });

    return NextResponse.json(nuevaSolicitud);
  } catch (error) {
    console.error("error al crear solicitud:", error);
    return NextResponse.json({ message: "error al crear solicitud", error }, { status: 500 });
  }
}

// actualizar solicitud
export async function PUT(req: NextRequest) {
  try {
    const { idSolicitud, folio, motivo, monto, id_adjudicacion,lugar, asunto, necesidad, cotizacion, compra_servicio
     } = await req.json();
    console.log(idSolicitud, folio, motivo, monto, id_adjudicacion);

    if (!idSolicitud) {
      return NextResponse.json({ message: "id de solicitud no proporcionado" }, { status: 400 });
    }

    let tipo;
    if(id_adjudicacion == 1){
      tipo= 7;
    }else{
      tipo = 8;
    }

    const solicitudActualizada = await updateSolicitud(idSolicitud, {
      folio,
      motivo,
      monto,
      id_adjudicacion,
      tipo,
      lugar,
      asunto,
      necesidad,
      cotizacion,
      compra_servicio
    });

    if (!solicitudActualizada) {
      return NextResponse.json({ message: "solicitud no encontrada" }, { status: 404 });
    }

    return NextResponse.json(solicitudActualizada);
  } catch (error) {
    console.log(error);
    console.error("error al actualizar solicitud:", error);
    return NextResponse.json({ message: "error al actualizar solicitud", error }, { status: 500 });
  }
}
