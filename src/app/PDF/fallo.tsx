import { jsPDF } from "jspdf";
// Assume you create this API call function
import { getFalloDataById } from "../peticiones_api/peticionFallo"; // Adjust path

// --- Reusable Helpers (Keep from previous code) ---
const numeroALetras = (num: number): string => { /* ... same as before ... */
    // Basic implementation - Consider a more robust library for production
    if (num === undefined || num === null || isNaN(num)) return "XXXX";
    const unidades: { [key: number]: string } = { // Use object for easier lookup
        0: "CERO", 1: "UNO", 2: "DOS", 3: "TRES", 4: "CUATRO", 5: "CINCO", 6: "SEIS", 7: "SIETE", 8: "OCHO", 9: "NUEVE",
        10: "DIEZ", 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE", 20: "VEINTE", 30: "TREINTA", 40: "CUARENTA",
        50: "CINCUENTA", 60: "SESENTA", 70: "SETENTA", 80: "OCHENTA", 90: "NOVENTA"
    };
    // Add basic handling for teens and twenties
    if (num >= 0 && num <= 15) return unidades[num];
    if (num < 20) return "DIECI" + unidades[num - 10].toLowerCase();
    if (num < 30) return num === 20 ? "VEINTE" : "VEINTI" + unidades[num - 20].toLowerCase();
    // Basic year handling
    if (num === 2024) return "DOS MIL VEINTICUATRO";
    if (num === 2025) return "DOS MIL VEINTICINCO";
    // Basic decenas y unidades
    if (num < 100) {
        const u = num % 10;
        const d = Math.floor(num / 10) * 10; // Get the base ten (20, 30, etc.)
        // Ensure 'd' exists in unidades before accessing
        const decenaStr = unidades[d] || '';
        return decenaStr + (u > 0 ? " Y " + (unidades[u] || '') : "");
    }
    // Add more complex logic or library for hundreds, thousands etc.
    console.warn(`numeroALetras needs enhancement for number: ${num}`);
    return num.toString(); // Fallback
};


const loadImage = (src: string): Promise<HTMLImageElement> => { /* ... same as before ... */
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => {
          console.error("Error loading image:", err);
          reject(new Error(`Failed to load image: ${src}`));
      };
      // Ensure the image path is correct and accessible from the public folder
      img.src = src.startsWith('/') ? src : `/${src}`; // Add leading slash if missing
  });
};


// --- Interface for Fallo Data ---
// TODO: Define this interface accurately based on your API response
interface FalloData {
    referencia?: string;
    tituloAdquisicion?: string;
    fechaFallo?: string; // e.g., "2025-02-20"
    horaFallo?: string; // e.g., "12:00"
    departamentoRequirente?: string; // e.g., "Secretaría de Servicios Públicos Municipales"
    fechaInvitacion?: string; // e.g., "17 de febrero de dos mil veinticinco"
    fechaApertura?: string; // e.g., "03 de marzo de dos mil veinticinco"
    // List ALL participants mentioned in RESULTANDO V
    participantes?: Array<{ nombre: string }>;
    // Details of the winner
    ganador?: {
        nombre: string;
        oferta: {
            partidas?: number;
            subtotal: number;
            iva: number;
            total: number;
        };
    };
    // Contract details for RESUELVE
    articuloContrato?: string; // e.g., "27 Ter"
    articuloGarantia?: string; // e.g., "31 fracción II"
    // Attendee lists for signatures
    comite?: Array<{ nombre: string; cargo: string }>;
    requirentes?: Array<{ nombre: string; cargo: string }>;
    invitadosOIC?: Array<{ nombre: string; cargo: string }>;
    // Add presidenteComite, secretarioEjecutivo if needed separately
}

