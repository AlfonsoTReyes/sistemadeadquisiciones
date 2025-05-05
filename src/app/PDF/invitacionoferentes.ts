import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getInvitacionByConcurso } from "../peticiones_api/peticionInvitacion";

const handleGenerarPDF = async (idConcurso: number) => {
  try {
    const data = await getInvitacionByConcurso(idConcurso);

    if (!data || !data.numero_oficio || !data.fecha_hora_envio || !data.eventos) {
      alert("No se pudo cargar la información necesaria para el PDF.");
      return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = "/images/ordendia.png";

    const fechaTexto = new Date(data.fecha_hora_envio).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    img.onload = () => {
      const margenIzq = 25;
      const margenDer = 25;
      const anchoPagina = 210;
      const anchoTexto = anchoPagina - margenIzq - margenDer;
      const centerX = margenIzq + anchoTexto / 2;

      let y = 20;

      doc.addImage(img, "PNG", 0, 0, anchoPagina, 297);
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);

      // Encabezado institucional (tabla superior derecha)
      const tablaX = 115;
      const cellHeight = 6.5;
      const labelW = 40;
      const contentW = 55;

      doc.setLineWidth(0.25);

      // DEPENDENCIA
      doc.setFont("helvetica", "bold");
      doc.rect(tablaX, y, labelW, cellHeight);
      doc.text("DEPENDENCIA:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.rect(tablaX + labelW, y, contentW, cellHeight);
      doc.text("SECRETARÍA DE ADMINISTRACIÓN", tablaX + labelW + 2, y + 4.5);
      y += cellHeight;

      // SECCIÓN
      doc.setFont("helvetica", "bold");
      doc.rect(tablaX, y, labelW, cellHeight * 3);
      doc.text("SECCIÓN:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.rect(tablaX + labelW, y, contentW, cellHeight * 3);
      doc.text("COMITÉ DE ADQUISICIONES,", tablaX + labelW + 2, y + 4.5);
      doc.text("ENAJENACIONES, ARRENDAMIENTOS Y", tablaX + labelW + 2, y + 9.5);
      doc.text("CONTRATACIÓN DE SERVICIOS", tablaX + labelW + 2, y + 14.5);
      y += cellHeight * 3;

      // ASUNTO
      doc.setFont("helvetica", "bold");
      doc.rect(tablaX, y, labelW, cellHeight);
      doc.text("ASUNTO:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.rect(tablaX + labelW, y, contentW, cellHeight);
      doc.text("CONVOCATORIA SESIÓN", tablaX + labelW + 2, y + 4.5);
      y += cellHeight;

      // OFICIO
      doc.setFont("helvetica", "bold");
      doc.rect(tablaX, y, labelW, cellHeight);
      doc.text("NÚMERO DE OFICIO:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.rect(tablaX + labelW, y, contentW, cellHeight);
      doc.text(data.numero_oficio, tablaX + labelW + 2, y + 4.5);
      y += cellHeight + 4;

      // FECHA derecha
      doc.setFont("helvetica", "normal");
      doc.text(`San Juan del Río, Qro., a ${fechaTexto}`, anchoPagina - margenDer, y, { align: "right" });
      y += 10;

      // CUERPO
      const cuerpo = `Con fundamento en los artículos 58 fracción III de la Ley de Adquisiciones del Estado de Querétaro, me permito invitarle a participar en la sesión del comité, conforme al siguiente calendario de eventos:`;
      const cuerpoLines = doc.splitTextToSize(cuerpo, anchoTexto);
      cuerpoLines.forEach((line: string) => {
        doc.text(line, margenIzq, y);
        y += 5;
      });
      

      y += 10;

      // PARTICIPANTES AGRUPADOS
      if (Array.isArray(data.participantes) && data.participantes.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("P A R T I C I P A N T E S", margenIzq, y);
        y += 7;
      
        // Tipado explícito con índice restringido
        const agrupados: Record<"base" | "invitado" | "otro", any[]> = {
          base: data.participantes.filter((p: any) => p.tipo === "base"),
          invitado: data.participantes.filter((p: any) => p.tipo === "invitado"),
          otro: data.participantes.filter((p: any) => p.tipo === "otro"),
        };
      
        (["base", "invitado", "otro"] as const).forEach((tipo) => {
          if (agrupados[tipo].length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text(`${tipo.toUpperCase()}S:`, margenIzq, y);
            y += 6;
      
            agrupados[tipo].forEach((p: { nombre: string }) => {
              doc.setFont("helvetica", "normal");
              doc.text(`- ${p.nombre.toUpperCase()}`, margenIzq + 5, y);
              y += 5;
            });
      
            y += 3;
          }
        });
      }
      

      // TABLA DE EVENTOS
      const tablaEventos = data.eventos.map((ev: any) => [
        ev.acto.toUpperCase(),
        new Date(ev.fecha_inicio).toLocaleDateString("es-MX"),
        ev.hora_inicio || "SIN HORA",
        ev.lugar || "Sala de juntas del centro cívico",
      ]);

      autoTable(doc, {
        startY: y,
        head: [["ACTO", "FECHA", "HORA", "LUGAR"]],
        body: tablaEventos,
        theme: "grid",
        styles: { font: "helvetica", fontSize: 8 },
        headStyles: { fillColor: [200, 200, 200], textColor: 0 },
        margin: { left: margenIzq, right: margenDer },
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // CIERRE
      const cierre = `Le solicito integrar su participación. En caso de no poder asistir, le agradeceré notificar y designar por escrito a su suplente.`;
      const cierreLines = doc.splitTextToSize(cierre, anchoTexto);

      cierreLines.forEach((line: string) => {
        doc.text(line, margenIzq, y);
        y += 5;
      });



      // FIRMA
      doc.setFont("helvetica", "bold");
      doc.text("A T E N T A M E N T E", centerX, y, { align: "center" });
      y += 10;
      doc.text("C.P. PEDRO VÁZQUEZ ARTEAGA", centerX, y, { align: "center" });
      doc.text("DIRECTOR DE ADQUISICIONES", centerX, y + 5, { align: "center" });

      // MOSTRAR
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    };
  } catch (error) {
    console.error("❌ Error al generar el PDF:", error);
    alert("Ocurrió un error al generar el PDF.");
  }
};

export default handleGenerarPDF;
