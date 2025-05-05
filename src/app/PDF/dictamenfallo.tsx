import { jsPDF } from "jspdf";
// Assume you create this API call function
import { getDictamenDataById } from "../peticiones_api/peticionDictamen"; // Adjust path

// --- Reusable Helpers (Keep from original code or slightly adapt) ---

const numeroALetras = (num: number): string => {
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
        return unidades[d] + (u > 0 ? " Y " + unidades[u] : "");
    }
    // Add more complex logic or library for hundreds, thousands etc.
    console.warn(`numeroALetras needs enhancement for number: ${num}`);
    return num.toString(); // Fallback
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
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

// --- Helpers Specific to Dictamen PDF ---

// TODO: Define an interface for dictamenData for better type safety
interface DictamenData {
    referencia?: string;
    tipoDocumento?: string;
    fechaReunion?: string; // e.g., "2025-03-14"
    horaReunion?: string; // e.g., "14:00"
    lugarReunion?: string;
    presidenteSuplente?: { nombre: string; cargo: string };
    secretarioEjecutivo?: { nombre: string; cargo: string };
    comite?: Array<{ nombre: string; cargo: string; tipo?: 'base' | 'vocal' | 'sindica' }>; // Added tipo for clarity
    requirentes?: Array<{ nombre: string; cargo: string; }>;
    invitadosOIC?: Array<{ nombre: string; cargo: string; }>; // Organo Interno Control
    // Bidder/Winner Info
    ganador?: {
        nombre: string;
        checklist?: Array<{ item: string; entregado: boolean }>;
        oferta?: { subtotal: number; iva: number; total: number; partidas?: number };
    };
    // Other participants
    otrosOferentes?: Array<{ nombre: string }>;
    // Chronology
    cronologia?: {
        convocatoriaFecha?: string;
        aclaracionesFecha?: string;
        propuestasFecha?: string;
    };
    // Contract details
    contrato?: {
        montoMinimo?: number;
        montoMaximo?: number;
    };
    horaCierre?: string; // e.g., "14:15"
    // Add any other fields from your API
}


