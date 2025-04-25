// src/lib/pusher-server.ts (o donde prefieras poner tus utilidades de servidor)

import PusherServer from 'pusher';

// Validar que las variables de entorno existan
if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET || !process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  throw new Error("Faltan variables de entorno de Pusher en el servidor.");
}

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!, // Puede leer la pública si está definida
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true // Siempre usa TLS (https)
});

console.log("Pusher Server instance initialized."); // Log para confirmar inicialización

// Opcional: Función helper para disparar eventos (abstrae la llamada)
export const triggerPusherEvent = async (channel: string, event: string, data: any) => {
    try {
        console.log(`PUSHER SERVER: Triggering event '${event}' on channel '${channel}'`);
        await pusherServer.trigger(channel, event, data);
        console.log(`PUSHER SERVER: Event '${event}' triggered successfully.`);
    } catch (error) {
        console.error(`PUSHER SERVER ERROR triggering event '${event}' on channel '${channel}':`, error);
        // Decide cómo manejar el error (log, reintentar, etc.)
        // No relanzar para no detener la lógica principal del servicio si la notificación falla.
    }
};