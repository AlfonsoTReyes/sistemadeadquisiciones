import { jsPDF } from "jspdf";

// --- Constantes y Configuración ---
const MARGIN = 50;
const BASE_LINE_HEIGHT = 12;
const SMALL_LINE_HEIGHT = 10;
const BOTTOM_MARGIN_THRESHOLD = 80;
const INVITACION_NUM = "IR.MSJR.SER.202502.DS"; // Hardcoded
const TOTAL_PAGES_ESTIMATED = 53; // Hardcoded total

// ... (imágenes y otras constantes) ...

// --- Ayudante: Añadir Cabecera ---
const addHeader = (doc: jsPDF, pageNum: number, totalPages: number, invitacionNum: string): number => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const headerStartY = 30;

    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text("[Logo SJR BC]", MARGIN, headerStartY + 25);
    doc.text("[Logo SJR Admin]", MARGIN + 80, headerStartY + 25);
    doc.setTextColor(0);

    const textBlockX = pageWidth - MARGIN;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("SECRETARÍA DE ADMINISTRACIÓN", textBlockX, headerStartY + 5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(invitacionNum, textBlockX, headerStartY + 15, { align: "right" });
    doc.text("CONTRATO DE SERVICIO DE", textBlockX, headerStartY + 25, { align: "right" });
    doc.text("MATERIAL IMPRESO.", textBlockX, headerStartY + 35, { align: "right" });
    doc.setFont("helvetica", "bold");
    const pageText = totalPages > 0 ? `Página ${pageNum} de ${totalPages}` : `Página ${pageNum}`;
    doc.text(pageText, textBlockX, headerStartY + 45, { align: "right" });

    return headerStartY + 65;
};

// --- Ayudante: Añadir Pie de Página ---
const addFooter = (doc: jsPDF): void => {
    // ... (código del footer sin cambios) ...
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const footerStartY = pageHeight - 55;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("427 689 00 12", MARGIN, footerStartY);
    doc.text("www.sanjuandelrio.gob.mx", MARGIN + 100, footerStartY);
    doc.setFontSize(8);
    doc.text("Blvd. Paso de los Guzmán No. 24, Barrio de la Concepción, C.P. 76803 San Juan del Río, Querétaro", pageWidth / 2, footerStartY + 15, { align: "center" });

    const rightBlockX = pageWidth - MARGIN;
    doc.setFontSize(7); doc.setTextColor(150); doc.text("[Escudo]", rightBlockX-60, footerStartY+10); doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SAN JUAN DEL RÍO", rightBlockX, footerStartY + 5, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("2024 - 2027", rightBlockX, footerStartY + 17, { align: "right" });

    doc.setTextColor(0);
};

// --- Ayudante: Comprobar y Añadir Página ---
const checkAndAddPage = (doc: jsPDF, currentY: number): number => {
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = currentY;
    if (y > pageHeight - BOTTOM_MARGIN_THRESHOLD) {
        addFooter(doc);
        doc.addPage();
        // CORREGIDO:
        const currentPageNum = doc.getNumberOfPages(); // O doc.internal.pages.length;
        y = addHeader(doc, currentPageNum, 0, INVITACION_NUM);
    }
    return y;
};

