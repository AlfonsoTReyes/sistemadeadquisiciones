"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import ModificarUsuario from "./usuarios/formularios/modificar";
import ModificarContraseña from "./usuarios/formularios/modificarContraseña";
import ModificarRostro from "./usuarios/formularios/rostro";

export default function Menu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUsuariosOpen, setIsUsuariosOpen] = useState(false);
  const [isSession, setIsSessionOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [id_usuario, setIdusuario] = useState("");
  const [usuarioAEditar, setUsuarioAEditar] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditPassModalOpen, setIsPassEditModalOpen] = useState(false);
  const [contraseñaEditar, setContraseñaAEditar] = useState<number | null>(null);
  const [isEditRostroModalOpen, setIsRostroEditModalOpen] = useState(false);
  const [rostroEditar, setRostroAEditar] = useState<number | null>(null);

  const openEditModal = (id: number) => {
    setUsuarioAEditar(id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setUsuarioAEditar(null);
    setIsEditModalOpen(false);
  };

  const openEditPassModal = (id: number) => {
    setContraseñaAEditar(id);
    setIsPassEditModalOpen(true);
  };

  const closeEditPassModal = () => {
    setContraseñaAEditar(null);
    setIsPassEditModalOpen(false);
  };

  const openEditRostroModal = (id: number) => {
    setRostroAEditar(id);
    setIsRostroEditModalOpen(true);
  };

  const closeEditRostroModal = () => {
    setRostroAEditar(null);
    setIsRostroEditModalOpen(false);
  };

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail") || "";
    setEmail(email);
    const nombreGuardado = sessionStorage.getItem("userNombre") || "";
    setNombre(nombreGuardado);
    const id = sessionStorage.getItem("userId") || "";
    setIdusuario(id);

    const permisos = sessionStorage.getItem("userPermissions");
    if (permisos) {
      setPermissions(JSON.parse(permisos));
    } else {
      setPermissions([]);
      router.push("/");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userPermissions");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userNombre");
    sessionStorage.removeItem("userId");
    sessionStorage.clear();
    setPermissions([]);
    router.push("login");
  };

  if (!permissions || permissions.length === 0) {
    return (
      <div className="bg-custom-color text-white w-full p-4 text-center">
        <p>
          No tienes acceso al sistema. Por favor, contacta al administrador.
        </p>
      </div>
    );
  }

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
        {permissions.includes('menu_ver_usuarios_proveedores') && (
          <>
            <li className="mb-1">
              <button
                onClick={() => setIsSessionOpen(!isSession)}
                className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> USUARIO PROVEEDORES
                </div>
              </button>
            </li>

          {permissions.includes('menu_ver_datos_generales_proveedores') && (
            <li className="mb-1">
              <Link
                href="/proveedores/datos_generales"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Datos generales
              </Link>
            </li>
          )}

          {permissions.includes('menu_ver_documentos_proveedores') && (
            <li className="mb-1">
              <Link
                href="/proveedores/documentos"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Documentos
              </Link>
            </li>
          )}

          {permissions.includes('menu_ver_pagos_proveedores') && (
            <li className="mb-1">
              <Link
                href="/requirente"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Pagos
              </Link>
            </li>
          )}

          {permissions.includes('menu_ver_concursos_proveedores') && (
            <li className="mb-1">
              <Link
                href="/requirente"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Consulta de concursos
              </Link>
            </li>
          )}

          {permissions.includes('menu_ver_contratos_proveedores') && (
            <li className="mb-1">
              <Link
                href="/adminProveedores/contratos"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Contratos *
              </Link>
            </li>
          )}
          {permissions.includes('menu_ver_ordenes_compra_proveedores') && (
            <li className="mb-1">
              <Link
                href="/requirente"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Ordenes de compras
              </Link>
            </li>
          )}
          {permissions.includes('menu_ver_recepcion_articulo') && (
            <li className="mb-1">
              <Link
                href="/requirente"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Recepción de articulo
              </Link>
            </li>
          )}
          {permissions.includes('menu_ver_polizas') && (
            <li className="mb-1">
              <Link
                href="/requisicion"
                className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Polizas
              </Link>
            </li>
          )}
          </>
        )}

        {permissions.includes('menu_ver_administrador_proveedores') && (
          <>
              <li className="mb-1">
                <button
                  onClick={() => setIsSessionOpen(!isSession)}
                  className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> ADMINISTRADOR DE PROVEEDORES
                  </div>
                  <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                </button>
              </li>
            {permissions.includes('menu_ver_solicitudes_proveedores') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Solicitudes de proveedores
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_padron_proveedores') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Padrón de proveedores
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_renovaciones_altas_proveedores') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Renovaciones y altas
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_pagos_proveedores') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Pagos
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_notificaciones_proveedores') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Envio de notificaciones
                </Link>
              </li>
            )}
          </>
        )}

        {permissions.includes('menu_ver_adqusiciones_administrativo') && (
          <>
            <li className="mb-1">
              <button
                onClick={() => setIsSessionOpen(!isSession)}
                className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> ADQUISCIONES
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
              </button>
            </li>

            {permissions.includes('menu_ver_solicitudes_pendientes') && (
              <li className="mb-1">
                <Link
                  href="/solicitantes/solicitudes"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Solicitudes
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_comite') && (
              <li className="mb-1">
                <Link
                  href="/comite"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Comité
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_contratos') && (
              <li className="mb-1">
                <Link
                  href="/adminProveedores/contratos"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Contratos *
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_cotizaciones') && (
              <li className="mb-1">
                <Link
                  href="/cotizaciones"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Cotizaciones
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_pre_suficiencias') && (
              <li className="mb-1">
                <Link
                  href="/pre_suficiencia"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Solicitudes pre suficiencia
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_solicitudes_suficiencias') && (
              <li className="mb-1">
                <Link
                  href="/suficiencia"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Solicitudes suficiencia
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_solicitudes_suficiencias') && (
              <li className="mb-1">
                <Link
                  href="/adminProveedores/altaProveedor"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Administrar Proveedores *
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_solicitudes_suficiencias') && (
              <li className="mb-1">
                <Link
                  href="/catalogoProveedores"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Padron de Proveedores *
                </Link>
              </li>
            )}
                        {permissions.includes('menu_ver_solicitudes_suficiencias') && (
              <li className="mb-1">
                <Link
                  href="/pagosDashboard/pagos"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Administrar Pagos *
                </Link>
              </li>
            )}
                                    {permissions.includes('menu_ver_solicitudes_suficiencias') && (
              <li className="mb-1">
                <Link
                  href="/tablas_comparativas"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Tablas Comparativas *
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_recepcion_articulo') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Recepción de articulo
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_comite') && (
              <li className="mb-1">
                <button
                  onClick={() => setIsSessionOpen(!isSession)}
                  className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> COMITE
                  </div>
                  <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
                </button>
              </li>
            )}

            {permissions.includes('menu_ver_comite_calendarios') && (
              <li className="mb-1">
                <Link
                  href="/usuarios_comite"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Mis comites
                </Link>
              </li>
            )}
            
            {permissions.includes('menu_ver_comite_calendarios') && (
              <li className="mb-1">
                <Link
                  href="/usuarios_comite"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Dictamenes comite
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_comite_calendarios') && (
              <li className="mb-1">
                <Link
                  href="/administracionAdquisiciones"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Administración de adquisiciones
                </Link>
              </li>
            )}
            
            {permissions.includes('menu_ver_comite_calendarios') && (
              <li className="mb-1">
                <Link
                  href="/comite"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Comite calendarios
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_comite_extraordinarios') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Comite extraordinarios
                </Link>
              </li>
            )}
          </>
        )}

        {permissions.includes('menu_ver_modulo_concursos_contratos') && (
          <>
            <li className="mb-1">
              <button
                onClick={() => setIsSessionOpen(!isSession)}
                className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> CONCURSOS Y CONTRATOS
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
              </button>
            </li>
            
            {permissions.includes('menu_ver_ajudicaciones') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Adjudicaciones
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_concursos') && (
              <li className="mb-1">
                <Link
                  href="/concursos"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Concursos
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_contratos') && (
              <li className="mb-1">
                <Link
                  href="/adminProveedores/contratos"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Contratos *
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_proveedores_participantes') && (
              <li className="mb-1">
                <Link
                  href="/adminProveedores/adltaProveedor"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Proveedores *
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_expendientes') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Expedientes
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_bases') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Bases
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_fallos') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Fallos
                </Link>
              </li>
            )}
          </>
        )}

        {permissions.includes('menu_ver_contratos') && (
          <>
            <li className="mb-1">
              <button
                onClick={() => setIsSessionOpen(!isSession)}
                className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> CONTRATOS
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
              </button>
            </li>
            {permissions.includes('menu_ver_adquisiciones') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Adquisiciones
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_contratos_espera') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Contatos en espera
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_contratos_aprobados') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Aprobados
                </Link>
              </li> 
            )}
            {permissions.includes('menu_ver_padron_proveedores') && (
              <li className="mb-1">
                <Link
                  href="/requisicion"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="mr-2" /> Padrón de proveedores
                </Link>
              </li> 
            )}
          </>
        )}

        {permissions.includes('menu_ver_modulo_secretarias') && (
          <>
            <li className="mb-1">
              <button
                onClick={() => setIsSessionOpen(!isSession)}
                className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> SECRETARIAS
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
              </button>
            </li>
            {permissions.includes('menu_ver_solicitudes_adquisiciones') && (
              <li className="mb-1">
                <Link
                  href="/solicitantes/solicitudes"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Solicitudes de Adquisiciones
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_comite_secretarias') && (
              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Comité
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_contratos_secretarias') && (
              <li className="mb-1">
                <Link
                  href="/adminProveedores/contratos"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Contratos *
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_cotizaciones_secretarias') && (
              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Cotizaciones
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_suficiencias_pre_aprobadas') && (
              <li className="mb-1">
                <Link
                  href="/pre_suficiencia"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Suficiencias pre aprobadas
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_ordenes_compra_secretarias') && (
              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Ordenes de compra
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_recepcion_articulo_secretarias') && (
              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Recepción de articulo
                </Link>
              </li>
            )}
            {permissions.includes('menu_ver_seguimientos_secretarias') && (
              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Seguimientos
                </Link>
              </li>
            )}
          </>
        )}
        {permissions.includes('menu_ver_modulo_finanzas') && (
          <>
            <li className="mb-1">
              <button
                onClick={() => setIsSessionOpen(!isSession)}
                className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> FINANZAS
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
              </button>
            </li>
            {permissions.includes('menu_ver_solicitudes_pre_suficiencias_finanzas') && (
              <li className="mb-1">
                <Link
                  href={{ pathname: "/pre_suficiencia", query: { tipo: "pre" } }}
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Solicitudes pre suficiencia
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_solicitudes_suficiencias_finanzas') && (
              <li className="mb-1">
                <Link
                  href={{ pathname: "/pre_suficiencia", query: { tipo: "suf" } }}
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Solicitudes suficiencia
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_comite') && (

              <li className="mb-1">
                <Link
                  href="/comite"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Comite
                </Link>
              </li>
            )}
            
            {permissions.includes('menu_ver_cotizaciones_finanzas') && (

              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Cotizaciones
                </Link>
              </li>
            )}

            {permissions.includes('menu_ver_ordenes_compra_finanzas') && (

              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Ordenes de compras
                </Link>
              </li>
            )}
            
            {permissions.includes('menu_ver_solicitudes_polizas_finanzas') && (

              <li className="mb-1">
                <Link
                  href="/requirente"
                  className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                >
                  <FontAwesomeIcon icon={faClipboardList} className="mr-2" /> Polizas
                </Link>
              </li>
            )}
            
          </>
        )}

        {permissions.includes('menu_ver_administracion') && (
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
                  {permissions.includes('menu_ver_usuarios') && (
                    <li className="mb-1">
                      <Link
                        href="/usuarios"
                        className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                      >
                        <FontAwesomeIcon icon={faUser} className="mr-2" /> Usuarios
                      </Link>
                    </li>
                  )}
                  {permissions.includes('menu_ver_roles') && (
                    <li className="mb-1">
                    <Link
                      href="/roles"
                      className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                      >
                        <FontAwesomeIcon icon={faUserShield} className="mr-2" /> Roles
                      </Link>
                    </li>
                  )}
                  {permissions.includes('menu_ver_permisos') && (
                    <li className="mb-1">
                      <Link
                        href="/permisos"
                        className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                      >
                        <FontAwesomeIcon icon={faKey} className="mr-2" /> Permisos
                      </Link>
                    </li>
                  )}
                  </ul>
                )}
          </li>
        )}
          

        <li className="mb-1">
          <button
            onClick={() => setIsSessionOpen(!isSession)}
            className="flex items-center justify-between w-full text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
          >
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUserCircle} className="mr-2" /> {email}
            </div>
            <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
          </button>
          {isSession && (
            <ul className="ml-1 mt-1 space-y-1 bg-gray-600 rounded-md p-2">
              <li className="mb-1">
                <button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                  onClick={() => openEditPassModal(parseInt(id_usuario))}>
                  <FontAwesomeIcon icon={faLock} className="mr-2" /> Modificar contraseña
                </button>
              </li>
              <li className="mb-1">
                <button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                  onClick={() => openEditRostroModal(parseInt(id_usuario))}>
                  <FontAwesomeIcon icon={faSmile} className="mr-2" /> Agregar rostro facial
                </button>
              </li>
              <li className="mb-1">
                <button className="flex items-center text-white hover:bg-[#faa21b] px-4 py-2 rounded-md"
                  onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Cerrar sesión
                </button>
              </li>
            </ul>
          )}
        </li>
      </ul>
      <div className="text-black">
        {isEditModalOpen && usuarioAEditar !== null && (
          <div className="modal-overlay">
            <div className="modal-content text-black">
              <ModificarUsuario
                id_usuario={usuarioAEditar}
                onClose={closeEditModal}
                onUsuarioUpdated={() => {}}
              />
            </div>
          </div>
        )}
        {isEditPassModalOpen && contraseñaEditar !== null && (
          <div className="modal-overlay">
            <div className="modal-content text-black">
              <ModificarContraseña
                usuarioId={contraseñaEditar}
                onClose={closeEditPassModal}
                onConstraseñaModificado={() => {}}
              />
            </div>
          </div>
        )}
        {isEditRostroModalOpen && rostroEditar !== null && (
          <div className="modal-overlay">
            <div className="modal-content text-black">
              <ModificarRostro
                usuarioId={rostroEditar}
                onClose={closeEditRostroModal}
                onUsuarioModificado={() => {}}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
