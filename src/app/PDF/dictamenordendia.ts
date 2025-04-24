import { jsPDF } from "jspdf";
// Asegúrate que la ruta sea correcta para tu proyecto
import { geDictamenOrdenDiaById } from "../peticiones_api/peticionActaSesion"; // Asumiendo que esto obtiene los datos necesarios

// --- Ayudante: Número a Letras en Español (Simplificado - Necesita mejorar para números/años complejos) ---
const numeroALetras = (num: number): string => { // Añadido tipo de entrada y salida
    if (num === undefined || num === null || isNaN(num)) return "XXXX"; // Manejo de entrada inválida

    const unidades = ["CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE"];
    const decenas = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];

    if (num >= 0 && num <= 15) return unidades[num];
    if (num < 20) return "DIECI" + unidades[num - 10].toLowerCase();
    if (num < 30) return num === 20 ? "VEINTE" : "VEINTI" + unidades[num - 20].toLowerCase();

    // Manejo muy básico de años para el texto de ejemplo
    if (num === 2024) return "DOS MIL VEINTICUATRO";
    if (num === 2025) return "DOS MIL VEINTICINCO"; // Añadido basado en el ejemplo

    if (num < 100) {
        const u = num % 10;
        const d = Math.floor(num / 10);
        return decenas[d] + (u > 0 ? " Y " + unidades[u] : "");
    }

    // Fallback para números no manejados (ej. años más grandes) - Requiere una librería apropiada
    return num.toString();
};

// --- Ayudante: Cargar Imagen (Promise) ---
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => {
          console.error("Error durante la carga de la imagen:", err);
          reject(new Error(`No se pudo cargar la imagen: ${src}`));
      };
      img.src = src; // Inicia la carga
  });
};

// --- Ayudante: Añadir Cabecera ---
// TODO: Considerar definir una interfaz para actaData (ej. ActaData) para mejor tipado
// --- Ayudante: Añadir Cabecera (SIN cambiar parámetros) ---
const addHeader = (doc: jsPDF, actaData: any, bgImage: HTMLImageElement | null): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // Calcula el margen derecho solo para usarlo en el texto
  const rightMarginX = pageWidth - (2.89 * (72 / 2.54)); // ~ pageWidth - 81.9 pt

  // 1. Añadir Imagen de Fondo
  if (bgImage) {
    try {
        doc.addImage(bgImage, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
    } catch (e) {
        console.error("Error añadiendo imagen de fondo al PDF:", e);
    }
  }

  // 2. Dibujar Texto de Cabecera (Alineado a la derecha)
  const headerFontSize = 8;
  const headerStartY = 35; // Posición Y inicial para texto cabecera (ajustable)

  doc.setFont("helvetica", "bold");
  doc.setFontSize(headerFontSize);

  // Usar la X calculada con el margen derecho correcto
  doc.text("SESIÓN ORDINARIA", rightMarginX, headerStartY, { align: "right" });
  const nextLineY = headerStartY + (headerFontSize * 1.2); // Y para siguiente línea
  doc.text(actaData.nomenclatura || "MSJR-CA-ORD-XX-YYYY", rightMarginX, nextLineY, { align: "right" });

  // *** CAMBIO PRINCIPAL AQUÍ ***
  // Calcula el margen superior deseado en puntos y devuélvelo directamente.
  const topMarginPts = 3.26 * (72 / 2.54); // Aprox 92.4 pt

  // Devuelve el valor calculado del margen superior en lugar de un número fijo.
  return topMarginPts;
};
// --- Ayudante: Añadir Pie de Página (Alineado a la Derecha) ---
// TODO: Considerar definir una interfaz para actaData
const addFooter = (doc: jsPDF, pageNum: number, totalPages: number, actaData: any): void => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40; // Margen derecho e izquierdo (puntos)
  const rightMarginX = pageWidth - margin; // Coordenada X para alinear a la derecha

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100); // Texto gris

  // 1. Número de Página (Arriba a la derecha)
  const pageNumY = pageHeight - 35; // Posición Y más alta
  doc.text(`Página ${pageNum}`, rightMarginX, pageNumY, { align: "right" });

  
  doc.setTextColor(0); // Restablecer color de texto
};

// --- Ayudante: Comprobar y Añadir Página ---
// TODO: Considerar definir una interfaz para actaData
const checkAndAddPage = (doc: jsPDF, currentY: number, pageHeight: number, bottomMargin: number, actaData: any, bgImage: HTMLImageElement | null): number => { // Usar ActaData si está definida
  let y = currentY;
  if (y > pageHeight - bottomMargin) {
      // *** CORRECCIÓN AQUÍ: Usar .pages.length para obtener el número de página actual ***
      const currentPageNum = doc.internal.pages.length;
      addFooter(doc, currentPageNum, 0, actaData); // Añadir pie a la página que se está terminando
      doc.addPage();
      y = addHeader(doc, actaData, bgImage); // Añadir cabecera a la nueva página y resetear Y
  }
  return y;
};



