import { jsPDF } from "jspdf";
// Asumo que esta importación es correcta y la función existe.
import { getFalloDataById } from "../peticiones_api/peticionFallo"; // Adjust path as needed

// --- Interfaces ---
// Interfaz para los detalles de la oferta (para mayor claridad y reutilización)
interface OfferDetails {
    partidas?: number;
    subtotal: number;
    iva: number;
    total: number;
}

// Interfaz para los datos del fallo
// TODO: Define esta interfaz con la máxima precisión según la respuesta de tu API.
interface FalloData {
    referencia?: string;
    tituloAdquisicion?: string;
    fechaFallo?: string; // e.g., "2025-02-20" (formato YYYY-MM-DD es bueno para new Date())
    horaFallo?: string; // e.g., "12:00"
    departamentoRequirente?: string;
    fechaInvitacion?: string; // e.g., "17 de febrero de dos mil veinticinco"
    fechaApertura?: string; // e.g., "03 de marzo de dos mil veinticinco"
    participantes?: Array<{ nombre: string; cargo?: string }>; // Añadido cargo opcional por si se necesita para firmas
    ganador?: {
        nombre: string;
        oferta: OfferDetails; // Usando la interfaz OfferDetails
    };
    articuloContrato?: string;
    articuloGarantia?: string;
    comite?: Array<{ nombre: string; cargo: string }>;
    requirentes?: Array<{ nombre: string; cargo: string }>;
    invitadosOIC?: Array<{ nombre: string; cargo: string }>;
    // presidenteComite?: { nombre: string; cargo: string }; // Si necesitas accederlos individualmente
    // secretarioEjecutivo?: { nombre: string; cargo: string };
}

// --- Reusable Helpers ---

// Función numeroALetras: Muy básica. Considera una librería para producción.
const numeroALetras = (num: number | undefined | null): string => {
    if (num === undefined || num === null || isNaN(num)) return "XXXX";

    const unidades: { [key: number]: string } = {
        0: "CERO", 1: "UNO", 2: "DOS", 3: "TRES", 4: "CUATRO", 5: "CINCO", 6: "SEIS", 7: "SIETE", 8: "OCHO", 9: "NUEVE",
        10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE", 16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
        20: "VEINTE", 30: "TREINTA", 40: "CUARENTA", 50: "CINCUENTA", 60: "SESENTA", 70: "SETENTA", 80: "OCHENTA", 90: "NOVENTA"
    };

    if (num >= 0 && num <= 20) return unidades[num] || num.toString(); // Cubre hasta 20 directamente si está en la lista
    if (num < 30) return (num === 20) ? "VEINTE" : "VEINTI" + (unidades[num - 20]?.toLowerCase() || (num-20).toString());

    if (num < 100) {
        const u = num % 10;
        const d = Math.floor(num / 10) * 10;
        const decenaStr = unidades[d] || '';
        return decenaStr + (u > 0 ? " Y " + (unidades[u] || '') : "");
    }
    // Casos especiales para años comunes en documentos
    if (num === 2023) return "DOS MIL VEINTITRÉS";
    if (num === 2024) return "DOS MIL VEINTICUATRO";
    if (num === 2025) return "DOS MIL VEINTICINCO";

    console.warn(`numeroALetras necesita mejoras para el número: ${num}`);
    return num.toString(); // Fallback
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => {
          console.error("Error loading image:", src, err);
          reject(new Error(`Failed to load image: ${src}`));
      };
      // Asegúrate de que la ruta sea correcta. Si es una ruta absoluta en tu servidor público, está bien.
      // Si es relativa, puede necesitar ajustes.
      img.src = src; // Ejemplo: "/images/oficio_sjr_membrete.png"
  });
};

