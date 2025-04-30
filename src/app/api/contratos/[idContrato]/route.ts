// /src/app/api/contratos/[idContrato]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getContractById,
    updateContract,
    // deleteContract,
} from '@/services/contratosService';
import { ContratoUpdateData } from '@/types/contrato';
import { ContratoInputData } from '@/types/contratoTemplateData';

// La interfaz RouteContext ya NO es necesaria si no usamos el segundo argumento 'params'
// interface RouteContext { params: { idContrato: string; } }

// --- GET (Modificado para extraer ID de la URL) ---
export async function GET(req: NextRequest /* Eliminamos el segundo argumento { params } */) {
    // *** NUEVA FORMA DE OBTENER EL ID ***
    let idContratoStr: string | undefined;
    try {
        const pathnameParts = req.nextUrl.pathname.split('/'); // Divide la ruta: ['', 'api', 'contratos', '5']
        idContratoStr = pathnameParts[pathnameParts.length - 1]; // Obtiene el último segmento
    } catch (e) {
        console.error("Error extrayendo ID de la URL:", e);
        return NextResponse.json({ message: 'Error procesando la ruta.' }, { status: 400 });
    }
    // *** FIN NUEVA FORMA ***

    console.log(`API Route GET /api/contratos/ (ID from path: ${idContratoStr}) called`);

    // Validar que obtuvimos algo
    if (!idContratoStr) {
        return NextResponse.json({ message: 'No se pudo extraer el ID del contrato de la URL.' }, { status: 400 });
    }

    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) {
            return NextResponse.json({ message: 'ID de contrato inválido en la URL.' }, { status: 400 });
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

// --- PUT (Modificado para extraer ID de la URL) ---
export async function PUT(req: NextRequest /* Eliminamos { params } */) {
    // *** NUEVA FORMA DE OBTENER EL ID ***
    let idContratoStr: string | undefined;
    try {
        const pathnameParts = req.nextUrl.pathname.split('/');
        idContratoStr = pathnameParts[pathnameParts.length - 1];
    } catch (e) {
        console.error("Error extrayendo ID de la URL en PUT:", e);
        return NextResponse.json({ message: 'Error procesando la ruta.' }, { status: 400 });
    }
    // *** FIN NUEVA FORMA ***

    console.log(`API Route PUT /api/contratos/${idContratoStr} called`);

     if (!idContratoStr) {
        return NextResponse.json({ message: 'No se pudo extraer el ID del contrato de la URL.' }, { status: 400 });
    }

    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) return NextResponse.json({ message: 'ID inválido.' }, { status: 400 });

        let body: ContratoUpdateData & { template_data?: object };
        try { body = await req.json(); } catch (e) { return NextResponse.json({ message: 'Error JSON.' }, { status: 400 }); }

        console.log(`API Route PUT: Received data for ${idContrato}:`, JSON.stringify(body, null, 2));

        if (Object.keys(body).length === 0) { return NextResponse.json({ message: 'No hay datos para actualizar.' }, { status: 400 }); }
        if ('template_data' in body && typeof body.template_data !== 'object' && body.template_data !== null) { return NextResponse.json({ message: 'Formato inválido para template_data.' }, { status: 400 }); }

        const contratoActualizado = await updateContract(idContrato, body);

        if (!contratoActualizado) { return NextResponse.json({ message: `Contrato ID ${idContrato} no encontrado.` }, { status: 404 }); }

        console.log(`API Route PUT: Contrato ${idContrato} actualizado.`);
        return NextResponse.json(contratoActualizado);

    } catch (error: any) {
        console.error(`API Route PUT /api/contratos/${idContratoStr} Error:`, error);
        let status = 500; let message = error.message || 'Error inesperado al actualizar.';
        if (message.includes("no encontrado")) status = 404;
        else if (message.includes("inválido") || message.includes("requerido") || message.includes("No se proporcionaron datos")) status = 400;
        else if (error.code === '23503') { status = 400; message = `Error de referencia.`; }
        else if (error.code === '23505') { status = 409; message = `Conflicto: Valor único duplicado.`; }
        else if (error instanceof SyntaxError) { status = 400; message = 'Error: Formato JSON inválido.'; }
        else if (message.includes("template_data")) status = 400;
        return NextResponse.json({ message }, { status });
    }
}

// --- DELETE (Modificado para extraer ID de la URL, si lo descomentas) ---
/*
export async function DELETE(req: NextRequest) {
    let idContratoStr: string | undefined;
    try {
        const pathnameParts = req.nextUrl.pathname.split('/');
        idContratoStr = pathnameParts[pathnameParts.length - 1];
    } catch (e) { return NextResponse.json({ message: 'Error procesando ruta.' }, { status: 400 }); }

    console.log(`API Route DELETE /api/contratos/${idContratoStr} called`);

     if (!idContratoStr) { return NextResponse.json({ message: 'No se pudo extraer ID.' }, { status: 400 }); }

    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) { return NextResponse.json({ message: 'ID inválido.' }, { status: 400 }); }
        // await deleteContract(idContrato);
        console.log(`API Route DELETE: Contrato ${idContrato} eliminado.`);
        return NextResponse.json(null, { status: 204 });
    } catch (error: any) {
        console.error(`API Route DELETE /api/contratos/${idContratoStr} Error:`, error);
        let status = 500; let message = error.message || 'Error inesperado al eliminar.';
        if (message.includes("no encontrado")) status = 404;
        else if (error.code === '23503') { status = 400; message = `No se puede eliminar: registros relacionados.`; }
        return NextResponse.json({ message }, { status });
    }
}
*/