// ... (addFormattedText, addSectionTitle, addListItem sin cambios en esta parte) ...
const addFormattedText = (doc: jsPDF, text: string, x: number, y: number, options: { maxWidth: number, align?: "left" | "center" | "right" | "justify" }): number => {
    const { maxWidth, align = "left" } = options;
    let currentY = y;
    const paragraphs = text.split('\n');

    paragraphs.forEach(paragraph => {
        if (paragraph.trim() === '') {
            currentY += SMALL_LINE_HEIGHT;
            currentY = checkAndAddPage(doc, currentY);
            return;
        }

        const lines = doc.splitTextToSize(paragraph, maxWidth);

        lines.forEach((line: string) => {
            currentY = checkAndAddPage(doc, currentY);
            let currentX = x;
            const parts = line.split(/(\*\*.*?\*\*)/g).filter(part => part);

            const isJustify = align === 'justify' && parts.length > 1;
            let totalNonSpaceWidth = 0;
            let spaceCount = 0;
            if (isJustify) {
                parts.forEach(part => {
                    const isBold = part.startsWith('**') && part.endsWith('**');
                    const cleanPart = isBold ? part.slice(2, -2) : part;
                    doc.setFont("helvetica", isBold ? "bold" : "normal");
                    totalNonSpaceWidth += doc.getTextWidth(cleanPart.trim());
                    if (cleanPart.includes(' ') && cleanPart.trim() !== '') spaceCount += (cleanPart.match(/ /g) || []).length;
                });
            }
             const spaceWidth = isJustify && spaceCount > 0 ? (maxWidth - totalNonSpaceWidth) / spaceCount : doc.getTextWidth(' ');

             if (!isJustify) {
                 let totalLineWidth = 0;
                 parts.forEach(part => {
                     const isBold = part.startsWith('**') && part.endsWith('**');
                     const cleanPart = isBold ? part.slice(2, -2) : part;
                     doc.setFont("helvetica", isBold ? "bold" : "normal");
                     totalLineWidth += doc.getTextWidth(cleanPart);
                 });
                 if (align === 'center') {
                     currentX = x + (maxWidth - totalLineWidth) / 2;
                 } else if (align === 'right') {
                     currentX = x + maxWidth - totalLineWidth;
                 }
             }

            parts.forEach(part => {
                const isBold = part.startsWith('**') && part.endsWith('**');
                const cleanPart = isBold ? part.slice(2, -2) : part;
                doc.setFont("helvetica", isBold ? "bold" : "normal");
                if (isJustify && cleanPart.includes(' ') && cleanPart.trim() !== '') {
                     const words = cleanPart.split(' ');
                     words.forEach((word, index) => {
                         doc.text(word, currentX, currentY);
                         currentX += doc.getTextWidth(word);
                         if (index < words.length - 1) {
                             currentX += spaceWidth;
                         } else {
                             if (cleanPart.endsWith(' ')) currentX += doc.getTextWidth(' ');
                         }
                     });
                 } else {
                      doc.text(cleanPart, currentX, currentY);
                      currentX += doc.getTextWidth(cleanPart);
                 }
            });
            currentY += SMALL_LINE_HEIGHT;
        });
    });
    return currentY;
};

