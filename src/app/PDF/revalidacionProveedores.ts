// src/utils/generateProveedorPdf.ts
import { jsPDF } from "jspdf";
// CORREGIDO: Import the correct interface name
import { ProveedorDetallado } from '@/types/proveedor'; // <-- AJUSTA ESTA RUTA si es necesario

// Función para formatear la fecha (Mes en español)
const formatDateES = (date: Date): string => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `San Juan del Río, Qro., a ${day} de ${month} de ${year}`; // Corrected template literal
}

// Use the imported ProveedorData type
export const revalidacionProveedores = async (providerData: ProveedorDetallado): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const img = new Image();
            img.src = '/images/SOLICITUD REVALIDACION PROVEEDORES.png'; // Ensure this path is correct from public folder

            img.onload = () => {
                const pageHeight = doc.internal.pageSize.getHeight();
                const pageWidth = doc.internal.pageSize.getWidth();

                doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                const dateY = 65;
                const dateX = 111;

                const nombreX = 50;
                const razonSocialX = 50;
                const domFiscalX = 50;
                const domNotifX = 50;
                const colX = 40;
                const cpX = 100;
                const telX = 122;
                const rfcCurpX = 50;
                const curpX = 122;
                const munEdoX = 40;
                const EdoX = 108;
                const giroX = 40;
                const camaraX = 40;
                const correoX = 110;
                const regX = 110;
                const imssX = 40;
                const firmaX = 85;

                const nombreY = 97;
                const razonSocialY = 109;
                const domFiscalY = 119;
                const domNotifY = 130;
                const colY = 140;
                const rfcCurpY = 148;
                // const curpY = 148; // Redundant if rfcCurpY is used for both
                const munEdoY = 158;
                const giroCorreoY = 172;
                const camaraRegY = 186;
                const imssY = 200;
                const firmaY = 245;

                const today = new Date();
                const formattedDate = formatDateES(today);
                doc.text(formattedDate, dateX, dateY);

                let nombreCompletoFisica = '';
                if (providerData.tipo_proveedor === 'fisica') {
                    nombreCompletoFisica = `${providerData.nombre_fisica ?? ''} ${providerData.apellido_p_fisica ?? ''} ${providerData.apellido_m_fisica ?? ''}`.trim();
                    doc.text(nombreCompletoFisica || 'N/A', nombreX, nombreY); // Added fallback
                }

                if (providerData.tipo_proveedor === 'moral') {
                    doc.text(providerData.razon_social ?? 'N/A', razonSocialX, razonSocialY); // Added fallback
                }

                const domicilioFiscal = `${providerData.calle ?? ''} ${providerData.numero ?? ''}`.trim();
                doc.text(domicilioFiscal || 'N/A', domFiscalX, domFiscalY);
                doc.text(domicilioFiscal || 'N/A', domNotifX, domNotifY);

                doc.text(providerData.colonia ?? 'N/A', colX, colY);
                doc.text(providerData.codigo_postal ?? 'N/A', cpX, colY);
                const telefonos = [providerData.telefono_uno, providerData.telefono_dos].filter(Boolean).join(' / ');
                doc.text(telefonos || 'N/A', telX, colY);

                doc.text(providerData.rfc ?? 'N/A', rfcCurpX, rfcCurpY);
                if (providerData.tipo_proveedor === 'fisica') {
                    doc.text(providerData.curp ?? 'N/A', curpX, rfcCurpY); // Used rfcCurpY for Y consistency
                }

                doc.text(providerData.municipio ?? 'N/A', munEdoX, munEdoY);
                doc.text(providerData.estado ?? 'N/A', EdoX, munEdoY);

                doc.text(providerData.giro_comercial ?? 'N/A', giroX, giroCorreoY);
                doc.text(providerData.correo ?? 'N/A', correoX, giroCorreoY);

                // Corrected order for camara and reg
                doc.text(providerData.camara_comercial ?? 'N/A', camaraX, camaraRegY);
                doc.text(providerData.numero_registro_camara ?? 'N/A', regX, camaraRegY);


                doc.text(providerData.numero_registro_imss ?? 'N/A', imssX, imssY);

                // Ensure 'representantes' exists for moral type before accessing
                const nombreSolicitante = providerData.tipo_proveedor === 'moral'
                    ? (providerData.representantes && providerData.representantes.length > 0
                        ? `${providerData.representantes[0].nombre_representante ?? ''} ${providerData.representantes[0].apellido_p_representante ?? ''} ${providerData.representantes[0].apellido_m_representante ?? ''}`.trim()
                        : providerData.razon_social || 'N/A') // Fallback to razon_social if no reps
                    : nombreCompletoFisica;
                doc.text(nombreSolicitante || 'N/A', firmaX, firmaY);

                const fileName = `SOLICITUD_REVALIDACION_${providerData.rfc || providerData.id_proveedor}.pdf`;
                doc.save(fileName);
                resolve();
            };

            img.onerror = (event_unused, source_unused, lineno_unused, colno_unused, error) => { // Prefixed unused params
                console.error("Error detallado al cargar la imagen de fondo:");
                console.error("URL intentada:", img.src);
                // console.error("Evento:", event_unused); // Event can be large
                console.error("Error Object:", error);
                const errorMessage = error instanceof Error ? error.message : `No se pudo cargar la imagen desde ${img.src}`;
                reject(new Error(`Error al cargar la imagen de fondo: ${errorMessage}`));
            };

        } catch (error) {
            console.error("Error inicializando jsPDF o preparando imagen:", error);
            reject(error instanceof Error ? error : new Error("Error desconocido al generar PDF"));
        }
    });
};

// export default revalidacionProveedores; // Default export might not be needed if only revalidacionProveedores is used.
                                       // If you intend to import this file as a module with multiple exports,
                                       // then this default export is fine.