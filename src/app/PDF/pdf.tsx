import { jsPDF } from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

interface Detalle {
    id_detalle: number;
    cantidad: number;
    unidad: string;
    estado_detalle: string;
    descripcion_material: string;
}

interface Evidencia {
    url: string;
    descripcion: string;
}

const fetchDatosParaPDF = async (idOrden: number) => {
    try {
        const response = await fetch(`/api/detalle_refacciones?id_orden=${idOrden}`);
        if (!response.ok) {
            throw new Error("Error al obtener datos para el PDF");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const handleGeneratePDF = async (idOrden: number) => {
    try {
        const datos = await fetchDatosParaPDF(idOrden);
        const doc = new jsPDF() as jsPDF & { lastAutoTable: any };

        // **FUNCIÓN PARA CARGAR IMÁGENES USANDO ASYNC/AWAIT**
        const cargarImagen = async (url: string, x: number, y: number, width: number, height: number) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    doc.addImage(img, "JPEG", x, y, width, height);
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Error al cargar la imagen: ${url}`);
                    resolve(); // Continuar incluso si hay error
                };
            });
        };
        

        doc.setFontSize(10);
        doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 160, 25);
        doc.setFont("helvetica", "bold");
        doc.text("JEFATURA DE MANTENIMIENTO VEHICULAR", 65, 40);
        doc.setFont("helvetica", "normal");

        const folio = datos.orden.folio || "Folio no disponible";
        doc.text(`Folio: ${folio}`, 140, 50);
        const estadoOrden = datos.orden.estado_orden || "Estado no disponible";
        doc.text(`Estado de la orden: ${estadoOrden}`, 140, 55);

        const placaVehiculo = datos.vehiculo.placa_vehiculo || "Placa no disponible";
        const marca = datos.vehiculo.marca || "Marca no disponible";
        const modelo = datos.vehiculo.modelo || "Modelo no disponible";
        const secretaria = datos.vehiculo.secretaria || "Secretaría no disponible";

        const tableData = datos.detallesOrden.map((detalles: Detalle, index: number) => [
            index + 1,
            detalles.cantidad,
            detalles.unidad,
            detalles.estado_detalle,
            detalles.descripcion_material,
        ]);

        autoTable(doc, {
            startY: 60,
            head: [["CVO", "CANTIDAD", "UNIDAD", "ESTADO DE DETALLE", "DESCRIPCIÓN DEL MATERIAL"]],
            body: tableData,
            headStyles: { halign: "center", fontStyle: "bold", fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            bodyStyles: { fontSize: 10, halign: "center", fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            styles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
            margin: { top: 10, bottom: 10 },
        });

        let startYForSecondTable = doc.lastAutoTable.finalY + 5;

        const vehiculoInfo = [
            `PARA LA UNIDAD ${placaVehiculo} MARCA ${marca} MODELO ${modelo} DE LA ${secretaria}`
        ];

        autoTable(doc, {
            startY: startYForSecondTable,
            body: vehiculoInfo.map(item => [item]),
            bodyStyles: { fontSize: 10, halign: "center", fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            styles: { lineColor: [0, 0, 0], lineWidth: 0.1 },
            margin: { top: 10, bottom: 10 },
        });

        let yPosition = doc.lastAutoTable.finalY + 10;

        const nombreAutorizo = datos.orden.nombre_aprobo || "No disponible";
        const firmaAutorizoURL = datos.orden.firma_a_url || null;

        const detalle = datos.detallesOrden?.[0] || {};
        const responsableRecepcion = detalle.responsable || "No disponible";
        const firmaRecepcionURL = detalle.firma_url || null;

        const firmaY = yPosition + 20;
        const lineaFirmaY = firmaY + 18;
        const textoY = lineaFirmaY + 6;

        // AUTORIZÓ
        doc.text("AUTORIZÓ", 40, firmaY - 5);
        doc.text("________________________________", 15, lineaFirmaY);
        doc.text(nombreAutorizo, 15, textoY, { maxWidth: 80 });

        // RECIBIÓ EN TALLER
        doc.text("RECIBIO ENTRADA AL ALMACEN", 145, firmaY - 5);
        doc.text("____________________________________", 120, lineaFirmaY);
        doc.text(responsableRecepcion, 120, textoY, { maxWidth: 80 });

        // **CARGAR FIRMAS**
        if (firmaAutorizoURL) await cargarImagen(firmaAutorizoURL, 30, firmaY, 50, 15);
        if (firmaRecepcionURL) await cargarImagen(firmaRecepcionURL, 135, firmaY, 50, 15);

        // **FUNCIÓN PARA AGREGAR LAS EVIDENCIAS**
        const agregarEvidencias = async () => {
            const evidencias: Evidencia[] = datos.evidencia || [];

            if (evidencias.length > 0) {
                yPosition += 60; // Espacio extra después de firmas
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("EVIDENCIAS DE ENTRADA AL ALMACEN", 50, yPosition);
                doc.setFont("helvetica", "normal");

                yPosition += 15;

                let xPosition = 10; // Posición inicial en X
                let count = 0; // Contador para agrupar imágenes

                for (const evidencia of evidencias) {
                    if (count % 3 === 0) {
                        // Nueva fila cuando hay tres imágenes
                        if (count > 0) {
                            yPosition += 45; // Espacio reducido entre filas
                        }
                        xPosition = 10; // Reiniciar la posición X para la nueva fila
                    } else {
                        xPosition += 45; // Espacio compacto entre imágenes
                    }
            
                    // Si la imagen no cabe en la página, agregar una nueva
                    if (yPosition + 40 > doc.internal.pageSize.height - 20) {
                        doc.addPage();
                        yPosition = 10; // Reiniciar la posición Y en la nueva página
                    }
            
                    await cargarImagen(evidencia.url, xPosition, yPosition, 40, 40); // Imágenes más compactas
                    count++;
                }
            }
        };

        await agregarEvidencias();

        // **FUNCIÓN PARA FINALIZAR EL PDF**
        const finalizarPDF = () => {
            const pdfBlob = doc.output("blob");
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, "_blank");
        };

        finalizarPDF();

    } catch (error) {
        console.error("Error al generar el PDF:", error);
    }
};

export default handleGeneratePDF;
