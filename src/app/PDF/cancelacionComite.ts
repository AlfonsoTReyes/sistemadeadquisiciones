import { jsPDF } from "jspdf";

const generarPDFCancelacionSesion = ({
  fecha = "San Juan del Río, Qro., a 10 de abril de 2025",
  diaSemana = "martes",
  dia = "15",
  mes = "abril",
  anio = "2025",
  firmante = "CONTADOR PÚBLICO PEDRO VÁZQUEZ ARTEAGA",
  puesto = "DIRECTOR DE ADQUISICIONES Y SECRETARIO TÉCNICO DEL COMITÉ DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS",
  asunto = "CANCELACIÓN DE CONVOCATORIA",
  numOficio = "DAQ/015A/2025"
}) => {
  const doc = new jsPDF();
  const ancho = 210;
  const margen = 20;
  let y = 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const addLine = (text: string, options = {}) => {
    doc.text(text, margen, y, options);
    y += 7;
  };

  // Encabezado
  addLine(fecha);

  // Destinatarios
  const destinatarios = [
    "LICENCIADA ROSALBA RUÍZ RAMOS",
    "SÍNDICA MUNICIPAL",
    "LICENCIADO JOSÉ MIGUEL VALENCIA MOLINA",
    "SECRETARIO DE ADMINISTRACIÓN",
    "MAESTRA BIBIANA RODRIGUEZ MONTES",
    "SECRETARIA DE DESARROLLO INTEGRAL Y ECONÓMICO",
    "LICENCIADO MIGUEL ÁNGEL JIMÉNEZ EVANGELISTA",
    "DIRECTOR JURÍDICO",
    "LICENCIADA M. NELLY MARTÍNEZ TREJO",
    "ÓRGANO INTERNO DE CONTROL",
    "CONTADOR PÚBLICO FERNANDO DAMIÁN OCEGUERA",
    "SECRETARIO DE FINANZAS PÚBLICAS MUNICIPALES",
    "(ÁREAS REQUIRENTES)",
    "P R E S E N T E S:"
  ];
  y += 5;
  destinatarios.forEach((d) => addLine(d));

  y += 5;
  const cuerpo = `Con fundamento en los artículos 58 fracción III de la Ley de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Estado de Querétaro, aprovecho la oportunidad para enviarle un cordial y respetuoso saludo, y al mismo tiempo me permito hacerle de su conocimiento que la sesión ordinaria programada para el día ${diaSemana} ${dia} (${mes}) de ${anio} (dos mil veinticinco), de conformidad al calendario establecido, no se llevará a cabo, agradeciendo de antemano su participación y su apoyo institucional.`;

  const lineas = doc.splitTextToSize(cuerpo, ancho - 2 * margen);
  lineas.forEach((line) => addLine(line));
  addLine(" ");
  addLine("Sin más por el momento, quedo de Usted.");

  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("ATENTAMENTE", ancho / 2, y, { align: "center" }); y += 10;
  doc.text(firmante, ancho / 2, y, { align: "center" }); y += 7;
  doc.text(puesto, ancho / 2, y, { align: "center" }); y += 15;

  doc.setFont("helvetica", "normal");
  addLine("C.c.p. Archivo/minutario.");
  addLine("DEPENDENCIA: SECRETARÍA DE ADMINISTRACIÓN");
  addLine("SECCIÓN: COMITÉ DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS");
  addLine(`ASUNTO: ${asunto}`);
  addLine(`NUMERO DE OFICIO: ${numOficio}`);

  // Mostrar PDF
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

export default generarPDFCancelacionSesion;
