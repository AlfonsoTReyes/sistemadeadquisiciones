import { jsPDF } from "jspdf";

// función para convertir números a letras
const numeroALetras = (numero: number): string => {
  const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"];
  const decenas = ["", "", "veinti", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const centenas = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  const convertirGrupo = (n: number): string => {
    if (n === 100) return "cien";
    let salida = "";
    if (n > 99) salida += centenas[Math.floor(n / 100)] + " ";
    const resto = n % 100;
    if (resto <= 20) {
      salida += unidades[resto];
    } else {
      salida += decenas[Math.floor(resto / 10)];
      const unidad = resto % 10;
      if (unidad > 0) salida += " y " + unidades[unidad];
    }
    return salida.trim();
  };

  const parteEntera = Math.floor(numero);
  const parteDecimal = Math.round((numero - parteEntera) * 100);

  const miles = Math.floor(parteEntera / 1000);
  const cientos = parteEntera % 1000;

  let texto = "";
  if (miles > 0) texto += (miles === 1 ? "mil" : convertirGrupo(miles) + " mil") + " ";
  texto += convertirGrupo(cientos);
  return `${texto.trim()} pesos ${parteDecimal.toString().padStart(2, "0")}/100 m.n.`.replace(/\s+/g, " ");
};

const generarPDFSuficiencia = async (idSolicitud: number) => {
  try {
    const res = await fetch(`/api/presuficiencia?id=${idSolicitud}`);
    if (!res.ok) throw new Error("no se pudo obtener la solicitud de suficiencia");

    const data = await res.json();
    const {
      nombre_dependencia,
      nombre_secretaria,
      oficio,
      asunto,
      lugar,
      fecha,
      nombre_usuario,
      apellido_usuario,
      puesto_usuario,
      motivo,
      cuenta,
      cantidad,
    } = data;

    const doc = new jsPDF();
    const img = new Image();
    img.src = "/images/presuficiencia.png";

    const formatearFecha = (fechaIso: string): string => {
      const f = new Date(fechaIso);
      return f.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const margenTop = 25;
    const margenBot = 25;
    const margenIzq = 30;
    const margenDer = 30;
    const anchoPagina = 210;
    const altoPagina = 297;
    const anchoTexto = anchoPagina - margenIzq - margenDer;
    const centerX = margenIzq + anchoTexto / 2;
    let y = margenTop;

    img.onload = () => {
      doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      const drawLineRightAligned = (label: string, value: string) => {
        doc.setFont("helvetica", "normal");
        const labelWidth = doc.getTextWidth(label);
        const valueWidth = doc.getTextWidth(value);
        const startX = anchoPagina - margenDer - (labelWidth + valueWidth);

        doc.text(label, startX, y);
        doc.setFont("helvetica", "bold");
        doc.text(value, startX + labelWidth, y);
        y += 6;
        doc.setFont("helvetica", "normal"); // volver a normal para evitar que todo sea negrita
      };

      // encabezado
      drawLineRightAligned("DEPENDENCIA: ", nombre_dependencia?.toUpperCase() || "N/A");
      drawLineRightAligned("SECCIÓN: ", nombre_secretaria?.toUpperCase() || "N/A");
      drawLineRightAligned("NO. DE OFICIO: ", oficio?.toUpperCase() || "N/A");
      drawLineRightAligned("ASUNTO: ", asunto?.toUpperCase() || "N/A");

      const fechaFormateada = fecha ? formatearFecha(fecha) : "...";
      doc.text(`San Juan del Río, Querétaro., a ${fechaFormateada}`, anchoPagina - margenDer, y + 5, { align: "right" });

      // destinatario
      y = 80;
      doc.setFont("helvetica", "bold");
      doc.text("CP. FERNANDO DAMIÁN OCEGUERA", margenIzq, y); y += 6;
      doc.text("SECRETARIO DE FINANZAS PÚBLICAS", margenIzq, y); y += 6;
      doc.text("DEL MUNICIPIO DE SAN JUAN DEL RÍO QRO.", margenIzq, y); y += 6;
      doc.text("P R E S E N T E:", margenIzq, y); y += 10;
      doc.setFont("helvetica", "normal");

      // cuerpo con cantidad en letras
      const cantidadNum = parseFloat(cantidad || "0");
      const textoCantidad = isNaN(cantidadNum) ? "cero pesos 00/100 m.n." : numeroALetras(cantidadNum);

      const cuerpo = `
Estimado secretario, me permito por medio de este documento saludarle de manera cordial, asimismo me sirvo a solicitar su apoyo para emitir una SUFICIENCIA PRESUPUESTAL, a la cuenta de ${cuenta?.toUpperCase() || "[CUENTA]"}, del centro de gastos ${nombre_dependencia?.toUpperCase() || "[DEPENDENCIA]"}, por la cantidad de ${textoCantidad}, el cual será utilizado para ${motivo || "[MOTIVO PARA EL QUE SE REQUIERE]"} de municipio.

Sirva la presente para los trámites administrativos correspondientes, sin más por el momento le reitero mi consideración y respeto.
      `.trim();

      const lines = doc.splitTextToSize(cuerpo, anchoTexto);
      const interlineado = 6;

      for (const linea of lines) {
        if (y + interlineado > altoPagina - margenBot) {
          doc.addPage();
          doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
          y = margenTop;
        }
        doc.text(linea, margenIzq, y);
        y += interlineado;
      }

      // firma
      y += 10;
      if (y + 30 > altoPagina - margenBot) {
        doc.addPage();
        doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
        y = margenTop;
      }

      doc.setFont("helvetica", "normal");
      doc.text("ATENTAMENTE", centerX, y, { align: "center" }); y += 10;
      doc.text("“LEGADO DE BIEN COMÚN”", centerX, y, { align: "center" }); y += 15;
      doc.text(`LIC. ${nombre_usuario?.toUpperCase() || ""} ${apellido_usuario?.toUpperCase() || ""}`, centerX, y, { align: "center" }); y += 7;
      doc.text(puesto_usuario?.toUpperCase() || "PUESTO DEL REQUIRIENTE", centerX, y, { align: "center" }); y += 15;

      doc.text("Ccp.- Cp. Felipe Ramírez Moreno / Coordinador Técnico de Finanzas.", margenIzq, y);

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    };
  } catch (error) {
    console.error("error al generar el pdf:", error);
    alert("ocurrió un error al generar el pdf.");
  }
};

export default generarPDFSuficiencia;