const addSectionTitle = (doc: jsPDF, number: string, title: string, y: number, options: { maxWidth: number }): number => {
    let currentY = checkAndAddPage(doc, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const fullTitle = `${number}. ${title.toUpperCase()}`;
    currentY = addFormattedText(doc, fullTitle, MARGIN, currentY, { maxWidth: options.maxWidth });
    return currentY;
}

const addListItem = (doc: jsPDF, label: string, text: string, y: number, options: { maxWidth: number, indent?: number }): number => {
    let currentY = checkAndAddPage(doc, y);
    const indent = options.indent ?? 20;
    const labelWidth = doc.getTextWidth(label + " ");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(label, MARGIN + indent, currentY);
    currentY = addFormattedText(doc, text, MARGIN + indent + labelWidth, currentY, { maxWidth: options.maxWidth - indent - labelWidth });
    return currentY;
}

// --- Función Principal de Generación de PDF ---
const generarPDFInvitacionCompleta = async (): Promise<void> => {
    try {
        const doc = new jsPDF('p', 'pt', 'letter');
        // ... (resto de la configuración inicial de la página) ...
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (2 * MARGIN);
        const centerX = pageWidth / 2;
        let y = 0;

        // --- PÁGINA 1 ---
        console.log("Generando Página 1...");
        y = addHeader(doc, 1, 0, INVITACION_NUM); // Total 0 como placeholder inicial
        // ... (contenido de la página 1) ...
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("BASES", centerX, y, { align: "center" });
        y += BASE_LINE_HEIGHT * 2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`INVITACIÓN RESTRINGIDA NÚMERO ${INVITACION_NUM}`, centerX, y, { align: "center" });
        y += BASE_LINE_HEIGHT;
        doc.text("RELATIVO A LA:", centerX, y, { align: "center" });
        y += BASE_LINE_HEIGHT;
        doc.setFont("helvetica", "bold");
        doc.text('"CONTRATO DE SERVICIO DE MATERIAL IMPRESO"', centerX, y, { align: "center" });
        y += BASE_LINE_HEIGHT * 2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const textoP1_1 = `El Municipio de San Juan del Río, Querétaro, en adelante **“EL MUNICIPIO”** representado por la **DIRECCIÓN DE ADQUISICIONES** perteneciente a la **Secretaría de Administración**, en su calidad de convocante, con domicilio en Blvd. Paso de los Guzmán #24, Barrio de la Concepción, Municipio de San Juan del Río, Querétaro.`;
        y = addFormattedText(doc, textoP1_1, MARGIN, y, { maxWidth: contentWidth, align: 'justify' });
        y += BASE_LINE_HEIGHT * 0.5;
        const textoP1_2 = `Con fundamento en los artículos 115 y 134 de la Constitución Política de los Estados Unidos Mexicanos; así como en los artículos 35 de la Constitución local, 20 Fracción II, 25 y 27 de la Ley de Adquisiciones, Enajenaciones, Arrendamientos y Contratación de Servicios del Estado de Querétaro, en adelante **“LA LEY”** y demás disposiciones relativas y aplicables vigentes.`;
        y = addFormattedText(doc, textoP1_2, MARGIN, y, { maxWidth: contentWidth, align: 'justify' });
        y += BASE_LINE_HEIGHT * 0.5;
        const textoP1_3 = `**INVITA** a las Personas Físicas o Jurídicas Colectivas a participar en el **PROCEDIMIENTO DE INVITACIÓN RESTRINGIDA NÚMERO ${INVITACION_NUM}** relativo a la **“CONTRATO DE SERVICIO DE MATERIAL IMPRESO”** con cargo a Recurso Propio del Ejercicio Fiscal **2025**, solicitado por la **SECRETARÍA DE ADMINISTRACIÓN, SECRETARÍA DE LA MUJER, DIRECCIÓN DE INGRESOS, SECRETARIA DEL CENTRO DE ATENCIÓN MUNICIPAL Y SECRETARÍA DEL AYUNTAMIENTO** del Municipio de San Juan del Río, Querétaro. Para lo anterior, deberán presentar sus propuestas relacionadas con los bienes descritos, así como cumplir con todos los requisitos contenidos en las presentes bases.`;
        y = addFormattedText(doc, textoP1_3, MARGIN, y, { maxWidth: contentWidth, align: 'justify' });
        y += BASE_LINE_HEIGHT;


        // ... (resto del código de generación de páginas) ...
        // --- PÁGINA 2 ---
        console.log("Generando Página 2...");
        doc.addPage();
        y = addHeader(doc, doc.getNumberOfPages(), 0, INVITACION_NUM); // Usar el número de página actual
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("GLOSARIO DE TÉRMINOS", MARGIN, y);
        y += BASE_LINE_HEIGHT * 1.5;
        // ... (resto del contenido de la página 2)

        // --- PÁGINA 3 ---
        console.log("Generando Página 3...");
        doc.addPage();
        y = addHeader(doc, doc.getNumberOfPages(), 0, INVITACION_NUM);
        // ... (resto del contenido de la página 3)

        // ... y así sucesivamente para todas las páginas ...


        // --- Bucle Final para Corregir Encabezados/Pies ---
        console.log("Corrigiendo encabezados y pies...");
        // CORREGIDO:
        const totalPagesFinal = doc.getNumberOfPages(); // O doc.internal.pages.length;
        if (totalPagesFinal !== TOTAL_PAGES_ESTIMATED) {
            console.warn(`Advertencia: El número final de páginas (${totalPagesFinal}) no coincide con el estimado (${TOTAL_PAGES_ESTIMATED}). La numeración del índice puede ser incorrecta.`);
        }
        for (let i = 1; i <= totalPagesFinal; i++) {
            doc.setPage(i);
            addHeader(doc, i, totalPagesFinal, INVITACION_NUM);
            addFooter(doc);
        }

        console.log("Generando Blob...");
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        console.log("PDF generado.");

    } catch (error) {
        console.error("❌ Error al generar el PDF completo:", error);
        alert("Ocurrió un error al generar el PDF completo.");
    }
};

generarPDFInvitacionCompleta();

// export default generarPDFInvitacionCompleta;