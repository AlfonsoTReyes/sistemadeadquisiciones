// /src/app/api/contratos/[idContrato]/generar-word/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getContractById } from '@/services/contratosService'; // Ajusta ruta
import { mapContratoToTemplateData } from '@/lib/contratoTemplateMapper'; // Ajusta ruta
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

interface RouteContext {
    params: {
        idContrato: string;
    }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
    const idContratoStr = params.idContrato;
    const { searchParams } = new URL(req.url);
    // *** 1. Obtener y Validar templateType PRIMERO ***
    const templateType = searchParams.get('template') as 'servicio' | 'adquisicion' | null;

    console.log(`API Generar Word: Request for Contrato ID ${idContratoStr}, Template: ${templateType}`);

    if (!templateType || (templateType !== 'servicio' && templateType !== 'adquisicion')) {
        return NextResponse.json({ message: "Parámetro 'template' (servicio o adquisicion) es requerido." }, { status: 400 });
    }

    // *** 2. Validar idContrato ***
    const idContrato = parseInt(idContratoStr, 10);
    if (isNaN(idContrato)) {
        return NextResponse.json({ message: 'ID de contrato inválido.' }, { status: 400 });
    }

    // *** 3. Autenticación/Autorización (¡IMPORTANTE!) ***
    // Añade tu lógica de verificación de sesión/rol aquí si es necesario

    try {
        // *** 4. Obtener datos del contrato ***
        const contratoData = await getContractById(idContrato);
        if (!contratoData) {
            return NextResponse.json({ message: 'Contrato no encontrado' }, { status: 404 });
        }

        // *** 5. Determinar ruta y leer plantilla AHORA que templateType es válido ***
        const templateFileName = templateType === 'servicio' ? 'plantilla_servicio.docx' : 'plantilla_adquisicion.docx';
        const templatePath = path.resolve(process.cwd(), 'templates', templateFileName); // Asume carpeta /templates en la raíz
        console.log(`API Generar Word: Using template path: ${templatePath}`);

        if (!fs.existsSync(templatePath)) {
             console.error(`API Generar Word: Template file not found at ${templatePath}`);
             return NextResponse.json({ message: `Archivo de plantilla no encontrado: ${templateFileName}` }, { status: 500 });
        }
        const content = fs.readFileSync(templatePath, 'binary'); // Leer contenido binario

        // *** 6. Preparar datos para la plantilla ***
        const dataForTemplate = mapContratoToTemplateData(contratoData, templateType);
        console.log("API Generar Word: Data mapped for template:", dataForTemplate);

        // *** 7. Usar PizZip y Docxtemplater ***
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => "", // Evita errores si falta un tag
            // Considera añadir un parser para manejar tags complejos si es necesario
            // parser: (tag) => { ... }
        });

        // *** 8. Renderizar el documento ***
        doc.render(dataForTemplate);

        // *** 9. Generar el buffer ***
        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        // *** 10. Crear nombre de archivo y enviar respuesta ***
        const outputFileName = `Contrato_${contratoData.numero_contrato ?? contratoData.id_contrato}_${templateType}.docx`;
        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${outputFileName}"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
        });

    } catch (error: any) {
        console.error(`API Generar Word: Error processing contract ${idContrato}:`, error);
         // Revisar el tipo de error para dar mejor respuesta
         if (error.message?.includes("template file not found")) { // Ejemplo
             return NextResponse.json({ message: `Error interno: No se encontró la plantilla ${error.fileName || ''}` }, { status: 500 });
         }
         // Error genérico
        return NextResponse.json({ message: `Error al generar el documento: ${error.message}` }, { status: 500 });
    }
}