// src/hooks/usePusherNotifications.tsx
import React from 'react';
import { useEffect, useRef } from 'react';
import PusherClient from 'pusher-js';
import toast from 'react-hot-toast';

interface UsePusherNotificationsProps {
    providerId?: number | null;      // ID del proveedor (opcional)
    channelName?: string;           // Nombre fijo del canal (opcional)
    channelPrefix?: string;         // Prefijo si se usa providerId (por defecto)
    eventName?: string;             // Evento a escuchar (por defecto)
    enabled?: boolean;              // Habilitar/deshabilitar
}

export function usePusherNotifications({
    providerId,
    channelName: fixedChannelName, // Renombrar para claridad interna
    channelPrefix = 'proveedor-updates-',
    eventName = 'cambio_estado_proveedor',
    enabled = true,
}: UsePusherNotificationsProps) {

    const pusherClientRef = useRef<PusherClient | null>(null);
    const channelRef = useRef<any>(null);
    const currentSubscription = useRef<string | null>(null); // Para rastrear a qué canal estamos suscritos

    useEffect(() => {
        // --- Determinar el canal objetivo ---
        let targetChannel: string | null = null;
        if (fixedChannelName) {
            targetChannel = fixedChannelName;
        } else if (providerId) {
            targetChannel = `${channelPrefix}${providerId}`;
        }

        // --- Validaciones y Condiciones de Salida ---
        // Salir si no está habilitado
        if (!enabled) {
            // Desconectar si existía una conexión previa y ahora está deshabilitado
            if (pusherClientRef.current) {
                console.log(`PusherNotifications Hook: Deshabilitado. Desconectando cliente Pusher existente (Canal: ${currentSubscription.current}).`);
                pusherClientRef.current.disconnect();
                pusherClientRef.current = null;
                channelRef.current = null;
                currentSubscription.current = null;
            }
            return;
        }

        // Salir si está habilitado pero no hay canal válido (ni fijo ni dinámico)
        if (!targetChannel) {
            console.warn("PusherNotifications Hook: Habilitado pero sin 'channelName' o 'providerId' válido.");
            if (pusherClientRef.current) { // Desconectar si había conexión previa
                console.log(`PusherNotifications Hook: Sin canal válido. Desconectando cliente Pusher existente (Canal: ${currentSubscription.current}).`);
                pusherClientRef.current.disconnect();
                pusherClientRef.current = null;
                channelRef.current = null;
                currentSubscription.current = null;
            }
            return;
        }

        // Salir si faltan las claves de Pusher
        if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
            console.error("PusherNotifications Hook: Claves de Pusher no configuradas en .env.local");
            // Considera mostrar un toast de error aquí si es crítico
            // toast.error("Error de configuración: Notificaciones no disponibles.");
            if (pusherClientRef.current) { // Desconectar si había conexión previa
                console.log(`PusherNotifications Hook: Faltan claves Pusher. Desconectando cliente Pusher existente (Canal: ${currentSubscription.current}).`);
                pusherClientRef.current.disconnect();
                pusherClientRef.current = null;
                channelRef.current = null;
                currentSubscription.current = null;
            }
            return;
        }

        // --- Lógica de Conexión/Suscripción ---

        // Evitar reconexiones innecesarias si ya está conectado al MISMO canal
        if (pusherClientRef.current && currentSubscription.current === targetChannel) {
            console.log(`PusherNotifications Hook: Ya suscrito al canal ${targetChannel}.`);
            return;
        }

        // Si estamos intentando conectar a un canal diferente o es la primera vez,
        // desconectar cliente anterior si existe.
        if (pusherClientRef.current) {
            console.log(`PusherNotifications Hook: Cambiando de canal (o reconectando). Desconectando cliente Pusher anterior (Canal: ${currentSubscription.current})...`);
            pusherClientRef.current.disconnect(); // Desconecta completamente
            pusherClientRef.current = null; // Limpia la referencia
            channelRef.current = null;
            currentSubscription.current = null;
        }

        // --- Inicializar y Suscribir ---
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        console.log(`PusherNotifications Hook: Inicializando Pusher para canal ${targetChannel}...`);

        try {
            const client = new PusherClient(pusherKey, { cluster: pusherCluster });
            pusherClientRef.current = client; // Guardar referencia del nuevo cliente

            const channel = client.subscribe(targetChannel);
            channelRef.current = channel; // Guardar referencia del canal
            currentSubscription.current = targetChannel; // Actualizar suscripción actual

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

            // --- Manejador de eventos ---
            const handleEvent = (data: any) => {
                console.log(`PusherNotifications Hook: Evento '${eventName}' recibido en ${targetChannel}:`, data);

                // Validar ID solo si nos suscribimos usando providerId (canal dinámico)
                if (!fixedChannelName && providerId && data?.idProveedor && data.idProveedor !== providerId) {
                    console.warn(`PusherNotifications Hook: Evento ignorado, ID no coincide (esperado ${providerId}, recibido ${data.idProveedor}).`);
                    return;
                }
                // Si es un canal fijo (admin), asumimos que todos los eventos son relevantes
                // o la validación debe hacerse basada en otro campo dentro de 'data'.

                const displayMessage = data?.mensaje || `Actualización recibida: ${JSON.stringify(data)}`;
                const statusUpdate = data?.nuevoEstatus ? ` Nuevo estado: ${data.nuevoEstatus}` : '';

                // Mostrar TOAST
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
                // Aquí NO se debe volver a hacer channel.bind
            };

            // Vincular el handler al evento específico
            channel.bind(eventName, handleEvent);

            // --- Función de Limpieza ---
            return () => {
                // Usar las referencias guardadas en el momento de la suscripción
                const clientInstance = pusherClientRef.current;
                const channelInstance = channelRef.current;
                const subscribedChannelName = currentSubscription.current;

                if (clientInstance && channelInstance && subscribedChannelName === targetChannel) { // Asegurarse que limpiamos la suscripción correcta
                    console.log(`PusherNotifications Hook: Limpiando suscripción a ${subscribedChannelName}`);
                    try {
                        // Intentar desvincular el handler específico
                        channelInstance.unbind(eventName, handleEvent);
                        // Intentar desuscribir del canal
                        clientInstance.unsubscribe(subscribedChannelName);
                        console.log(`PusherNotifications Hook: Desuscrito de ${subscribedChannelName}`);
                        // Considerar desconectar el cliente si ya no hay más suscripciones activas
                        // (más complejo de manejar si hay múltiples usos del hook)
                        // clientInstance.disconnect();
                        // console.log("PusherNotifications Hook: Cliente Pusher desconectado.");

                        // Limpiar referencias después de desuscribir/desconectar
                        // pusherClientRef.current = null; // No limpiar si se puede reusar la conexión
                        channelRef.current = null;
                        currentSubscription.current = null;

                    } catch (error) {
                        console.error("PusherNotifications Hook: Error durante la limpieza:", error);
                    }
                } else {
                    console.log(`PusherNotifications Hook: Limpieza omitida, no suscrito a ${targetChannel} o referencias no válidas.`);
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

        // Dependencias: Reaccionar si cambian las props que determinan la conexión
    }, [providerId, fixedChannelName, channelPrefix, eventName, enabled]);

} // Fin del hook