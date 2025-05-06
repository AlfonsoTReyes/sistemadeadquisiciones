// src/hooks/usePusherNotifications.tsx (Versión final de la respuesta anterior)
import React from 'react';
import { useEffect, useRef } from 'react';
import PusherClient from 'pusher-js';
import toast from 'react-hot-toast';

interface NotificationPayload {
    id_notificacion: number;
    mensaje: string;
    fue_leida?: boolean;
    // Otros campos...
}

interface UsePusherNotificationsProps {
    userId: number | null;
    eventName?: string;
    enabled?: boolean;
    onNotificationReceived: (notification: NotificationPayload) => void;
}

export function usePusherNotifications({
    userId,
    eventName = 'nueva-notificacion', // Evento genérico para el usuario
    enabled = true,
    onNotificationReceived,
}: UsePusherNotificationsProps) {

    const pusherClientRef = useRef<PusherClient | null>(null);
    const channelRef = useRef<any>(null);
    const currentSubscription = useRef<string | null>(null);

    useEffect(() => {
        const targetChannel = userId ? `user-notifications-${userId}` : null;

        if (!enabled || !targetChannel || !process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            // ... (lógica de validación y desconexión si no es válido) ...
            if (pusherClientRef.current) {
                pusherClientRef.current.disconnect();
                pusherClientRef.current = null; channelRef.current = null; currentSubscription.current = null;
            }
            return;
        }

        if (pusherClientRef.current && currentSubscription.current === targetChannel) {
            return; // Ya conectado
        }

        if (pusherClientRef.current) {
            pusherClientRef.current.disconnect(); // Desconectar anterior
        }

        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        console.log(`PusherNotifications Hook: Inicializando Pusher para canal ${targetChannel}...`);

        try {
            const client = new PusherClient(pusherKey, { cluster: pusherCluster });
            pusherClientRef.current = client;

            const channel = client.subscribe(targetChannel);
            channelRef.current = channel;
            currentSubscription.current = targetChannel;

            channel.bind('pusher:subscription_succeeded', () => {
                console.log(`PusherNotifications Hook: Suscrito exitosamente a ${targetChannel}`);
            });

            channel.bind('pusher:subscription_error', (status: any) => {
                console.error(`PusherNotifications Hook: Error de suscripción a ${targetChannel}:`, status);
                toast.error(`Error al conectar con notificaciones (${status?.status})`);
                // Limpiar referencias si la suscripción falla para permitir reintentos
                pusherClientRef.current?.disconnect(); // Desconectar si falla
                pusherClientRef.current = null;
                channelRef.current = null;
                currentSubscription.current = null;
            });

            const handleEvent = (data: any) => {
                console.log(`PusherNotifications Hook: Evento '${eventName}' recibido en ${targetChannel}:`, data);
                if (!data || typeof data.id_notificacion !== 'number' || typeof data.mensaje !== 'string') {
                    console.warn("PusherNotifications Hook: Payload inválido:", data); return;
                }
                const newNotification: NotificationPayload = {
                    id_notificacion: data.id_notificacion,
                    mensaje: data.mensaje,
                    fue_leida: data.fue_leida ?? false,
                };
                // Mostrar Toast (opcional, podría hacerse en el manager)
                toast(
                    (t) => (
                        <div onClick={() => toast.dismiss(t.id)} style={{ cursor: 'pointer' }}>
                            <p className="font-semibold">Notificación</p>
                            <p>{displayMessage}{statusUpdate}</p>
                        </div>
                    ),
                    {
                        duration: 8000,
                        icon: '🔔',
                    }
                );
                // Llamar al callback
                onNotificationReceived(newNotification);
            };

            channel.bind(eventName, handleEvent);

            return () => { // Limpieza
                const clientInstance = pusherClientRef.current;
                const channelInstance = channelRef.current;
                const subscribedChannelName = currentSubscription.current;
                if (clientInstance && channelInstance && subscribedChannelName === targetChannel) {
                    try {
                        channelInstance.unbind(eventName, handleEvent);
                        clientInstance.unsubscribe(subscribedChannelName);
                        channelRef.current = null; currentSubscription.current = null;
                    } catch (error) {
                        console.error("PusherNotifications Hook: Error durante la limpieza:", error);
                    }
                }
            };
        } catch (error) {
            console.error(`PusherNotifications Hook: Error al inicializar Pusher o suscribirse a ${targetChannel}:`, error);
            toast.error("Error al inicializar notificaciones.");
            // Asegurarse de limpiar referencias si la inicialización falla
            pusherClientRef.current = null;
            channelRef.current = null;
            currentSubscription.current = null;
        }

    }, [userId, eventName, enabled, onNotificationReceived]);
}