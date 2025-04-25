// /src/app/api/contratos/[idContrato]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getContractById,
    updateContract,
    // deleteContract,
} from '@/services/contratosService';
import { ContratoUpdateData } from '@/types/contrato';
// Importar tipos necesarios si vas a usar template_data
import { ContratoInputData } from '@/types/contratoTemplateData';


interface RouteContext {
    params: {
        idContrato: string;
    }
}

// --- GET (Corregido y completo) ---
export async function GET(req: NextRequest, { params }: RouteContext) {
    const requestUrl = req.url;
    const idContratoStr = params.idContrato;
    console.log(`API Route GET /api/contratos/${idContratoStr} called (URL: ${requestUrl})`);
    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) {
            return NextResponse.json({ message: 'ID de contrato inválido.' }, { status: 400 });
        }
        const contrato = await getContractById(idContrato);
        if (!contrato) {
            return NextResponse.json({ message: `Contrato con ID ${idContrato} no encontrado.` }, { status: 404 });
        }
        return NextResponse.json(contrato);
    } catch (error: any) {
        console.error(`API Route GET /api/contratos/${idContratoStr} Error:`, error);
        let status = 500;
        let message = error.message || 'Error al obtener detalles del contrato.';
        if (message.includes("no encontrado")) status = 404;
        else if (message.includes("inválido")) status = 400;
        return NextResponse.json({ message }, { status });
    }
}

// --- PUT (CON EL BLOQUE CATCH AÑADIDO) ---
export async function PUT(req: NextRequest, { params }: RouteContext) {
    const requestUrl = req.url; // Workaround opcional
    const idContratoStr = params.idContrato;
    console.log(`API Route PUT /api/contratos/${idContratoStr} called`);

    try { // <-- Inicia Try
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

        let body: ContratoUpdateData & { template_data?: object };
        try { body = await req.json(); } catch (e) { return NextResponse.json({ message: 'Error JSON.' }, { status: 400 }); }

        console.log(`API Route PUT: Received data for ${idContrato}:`, JSON.stringify(body, null, 2));

        if (Object.keys(body).length === 0) {
            return NextResponse.json({ message: 'No hay datos para actualizar.' }, { status: 400 });
        }
        if ('template_data' in body && typeof body.template_data !== 'object' && body.template_data !== null) { // Permitir null si se envía explícitamente
             return NextResponse.json({ message: 'Formato inválido para template_data (debe ser objeto o null).' }, { status: 400 });
        }

        // Llama al servicio updateContract (modificado para aceptar template_data)
        const contratoActualizado = await updateContract(idContrato, body);

        if (!contratoActualizado) {
             return NextResponse.json({ message: `Contrato ID ${idContrato} no encontrado.` }, { status: 404 });
        }

        console.log(`API Route PUT: Contrato ${idContrato} actualizado.`);
        return NextResponse.json(contratoActualizado);

    // *** BLOQUE CATCH AÑADIDO ***
    } catch (error: any) {
        console.error(`API Route PUT /api/contratos/${idContratoStr} Error:`, error);
        let status = 500;
        let message = error.message || 'Error inesperado al actualizar.';
        if (message.includes("no encontrado")) status = 404;
        else if (message.includes("inválido") || message.includes("requerido") || message.includes("No se proporcionaron datos")) status = 400;
        else if (error.code === '23503') { status = 400; message = `Error de referencia.`; }
        else if (error.code === '23505') { status = 409; message = `Conflicto: Valor único duplicado.`; }
        else if (error instanceof SyntaxError) { status = 400; message = 'Error: Formato JSON inválido.'; }
         else if (message.includes("template_data")) status = 400; // Captura errores específicos de JSONB
        return NextResponse.json({ message }, { status });
    }
    // *** FIN BLOQUE CATCH ***
} // <-- Fin función PUT

// --- DELETE (Corregido si se descomenta) ---
/*
export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const requestUrl = req.url; // Workaround
    const idContratoStr = params.idContrato;
    console.log(`API Route DELETE /api/contratos/${idContratoStr} called`);
    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) {
            return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });
        }
        // await deleteContract(idContrato);
        console.log(`API Route DELETE: Contrato ${idContrato} eliminado.`);
        return NextResponse.json(null, { status: 204 });
    } catch (error: any) { // <-- Asegurarse que el catch existe aquí también
        console.error(`API Route DELETE /api/contratos/${idContratoStr} Error:`, error);
        let status = 500;
        let message = error.message || 'Error inesperado al eliminar.';
        if (message.includes("no encontrado")) status = 404;
        else if (error.code === '23503') { status = 400; message = `No se puede eliminar: registros relacionados.`; }
        return NextResponse.json({ message }, { status });
    }
}
*/