// --- Header for Fallo ---
const addHeaderFallo = (doc: jsPDF, falloData: FalloData, pageNum: number, totalPages: number, bgImage: HTMLImageElement | null): number => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginRightPt = 2.0 * (72 / 2.54);
    const headerX = pageWidth - marginRightPt;
    const startY = 35; // Puntos desde el borde superior
    const fontSize = 8;
    const lineSpacing = fontSize * 1.2;

    if (bgImage) {
        try {
            doc.addImage(bgImage, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
        } catch (e) { console.error("Error adding background image:", e); }
    }

    doc.setFont("Helvetica", "bold"); // Usar "Helvetica" es más seguro que "helvetica"
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);

    let currentY = startY;
    doc.text("SECRETARÍA DE ADMINISTRACIÓN", headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    doc.text(falloData.referencia || "IR.MSJR.MAT.XXXXXX.DR", headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    const titleParts = (falloData.tituloAdquisicion || "ADQUISICIÓN...").split(' ');
    const shortTitle = titleParts.slice(0, 4).join(' ') + (titleParts.length > 4 ? '...' : '');
    doc.text(shortTitle.toUpperCase(), headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    doc.text(`Página ${pageNum} de ${totalPages}`, headerX, currentY, { align: "right" });

    const topMarginActual = 2.5 * (72 / 2.54); // Margen superior nominal
    // Retornar el Y después del último texto del encabezado, o el margen superior si es mayor.
    return Math.max(currentY + lineSpacing, topMarginActual);
};

// --- Footer for Fallo ---
const addFooterFallo = (doc: jsPDF, _falloData: FalloData): void => { // falloData no se usa aquí, se puede omitir el param si no se necesita
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth(); // No usado, pero podría ser útil
    const marginBottomPt = 1.5 * (72 / 2.54);
    const footerY = pageHeight - marginBottomPt;
    const footerFontSize = 9;
    const lineSpacing = footerFontSize * 1.1;
    const leftMargin = 1.5 * (72 / 2.54);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(footerFontSize);
    doc.setTextColor(0, 0, 0);

    let currentY = footerY;
    doc.text("427 689 00 12", leftMargin, currentY);
    doc.setTextColor(255, 0, 128); // Rosa
    doc.textWithLink("www.sanjuandelrio.gob.mx", leftMargin + 100, currentY, { url: 'http://www.sanjuandelrio.gob.mx' });
    doc.setTextColor(0, 0, 0);
    currentY += lineSpacing;
    doc.text("Blvd. Paso de los Guzmán No. 24, Barrio de la Concepción, C.P. 76803 San Juan del Río, Querétaro", leftMargin, currentY);
};

// --- Check and Add Page ---
const checkAndAddPageFallo = (
    doc: jsPDF,
    currentY: number,
    pageHeight: number,
    bottomMargin: number,
    falloData: FalloData,
    bgImage: HTMLImageElement | null,
    currentPageRef: { num: number },
    totalPages: number
): number => {
    let y = currentY;
    if (y > pageHeight - bottomMargin) {
        // El pie de página se añade en un bucle al final.
        doc.addPage();
        currentPageRef.num++;
        // El encabezado se añade aquí para la nueva página.
        y = addHeaderFallo(doc, falloData, currentPageRef.num, totalPages, bgImage);
    }
    return y;
};

// --- Helper to Draw Economic Offer Table ---
// CORRECCIÓN PRINCIPAL AQUÍ: El parámetro 'offerDetails' ahora es del tipo correcto.
const drawEconomicOfferTable = (
    doc: jsPDF,
    y: number,
    offerDetails: OfferDetails | undefined, // Tipo corregido y nombre de parámetro
    marginLeft: number,
    contentWidth: number,
    fontSize: number,
    lineHeight: number
): number => {
    let currentY = y;
    if (!offerDetails) { // Usar el parámetro corregido
        console.warn("drawEconomicOfferTable: No se proporcionaron detalles de la oferta.");
        return currentY;
    }

    const col1Width = contentWidth * 0.3;
    const col2Width = contentWidth * 0.35;
    const col3Width = contentWidth * 0.35;
    const col2X = marginLeft + col1Width;
    const col3X = col2X + col2Width;
    const rowHeight = lineHeight * 1.4;
    const textPadding = 2; // Puntos
    const currencyFormat = { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 };

    // Usar 'offerDetails' para acceder a las propiedades
    const tableData = [
        { label1: "NÚMERO DE PARTIDA QUE PROPONE:", value1: `${offerDetails.partidas ?? 'XX'} PARTIDAS`, label2: "SUBTOTAL", value2: offerDetails.subtotal },
        { label1: "", value1: "", label2: "I.V.A.", value2: offerDetails.iva },
        { label1: "", value1: "", label2: "SUMA TOTAL DEL IMPORTE DE LOS BIENES PROPUESTOS", value2: offerDetails.total }
    ];

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setLineWidth(0.5); // Grosor de línea para las celdas

    let tableStartY = currentY;

    tableData.forEach((row, rowIndex) => {
        const rowY = tableStartY + rowIndex * rowHeight;
        const textY = rowY + rowHeight * 0.65; // Ajuste vertical para centrar texto en la celda

        doc.rect(marginLeft, rowY, col1Width, rowHeight); // 'S' (stroke) es el default
        doc.rect(col2X, rowY, col2Width + col3Width, rowHeight);

        if (row.label1) {
            doc.text(row.label1, marginLeft + textPadding, textY - lineHeight * 0.2);
            doc.text(row.value1, marginLeft + textPadding, textY + lineHeight * 0.4);
        }

        doc.text(row.label2, col2X + textPadding, textY);
        // const formattedValue = (row.value2 ?? 0).toLocaleString('es-MX', currencyFormat);
        // doc.text(formattedValue, col3X + textPadding, textY);

        doc.line(col3X, rowY, col3X, rowY + rowHeight); // Línea vertical separadora

        currentY = rowY + rowHeight;
    });

    return currentY + lineHeight; // Espacio después de la tabla
};


// --- Signature Table Helper (Placeholder) ---
// Esta función es una dependencia. Debes implementarla o asegurarte de que está importada.
const drawSignatureTableDictamen = (
    doc: jsPDF, y: number, title: string,
    signatories: Array<{ nombre: string; cargo?: string }>,
    marginLeft: number, contentWidth: number, fontSize: number, lineHeight: number,
    pageHeight: number, bottomMargin: number,
    falloDataForPagination: FalloData, bgImageForPagination: HTMLImageElement | null,
    currentPageRefForPagination: { num: number }, totalPagesForPagination: number
): number => {
    let currentY = y;
    console.warn("drawSignatureTableDictamen es un placeholder. Implementar para funcionalidad completa de firmas.");

    currentY = checkAndAddPageFallo(doc, currentY, pageHeight, bottomMargin, falloDataForPagination, bgImageForPagination, currentPageRefForPagination, totalPagesForPagination);

    if (title) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(fontSize);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, currentY, { align: "center" });
        currentY += lineHeight * 2;
    }

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(fontSize -1); // Un poco más pequeño para las firmas

    signatories.forEach(sig => {
        currentY = checkAndAddPageFallo(doc, currentY, pageHeight, bottomMargin, falloDataForPagination, bgImageForPagination, currentPageRefForPagination, totalPagesForPagination);
        const signatureY = currentY + lineHeight * 2; // Espacio para la línea de firma
        doc.text("___________________________________", marginLeft + contentWidth * 0.05, signatureY); // Ajusta la posición y longitud
        currentY = signatureY + lineHeight;

        currentY = checkAndAddPageFallo(doc, currentY, pageHeight, bottomMargin, falloDataForPagination, bgImageForPagination, currentPageRefForPagination, totalPagesForPagination);
        doc.text(sig.nombre.toUpperCase(), marginLeft + contentWidth * 0.05, currentY);
        currentY += lineHeight;

        if (sig.cargo) {
            currentY = checkAndAddPageFallo(doc, currentY, pageHeight, bottomMargin, falloDataForPagination, bgImageForPagination, currentPageRefForPagination, totalPagesForPagination);
            doc.text(sig.cargo.toUpperCase(), marginLeft + contentWidth * 0.05, currentY);
            currentY += lineHeight;
        }
        currentY += lineHeight * 1.5; // Espacio entre firmantes
    });
    return currentY;
};
const drawSignatureTableFallo = drawSignatureTableDictamen;


