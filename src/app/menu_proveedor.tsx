// src/components/ProveedoresMenu.tsx (o donde lo coloques)
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faChevronDown,
  faUserCircle,
  faLock,
  faSignOutAlt,
  faBoxOpen,       // Icono para Artículos
  faFileContract,  // Icono para Contratos
  faAddressCard,   // Icono para Datos Generales
  faListOl,        // Icono para Partidas
  faTachometerAlt, // Icono para Dashboard
} from "@fortawesome/free-solid-svg-icons";
// Asegúrate que la ruta a ModificarContraseña sea correcta desde este archivo
//import ModificarContraseña from "./usuarios/formularios/modificarContraseña"; // O la ruta correcta
import Image from "next/image";
import logoSJR from "../public/logo_sanjuan2.png";
export default function ProveedoresMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga inicial

  // Estados para datos de sesión del proveedor/usuario
  const [userEmail, setUserEmail] = useState<string | null>(null); // Email para mostrar
  const [proveedorUserId, setProveedorUserId] = useState<string | null>(null); // ID del usuario logueado

  // Estado para el modal de cambio de contraseña
  const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false);
  const [contraseñaEditarId, setContraseñaAEditarId] = useState<number | null>(null);

  const openEditPassModal = (id: number) => {
    setContraseñaAEditarId(id);
    setIsPassEditModalOpen(true);
  };

  const closeEditPassModal = () => {
    setContraseñaAEditarId(null);
    setIsPassEditModalOpen(false);
  };

  useEffect(() => {
    setIsLoading(true);
    // Leer datos de sesión específicos del proveedor/usuario
    const storedEmail = sessionStorage.getItem("userEmail"); // Asumiendo que el email del usuario aún se guarda aquí
    const storedProviderUserId = sessionStorage.getItem("proveedorUserId");

    if (storedEmail && storedProviderUserId) {
      setUserEmail(storedEmail);
      setProveedorUserId(storedProviderUserId);
      console.log("ProveedoresMenu: Sesión encontrada - UserEmail:", storedEmail, "ProveedorUserId:", storedProviderUserId);
    } else {
      // Si falta alguno de los datos esenciales, limpiar y redirigir
      console.warn("ProveedoresMenu: Falta userEmail o proveedorUserId en sessionStorage. Redirigiendo a login.");
      sessionStorage.clear(); // Limpia por si acaso
      setUserEmail(null);
      setProveedorUserId(null);
      //router.push("/proveedores/proveedoresusuarios"); // Redirige a la página de login de proveedores
    }
    setIsLoading(false); // Termina la carga inicial
  }, [router]); // Dependencia del router para la redirección

  const handleLogout = () => {
    console.log("ProveedoresMenu: Cerrando sesión...");
    // Limpiar sessionStorage (incluyendo los específicos de proveedor)
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("proveedorUserId");
    sessionStorage.removeItem("proveedorId");
    sessionStorage.removeItem("proveedorTipo");
    // Limpiar cualquier otro dato de sesión que pudieras tener
    sessionStorage.clear();

    // Limpiar estado local
    setUserEmail(null);
    setProveedorUserId(null);
    setIsOpen(false); // Cierra el menú si está abierto
    setIsSessionOpen(false);

    // Redirigir al login de proveedores
    //router.push("/proveedores/proveedoresusuarios");
  };

  // Renderizado condicional mientras carga o si no hay sesión
  if (isLoading) {
    return (
      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50">
        <div className="flex items-center justify-between">

          <span className="p-2"><FontAwesomeIcon icon={faBars} size="lg" /></span>
          <h1 className="text-xl font-bold">Portal de Proveedores</h1>
        </div>
      </nav>
    );
  }

  // Si después de cargar no hay email o ID, useEffect ya debería haber redirigido,
  // pero podemos añadir una capa extra de seguridad o un mensaje.
  // Sin embargo, es mejor confiar en la redirección del useEffect.

  return (
    <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Botón Hamburguesa */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 focus:outline-none hover:bg-blue-700 rounded-md transition duration-300"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
        </button>
        <Link href="/#">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src={logoSJR.src} alt="Logo" width={100} height={30} priority />
          </div>
        </Link>
        {/* Título */}
        <h1 className="text-xl font-bold">Portal de Proveedores</h1>
        {/* Placeholder para mantener el título centrado si es necesario */}
        <div className="w-8"></div>
      </div>

      {/* Menú Lateral Desplegable */}
      <ul
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"
          } transform transition-transform duration-300 ease-in-out fixed top-0 left-0 h-full w-64 bg-gray-800 p-4 overflow-y-auto z-40`}
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
        {/* Enlace al Dashboard (opcional, si lo tienes) */}
        <li className="mb-1">
          <Link
            href="/proveedores/dashboard" // Asegúrate que esta ruta sea correcta
            onClick={() => setIsOpen(false)}
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" /> Dashboard
          </Link>
        </li>
        <li className="mb-1">
          <Link
            href="/proveedores/articulos" // Asegúrate que esta ruta exista
            onClick={() => setIsOpen(false)}
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faBoxOpen} className="mr-2" /> Artículos
          </Link>
        </li>
        <li className="mb-1">
          <Link
            href="/proveedores/partidas" // Asegúrate que esta ruta exista
            onClick={() => setIsOpen(false)}
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faFileContract} className="mr-2" /> Mis partidas
          </Link>
        </li>

        <li className="mb-1">
          <Link
            href="/proveedores/contratos" // Asegúrate que esta ruta exista
            onClick={() => setIsOpen(false)}
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faFileContract} className="mr-2" /> Contratos
          </Link>
        </li>
        

        {/* --- Separador --- */}
        <hr className="my-4 border-gray-600" />

        {/* --- Menú de Sesión del Usuario --- */}
        {userEmail && proveedorUserId && ( // Solo mostrar si tenemos datos
          <li className="mb-1">
            <button
              onClick={() => setIsSessionOpen(!isSessionOpen)}
              className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
            >
              <div className="flex items-center truncate" title={userEmail}>
                <FontAwesomeIcon icon={faUserCircle} className="mr-2 flex-shrink-0" />
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
                <li className="mb-1">
                  <button
                    className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Cerrar sesión
                  </button>
                </li>
              </ul>
            )}
          </li>
        )}

      </ul>

      {/* Contenedor para Modales */}
      <div className="text-black">
        {/* Modal para Modificar Contraseña */}
        {isEditPassModalOpen && contraseñaEditarId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded shadow-lg text-black w-full max-w-md relative">
              {/* Botón de cierre dentro del modal */}
              <button
                onClick={closeEditPassModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                aria-label="Cerrar modal"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}