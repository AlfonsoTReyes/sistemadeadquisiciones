// src/components/ProveedoresMenu.tsx (o tu ruta a menu_proveedor.tsx)
// Este archivo ya contiene la integración de Pusher/Toast

"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars, faTimes, faChevronDown, faUserCircle, faSignOutAlt,
  faBoxOpen, faFileContract, faListOl, faTachometerAlt
} from "@fortawesome/free-solid-svg-icons";

// *** Notificaciones y Hook ***
import { Toaster } from 'react-hot-toast'; // Contenedor de toasts
import NotificationManager from '@/componentes/NotificationManager'; // Ajusta la ruta

// Logo (Ajusta ruta)
import logoSJR from "../public/logo_sanjuan2.png";

// URL de Login
const LOGIN_URL = "/proveedores/proveedoresusuarios";

export default function ProveedoresMenu() {
  const [idUsuario, setIdUsuario] = useState<number | null>(null); // Estado para el ID numérico del usuario proveedor
  const [idRol, setIdRol] = useState<string | null>(null); // Estado para el rol (si aplica a proveedores)
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para datos de sesión
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [proveedorUserId, setProveedorUserId] = useState<string | null>(null);
  const [proveedorId, setProveedorId] = useState<number | null>(null); // <-- ID del PROVEEDOR para Pusher

  // useEffect para leer datos de sesión (ACTUALIZADO)
  useEffect(() => {
    setIsLoading(true);
    const storedEmail = sessionStorage.getItem("userEmail");
    const storedProviderUserId = sessionStorage.getItem("proveedorUserId"); // ID del usuario
    const storedProviderId = sessionStorage.getItem("proveedorId"); // ID del proveedor
    const storedIdRol = sessionStorage.getItem("userRole"); // Obtener rol si existe para proveedores

    let idUsuarioNum: number | null = null;
    if (storedProviderUserId) { // Usa el ID del USUARIO proveedor
      const parsedId = parseInt(storedProviderUserId, 10);
      idUsuarioNum = !isNaN(parsedId) ? parsedId : null;
  }
  const rolProveedor = storedIdRol || null; // Obtener el rol (probablemente null)

  if (storedEmail && idUsuarioNum !== null) {
    setUserEmail(storedEmail);
    setProveedorUserId(storedProviderUserId); // Mantener el string si se usa en otro lado
    setIdUsuario(idUsuarioNum); // <--- Guarda el ID numérico del usuario
    setIdRol(rolProveedor);     // <--- Guarda el rol (o null)
    setProveedorUserId(storedProviderUserId); // Mantener el string si se usa en otro lado

    console.log("ProveedoresMenu: Sesión válida. UserID:", idUsuarioNum, "UserRole:", rolProveedor);
  } else {
    console.warn("ProveedoresMenu: Faltan datos de sesión (Email o UserID). Redirigiendo.");
    setUserEmail(null); setProveedorUserId(null); setIdUsuario(null); setIdRol(null); setProveedorId(null);
    router.push(LOGIN_URL);
  }
  setIsLoading(false);
}, [router]);

  // --- QUITAR usePusherNotifications de aquí ---

  // handleLogout (ACTUALIZADO)
  const handleLogout = useCallback(() => {
    console.log("ProveedoresMenu: Cerrando sesión...");
    sessionStorage.clear();
    setUserEmail(null); setProveedorUserId(null); setIdUsuario(null); setIdRol(null); setProveedorId(null);
    setIsOpen(false); setIsSessionOpen(false);
    router.push(LOGIN_URL);
  }, [router]);


  // --- Renderizado ---
  if (isLoading) {
    return (
      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 animate-pulse">
        {/* ... Placeholder de carga ... */}
        <div className="flex items-center justify-between">
          <span className="p-2"><FontAwesomeIcon icon={faBars} size="lg" /></span>
          <h1 className="text-xl font-bold">Portal de Proveedores</h1>
          <div className="w-8"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Contenedor de Toasts: Necesario para que react-hot-toast funcione */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: 'border border-gray-200 shadow-lg rounded-lg p-4 text-sm',
          duration: 8000, // Duración más larga para notificaciones
          style: { background: '#ffffff', color: '#374151' },
          // ... otros estilos opcionales ...
        }}
      />

      {/* Barra de Navegación */}
      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          {/* Botón Hamburguesa */}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 focus:outline-none hover:bg-blue-700 rounded-md transition duration-300" aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}>
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
          </button>
          <NotificationManager
                    userId={idUsuario} // Pasar el ID numérico del usuario proveedor
                    idRol={idRol}      // Pasar el rol si aplica a proveedores
                />
          {/* Logo */}
          <Link href="/proveedores/dashboard">
            <span className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
              <Image src={logoSJR.src} alt="Logo San Juan del Río" width={120} height={35} priority />
            </span>
          </Link>
          {/* Placeholder */}
          <div className="w-8"></div>
        </div>

        {/* Menú Lateral */}
        <ul
          className={`${isOpen ? "translate-x-0" : "-translate-x-full"}
            transform transition-transform duration-300 ease-in-out fixed top-0 left-0 h-full w-64 p-4 overflow-y-auto z-40 shadow-xl`}
          style={{ backgroundColor: "#0a1640" }}
        >
          {/* Botón Cerrar */}
          <li className="mb-4">
            <button onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" aria-label="Cerrar menú">
              <FontAwesomeIcon icon={faTimes} className="w-5" />
              <span className="ml-2">Cerrar Menú</span>
            </button>
          </li>

          {/* Enlaces */}
          <li className="mb-1"><Link href="/proveedores/dashboard" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faTachometerAlt} className="mr-2 w-5" /> Panel Principal</Link></li>
          <li className="mb-1"><Link href="/proveedores/articulos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faBoxOpen} className="mr-2 w-5" /> Artículos</Link></li>
          <li className="mb-1"><Link href="/proveedores/partidas" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faListOl} className="mr-2 w-5" /> Mis Partidas</Link></li>
          <li className="mb-1"><Link href="/proveedores/contratos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faFileContract} className="mr-2 w-5" /> Contratos</Link></li>

          <hr className="my-4 border-gray-600" />

          {/* Menú de Sesión */}
          {userEmail && proveedorUserId && (
            <li className="mb-1">
              <button onClick={() => setIsSessionOpen(!isSessionOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center truncate" title={userEmail}><FontAwesomeIcon icon={faUserCircle} className="mr-2 flex-shrink-0 w-5" /><span className="truncate">{userEmail}</span></div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 flex-shrink-0 ${isSessionOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSessionOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  <li className="mb-1"><button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} className="mr-2 w-5" /> Cerrar sesión</button></li>
                  {/* Botón Modificar Contraseña eliminado */}
                </ul>
              )}
            </li>
          )}
        </ul>
        {/* Contenedor Modales (Vacío ahora) */}
        <div className="text-black"></div>
      </nav>
    </>
  );
}