// src/app/menu.tsx (CORREGIDO Y REESTRUCTURADO)

"use client";
import React from 'react'; // Necesario para JSX y Toaster
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars, faTimes, faChevronDown, faFileInvoiceDollar, faClipboardList,
  faFolderOpen, faClipboardCheck, faUserCog, faUser, faUsers, faUserShield,
  faKey, faUserCircle, faLock, faSmile, faSignOutAlt, faBuildingColumns,
  faFileSignature, faFileContract, faGavel, faWarehouse, faBell // Iconos relevantes
} from "@fortawesome/free-solid-svg-icons";

// Componente de Notificaciones (Asegúrate que la ruta sea correcta)
import Notificaciones from "./notificaciones";

// Modales (Asegúrate que las rutas sean correctas)
import ModificarUsuario from "./usuarios/formularios/modificar";
import ModificarContraseña from "./usuarios/formularios/modificarContraseña";
import ModificarRostro from "./usuarios/formularios/rostro";

// Hook y Toaster
import { Toaster, toast } from 'react-hot-toast';

import NotificationManager from '@/componentes/NotificationManager'; // Ajusta la ruta al nuevo componente
// Define la URL de login una sola vez para consistencia
const LOGIN_URL = "/login"; // O la ruta de tu login principal

export default function Menu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Estados para controlar submenús específicos
  const [isUsuariosProveedoresOpen, setIsUsuariosProveedoresOpen] = useState(false);
  const [isAdminProveedoresOpen, setIsAdminProveedoresOpen] = useState(false);
  const [isAdquisicionesOpen, setIsAdquisicionesOpen] = useState(false);
  const [isComiteOpen, setIsComiteOpen] = useState(false);
  const [isConcursosOpen, setIsConcursosOpen] = useState(false);
  const [isContratosOpen, setIsContratosOpen] = useState(false);
  const [isSecretariasOpen, setIsSecretariasOpen] = useState(false);
  const [isFinanzasOpen, setIsFinanzasOpen] = useState(false);
  const [isAdministracionOpen, setIsAdministracionOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  // Estados de sesión y permisos
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [idUsuario, setIdUsuario] = useState<string | null>(null); // Tipo correcto
  const [idRol, setIdRol] = useState<string | null>(null); // Estado para id_rol
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Estados de Modales
  const [usuarioAEditar, setUsuarioAEditar] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false);
  const [contraseñaEditar, setContraseñaAEditar] = useState<number | null>(null);
  const [isEditRostroModalOpen, setIsRostroEditModalOpen] = useState(false);
  const [rostroEditar, setRostroAEditar] = useState<number | null>(null);

  // Handlers de Modales (Consolidados)
  const openEditModal = (id: number) => { setUsuarioAEditar(id); setIsEditModalOpen(true); };
  const closeEditModal = () => { setUsuarioAEditar(null); setIsEditModalOpen(false); };
  const openEditPassModal = (id: number) => { setContraseñaAEditar(id); setIsPassEditModalOpen(true); };
  const closeEditPassModal = () => { setContraseñaAEditar(null); setIsPassEditModalOpen(false); };
  const openEditRostroModal = (id: number) => { setRostroAEditar(id); setIsRostroEditModalOpen(true); };
  const closeEditRostroModal = () => { setRostroAEditar(null); setIsRostroEditModalOpen(false); };

  // useEffect para cargar sesión (Consolidado y Corregido)
  useEffect(() => {
    setIsLoadingSession(true);
    console.log("Menu Admin: Verificando sesión...");
    const storedEmail = sessionStorage.getItem("userEmail") || "";
    const storedNombre = sessionStorage.getItem("userNombre") || "";
    const storedId = sessionStorage.getItem("userId") || null;
    const storedPermisos = sessionStorage.getItem("userPermissions");
    const storedIdRol = sessionStorage.getItem("userRole") || null;

    let parsedPermissions: string[] = [];
    let sessionValid = false;

    if (storedPermisos) {
      try {
        parsedPermissions = JSON.parse(storedPermisos);
        if (!Array.isArray(parsedPermissions)) {
          parsedPermissions = [];
          console.warn("Menu Admin: Permisos en sessionStorage no son un array.");
        }
      } catch (e) {
        console.error("Menu Admin: Error parseando permisos.", e);
        parsedPermissions = [];
      }
    }

    if (storedId && parsedPermissions.length > 0) {
      setEmail(storedEmail);
      setNombre(storedNombre);
      setIdUsuario(storedId);
      setIdRol(storedIdRol);
      setPermissions(parsedPermissions);
      sessionValid = true;
      console.log("Menu Admin: Sesión válida encontrada. UserID:", storedId, "UserRole:", storedIdRol);
    }

    if (!sessionValid) {
      console.warn("Menu Admin: Sesión inválida o incompleta. Redirigiendo a login.");
      setEmail(""); setNombre(""); setIdUsuario(null); setIdRol(null); setPermissions([]);
      router.push(LOGIN_URL);
    }

    setIsLoadingSession(false);
  }, [router]);

  // handleLogout (Consolidado y con useCallback)
  const handleLogout = useCallback(() => {
    console.log("Menu Admin: Cerrando sesión...");
    sessionStorage.clear();
    setPermissions([]); setEmail(""); setNombre(""); setIdUsuario(null); setIdRol(null);
    setIsOpen(false); setIsSessionOpen(false); setIsAdministracionOpen(false);
    setIsUsuariosProveedoresOpen(false); setIsAdminProveedoresOpen(false);
    setIsAdquisicionesOpen(false); setIsComiteOpen(false); setIsConcursosOpen(false);
    setIsContratosOpen(false); setIsSecretariasOpen(false); setIsFinanzasOpen(false);
    router.push(LOGIN_URL);
  }, [router]);

  // --- *** FIN INICIALIZACIÓN PUSHER *** ---

  // Renderizado condicional mientras carga la sesión
  if (isLoadingSession) {
    return (
      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 animate-pulse">
        <div className="flex items-center justify-between">
          <span className="p-2"><FontAwesomeIcon icon={faBars} size="lg" /></span>
          <h1 className="text-xl font-bold">Sistema de Adquisiciones</h1>
          <div className="w-16 md:w-20"></div> {/* Placeholder para balancear */}
        </div>
      </nav>
    );
  }

  // Renderizado si no hay permisos/sesión (después de intentar cargar)
  if (!idUsuario || permissions.length === 0) {
    return (
      <div className="bg-custom-color text-white w-full p-4 text-center">
        <p>No tienes acceso o la sesión ha expirado. Serás redirigido...</p>
      </div>
    );
  }

  // --- Renderizado Principal del Menú ---
  return (
    <> {/* Fragmento para Toaster y Nav */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: 'border border-gray-200 shadow-lg rounded-lg p-4 text-sm',
          duration: 6000,
          style: { background: '#ffffff', color: '#374151' },
          success: { duration: 4000 },
          error: { duration: 8000 },
        }}
      />

      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          {/* Grupo Izquierda: Hamburguesa y Notificaciones */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 focus:outline-none hover:bg-blue-700 rounded-md transition duration-300" aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}>
              <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
            </button>
            {idRol && <Notificaciones idrol={idRol} />}
            {/* *** RENDERIZAR NotificationManager *** */}
            {/*
            <NotificationManager
              userId={idUsuario ? parseInt(idUsuario, 10) : null}
              idRol={idRol}
            />
             */}
          </div>


          {/* Título Centrado */}
          <h1 className="text-xl font-bold text-center flex-1 mx-4">Sistema de Adquisiciones</h1>

          {/* Placeholder Derecha (para equilibrio visual) */}
          <div className="w-16 md:w-20 flex justify-end"> {/* Ajusta el ancho y justifica al final */}
            {/* Podrías poner aquí el botón de perfil/logout si lo prefieres en la barra superior */}
          </div>
        </div>

        {/* Menú Lateral Desplegable */}
        <ul
          className={`${isOpen ? "translate-x-0" : "-translate-x-full"}
            transform transition-transform duration-300 ease-in-out fixed top-0 left-0 h-full w-72 p-4 overflow-y-auto z-40 shadow-xl`}
          style={{ backgroundColor: "#0a1640" }}
        >
          {/* Botón Cerrar */}
          <li className="mb-4">
            <button onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" aria-label="Cerrar menú">
              <FontAwesomeIcon icon={faTimes} className="w-5" />
              <span className="ml-2">Cerrar Menú</span>
            </button>
          </li>

          {/* --- SECCIONES DEL MENÚ --- */}

          {/* Sección ADMINISTRADOR DE PROVEEDORES */}
          {permissions.includes('menu_ver_administrador_proveedores') && (
            <li className="mb-1">
              <button onClick={() => setIsAdminProveedoresOpen(!isAdminProveedoresOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faUserCog} className="mr-2 w-5" /> ADMIN PROVEEDORES</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isAdminProveedoresOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAdminProveedoresOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_solicitudes_proveedores') && (<li className="mb-1"><Link href="/adminProveedores/altaProveedor" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Solicitudes/Admin</Link></li>)}
                  {permissions.includes('menu_ver_padron_proveedores') && (<li className="mb-1"><Link href="/catalogoProveedores" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Padrón Proveedores</Link></li>)}
                  {permissions.includes('menu_ver_pagos_proveedores') && (<li className="mb-1"><Link href="/pagosDashboard/pagos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2 w-5" /> Admin Pagos</Link></li>)}
                  {/* ... otros links ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección ADQUISICIONES */}
          {permissions.includes('menu_ver_adqusiciones_administrativo') && (
            <li className="mb-1">
              <button onClick={() => setIsAdquisicionesOpen(!isAdquisicionesOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faWarehouse} className="mr-2 w-5" /> ADQUISICIONES</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isAdquisicionesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAdquisicionesOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_solicitudes_pendientes') && (<li className="mb-1"><Link href="/solicitantes/solicitudes" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Solicitudes</Link></li>)}
                  {permissions.includes('menu_ver_comite') && (<li className="mb-1"><Link href="/comite" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faGavel} className="mr-2 w-5" /> Comité</Link></li>)}
                  {permissions.includes('menu_ver_contratos') && (<li className="mb-1"><Link href="/adminProveedores/contratos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faFileContract} className="mr-2 w-5" /> Contratos</Link></li>)}
                  {permissions.includes('menu_ver_cotizaciones') && (<li className="mb-1"><Link href="/cotizaciones" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Cotizaciones</Link></li>)}
                  {permissions.includes('menu_ver_pre_suficiencias') && (<li className="mb-1"><Link href="/pre_suficiencia" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Sol. Pre-Suficiencia</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/suficiencia" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Sol. Suficiencia</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/tablas_comparativas" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Tablas Comparativas*</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/adminProveedores/altaProveedor" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Admin. Proveedores*</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/catalogoProveedores" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Padron Proveedores *</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/pagosDashboard/pagos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Gestion de Pagos *</Link></li>)}

                  {/* Los links de Admin Proveedores y Pagos ya están en sus secciones */}
                </ul>
              )}
            </li>
          )}

          {permissions.includes('menu_ver_adqusiciones_administrativo_eventos') && (
            <li className="mb-1">
              <button onClick={() => setIsAdquisicionesOpen(!isAdquisicionesOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faWarehouse} className="mr-2 w-5" /> ADQUISICIONES EVENTOS</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isAdquisicionesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAdquisicionesOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                    {permissions.includes('menu_ver_solicitudes_pendientes') && ( <li className="mb-1"><Link href="/solicitantes/solicitudes" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Solicitudes</Link></li>)}
                    {permissions.includes('menu_ver_comite') && ( <li className="mb-1"><Link href="/comite" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faGavel} className="mr-2 w-5" /> Comité</Link></li>)}
                    {permissions.includes('menu_ver_contratos') && ( <li className="mb-1"><Link href="/adminProveedores/contratos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faFileContract} className="mr-2 w-5" /> Contratos</Link></li>)}
                    {permissions.includes('menu_ver_cotizaciones') && ( <li className="mb-1"><Link href="/cotizaciones" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Cotizaciones</Link></li>)}
                    {permissions.includes('menu_ver_pre_suficiencias') && ( <li className="mb-1"><Link href="/pre_suficiencia" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Sol. Pre-Suficiencia</Link></li>)}
                    {permissions.includes('menu_ver_solicitudes_suficiencias') && ( <li className="mb-1"><Link href="/suficiencia" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Sol. Suficiencia</Link></li>)}
                    {permissions.includes('menu_ver_solicitudes_suficiencias') && ( <li className="mb-1"><Link href="/tablas_comparativas" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Tablas Comparativas*</Link></li>)}
                    {permissions.includes('menu_ver_solicitudes_suficiencias') && ( <li className="mb-1"><Link href="/adminProveedores/altaProveedor" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Admin. Proveedores*</Link></li>)}
                    {permissions.includes('menu_ver_solicitudes_suficiencias') && ( <li className="mb-1"><Link href="/catalogoProveedores" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Padron Proveedores *</Link></li>)}
                    {permissions.includes('menu_ver_solicitudes_suficiencias') && ( <li className="mb-1"><Link href="/pagosDashboard/pagos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Gestion de Pagos *</Link></li>)}

                    {/* Los links de Admin Proveedores y Pagos ya están en sus secciones */}
                </ul>
              )}
            </li>
          )}

          {/* Sección COMITE */}
          {permissions.includes('menu_ver_comite') && (
            <li className="mb-1">
              <button onClick={() => setIsComiteOpen(!isComiteOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faGavel} className="mr-2 w-5" /> COMITÉ</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isComiteOpen ? 'rotate-180' : ''}`} />
              </button>
              {isComiteOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_comite_calendarios') && (<li className="mb-1"><Link href="/usuarios_comite" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Mis Comités</Link></li>)}
                  {permissions.includes('menu_ver_comite_calendarios') && (<li className="mb-1"><Link href="/ordenes_dia" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Órdenes del Día</Link></li>)} {/* Ruta corregida */}
                  {permissions.includes('menu_ver_comite_calendarios') && (<li className="mb-1"><Link href="/administracionAdquisiciones" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Admin Adjudicaciones</Link></li>)}
                  {permissions.includes('menu_ver_comite_calendarios') && (<li className="mb-1"><Link href="/comite" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Admin Calendarios</Link></li>)}
                  {/* ... otros links ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección CONCURSOS Y CONTRATOS */}
          {permissions.includes('menu_ver_modulo_concursos_contratos') && (
            <li className="mb-1">
              <button onClick={() => setIsConcursosOpen(!isConcursosOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faFolderOpen} className="mr-2 w-5" /> CONCURSOS</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isConcursosOpen ? 'rotate-180' : ''}`} />
              </button>
              {isConcursosOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_ajudicaciones') && (<li className="mb-1"><Link href="/adjudicaciones" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Adjudicaciones</Link></li>)} {/* Ruta corregida */}
                  {permissions.includes('menu_ver_concursos') && (<li className="mb-1"><Link href="/concursos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Concursos</Link></li>)}
                  {/* Contratos y Proveedores ya están en otras secciones */}
                  {/* ... otros links: Expedientes, Bases, Fallos ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección SECRETARIAS */}
          {permissions.includes('menu_ver_modulo_secretarias') && (
            <li className="mb-1">
              <button onClick={() => setIsSecretariasOpen(!isSecretariasOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faWarehouse} className="mr-2 w-5" /> SECRETARÍAS</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isSecretariasOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSecretariasOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_solicitudes_adquisiciones') && (<li className="mb-1"><Link href="/solicitantes/solicitudes" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Solicitudes Adq.</Link></li>)}
                  {permissions.includes('menu_ver_comite_secretarias') && (<li className="mb-1"><Link href="/usuarios_comite" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Mis Comités</Link></li>)}
                  {/* ... otros links ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección FINANZAS */}
          {permissions.includes('menu_ver_modulo_finanzas') && (
            <li className="mb-1">
              <button onClick={() => setIsFinanzasOpen(!isFinanzasOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faBuildingColumns} className="mr-2 w-5" /> FINANZAS</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isFinanzasOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFinanzasOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_solicitudes_pre_suficiencias_finanzas') && (<li className="mb-1"><Link href={{ pathname: "/pre_suficiencia", query: { tipo: "pre" } }} onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Sol. Pre-Suficiencia</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias_finanzas') && (<li className="mb-1"><Link href={{ pathname: "/pre_suficiencia", query: { tipo: "suf" } }} onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Sol. Suficiencia</Link></li>)}
                  {/* ... otros links ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección ADMINISTRACIÓN (Usuarios, Roles, Permisos) */}
          {permissions.includes('menu_ver_administracion') && (
            <li className="mb-1">
              <button onClick={() => setIsAdministracionOpen(!isAdministracionOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faUserCog} className="mr-2 w-5" /> Administración</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isAdministracionOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAdministracionOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_usuarios') && (<li className="mb-1"><Link href="/usuarios" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faUser} className="mr-2 w-5" /> Usuarios</Link></li>)}
                  {permissions.includes('menu_ver_roles') && (<li className="mb-1"><Link href="/roles" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faUserShield} className="mr-2 w-5" /> Roles</Link></li>)}
                  {permissions.includes('menu_ver_permisos') && (<li className="mb-1"><Link href="/permisos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faKey} className="mr-2 w-5" /> Permisos</Link></li>)}
                </ul>
              )}
            </li>
          )}

          {/* Separador antes del menú de sesión */}
          <hr className="my-4 border-gray-600" />

          {/* Menú de Sesión del Usuario */}
          {email && idUsuario && (
            <li className="mb-1">
              <button onClick={() => setIsSessionOpen(!isSessionOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center truncate" title={email}><FontAwesomeIcon icon={faUserCircle} className="mr-2 flex-shrink-0 w-5" /><span className="truncate">{email}</span></div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 flex-shrink-0 ${isSessionOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSessionOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-600 rounded-md p-2">
                  <li className="mb-1"><button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" onClick={() => openEditPassModal(parseInt(idUsuario))}><FontAwesomeIcon icon={faLock} className="mr-2 w-5" /> Modificar contraseña</button></li>
                  <li className="mb-1"><button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" onClick={() => openEditRostroModal(parseInt(idUsuario))}><FontAwesomeIcon icon={faSmile} className="mr-2 w-5" /> Agregar rostro facial</button></li>
                  <li className="mb-1"><button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} className="mr-2 w-5" /> Cerrar sesión</button></li>
                </ul>
              )}
            </li>
          )}
        </ul> {/* Fin Menú Lateral */}

        {/* Contenedor para Modales */}
        <div className="text-black">
          {/* Modal Modificar Usuario */}
          {isEditModalOpen && usuarioAEditar !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl text-black w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={closeEditModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Cerrar modal"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                <ModificarUsuario id_usuario={usuarioAEditar} onClose={closeEditModal} onUsuarioUpdated={() => { /* Podrías recargar datos si es necesario */ }} />
              </div>
            </div>
          )}
          {/* Modal Modificar Contraseña */}
          {isEditPassModalOpen && contraseñaEditar !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl text-black w-full max-w-md relative">
                <button onClick={closeEditPassModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Cerrar modal"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                <ModificarContraseña usuarioId={contraseñaEditar} onClose={closeEditPassModal} onConstraseñaModificado={() => { closeEditPassModal(); toast.success('Contraseña modificada'); }} />
              </div>
            </div>
          )}
          {/* Modal Modificar Rostro */}
          {isEditRostroModalOpen && rostroEditar !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl text-black w-full max-w-md relative">
                <button onClick={closeEditRostroModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Cerrar modal"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                <ModificarRostro usuarioId={rostroEditar} onClose={closeEditRostroModal} onUsuarioModificado={() => { closeEditRostroModal(); toast.success('Rostro actualizado/agregado'); }} />
              </div>
            </div>
          )}
        </div>
      </nav>
    </> // Fin Fragmento
  );
}