// --- Header for Dictamen ---
const addHeaderDictamen = (doc: jsPDF, dictamenData: DictamenData, pageNum: number, totalPages: number, bgImage: HTMLImageElement | null): number => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginRightPt = 2.0 * (72 / 2.54); // Approx 2 cm
    const headerX = pageWidth - marginRightPt;
    const startY = 35; // Y position for first line
    const fontSize = 8;
    const lineSpacing = fontSize * 1.2;

    // 1. Optional Background Image
    if (bgImage) {
        try {
            doc.addImage(bgImage, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST'); // Use FAST for potentially better performance
        } catch (e) {
            console.error("Error adding background image:", e);
        }
    }

    // 2. Header Text (Right Aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.setTextColor(0, 0, 0); // Black text

    let currentY = startY;
    doc.text("SECRETARÍA DE ADMINISTRACIÓN,", headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    doc.text(dictamenData.referencia || "IR.MSJR.MAT.XXXXXX.DR", headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    doc.text(dictamenData.tipoDocumento || "ADQUISICIÓN DE MATERIAL...", headerX, currentY, { align: "right" });
    currentY += lineSpacing;
    // Page Number - Important: This gets added *last* after knowing total pages
    // We add it here in the header's space, but the call comes later
    doc.text(`Página ${pageNum} de ${totalPages}`, headerX, currentY, { align: "right" });

    // Add SJR Logos (Adjust coordinates and size as needed)
    // Example: You might need to load these images too if they aren't part of bgImage
    // try {
    //     const logoSJR1 = await loadImage('/images/sjr_logo1.png'); // Load appropriate logo
    //     const logoSJR2 = await loadImage('/images/sjr_logo2.png');
    //     doc.addImage(logoSJR1, 'PNG', 30, 30, 60, 30); // x, y, width, height
    //     doc.addImage(logoSJR2, 'PNG', 100, 30, 60, 30);
    //     doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    //     doc.text("Administración", 170, 45); // Adjust position
    // } catch(e) { console.error("Error loading/adding logos:", e); }


    // Return the effective top margin in points
    const topMarginPts = 2.5 * (72 / 2.54); // Approx 2.5 cm
    return topMarginPts + (currentY - startY); // Start margin + height of header text
};

// --- Footer for Dictamen ---
const addFooterDictamen = (doc: jsPDF, dictamenData: DictamenData): void => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginBottomPt = 1.5 * (72 / 2.54); // Approx 1.5 cm
    const footerY = pageHeight - marginBottomPt;
    const footerFontSize = 9;
    const lineSpacing = footerFontSize * 1.1;
    const leftMargin = 1.5 * (72 / 2.54); // Approx 1.5cm

    doc.setFont("helvetica", "normal");
    doc.setFontSize(footerFontSize);
    doc.setTextColor(0, 0, 0); // Black text

    let currentY = footerY;
    // Contact Info (Left Aligned)
    doc.text("427 689 00 12", leftMargin, currentY);
    doc.setTextColor(255, 0, 128); // Pinkish color for website (adjust RGB)
    doc.textWithLink("www.sanjuandelrio.gob.mx", leftMargin + 100, currentY, { url: 'http://www.sanjuandelrio.gob.mx' }); // Make it clickable
    doc.setTextColor(0, 0, 0); // Reset color
    currentY += lineSpacing;
    doc.text("Blvd. Paso de los Guzmán No. 24, Barrio de la Concepción, C.P. 76803 San Juan del Río, Querétaro", leftMargin, currentY);

    // Add Municipality Logo and Dates (Right Aligned or Centered at bottom)
    // Example: Assuming you have a logo to load
    // try {
    //     const logoMunicipio = await loadImage('/images/municipio_logo_2024-2027.png');
    //     const logoWidth = 60;
    //     const logoHeight = 30;
    //     const logoX = pageWidth - leftMargin - logoWidth; // Right aligned
    //     const logoY = footerY - logoHeight / 2; // Center vertically relative to first line
    //     doc.addImage(logoMunicipio, 'PNG', logoX, logoY, logoWidth, logoHeight);
    // } catch(e) { console.error("Error loading/adding footer logo:", e); }

};

// --- Check and Add Page (Adapt to use Dictamen Header/Footer) ---
// TODO: Define DictamenData interface
const checkAndAddPageDictamen = (doc: jsPDF, currentY: number, pageHeight: number, bottomMargin: number, dictamenData: DictamenData, bgImage: HTMLImageElement | null, currentPageRef: { num: number }, totalPages: number): number => {
    let y = currentY;
    if (y > pageHeight - bottomMargin) {
        // Footer is added in the final loop
        doc.addPage();
        currentPageRef.num++; // Increment current page number
        // Header is added here, passing the current page number
        y = addHeaderDictamen(doc, dictamenData, currentPageRef.num, totalPages, bgImage);
    }
    return y;
};

// --- Helper to Draw Highlighted Box (Page 1 Attendees) ---
const drawAttendeeBox = (doc: jsPDF, y: number, attendees: DictamenData['comite'], requirentes: DictamenData['requirentes'], invitadosOIC: DictamenData['invitadosOIC'], marginLeft: number, contentWidth: number, fontSize: number, lineHeight: number): number => {
    let currentY = y;
    const padding = 5;
    const boxStartY = currentY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.text("SE ENCUENTRAN PRESENTES:", marginLeft + padding, currentY);
    currentY += lineHeight * 1.2;

    doc.setFont("helvetica", "normal");
    let attendeeText = "";

    // Combine all attendees into one string for simplicity, or list them
    const allPresent = [
        ...(attendees || []),
        ...(requirentes || []),
        ...(invitadosOIC || [])
    ];

    allPresent.forEach(p => {
        if (p) { // Check if participant exists
             attendeeText += `${p.nombre || 'Nombre Desconocido'}, EN SU CARÁCTER DE ${p.cargo || 'Cargo Desconocido'}; `;
        }
    });
     // Add quorum statement
    attendeeText += ` POR LO QUE, EL SECRETARIO EJECUTIVO INFORMA QUE EXISTE QUÓRUM LEGAL PARA SESIONAR.`;

    // Draw the text wrapped
    const lines = doc.splitTextToSize(attendeeText, contentWidth - padding * 2);
    lines.forEach((line: string) => {
        doc.text(line, marginLeft + padding, currentY);
        currentY += lineHeight;
    });

    const boxEndY = currentY + padding;

    // Draw the yellow box
    doc.setFillColor(255, 255, 0); // Yellow
    doc.rect(marginLeft, boxStartY - lineHeight, contentWidth, boxEndY - (boxStartY - lineHeight), 'F'); // x, y, w, h, style (F=fill)

    // Re-draw the text on top of the box
    currentY = boxStartY; // Reset Y to draw text again
    doc.setTextColor(0, 0, 0); // Ensure text is black
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.text("SE ENCUENTRAN PRESENTES:", marginLeft + padding, currentY);
    currentY += lineHeight * 1.2;
    doc.setFont("helvetica", "normal");
    lines.forEach((line: string) => {
        doc.text(line, marginLeft + padding, currentY);
        currentY += lineHeight;
    });

    return boxEndY + lineHeight * 0.5; // Return Y position after the box + spacing
};


// --- Helper to Draw Checklist Table (Page 2) ---
const drawChecklistTable = (doc: jsPDF, y: number, checklistData: DictamenData['ganador']['checklist'], ganadorNombre: string, marginLeft: number, contentWidth: number, fontSize: number, lineHeight: number): number => {
    let currentY = y;
    const col1Width = contentWidth * 0.7; // Document name
    const col2Width = contentWidth * 0.15; // SI
    const col3Width = contentWidth * 0.15; // NO
    const col2X = marginLeft + col1Width;
    const col3X = col2X + col2Width;
    const headerY = currentY;
    const rowHeight = lineHeight * 1.5; // Adjust as needed
    const textPadding = 2;

    doc.setFillColor(200, 200, 200); // Light grey for header
    doc.rect(marginLeft, headerY, contentWidth, rowHeight, 'F'); // Header background

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);

    // Header Text (Vertically centered approximation)
    const headerTextY = headerY + rowHeight / 2 + fontSize / 3;
    doc.text("DOCUMENTO", marginLeft + textPadding, headerTextY);
    // Bidder name spans SI/NO columns
    doc.splitTextToSize(ganadorNombre.toUpperCase() || "OFERENTE", col2Width + col3Width - textPadding*2).forEach((line, index) => {
        doc.text(line, col2X + (col2Width + col3Width) / 2, headerY + textPadding + index * lineHeight, { align: 'center' });
    });
    doc.text("ENTREGÓ", col2X + (col2Width + col3Width) / 2 , headerTextY + lineHeight, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(marginLeft, headerY, marginLeft + contentWidth, headerY); // Top line
    doc.line(marginLeft, headerY + rowHeight, marginLeft + contentWidth, headerY + rowHeight); // Bottom line header
    doc.line(col2X, headerY, col2X, headerY + rowHeight); // Vertical line 1
   // doc.line(col3X, headerY, col3X, headerY + rowHeight); // Vertical line 2 - Removed for SI/NO header

    // Sub-header for SI / NO
     const subHeaderY = headerY + rowHeight;
     const subHeaderTextY = subHeaderY + rowHeight / 2 + fontSize / 3;
     doc.rect(col2X, subHeaderY, col2Width, rowHeight, 'S'); // Stroke only for cells
     doc.rect(col3X, subHeaderY, col3Width, rowHeight, 'S');
     doc.text("SI", col2X + col2Width / 2, subHeaderTextY, { align: 'center' });
     doc.text("NO", col3X + col3Width / 2, subHeaderTextY, { align: 'center' });
     doc.line(marginLeft, subHeaderY + rowHeight, marginLeft + contentWidth, subHeaderY + rowHeight); // Line below SI/NO

    currentY = subHeaderY + rowHeight; // Move Y below sub-header

    // Table Rows
    doc.setFont("helvetica", "normal");
    (checklistData || []).forEach(item => {
        const itemTextY = currentY + rowHeight / 2 + fontSize / 3;
        // Split document name if too long
        const lines = doc.splitTextToSize(item.item, col1Width - textPadding * 2);
        let textYForRow = currentY + textPadding + fontSize * 0.8; // Start text Y
        lines.forEach(line => {
            doc.text(line, marginLeft + textPadding, textYForRow);
            textYForRow += lineHeight * 0.9; // Adjust spacing for wrapped lines
        });

        // Calculate dynamic row height based on wrapped text
        const dynamicRowHeight = Math.max(rowHeight, (lines.length * lineHeight * 0.9) + textPadding*2 );
        const checkMarkY = currentY + dynamicRowHeight / 2 + fontSize / 3; // Center checkmark vertically

        // Draw checkmark ('X')
        if (item.entregado) {
            doc.text("X", col2X + col2Width / 2, checkMarkY, { align: 'center' });
        } else {
            doc.text("X", col3X + col3Width / 2, checkMarkY, { align: 'center' });
        }

        // Draw lines for the row
        doc.rect(marginLeft, currentY, col1Width, dynamicRowHeight, 'S'); // Cell 1 border
        doc.rect(col2X, currentY, col2Width, dynamicRowHeight, 'S'); // Cell 2 border
        doc.rect(col3X, currentY, col3Width, dynamicRowHeight, 'S'); // Cell 3 border

        currentY += dynamicRowHeight; // Move Y to the start of the next row
    });

    return currentY + lineHeight; // Return Y after the table + spacing
};


// --- Helper to Draw Min/Max Table (Page 5) ---
const drawMinMaxTable = (doc: jsPDF, y: number, contratoData: DictamenData['contrato'], marginLeft: number, contentWidth: number, fontSize: number, lineHeight: number): number => {
    let currentY = y;
    const col1Width = contentWidth * 0.3; // Partida
    const col2Width = contentWidth * 0.35; // Min
    const col3Width = contentWidth * 0.35; // Max
    const col2X = marginLeft + col1Width;
    const col3X = col2X + col2Width;
    const headerY = currentY;
    const rowHeight = lineHeight * 1.5;
    const textPadding = 2;
    const currencyFormat = { style: 'currency', currency: 'MXN' };


    doc.setFillColor(200, 200, 200); // Header background
    doc.rect(marginLeft, headerY, contentWidth, rowHeight, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);

    // Header Text
    const headerTextY = headerY + rowHeight / 2 + fontSize / 3;
    doc.text("PARTIDA", marginLeft + col1Width / 2, headerTextY, { align: 'center' });
    doc.text("MONTO MÍNIMO", col2X + col2Width / 2, headerTextY, { align: 'center' });
    doc.text("MONTO MÁXIMO", col3X + col3Width / 2, headerTextY, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.rect(marginLeft, headerY, contentWidth, rowHeight, 'S'); // Outline header

    currentY += rowHeight; // Move Y below header

    // Data Row
    const dataY = currentY;
    const dataTextY = dataY + rowHeight / 2 + fontSize / 3;
    doc.setFont("helvetica", "normal");
    doc.text("UNICA", marginLeft + col1Width / 2, dataTextY, { align: 'center' });
    doc.text((contratoData?.montoMinimo ?? 0).toLocaleString('es-MX', currencyFormat), col2X + col2Width / 2, dataTextY, { align: 'center' });
    doc.text((contratoData?.montoMaximo ?? 0).toLocaleString('es-MX', currencyFormat), col3X + col3Width / 2, dataTextY, { align: 'center' });

    doc.rect(marginLeft, dataY, contentWidth, rowHeight, 'S'); // Outline row
    doc.line(col2X, headerY, col2X, dataY + rowHeight); // Vertical line 1
    doc.line(col3X, headerY, col3X, dataY + rowHeight); // Vertical line 2

    currentY += rowHeight; // Move Y below data row

    return currentY + lineHeight; // Return Y after table + spacing
};


// --- Helper to Draw Signature Tables (Pages 5, 6, 7) ---
// Adapts the previous version slightly for Dictamen layout
const drawSignatureTableDictamen = (
    doc: jsPDF, y: number, title: string, attendees: Array<{ nombre: string; cargo?: string }>,
    marginLeft: number, contentWidth: number, fontSize: number, lineHeight: number,
    pageHeight: number, bottomMargin: number, dictamenData: DictamenData, bgImage: HTMLImageElement | null,
    currentPageRef: { num: number }, totalPages: number
): number => {
    let currentY = y;

    if (!attendees || attendees.length === 0) return currentY; // Skip if no attendees for this group

    // Check page break BEFORE title
    currentY = checkAndAddPageDictamen(doc, currentY, pageHeight, bottomMargin + 60, dictamenData, bgImage, currentPageRef, totalPages); // Extra space needed

    const tableStartY = currentY + lineHeight; // Y where table lines/content start
    let tableCurrentY = tableStartY; // Y for drawing rows
    const rowMinHeight = lineHeight * 4.0; // Min height for name, cargo, and space (adjust)
    const textPadding = 3;
    const signSpaceRatio = 0.35; // How much width for the signature column

    const nameColWidth = contentWidth * (1 - signSpaceRatio);
    const signColWidth = contentWidth * signSpaceRatio;
    const nameColXStart = marginLeft;
    const signColXStart = nameColXStart + nameColWidth;

    // --- Draw Section Title (e.g., POR PARTE DEL COMITÉ) ---
    if (title) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize + 1); // Slightly larger for title
        doc.text(title.toUpperCase(), marginLeft, currentY);
        currentY = tableStartY; // Update Y to start table content
        tableCurrentY = currentY; // Sync table Y
    }

    // --- Draw Rows ---
    attendees.forEach((a, index) => {
        // --- Calculate Row Height ---
        doc.setFont("helvetica", "bold"); doc.setFontSize(fontSize -1); // Smaller bold for name
        const nameLines = doc.splitTextToSize((a.nombre || "[SIN NOMBRE]").toUpperCase(), nameColWidth - (textPadding * 2));

        doc.setFont("helvetica", "normal"); doc.setFontSize(fontSize - 1); // Smaller normal for cargo
        const cargoLines = doc.splitTextToSize((a.cargo || "[SIN CARGO]").toUpperCase(), nameColWidth - (textPadding * 2));

        const requiredTextHeight = (nameLines.length + cargoLines.length) * (lineHeight * 0.9); // Adjusted line height
        const currentRowHeight = Math.max(rowMinHeight, requiredTextHeight + textPadding * 2);
        const rowEndY = tableCurrentY + currentRowHeight;

        // --- Check Page Break BEFORE drawing row content ---
        if (rowEndY > pageHeight - bottomMargin) {
           // Draw vertical lines up to current point before break (optional, can make messy)
           // doc.setLineWidth(0.5);
           // doc.line(signColXStart, tableStartY, signColXStart, tableCurrentY); // Separator line
           // doc.line(nameColXStart, tableStartY, nameColXStart, tableCurrentY); // Left border
           // doc.line(signColXStart + signColWidth, tableStartY, signColXStart + signColWidth, tableCurrentY); // Right border

            // Add page, header
            doc.addPage();
            currentPageRef.num++;
            currentY = addHeaderDictamen(doc, dictamenData, currentPageRef.num, totalPages, bgImage); // Reset Y global

            // Reset table drawing coordinates for new page
            tableStartY = currentY + lineHeight * 0.5; // Adjust Y start on new page
            tableCurrentY = tableStartY; // Reset table Y for this page

            // No need to redraw table header unless you want it on every page break
        }

        // --- Draw Row Content ---
        const textStartY = tableCurrentY + textPadding * 2; // Start drawing text lower
        let currentTextY = textStartY;

        // Draw Name
        doc.setFont("helvetica", "bold"); doc.setFontSize(fontSize - 1);
        nameLines.forEach((line: string) => { doc.text(line, nameColXStart + textPadding, currentTextY); currentTextY += lineHeight * 0.9; });

        // Draw Cargo
        doc.setFont("helvetica", "normal"); doc.setFontSize(fontSize - 1);
        cargoLines.forEach((line: string) => { doc.text(line, nameColXStart + textPadding, currentTextY); currentTextY += lineHeight * 0.9; });

        // --- Draw Row Lines ---
        doc.setLineWidth(0.5);
        doc.line(nameColXStart, rowEndY, signColXStart + signColWidth, rowEndY); // Bottom horizontal line
        // Draw vertical lines for *this row only* for cleaner breaks
        doc.line(signColXStart, tableCurrentY, signColXStart, rowEndY); // Separator line
        doc.line(nameColXStart, tableCurrentY, nameColXStart, rowEndY); // Left border
        doc.line(signColXStart + signColWidth, tableCurrentY, signColXStart + signColWidth, rowEndY); // Right border


        // --- Add "FIRMA" label in the signature column ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fontSize - 1);
        doc.text("FIRMA", signColXStart + signColWidth / 2, tableCurrentY + lineHeight, { align: 'center' });

        // Move Y for the next row
        tableCurrentY = rowEndY;
    }); // End forEach attendee

    // Update the main Y position after the entire table section
    currentY = tableCurrentY + lineHeight * 1.5; // Add spacing after the last row of this section

    return currentY; // Return the updated global Y
};