// --- Header for Fallo ---
const addHeaderFallo = (doc: jsPDF, falloData: FalloData, pageNum: number, totalPages: number, bgImage: HTMLImageElement | null): number => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginRightPt = 2.0 * (72 / 2.54); // Approx 2 cm
    const headerX = pageWidth - marginRightPt;
    const startY = 35;
    const fontSize = 8;
    const lineSpacing = fontSize * 1.2;

    // 1. Optional Background Image
    if (bgImage) {
        try {
            doc.addImage(bgImage, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
        } catch (e) { console.error("Error adding background image:", e); }
    }

    // 2. Header Text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0);

    let currentY = startY;
    doc.text("SECRETARÍA DE ADMINISTRACIÓN", headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    doc.text(falloData.referencia || "IR.MSJR.MAT.XXXXXX.DR", headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    // Ensure tituloAdquisicion exists and split if too long, taking first part
    const titleParts = (falloData.tituloAdquisicion || "ADQUISICIÓN...").split(' ');
    const shortTitle = titleParts.slice(0, 4).join(' ') + (titleParts.length > 4 ? '...' : '');
    doc.text(shortTitle.toUpperCase(), headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    doc.text(`Página ${pageNum} de ${totalPages}`, headerX, currentY, { align: "right" });

    // Add SJR Logos if needed (same as Dictamen header)
    // ...

    const topMarginPts = 2.5 * (72 / 2.54);
    return topMarginPts + (currentY - startY); // Adjust effective margin
};

// --- Footer for Fallo (Can reuse Dictamen footer if identical) ---
const addFooterFallo = (doc: jsPDF, falloData: FalloData): void => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginBottomPt = 1.5 * (72 / 2.54);
    const footerY = pageHeight - marginBottomPt;
    const footerFontSize = 9;
    const lineSpacing = footerFontSize * 1.1;
    const leftMargin = 1.5 * (72 / 2.54);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(footerFontSize);
    doc.setTextColor(0, 0, 0);

    let currentY = footerY;
    doc.text("427 689 00 12", leftMargin, currentY);
    doc.setTextColor(255, 0, 128); // Pinkish color
    doc.textWithLink("www.sanjuandelrio.gob.mx", leftMargin + 100, currentY, { url: 'http://www.sanjuandelrio.gob.mx' });
    doc.setTextColor(0, 0, 0);
    currentY += lineSpacing;
    doc.text("Blvd. Paso de los Guzmán No. 24, Barrio de la Concepción, C.P. 76803 San Juan del Río, Querétaro", leftMargin, currentY);

    // Add Municipality Logo/Dates if needed (same as Dictamen footer)
    // ... (Example using loadImage)
};

// --- Check and Add Page (Adapt for Fallo Header/Footer) ---
const checkAndAddPageFallo = (doc: jsPDF, currentY: number, pageHeight: number, bottomMargin: number, falloData: FalloData, bgImage: HTMLImageElement | null, currentPageRef: { num: number }, totalPages: number): number => {
    let y = currentY;
    if (y > pageHeight - bottomMargin) {
        // Footer is added in the final loop
        doc.addPage();
        currentPageRef.num++;
        // Header is added here
        y = addHeaderFallo(doc, falloData, currentPageRef.num, totalPages, bgImage);
    }
    return y;
};

// --- Helper to Draw Economic Offer Table (Pages 2, 5) ---
const drawEconomicOfferTable = (doc: jsPDF, y: number, offerData: FalloData['ganador']['oferta'], marginLeft: number, contentWidth: number, fontSize: number, lineHeight: number): number => {
    let currentY = y;
    if (!offerData) return currentY; // Skip if no offer data

    const col1Width = contentWidth * 0.3; // Partida
    const col2Width = contentWidth * 0.35; // Label (Subtotal, IVA, Total)
    const col3Width = contentWidth * 0.35; // Amount
    const col2X = marginLeft + col1Width;
    const col3X = col2X + col2Width;
    const rowHeight = lineHeight * 1.4;
    const textPadding = 2;
    const currencyFormat = { style: 'currency', currency: 'MXN' };

    const tableData = [
        { label1: "NÚMERO DE PARTIDA QUE PROPONE:", value1: `${offerData.partidas || 'XX'} PARTIDAS`, label2: "SUBTOTAL", value2: offerData.subtotal },
        { label1: "", value1: "", label2: "I.V.A.", value2: offerData.iva },
        { label1: "", value1: "", label2: "SUMA TOTAL DEL IMPORTE DE LOS BIENES PROPUESTOS", value2: offerData.total }
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(fontSize);
    doc.setLineWidth(0.5);

    let tableStartY = currentY;

    tableData.forEach((row, rowIndex) => {
        const rowY = tableStartY + rowIndex * rowHeight;
        const textY = rowY + rowHeight * 0.65; // Adjusted Y for text inside row

        // Draw cell borders
        doc.rect(marginLeft, rowY, col1Width, rowHeight, 'S');
        doc.rect(col2X, rowY, col2Width + col3Width, rowHeight, 'S'); // Combine last two columns visually for label/value pairs

        // Column 1 content (only for first row)
        if (row.label1) {
            doc.text(row.label1, marginLeft + textPadding, textY - lineHeight * 0.2); // Slightly higher label
             doc.text(row.value1, marginLeft + textPadding, textY + lineHeight * 0.4); // Value below label
        }

        // Column 2/3 content
        doc.text(row.label2, col2X + textPadding, textY);
         // Format currency for value2
        const formattedValue = (row.value2 ?? 0).toLocaleString('es-MX', currencyFormat);
        doc.text(formattedValue, col3X + textPadding , textY); // Align amount left in its implicit column

        // Draw vertical separator line between Label and Amount areas (visual guide)
        doc.line(col3X, rowY, col3X, rowY + rowHeight);

        currentY = rowY + rowHeight; // Update Y to bottom of current row
    });

    return currentY + lineHeight; // Return Y after table + spacing
};


// --- Signature Table Helper (Can reuse from Dictamen if layout is same) ---
// Assuming drawSignatureTableDictamen is available and suitable
const drawSignatureTableFallo = drawSignatureTableDictamen; // Alias for clarity


// --- Main PDF Generation Function ---
const generarPDFFallo = async (id_fallo: number): Promise<void> => {
    let bgImage: HTMLImageElement | null = null;
    try {
        bgImage = await loadImage("/images/oficio_sjr_membrete.png"); // Adjust path
    } catch (imgError) {
        console.warn("Background image not loaded, proceeding without it.", imgError);
        bgImage = null;
    }

    try {
        // --- 1. Fetch Data ---
        const falloData: FalloData = await getFalloDataById(id_fallo);
        console.log("Fallo Data:", falloData);

        if (!falloData || !falloData.referencia || !falloData.ganador) {
             alert("Error: No se pudieron obtener los datos completos del fallo.");
             return;
        }

        // --- 2. Setup Document ---
        const doc = new jsPDF('p', 'pt', 'letter');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const cmToPt = 72 / 2.54;

        // Margins
        const marginLeft = 1.5 * cmToPt;
        const marginRight = 1.5 * cmToPt;
        const marginTop = 2.5 * cmToPt; // Initial estimate, header will adjust
        const marginBottom = 2.0 * cmToPt;

        const contentWidth = pageWidth - marginLeft - marginRight;
        const centerX = pageWidth / 2;

        // Font Sizes
        const baseFontSize = 10;
        const smallFontSize = 9;
        const smallerFontSize = 8;
        const titleFontSize = 11;

        // Line Heights
        const baseLineHeight = baseFontSize * 1.2;
        const smallLineHeight = smallFontSize * 1.2;

        // --- Total Pages (Assume 5 for this specific document) ---
        const totalPages = 5;

        // --- 3. Render Content ---
        const finalDoc = doc; // Use the same doc instance directly
        const currentPage = { num: 1 };
        let y = marginTop; // Y position tracker

        // --- PAGE 1 ---
        y = addHeaderFallo(finalDoc, falloData, currentPage.num, totalPages, bgImage);

        finalDoc.setFont("helvetica", "bold");
        finalDoc.setFontSize(titleFontSize);
        finalDoc.setFillColor(255, 255, 0); // Yellow highlight for Title
        const titleText = "FALLO DE ADJUDICACIÓN";
        const titleWidth = finalDoc.getTextWidth(titleText);
        finalDoc.rect(centerX - titleWidth / 2 - 2, y - titleFontSize + 2, titleWidth + 4, titleFontSize + 2, 'F');
        finalDoc.setTextColor(0,0,0);
        finalDoc.text(titleText, centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        const adqTitle = `“${falloData.tituloAdquisicion?.toUpperCase() || "ADQUISICIÓN..."}”`;
        const adqTitleWidth = finalDoc.getTextWidth(adqTitle);
        finalDoc.rect(centerX - adqTitleWidth / 2 - 2, y - titleFontSize + 2, adqTitleWidth + 4, titleFontSize + 2, 'F');
        finalDoc.text(adqTitle, centerX, y, { align: "center" });
        y += baseLineHeight;

        const invNum = `INVITACIÓN RESTRINGIDA NÚMERO ${falloData.referencia || "IR.MSJR.MAT.XXXXXX.DR"}`;
        const invNumWidth = finalDoc.getTextWidth(invNum);
         finalDoc.rect(centerX - invNumWidth / 2 - 2, y - titleFontSize + 2, invNumWidth + 4, titleFontSize + 2, 'F');
        finalDoc.text(invNum, centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallFontSize);
        // Format date/time for intro
        const fecha = new Date(falloData.fechaFallo || Date.now());
        const horaParts = (falloData.horaFallo || "00:00").split(":");
        const horaNum = parseInt(horaParts[0], 10);
        const diaNum = fecha.getDate();
        const anioNum = fecha.getFullYear();
        const horaTexto = numeroALetras(horaNum).toUpperCase();
        const diaTexto = numeroALetras(diaNum).toUpperCase();
        const anioTexto = numeroALetras(anioNum).toUpperCase();

        const introText = `En San Juan del Río, Estado de Querétaro, siendo las ${horaNum} (${horaTexto}) horas del día ${diaNum} (${diaTexto}) de ${fecha.toLocaleDateString("es-MX", { month: "long" })} de ${anioNum} (${anioTexto}), el Presidente del Comité... y Secretario de Administración, tomando en cuenta que se ha substanciado el procedimiento de Invitación Restringida ${falloData.referencia}, y que "el Comité" ha emitido el dictamen de adjudicación, con fundamento en lo dispuesto por los artículos 39 y 40 de la Ley de Adquisiciones... emite el presente fallo en los siguientes términos:`;
        const introLines = finalDoc.splitTextToSize(introText, contentWidth);
        introLines.forEach(line => {
            y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
            finalDoc.text(line, marginLeft, y); y += smallLineHeight;
        });
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("RESULTANDO", centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;
        finalDoc.setFont("helvetica", "normal");

        const resultandos = [
            `Que, mediante oficio, la ${falloData.departamentoRequirente || "..."} solicitó la contratación...`,
            `Que la Secretaría de Administración... con fundamento en... artículos 125 y 134... y demás disposiciones... cuentan con atribuciones para emitir las bases...`,
            `Que se invitó en fecha ${falloData.fechaInvitacion || "..."} a las personas jurídicas colectivas... a participar en... ${falloData.referencia} para la "${falloData.tituloAdquisicion?.toUpperCase()}".`,
            `Que el día ${falloData.fechaApertura || "..."} la Secretaría de Administración... llevó a cabo... el acto de presentación y apertura... con la participación de los oferentes...`,
            `En la hora establecida... el Secretario Ejecutivo, procedió a hacer la declaratoria... dando lectura... al registro de asistencia... de los oferentes que se mencionan a continuación:`
        ];

        const romanNumerals = ["I.", "II.", "III.", "IV.", "V."];
        resultandos.forEach((res, index) => {
            y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
            const resLines = finalDoc.splitTextToSize(res, contentWidth - 30); // Indent text
             finalDoc.setFont("helvetica", "bold");
             finalDoc.text(romanNumerals[index], marginLeft, y);
             finalDoc.setFont("helvetica", "normal");
            resLines.forEach((line, lineIndex) => {
                // Only check page break after first line of paragraph
                if(lineIndex > 0) y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
                finalDoc.text(line, marginLeft + 30, y); y += smallLineHeight;
            });

             // Add participant list for item V
            if (index === 4 && falloData.participantes) {
                finalDoc.setFont("helvetica", "bold");
                falloData.participantes.forEach(p => {
                    y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
                    finalDoc.text(`•   ${p.nombre.toUpperCase()}`, marginLeft + 40, y); // Indented list
                    y += smallLineHeight;
                });
                finalDoc.setFont("helvetica", "normal");
            }
             y += baseLineHeight * 0.5; // Space between resultandos
        });

        // --- PAGE 2 ---
        y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        const p2Text1 = `1. El Secretario Ejecutivo realizó la recepción y apertura de los sobres... cumpliendo con lo establecido en el Artículo 36 fracción I de "la Ley", por lo que, se declaró que la siguiente persona ${falloData.ganador?.nombre?.includes('S.A. DE C.V.') ? 'moral' : 'física'} cumple...`;
        const p2Lines1 = finalDoc.splitTextToSize(p2Text1, contentWidth);
        p2Lines1.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
         finalDoc.setFont("helvetica", "bold");
        finalDoc.text(`•   ${falloData.ganador?.nombre?.toUpperCase()}`, marginLeft + 20, y); y += baseLineHeight;
        finalDoc.setFont("helvetica", "normal");

        const p2Text2 = `2. Posteriormente el Secretario Ejecutivo realizó la apertura del sobre que contenía la propuesta económica del oferente... realizando la revisión cuantitativa... mencionando las partidas cotizadas, así como el importe total...:`;
         const p2Lines2 = finalDoc.splitTextToSize(p2Text2, contentWidth);
        p2Lines2.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
         y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
         finalDoc.setFont("helvetica", "bold");
        finalDoc.text(`•   ${falloData.ganador?.nombre?.toUpperCase()}`, marginLeft + 20, y); y += baseLineHeight;
        finalDoc.setFont("helvetica", "normal");

        // Draw Economic Offer Table (First time)
         y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom + 60, falloData, bgImage, currentPage, totalPages); // Space before table
         y = drawEconomicOfferTable(finalDoc, y, falloData.ganador?.oferta, marginLeft, contentWidth, smallFontSize, smallLineHeight);

        y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("CONSIDERANDO", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;
        finalDoc.setFont("helvetica", "normal");
        const considerandoText = `I. Con fundamento en los criterios de análisis y evaluación contenidos en las bases, y en lo dispuesto por los artículos 37, 39 y 40 de "la Ley”, se emite el dictamen correspondiente, así como la manifestación relativa a que la persona ${falloData.ganador?.nombre?.includes('S.A. DE C.V.') ? 'moral' : 'física'}, cumple con lo solicitado en sus ofertas técnicas y económicas, las cuales sirven de fundamento para la emisión el presente fallo.\n\nEn mérito de lo expuesto y fundado, la convocante,`;
        const considerandoLines = finalDoc.splitTextToSize(considerandoText, contentWidth);
        considerandoLines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("RESUELVE:", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;
        finalDoc.setFont("helvetica", "normal");
        const resuelve1Text = `PRIMERO. Con fundamento en lo dispuesto por los artículos 134 de la Constitución Política... 35 de la Constitución Política del Estado... y los puntos 18, 19 y 20 de las bases respectivas, se RESUELVE QUE ES DABLE ADJUDICAR la adquisición objeta de la presente INVITACION RESTRINGIDA a favor de la siguiente persona moral, por un precio de acuerdo al siguiente cuadro:`;
        const resuelve1Lines = finalDoc.splitTextToSize(resuelve1Text, contentWidth);
         resuelve1Lines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight * 0.5;

        // Draw Economic Offer Table (Second time - Awarded Price)
        y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom + 60, falloData, bgImage, currentPage, totalPages); // Space before table
        y = drawEconomicOfferTable(finalDoc, y, falloData.ganador?.oferta, marginLeft, contentWidth, smallFontSize, smallLineHeight);


        // --- PAGE 3 ---
        y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallFontSize);
        const resuelves = [
             `SEGUNDO. La persona moral adjudicada deberá cumplir con la suscripción del contrato en los términos establecidos en el artículo ${falloData.articuloContrato || "27 Ter"} de "la Ley”, por el importe antes mencionado, a efecto de brindar el servicio de acuerdo a lo establecido en el Anexo I que forma parte de este fallo:`,
             `TERCERO. El oferente adjudicado deberá cumplir con el plazo de entrega el cual será a partir de la firma del contrato. La vigencia del contrato será a partir de su firma y hasta por la vigencia de las pólizas.`,
             `CUARTO. Las garantías de cumplimiento y vicios ocultos establecidos en el contrato, deberán entregarse en la forma y términos establecidos en el artículo ${falloData.articuloGarantia || "31 fracción II"}.`,
             `QUINTO. Notifíquese al oferente participante el contenido del presente fallo, levantando acta respectiva para debida constancia.`
        ];
         resuelves.forEach(res => {
            const resLines = finalDoc.splitTextToSize(res, contentWidth);
            resLines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
             y += baseLineHeight * 0.5; // Space between resolves
         });

        const cierreText = `Así lo resuelve y firma el Comité Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Municipio de San Juan del Río.`;
        y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        finalDoc.text(cierreText, marginLeft, y); y += baseLineHeight * 2;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("ATENTAMENTE", centerX, y, { align: "center" }); y += baseLineHeight;
        finalDoc.text("Por parte del Comité de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de", centerX, y, { align: "center" }); y += smallLineHeight;
        finalDoc.text("Servicios del Municipio de San Juan del Río", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;

        // Signature Table - Comité
        y = drawSignatureTableFallo(finalDoc, y, "", falloData.comite || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        // --- PAGE 4 ---
        // Signature Table - Requirentes
        y = drawSignatureTableFallo(finalDoc, y, "POR PARTE DE LAS ÁREAS REQUIRIENTES", falloData.requirentes || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        // Signature Table - Oferentes
        const oferentesFirmas = falloData.participantes?.map(p => ({ nombre: p.nombre })) || []; // Need {nombre, cargo} structure if available, using just name here
        y = drawSignatureTableFallo(finalDoc, y, "POR LOS OFERENTES", oferentesFirmas, marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        // Signature Table - Invitados (OIC)
         y = drawSignatureTableFallo(finalDoc, y, "INVITADOS", falloData.invitadosOIC || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);

        // Final note
         y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
         finalDoc.setFont("helvetica", "normal");
         finalDoc.setFontSize(smallerFontSize);
         const finalNote = `LA PRESENTE HOJA DE FIRMAS, PERTENECE AL FALLO DE ADJUDICACIÓN DE LA LICITACIÓN PÚBLICA NACIONAL NÚMERO ${falloData.referencia}. RELATIVO A LA "${falloData.tituloAdquisicion?.toUpperCase()}".`;
         const finalNoteLines = finalDoc.splitTextToSize(finalNote, contentWidth);
         finalNoteLines.forEach(line => { finalDoc.text(line, marginLeft, y); y += smallerFontSize * 1.2; });

        // --- PAGE 5 (ANEXO I) ---
        y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom, falloData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "bold");
        finalDoc.setFontSize(titleFontSize);
        finalDoc.text("ANEXO I", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;
        finalDoc.text(falloData.tituloAdquisicion?.toUpperCase() || "ADQUISICIÓN...", centerX, y, { align: "center" }); y += baseLineHeight * 1.5;

        // Draw Economic Offer Table (Third time - Anexo)
         y = checkAndAddPageFallo(finalDoc, y, pageHeight, marginBottom + 60, falloData, bgImage, currentPage, totalPages); // Space before table
         y = drawEconomicOfferTable(finalDoc, y, falloData.ganador?.oferta, marginLeft, contentWidth, smallFontSize, smallLineHeight);


        // --- 4. Add Footers ---
        for (let i = 1; i <= totalPages; i++) {
            finalDoc.setPage(i);
            addFooterFallo(finalDoc, falloData);
            // Optional: Re-run addHeaderFallo here if you need dynamic content per page in header beyond page number
        }

        // --- 5. Output PDF ---
        const blob = finalDoc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // setTimeout(() => URL.revokeObjectURL(url), 2000);

    } catch (error) {
        console.error("❌ Error generating Fallo PDF:", error);
        alert(`Error al generar PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export default generarPDFFallo;