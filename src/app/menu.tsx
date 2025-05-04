// src/app/menu.tsx (o donde esté tu menú principal de admin)

"use client";
import React from 'react'; // Necesario para JSX y Toaster
import Link from "next/link";
import { useState, useEffect, useCallback } from "react"; // useCallback añadido
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars, faTimes, faChevronDown, faFileInvoiceDollar, faClipboardList,
  faFolderOpen, faClipboardCheck, faUserCog, faUser, faUsers, faUserShield,
  faKey, faUserCircle, faLock, faSmile, faSignOutAlt, faBuildingColumns, // Icono ejemplo Finanzas
  faFileSignature, // Icono ejemplo Contratos
  faFileContract,
  faGavel, // Icono ejemplo Comité/Concursos
  faWarehouse // Icono ejemplo Adquisiciones/Secretarías
} from "@fortawesome/free-solid-svg-icons";

// Modales (Asegúrate que las rutas sean correctas)
import ModificarUsuario from "./usuarios/formularios/modificar";
import ModificarContraseña from "./usuarios/formularios/modificarContraseña";
import ModificarRostro from "./usuarios/formularios/rostro";

// *** NUEVAS IMPORTACIONES ***
import { Toaster } from 'react-hot-toast'; // Importar el contenedor de toasts
import { usePusherNotifications } from '@/hooks/usePusherNotifications'; // Ajusta la ruta al hook

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
  const [isContratosOpen, setIsContratosOpen] = useState(false); // Si es una sección separada
  const [isSecretariasOpen, setIsSecretariasOpen] = useState(false);
  const [isFinanzasOpen, setIsFinanzasOpen] = useState(false);
  const [isAdministracionOpen, setIsAdministracionOpen] = useState(false); // Renombrado desde isUsuariosOpen
  const [isSessionOpen, setIsSessionOpen] = useState(false); // Renombrado desde isSession

  // Estados de sesión y permisos
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [id_usuario, setIdUsuario] = useState<string | null>(null); // Inicializar como null
  const [isLoadingSession, setIsLoadingSession] = useState(true); // Estado de carga de sesión

  // Estados de Modales (sin cambios)
  const [usuarioAEditar, setUsuarioAEditar] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false);
  const [contraseñaEditar, setContraseñaAEditar] = useState<number | null>(null);
  const [isEditRostroModalOpen, setIsRostroEditModalOpen] = useState(false);
  const [rostroEditar, setRostroAEditar] = useState<number | null>(null);

  // Handlers de Modales (sin cambios)
  const openEditModal = (id: number) => { setUsuarioAEditar(id); setIsEditModalOpen(true); };
  const closeEditModal = () => { setUsuarioAEditar(null); setIsEditModalOpen(false); };
  const openEditPassModal = (id: number) => { setContraseñaAEditar(id); setIsPassEditModalOpen(true); };
  const closeEditPassModal = () => { setContraseñaAEditar(null); setIsPassEditModalOpen(false); };
  const openEditRostroModal = (id: number) => { setRostroAEditar(id); setIsRostroEditModalOpen(true); };
  const closeEditRostroModal = () => { setRostroAEditar(null); setIsRostroEditModalOpen(false); };

  // useEffect para cargar sesión
  useEffect(() => {
    setIsLoadingSession(true); // Inicia carga
    console.log("Menu Admin: Verificando sesión...");
    const storedEmail = sessionStorage.getItem("userEmail") || "";
    const storedNombre = sessionStorage.getItem("userNombre") || "";
    const storedId = sessionStorage.getItem("userId") || null;
    const storedPermisos = sessionStorage.getItem("userPermissions");

    let parsedPermissions: string[] = [];
    let sessionValid = false;

    if (storedPermisos) {
      try {
        parsedPermissions = JSON.parse(storedPermisos);
        if (!Array.isArray(parsedPermissions)) {
          parsedPermissions = []; // Asegurar que sea un array
          console.warn("Menu Admin: Permisos en sessionStorage no son un array.");
        }
      } catch (e) {
        console.error("Menu Admin: Error parseando permisos.", e);
        parsedPermissions = [];
      }
    }

    // La sesión es válida si tenemos ID y al menos un permiso (o ajusta según tu lógica)
    if (storedId && parsedPermissions.length > 0) {
      setEmail(storedEmail);
      setNombre(storedNombre);
      setIdUsuario(storedId);
      setPermissions(parsedPermissions);
      sessionValid = true;
      console.log("Menu Admin: Sesión válida encontrada. UserID:", storedId);
    }

    if (!sessionValid) {
      console.warn("Menu Admin: Sesión inválida o incompleta. Redirigiendo a login.");
      // Limpiar estado local por si acaso antes de redirigir
      setEmail(""); setNombre(""); setIdUsuario(null); setPermissions([]);
      router.push(LOGIN_URL); // Redirigir si no es válida
    }

    setIsLoadingSession(false); // Termina carga
  }, [router]);

  // handleLogout (envuelto en useCallback)
  const handleLogout = useCallback(() => {
    console.log("Menu Admin: Cerrando sesión...");
    sessionStorage.clear(); // Limpia todo
    // Resetear estados
    setPermissions([]); setEmail(""); setNombre(""); setIdUsuario(null);
    setIsOpen(false); setIsSessionOpen(false); setIsAdministracionOpen(false);
    // Resetear todos los demás estados de submenús si los implementas
    setIsUsuariosProveedoresOpen(false); setIsAdminProveedoresOpen(false); // etc.
    router.push(LOGIN_URL);
  }, [router]);

  // --- *** INICIALIZAR EL HOOK DE PUSHER PARA ADMIN *** ---
  usePusherNotifications({
    channelName: 'admin-notifications', // Canal Fijo para Admin
    eventName: 'cambio_estado_proveedor', // Evento a escuchar
    enabled: !!id_usuario && !isLoadingSession, // Habilitar solo si hay ID y la sesión ya cargó
  });
  // --- *** FIN INICIALIZACIÓN PUSHER *** ---

  // Renderizado condicional mientras carga la sesión
  if (isLoadingSession) {
    return (
      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 animate-pulse">
        <div className="flex items-center justify-between">
          <span className="p-2"><FontAwesomeIcon icon={faBars} size="lg" /></span>
          <h1 className="text-xl font-bold">Sistema de Adquisiciones</h1>
          <div className="w-8 md:w-10"></div>
        </div>
      </nav>
    );
  }

  // Renderizado si no hay permisos (aunque useEffect ya debería haber redirigido)
  if (!id_usuario || permissions.length === 0) {
    return (
      <div className="bg-custom-color text-white w-full p-4 text-center">
        <p>No tienes acceso o la sesión ha expirado. Serás redirigido...</p>
      </div>
    );
  }

  // --- Renderizado Principal del Menú ---
  return (
    <> {/* Fragmento para Toaster y Nav */}
      {/* Contenedor de Toasts */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: 'border border-gray-200 shadow-lg rounded-lg p-4 text-sm',
          duration: 6000,
          style: { background: '#ffffff', color: '#374151' },
          // ... (estilos específicos por tipo si los deseas) ...
        }}
      />

      <nav className="bg-custom-color text-white w-full p-4 fixed top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 focus:outline-none hover:bg-blue-700 rounded-md transition duration-300" aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}>
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
          </button>
          <h1 className="text-xl font-bold">Sistema de Adquisiciones</h1>
          <div className="w-8 md:w-10"></div> {/* Placeholder */}
        </div>

        {/* Menú Lateral Desplegable */}
        <ul
          className={`${isOpen ? "translate-x-0" : "-translate-x-full"}
            transform transition-transform duration-300 ease-in-out fixed top-0 left-0 h-full w-72 p-4 overflow-y-auto z-40 shadow-xl`} // Ancho aumentado a w-72
          style={{ backgroundColor: "#0a1640" }}
        >
          {/* Botón Cerrar */}
          <li className="mb-4">
            <button onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" aria-label="Cerrar menú">
              <FontAwesomeIcon icon={faTimes} className="w-5" />
              <span className="ml-2">Cerrar Menú</span>
            </button>
          </li>

          {/* --- SECCIONES DEL MENÚ CON PERMISOS Y SUBMENÚS --- */}

          {/* Sección USUARIO PROVEEDORES (Ejemplo con submenú) */}
          {permissions.includes('menu_ver_usuarios_proveedores') && (
            <li className="mb-1">
              <button onClick={() => setIsUsuariosProveedoresOpen(!isUsuariosProveedoresOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faUserCircle} className="mr-2 w-5" /> USUARIO PROVEEDORES</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isUsuariosProveedoresOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUsuariosProveedoresOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_datos_generales_proveedores') && (<li className="mb-1"><Link href="/proveedores/datos_generales" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Datos generales</Link></li>)}
                  {permissions.includes('menu_ver_documentos_proveedores') && (<li className="mb-1"><Link href="/proveedores/documentos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Documentos</Link></li>)}
                  {/* ... otros links de esta sección ... */}
                  {permissions.includes('menu_ver_contratos_proveedores') && (<li className="mb-1"><Link href="/adminProveedores/contratos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faFileContract} className="mr-2 w-5" /> Contratos</Link></li>)}
                </ul>
              )}
            </li>
          )}

          {/* Sección ADMINISTRADOR DE PROVEEDORES (Ejemplo con submenú) */}
          {permissions.includes('menu_ver_administrador_proveedores') && (
            <li className="mb-1">
              <button onClick={() => setIsAdminProveedoresOpen(!isAdminProveedoresOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faUserCog} className="mr-2 w-5" /> ADMIN PROVEEDORES</div> {/* Icono cambiado */}
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isAdminProveedoresOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAdminProveedoresOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_solicitudes_proveedores') && (<li className="mb-1"><Link href="/adminProveedores/altaProveedor" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Solicitudes/Admin</Link></li>)} {/* Ruta corregida */}
                  {permissions.includes('menu_ver_padron_proveedores') && (<li className="mb-1"><Link href="/catalogoProveedores" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Padrón Proveedores</Link></li>)} {/* Ruta corregida */}
                  {/* ... otros links de esta sección ... */}
                  {permissions.includes('menu_ver_pagos_proveedores') && (<li className="mb-1"><Link href="/pagosDashboard/pagos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2 w-5" /> Admin Pagos</Link></li>)} {/* Ruta corregida */}
                </ul>
              )}
            </li>
          )}

          {/* Sección ADQUISICIONES (Ejemplo con submenú) */}
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
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/tablas_comparativas" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Tablas Comparativas *</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/adminProveedores/altaProveedor" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Admin Proveedores *</Link></li>)}
                  {permissions.includes('menu_ver_solicitudes_suficiencias') && (<li className="mb-1"><Link href="/pagosDashboard/pagos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Admin Pagos *</Link></li>)}
                </ul>
              )}
            </li>
          )}

          {/* Sección COMITE (Ejemplo con submenú) */}
          {permissions.includes('menu_ver_comite') && ( // Permiso general
            <li className="mb-1">
              <button onClick={() => setIsComiteOpen(!isComiteOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faGavel} className="mr-2 w-5" /> COMITÉ</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isComiteOpen ? 'rotate-180' : ''}`} />
              </button>
              {isComiteOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_comite_calendarios') && (<li className="mb-1"><Link href="/usuarios_comite" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Mis Comités</Link></li>)}
                  {/* ... otros links de comité ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección CONCURSOS Y CONTRATOS (Ejemplo con submenú) */}
          {permissions.includes('menu_ver_modulo_concursos_contratos') && (
            <li className="mb-1">
              <button onClick={() => setIsConcursosOpen(!isConcursosOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faFolderOpen} className="mr-2 w-5" /> CONCURSOS</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isConcursosOpen ? 'rotate-180' : ''}`} />
              </button>
              {isConcursosOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_concursos') && (<li className="mb-1"><Link href="/concursos" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardCheck} className="mr-2 w-5" /> Concursos</Link></li>)}
                  {/* ... otros links ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección SECRETARIAS (Ejemplo con submenú) */}
          {permissions.includes('menu_ver_modulo_secretarias') && (
            <li className="mb-1">
              <button onClick={() => setIsSecretariasOpen(!isSecretariasOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center"><FontAwesomeIcon icon={faWarehouse} className="mr-2 w-5" /> SECRETARÍAS</div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 ${isSecretariasOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSecretariasOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-700 rounded-md p-2">
                  {permissions.includes('menu_ver_solicitudes_adquisiciones') && (<li className="mb-1"><Link href="/solicitantes/solicitudes" onClick={() => setIsOpen(false)} className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"><FontAwesomeIcon icon={faClipboardList} className="mr-2 w-5" /> Solicitudes Adq.</Link></li>)}
                  {/* ... otros links ... */}
                </ul>
              )}
            </li>
          )}

          {/* Sección FINANZAS (Ejemplo con submenú) */}
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
          {email && id_usuario && (
            <li className="mb-1">
              <button onClick={() => setIsSessionOpen(!isSessionOpen)} className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md">
                <div className="flex items-center truncate" title={email}><FontAwesomeIcon icon={faUserCircle} className="mr-2 flex-shrink-0 w-5" /><span className="truncate">{email}</span></div>
                <FontAwesomeIcon icon={faChevronDown} className={`ml-2 transition-transform duration-200 flex-shrink-0 ${isSessionOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSessionOpen && (
                <ul className="ml-4 mt-1 space-y-1 bg-gray-600 rounded-md p-2">
                  <li className="mb-1"><button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" onClick={() => openEditPassModal(parseInt(id_usuario))}><FontAwesomeIcon icon={faLock} className="mr-2 w-5" /> Modificar contraseña</button></li>
                  <li className="mb-1"><button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md w-full text-left" onClick={() => openEditRostroModal(parseInt(id_usuario))}><FontAwesomeIcon icon={faSmile} className="mr-2 w-5" /> Agregar rostro facial</button></li>
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
              <div className="bg-white p-6 rounded-lg shadow-xl text-black w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"> {/* Estilos mejorados */}
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
                <ModificarContraseña usuarioId={contraseñaEditar} onClose={closeEditPassModal} onConstraseñaModificado={() => { closeEditPassModal(); toast.success('Contraseña modificada'); }} /> {/* Añadido toast */}
              </div>
            </div>
          )}
          {/* Modal Modificar Rostro */}
          {isEditRostroModalOpen && rostroEditar !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl text-black w-full max-w-md relative">
                <button onClick={closeEditRostroModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" aria-label="Cerrar modal"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                <ModificarRostro usuarioId={rostroEditar} onClose={closeEditRostroModal} onUsuarioModificado={() => { closeEditRostroModal(); toast.success('Rostro actualizado/agregado'); }} /> {/* Añadido toast */}
              </div>
            </div>
          )}
        </div>
      </nav>
    </> // Fin Fragmento
  );
}