"use client";
import React, { useState, useEffect, useCallback } from 'react';
import DynamicMenu from "../../../app/dinamicMenu"; // Ajusta ruta
import { useRouter } from 'next/navigation';
import Pie from '../../../app/pie'; // Ajusta ruta
import TablaDocumentosProveedor from './tablaDocProveedores'; // Ajusta ruta
import GestionDocumentosProveedor from './formularios/altaDocProveedores'; // Ajusta ruta
import { fetchDocumentosPorProveedor } from './formularios/fetchDocumentosProveedores'; // Ajusta ruta
import { DocumentoProveedor } from "./interfaces"; // Ajusta ruta
import ModalDoc from '../../../componentes/ModalDoc/modalDoc';


const DocumentosProveedorPage = () => {
    const router = useRouter();
  const [idProveedor, setIdProveedor] = useState<number | null>(null);
  const [tipoProveedor, setTipoProveedor] = useState<string | null>(null);
  const [idUsuarioLogueado, setIdUsuarioLogueado] = useState<number | null>(null); // Estado para el ID del usuario

  const [documentos, setDocumentos] = useState<DocumentoProveedor[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(true); // Loading inicial de la página (para ID/Tipo/Usuario)
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false); // Loading específico para la lista de documentos
  const [errorPage, setErrorPage] = useState<string | null>(null); // Errores al cargar ID/Tipo/Usuario
  const [errorDocs, setErrorDocs] = useState<string | null>(null); // Errores al cargar/actualizar documentos

  // --- Estado para el Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  // 1. Efecto para obtener IDs y Tipo desde sessionStorage al montar
  useEffect(() => {
    let providerIdFound: number | null = null;
    let providerTypeFound: string | null = null;
    let userIdFound: number | null = null;
    let errorFound: string | null = null;

    if (typeof window !== "undefined") {
      // Leer ID Proveedor
      const storedId = sessionStorage.getItem("proveedorId");
      if (storedId) {
        const parsedId = parseInt(storedId, 10);
        providerIdFound = !isNaN(parsedId) ? parsedId : null;
        if (!providerIdFound) errorFound = "ID de proveedor inválido en sesión.";
      } else {
        errorFound = "No se encontró ID de proveedor en sesión.";
      }

// 2. Leer Tipo (solo si no hubo error con el ID)
      if (!errorFound) {
        const storedTipo = sessionStorage.getItem("proveedorTipo"); // <-- Leer la clave
        console.log("Tipo leído de sessionStorage:", storedTipo); // <-- Añade un log para depurar

        // --- VALIDACIÓN INSENSIBLE AL CASO ---
        // Convierte a minúsculas (o mayúsculas) para comparar
        const tipoNormalizado = storedTipo?.toLowerCase(); // Convierte a minúsculas

        if (tipoNormalizado && (tipoNormalizado === 'moral' || tipoNormalizado === 'fisica')) {
            // Guardamos el valor original leído de sessionStorage, o uno normalizado si prefieres
            providerTypeFound = storedTipo; // Guarda 'moral' o 'fisica' (el original)
        } else {
            // Error si falta el tipo o no es válido (incluso después de normalizar)
            errorFound = `Tipo de proveedor ('${storedTipo || 'ninguno'}') inválido o no encontrado en sesión.`;
            providerIdFound = null; // Invalida el ID si el tipo es incorrecto
        }
        // --- FIN VALIDACIÓN ---
      }

      // Leer ID Usuario (siempre, pero marca error si falta y se necesita)
       const storedUserId = sessionStorage.getItem("proveedorUserId"); // Usa la clave correcta para el usuario
       if (storedUserId) {
            const parsedUserId = parseInt(storedUserId, 10);
            userIdFound = !isNaN(parsedUserId) ? parsedUserId : null;
            if (!userIdFound && !errorFound) { // Si no había otro error, este es el nuevo error
                errorFound = "ID de usuario inválido en sesión.";
                providerIdFound = null; // Invalida todo si el usuario falla
                providerTypeFound = null;
            }
       } else if (!errorFound) { // Si no había otro error y falta el ID de usuario
           errorFound = "No se encontró ID de usuario en sesión.";
           providerIdFound = null; // Invalida todo
           providerTypeFound = null;
       }

    } else {
        errorFound = "Entorno no válido (no es navegador).";
    }

    // Actualizar estados
    if (errorFound) {
        setErrorPage(errorFound);
        setIdProveedor(null);
        setTipoProveedor(null);
        setIdUsuarioLogueado(null);
    } else {
        setIdProveedor(providerIdFound);
        setTipoProveedor(providerTypeFound);
        setIdUsuarioLogueado(userIdFound); // Guarda el ID del usuario
        setErrorPage(null);
    }
    setLoadingPage(false); // Termina la carga inicial de IDs/Tipo

  }, []); // Ejecutar solo al montar



  // 2. Función para cargar/recargar los documentos (depende de idProveedor)
  const fetchDocsCallback = useCallback(async () => {
    if (!idProveedor) {
      // console.log("fetchDocsCallback: Skipping, no idProveedor."); // Debug
      setDocumentos([]); // Asegura limpiar si se pierde el idProveedor
      setLoadingDocs(false); // Asegura que no se quede cargando
      return;
    }
    // console.log(`fetchDocsCallback: Fetching for ID ${idProveedor}`); // Debug
    setErrorDocs(null); // Limpia error específico de documentos
    setLoadingDocs(true);
    try {
      const data = await fetchDocumentosPorProveedor(idProveedor);
      setDocumentos(data || []);
    } catch (err: any) {
      console.error("Error al obtener documentos del proveedor:", err);
      setErrorDocs(`No se pudieron cargar los documentos: ${(err as Error).message}`);
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [idProveedor]); // Dependencia: idProveedor

  useEffect(() => {
    if (idProveedor && !loadingPage) { // Ejecuta solo si tenemos ID y la carga inicial de IDs terminó
        fetchDocsCallback();
    }
}, [idProveedor, loadingPage, fetchDocsCallback]); // Dependencias correctas

  // Este handler se pasa a ProveedorData o se usa en un botón aquí
  const handleOpenDocumentsModal = () => {
    if (idProveedor && tipoProveedor) {
      console.log(`Opening documents modal for ID: ${idProveedor}, Type: ${tipoProveedor}`); // Debug
      openModal(); // <-- Simplemente abre el modal
    } else {
      console.error("Faltan datos (ID o Tipo) para abrir modal de documentos. Data:", idProveedor);
      setErrorPage("No se pueden gestionar los documentos: faltan datos del proveedor.");
      alert("No se pueden gestionar los documentos porque no se cargaron los datos del proveedor correctamente (falta ID o Tipo).");
    }
};

const handleRegresar = () => {
  router.push('/proveedores/dashboard');
};

  // --- NUEVA FUNCIÓN: Cierra el modal Y recarga la página ---
  const handleCloseAndReload = () => {
    closeModal(); // Llama a la función original para cerrar
    // Forzar recarga de la página actual
    // Usamos un pequeño delay por si acaso el cierre del modal necesita un instante
    // aunque generalmente no es estrictamente necesario.
    setTimeout(() => {
        window.location.reload();
    }, 50); // 50ms delay (opcional)
};

  return (
    <div>
<DynamicMenu />
      <div className="min-h-screen p-4 md:p-8" style={{ marginTop: '80px' }}>
        <h1 className="text-2xl text-center sm:text-left font-bold mb-6">
          Documentos del Proveedor
        </h1>

        {loadingPage && <p>Cargando...</p>}

        {errorPage && !loadingPage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorPage}</span>
            </div>
        )}
                {!loadingPage && idProveedor && !errorPage && (
             <div className="mt-6 pt-6 border-t text-center flex justify-between">
                <button
                    onClick={handleRegresar}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow"
                >
                    Regresar
                </button>
                <button
                    onClick={handleOpenDocumentsModal}
                    className="bg-indigo-500 hover:bg-indigo-800 text-white font-bold py-2 px-6 rounded shadow"
                >
                    Gestionar Documentos
                </button>
            </div>
        )}
                {!errorPage && idProveedor ? (
            <TablaDocumentosProveedor documentos={documentos} isLoading={loadingPage} />
        ) : !idProveedor && !loadingPage ? (
            // Mensaje si no se encontró ID de proveedor y no está cargando
             <p className="text-center text-gray-500 mt-10">No se ha especificado un proveedor.</p>
        ) : null /* Evita mostrar tabla o mensaje de "no docs" mientras carga ID */}


        <ModalDoc isOpen={isModalOpen} onClose={closeModal}> {/* <-- Cambiado de <Modal> a <ModalDoc> */}
          {idProveedor && tipoProveedor ? (
              <GestionDocumentosProveedor
                  idProveedor={idProveedor}
                  tipoProveedor={tipoProveedor}
                  onClose={handleCloseAndReload} // <--- ¡Aquí se pasa la función que recarga!
                  
              />
          ) : (
             <div className="p-6 text-center">
                 <p className="text-red-500">Error: No se pudo cargar la información del proveedor para gestionar documentos.</p>
                 <button onClick={closeModal} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Cerrar</button>
             </div>
          )}
      </ModalDoc> {/* <-- Cambiado de </Modal> a </ModalDoc> */}
  
        </div>
      <Pie />
    </div>
  );
};


export default DocumentosProveedorPage;