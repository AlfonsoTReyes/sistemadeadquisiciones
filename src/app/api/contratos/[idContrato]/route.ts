// src/app/api/contratos/[idContrato]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getContractById,
    updateContract,
    // deleteContract, // Descomentar si se usa
} from '@/services/contratosService'; // Ajusta la ruta
import { ContratoUpdateData } from '@/types/contrato'; // Ajusta la ruta

interface RouteContext {
    params: {
        idContrato: string;
    }
}

// --- GET: Obtener detalles de UN contrato ---
// *** ADVERTENCIA DE SEGURIDAD: No hay verificación de que el solicitante
// *** (si es proveedor) sea el dueño del contrato. Cualquiera puede pedir cualquier ID.
export async function GET(req: NextRequest, { params }: RouteContext) {
    const { idContrato: idContratoStr } = params;
    console.log(`API Route GET /api/contratos/${idContratoStr} called (SIN VERIFICACIÓN DE PERMISOS)`);

    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) {
            return NextResponse.json({ message: 'ID de contrato inválido.' }, { status: 400 });
        }

        const contrato = await getContractById(idContrato);

        if (!contrato) {
            return NextResponse.json({ message: `Contrato con ID ${idContrato} no encontrado.` }, { status: 404 });
        }

        // ¡Se omite la verificación de propiedad del contrato!
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

// --- PUT: Actualizar un contrato existente ---
// *** ADVERTENCIA DE SEGURIDAD: Permite a CUALQUIERA intentar actualizar cualquier contrato.
export async function PUT(req: NextRequest, { params }: RouteContext) {
    const { idContrato: idContratoStr } = params;
    console.log(`API Route PUT /api/contratos/${idContratoStr} called (SIN VERIFICACIÓN DE PERMISOS)`);

    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) {
            return NextResponse.json({ message: 'ID de contrato inválido.' }, { status: 400 });
        }

        let body: ContratoUpdateData;
        try {
            body = await req.json();
        } catch (jsonError) {
            return NextResponse.json({ message: 'Error en el formato JSON.' }, { status: 400 });
        }

        console.log(`API Route PUT: Received data for ${idContrato}:`, JSON.stringify(body, null, 2));

        if (body.monto_total !== undefined && isNaN(parseFloat(body.monto_total))) {
             return NextResponse.json({ message: 'Si incluye monto_total, debe ser número válido.' }, { status: 400 });
        }
        if (Object.keys(body).length === 0) {
            return NextResponse.json({ message: 'No se proporcionaron datos para actualizar.' }, { status: 400 });
        }

        const contratoActualizado = await updateContract(idContrato, body);

        if (!contratoActualizado) { // El servicio debería lanzar error si no encuentra
             return NextResponse.json({ message: `Contrato con ID ${idContrato} no encontrado.` }, { status: 404 });
        }

        console.log(`API Route PUT: Contrato ${idContrato} actualizado.`);
        return NextResponse.json(contratoActualizado);

    } catch (error: any) {
        console.error(`API Route PUT /api/contratos/${idContratoStr} Error:`, error);
        let status = 500;
        let message = error.message || 'Error inesperado al actualizar.';
        // Mapeo errores
        if (message.includes("no encontrado")) status = 404;
        else if (message.includes("inválido") || message.includes("requerido") || message.includes("No se proporcionaron datos")) status = 400;
        else if (error.code === '23503') { status = 400; message = `Error de referencia: Verifique IDs relacionados.`; }
        else if (error.code === '23505') { status = 409; message = `Conflicto: Valor único duplicado.`; }
        else if (error instanceof SyntaxError) { status = 400; message = 'Error: Formato JSON inválido.'; }
        return NextResponse.json({ message }, { status });
    }
}

// --- DELETE: Eliminar un contrato ---
// *** ADVERTENCIA DE SEGURIDAD: Permite a CUALQUIERA intentar eliminar cualquier contrato.
// *** ¡Descomentar con extrema precaución!
/*
export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const { idContrato: idContratoStr } = params;
    console.log(`API Route DELETE /api/contratos/${idContratoStr} called (SIN VERIFICACIÓN DE PERMISOS)`);

    try {
        const idContrato = parseInt(idContratoStr, 10);
        if (isNaN(idContrato)) {
            return NextResponse.json({ message: 'ID de contrato inválido.' }, { status: 400 });
        }

        // Asumiendo que deleteContract existe en el servicio
        // await deleteContract(idContrato);

        console.log(`API Route DELETE: Contrato ${idContrato} eliminado.`);
        return NextResponse.json(null, { status: 204 }); // 204 No Content

    } catch (error: any) {
        console.error(`API Route DELETE /api/contratos/${idContratoStr} Error:`, error);
        let status = 500;
        let message = error.message || 'Error inesperado al eliminar.';
        if (message.includes("no encontrado")) status = 404;
        else if (error.code === '23503') { status = 400; message = `No se puede eliminar: El contrato tiene registros relacionados.`; }
        return NextResponse.json({ message }, { status });
    }
}
*/