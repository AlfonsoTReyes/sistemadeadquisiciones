"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { pusherClient } from "../lib/pusherADQ-client";

interface NotificacionesProps {
  idrol: string;
}

export default function Notificaciones({ idrol }: NotificacionesProps) {
  const [mostrar, setMostrar] = useState(false);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`/api/notificaciones?idrol=${idrol}`);
        const data = await res.json();
        setNotificaciones(
            (data.notificaciones || []).map((n: any) => ({
              id: n.id_notificacion,           // 👈 Aquí lo normalizas
              mensaje: n.mensaje,
              leida: n.fue_leida,
            }))
          );
          
      } catch (err) {
        console.error("Error cargando notificaciones:", err);
      }
    };

    if (idrol) cargar();
  }, [idrol]);

  useEffect(() => {
    const canal = pusherClient.subscribe("canal-notificaciones");
    canal.bind("nueva-notificacion", (data: any) => {
      setNotificaciones((prev) => [...prev, { id: data.id_notificacion, mensaje: data.mensaje, leida: data.fue_leida }]);
    });
    return () => {
      pusherClient.unsubscribe("canal-notificaciones");
    };
  }, []);

  const marcarComoLeida = async (id: number, index: number) => {
    try {
      await fetch(`/api/notificaciones?id=${id}`, { method: "PUT" });

      // Actualiza en frontend
      setNotificaciones((prev) =>
        prev.map((n, i) => (i === index ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className="relative">
      <button className="relative" onClick={() => setMostrar(!mostrar)}>
        <FontAwesomeIcon icon={faBell} size="lg" className="hover:text-yellow-400 transition" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {noLeidas}
          </span>
        )}
      </button>

      {mostrar && (
        <div className="absolute left-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg z-50">
          <div className="p-3 border-b font-bold">Notificaciones</div>
          <ul className="max-h-[10.5rem] overflow-y-auto">
            {notificaciones.length === 0 ? (
              <li className="px-4 py-2 text-gray-500">No hay notificaciones</li>
            ) : (
              notificaciones.map((n, i) => (
                <li
                  key={i}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                    n.leida ? "text-gray-500" : "font-semibold"
                  }`}
                  onClick={() => !n.leida && marcarComoLeida(n.id, i)}
                >
                  {n.mensaje}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
