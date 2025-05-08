"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheck } from "@fortawesome/free-solid-svg-icons";
import { pusherClient } from "@/lib/pusherADQ-client";
import toast from 'react-hot-toast';

interface NotificationItem {
  id_notificacion: number;
  mensaje: string;
  fue_leida: boolean;
  fecha_creacion?: string;
}

interface NotificationManagerProps {
  userId: number | null;
  idRol: string | null;
}

export default function NotificationManager({ userId, idRol }: NotificationManagerProps) {
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarNotificacionesIniciales = useCallback(async () => {
    if (!userId && !idRol) {
      setNotificaciones([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (userId) params.append('idusuario', userId.toString());
      if (idRol) params.append('idrol', idRol);

      const res = await fetch(`/api/notificaciones?${params.toString()}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      const nuevasNotificaciones = (data.notificaciones || []).map((n: any): NotificationItem => ({
        id_notificacion: n.id_notificacion,
        mensaje: n.mensaje,
        fue_leida: n.fue_leida ?? false,
        fecha_creacion: n.fecha_creacion,
      }));
      setNotificaciones(nuevasNotificaciones);
    } catch (err: any) {
      setError(err.message);
      setNotificaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, idRol]);

  useEffect(() => {
    cargarNotificacionesIniciales();
  }, [cargarNotificacionesIniciales]);

  // Suscripción a Pusher
  useEffect(() => {
    const canal = pusherClient.subscribe("canal-notificaciones");

    canal.bind("nueva-notificacion", (data: any) => {
      const nuevaNotificacion: NotificationItem = {
        id_notificacion: data.id_notificacion,
        mensaje: data.mensaje,
        fue_leida: false,
        fecha_creacion: data.fecha_creacion,
      };

      setNotificaciones((prev) => [nuevaNotificacion, ...prev]);
      toast.success("Nueva notificación recibida!");
    });

    return () => {
      pusherClient.unsubscribe("canal-notificaciones");
    };
  }, []);

  const marcarComoLeida = async (id: number, index: number) => {
    try {
      await fetch(`/api/notificaciones?id=${id}`, { method: "PUT" });

      setNotificaciones((prev) =>
        prev.map((n, i) => (i === index ? { ...n, fue_leida: true } : n))
      );

      toast.success("Notificación marcada como leída");
    } catch (err) {
      console.error("Error al marcar como leída:", err);
      toast.error("Error al marcar la notificación como leída");
    }
  };

  const noLeidasCount = useMemo(() => notificaciones.filter((n) => !n.fue_leida).length, [notificaciones]);

  return (
    <div className="relative inline-block">
      <button
        className="relative p-2 rounded-full text-white hover:bg-blue-700 focus:outline-none transition duration-300"
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        aria-label={`Notificaciones (${noLeidasCount} no leídas)`}
      >
        <FontAwesomeIcon icon={faBell} size="lg" />
        {noLeidasCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-custom-color animate-pulse">
            {noLeidasCount > 9 ? '9+' : noLeidasCount}
          </span>
        )}
      </button>

      {mostrarDropdown && (
        <div
          className="absolute right-0 mt-2 w-96 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <span className="font-semibold text-sm">Notificaciones</span>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-600">{error}</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notificaciones.length === 0 ? (
                <li className="px-4 py-3 text-sm text-center text-gray-500 italic">No hay notificaciones</li>
              ) : (
                notificaciones.map((n, i) => (
                  <li
                    key={n.id_notificacion}
                    className={`px-4 py-3 hover:bg-gray-100 transition duration-150 ease-in-out ${
                      n.fue_leida ? 'text-gray-500' : 'font-medium bg-blue-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm flex-1">{n.mensaje}</span>
                      {!n.fue_leida && (
                        <button
                          className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-100"
                          onClick={() => marcarComoLeida(n.id_notificacion, i)}
                        >
                          <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {n.fecha_creacion && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.fecha_creacion).toLocaleString('es-MX', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    )}
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
