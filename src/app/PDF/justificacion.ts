import { jsPDF } from "jspdf";

const generarPDFJustificacion = async (idSolicitud: number) => {
  try {
    const res = await fetch(`/api/justificacion?id=${idSolicitud}`);
    if (!res.ok) throw new Error("no se pudo obtener la justificación");

    const data = await res.json();

    const {
      lugar,
      fecha_hora,
      no_oficio,
      asunto,
      nombre_dirigido,
      planteamiento,
      antecedente,
      necesidad,
      fundamento_legal,
      uso,
      consecuencias,
      historicos_monetarios,
      marcas_especificas,
      nombre_usuario,
      apellido_usuario,
      puesto_usuario,
    } = data;

    const doc = new jsPDF();

    // márgenes definidos
    const margenTop = 50;
    const margenBot = 25;
    const margenIzq = 30;
    const margenDer = 30;
    const anchoPagina = 210;
    const altoPagina = 297;
    const anchoTexto = anchoPagina - margenIzq - margenDer;
    const centerX = margenIzq + anchoTexto / 2;

    const img = new Image();
    img.src = "/images/oficio.png";

    const formatearFecha = (fechaIso: string): string => {
      const fecha = new Date(fechaIso);
      return fecha.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    img.onload = () => {
      doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      let y = margenTop;

      const drawLineRightAligned = (label: string, value: string) => {
        const labelWidth = doc.getTextWidth(label);
        const valueWidth = doc.getTextWidth(value);
        const startX = anchoPagina - margenDer - (labelWidth + valueWidth);

        doc.setFont("helvetica", "normal");
        doc.text(label, startX, y);
        doc.setFont("helvetica", "bold");
        doc.text(value, startX + labelWidth, y);
        y += 6;
      };

      // encabezado
      drawLineRightAligned("LUGAR: ", lugar?.toUpperCase() || "N/A");
      drawLineRightAligned("NO. DE OFICIO: ", no_oficio?.toUpperCase() || "N/A");
      drawLineRightAligned("ASUNTO: ", asunto?.toUpperCase() || "N/A");

      doc.setFont("helvetica", "normal");
      const fechaFormateada = fecha_hora ? formatearFecha(fecha_hora) : "...";
      doc.text(`San Juan del Río, Querétaro., a ${fechaFormateada}`, anchoPagina - margenDer, y + 5, {
        align: "right",
      });

      // destinatario
      y = 80;
      doc.setFont("helvetica", "bold");
      doc.text(`LCDO. ${nombre_dirigido || "..."}`, margenIzq, y); y += 6;
      doc.text("SECRETARIO DE ADMINISTRACIÓN", margenIzq, y); y += 6;
      doc.text("DEL MUNICIPIO DE SAN JUAN DEL RÍO, QRO.", margenIzq, y); y += 6;
      doc.text("P R E S E N T E:", margenIzq, y); y += 10;

      // contenido del cuerpo
      doc.setFont("helvetica", "normal");
      const cuerpo = `
PLANTEAMIENTO:
${planteamiento || "N/A"}

ANTECEDENTE:
${antecedente || "N/A"}

NECESIDAD:
${necesidad || "N/A"}

FUNDAMENTO LEGAL:
${fundamento_legal || "N/A"}

USO:
${uso || "N/A"}

CONSECUENCIAS:
${consecuencias || "N/A"}

HISTÓRICOS MONETARIOS:
${historicos_monetarios || "N/A"}

MARCAS ESPECÍFICAS:
${marcas_especificas || "N/A"}
      `.trim();

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

      // firma final
      y += 10;
      if (y + 30 > altoPagina - margenBot) {
        doc.addPage();
        doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
        y = margenTop;
      }

      doc.setFont("helvetica", "normal");
      doc.text("ATENTAMENTE", centerX, y, { align: "center" }); y += 10;
      doc.text("“LEGADO DE BIEN COMÚN”", centerX, y, { align: "center" }); y += 15;
      doc.text(`LIC. ${nombre_usuario || ""} ${apellido_usuario || ""}`, centerX, y, { align: "center" }); y += 7;
      doc.text(puesto_usuario || "Puesto del solicitante", centerX, y, { align: "center" });

      // generar pdf
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    };
  } catch (error) {
    console.error("error al generar el pdf:", error);
    alert("ocurrió un error al generar el pdf.");
  }
};

export default generarPDFJustificacion;
