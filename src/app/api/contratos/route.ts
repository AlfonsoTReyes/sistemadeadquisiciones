// /src/app/api/contratos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getContracts,
    createContract, // Mantenemos la función original
    createContractWithTemplateData // Importamos la nueva función
} from '@/services/contratosService'; // Servicio de contratos
import { ContratoCreateData } from '@/types/contrato';
// Importamos el nuevo tipo de input para la verificación
import { ContratoInputData } from '@/types/contratoTemplateData'; // Ajusta ruta

// Importa la función necesaria del servicio de proveedores para GET
import { getProveedorByUserId } from '@/services/proveedoresservice';

// --- GET (SIN CAMBIOS - Mantenemos la lógica existente) ---
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const idProveedorParam = searchParams.get('idProveedor');
    const userIdParam = searchParams.get('userId');
    try {
        const filters: Parameters<typeof getContracts>[0] = {};
        let idProveedorFiltrar: number | null = null;
        if (userIdParam) {
            const userId = parseInt(userIdParam, 10);
            if (isNaN(userId)) return NextResponse.json({ message: 'Parámetro "userId" inválido.' }, { status: 400 });
            try {
                const perfilProveedor = await getProveedorByUserId(userId);
                if (perfilProveedor?.id_proveedor != null) {
                    idProveedorFiltrar = perfilProveedor.id_proveedor;
                } else {
                    return NextResponse.json([]);
                }
            } catch (profileError: any) {
                console.error(`API GET /contratos: Error buscando perfil User ID ${userId}:`, profileError);
                return NextResponse.json({ message: `Error interno buscar perfil: ${profileError.message}` }, { status: 500 });
            }
        } else if (idProveedorParam) {
            const idProveedor = parseInt(idProveedorParam, 10);
            if (isNaN(idProveedor)) return NextResponse.json({ message: 'Parámetro "idProveedor" inválido.' }, { status: 400 });
            idProveedorFiltrar = idProveedor;
        } else {
        }
        if (idProveedorFiltrar !== null) filters.id_proveedor = idProveedorFiltrar;
        const contratos = await getContracts(filters);
        return NextResponse.json(contratos);
    } catch (error: any) {
        console.error("API Route GET /api/contratos Error:", error);
        return NextResponse.json({ message: error.message || 'Error obtener lista.' }, { status: 500 });
    }
}

