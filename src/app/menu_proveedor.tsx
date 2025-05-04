// src/components/ProveedoresMenu.tsx (o tu ruta a menu_proveedor.tsx)
"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react"; // useCallback añadido por si acaso
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import para el logo
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faChevronDown,
  faUserCircle,
  // faLock, // Ya no se usa si quitamos modificar contraseña
  faSignOutAlt,
  faBoxOpen,
  faFileContract,
  faAddressCard, // Aunque no se usa en los links actuales, podría ser útil
  faListOl,
  faTachometerAlt,
} from "@fortawesome/free-solid-svg-icons";

import { Toaster } from 'react-hot-toast'; // Importar el contenedor de toasts
import { usePusherNotifications } from '@/hooks/usePusherNotifications'; // Ajusta la ruta al hook

// Import del logo (Asegúrate que la ruta sea correcta desde este archivo)
import logoSJR from "../public/logo_sanjuan2.png"; // Ajusta la ruta si es necesario

// Define la URL de login una sola vez para consistencia
const LOGIN_URL = "/proveedores/proveedoresusuarios"; // Ajusta si es diferente

export default function ProveedoresMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para datos de sesión
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [proveedorUserId, setProveedorUserId] = useState<string | null>(null);
  const [proveedorId, setProveedorId] = useState<number | null>(null); // <-- ID del PROVEEDOR para Pusher

  // Ya no se necesitan estados/handlers para el modal de contraseña si se quitó el botón
  // const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false);
  // const [contraseñaEditarId, setContraseñaAEditarId] = useState<number | null>(null);
  // const openEditPassModal = (id: number) => { /* ... */ };
  // const closeEditPassModal = () => { /* ... */ };

  // --- useEffect para leer datos de sesión (ACTUALIZADO para leer proveedorId) ---
  useEffect(() => {
    setIsLoading(true);
    const storedEmail = sessionStorage.getItem("userEmail");
    const storedProviderUserId = sessionStorage.getItem("proveedorUserId");
    const storedProviderId = sessionStorage.getItem("proveedorId"); // <-- LEER ID PROVEEDOR

    let idProveedorNum: number | null = null;
    if (storedProviderId) {
        const parsedId = parseInt(storedProviderId, 10);
        if (!isNaN(parsedId)) {
            idProveedorNum = parsedId;
        } else {
            console.warn("ProveedoresMenu: proveedorId en sessionStorage no es un número válido:", storedProviderId);
        }
    }

    if (storedEmail && storedProviderUserId) {
      setUserEmail(storedEmail);
      setProveedorUserId(storedProviderUserId);
      setProveedorId(idProveedorNum); // <-- GUARDAR ID PROVEEDOR EN ESTADO
      console.log("ProveedoresMenu: Sesión encontrada - UserEmail:", storedEmail, "ProveedorUserId:", storedProviderUserId, "ProveedorId:", idProveedorNum);
    } else {
      console.warn("ProveedoresMenu: Falta userEmail o proveedorUserId en sessionStorage. Redirigiendo a login.");
      // No limpiar sessionStorage aquí para no interferir con otros procesos
      setUserEmail(null);
      setProveedorUserId(null);
      setProveedorId(null); // <-- Limpiar ID
      router.push(LOGIN_URL); // Redirige a la página de login de proveedores
    }
    setIsLoading(false);
  }, [router]); // Dependencia del router para la redirección

  // --- *** INICIALIZAR EL HOOK DE PUSHER *** ---
  // Se ejecutará automáticamente cuando 'proveedorId' cambie de null a un número
  usePusherNotifications({
      providerId: proveedorId, // Pasa el ID del proveedor obtenido de sessionStorage
      enabled: !!proveedorId, // Solo habilitar si tenemos un ID válido
      // channelPrefix: 'proveedor-updates-', // Valor por defecto
      // eventName: 'cambio_estado_proveedor', // Valor por defecto
  });
  // --- *** FIN INICIALIZACIÓN PUSHER *** ---

  // --- Handler Logout (ACTUALIZADO para limpiar proveedorId) ---
  const handleLogout = useCallback(() => { // Envuelto en useCallback
    console.log("ProveedoresMenu: Cerrando sesión...");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("proveedorUserId");
    sessionStorage.removeItem("proveedorId"); // <-- LIMPIAR ID
    sessionStorage.removeItem("proveedorTipo");
    sessionStorage.clear(); // Limpia todo por si acaso

    // Limpiar estado local
    setUserEmail(null);
    setProveedorUserId(null);
    setProveedorId(null); // <-- LIMPIAR ESTADO
    setIsOpen(false);
    setIsSessionOpen(false);

    console.log(`ProveedoresMenu: Redirigiendo a ${LOGIN_URL}`);
    router.push(LOGIN_URL); // Redirigir al login
  }, [router]); // Depende de router

  // --- Renderizado ---
  if (isLoading) {
    return (
      // Placeholder de carga
      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 animate-pulse">
        <div className="flex items-center justify-between">
          <span className="p-2"><FontAwesomeIcon icon={faBars} size="lg" /></span>
           {/* Puedes poner un logo placeholder o el título */}
           <h1 className="text-xl font-bold">Portal de Proveedores</h1>
          <div className="w-8"></div>
        </div>
      </nav>
    );
  }

  return (
    // Fragmento para incluir Toaster y Nav
    <>
      {/* Contenedor de Toasts (invisible hasta que aparece un toast) */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8} // Espacio entre toasts
        containerClassName="" // Clases para el contenedor
        containerStyle={{}} // Estilos inline para el contenedor
        toastOptions={{
          // Estilos por defecto
          className: 'border border-gray-200 shadow-lg rounded-lg p-4', // Estilo base
          duration: 6000, // Duración más larga por defecto
          style: {
            background: '#ffffff', // Fondo blanco
            color: '#374151', // Texto gris oscuro
          },
          // Estilos específicos por tipo
          success: {
            duration: 4000,
            style: {
              background: '#F0FDF4', // Fondo verde muy claro
              color: '#166534', // Texto verde oscuro
              borderColor: '#BBF7D0', // Borde verde claro
            },
            iconTheme: {
              primary: '#22C55E', // Icono verde
              secondary: '#FFFFFF',
            },
          },
          error: {
            duration: 8000, // Más tiempo para errores
             style: {
              background: '#FEF2F2', // Fondo rojo muy claro
              color: '#991B1B', // Texto rojo oscuro
              borderColor: '#FECACA', // Borde rojo claro
            },
             iconTheme: {
              primary: '#EF4444', // Icono rojo
              secondary: '#FFFFFF',
            },
          },
          // Estilo para toast.info o por defecto si no es success/error
           loading: {
             iconTheme: { primary: '#3B82F6', secondary: '#EFF6FF' } // Icono azul
           },
        }}
      />

      {/* Barra de Navegación */}
      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 shadow-md"> {/* Añadida sombra */}
        <div className="flex items-center justify-between">
          {/* Botón Hamburguesa */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 focus:outline-none hover:bg-blue-700 rounded-md transition duration-300"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
          </button>

          {/* Logo */}
          <Link href="/proveedores/dashboard"> {/* Enlace al dashboard */}
            {/* Usar 'span' si Link no acepta directamente 'div' o 'Image' en algunas versiones */}
            <span className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
              <Image src={logoSJR.src} alt="Logo San Juan del Río" width={120} height={35} priority /> {/* Ajusta tamaño */}
            </span>
          </Link>

          {/* Título (opcional, el logo ya ocupa espacio) */}
          {/* <h1 className="text-xl font-bold hidden md:block">Portal de Proveedores</h1> */}

          {/* Placeholder o espacio si es necesario para centrar */}
          <div className="w-8"></div> {/* Mantiene el logo centrado */}
        </div>

        {/* Menú Lateral Desplegable */}
        <ul
          className={`${isOpen ? "translate-x-0" : "-translate-x-full"}
            transform transition-transform duration-300 ease-in-out fixed top-0 left-0 h-full w-64 p-4 overflow-y-auto z-40 shadow-xl`} // Añadida sombra más pronunciada
          style={{ backgroundColor: "#0a1640" }} // Tu color personalizado
        >
          {/* Botón para cerrar el menú */}
          <li className="mb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left"
              aria-label="Cerrar menú"
            >
              <FontAwesomeIcon icon={faTimes} />
              <span className="ml-2">Cerrar Menú</span>
            </button>
          </li>

          {/* --- Enlaces Específicos de Proveedores --- */}
          <li className="mb-1">
            <Link href="/proveedores/dashboard" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
              <FontAwesomeIcon icon={faTachometerAlt} className="mr-2 w-5" /> Panel Principal {/* Añadido w-5 */}
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/proveedores/articulos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
              <FontAwesomeIcon icon={faBoxOpen} className="mr-2 w-5" /> Artículos {/* Añadido w-5 */}
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/proveedores/partidas" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
              <FontAwesomeIcon icon={faListOl} className="mr-2 w-5" /> Mis Partidas {/* Icono cambiado y w-5 */}
            </Link>
          </li>
          <li className="mb-1">
            <Link href="/proveedores/contratos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
              <FontAwesomeIcon icon={faFileContract} className="mr-2 w-5" /> Contratos {/* Añadido w-5 */}
            </Link>
          </li>

          {/* --- Separador --- */}
          <hr className="my-4 border-gray-600" />

          {/* --- Menú de Sesión del Usuario --- */}
          {userEmail && proveedorUserId && (
            <li className="mb-1">
              <button
                onClick={() => setIsSessionOpen(!isSessionOpen)}
                className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <div className="flex items-center truncate" title={userEmail}>
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2 flex-shrink-0 w-5" /> {/* Añadido w-5 */}
                  <span className="truncate">{userEmail}</span>
                </div>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`ml-2 transition-transform duration-200 flex-shrink-0 ${isSessionOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {/* Submenú de Sesión */}
              {isSessionOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {/* Botón Cerrar Sesión */}
                  <li className="mb-1">
                    <button
                      className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left"
                      onClick={handleLogout}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 w-5" /> Cerrar sesión {/* Añadido w-5 */}
                    </button>
                  </li>
                  {/* Aquí iría el botón de Modificar Contraseña si lo reintroduces */}
                </ul>
              )}
            </li>
          )}
        </ul>

        {/* Contenedor para Modales (ya no se usa en este código, pero se deja por si se añade algo) */}
        <div className="text-black">
          {/* Aquí iría el modal de Modificar Contraseña si se reintroduce */}
        </div>
      </nav>
    </> // Cierre del Fragmento
  );
}