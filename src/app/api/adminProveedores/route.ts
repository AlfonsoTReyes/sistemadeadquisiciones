import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProveedoresForAdmin,
  getProveedorProfileByIdForAdmin,
  updateProveedorEstatus,
  updateProveedorProfileForAdmin,
  getUsuarioProveedorByProveedorId,
  updateUsuarioProveedor
} from '@/services/adminproveedoresservice';

// GET: Obtener TODOS los proveedores o UNO específico por ID
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const idProveedorParam = searchParams.get('id_proveedor');
  const idProveedorUsuarioParam = searchParams.get('id_proveedor_usuario');

  if (idProveedorUsuarioParam) {
    const idProveedorUsuario = parseInt(idProveedorUsuarioParam, 10);

    if (isNaN(idProveedorUsuario)) {
      return NextResponse.json({ message: 'El parámetro "id_proveedor_usuario" debe ser un número válido.' }, { status: 400 });
    }

    try {
      const usuarioProveedor = await getUsuarioProveedorByProveedorId(idProveedorUsuario);
      if (!usuarioProveedor) {
        return NextResponse.json({ message: 'Usuario proveedor no encontrado.' }, { status: 404 });
      }
      return NextResponse.json(usuarioProveedor);
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Error al obtener usuario proveedor.' },
        { status: 500 }
      );
    }
  } else if (idProveedorParam) {
    const idProveedor = parseInt(idProveedorParam, 10);

    if (isNaN(idProveedor)) {
      return NextResponse.json({ message: 'El parámetro "id_proveedor" debe ser un número válido.' }, { status: 400 });
    }

    try {
      const proveedor = await getProveedorProfileByIdForAdmin(idProveedor);
      return NextResponse.json(proveedor);
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Error al obtener el perfil del proveedor.' },
        { status: error.message.includes("no encontrado") ? 404 : 500 }
      );
    }
  } else {
    try {
      const proveedores = await getAllProveedoresForAdmin();
      return NextResponse.json(proveedores);
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Error al obtener la lista de proveedores.' },
        { status: 500 }
      );
    }
  }
}

// PUT: Actualizar ESTATUS o PERFIL COMPLETO de un proveedor o usuario proveedor
export async function PUT(req: NextRequest) {
  let requestData; // Para poder loguear incluso si req.json() falla
  try {
    requestData = await req.json();
    // Loguea los datos recibidos ANTES de cualquier lógica
    console.log("API Route PUT received data:", JSON.stringify(requestData, null, 2));

    const data = requestData; // Usar una variable más limpia después del parseo

    // --- Determina el tipo de Actualización ---
    // Es más claro verificar primero si es una actualización de usuario
    if ('id_usuario' in data && typeof data.id_usuario === 'number') {
        console.log("API Route: Handling User Update for user:", data.id_usuario);
        // Llama al servicio updateUsuarioProveedor. Este servicio ahora espera todos los
        // campos necesarios (usuario, nombre, etc.) y maneja la contraseña internamente.
        const usuarioProveedorActualizado = await updateUsuarioProveedor(data);
        // El servicio ya no debería devolver la contraseña si usaste RETURNING específico
        return NextResponse.json(usuarioProveedorActualizado);

    } else if ('id_proveedor' in data && typeof data.id_proveedor === 'number') {
        // Si no es usuario, verifica si es proveedor (perfil o estatus)
        const isProfileUpdate = 'tipoProveedor' in data; // Una forma simple de identificar actualización de perfil
        // Se considera actualización de estatus si SOLO vienen id_proveedor y estatus
        const isStatusUpdateOnly = 'estatus' in data && Object.keys(data).length === 2;

        if (isProfileUpdate) {
            console.log("API Route: Handling Profile Update for provider:", data.id_proveedor);
            // Llama al servicio de actualización de perfil del proveedor
            const proveedorActualizado = await updateProveedorProfileForAdmin(data);
            return NextResponse.json(proveedorActualizado);
        } else if (isStatusUpdateOnly) {
            console.log("API Route: Handling Estatus Update for provider:", data.id_proveedor);
            // Llama al servicio de actualización de estatus
             if (typeof data.estatus !== 'string' && typeof data.estatus !== 'boolean') { // Adapta el tipo según lo que esperes
                 return NextResponse.json({ message: 'Valor de "estatus" inválido para actualización de estatus.' }, { status: 400 });
            }
            const proveedorActualizado = await updateProveedorEstatus(data.id_proveedor, data.estatus);
            return NextResponse.json(proveedorActualizado);
        } else {
             // Tiene id_proveedor pero no es claramente ni perfil ni solo estatus
             console.error("API Route: Ambiguous or invalid PUT request for provider:", data);
             return NextResponse.json({ message: 'Solicitud de actualización para proveedor no válida (estructura no reconocida).' }, { status: 400 });
        }
    } else {
      // La solicitud no contiene ni 'id_usuario' válido ni 'id_proveedor' válido
      console.error("API Route: Invalid PUT request structure. Missing valid id_usuario or id_proveedor.", data);
      return NextResponse.json({ message: 'Solicitud de actualización no válida. Se requiere un id_usuario o id_proveedor numérico válido.' }, { status: 400 });
    }

  } catch (error: any) {
     // --- Manejo de Errores Mejorado ---
     console.error("API Route PUT Error Caught:", error); // Loguea el error completo

     let status = 500; // Por defecto es error interno
     let message = 'Ocurrió un error inesperado al procesar la solicitud.';

     // Errores específicos lanzados desde el servicio
     if (error.message) {
         message = error.message; // Usa el mensaje del error lanzado
         if (error.message.includes("no encontrado")) {
             status = 404; // Not Found
         } else if (error.message.includes("ya está en uso")) {
             status = 409; // Conflict (dato duplicado)
         } else if (error.message.includes("requerido") || error.message.includes("inválido") || error.message.includes("syntax error") || error.message.includes("Error de base de datos") || error.message.includes("configuración interna")) {
             status = 400; // Bad Request (fallo de validación, sintaxis SQL, constraint, etc.)
         }
         // Puedes añadir más códigos de error específicos de PostgreSQL si es necesario (e.g., error.code)
     }

     // Error al parsear el JSON de entrada
     if (error instanceof SyntaxError && error.message.includes('JSON')) {
         status = 400;
         message = 'Error: El formato del cuerpo de la solicitud (JSON) es inválido.';
     }

     console.error(`API Route PUT Responding with Status: ${status}, Message: "${message}"`);
     return NextResponse.json({ message: message }, { status });
  }
}