// --- Función Principal de Generación de PDF ---
// TODO: Definir interfaz ActaData y usarla para el tipo de retorno de geDictamenOrdenDiaById y para 'acta'
const generarPDFActa = async (id_orden_dia: number): Promise<void> => { // Retorno Promise<void>
  let bgImage: HTMLImageElement | null = null;  
  try {
      // Asegúrate que la ruta '/images/oficio.png' sea accesible públicamente por el navegador
      bgImage = await loadImage("/images/acta.png");
  } catch (imgError) {
      console.error("Fallo al cargar imagen de fondo:", imgError);
      alert("No se pudo cargar la imagen de fondo. Se generará PDF sin ella.");
      // bgImage seguirá siendo null, el proceso continúa
  }

  try {
        // TODO: Tipar la respuesta de la API, ej: const acta: ActaData = await geDictamenOrdenDiaById(id_orden_dia);
        const acta: any = await geDictamenOrdenDiaById(id_orden_dia);
        console.log("Datos del Acta:", acta); // Log para depurar datos obtenidos

        // Comprobación básica de datos esenciales
        if (!acta || !acta.fecha_sesion || !acta.hora_inicio) {
            console.error("Datos incompletos del acta:", acta);
            alert("Faltan datos esenciales para generar el acta (fecha, hora).");
            return;
        }

        // Usar puntos para unidades, tamaño carta
        const doc = new jsPDF('p', 'pt', 'letter');
        const pageHeight = doc.internal.pageSize.getHeight(); // Aprox 792 pt
        const pageWidth = doc.internal.pageSize.getWidth();
        const cmToPt = 72 / 2.54;
        const marginTop = 3.26 * cmToPt;     // Aprox 92.4 pt
        const marginBottom = 2.5 * cmToPt;   // Aprox 70.9 pt
        const marginLeft = 3.0 * cmToPt;     // Aprox 85.0 pt
        const marginRight = 2.89 * cmToPt;   // Aprox 81.9 pt
        // *******************************************************

        // Ancho y centro calculados con los nuevos márgenes específicos
        const contentWidth = pageWidth - marginLeft - marginRight; // Ancho disponible para el texto principal
        const centerX = pageWidth / 2; // El centro de la página física no cambia

        // Tamaños de fuente base (puedes ajustar si es necesario)
        const baseFontSize = 10; // Tamaño base Arial 10 (usando Helvetica como sustituto)
        const smallFontSize = 8;  // Para pies de página o notas
        const titleFontSize = 10; // Para títulos de sección (puedes hacerlo un poco más grande si quieres, ej. 11 o 12)
        const headerFontSize = 8; // Para la cabecera (ej. SESION ORDINARIA)

        // Alturas de línea aproximadas basadas en tamaño de fuente (ajusta si la apariencia no es la deseada)
        const baseLineHeight = baseFontSize * 1.2;    // Aprox 12 pt para fuente 10pt
        const smallLineHeight = smallFontSize * 1.2; // Aprox 9.6 pt para fuente 8pt

        // Umbral para salto de página: Altura total menos el margen inferior deseado
        const bottomMarginThreshold = marginBottom; // El límite antes de saltar es el propio margen inferior


        // Asegurar que `asistentes` sea un array, incluso si es null/undefined en la respuesta
        // TODO: Tipar 'a' dentro de find/filter si se define interfaz Asistente
        const asistentes: any[] = Array.isArray(acta.asistentes) ? acta.asistentes : [];

        // --- Inicio Página 1 ---
        let y = addHeader(doc, acta, bgImage); // Añadir cabecera y obtener Y inicial

        // 🟨 Bloque de Título del Documento (Coincidiendo con muestra)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10); // Muestra usa fuente ligeramente más pequeña
        doc.text(`ACTA DE LA ${acta.titulo_evento?.toUpperCase() || "SESIÓN"}`, centerX, y, { align: "center" });
        y += baseLineHeight;
        doc.text(`DEL COMITÉ DE ADQUISICIONES, ENAJENACIONES,`, centerX, y, { align: "center" });
        y += baseLineHeight * 0.9;
        doc.text(`ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS`, centerX, y, { align: "center" });
        y += baseLineHeight * 0.9;
        doc.text(`DEL MUNICIPIO DE SAN JUAN DEL RÍO.`, centerX, y, { align: "center" });
        y += baseLineHeight * 1.8; // Más espacio después del bloque de título

        // 🕒 Fecha, Hora y Párrafo Introductorio (Coincidiendo con muestra)
        const fecha = new Date(acta.fecha_sesion);
        const horaParts = acta.hora_inicio.split(":");
        const horaNum = parseInt(horaParts[0] || "0", 10);
        const minutoNum = parseInt(horaParts[1] || "0", 10);
        const horaTexto = numeroALetras(horaNum).toUpperCase();
        const minutoTexto = numeroALetras(minutoNum).toUpperCase();
        const diaNum = fecha.getDate();
        const diaTexto = numeroALetras(diaNum).toUpperCase();
        const diaSemana = fecha.toLocaleDateString("es-MX", { weekday: "long" }).toUpperCase();
        const mes = fecha.toLocaleDateString("es-MX", { month: "long" }).toUpperCase();
        const anioNum = fecha.getFullYear();
        // Determinar año fiscal - usar campo específico si existe, si no, año de la fecha
        const anioFiscal = acta.ejercicio_fiscal || anioNum;
        const anioTexto = numeroALetras(anioFiscal).toUpperCase(); // Usar año fiscal para texto

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9); // Tamaño de fuente menor para cuerpo de texto

        // Construir el texto intro exacto como la muestra
        const textoIntro = `SE LEVANTA EL ACTA SIENDO LAS ${acta.hora_inicio} (${horaTexto} HORAS ${minutoTexto} MINUTOS) DEL DÍA ${diaSemana} ${diaNum} (${diaTexto}) DE ${mes} DE ${anioNum} (${anioTexto}), EN LA ${acta.lugar || "SALA DE JUNTAS DE CENTRO CÍVICO"}.`+ // Dividido para legibilidad
                         `\nEN EL MUNICIPIO DE SAN JUAN DEL RÍO, QUERÉTARO, ESTANDO REUNIDOS LOS INTEGRANTES DEL COMITÉ DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS DEL MUNICIPIO DE SAN JUAN DEL RÍO EN ADELANTE “EL COMITÉ", EN LAS INSTALACIONES QUE OCUPA EL CENTRO CÍVICO MUNICIPAL SAN JUAN DEL RÍO, QUERÉTARO, SITO EN BLVD. PASO DE LOS GUZMÁN, NÚMERO 24, COLONIA BARRIO DE LA CONCEPCIÓN, CÓDIGO POSTAL 76803, EN SAN JUAN DEL RÍO, QUERÉTARO, CON EL PROPÓSITO DE LLEVAR A CABO LA SESIÓN ORDINARIA DE "EL COMITÉ" PARA EL EJERCICIO FISCAL ${anioFiscal}; LA PRESENTE SESIÓN DE “EL COMITÉ” SE LLEVA A CABO DE ACUERDO A LOS ARTÍCULOS 115 Y 134 DE LA CONSTITUCIÓN POLÍTICA DE LOS ESTADOS UNIDOS MEXICANOS, 35 DE LA CONSTITUCIÓN POLÍTICA DEL ESTADO DE QUERÉTARO; 1, 2 FRACCIÓN VI, 19, 22, 42 Y DEL 52 AL 59 DE LA LEY DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS DEL ESTADO DE QUERÉTARO (EN LO SUCESIVO “LA LEY”); ARTÍCULOS DEL 19 AL 30 DEL REGLAMENTO DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS DEL MUNICIPIO DE SAN JUAN DEL RÍO, QUERÉTARO (EN LO SUCESIVO “EL REGLAMENTO”) ACTO QUE SE REALIZA BAJO EL SIGUIENTE ORDEN DEL DÍA:`;

        const introLines = doc.splitTextToSize(textoIntro, contentWidth);
        introLines.forEach((linea: string) => { // CORREGIDO: linea es string
             y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage); // Comprobar salto página *antes* de dibujar
            doc.text(linea, marginLeft, y);
            y += smallLineHeight; // Usar altura de línea menor
        });
        y += baseLineHeight * 0.5; // Espacio después de párrafo intro

        // 📝 Orden del Día (Estructura de muestra con líneas)
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);

        // Definir ítems Orden del Día
        // TODO: Tipar los objetos dentro de este array con una interfaz si se vuelve complejo
        const ordenDiaItems = [
            { number: "1.", text: "LISTA DE ASISTENCIA Y VERIFICACIÓN DE QUÓRUM LEGAL PARA SESIONAR." },
            { number: "2.", text: "PRESENTACIÓN Y, EN SU CASO, APROBACIÓN DEL ORDEN DEL DÍA." },
            { number: "3.", text: "PROPUESTA, ANÁLISIS, DISCUSIÓN Y, EN SU CASO, APROBACIÓN DE LOS SIGUIENTES PUNTOS." },
            // Relleno para sub-ítems - se poblarán abajo si existen
            ...(acta.puntos_tratados && Array.isArray(acta.puntos_tratados) && acta.puntos_tratados.length > 0 // Añadida comprobación Array.isArray
                ? acta.puntos_tratados.map((p: string, i: number) => ({ // <<< CORRECCIÓN: Tipo explícito p: string
                      number: `3.${i + 1}`,
                      text: p || "XXXX", // Fallback si p es null/undefined/vacío
                      isSubItem: true
                  }))
                : [{ number: "3.1", text: "XXXX", isSubItem: true }] // Por defecto si no hay puntos específicos
            ),
            { number: "4.", text: "ASUNTOS GENERALES." },
            { number: "5.", text: "CLAUSURA DE LA SESIÓN." },
        ];

        let mainItemCounter = 1;
        ordenDiaItems.forEach((item) => {
             y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage); // Comprobar salto página antes del ítem

            // Ajustar lógica de numeración para sub-ítems
            let displayItem;
            if (item.isSubItem) {
                displayItem = `${item.number} ${item.text}`;
                doc.setFont("helvetica", "normal"); // Sub-ítems fuente normal
                doc.text(displayItem, marginLeft + 15, y); // Indentar sub-ítems
            } else {
                displayItem = `${mainItemCounter}. ${item.text}`;
                doc.setFont("helvetica", "bold"); // Ítems principales en negrita
                doc.text(displayItem, marginLeft, y);
                 // Solo incrementar contador principal para no-sub-ítems que no sean el punto 3 en sí
                if (item.number !== "3.") {
                     mainItemCounter++;
                }
            }

            // Dibujar línea punteada después del texto
            const textWidth = doc.getTextWidth(displayItem);
            const lineStartX = item.isSubItem ? marginLeft + 15 + textWidth + 2 : marginLeft + textWidth + 2;
            const lineEndX = pageWidth - marginLeft; // Línea hasta margen derecho
             if (lineStartX < lineEndX) { // Solo dibujar línea si hay espacio
                doc.setLineDashPattern([1, 1.5], 0); // Patrón línea punteada
                doc.setLineWidth(0.5);
                doc.line(lineStartX, y, lineEndX, y);
                doc.setLineDashPattern([], 0); // Resetear patrón de línea
             }

            y += baseLineHeight; // Espacio para siguiente ítem
        });

        y += baseLineHeight; // Espacio extra después de Orden del Día


        // 📌 Desarrollo de la Sesión (Flujo de la muestra)
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold + 50, acta, bgImage); // Más margen necesario antes de este bloque

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("DESARROLLO DE LA SESIÓN", centerX, y, { align: "center" });
        y += baseLineHeight * 1.5;

        // --- PUNTO 1: Asistencia y Quorum ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("PRIMER PUNTO. LISTA DE ASISTENCIA Y VERIFICACIÓN DE QUÓRUM LEGAL PARA SESIONAR.", marginLeft, y);
        y += baseLineHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        // Encontrar Presidente y Secretario Ejecutivo por rol/nombre si es posible
        // Adapta estos selectores basado en tu estructura de datos real si es necesario
        // TODO: Tipar 'a' aquí si se define interfaz Asistente
        const presidente = asistentes.find(a => a.cargo?.toUpperCase().includes("PRESIDENTE"));
        const secretario = asistentes.find(a => a.cargo?.toUpperCase().includes("SECRETARIO EJECUTIVO"));

        const textoPunto1Desc = `EN EL DESAHOGO DEL PRIMER PUNTO DEL ORDEN DEL DÍA, EN USO DE LA PALABRA EL ${presidente?.nombre || "PRESIDENTE DEL COMITÉ"}, EN SU CARÁCTER DE PRESIDENTE DE “EL COMITÉ”, SOLICITA AL ${secretario?.nombre || "SECRETARIO EJECUTIVO"}, DIRECTOR DE ADQUISICIONES Y SECRETARIO EJECUTIVO DE “EL COMITÉ”, LLEVAR A CABO EL PASE DE LISTA DE LOS PRESENTES, A EFECTO DE VERIFICAR LA EXISTENCIA DE QUÓRUM LEGAL PARA SESIONAR.`;
        const punto1Lines = doc.splitTextToSize(textoPunto1Desc, contentWidth);
        punto1Lines.forEach((line: string) => { // CORREGIDO: line es string
             y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
             doc.text(line, marginLeft, y);
             y += smallLineHeight;
        });
        y += smallLineHeight * 0.5; // Pequeño espacio

        // Construir Texto Declaración Quorum (coincidiendo con muestra)
        // TODO: Tipar 'a' aquí si se define interfaz Asistente
        const comiteMembers = asistentes.filter(a => a.tipo_asistente === 'base');
        const invitados = asistentes.filter(a => a.tipo_asistente === 'invitado');
        // Ejemplo: const requirentes = asistentes.filter(a => a.tipo_asistente === 'requirente');

        let textoQuorum = acta.asuntos_generales;

        // Añadir otros miembros base dinámicamente
        comiteMembers.forEach(m => { // TODO: Tipar 'm' aquí
            // Evitar duplicar presidente/secretario si ya listados por rol específico
            if (m !== presidente && m !== secretario) {
                 // Usar 'LA' o 'EL' basado en género si es posible, si no default 'EL/LA' o comprobar formato nombre
                const prefix = m.nombre?.toUpperCase().startsWith('LICENCIADA') || m.nombre?.toUpperCase().startsWith('MAESTRA') ? 'LA' : 'EL';
                 // Limpiar un poco el string del cargo
                const cargoClean = m.cargo?.replace(/DE EL COMITÉ/gi, 'DE "EL COMITÉ"').replace(/DE COMITÉ/gi, 'DE "EL COMITÉ"');
                textoQuorum += `${prefix} ${m.nombre} EN SU CARÁCTER DE ${cargoClean}; `;
            }
        });
        textoQuorum = textoQuorum.trim().slice(0, -1) + "."; // Reemplazar último punto y coma por punto

        // Añadir invitados dinámicamente
        invitados.forEach((inv, index) => { // TODO: Tipar 'inv' aquí
            const prefixInv = inv.nombre?.toUpperCase().startsWith('LICENCIADA') || inv.nombre?.toUpperCase().startsWith('MAESTRA') ? 'LA' : 'EL';
            // Limpiar cargo, quitando 'E INVITADO/A' redundante si presente
            const cargoInvClean = inv.cargo?.replace(/ E INVITADO| E INVITADA/gi, '');
            textoQuorum += `${index > 0 ? ', ASÍ COMO ' : ''}${prefixInv} ${inv.nombre} COMO ${cargoInvClean}`;
        });
        if (invitados.length > 0) {
          textoQuorum += `, ${invitados.length > 1 ? 'AMBAS' : 'AMBOS'} CON CARÁCTER DE INVITADAS CON DERECHO A VOZ;`; // Ajustar AMBAS/AMBOS si es necesario
        }
        // Mencionar requirentes si existen
        // TODO: Tipar 'a' aquí si se define interfaz Asistente
        const requirentesPresentes = asistentes.some(a => a.tipo_asistente === 'requirente');
        if (requirentesPresentes) {
            textoQuorum += ` DE IGUAL MANERA SE ENCUENTRAN PRESENTES REPRESENTANTES DE LAS ÁREAS USUARIAS CON DERECHO A VOZ, CUYOS NOMBRES Y FIRMAS APARECEN AL FINAL DEL ACTA.`
        } else {
             // Quitar punto y coma final si no hay requirentes
             if(textoQuorum.endsWith(';')) textoQuorum = textoQuorum.slice(0,-1) + ".";
        }

        const quorumLines = doc.splitTextToSize(textoQuorum, contentWidth);
        quorumLines.forEach((line: string) => { // CORREGIDO: line es string
            y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
            doc.text(line, marginLeft, y);
            y += smallLineHeight;
        });
        // Dibujar separador línea horizontal (como en muestra)
        doc.setLineWidth(0.5);
        doc.line(marginLeft, y + smallLineHeight / 2, pageWidth - marginLeft, y + smallLineHeight / 2);
        y += baseLineHeight * 1.5; // Espacio después texto quorum + línea


        // --- PUNTO 2: Aprobación Orden del Día ---
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage); // Comprobar espacio antes del punto

        // --- INICIO CORRECCIÓN PUNTO 2 ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        // Aplicar splitTextToSize al título del punto también
        const tituloPunto2 = "SEGUNDO PUNTO. PRESENTACIÓN Y EN SU CASO, APROBACIÓN DEL ORDEN DEL DÍA.";
        const tituloPunto2Lines = doc.splitTextToSize(tituloPunto2, contentWidth);
        tituloPunto2Lines.forEach((line: string) => {
            // No necesitamos checkAndAddPage dentro de este forEach corto, ya lo hicimos antes
            doc.text(line, marginLeft, y);
            y += smallLineHeight; // Usar smallLineHeight para consistencia si se parte
        });
        // Ajustar el espacio después del título si se partió o no
        // y += baseLineHeight; // Original - puede ser mucho si se partió
        y += baseLineHeight * 0.8; // Un poco menos de espacio

        // Texto descriptivo (sin cambios en la generación del texto)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const textoPunto2Desc = `EN EL DESAHOGO DEL SEGUNDO PUNTO, SE PROCEDE A DAR LECTURA AL ORDEN DEL DÍA. POR LO QUE, EL PRESIDENTE DE “EL COMITÉ”, INSTRUYE AL SECRETARIO EJECUTIVO SOMETA A VOTACIÓN DE LOS PRESENTES, LOS TEMAS PROGRAMADOS Y TOME NOTA DEL ACUERDO E INFORME EL RESULTADO DE LA VOTACIÓN.`;
        const punto2Lines = doc.splitTextToSize(textoPunto2Desc, contentWidth);
        punto2Lines.forEach((line: string) => {
              // Comprobar página ANTES de dibujar cada línea descriptiva
              y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
              doc.text(line, marginLeft, y);
              y += smallLineHeight;
        });
        y += smallLineHeight * 0.5; // Pequeño espacio antes del acuerdo

        // Acuerdo
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage); // Comprobar espacio antes del acuerdo
        doc.setFont("helvetica", "bold");
        const acuerdoLabel = "ACUERDO:";
        const acuerdoWidth = doc.getTextWidth(acuerdoLabel);
        doc.text(acuerdoLabel, marginLeft, y); // Dibujar "ACUERDO:"

        doc.setFont("helvetica", "normal");
        const textoAcuerdo2 = `SE DA POR APROBADO EL ORDEN DEL DÍA PARA LA PRESENTE SESIÓN DE “EL COMITÉ" POR VOTACIÓN UNÁNIME.`;
        const acuerdoTextX = marginLeft + acuerdoWidth + 5; // Posición X inicial del texto del acuerdo

        // --- INICIO CORRECCIÓN LÍNEA ACUERDO ---

        // Dibujar el texto del acuerdo, puede ocupar varias líneas
        const acuerdoTextLines = doc.splitTextToSize(textoAcuerdo2, contentWidth - acuerdoWidth - 5);
        let currentAcuerdoY = y; // Y inicial para el texto del acuerdo
        let lastLineWidth = 0;   // Ancho de la última línea dibujada

        acuerdoTextLines.forEach((line: string, index: number) => {
            doc.text(line, acuerdoTextX, currentAcuerdoY); // Dibujar línea de texto
            lastLineWidth = doc.getTextWidth(line);   // Guardar ancho de esta línea
            if (index < acuerdoTextLines.length - 1) {
                currentAcuerdoY += smallLineHeight; // Mover Y para la siguiente línea
            }
        });

        // Calcular dónde termina la última línea de texto del acuerdo
        const finalAcuerdoY = currentAcuerdoY; // Y de la última línea
        const finalAcuerdoXEnd = acuerdoTextX + lastLineWidth; // X donde termina la última línea de texto

        // Dibujar la línea de guiones/puntos DESPUÉS del texto en la última línea
        const lineStartY = finalAcuerdoY; // A la misma altura Y que la última línea de texto
        const lineStartX = finalAcuerdoXEnd + 2; // Empezar un poco después del texto
        const lineEndX = pageWidth - marginLeft; // Terminar en el margen derecho

        if (lineStartX < lineEndX) { // Solo dibujar si hay espacio para la línea
              doc.setLineWidth(0.5);
              
              doc.setLineDashPattern([3, 2], 0); // [longitud_guion, longitud_espacio]
              doc.line(lineStartX, lineStartY, lineEndX, lineStartY);
              doc.setLineDashPattern([], 0); // Resetear patrón
        }

        // Actualizar la posición 'y' global para el siguiente elemento
        // La Y se basa en dónde terminó la última línea del acuerdo, más el espacio
        y = finalAcuerdoY + baseLineHeight * 1.5; // Espacio después acuerdo + línea (ajusta este espacio si es necesario)

        // --- FIN CORRECCIÓN LÍNEA ACUERDO ---

        

        // --- PUNTO 3: Propuesta, Análisis... ---
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("TERCER PUNTO. PROPUESTA, ANÁLISIS, DISCUSIÓN Y EN SU CASO APROBACIÓN DE LOS SIGUIENTES PUNTOS.", marginLeft, y);
        y += baseLineHeight;

        // Añadir sub-ítems 3.1, 3.2 etc. desde lógica Orden del Día
        const puntosTratados = ordenDiaItems.filter(item => item.isSubItem);
        puntosTratados.forEach((punto) => { // TODO: Tipar 'punto' aquí
            y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
            doc.setFont("helvetica", "bold");
            doc.text(`${punto.number}`, marginLeft, y); // Solo el número en negrita
            doc.setFont("helvetica", "normal");
            const puntoText = punto.text || "XXXX";
            doc.text(puntoText, marginLeft + 25, y); // Indentar texto
            // Subrayar el texto del sub-ítem
            const subItemWidth = doc.getTextWidth(puntoText);
            doc.setLineWidth(0.5);
            doc.line(marginLeft + 25, y + smallLineHeight + 1, marginLeft + 25 + subItemWidth, y + smallLineHeight + 1);
            y += baseLineHeight * 1.2; // Espacio entre sub-ítems
        });
        y += baseLineHeight * 0.5; // Espacio extra después último sub-ítem


        // --- PUNTO 4: Asuntos Generales ---
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        // Aplicar splitTextToSize al título por si acaso fuera largo
        const tituloPunto4 = "CUARTO PUNTO. ASUNTOS GENERALES.";
        const tituloPunto4Lines = doc.splitTextToSize(tituloPunto4, contentWidth);
        tituloPunto4Lines.forEach((line: string) => {
            doc.text(line, marginLeft, y);
            y += smallLineHeight;
        });
        y += baseLineHeight * 0.8; // Espacio después del título

        // Texto descriptivo (código existente, asumiendo que ya funciona bien con splitTextToSize)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const textoPunto4Pregunta = `EN USO DE LA PALABRA, ${presidente?.nombre || "Lic. José Miguel Valencia Molina"}, EN SU CARÁCTER DE PRESIDENTE DE “EL COMITÉ”, PREGUNTA A LOS ASISTENTES SI CUENTAN CON ALGÚN TEMA ADICIONAL PARA SER TRATADO COMO "ASUNTO GENERAL", `;
        let textoPunto4Respuesta;
        if (acta.asuntos_generales && acta.asuntos_generales.trim() !== "") {
             textoPunto4Respuesta = `MANIFESTANDO LOS PRESENTES LOS SIGUIENTES ASUNTOS:\n${acta.asuntos_generales}`;
        } else {
             textoPunto4Respuesta = `MANIFESTANDO LOS PRESENTES QUE NO TIENEN ASUNTO PENDIENTE POR TRATAR.`;
        }
        const textoPunto4DescCompleto = textoPunto4Pregunta + textoPunto4Respuesta;
        const punto4Lines = doc.splitTextToSize(textoPunto4DescCompleto, contentWidth);
        punto4Lines.forEach((line: string) => {
             y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
             doc.text(line, marginLeft, y);
             y += smallLineHeight;
        });
         y += smallLineHeight * 0.5; // Pequeño espacio antes del acuerdo


        // --- INICIO CORRECCIÓN ACUERDO PUNTO 4 ---
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage); // Comprobar espacio antes del acuerdo
        doc.setFont("helvetica", "bold");
        const acuerdo4Label = "ACUERDO:";
        const acuerdo4Width = doc.getTextWidth(acuerdo4Label);
        doc.text(acuerdo4Label, marginLeft, y); // Dibujar "ACUERDO:"

        doc.setFont("helvetica", "normal");
        const textoAcuerdo4 = `EL ${secretario?.nombre || "Contador Público Pedro Vázquez Arteaga"}, SECRETARIO EJECUTIVO DE “EL COMITÉ”, INFORMA QUE POR VOTACIÓN UNÁNIME DE LOS PRESENTES, SE CIERRA ESTE PUNTO, SIN AGREGAR TEMAS EN ASUNTOS GENERALES.`;
        const acuerdo4TextX = marginLeft + acuerdo4Width + 5; // Posición X inicial del texto del acuerdo

        // Aplicar splitTextToSize al texto del acuerdo
        const acuerdo4TextLines = doc.splitTextToSize(textoAcuerdo4, contentWidth - acuerdo4Width - 5);
        let currentAcuerdo4Y = y; // Y inicial para el texto del acuerdo 4
        let lastLine4Width = 0;   // Ancho de la última línea dibujada

        acuerdo4TextLines.forEach((line: string, index: number) => {
            doc.text(line, acuerdo4TextX, currentAcuerdo4Y); // Dibujar línea de texto
            lastLine4Width = doc.getTextWidth(line);   // Guardar ancho de esta línea
            if (index < acuerdo4TextLines.length - 1) {
                currentAcuerdo4Y += smallLineHeight; // Mover Y para la siguiente línea
            }
        });

        // Calcular dónde termina la última línea de texto del acuerdo 4
        const finalAcuerdo4Y = currentAcuerdo4Y; // Y de la última línea
        const finalAcuerdo4XEnd = acuerdo4TextX + lastLine4Width; // X donde termina la última línea de texto

        // Dibujar la línea de guiones DESPUÉS del texto en la última línea
        const line4StartY = finalAcuerdo4Y; // A la misma altura Y
        const line4StartX = finalAcuerdo4XEnd + 2; // Empezar un poco después del texto
        const line4EndX = pageWidth - marginLeft; // Terminar en el margen derecho

        if (line4StartX < line4EndX) { // Solo dibujar si hay espacio
             doc.setLineWidth(0.5);
             // Usar línea de guiones como en el acuerdo anterior
             doc.setLineDashPattern([3, 2], 0); // [longitud_guion, longitud_espacio]
             doc.line(line4StartX, line4StartY, line4EndX, line4StartY);
             doc.setLineDashPattern([], 0); // Resetear patrón
        }

        // Actualizar la posición 'y' global para el siguiente elemento
        y = finalAcuerdo4Y + baseLineHeight * 1.5; // Espacio después acuerdo + línea


        // --- PUNTO 5: Clausura ---
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("QUINTO PUNTO. CLAUSURA DE LA SESIÓN DEL COMITÉ MUNICIPAL DE ADQUISICIONES Y SERVICIOS.", marginLeft, y);
        y += baseLineHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        // Formatear hora de cierre
        const cierreHoraParts = (acta.hora_cierre || "00:00").split(":");
        const cierreHoraNum = parseInt(cierreHoraParts[0] || "0", 10);
        const cierreMinutoNum = parseInt(cierreHoraParts[1] || "0", 10);
        const cierreHoraTexto = numeroALetras(cierreHoraNum).toUpperCase();
        const cierreMinutoTexto = numeroALetras(cierreMinutoNum).toUpperCase();

        const textoPunto5Desc = `NO HABIENDO OTRO ASUNTO QUE TRATAR, SE DA POR CONCLUIDA LA SESIÓN ORDINARIA DE “EL COMITÉ”, SIENDO LAS ${acta.hora_cierre || "XX:XX"} (${cierreHoraTexto} HORAS CON ${cierreMinutoTexto} MINUTOS) DEL DÍA EN QUE SE ACTÚA, FIRMANDO LOS QUE EN ELLA INTERVINIERON.`;
        const punto5Lines = doc.splitTextToSize(textoPunto5Desc, contentWidth);
         punto5Lines.forEach((line: string) => { // CORREGIDO: line es string
             y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage);
             doc.text(line, marginLeft, y);
             y += smallLineHeight;
        });
        y += baseLineHeight * 2; // Espacio extra antes de firmas


        // --- ✍️ Sección de Firmas ---
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold + 150, acta, bgImage); // Necesita espacio significativo

        // Título Bloque Firmas (Coincidiendo con muestra)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("POR PARTE DEL COMITÉ DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y", centerX, y, { align: "center" });
        y += baseLineHeight;
        doc.text("CONTRATACIÓN DE SERVICIOS DEL MUNICIPIO DE SAN JUAN DEL RÍO", centerX, y, { align: "center" });
        y += baseLineHeight * 2.5; // Más espacio antes de la primera tabla


        // --- Función Tablas de Firmas (Inline para simplicidad, manteniendo estructura original) ---
        // TODO: Tipar 'attendees' con interfaz Asistente[]
        // --- Función Tablas de Firmas (Revisada para Mejor Apariencia) ---
        const drawSignatureTable = (title: string, attendees: any[], bgImageInner: HTMLImageElement | null, topMarginInner: number): number => { // Aceptar bgImage y topMargin
          if (!attendees || attendees.length === 0) return y;

          // Comprobar salto página antes del título de la tabla
          y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold + 60, acta, bgImageInner);

          const tableStartY = y + baseLineHeight * 1.5; // Y donde empieza la cabecera de la tabla
          let tableCurrentY = tableStartY; // Y actual para dibujar filas, empieza en la cabecera
          const rowMinHeight = baseLineHeight * 3.0; // Altura mínima de fila (ajusta si es necesario, 3 líneas de 10pt + margen)
          const textPadding = 3; // Pequeño padding dentro de las celdas

          // --- Definir Columnas ---
          // Columna 1: Nombre y Cargo (ej. 65% del ancho del contenido)
          const nameColWidth = contentWidth * 0.65;
          const nameColXStart = marginLeft;
          const nameColXEnd = nameColXStart + nameColWidth;
          // Columna 2: Firma (el resto del ancho)
          const signColWidth = contentWidth - nameColWidth;
          const signColXStart = nameColXEnd;
          const signColXEnd = signColXStart + signColWidth; // Igual a pageWidth - marginRight

          // --- Dibujar Título de la Sección (POR PARTE DEL COMITÉ, etc.) ---
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10); // Tamaño normal para el título de sección
          doc.text(title, nameColXStart, y); // Alinear a la izquierda
          y = tableStartY; // Actualizar 'y' global para empezar la tabla

          // --- Dibujar Cabecera de la Tabla ---
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9); // Un poco más pequeño para cabecera de tabla
          doc.text("NOMBRE Y CARGO", nameColXStart + textPadding, tableCurrentY - baseLineHeight * 0.2); // Ajuste Y ligero hacia arriba
          doc.text("FIRMA", signColXStart + (signColWidth / 2), tableCurrentY - baseLineHeight * 0.2, { align: 'center' }); // Centrado en columna firma
          doc.setLineWidth(1); // Línea gruesa bajo cabecera
          doc.line(nameColXStart, tableCurrentY, signColXEnd, tableCurrentY); // Línea horizontal completa
          tableCurrentY += baseLineHeight * 0.5; // Espacio después de la línea

          // --- Dibujar Filas Tabla ---
          attendees.forEach((a: any) => {
               // Obtener textos
               doc.setFont("helvetica", "bold"); doc.setFontSize(8); // Negrita para nombre
               const nombreCompleto = `${a.usuario?.nombre || ""} ${a.usuario?.apellidos || ""}`.trim();
               const nameLines = doc.splitTextToSize(nombreCompleto.toUpperCase() || "[SIN NOMBRE]", nameColWidth - (textPadding * 2)); // Restar padding

               doc.setFont("helvetica", "normal"); doc.setFontSize(8); // Normal para puesto
               const cargoLines = doc.splitTextToSize(a.usuario?.puesto?.toUpperCase() || "[SIN CARGO/PUESTO]", nameColWidth - (textPadding * 2)); // Restar padding

               // Calcular altura necesaria para esta fila
               const requiredTextHeight = (nameLines.length + cargoLines.length) * smallLineHeight * 1.1; // Altura del texto
               const currentRowHeight = Math.max(rowMinHeight, requiredTextHeight + textPadding * 2); // Altura total fila (min o texto+padding)
               const rowEndY = tableCurrentY + currentRowHeight; // Y donde terminará esta fila

               // Comprobar Salto de Página ANTES de dibujar la fila
               if (rowEndY > pageHeight - bottomMarginThreshold) {
                    // Dibujar SOLO la línea vertical ANTES de saltar (si ya hay filas dibujadas)
                    if (tableCurrentY > tableStartY + baseLineHeight * 0.5) { // Evitar dibujar sobre cabecera
                         doc.setLineWidth(0.5);
                         doc.line(nameColXEnd, tableStartY, nameColXEnd, tableCurrentY); // Línea vertical separadora hasta aquí
                         doc.line(nameColXStart, tableStartY, nameColXStart, tableCurrentY); // Borde izquierdo
                         doc.line(signColXEnd, tableStartY, signColXEnd, tableCurrentY);     // Borde derecho
                    }

                    // Añadir pie, nueva página, cabecera documento
                    const currentPg = doc.internal.pages.length;
                    addFooter(doc, currentPg, 0, acta);
                    doc.addPage();
                    y = addHeader(doc, acta, bgImageInner); // 'y' global se resetea

                    // Redibujar cabecera TABLA y resetear Y de tabla
                    tableCurrentY = y + baseLineHeight * 0.5; // Posición Y para cabecera tabla en nueva pág
                    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
                    doc.text("NOMBRE Y CARGO", nameColXStart + textPadding, tableCurrentY - baseLineHeight * 0.2);
                    doc.text("FIRMA", signColXStart + (signColWidth / 2), tableCurrentY - baseLineHeight * 0.2, { align: 'center' });
                    doc.setLineWidth(1); doc.line(nameColXStart, tableCurrentY, signColXEnd, tableCurrentY);
                    tableCurrentY += baseLineHeight * 0.5; // Mover Y debajo de la línea

                    // Reiniciar la Y superior de la tabla para los bordes verticales en esta página
                    // tableStartY = tableCurrentY - baseLineHeight * 0.5; // (Aproximado)
               }

               // --- Dibujar Contenido de la Fila Actual ---
               const textStartY = tableCurrentY + textPadding; // Dónde empieza el texto dentro de la celda

               // Dibujar Nombre Completo (Negrita)
               doc.setFont("helvetica", "bold"); doc.setFontSize(8);
               let currentTextY = textStartY;
               nameLines.forEach((line: string) => { doc.text(line, nameColXStart + textPadding, currentTextY); currentTextY += smallLineHeight * 1.1; });

               // Dibujar Puesto (Normal)
               doc.setFont("helvetica", "normal"); doc.setFontSize(8);
               cargoLines.forEach((line: string) => { doc.text(line, nameColXStart + textPadding, currentTextY); currentTextY += smallLineHeight * 1.1; });

               // Dibujar línea horizontal inferior de la fila
               doc.setLineWidth(0.5);
               doc.line(nameColXStart, rowEndY, signColXEnd, rowEndY); // Línea completa

               // Mover la Y actual de la tabla para la siguiente fila
               tableCurrentY = rowEndY;
          }); // Fin del forEach

          // --- Dibujar Líneas Verticales Finales ---
          // (Dibujar desde la cabecera hasta el final de la última fila)
          doc.setLineWidth(0.5);
          // Línea vertical entre columnas Nombre y Firma
          doc.line(nameColXEnd, tableStartY, nameColXEnd, tableCurrentY);
          // Borde izquierdo de la tabla
          doc.line(nameColXStart, tableStartY, nameColXStart, tableCurrentY);
          // Borde derecho de la tabla
          doc.line(signColXEnd, tableStartY, signColXEnd, tableCurrentY);

          // Actualizar 'y' global para el siguiente elemento DESPUÉS de la tabla
          y = tableCurrentY + baseLineHeight * 1.5; // Espacio después de la tabla

          return y;
      };
        // Dibujar tablas para cada tipo de asistente encontrado en los datos
        // TODO: Tipar 'a' aquí si se define interfaz Asistente
        const comiteBase = asistentes.filter(a => a.tipo_asistente === 'base');
        const comiteInvitados = asistentes.filter(a => a.tipo_asistente === 'invitado');
        const areaRequirente = asistentes.filter(a => a.tipo_asistente === 'requirente');

        // *** CORRECCIÓN AQUÍ: Pasar bgImage y marginTop ***
        y = drawSignatureTable("POR PARTE DEL COMITÉ", comiteBase, bgImage, marginTop);
        y = drawSignatureTable("INVITADOS", comiteInvitados, bgImage, marginTop);
        y = drawSignatureTable("POR EL ÁREA REQUIRENTE", areaRequirente, bgImage, marginTop);

        // --- Nota Final Pie de Página (como en Página 3 muestra) ---
        y = checkAndAddPage(doc, y, pageHeight, bottomMarginThreshold, acta, bgImage); // Comprobar antes de añadir nota final
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const finalNote = `ESTA HOJA DE FIRMAS CORRESPONDE AL ACTA DE SESIÓN ORDINARIA DEL COMITÉ DE ADQUISICIONES, ENAJENACIONES, ARRENDAMIENTOS Y CONTRATACIÓN DE SERVICIOS DEL MUNICIPIO DE SAN JUAN DEL RÍO, QRO., CELEBRADA EL DÍA ${diaNum} DE ${mes.toUpperCase()} DE ${anioNum}.`;

        const finalNoteLines = doc.splitTextToSize(finalNote, contentWidth);
        finalNoteLines.forEach((line: string) => { // line es string
             // Sin comprobación salto página aquí, asumir que cabe o desborda un poco si está al final
             doc.text(line, marginLeft, y);
             y += smallLineHeight;
        });

        // --- Añadir Pies de Página a Todas las Páginas ---
        // *** BUCLE FOOTER CORREGIDO Y MOVIDO AL FINAL ***
        const totalPages = doc.internal.pages.length; // Obtener total páginas aquí
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(doc, i, totalPages, acta); // Aplicar pie a cada página
        }
        // *** FIN BUCLE FOOTER CORREGIDO ***

        // --- 👉 Salida PDF ---
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        // Opcional: Limpiar la URL del objeto después de un retraso
        // setTimeout(() => URL.revokeObjectURL(url), 1000);

    } catch (error) {
        console.error("❌ Error al generar el PDF del acta:", error);
        // Proveer feedback de error más específico si es posible
        if (error instanceof Error) {
             alert(`Ocurrió un error al generar el PDF del acta:\n${error.message}`);
        } else {
             alert("Ocurrió un error desconocido al generar el PDF del acta.");
        }
    }
};

export default generarPDFActa;