// --- Main PDF Generation Function ---
const generarPDFFallo = async (id_fallo: number): Promise<void> => {
    let bgImage: HTMLImageElement | null = null;
    try {
        // Asegúrate que la ruta '/images/oficio_sjr_membrete.png' sea accesible desde la carpeta public de tu proyecto.
        bgImage = await loadImage("/images/oficio_sjr_membrete.png");
    } catch (imgError) {
        console.warn("Imagen de fondo no cargada, se procederá sin ella.", imgError);
    }

    try {
        const falloData: FalloData = await getFalloDataById(id_fallo);
        console.log("Datos del Fallo recibidos:", falloData);

        if (!falloData || !falloData.referencia || !falloData.ganador) { // Chequeo básico
             alert("Error: No se pudieron obtener los datos completos del fallo. Revise la consola para más detalles.");
             console.error("Datos del fallo incompletos o no encontrados:", falloData);
             return;
        }

        const doc = new jsPDF('p', 'pt', 'letter'); // 'p'ortrait, 'pt' (points), 'letter' size
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const cmToPt = 72 / 2.54; // Factor de conversión

        const marginLeft = 1.5 * cmToPt;
        const marginRight = 1.5 * cmToPt;
        const marginTopInitial = 2.5 * cmToPt; // El encabezado ajustará esto
        const marginBottom = 2.0 * cmToPt;

        const contentWidth = pageWidth - marginLeft - marginRight;
        const centerX = pageWidth / 2;

        const baseFontSize = 10;
        const smallFontSize = 9;
        const smallerFontSize = 8;
        const titleFontSize = 11;

        const baseLineHeight = baseFontSize * 1.2;
        const smallLineHeight = smallFontSize * 1.2;
        const smallerLineHeight = smallerFontSize * 1.2;


        // ADVERTENCIA: totalPages está hardcodeado. Para documentos dinámicos, esto es problemático.
        // jsPDF no calcula totalPages fácilmente por adelantado. Se necesitaría un render de dos pasadas
        // o una estimación muy buena.
        const totalPages = 5;
        const currentPage = { num: 1 };
        let y: number; // Se inicializará con el header

        // --- PAGE 1 ---
        y = addHeaderFallo(doc, falloData, currentPage.num, totalPages, bgImage);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(titleFontSize);
        doc.setFillColor(255, 255, 0); // Amarillo para resaltar
        const titleText = "FALLO DE ADJUDICACIÓN";
        const titleWidth = doc.getTextWidth(titleText);
        doc.rect(centerX - titleWidth / 2 - 2, y - titleFontSize + 2, titleWidth + 4, titleFontSize + 2, 'F'); // 'F' para fill
        doc.setTextColor(0,0,0);
        doc.text(titleText, centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        const adqTitle = `“${(falloData.tituloAdquisicion || "ADQUISICIÓN...").toUpperCase()}”`;
        const adqTitleWidth = doc.getTextWidth(adqTitle);
        doc.rect(centerX - adqTitleWidth / 2 - 2, y - titleFontSize + 2, adqTitleWidth + 4, titleFontSize + 2, 'F');
        doc.text(adqTitle, centerX, y, { align: "center" });
        y += baseLineHeight;

        const invNum = `INVITACIÓN RESTRINGIDA NÚMERO ${falloData.referencia || "IR.MSJR.MAT.XXXXXX.DR"}`;
        const invNumWidth = doc.getTextWidth(invNum);
        doc.rect(centerX - invNumWidth / 2 - 2, y - titleFontSize + 2, invNumWidth + 4, titleFontSize + 2, 'F');
        doc.text(invNum, centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(smallFontSize);

        const fechaFallo = falloData.fechaFallo ? new Date(falloData.fechaFallo + 'T00:00:00') : new Date(); // Asegurar que se interprete como local
        const horaParts = (falloData.horaFallo || "00:00").split(":");
        const horaNum = parseInt(horaParts[0], 10);
        const diaNum = fechaFallo.getDate();
        const anioNum = fechaFallo.getFullYear();
        const mesTexto = fechaFallo.toLocaleDateString("es-MX", { month: "long" });

        const horaTexto = numeroALetras(horaNum)?.toUpperCase();
        const diaTexto = numeroALetras(diaNum)?.toUpperCase();
        const anioTexto = numeroALetras(anioNum)?.toUpperCase();

        const introText = `En San Juan del Río, Estado de Querétaro, siendo las ${horaNum} (${horaTexto}) horas del día ${diaNum} (${diaTexto}) de ${mesTexto} de ${anioNum} (${anioTexto}), el Presidente del Comité de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Municipio de San Juan del Río, Querétaro y Secretario de Administración, tomando en cuenta que se ha substanciado el procedimiento de Invitación Restringida ${falloData.referencia || "IR.MSJR.MAT.XXXXXX.DR"}, y que "el Comité" ha emitido el dictamen de adjudicación, con fundamento en lo dispuesto por los artículos 39 y 40 de la Ley de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Estado de Querétaro, emite el presente fallo en los siguientes términos:`;
        // ... código anterior ...
        const introLines = doc.splitTextToSize(introText, contentWidth);
        introLines.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
            y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
            doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight;
        });
        y += baseLineHeight * 1.5;
        // ... resto del código ...
        y += baseLineHeight * 1.5;

        doc.setFont("Helvetica", "bold");
        doc.text("RESULTANDO", centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;
        doc.setFont("Helvetica", "normal");

        const resultandos = [
            `Que, mediante oficio, la ${falloData.departamentoRequirente || "DEPENDENCIA REQUIRENTE..."} solicitó la contratación para la ADQUISICIÓN DE MATERIALES Y ÚTILES DE OFICINA PARA LAS DIFERENTES DEPENDENCIAS DEL MUNICIPIO DE SAN JUAN DEL RÍO, QRO.`,
            `Que la Secretaría de Administración del Municipio de San Juan del Río, Querétaro, con fundamento en lo dispuesto por los artículos 125 y 134 de la Ley Orgánica Municipal del Estado de Querétaro, y demás disposiciones aplicables, cuentan con atribuciones para emitir las bases para la adquisición de bienes y servicios.`,
            `Que se invitó en fecha ${falloData.fechaInvitacion || "FECHA DE INVITACIÓN..."} a las personas jurídicas colectivas que se estimaron convenientes, a participar en el procedimiento de Invitación Restringida número ${falloData.referencia || "IR.MSJR.MAT.XXXXXX.DR"} para la "${(falloData.tituloAdquisicion || "ADQUISICIÓN...").toUpperCase()}".`,
            `Que el día ${falloData.fechaApertura || "FECHA DE APERTURA..."} la Secretaría de Administración del Municipio de San Juan del Río, Querétaro, llevó a cabo en la Sala de Juntas de la Secretaría de Administración, el acto de presentación y apertura de proposiciones, con la participación de los oferentes que decidieron asistir.`,
            `En la hora establecida para llevar a cabo el acto de presentación y apertura de proposiciones, el Secretario Ejecutivo, procedió a hacer la declaratoria de inicio del acto, dando lectura en voz alta al registro de asistencia de los representantes de los oferentes que se mencionan a continuación:`
        ];
        const romanNumerals = ["I.", "II.", "III.", "IV.", "V."];
        resultandos.forEach((res, index) => {
            y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
            const resLines = doc.splitTextToSize(res, contentWidth - 30); // Indent text
            doc.setFont("Helvetica", "bold");
            doc.text(romanNumerals[index], marginLeft, y);
            doc.setFont("Helvetica", "normal");
            resLines.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
                y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
                doc.text(line, marginLeft + 30, y, { align: 'justify', maxWidth: contentWidth - 30 }); y += smallLineHeight;
            });
            // ...
        });

        // --- PAGE 2 ---
        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        const tipoPersonaGanador = falloData.ganador?.nombre?.toUpperCase().includes('S.A. DE C.V.') || falloData.ganador?.nombre?.toUpperCase().includes('S. DE R.L.') ? 'moral' : 'física';
        const p2Text1 = `1. El Secretario Ejecutivo realizó la recepción y apertura de los sobres que contenían las propuestas técnicas y económicas de los oferentes que participaron, cumpliendo con lo establecido en el Artículo 36 fracción I de "la Ley", por lo que, se declaró que la siguiente persona ${tipoPersonaGanador} cumple con los requisitos establecidos en las bases:`;
        const p2Lines1 = doc.splitTextToSize(p2Text1, contentWidth);
p2Lines1.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
    y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
    doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight;
});
        // p2Lines1.forEach(line => { y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight; });

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        doc.setFont("Helvetica", "bold");
        doc.text(`•   ${(falloData.ganador?.nombre || "GANADOR SIN NOMBRE").toUpperCase()}`, marginLeft + 20, y); y += baseLineHeight;
        doc.setFont("Helvetica", "normal");

        const p2Text2 = `2. Posteriormente el Secretario Ejecutivo realizó la apertura del sobre que contenía la propuesta económica del oferente que cumplió con los requisitos técnicos, realizando la revisión cuantitativa de la misma, mencionando las partidas cotizadas, así como el importe total de la propuesta incluyendo el Impuesto al Valor Agregado (I.V.A.):`;
        const p2Lines2 = doc.splitTextToSize(p2Text2, contentWidth);