// --- POST (ADAPTADO PARA MANEJAR AMBOS FORMATOS) ---
export async function POST(req: NextRequest) {
    let body: any;
    try {
        body = await req.json();
    } catch (jsonError) {
        return NextResponse.json({ message: 'Error en el formato JSON.' }, { status: 400 });
    }

    // *** Intenta identificar si es el nuevo formato (ContratoInputData) ***
    const isTemplateFormat = body &&
        typeof body === 'object' &&
        body.tipoContrato && // Campo clave discriminador
        body.idProveedor &&
        body.objetoPrincipal && // Usamos un campo renombrado como señal
        body.montoTotal !== undefined &&
        body.suficiencia && typeof body.suficiencia === 'object' && // Check de objetos anidados
        body.areaRequirente && typeof body.areaRequirente === 'object';


    if (isTemplateFormat) {
        // --- PROCESAR CON LA NUEVA LÓGICA (ContratoInputData) ---
        const inputData = body as ContratoInputData;

        // Validación adicional específica de ContratoInputData si es necesaria aquí

        try {
            // Separar datos Core de Template Data
            const coreData: Partial<ContratoCreateData> & { id_proveedor: number; objeto_contrato: string; monto_total: string } = { // Asegura tipos requeridos
                id_proveedor: inputData.idProveedor,
                objeto_contrato: inputData.objetoPrincipal,
                monto_total: String(inputData.montoTotal), // Convertir a string
                numero_contrato: inputData.numeroProcedimiento,
                id_solicitud: inputData.idSolicitud,
                id_dictamen: inputData.idDictamen,
                id_concurso: inputData.idConcurso,
                moneda: inputData.moneda,
                fecha_firma: inputData.fechaFirma,
                fecha_inicio: inputData.fechaInicio,
                fecha_fin: inputData.fechaFin,
                condiciones_pago: inputData.condicionesPago,
                garantias: inputData.garantiasTexto,
            };

            // Datos restantes para JSONB
            const templateSpecificData = { ...inputData };
            // Eliminar claves mapeadas a coreData (opcional pero reduce redundancia)
            delete (templateSpecificData as any).idProveedor;
            delete (templateSpecificData as any).objetoPrincipal;
            delete (templateSpecificData as any).montoTotal;
            delete (templateSpecificData as any).numeroProcedimiento;
            delete (templateSpecificData as any).idSolicitud;
            delete (templateSpecificData as any).idDictamen;
            delete (templateSpecificData as any).idConcurso;
            delete (templateSpecificData as any).moneda;
            delete (templateSpecificData as any).fechaFirma;
            delete (templateSpecificData as any).fechaInicio;
            delete (templateSpecificData as any).fechaFin;
            delete (templateSpecificData as any).condicionesPago;
            delete (templateSpecificData as any).garantiasTexto;

            // Validar campos requeridos antes de llamar al servicio
            if (!coreData.id_proveedor || !coreData.objeto_contrato || !coreData.monto_total) {
                return NextResponse.json({ message: 'Faltan campos básicos requeridos (Proveedor, Objeto, Monto).' }, { status: 400 });
            }
            // Podrías añadir más validaciones aquí para suficiencia, areaRequirente, etc.

            // Llamar al NUEVO servicio
            const nuevoContrato = await createContractWithTemplateData(coreData, templateSpecificData);

            return NextResponse.json(nuevoContrato, { status: 201 });

        } catch (error: any) {
            console.error("API Route POST /api/contratos Error processing template data:", error);
            let status = 500;
            let message = error.message || 'Error inesperado al crear el contrato (template).';
            if (message.includes("requerido") || message.includes("inválido")) status = 400;
            else if (error.code === '23503') { status = 400; message = `Error de referencia.`; }
            else if (error.code === '23505') { status = 409; message = `Conflicto: Valor único duplicado.`; }
            return NextResponse.json({ message }, { status });
        }

    } else {
        // --- PROCESAR CON LA LÓGICA ORIGINAL (ContratoCreateData) ---
        const legacyData = body as ContratoCreateData; // Castear al tipo original

        // Validación original
        if (!legacyData.id_proveedor || !legacyData.objeto_contrato || !legacyData.monto_total) {
            return NextResponse.json({ message: 'Faltan campos requeridos (legacy): id_proveedor, objeto_contrato, monto_total.' }, { status: 400 });
        }
        if (isNaN(parseFloat(legacyData.monto_total))) {
            return NextResponse.json({ message: 'El campo monto_total (legacy) debe ser un número válido.' }, { status: 400 });
        }

        try {
            // Llamar al servicio ORIGINAL
            const nuevoContrato = await createContract(legacyData);

            return NextResponse.json(nuevoContrato, { status: 201 });

        } catch (error: any) {
            console.error("API Route POST /api/contratos Error processing legacy data:", error);
            let status = 500;
            let message = error.message || 'Error inesperado al crear el contrato (legacy).';
            if (message.includes("requerido") || message.includes("inválido")) status = 400;
            else if (error.code === '23503') { status = 400; message = `Error de referencia (legacy).`; }
            else if (error.code === '23505') { status = 409; message = `Conflicto valor único (legacy).`; }
            return NextResponse.json({ message }, { status });
        }
    }
}

// --- PUT, DELETE (sin cambios necesarios aquí, ya operan sobre un contrato existente por ID) ---
// export async function PUT(req: NextRequest, { params }: RouteContext) { ... }
// export async function DELETE(req: NextRequest, { params }: RouteContext) { ... }