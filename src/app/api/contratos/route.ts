// src/app/api/contratos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
    getContracts,
    createContract,
} from '@/services/contratosService'; // Servicio de contratos
import { ContratoCreateData } from '@/types/contrato';

// *** IMPORTANTE: Importa la función necesaria del servicio de proveedores ***
import { getProveedorByUserId, getProveedoresForSelect  } from '@/services/proveedoresservice'; // Ajusta la ruta si es necesario

// --- GET: Obtener lista de contratos ---
// Ahora puede filtrar por 'idProveedor' (directo, ¿admin?) O por 'userId' (proveedor logueado)
export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const idProveedorParam = searchParams.get('idProveedor'); // Para llamadas directas o admin
    const userIdParam = searchParams.get('userId'); // <-- NUEVO: Para buscar por usuario logueado

    console.log(`API Route GET /api/contratos called. idProveedorParam: ${idProveedorParam}, userIdParam: ${userIdParam}`);

    try {
        const filters: Parameters<typeof getContracts>[0] = {};
        let idProveedorFiltrar: number | null = null;

        // --- Lógica de Filtrado ---
        if (userIdParam) {
            // Prioridad 1: Filtrar por ID de Usuario (buscar perfil y obtener id_proveedor)
            const userId = parseInt(userIdParam, 10);
            if (isNaN(userId)) {
                return NextResponse.json({ message: 'Parámetro "userId" debe ser un número válido.' }, { status: 400 });
            }
            console.log(`API GET /contratos: Buscando perfil para User ID: ${userId}`);
            try {
                const perfilProveedor = await getProveedorByUserId(userId); // Llama al servicio de proveedores
                if (perfilProveedor && perfilProveedor.id_proveedor != null) {
                    idProveedorFiltrar = perfilProveedor.id_proveedor;
                    console.log(`API GET /contratos: Perfil encontrado. Filtrando por Proveedor ID: ${idProveedorFiltrar}`);
                } else {
                    // Usuario existe pero no tiene perfil de proveedor, o el ID es null?
                    console.log(`API GET /contratos: No se encontró perfil de proveedor (o ID nulo) para User ID: ${userId}. Se devolverá lista vacía.`);
                    // Si no hay proveedor asociado, no tendrá contratos. Devolver vacío.
                    return NextResponse.json([]);
                }
            } catch (profileError: any) {
                 // Error al buscar el perfil
                console.error(`API GET /contratos: Error buscando perfil para User ID ${userId}:`, profileError);
                 // Podríamos devolver un error 500 o también una lista vacía
                 // Devolver error 500 puede ser más informativo si algo falla internamente
                 return NextResponse.json({ message: `Error interno al buscar perfil del proveedor: ${profileError.message}` }, { status: 500 });
            }

        } else if (idProveedorParam) {
            // Prioridad 2: Filtrar directamente por ID Proveedor (llamada admin/directa)
            const idProveedor = parseInt(idProveedorParam, 10);
            if (isNaN(idProveedor)) {
                return NextResponse.json({ message: 'Parámetro "idProveedor" debe ser un número válido.' }, { status: 400 });
            }
            idProveedorFiltrar = idProveedor;
            console.log(`API GET /contratos: Filtrando directamente por Proveedor ID ${idProveedorFiltrar} (confiando en cliente).`);
        } else {
            // Sin filtro: Obtener todos (simula admin, ¡inseguro!)
            console.log("API GET /contratos: Obteniendo todos los contratos (sin filtro). ¡ACCESO INSEGURO SI NO SE CONTROLA EN FRONTEND!");
        }

        // --- Aplicar filtro (si se determinó un ID) y llamar al servicio de contratos ---
        if (idProveedorFiltrar !== null) {
            filters.id_proveedor = idProveedorFiltrar;
        }

        const contratos = await getContracts(filters);
        return NextResponse.json(contratos);

    } catch (error: any) {
        // Captura errores de getContracts o errores no manejados antes
        console.error("API Route GET /api/contratos Error General:", error);
        return NextResponse.json({ message: error.message || 'Error al obtener la lista de contratos.' }, { status: 500 });
    }
}

// --- POST: Crear un nuevo contrato ---
// Este manejador NO necesita cambios, ya que recibe el id_proveedor directamente en el body.
// La responsabilidad de saber qué id_proveedor enviar recae en el frontend
// (que previamente habrá llamado a fetchProveedorByUserId).
export async function POST(req: NextRequest) {
    console.log("API Route POST /api/contratos called (SIN VERIFICACIÓN DE ROL)");
    try {
        let body: ContratoCreateData;
        try {
            body = await req.json();
        } catch (jsonError) {
            return NextResponse.json({ message: 'Error en el formato JSON.' }, { status: 400 });
        }

        console.log("API Route POST: Received data:", JSON.stringify(body, null, 2));

        if (!body.id_proveedor || !body.objeto_contrato || !body.monto_total) {
            return NextResponse.json({ message: 'Faltan campos requeridos: id_proveedor, objeto_contrato, monto_total.' }, { status: 400 });
        }
        if (isNaN(parseFloat(body.monto_total))) {
             return NextResponse.json({ message: 'El campo monto_total debe ser un número válido.' }, { status: 400 });
        }

        const nuevoContrato = await createContract(body);

        console.log("API Route POST: Contrato creado con ID:", nuevoContrato.id_contrato);
        return NextResponse.json(nuevoContrato, { status: 201 });

    } catch (error: any) {
        console.error("API Route POST /api/contratos Error:", error);
        let status = 500;
        let message = error.message || 'Error inesperado al crear el contrato.';
        if (message.includes("requerido") || message.includes("inválido")) status = 400;
        else if (error.code === '23503') { status = 400; message = `Error de referencia: Verifique que el proveedor y otros IDs existan.`; }
        else if (error.code === '23505') { status = 409; message = `Conflicto: Ya existe un registro con uno de los valores únicos (ej: número de contrato).`; }
        else if (error instanceof SyntaxError) { status = 400; message = 'Error: Formato JSON inválido.'; }
        return NextResponse.json({ message }, { status });
    }
}