p2Lines2.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
    y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
    doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight;
});
        // p2Lines2.forEach(line => { y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight; });

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        doc.setFont("Helvetica", "bold");
        doc.text(`•   ${(falloData.ganador?.nombre || "GANADOR SIN NOMBRE").toUpperCase()}`, marginLeft + 20, y); y += baseLineHeight;
        doc.setFont("Helvetica", "normal");

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom + 60, falloData, bgImage, currentPage, totalPages);
        // CORRECCIÓN: Pasar falloData.ganador?.oferta
        y = drawEconomicOfferTable(doc, y, falloData.ganador?.oferta, marginLeft, contentWidth, smallFontSize, smallLineHeight);

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        doc.setFont("Helvetica", "bold");
        doc.text("CONSIDERANDO", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;
        doc.setFont("Helvetica", "normal");
        const considerandoText = `I. Con fundamento en los criterios de análisis y evaluación contenidos en las bases de la presente Invitación Restringida, y en lo dispuesto por los artículos 37, 39 y 40 de "la Ley”, se emite el dictamen correspondiente, así como la manifestación relativa a que la persona ${tipoPersonaGanador}, ${(falloData.ganador?.nombre || "GANADOR SIN NOMBRE").toUpperCase()}, cumple con lo solicitado en sus ofertas técnicas y económicas, las cuales sirven de fundamento para la emisión el presente fallo.\n\nEn mérito de lo expuesto y fundado, la convocante,`;
        const considerandoLines = doc.splitTextToSize(considerandoText, contentWidth);
considerandoLines.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
    y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
    doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight;
});
        // considerandoLines.forEach(line => { y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight; });
        y += baseLineHeight * 1.5;

        doc.setFont("Helvetica", "bold");
        doc.text("RESUELVE:", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;
        doc.setFont("Helvetica", "normal");
        const resuelve1Text = `PRIMERO. Con fundamento en lo dispuesto por los artículos 134 de la Constitución Política de los Estados Unidos Mexicanos; 35 de la Constitución Política del Estado Libre y Soberano de Querétaro; 35, 36, 37, 38, 39 y 40 de la Ley de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Estado de Querétaro; y los puntos 18, 19 y 20 de las bases respectivas, se RESUELVE QUE ES DABLE ADJUDICAR la adquisición objeta de la presente INVITACION RESTRINGIDA a favor de la siguiente persona ${tipoPersonaGanador}, por un precio de acuerdo al siguiente cuadro:`;
        const resuelve1Lines = doc.splitTextToSize(resuelve1Text, contentWidth);
        resuelve1Lines.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
            y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
            doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight;
        });
        // resuelve1Lines.forEach(line => { y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight; });
        y += baseLineHeight * 0.5;

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom + 60, falloData, bgImage, currentPage, totalPages);
        // CORRECCIÓN: Pasar falloData.ganador?.oferta
        y = drawEconomicOfferTable(doc, y, falloData.ganador?.oferta, marginLeft, contentWidth, smallFontSize, smallLineHeight);

        // --- PAGE 3 ---
        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(smallFontSize);
        const resuelves = [
             `SEGUNDO. La persona ${tipoPersonaGanador} adjudicada deberá cumplir con la suscripción del contrato en los términos establecidos en el artículo ${falloData.articuloContrato || "27 Ter"} de "la Ley”, por el importe antes mencionado, a efecto de brindar el servicio de acuerdo a lo establecido en el Anexo I que forma parte de este fallo.`,
             `TERCERO. El oferente adjudicado deberá cumplir con el plazo de entrega el cual será a partir de la firma del contrato. La vigencia del contrato será a partir de su firma y hasta por la vigencia de las pólizas.`,
             `CUARTO. Las garantías de cumplimiento y vicios ocultos establecidos en el contrato, deberán entregarse en la forma y términos establecidos en el artículo ${falloData.articuloGarantia || "31 fracción II"} de "la Ley".`,
             `QUINTO. Notifíquese al oferente participante el contenido del presente fallo, levantando acta respectiva para debida constancia.`
        ];
        resuelves.forEach(res => {
            const resLines = doc.splitTextToSize(res, contentWidth);
            resLines.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
                y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
                doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallLineHeight;
            });
            y += baseLineHeight * 0.5;
        });

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        const cierreText = `Así lo resuelve y firma el Comité Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Municipio de San Juan del Río.`;
        doc.text(cierreText, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += baseLineHeight * 2;

        doc.setFont("Helvetica", "bold");
        doc.text("ATENTAMENTE", centerX, y, { align: "center" }); y += baseLineHeight;
        doc.text("Por parte del Comité de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de", centerX, y, { align: "center" }); y += smallLineHeight;
        doc.text("Servicios del Municipio de San Juan del Río", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;

        y = drawSignatureTableFallo(doc, y, "", falloData.comite || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        // --- PAGE 4 ---
        y = drawSignatureTableFallo(doc, y, "POR PARTE DE LAS ÁREAS REQUIRIENTES", falloData.requirentes || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        const oferentesFirmas = falloData.participantes?.map(p => ({ nombre: p.nombre, cargo: p.cargo || "REPRESENTANTE" })) || [];
        y = drawSignatureTableFallo(doc, y, "POR LOS OFERENTES", oferentesFirmas, marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        y = drawSignatureTableFallo(doc, y, "INVITADOS", falloData.invitadosOIC || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(smallerFontSize);
        const finalNote = `LA PRESENTE HOJA DE FIRMAS, PERTENECE AL FALLO DE ADJUDICACIÓN DE LA INVITACIÓN RESTRINGIDA NÚMERO ${falloData.referencia || "IR.MSJR.MAT.XXXXXX.DR"}. RELATIVO A LA "${(falloData.tituloAdquisicion || "ADQUISICIÓN...").toUpperCase()}".`;
        const finalNoteLines = doc.splitTextToSize(finalNote, contentWidth);
finalNoteLines.forEach((line: string) => { // <--- TIPO AÑADIDO AQUÍ
    y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
    doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallerLineHeight; // Usando smallerLineHeight como en tu código original
});
        // finalNoteLines.forEach(line => { y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); doc.text(line, marginLeft, y, { align: 'justify', maxWidth: contentWidth }); y += smallerLineHeight; });

        // --- PAGE 5 (ANEXO I) ---
        // Asegurarse de que haya una nueva página si es necesario para el Anexo
        if (currentPage.num < totalPages) { // Si no estamos ya en la última página teórica
             // Forzar nueva página si no hay mucho espacio, o si queremos que el Anexo empiece en página nueva
             if (pageHeight - y < pageHeight * 0.3 || currentPage.num < 5) { // Si queda menos del 30% o no es la pág 5
                doc.addPage();
                currentPage.num++;
                y = addHeaderFallo(doc, falloData, currentPage.num, totalPages, bgImage);
             }
        } else { // Si ya estamos en la última página teórica, verificar espacio
            y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        }


        doc.setFont("Helvetica", "bold");
        doc.setFontSize(titleFontSize);
        doc.text("ANEXO I", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;
        doc.text((falloData.tituloAdquisicion || "ADQUISICIÓN...").toUpperCase(), centerX, y, { align: "center" }); y += baseLineHeight * 1.5;

        y = checkAndAddPageFallo(doc, y, pageHeight, marginBottom + 60, falloData, bgImage, currentPage, totalPages);
        // CORRECCIÓN: Pasar falloData.ganador?.oferta
        y = drawEconomicOfferTable(doc, y, falloData.ganador?.oferta, marginLeft, contentWidth, smallFontSize, smallLineHeight);

        // --- Add Footers to all pages ---
        for (let i = 1; i <= currentPage.num; i++) { // Iterar hasta las páginas realmente creadas
            doc.setPage(i);
            addFooterFallo(doc, falloData);
            // Opcional: Si el encabezado necesita actualizarse dinámicamente más allá del número de página
            // y no se hizo en checkAndAddPageFallo, se podría volver a llamar a addHeaderFallo aquí.
            // Pero la implementación actual de addHeaderFallo ya toma pageNum.
        }

        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // Considera revocar el URL después de un tiempo si ya no es necesario
        // setTimeout(() => URL.revokeObjectURL(url), 5000);

    } catch (error) {
        console.error("❌ Error generando el PDF del Fallo:", error);
        alert(`Error al generar PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export default generarPDFFallo;