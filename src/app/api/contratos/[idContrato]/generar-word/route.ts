// src/app/api/contratos/[idContrato]/generar-word/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getContractById } from '@/services/contratosService';
import { mapContratoToTemplateData } from '@/lib/contratoTemplateMapper';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';

// If you want to ensure Node.js runtime (default for API routes unless specified)
// export const dynamic = 'force-dynamic'; // Try adding this if not present

export async function GET(
    req: NextRequest
    // context: { params: { idContrato: string } } // Temporarily remove/ignore context for this workaround
) {
    // WORKAROUND: Extract idContrato from pathname
    const pathnameParts = req.nextUrl.pathname.split('/');
    // Expected path: /api/contratos/[idContrato]/generar-word
    // Array indices:    0   1      2         3            4
    // idContrato should be at index 3 if the base is /
    const idContratoStr = pathnameParts[3];

    if (!idContratoStr) {
        console.error("Error: Could not extract idContrato from pathname.", req.nextUrl.pathname, pathnameParts);
        return NextResponse.json({ message: 'No se pudo determinar el ID del contrato desde la URL' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const templateType = searchParams.get('template') as 'servicio' | 'adquisicion' | null;


    if (!templateType || (templateType !== 'servicio' && templateType !== 'adquisicion')) {
        return NextResponse.json({ message: "Parámetro 'template' (servicio o adquisicion) es requerido." }, { status: 400 });
    }

    const idContrato = parseInt(idContratoStr, 10);
    if (isNaN(idContrato)) {
        return NextResponse.json({ message: 'ID de contrato inválido (extraído del pathname).' }, { status: 400 });
    }

    try {
        const contratoData = await getContractById(idContrato);
        if (!contratoData) {
            return NextResponse.json({ message: 'Contrato no encontrado' }, { status: 404 });
        }

        const dataForTemplate = mapContratoToTemplateData(contratoData);

        const templateFileName = templateType === 'servicio' ? 'plantilla_servicio.docx' : 'plantilla_adquisicion.docx';
        const templatePath = path.resolve(process.cwd(), 'templates', templateFileName);

        if (!fs.existsSync(templatePath)) {
             console.error(`API Generar Word: Template file not found at ${templatePath}`);
             return NextResponse.json({ message: `Archivo de plantilla no encontrado: ${templateFileName}` }, { status: 500 });
        }
        const content = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            nullGetter: () => "",
        });

        doc.render(dataForTemplate);

        const buf = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        const outputFileName = `Contrato_${contratoData.numero_contrato ?? contratoData.id_contrato}_${templateType}.docx`;
        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${outputFileName}"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
        });

    } catch (error: unknown) {
        console.error(`API Generar Word: Error processing contract ${idContrato}:`, error);
        let message = 'Error al generar el documento.';
        if (error instanceof Error) {
            message = error.message;
        }
        return NextResponse.json({ message }, { status: 500 });
    }
}