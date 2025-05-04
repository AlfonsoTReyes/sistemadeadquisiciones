// src/hooks/usePusherNotifications.tsx // <--- RENOMBRADO A .tsx
import React from 'react'; // <--- AÑADIDO IMPORT REACT
import { useEffect, useRef } from 'react';
import PusherClient from 'pusher-js';
import toast from 'react-hot-toast';

interface UsePusherNotificationsProps {
    providerId: number | null;
    channelPrefix?: string;
    eventName?: string;
    enabled?: boolean;
}

export function usePusherNotifications({
    providerId,
    channelPrefix = 'proveedor-updates-',
    eventName = 'cambio_estado_proveedor',
    enabled = true,
}: UsePusherNotificationsProps) {

    const pusherClientRef = useRef<PusherClient | null>(null);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!enabled || !providerId || !process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            // ... (lógica de verificación y desconexión inicial)
            if (enabled && providerId && (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER)) {
                console.warn("PusherNotifications Hook: Claves de Pusher no configuradas en .env.local");
            }
            if (pusherClientRef.current) {
                console.log("PusherNotifications Hook: Desconectando cliente Pusher existente.");
                pusherClientRef.current.disconnect();
                pusherClientRef.current = null;
                channelRef.current = null;
            }
            return;
        }

        // Evitar reconexiones innecesarias si ya está conectado al mismo canal
        if (pusherClientRef.current && channelRef.current?.name === `${channelPrefix}${providerId}`) {
            console.log(`PusherNotifications Hook: Ya suscrito al canal ${channelRef.current.name}.`);
            return;
        }

        // Desconectar cliente anterior si existe (p.ej., si cambió el providerId)
        if (pusherClientRef.current) {
            console.log("PusherNotifications Hook: Desconectando cliente Pusher anterior...");
            pusherClientRef.current.disconnect();
        }

        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY!; // Usar ! si estás seguro que existen
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;
        const channelName = `${channelPrefix}${providerId}`;

        console.log(`PusherNotifications Hook: Inicializando Pusher para canal ${channelName}...`);

        const client = new PusherClient(pusherKey, { cluster: pusherCluster });
        pusherClientRef.current = client;

        const channel = client.subscribe(channelName);
        channelRef.current = channel; // Guardar referencia

        channel.bind('pusher:subscription_succeeded', () => {
            console.log(`PusherNotifications Hook: Suscrito exitosamente a ${channelName}`);
        });

        channel.bind('pusher:subscription_error', (status: any) => {
            console.error(`PusherNotifications Hook: Error de suscripción a ${channelName}:`, status);
            toast.error(`Error al conectar con notificaciones (${status?.status})`); // Toast de error
        });

        // --- Manejador de eventos ---
        const handleEvent = (data: any) => {
            console.log(`PusherNotifications Hook: Evento '${eventName}' recibido en ${channelName}:`, data);

            if (data?.idProveedor && data.idProveedor !== providerId) {
                console.warn(`PusherNotifications Hook: Evento ignorado, ID no coincide (esperado ${providerId}, recibido ${data.idProveedor}).`);
                return;
            }

            const displayMessage = data?.mensaje || `Actualización recibida: ${JSON.stringify(data)}`;
            const statusUpdate = data?.nuevoEstatus ? ` Nuevo estado: ${data.nuevoEstatus}` : '';

            // *** El JSX que causaba el error ***
            toast( // <--- LLAMAR A LA FUNCIÓN BASE toast()
                (t) => (
                    <div onClick={() => toast.dismiss(t.id)} style={{ cursor: 'pointer' }}>
                        <p className="font-semibold">Notificación</p>
                        <p>{displayMessage}{statusUpdate}</p>
                    </div>
                ),
                {
                    // Opciones del toast (se mantienen igual)
                    duration: 8000,
                    icon: '🔔', // Puedes usar un icono diferente si prefieres
                    // id: `notif-${Date.now()}` // Opcional: ID único si necesitas control programático
                }
            );

            channel.bind(eventName, handleEvent);
        };
            // --- Función de Limpieza ---
            return () => {
                // ... (lógica de limpieza sin cambios)
                if (pusherClientRef.current && channelRef.current) {
                    const currentChannelName = channelRef.current.name;
                    console.log(`PusherNotifications Hook: Limpiando suscripción a ${currentChannelName}`);
                    try {
                        channelRef.current.unbind(eventName, handleEvent);
                        pusherClientRef.current.unsubscribe(currentChannelName);
                        console.log(`PusherNotifications Hook: Desuscrito de ${currentChannelName}`);
                    } catch (error) {
                        console.error("PusherNotifications Hook: Error durante la limpieza:", error);
                    }
                }
            };

        }, [providerId, channelPrefix, eventName, enabled]);
} // Fin del hook