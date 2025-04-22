import { jsPDF } from "jspdf";
import { getOrdenDiaById } from "../peticiones_api/peticionOrdenDia";

const generarPDF = async (id_orden_dia: number) => {
  try {
    const orden = await getOrdenDiaById(id_orden_dia);

    if (!orden) {
      alert("No se pudo obtener la orden del día.");
      return;
    }

    const doc = new jsPDF();
    const img = new Image();
    img.src = "/images/ordendia.png";

    const tipoSesion = orden.tipo_evento?.toUpperCase() || "ORDINARIA";
    const esExtraordinaria = tipoSesion === "EXTRAORDINARIA";

    const fecha = new Date(orden.fecha_inicio);
    const fechaTexto = fecha.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const puntos = orden.puntos_tratar || [];
    const participantes = orden.participantes || [];

    img.onload = () => {
      const margenIzq = 25;
      const margenDer = 25;
      const anchoPagina = 210;
      const altoPagina = 297;
      const anchoTexto = anchoPagina - margenIzq - margenDer;
      const centerX = margenIzq + anchoTexto / 2;

      let y = 20;

      doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
      doc.setFontSize(9); // fuente más pequeña
      doc.setTextColor(0, 0, 0);

      // 🟦 Tabla encabezado alineada a la derecha
      // 🟦 Tabla encabezado alineada a la derecha con tamaño reducido y ajustada visualmente
const tablaX = 115; // 🟩 más a la derecha pero dentro del área visual
const cellHeight = 6.5; // 🟨 altura más compacta
const labelW = 40;
const contentW = 55;

doc.setLineWidth(0.25);
doc.setDrawColor(0); // negro

// DEPENDENCIA
doc.rect(tablaX, y, labelW, cellHeight);
doc.rect(tablaX + labelW, y, contentW, cellHeight);
doc.setFont("helvetica", "bold");
doc.text("DEPENDENCIA:", tablaX + 2, y + 4.5);
doc.setFont("helvetica", "normal");
doc.text("SECRETARÍA DE ADMINISTRACIÓN", tablaX + labelW + 2, y + 4.5);
y += cellHeight;

// SECCIÓN (triple altura)
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
doc.text(`CONVOCATORIA SESIÓN ${tipoSesion}`, tablaX + labelW + 2, y + 4.5);
y += cellHeight;

// NÚMERO DE OFICIO
doc.setFont("helvetica", "bold");
doc.rect(tablaX, y, labelW, cellHeight);
doc.text("NÚMERO DE OFICIO:", tablaX + 2, y + 4.5);
doc.setFont("helvetica", "normal");
doc.rect(tablaX + labelW, y, contentW, cellHeight);
doc.text(orden.no_oficio || "DAQ/XXXX/2025", tablaX + labelW + 2, y + 4.5);
y += cellHeight + 4;


      // 🟩 Fecha alineada derecha
      doc.setFont("helvetica", "normal");
      doc.text(`San Juan del Río, Qro., a ${fechaTexto}`, anchoPagina - margenDer, y, { align: "right" });
      y += 10;

      // 🟨 Participantes
      if (participantes.length > 0) {
        doc.setFont("helvetica", "bold");
        participantes.forEach((p: { nombre: string; puesto: string }) => {
          doc.text(p.nombre?.toUpperCase() || "PARTICIPANTE", margenIzq, y);
          y += 5;
          if (p.puesto) {
            doc.text(p.puesto.toUpperCase(), margenIzq, y);
            y += 5;
          }
        });
        y += 3;
        doc.text("P R E S E N T E S:", margenIzq, y);
        y += 8;
      }

      // 🟨 Cuerpo
      doc.setFont("helvetica", "normal");
      const cuerpo = `Con fundamento en los artículos 58 fracción III de la Ley de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Estado de Querétaro, aprovecho la oportunidad para enviarle un cordial y respetuoso saludo, y al mismo tiempo me permito hacerle extensiva la invitación para celebrar la sesión ${tipoSesion.toLowerCase()} que se agenda el día ${fechaTexto}, a las ${orden.hora} horas, en ${orden.lugar}, con el siguiente orden del día:`;

      const cuerpoLines = doc.splitTextToSize(cuerpo, anchoTexto);
      cuerpoLines.forEach((linea: string) => {
        doc.text(linea, margenIzq, y);
        y += 5;
      });
      

      y += 8;

      // 🟦 Orden del día
      doc.setFont("helvetica", "bold");
      doc.text("ORDEN DEL DÍA:", margenIzq, y);
      y += 7;

      const baseItems = [
        "1. Lista de asistencia y verificación del quórum legal para sesionar.",
        "2. Presentación y en su caso, aprobación del orden del día.",
      ];

      doc.setFont("helvetica", "normal");
      baseItems.forEach(item => {
        doc.text(item, margenIzq, y);
        y += 5;
      });

      if (puntos.length > 0) {
        doc.text("3. Propuesta, análisis, discusión y aprobación de los siguientes puntos:", margenIzq, y);
        y += 5;
        puntos.forEach((punto: string, i: number) => {
          doc.text(`3.${i + 1} ${punto}`, margenIzq + 5, y);
          y += 5;
        });
      }

      if (!esExtraordinaria) {
        doc.text(`${3 + puntos.length}. Asuntos generales.`, margenIzq, y);
        y += 5;
      }

      doc.text(`${4 + (esExtraordinaria ? puntos.length - 1 : puntos.length)}. Clausura de la sesión.`, margenIzq, y);
      y += 20;

      // 🟪 Firma
      doc.setFont("helvetica", "bold");
      doc.text("ATENTAMENTE", centerX, y, { align: "center" });
      y += 10;
      doc.text("C.P. Pedro Vázquez Arteaga", centerX, y, { align: "center" });
      doc.text("Director de Adquisiciones", centerX, y + 5, { align: "center" });

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    };
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    alert("Ocurrió un error al generar el PDF.");
  }
};

export default generarPDF;
