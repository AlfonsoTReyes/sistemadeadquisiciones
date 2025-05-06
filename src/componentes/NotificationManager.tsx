// src/components/NotificationManager.tsx (NUEVO ARCHIVO)
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck } from "@fortawesome/free-solid-svg-icons";
import { usePusherNotifications } from '@/hooks/usePusherNotifications'; // Ajusta ruta
import toast from 'react-hot-toast'; // Para mostrar toasts aquí si se desea

// Interfaz para el objeto notificación manejado en el estado
interface NotificationItem {
    id_notificacion: number;
    mensaje: string;
    fue_leida: boolean;
    fecha_creacion?: string;
}

interface NotificationManagerProps {
    userId: number | null;
    idRol: string | null; // Puede ser string o null
}

export default function NotificationManager({ userId, idRol }: NotificationManagerProps) {
    const [mostrarDropdown, setMostrarDropdown] = useState(false);
    const [notificaciones, setNotificaciones] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Carga inicial de notificaciones
    const cargarNotificacionesIniciales = useCallback(async () => {
        // Solo cargar si tenemos algún identificador
        if (!userId && !idRol) {
            setNotificaciones([]); // Asegurar lista vacía si no hay IDs
            return;
        }

        setIsLoading(true);
        setError(null);
        console.log(`NotificationManager: Cargando iniciales para User ${userId}, Rol ${idRol}`);

        const params = new URLSearchParams();
        if (userId) params.append('idusuario', userId.toString());
        if (idRol) params.append('idrol', idRol); // La API espera 'idrol'

        try {
            const res = await fetch(`/api/notificaciones?${params.toString()}`); // Usar la API unificada
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error ${res.status}`);
            }
            const data = await res.json();
            const nuevasNotificaciones = (data.notificaciones || []).map((n: any): NotificationItem => ({
                id_notificacion: n.id_notificacion,
                mensaje: n.mensaje,
                fue_leida: n.fue_leida ?? false,
                fecha_creacion: n.fecha_creacion,
            }));
            setNotificaciones(nuevasNotificaciones);
            console.log(`NotificationManager: ${nuevasNotificaciones.length} notificaciones iniciales cargadas.`);
        } catch (err: any) {
            console.error("NotificationManager: Error cargando notificaciones iniciales:", err);
            setError(err.message);
            setNotificaciones([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId, idRol]);

    useEffect(() => {
        cargarNotificacionesIniciales();
    }, [cargarNotificacionesIniciales]);

    // 2. Callback para manejar notificaciones de Pusher
    const handleNuevaNotificacion = useCallback((nuevaNotif: NotificationItem) => {
        console.log("NotificationManager: Recibida nueva notificación via Pusher:", nuevaNotif);
        // Mostrar Toast
        toast(
            (t) => (
                <div onClick={() => toast.dismiss(t.id)} style={{ cursor: 'pointer' }}>
                    <p className="font-semibold">Nueva Notificación</p>
                    <p>{nuevaNotif.mensaje}</p>
                </div>
            ), { icon: '🔔' }
        );
        // Añadir al PRINCIPIO de la lista, asegurando que no esté duplicada por ID
        setNotificaciones((prev) => {
            if (prev.some(n => n.id_notificacion === nuevaNotif.id_notificacion)) {
                return prev; // Ya existe, no añadir
            }
            return [
                { // Asegurar estructura
                    id_notificacion: nuevaNotif.id_notificacion,
                    mensaje: nuevaNotif.mensaje,
                    fue_leida: nuevaNotif.fue_leida ?? false,
                    // fecha_creacion: nuevaNotif.fecha_creacion // Podría venir del payload
                },
                ...prev
            ];
        });
    }, []);

    // 3. Usar el hook de Pusher
    usePusherNotifications({
        userId: userId,
        enabled: !!userId, // Habilitar solo si hay userId
        onNotificationReceived: handleNuevaNotificacion,
        eventName: 'nueva-notificacion' // Asegúrate que el backend envíe a este evento
    });

    // 4. Marcar como leída
    const marcarComoLeida = async (idNotificacion: number) => {
        const index = notificaciones.findIndex(n => n.id_notificacion === idNotificacion);
        if (index === -1 || notificaciones[index].fue_leida) return;

        const notificacionesOriginales = [...notificaciones];
        setNotificaciones((prev) =>
            prev.map((n) => (n.id_notificacion === idNotificacion ? { ...n, fue_leida: true } : n))
        );

        try {
            const res = await fetch(`/api/notificaciones?id=${idNotificacion}`, { method: "PUT" }); // Usar API unificada
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error ${res.status}`);
            }
        } catch (err: any) {
            console.error("NotificationManager: Error al marcar como leída:", err);
            toast.error(`Error al actualizar notificación: ${err.message}`);
            setNotificaciones(notificacionesOriginales); // Revertir
        }
    };

    // Calcular no leídas
    const noLeidasCount = useMemo(() => notificaciones.filter((n) => !n.fue_leida).length, [notificaciones]);

    // Renderizado del componente (igual que en la respuesta anterior)
    return (
        <div className="relative">
            {/* Botón Campana */}
            <button
                className="relative p-2 rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-custom-color focus:ring-white"
                onClick={() => setMostrarDropdown(!mostrarDropdown)}
                aria-label={`Notificaciones (${noLeidasCount} no leídas)`}
            >
                <FontAwesomeIcon icon={faBell} size="lg" />
                {noLeidasCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-custom-color animate-pulse">
                        {noLeidasCount > 9 ? '9+' : noLeidasCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {mostrarDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                         <span className="font-semibold text-sm">Notificaciones</span>
                    </div>
                    {isLoading && <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>}
                    {error && <div className="p-4 text-center text-sm text-red-600">{error}</div>}
                    {!isLoading && !error && (
                        <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                            {notificaciones.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-center text-gray-500 italic">No hay notificaciones</li>
                            ) : (
                                notificaciones.map((n) => (
                                    <li key={n.id_notificacion} className={`px-4 py-3 hover:bg-gray-50 transition duration-150 ease-in-out ${n.fue_leida ? 'text-gray-500' : 'font-medium bg-blue-50'}`}>
                                        <div className="flex justify-between items-start gap-2">
                                            <span className="text-sm flex-1">{n.mensaje}</span>
                                            {!n.fue_leida && (
                                                <button onClick={(e) => { e.stopPropagation(); marcarComoLeida(n.id_notificacion); }} className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-100 flex-shrink-0" title="Marcar como leída">
                                                    <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                        {n.fecha_creacion && (<p className="text-xs text-gray-400 mt-1">{new Date(n.fecha_creacion).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</p>)}
                                    </li>
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}