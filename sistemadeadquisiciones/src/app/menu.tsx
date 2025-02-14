"use client";
import Link from "next/link";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faChevronDown,
  faFileInvoiceDollar,
  faClipboardList,
  faFolderOpen,
  faClipboardCheck,
  faUserCog,
  faUser,
  faUsers,
  faUserShield,
  faKey,
  faUserCircle,
  faLock,
  faSmile,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false); // Estado del menú
  //const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isUsuariosOpen, setIsUsuariosOpen] = useState(false);
  const [isSession, setIsSessionOpen] = useState(false);

  return (
    <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 focus:outline-none hover:bg-blue-700 rounded-md transition duration-300"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
        </button>
        <h1 className="text-xl font-bold">Sistema de Adquisiciones</h1>
      </div>

      <ul
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transform transition-transform duration-300 fixed top-0 left-0 h-full w-64 bg-gray-800 p-4 overflow-y-auto z-40`}
        style={{ backgroundColor: "#0a1640" }}
      >
        <li className="mb-1">
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </li>

        <li className="mb-1">
          <Link
            href="/requirente"
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Solicitud Requirente
          </Link>
        </li>

        <li className="mb-1">
          <Link
            href="/requisicion"
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Solicitud Requisición
          </Link>
        </li>

        <li className="mb-1">
          <Link
            href="/comite"
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faUsers} className="mr-2" /> Comité
          </Link>
        </li>

        <li className="mb-1">
          <Link
            href="/concursos"
            className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faFolderOpen} className="mr-2" /> Concursos y Contratos
          </Link>
        </li>

        <li className="mb-1">
          <Link
            href="/cotizaciones"
            className="block text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" /> Cotizaciones
          </Link>
        </li>

        <li className="mb-1">
          <button
            onClick={() => setIsUsuariosOpen(!isUsuariosOpen)}
            className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUserCog} className="mr-2" /> Administración
            </div>
            <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
          </button>
          {isUsuariosOpen && (
            <ul className="ml-1 mt-1 space-y-1 bg-gray-600 rounded-md p-2">
              <li className="mb-1">
                <Link
                  href="/usuarios"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" /> Usuarios
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  href="/empleados"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faUsers} className="mr-2" /> Empleados
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  href="/roles"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faUserShield} className="mr-2" /> Roles
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  href="/permisos"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faKey} className="mr-2" /> Permisos
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="mb-1">
          <button
            onClick={() => setIsSessionOpen(!isSession)}
            className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> Usuario
            </div>
            <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
          </button>
          {isSession && (
            <ul className="ml-1 mt-1 space-y-1 bg-gray-600 rounded-md p-2">
              <li className="mb-1">
                <button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                  <FontAwesomeIcon icon={faLock} className="mr-2" /> Modificar contraseña
                </button>
              </li>
              <li className="mb-1">
                <button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                  <FontAwesomeIcon icon={faSmile} className="mr-2" /> Agregar rostro facial
                </button>
              </li>
              <li className="mb-1">
                <button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Cerrar sesión
                </button>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}
