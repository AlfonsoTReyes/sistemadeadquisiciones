// src/app/api/proveedores/route.ts (Revisado para claridad y consistencia de nombres)

import { NextRequest, NextResponse } from 'next/server';
// Asegúrate que la ruta y nombres de funciones sean correctos según tu servicio ACTUAL
import {
    getProveedorById, // Asumiendo que aún existe o la necesitas para el GET por id_proveedor
    getProveedorByUserId,
    updateProveedorEstatus // Nombre actual de la función que SÓLO actualiza estatus
    // updateProveedorCompleto // Si necesitas una función para actualización completa para este PUT
} from '../../../services/adminproveedoresservice'; // AJUSTA RUTA

// --- GET (Obtener UN proveedor por ID o UserID) ---
export async function GET(req: NextRequest) {
    // ... (Tu lógica GET existente está bien para obtener un solo proveedor)
    try {
      const { searchParams } = new URL(req.url);
      const id_proveedor  = searchParams.get('id_proveedor');
      const id_usuario_proveedor = searchParams.get('id_usuario_proveedor');

      if (id_usuario_proveedor) {
        const userIdNum = parseInt(id_usuario_proveedor, 10);
        if (isNaN(userIdNum)) return NextResponse.json({ message: 'ID de usuario proveedor inválido' }, { status: 400 });
        const proveedor = await getProveedorByUserId(userIdNum); // Llama a servicio
        if (!proveedor) return NextResponse.json({ message: 'Perfil no encontrado' }, { status: 404 });
        return NextResponse.json(proveedor);

      } else if (id_proveedor) {
         const providerIdNum = parseInt(id_proveedor, 10);
         if (isNaN(providerIdNum)) return NextResponse.json({ message: 'ID de proveedor inválido' }, { status: 400 });
         // Necesitas asegurarte que getProveedorById exista y funcione si usas esta rama
         // const proveedor = await getProveedorById(providerIdNum); // Llama a servicio
         // if (!proveedor) return NextResponse.json({ message: 'Proveedor no encontrado' }, { status: 404 });
         // return NextResponse.json(proveedor);
         // Si getProveedorById no existe o no es relevante aquí, elimina esta rama o ajústala
          return NextResponse.json({ message: 'GET por id_proveedor no implementado o servicio no disponible' }, { status: 501 });


      } else {
         return NextResponse.json({ message: 'Se requiere id_proveedor o id_usuario_proveedor' }, { status: 400 });
      }

  } catch (error: any) {
     console.error("GET /api/proveedores Error:", error);
     return NextResponse.json({ message: 'Error al obtener proveedor', error: error.message }, { status: 500 });
  }
}

// --- PUT (Actualización desde el dashboard del proveedor - ¡REVISAR SERVICIO!) ---
export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const { id_proveedor, estatus, ...restoData } = data; // Separar ID, estatus y el resto

        console.log(`DEBUG PUT /api/proveedores - ID: ${id_proveedor}, Estatus recibido: ${estatus}`);

        if (!id_proveedor || typeof id_proveedor !== 'number') {
            return NextResponse.json({ message: 'ID de proveedor inválido' }, { status: 400 });
        }

        // --- INCONSISTENCIA POTENCIAL ---
        // La función del servicio 'updateProveedorEstatus' SÓLO actualiza el estatus.
        // Si este PUT debe hacer una actualización completa (usando restoData),
        // NECESITAS llamar a una función de servicio diferente (ej: updateProveedorCompleto).
        // Por ahora, llamará a la función de estatus si 'estatus' está presente.
        if (typeof estatus === 'boolean') {
             const proveedorActualizado = await updateProveedorEstatus(id_proveedor, estatus);
             return NextResponse.json(proveedorActualizado);
        } else {
            // Aquí iría la lógica para llamar a updateProveedorCompleto(id_proveedor, restoData)
            // si esa funcionalidad es necesaria para este endpoint PUT.
             console.warn(`PUT /api/proveedores - Recibió datos pero no un estatus booleano claro. No se realizó acción de estatus. Implementar actualización completa si es necesario.`);
             return NextResponse.json({ message: 'Operación PUT no configurada para actualización completa o estatus inválido.' }, { status: 400 });
        }
        // --- FIN INCONSISTENCIA ---

    } catch (error: any) {
        console.error("ERROR PUT /api/proveedores:", error);
        if (error.message.includes("no encontrado para actualizar")) {
             return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Error al procesar la solicitud PUT', error: error.message }, { status: 500 });
    }
}