import { jsPDF } from "jspdf";

const generarPDFSolicitud = async (idSolicitud: number) => {
  try {
    const res = await fetch(`/api/solicitudes?id=${idSolicitud}`);
    if (!res.ok) throw new Error("no se pudo obtener la solicitud");
    const data = await res.json();
    console.log(data);

    const solicitud = data?.solicitud || {};

    const doc = new jsPDF();

    // 📌 Cargar imagen de fondo (debe estar en base64 o como URL pública)
    const imgUrl = "/images/oficio.png"; 
    const img = new Image();
    img.src = imgUrl;

    img.onload = () => {
      doc.addImage(img, "PNG", 0, 0, 210, 297); // A4 completo en mm

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      // contenido sobre la imagen
      doc.text(`DEPENDENCIA: ${solicitud.nombre_dependencia || "EL QUE INDICA"}`, 20, 30);
      doc.text(`NO. DE OFICIO: ${solicitud.folio || "N/A"}`, 20, 40);
      doc.text(`ASUNTO: ${solicitud.asunto || "EL QUE INDICA"}`, 20, 50);
      doc.text(`San Juan del Río, Querétaro., a ${solicitud.fecha_solicitud || "..."}`, 20, 60);

      doc.text(`LCDO. ${solicitud.nombre_dirigido || "..."}`, 20, 80);
      doc.text("SECRETARIO DE ADMINISTRACIÓN", 20, 87);
      doc.text("DEL MUNICIPIO DE SAN JUAN DEL RÍO, QRO.", 20, 94);
      doc.text("P R E S E N T E:", 20, 104);

      const cuerpo = `Por medio de la presente reciba un cordial saludo, asimismo solicito de su apoyo para la adquisición y/o contratación (según el caso) de ${solicitud.motivo || "(material y/o servicio)"}, mismos que son requeridos para ${solicitud.necesidad || "(descripción de la necesidad)"}, anexo a la presente cotización con la cual ${solicitud.cotizacion ? "adjunta" : "(en caso de contar con ella)"} cuento con ella y que puede revisar a través de mi solicitud en el sistema, así mismo copia de la suficiencia presupuestal con la que se cuenta para estar en condiciones de que pueda realizar la compra y/o servicio de ${solicitud.compra_servicio || "(compra y/o servicio)"}.\n\nSirva la presente para los trámites administrativos correspondientes, sin más por el momento le reitero mi consideración y respeto institucional.`;

      const lines = doc.splitTextToSize(cuerpo, 170);
      doc.text(lines, 20, 115);

      let y = 115 + lines.length * 6 + 10;
      doc.text("ATENTAMENTE", 20, y); y += 10;
      doc.text("“LEGADO DE BIEN COMÚN”", 20, y); y += 15;
      doc.text(`LIC. ${solicitud.nombre_usuario || "Nombre solicitante"}`, 20, y); y += 7;
      doc.text(`${solicitud.puesto_solicitante || "Puesto del solicitante"}`, 20, y); y += 15;
      doc.text(`CC. (${solicitud.cc || "Pedro del director de adquisiciones"})`, 20, y); y += 7;
      doc.text("Archivo", 20, y);

      // 👉 Abrir en otra pestaña
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    };
  } catch (error) {
    console.error("error al generar pdf:", error);
    alert("ocurrió un error al generar el pdf.");
  }
};

export default generarPDFSolicitud;
