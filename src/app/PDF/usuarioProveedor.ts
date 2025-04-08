// src/utils/generateProveedorPdf.ts
import { jsPDF } from "jspdf";
// Asegúrate de importar la interfaz desde donde esté definida
import { ProveedorInfo } from '../proveedores/dashboard/formularios/ProveedorInfo'; // <-- AJUSTA ESTA RUTA a donde definiste ProveedorData

// Función para formatear la fecha (Mes en español)
const formatDateES = (date: Date): string => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    // Formato: San Juan del Río, Qro., a DD de Mes de YYYY
    return `San Juan del Río, Qro., a ${day} de ${month} de ${year}`;
}

export const generateProveedorPdfClientSide = async (providerData: ProveedorData): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4' // 210 x 297 mm
            });

            const img = new Image();
            img.src = '/images/SOLICITUD DE REGISTRO AL PADRÓN DE PROVEEDORES.png'; // <-- TU IMAGEN DE FONDO

            img.onload = () => {
                const pageHeight = doc.internal.pageSize.getHeight();
                const pageWidth = doc.internal.pageSize.getWidth();

                // 1. Añadir Imagen de Fondo CUBRIENDO TODA la página
                doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

                // 2. Configuración de Texto
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10); // Tamaño ajustado para caber en los campos
                doc.setTextColor(0, 0, 0); // Color negro

                const dateY = 65;
                const dateX = 111;

                // Coordenadas X para cada línea (aproximadas)
                const nombreX = 50;
                const razonSocialX = 50;
                const domFiscalX = 50;
                const domNotifX = 50;
                const colX = 40;  // Línea de Colonia, CP, Telefonos
                const cpX = 100;  // Línea de Colonia, CP, Telefonos
                const telX = 122;  // Línea de Colonia, CP, Telefonos
                const rfcCurpX = 50; // Línea de RFC, CURP
                const curpX = 122; // Línea de RFC, CURP
                const munEdoX = 40;    // Línea de Municipio, Entidad Federativa
                const EdoX = 108;    // Línea de Municipio, Entidad Federativa
                const giroX = 40; // Línea de Giro, Correo
                const camaraX = 40;  // Línea de Cámara, Reg. Cámara
                const correoX = 110; // Línea de Giro, Correo
                const regX = 110;  // Línea de Cámara, Reg. Cámara
                const imssX = 40;     // Línea de Registro IMSS
                const firmaX = 85;     // Línea para Nombre Solicitante (firma)

                // Coordenadas Y para cada línea (aproximadas)
                const nombreY = 97;
                const razonSocialY = 109;
                const domFiscalY = 119;
                const domNotifY = 130;
                const colY = 140;  // Línea de Colonia, CP, Telefonos
                const rfcCurpY = 148; // Línea de RFC, CURP
                const curpY = 148; // Línea de RFC, CURP
                const munEdoY = 158;    // Línea de Municipio, Entidad Federativa
                const giroCorreoY = 172; // Línea de Giro, Correo
                const camaraRegY = 186;  // Línea de Cámara, Reg. Cámara
                const imssY = 200;     // Línea de Registro IMSS
                const firmaY = 245;     // Línea para Nombre Solicitante (firma)

                // --- COLOCAR DATOS ---

                // Metadata (Fecha) - Alineado a la derecha de su espacio
                const today = new Date();
                const formattedDate = formatDateES(today);
                 // Ajustar X para que 'San Juan...' comience donde debe
                doc.text(formattedDate, dateX, dateY);

                // --- DATOS GENERALES ---

                // Nombre (SOLO para Persona Física)
                let nombreCompletoFisica = '';
                if (providerData.tipo_proveedor === 'fisica') {
                    nombreCompletoFisica = `${providerData.nombre_fisica ?? ''} ${providerData.apellido_p_fisica ?? ''} ${providerData.apellido_m_fisica ?? ''}`.trim();
                    doc.text(nombreCompletoFisica || '', nombreX, nombreY);
                }

                // Razón Social (SOLO para Persona Moral)
                if (providerData.tipo_proveedor === 'moral') {
                    doc.text(providerData.razon_social ?? '', razonSocialX, razonSocialY);
                }

                // Domicilio Fiscal (Calle y Número)
                const domicilioFiscal = `${providerData.calle ?? ''} ${providerData.numero ?? ''}`.trim();
                doc.text(domicilioFiscal || '', domFiscalX, domFiscalY);

                // Domicilio para Oír y Recibir Notificaciones (Asumimos mismo que fiscal)
                doc.text(domicilioFiscal || '', domNotifX, domNotifY);

                // Línea: Colonia / Codigo Postal / Telefonos
                doc.text(providerData.colonia ?? '', colX, colY);
                doc.text(providerData.codigo_postal ?? '', cpX, colY); // Columna CP
                const telefonos = [providerData.telefono_uno, providerData.telefono_dos].filter(Boolean).join(' / ');
                doc.text(telefonos || '', telX, colY); // Columna Telefonos

                // Línea: RFC / CURP
                doc.text(providerData.rfc ?? '', rfcCurpX, rfcCurpY);
                if (providerData.tipo_proveedor === 'fisica') {
                    doc.text(providerData.curp ?? '', curpX, curpY); // Columna CURP
                }

                // Línea: Municipio / Entidad Federativa
                doc.text(providerData.municipio ?? '', munEdoX, munEdoY);
                doc.text(providerData.estado ?? '', EdoX, munEdoY); // Columna Entidad

                // Línea: Giro Comercial / Profesional y Correo Electrónico
                doc.text(providerData.giro_comercial ?? '', giroX, giroCorreoY);
                doc.text(providerData.correo ?? '', correoX, giroCorreoY); // Columna Correo

                // Línea: Nombre Cámara y Número Registro Cámara
                doc.text(providerData.camara_comercial ?? '', regX, camaraRegY);
                doc.text(providerData.numero_registro_camara ?? '', camaraX, camaraRegY); // Columna Reg. Cámara

                // Número de Registro en el IMSS
                doc.text(providerData.numero_registro_imss ?? '', imssX, imssY);

                // Nombre y Firma del Solicitante
                const nombreSolicitante = providerData.tipo_proveedor === 'moral'
                    ? `${providerData.nombre_representante ?? ''} ${providerData.apellido_p_representante ?? ''} ${providerData.apellido_m_representante ?? ''}`.trim()
                    : nombreCompletoFisica; // Nombre física o Representante moral
                doc.text(nombreSolicitante || '', firmaX, firmaY); // Centrado aprox. bajo la línea

                // --- FINALIZAR ---
                const fileName = `SOLICITUD_${providerData.rfc || providerData.id_proveedor}.pdf`;
                doc.save(fileName);
                resolve();


            }; // Fin img.onload

            img.onerror = (event, source, lineno, colno, error) => {
                console.error("Error detallado al cargar la imagen de fondo:");
                console.error("URL intentada:", img.src);
                console.error("Evento:", event);
                console.error("Error Object:", error);
                const errorMessage = error ? error.message : `No se pudo cargar la imagen desde ${img.src}`;
                reject(new Error(`Error al cargar la imagen de fondo: ${errorMessage}`));
            };

        } catch (error) {
            console.error("Error inicializando jsPDF o preparando imagen:", error);
            reject(error instanceof Error ? error : new Error("Error desconocido al generar PDF"));
        }
    });
};
export default generateProveedorPdfClientSide;