// --- Main PDF Generation Function ---
const generarPDFDictamen = async (id_dictamen: number): Promise<void> => {
    let bgImage: HTMLImageElement | null = null;
    try {
        // Adjust path if your background image is different or in another location
        bgImage = await loadImage("/images/oficio_sjr_membrete.png"); // Or maybe acta.png? Check image needed
    } catch (imgError) {
        console.warn("Background image not loaded, proceeding without it.", imgError);
        bgImage = null; // Ensure it's null if loading failed
    }

    try {
        // --- 1. Fetch Data ---
        const dictamenData: DictamenData = await getDictamenDataById(id_dictamen);
        console.log("Dictamen Data:", dictamenData); // For debugging

        if (!dictamenData || !dictamenData.referencia) {
             alert("Error: No se pudieron obtener los datos completos del dictamen.");
             return;
        }

        // --- 2. Setup Document ---
        const doc = new jsPDF('p', 'pt', 'letter');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const cmToPt = 72 / 2.54;

        // Define Margins (adjust as needed to match visual)
        const marginLeft = 1.5 * cmToPt;     // Approx 1.5 cm
        const marginRight = 1.5 * cmToPt;    // Approx 1.5 cm
        const marginTop = 2.5 * cmToPt;      // Will be determined by header height
        const marginBottom = 2.0 * cmToPt;   // Approx 2.0 cm

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

        // --- 3. Render Content (Simulated Pass 1 - No Footers/Headers yet) ---
        // We need total pages first. Let's render content to count pages.
        // This is simplified. A more robust way involves calculating heights without drawing.
        // For now, we'll draw, count, then redraw with headers/footers.

        let y = marginTop; // Initial Y estimate
        const currentPage = { num: 1 }; // Use object reference for page counting

        // --- PAGE 1 CONTENT ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(titleFontSize);
        doc.text("ANÁLISIS Y DICTAMEN DE ADJUDICACIÓN PARA LA INVITACIÓN RESTRINGIDA", centerX, y, { align: "center" });
        y += baseLineHeight;
        doc.text(`${dictamenData.referencia || "IR.MSJR.MAT.XXXXXX.DR"}, RELATIVO A LA “${dictamenData.tipoDocumento?.toUpperCase() || "ADQUISICIÓN..."}”.`, centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(smallFontSize);
        // Format date and time
        const fecha = new Date(dictamenData.fechaReunion || Date.now());
        const horaParts = (dictamenData.horaReunion || "00:00").split(":");
        const horaNum = parseInt(horaParts[0], 10);
        const diaNum = fecha.getDate();
        const mes = fecha.toLocaleDateString("es-MX", { month: "long" }).toUpperCase();
        const anioNum = fecha.getFullYear();
        const horaTexto = numeroALetras(horaNum).toUpperCase();
        const diaTexto = numeroALetras(diaNum).toUpperCase();
        const anioTexto = numeroALetras(anioNum).toUpperCase(); // Or use specific fiscal year if available

        const introText = `EN EL MUNICIPIO DE SAN JUAN DEL RÍO, ESTADO DE QUERÉTARO, SIENDO LAS ${horaNum} (${horaTexto}) HORAS DEL DÍA ${diaNum} (${diaTexto}) DE ${mes} DE ${anioNum} (${anioTexto}), HORA Y FECHA FIJADA EN LAS BASES DEL PROCEDIMIENTO DE LA INVITACION RESTRINGIDA SE REUNIERON LOS INTEGRANTES DEL COMITÉ DE ADQUISICIONES Y SERVICIOS EN ADELANTE “EL COMITÉ” EN ${dictamenData.lugarReunion || "LA SALA DE JUNTAS..."} PARA LA CELEBRACIÓN DEL EVENTO SEÑALADO EN EL PROEMIO; LO ANTERIOR DE CONFORMIDAD POR LO DISPUESTO EN LOS ARTÍCULOS 125 Y 134 DE LA CONSTITUCIÓN POLÍTICA DE LOS ESTADOS UNIDOS MEXICANOS; 35 DE LA CONSTITUCIÓN POLÍTICA DEL ESTADO LIBRE Y SOBERANO DE QUERÉTARO; 1, 12, 19, 20 FRACCIÓN II, Y 39 DE LA LEY DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS DEL ESTADO DE QUERÉTARO, EN ADELANTE “LA LEY” Y DEMÁS DISPOSICIONES RELATIVAS Y APLICABLES.`;
        const introLines = doc.splitTextToSize(introText, contentWidth);
        introLines.forEach(line => { doc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight;

        doc.setFont("helvetica", "bold");
        doc.text("1. DE LO ANTES EXPUESTO,", marginLeft, y);
        y += smallLineHeight;
        doc.setFont("helvetica", "normal");
        const p1Text = `EL COMITÉ DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN SERVICIOS DEL MUNICIPIO DE SAN JUAN DEL RÍO, QUERÉTARO, EN ADELANTE “EL COMITÉ” SE DECLARA EN SESIÓN Y PRESIDE ESTE ACTO EL ${dictamenData.presidenteSuplente?.nombre || "PRESIDENTE SUPLENTE"}, EN SU CARÁCTER DE PRESIDENTE SUPLENTE DE “EL COMITÉ”, E INSTRUYE AL SECRETARIO EJECUTIVO PARA QUE VERIFIQUE LA LISTA DE ASISTENCIA DE LOS SERVIDORES PÚBLICOS QUE SE ENCUENTRAN PRESENTES.`;
        const p1Lines = doc.splitTextToSize(p1Text, contentWidth);
        p1Lines.forEach(line => { doc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight * 0.5;

        // Attendee Box
        y = drawAttendeeBox(doc, y, dictamenData.comite, dictamenData.requirentes, dictamenData.invitadosOIC, marginLeft, contentWidth, smallFontSize, smallLineHeight);
        y += baseLineHeight;

        doc.text(`ACTO SEGUIDO, ${dictamenData.presidenteSuplente?.nombre || "PRESIDENTE SUPLENTE"}, PRESIDENTE SUPLENTE DE “EL COMITÉ”, INSTRUYE AL SECRETARIO EJECUTIVO... (continuar texto página 1 si es necesario)`, marginLeft, y);
        y += smallLineHeight;
        
        // --- Simulate adding other pages content to count them ---
        // ... (Add dummy text or calculations for page 2, 3, 4, 5, 6 content height) ...
        // This is where a real height calculation or pre-rendering pass would happen.
        // For this example, we'll *assume* we know the total pages (e.g., 7 from the sample).
        const totalPages = 7; // <<<<----- IMPORTANT: Replace with actual page calculation if possible

        // --- 4. Reset and Redraw with Headers/Footers ---
        // Create a *new* document instance for the final output
        const finalDoc = new jsPDF('p', 'pt', 'letter');
        currentPage.num = 1; // Reset page counter for final drawing

        // --- Draw Page 1 Again (with header) ---
        y = addHeaderDictamen(finalDoc, dictamenData, currentPage.num, totalPages, bgImage); // Add header for page 1

        finalDoc.setFont("helvetica", "bold");
        finalDoc.setFontSize(titleFontSize);
        finalDoc.text("ANÁLISIS Y DICTAMEN DE ADJUDICACIÓN PARA LA INVITACIÓN RESTRINGIDA", centerX, y, { align: "center" });
        y += baseLineHeight;
        finalDoc.text(`${dictamenData.referencia || "IR.MSJR.MAT.XXXXXX.DR"}, RELATIVO A LA “${dictamenData.tipoDocumento?.toUpperCase() || "ADQUISICIÓN..."}”.`, centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallFontSize);
        // Re-draw Intro Text
        const introLinesFinal = finalDoc.splitTextToSize(introText, contentWidth);
        introLinesFinal.forEach(line => {
            y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
            finalDoc.text(line, marginLeft, y);
            y += smallLineHeight;
        });
        y += baseLineHeight;
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("1. DE LO ANTES EXPUESTO,", marginLeft, y);
        y += smallLineHeight;
        finalDoc.setFont("helvetica", "normal");
        const p1LinesFinal = finalDoc.splitTextToSize(p1Text, contentWidth);
        p1LinesFinal.forEach(line => {
             y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
             finalDoc.text(line, marginLeft, y);
             y += smallLineHeight;
        });
        y += baseLineHeight * 0.5;
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom + 100, dictamenData, bgImage, currentPage, totalPages); // Need more space before box

        // Re-draw Attendee Box
        y = drawAttendeeBox(finalDoc, y, dictamenData.comite, dictamenData.requirentes, dictamenData.invitadosOIC, marginLeft, contentWidth, smallFontSize, smallLineHeight);
        y += baseLineHeight;
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);

        finalDoc.text(`ACTO SEGUIDO, ${dictamenData.presidenteSuplente?.nombre || "PRESIDENTE SUPLENTE"}, PRESIDENTE SUPLENTE DE “EL COMITÉ”, INSTRUYE AL SECRETARIO EJECUTIVO PROCEDAN...`, marginLeft, y);
        y += smallLineHeight;


        // --- PAGE 2 CONTENT ---
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallFontSize);
        finalDoc.text("SOMETER A CONSIDERACIÓN DE LOS INTEGRANTES DE ESTE CUERPO COLEGIADO EL ORDEN DEL DÍA PROPUESTO PARA EL PRESENTE ACTO:", marginLeft, y);
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.setFontSize(titleFontSize);
        finalDoc.text("ORDEN DEL DÍA", centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallFontSize);
        const ordenDia = [
            "DECLARATORIA DE INICIO DEL ACTO Y LECTURA DEL REGISTRO DE ASISTENCIA AL ACTO;",
            "ANÁLISIS CUALITATIVO DE LAS PROPUESTAS TÉCNICAS Y ECONÓMICAS;",
            "DICTAMEN; Y",
            "DECLARACIÓN DE LA TERMINACIÓN DEL EVENTO Y CIERRE DEL ACTA."
        ];
        ordenDia.forEach((item, index) => {
            y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
            finalDoc.text(`${index + 1}. ${item}`, marginLeft, y);
            y += smallLineHeight;
        });
        y += baseLineHeight;

        const aprobacionText = `EL SECRETARIO EJECUTIVO DESPUÉS DE DAR LECTURA AL ORDEN DEL DIA PROPUESTO PARA EL ACTO EN MENCIÓN, CONSULTA A “EL COMITÉ” POR SU APROBACIÓN. LEVANTANDO EL SENTIDO DE LA VOTACIÓN ES APROBADO POR UNANIMIDAD DE LOS PRESENTES.`;
        const aprobacionLines = finalDoc.splitTextToSize(aprobacionText, contentWidth);
        aprobacionLines.forEach(line => {
            y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
            finalDoc.text(line, marginLeft, y);
            y += smallLineHeight;
        });
        y += baseLineHeight;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("2. ANÁLISIS CUALITATIVO DE LAS PROPUESTAS TÉCNICAS Y ECONÓMICAS", marginLeft, y);
        y += smallLineHeight;
        finalDoc.setFont("helvetica", "normal");
        const analisisText = `CON FUNDAMENTO EN EL ARTÍCULO 36 DE “LA LEY” LA PERSONA MORAL ${dictamenData.ganador?.nombre?.toUpperCase() || "OFERENTE GANADOR"} PRESENTÓ SOBRE DE SU PROPUESTA TÉCNICA, EL CUAL CONTENÍAN DOCUMENTACIÓN LEGAL, FINANCIERA, ADMINISTRATIVA Y TÉCNICA, MISMA QUE SE REVISÓ, ANALIZÓ Y EVALUÓ DANDO LOS SIGUIENTES RESULTADOS:`;
        const analisisLines = finalDoc.splitTextToSize(analisisText, contentWidth);
        analisisLines.forEach(line => {
             y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
             finalDoc.text(line, marginLeft, y);
             y += smallLineHeight;
        });
        y += baseLineHeight * 0.5;

        // Draw Checklist Table
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom + 200, dictamenData, bgImage, currentPage, totalPages); // Need lots of space for table
        y = drawChecklistTable(finalDoc, y, dictamenData.ganador?.checklist, dictamenData.ganador?.nombre, marginLeft, contentWidth, smallerFontSize, smallLineHeight);


        // --- PAGE 3 CONTENT ---
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallFontSize);
        const p3Text1 = `ACTO SEGUIDO Y EN VIRTUD DEL CUMPLIMIENTO DE LA PROPUESTA TÉCNICA Y CONFORME A LO SEÑALADO EN EL ACTO DE APERTURA DE SOBRES, EL ÁREA SOLICITANTE VERIFICA QUE, LA MISMA CUMPLE CON TODOS LOS REQUISITOS SEÑALADOS Y EXIGIDOS EN LAS BASES EN LOS RUBROS LEGALES, FINANCIEROS, ADMINISTRATIVOS Y TÉCNICOS POR LO TANTO ES ACEPTADA DICHA PROPUESTA TÉCNICA CONFORME AL CRITERIO DE EVALUACIÓN BINARIO, EL SECRETARIO EJECUTIVO DE “EL COMITÉ" PROCEDE AL ESTUDIO DE LA OFERTA ECONÓMICA DEL OFERENTE PARTICIPANTE ${dictamenData.ganador?.nombre?.toUpperCase() || "GANADOR"} QUIEN CUMPLIÓ CON LOS REQUISITOS SOLICITADOS EN LAS BASES DE ESTE PROCEDIMIENTO..., POR LO ANTERIOR Y ATENTO A LO ESTABLECIDO EN LA FRACCIÓN SEGUNDA DEL ARTÍCULO 36 DE "LA LEY”, SE PRONUNCIA EN VOZ ALTA LA OFERTA ECONÓMICA A PRECIO UNITARIO, DE ACUERDO A LO SIGUIENTE:`;
        const p3Lines1 = finalDoc.splitTextToSize(p3Text1, contentWidth);
        p3Lines1.forEach(line => {
             y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
             finalDoc.text(line, marginLeft, y);
             y += smallLineHeight;
        });
        y += baseLineHeight;

        // Economic Offer Box/Table (Simplified text version)
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom + 50, dictamenData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "bold");
        const offer = dictamenData.ganador?.oferta;
        const currencyFormat = { style: 'currency', currency: 'MXN' };
        finalDoc.text(`NÚMERO DE PARTIDA QUE PROPONE: ${offer?.partidas || 'XX'} PARTIDAS`, marginLeft, y);
        y += baseLineHeight;
        finalDoc.text(`SUBTOTAL: ${(offer?.subtotal ?? 0).toLocaleString('es-MX', currencyFormat)}`, marginLeft + contentWidth * 0.5, y);
        y += baseLineHeight;
        finalDoc.text(`I.V.A.: ${(offer?.iva ?? 0).toLocaleString('es-MX', currencyFormat)}`, marginLeft + contentWidth * 0.5, y);
         y += baseLineHeight;
        finalDoc.text(`SUMA TOTAL DEL IMPORTE DE LOS BIENES PROPUESTOS: ${(offer?.total ?? 0).toLocaleString('es-MX', currencyFormat)}`, marginLeft + contentWidth * 0.2, y);
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "normal");
        const p3Text2 = `VISTOS LOS PRECIOS Y ATENTO AL PROCEDIMIENTO REALIZADO POR LA DIRECCIÓN DE ADQUISICIONES LOS PRECIOS MÁS CONVENIENTES PARA ESTE CUERPO COLEGIADO SON LOS QUE OFERTA LA PERSONA MORAL ${dictamenData.ganador?.nombre?.toUpperCase()}.`;
        const p3Lines2 = finalDoc.splitTextToSize(p3Text2, contentWidth);
        p3Lines2.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("3. DICTAMEN", marginLeft, y);
        y+= baseLineHeight;
        finalDoc.setFont("helvetica", "normal");
        const p3Text3 = `DE ACUERDO A LAS DOCUMENTALES QUE INTEGRAN EL PROCEDIMIENTO DE LA INVITACION RESTRINGIDA NÚMERO ${dictamenData.referencia}, RELATIVO A LA “${dictamenData.tipoDocumento?.toUpperCase()}”, Y UNA VEZ REALIZADO EL ANÁLISIS QUE ANTECEDE, SE DICTAMINA LO SIGUIENTE:`;
         const p3Lines3 = finalDoc.splitTextToSize(p3Text3, contentWidth);
        p3Lines3.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("RESEÑA CRONOLÓGICA", centerX, y, {align: "center"});
        y += baseLineHeight * 1.5;
        finalDoc.setFont("helvetica", "normal");
        const c = dictamenData.cronologia;
        const allOferentes = [dictamenData.ganador?.nombre, ...(dictamenData.otrosOferentes?.map(o => o.nombre) || [])].filter(Boolean).join(', ');

        const cronoText = `a) CON FECHA ${c?.convocatoriaFecha || "XX de XXX"} DEL AÑO EN CURSO SE LANZO LA CONVOCATORIA...\n`
                        + `b) CON FECHA ${c?.aclaracionesFecha || "XX de XXX"} DEL AÑO EN CURSO A LAS HH:MM HORAS... SE LLEVÓ A CABO LA JUNTA DE ACLARACIONES...\n`
                        + `c) CON FECHA ${c?.propuestasFecha || "XX de XXX"} DEL AÑO EN CURSO A LAS HH:MM HORAS... PRESENTACIÓN DE APERTURA DE PROPOSICIONES... SE REGISTRARON: ${allOferentes}.`; // Add point d if needed
        const cronoLines = finalDoc.splitTextToSize(cronoText, contentWidth);
         cronoLines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight;


        // --- PAGE 4 CONTENT ---
         y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("RESULTADO DE LA EVALUACIÓN", centerX, y, {align: "center"});
        y += baseLineHeight * 1.5;
        finalDoc.setFont("helvetica", "normal");
        finalDoc.text("PROPUESTA QUE SE ACEPTA:", marginLeft, y);
        y += baseLineHeight;
        finalDoc.setFont("helvetica", "normal"); // List item marker bold, text normal?
        const p4Text1 = `DE CONFORMIDAD CON EL ARTÍCULO 36 DE “LA LEY”, “EL COMITÉ” ACEPTA LA PROPUESTA COMO A CONTINUACIÓN SE MENCIONA:\n•   ${dictamenData.ganador?.nombre?.toUpperCase()} SE ACEPTA SU PROPUESTA, TODA VEZ QUE CUMPLE TÉCNICA, ADMINISTRATIVA Y ECONÓMICAMENTE CON LAS CARACTERÍSTICAS, DESCRIPCIÓN Y REQUISITOS SOLICITADOS EN BASES.`;
        const p4Lines1 = finalDoc.splitTextToSize(p4Text1, contentWidth);
        p4Lines1.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight * 1.5;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("CONSIDERANDO", centerX, y, { align: "center"});
        y += baseLineHeight * 1.5;
        finalDoc.setFont("helvetica", "normal");
        const considerando1 = `I.   QUE "EL COMITÉ" INTEGRADO EN ESTE MOMENTO POR ${dictamenData.presidenteSuplente?.nombre || "PRESIDENTE"}... (listar todos los del comité como en el original)... EN CONJUNTO TIENEN COMPETENCIA PARA EMITIR EL DICTAMEN DE ADJUDICACIÓN DEL PRESENTE PROCEDIMIENTO DE CONTRATACIÓN, EN TÉRMINOS DE LO DISPUESTO POR EL ARTÍCULO 39 DE “LA LEY".`;
        const considerando2 = `II.  QUE DE CONFORMIDAD CON LO ESTABLECIDO POR EL ARTÍCULO 39 DE “LA LEY”, ASÍ COMO LO DISPUESTO EN BASES, “EL COMITÉ”, REALIZÓ EL ANÁLISIS Y EVALUACIÓN CUALITATIVA DE LOS REQUISITOS... RESULTANDO LO SIGUIENTE.`;
        [considerando1, considerando2].forEach(cText => {
             const cLines = finalDoc.splitTextToSize(cText, contentWidth - 20); // Indent text slightly
             cLines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft + 20, y); y += smallLineHeight; });
             y += baseLineHeight * 0.5;
        });
         y += baseLineHeight;

         finalDoc.setFont("helvetica", "bold");
        finalDoc.text("RESUELVE", centerX, y, { align: "center"});
        y += baseLineHeight * 1.5;
        finalDoc.setFont("helvetica", "normal");
        const resuelve1 = `PRIMERO. CON FUNDAMENTO EN LO DISPUESTO POR LOS ARTÍCULOS 35 DE LA CONSTITUCIÓN POLÍTICA DEL ESTADO DE QUERETARO Y 39 DE “LA LEY"; SE ADJUDICA LA ADQUISICIÓN DE LOS BIENES Y/O SERVICIOS... A FAVOR DEL OFERENTE ${dictamenData.ganador?.nombre?.toUpperCase()} POR HABER RESULTADO SU PROPUESTA SOLVENTE AL OFRECER EL MEJOR PRECIO Y CUMPLIR CON TODOS LOS REQUISITOS...`;
        const res1Lines = finalDoc.splitTextToSize(resuelve1, contentWidth);
        res1Lines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight;


        // --- PAGE 5 CONTENT ---
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallFontSize);
        const resuelve2 = `SEGUNDO. LA PERSONA MORAL ADJUDICADA DEBERÁ CUMPLIR CON LA SUSCRIPCIÓN DEL CONTRATO, EN LA FORMA Y TÉRMINOS ESTABLECIDOS EN EL ARTÍCULO 42 DE “LA LEY”, LOS PRECIOS UNITARIOS DE LOS BIENES ADJUDICADOS, ASÍ COMO EL MONTO MÁXIMO Y MÍNIMO QUE SE ESTABLECEN EN EL SIGUIENTE CUADRO:`;
        const res2Lines = finalDoc.splitTextToSize(resuelve2, contentWidth);
        res2Lines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight * 0.5;

        // Draw Min/Max Table
         y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom + 50, dictamenData, bgImage, currentPage, totalPages);
         y = drawMinMaxTable(finalDoc, y, dictamenData.contrato, marginLeft, contentWidth, smallFontSize, smallLineHeight);
         y += baseLineHeight;

        const resuelve3 = `TERCERO. CON FUNDAMENTO EN EL ARTÍCULO 39 DE “LA LEY”; COMUNÍQUESE EL PRESENTE DICTAMEN A LA CONVOCANTE, PARA LA EMISIÓN DEL FALLO CORRESPONDIENTE.`;
        const res3Lines = finalDoc.splitTextToSize(resuelve3, contentWidth);
        res3Lines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight;

        const cierreHoraParts = (dictamenData.horaCierre || "00:15").split(":");
        const cierreHoraNum = parseInt(cierreHoraParts[0] || "0", 10);
        const cierreMinNum = parseInt(cierreHoraParts[1] || "0", 10);
        const cierreHoraTexto = numeroALetras(cierreHoraNum).toUpperCase();
        const cierreMinTexto = numeroALetras(cierreMinNum).toUpperCase();

        const cierreText = `NO HABIENDO OTRO ASUNTO QUE TRATAR SE DA POR TERMINADO EL PRESENTE ACTO SIENDO LAS ${cierreHoraNum} HORAS CON ${cierreMinNum} (${cierreMinTexto}) MINUTOS DEL DÍA EN QUE SE ACTÚA, QUEDANDO CONSTANCIA QUE TODO LO ACTUADO SE REALIZA EN APEGO A LO ESTABLECIDO EN “LA LEY”, MANIFESTANDO QUE LA FALTA DE FIRMA DE ALGÚN PARTICIPANTE, NO INVALIDARA EL ACTO.`;
        const cierreLines = finalDoc.splitTextToSize(cierreText, contentWidth);
         cierreLines.forEach(line => { /* ... check page and draw ... */ y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages); finalDoc.text(line, marginLeft, y); y += smallLineHeight; });
        y += baseLineHeight * 2;

        finalDoc.setFont("helvetica", "bold");
        finalDoc.text("ATENTAMENTE", centerX, y, { align: "center"});
        y += baseLineHeight * 0.5;
        finalDoc.text("Por parte del Comité de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de", centerX, y, { align: "center"});
         y += smallLineHeight;
        finalDoc.text("Servicios del Municipio de San Juan del Río", centerX, y, { align: "center"});
        y += baseLineHeight * 1.5;

        // --- Signature Tables Start (Page 5/6/7) ---
        // Combine Comité members (Presidente, Secretario, Vocales, Sindica) if needed
        const comiteFirmas = dictamenData.comite || []; // Adjust based on how your API returns them
        y = drawSignatureTableDictamen(finalDoc, y, "", comiteFirmas, marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);


         // --- PAGE 6 CONTENT (Continue Signatures) ---
         // Requirentes Signature Table
         y = drawSignatureTableDictamen(finalDoc, y, "POR PARTE DE LAS ÁREAS REQUIRIENTES", dictamenData.requirentes || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);

        // Oferentes Signature Table
        const oferentesFirmas = [
            { nombre: dictamenData.ganador?.nombre || "Ganador" },
            ...(dictamenData.otrosOferentes || [])
        ].filter(o => o.nombre); // Filter out any potential null/empty names
         y = drawSignatureTableDictamen(finalDoc, y, "POR LOS OFERENTES", oferentesFirmas, marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);


         // --- PAGE 7 CONTENT (Continue Signatures) ---
         // Invitados Signature Table (OIC)
         y = drawSignatureTableDictamen(finalDoc, y, "INVITADOS", dictamenData.invitadosOIC || [], marginLeft, contentWidth, smallFontSize, smallLineHeight, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);

        // Final Note
        y = checkAndAddPageDictamen(finalDoc, y, pageHeight, marginBottom, dictamenData, bgImage, currentPage, totalPages);
        finalDoc.setFont("helvetica", "normal");
        finalDoc.setFontSize(smallerFontSize);
        const finalNote = `LA PRESENTE HOJA DE FIRMAS, PERTENECE AL ACTA DE ANÁLISIS Y DICTAMEN DE LA INVITACION RESTRINGIDA ${dictamenData.referencia} RELATIVA A LA "${dictamenData.tipoDocumento?.toUpperCase()}".`;
        const finalNoteLines = finalDoc.splitTextToSize(finalNote, contentWidth);
        finalNoteLines.forEach(line => {
             finalDoc.text(line, marginLeft, y);
             y += smallerFontSize * 1.2;
        });


        // --- 5. Add Footers to All Pages ---
        for (let i = 1; i <= totalPages; i++) {
            finalDoc.setPage(i);
            addFooterDictamen(finalDoc, dictamenData);
            // Re-add header just to ensure page number is correct (already drawn, but text is updated)
            // This is slightly redundant if header content is static except page number
            // addHeaderDictamen(finalDoc, dictamenData, i, totalPages, bgImage);
        }

        // --- 6. Output PDF ---
        const blob = finalDoc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // Optional: Clean up URL object
        // setTimeout(() => URL.revokeObjectURL(url), 2000);

    } catch (error) {
        console.error("❌ Error generating Dictamen PDF:", error);
        alert(`Error al generar PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
};

export default generarPDFDictamen;