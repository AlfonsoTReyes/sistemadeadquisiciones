// ../PDF/cancelacionordendia.ts (o como lo llames)

import { jsPDF } from "jspdf";
import { getOrdenDiaById } from "../peticiones_api/peticionOrdenDia"; // <-- Ajusta ruta si es necesario

// Define una interfaz más específica para el participante según tu objeto
interface ParticipanteAPI {
    id_confirmacion: number;
    id_usuario: number;
    nombre: string;
    apellidos: string; // <-- Incluye apellidos
    email: string;
    confirmado: boolean;
    fecha_confirmado: string | null;
    fecha_visto: string | null;
    observaciones: string | null;
    puesto: string;
    tipo_usuario: string; // O cualquier otro campo que venga
}


/**
 * Generates a PDF cancellation notice by fetching order data first,
 * including dynamic participants based on the provided API object structure.
 * @param id_orden_dia - The ID of the order to cancel and generate the notice for.
 */
const generarPDFCancelacion = async (id_orden_dia: number) => {
  try {
    // 1. HACER LA PETICIÓN API
    console.log(`PDF Cancelación: Obteniendo datos para orden ${id_orden_dia}...`);
    const orden = await getOrdenDiaById(id_orden_dia); // Asume que esto devuelve el objeto que mostraste

    // 2. Verificar si se obtuvieron datos
    if (!orden) {
      console.error(`PDF Cancelación: No se encontraron datos para la orden ${id_orden_dia}.`);
      alert(`No se pudieron obtener los detalles de la orden #${id_orden_dia} para generar la cancelación.`);
      return;
    }

    // (Opcional) Verificar si realmente está cancelada
    if (orden.estatus !== 'cancelada') { // Asegúrate que 'estatus' exista en tu objeto 'orden'
        console.warn(`PDF Cancelación: La orden ${id_orden_dia} no tiene estatus 'cancelada' (estatus actual: ${orden.estatus}). Se generará de todos modos.`);
    }

    console.log("PDF Cancelación: Datos obtenidos:", orden);

    // 3. PREPARAR DATOS NECESARIOS
    const numeroOficio = orden.no_oficio || "DAQ/XXXX/2024";
    const fechaOriginal = new Date(orden.fecha_inicio);
    const fechaOriginalTexto = fechaOriginal.toLocaleDateString("es-MX", {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }); // Ajusta formato si es necesario
    const fechaActual = new Date();
    const fechaActualTexto = fechaActual.toLocaleDateString("es-MX", {
      day: "numeric", month: "long", year: "numeric",
    });

    // 4. ¡CORRECCIÓN! EXTRAER PARTICIPANTES DEL ARRAY 'participantes'
    const participantes: ParticipanteAPI[] = orden.participantes || []; // <--- USA EL NOMBRE CORRECTO DEL ARRAY
    console.log("PDF Cancelación: Participantes a listar:", participantes);

    // --- INICIO DE GENERACIÓN PDF ---
    const doc = new jsPDF("p", "mm", "a4");
    const img = new Image();
    img.src = "/images/ordendia.png"; // Imagen de fondo

    img.onload = () => {
      const margenIzq = 25;
      const margenDer = 25;
      const anchoPagina = 210;
      const altoPagina = 297;
      const anchoTexto = anchoPagina - margenIzq - margenDer;
      const centerX = anchoPagina / 2;
      let y = 20;

      doc.addImage(img, "PNG", 0, 0, anchoPagina, altoPagina);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      // --- Header Table (Tabla del encabezado) ---
      // (El código de la tabla se mantiene igual, usando numeroOficio)
      const tablaX = 115;
      const cellHeight = 6.5;
      const labelW = 40;
      const contentW = 55;
      doc.setLineWidth(0.25);
      doc.setDrawColor(0);
      // Fila 1: DEPENDENCIA
      doc.rect(tablaX, y, labelW, cellHeight); doc.rect(tablaX + labelW, y, contentW, cellHeight);
      doc.setFont("helvetica", "bold"); doc.text("DEPENDENCIA:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal"); doc.text("SECRETARÍA DE ADMINISTRACIÓN", tablaX + labelW + 2, y + 4.5);
      y += cellHeight;
      // Fila 2: SECCIÓN
      const seccionCellHeight = cellHeight * 3;
      doc.rect(tablaX, y, labelW, seccionCellHeight); doc.rect(tablaX + labelW, y, contentW, seccionCellHeight);
      doc.setFont("helvetica", "bold"); doc.text("SECCIÓN:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal");
      const seccionY1 = y + 4.5; const seccionY2 = seccionY1 + 5; const seccionY3 = seccionY2 + 5;
      doc.text("COMITÉ DE ADQUISICIONES,", tablaX + labelW + 2, seccionY1);
      doc.text("ENAJENACIONES, ARRENDAMIENTOS", tablaX + labelW + 2, seccionY2);
      doc.text("Y CONTRATACIÓN DE SERVICIOS", tablaX + labelW + 2, seccionY3);
      y += seccionCellHeight;
      // Fila 3: ASUNTO
      doc.rect(tablaX, y, labelW, cellHeight); doc.rect(tablaX + labelW, y, contentW, cellHeight);
      doc.setFont("helvetica", "bold"); doc.text("ASUNTO:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal"); doc.text("CANCELACIÓN DE CONVOCATORIA", tablaX + labelW + 2, y + 4.5);
      y += cellHeight;
      // Fila 4: NÚMERO DE OFICIO
      doc.rect(tablaX, y, labelW, cellHeight); doc.rect(tablaX + labelW, y, contentW, cellHeight);
      doc.setFont("helvetica", "bold"); doc.text("NÚMERO DE OFICIO:", tablaX + 2, y + 4.5);
      doc.setFont("helvetica", "normal"); doc.text(numeroOficio, tablaX + labelW + 2, y + 4.5);
      y += cellHeight + 5;


      // --- Fecha Actual ---
      doc.setFont("helvetica", "normal");
      doc.text(`San Juan del Río, Qro., a ${fechaActualTexto}`, anchoPagina - margenDer, y, { align: "right" });
      y += 10;

      // --- 5. ¡CORRECCIÓN! LISTA DE PARTICIPANTES (DINÁMICA) ---
      if (participantes && participantes.length > 0) {
        participantes.forEach((p: ParticipanteAPI) => { // Usa la interfaz definida
          // Combina nombre y apellidos para el nombre completo
          const nombreCompleto = `${p.nombre || ''} ${p.apellidos || ''}`.trim().toUpperCase();
          const puestoParticipante = p.puesto?.toUpperCase() || "PUESTO DESCONOCIDO";

          doc.setFont("helvetica", "bold"); // Nombre en Bold
          // Usa nombreCompleto o un valor por defecto
          doc.text(nombreCompleto || "PARTICIPANTE DESCONOCIDO", margenIzq, y);
          y += 5;
          doc.setFont("helvetica", "normal"); // Puesto en Normal
          doc.text(puestoParticipante, margenIzq, y);
          y += 5; // Espacio entre participantes
        });
      } else {
        // Mensaje si no hay participantes
        doc.setFont("helvetica", "italic");
        doc.text("No se encontraron participantes registrados para esta orden.", margenIzq, y);
        y += 8;
        doc.setFont("helvetica", "normal");
      }
      y += 3; // Pequeño espacio antes de "PRESENTES"

      // --- Texto "PRESENTES" ---
      doc.setFont("helvetica", "bold");
      doc.text("P R E S E N T E S:", margenIzq, y);
      y += 10;

      // --- Cuerpo del Mensaje ---
      // (Se mantiene igual, usando fechaOriginalTexto)
      doc.setFont("helvetica", "normal");
      const bodyText = `Con fundamento en los artículos 58 fracción III de la Ley de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Estado de Querétaro, aprovecho la oportunidad para enviarle un cordial y respetuoso saludo, y al mismo tiempo me permito hacerle de su conocimiento que la sesión ordinaria programada para el ${fechaOriginalTexto}, de conformidad al calendario establecido, no se llevará a cabo, agradeciendo de antemano su participación y su apoyo institucional.`;
      const bodyLines = doc.splitTextToSize(bodyText, anchoTexto);
      bodyLines.forEach((linea: string) => { doc.text(linea, margenIzq, y); y += 5; });
      y += 8;

      // --- Frase de Cierre ---
      doc.setFont("helvetica", "normal");
      doc.text("Sin más por el momento, quedo de Usted.", margenIzq, y);
      y += 15;

      // --- Bloque de Firma ---
      // (Se mantiene igual)
      doc.setFont("helvetica", "bold");
      doc.text("ATENTAMENTE", centerX, y, { align: "center" }); y += 10;
      doc.text("CONTADOR PÚBLICO PEDRO VÁZQUEZ ARTEAGA", centerX, y, { align: "center" }); y += 5;
      doc.text("DIRECTOR DE ADQUISICIONES Y SECRETARIO TÉCNICO DEL COMITÉ DE", centerX, y, { align: "center" }); y += 5;
      doc.text("ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS", centerX, y, { align: "center" }); y += 10;

      // --- Línea C.c.p. ---
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("C.c.p. Archivo/minutario.", margenIzq, y); y += 5;

      // --- Generar Salida ---
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      // setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    img.onerror = (err) => {
        console.error("Error cargando imagen de fondo para PDF cancelación:", err);
        alert("Error al cargar la imagen de fondo para el PDF de cancelación.");
    }

  } catch (error) {
    console.error("Error general al generar el PDF de cancelación:", error);
    alert("Ocurrió un error al generar el PDF de cancelación.");
  }
};

export default generarPDFCancelacion;