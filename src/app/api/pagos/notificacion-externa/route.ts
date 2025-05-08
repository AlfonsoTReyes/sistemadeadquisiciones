// app/api/pagos/notificacion-externa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { marcarPagoConfirmadoExternamente } from '@/services/pago/pagoLocalService'; // Necesitas crear esta función
// import { pusherServer } from '@/lib/pusherServer'; // Si usas Pusher para notificar al cliente

const SHARED_SECRET = process.env.NEXTJS_NOTIFICATION_SECRET; // Secreto opcional para validar

export async function POST(request: NextRequest) {

    // 1. Validación de Seguridad (Opcional pero recomendado)
    if (SHARED_SECRET) {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || authHeader !== `Bearer ${SHARED_SECRET}`) {
             console.warn("Notificación Externa: Intento de acceso no autorizado.");
             return NextResponse.json({ status: 'error', message: 'No autorizado' }, { status: 401 });
        }
    }

    try {
        const body = await request.json();

        const { referencia, estado, pago_id_modulo_php, /* otros datos */ } = body;

        if (!referencia || !estado) {
             console.error("Notificación Externa: Faltan datos (referencia o estado).");
             return NextResponse.json({ status: 'error', message: 'Datos incompletos' }, { status: 400 });
        }

        // 2. Actualizar la base de datos local (NeonDB)
        // Asumiendo que 'estado' viene como 'Pagado' o 'Rechazado' del PHP
        const success = await marcarPagoConfirmadoExternamente(
            referencia,
            estado, // 'Pagado' o 'Rechazado'
            pago_id_modulo_php,
            // podrías pasar el recibo JSON aquí si el PHP lo enviara
        );

        if (!success) {
            console.error(`Notificación Externa: Falló la actualización en BD local para ref ${referencia}`);
            // Podrías decidir si esto es un error 500 o si igual respondes 200 OK al PHP
             return NextResponse.json({ status: 'error', message: 'Error al actualizar BD local' }, { status: 500 });
        }


        // 3. (Opcional) Notificar al cliente via Pusher
        // if (pusherServer && estado === 'Pagado') { // O el estado de éxito
        //     try {
        //         // Elige un canal apropiado (ej: basado en usuario o sesión)
        //         const channelName = `private-user-${id_usuario}`; // Necesitarías el ID de usuario
        //         const eventName = 'pago-confirmado';
        //         await pusherServer.trigger(channelName, eventName, {
        //             referencia: referencia,
        //             message: 'Tu pago ha sido confirmado.'
        //         });
        //     } catch (pusherError: any) {
        //         console.error("Notificación Externa: Error enviando evento Pusher:", pusherError);
        //     }
        // }

        // 4. Responder OK al webhook PHP
        return NextResponse.json({ status: 'success', message: 'Notificación recibida y procesada' }, { status: 200 });

    } catch (error: any) {
        console.error("Error en /api/pagos/notificacion-externa:", error);
        return NextResponse.json({ status: 'error', message: error.message || 'Error interno del servidor al procesar notificación.' }, { status: 500 });
    }
}