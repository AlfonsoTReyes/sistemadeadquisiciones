import { jsPDF } from "jspdf";

const generarPDFSolicitud = async (idSolicitud: number) => {
  try {
    const res = await fetch(`/api/solicitudes?id=${idSolicitud}`);
    if (!res.ok) throw new Error("no se pudo obtener la solicitud");
    const solicitud = await res.json();

    const doc = new jsPDF();
    const img = new Image();
    img.src = "/images/oficio.png";

    const formatearFecha = (fechaIso: string) => {
      const fecha = new Date(fechaIso);
      return fecha.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    img.onload = () => {
      const margenTop = 50;
      const margenBot = 30;
      const margenIzq = 30;
      const margenDer = 30;
      const anchoPagina = 210;
      const altoPagina = 297;
      const anchoTexto = anchoPagina - margenIzq - margenDer;
      const centerX = margenIzq + anchoTexto / 2;

      let y = margenTop;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);

      const drawLineRightAligned = (label: string, value: string) => {
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(label);
        const valueWidth = doc.getTextWidth(value);
        const startX = anchoPagina - margenDer - (labelWidth + valueWidth);

        doc.text(label, startX, y);
        doc.setFont("helvetica", "bold");
        doc.text(value, startX + labelWidth, y);
        y += 6;
      };

      // encabezado
      drawLineRightAligned("DEPENDENCIA: ", solicitud.nombre_dependencia?.toUpperCase() || "EL QUE INDICA");
      drawLineRightAligned("NO. DE OFICIO: ", solicitud.folio?.toUpperCase() || "N/A");
      drawLineRightAligned("ASUNTO: ", solicitud.asunto?.toUpperCase() || "EL QUE INDICA");

      doc.setFont("helvetica", "normal");
      const fechaFormateada = solicitud.fecha_solicitud
        ? formatearFecha(solicitud.fecha_solicitud)
        : "...";
      doc.text(`San Juan del Río, Querétaro., a ${fechaFormateada}`, anchoPagina - margenDer, y + 5, {
        align: "right",
      });

      // destinatario
      y = 80;
      doc.setFont("helvetica", "bold");
      doc.text(`LCDO. ${solicitud.nombre_dirigido || "..."}`, margenIzq, y); y += 6;
      doc.text("SECRETARIO DE ADMINISTRACIÓN", margenIzq, y); y += 6;
      doc.text("DEL MUNICIPIO DE SAN JUAN DEL RÍO, QRO.", margenIzq, y); y += 6;
      doc.text("P R E S E N T E:", margenIzq, y); y += 10;

      doc.setFont("helvetica", "normal");
      const cuerpo = `Por medio de la presente reciba un cordial saludo, asimismo solicito de su apoyo para la adquisición y/o contratación (según el caso) de ${solicitud.motivo || "(material y/o servicio)"}, mismos que son requeridos para ${solicitud.necesidad || "(descripción de la necesidad)"}, anexo a la presente cotización con la cual ${solicitud.cotizacion ? "adjunta" : "(en caso de contar con ella)"} cuento con ella y que puede revisar a través de mi solicitud en el sistema, así mismo copia de la suficiencia presupuestal con la que se cuenta para estar en condiciones de que pueda realizar la compra y/o servicio de ${solicitud.compra_servicio || "(compra y/o servicio)"}.\n\nSirva la presente para los trámites administrativos correspondientes, sin más por el momento le reitero mi consideración y respeto institucional.`;

      const lineas = doc.splitTextToSize(cuerpo, anchoTexto);
      const interlineado = 6;

      for (const linea of lineas) {
        if (y + interlineado > altoPagina - margenBot) {
          doc.addPage();
          doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
          y = margenTop;
        }
        doc.text(linea, margenIzq, y);
        y += interlineado;
      }

      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text("ATENTAMENTE", centerX, y, { align: "center" }); y += 10;
      doc.text("“LEGADO DE BIEN COMÚN”", centerX, y, { align: "center" }); y += 15;
      doc.text(`LIC. ${solicitud.nombre_usuario || "Nombre solicitante"} ${solicitud.apellido_usuario || ""}`, centerX, y, { align: "center" }); y += 7;
      doc.text(`${solicitud.puesto_usuario || "Puesto del solicitante"}`, centerX, y, { align: "center" }); y += 15;
      doc.text(`CC. (${solicitud.cc || "Pedro del director de adquisiciones"})`, margenIzq, y);

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    };
  } catch (error) {
    console.error("error al generar el pdf:", error);
    alert("ocurrió un error al generar el pdf.");
  }
};

export default generarPDFSolicitud;
