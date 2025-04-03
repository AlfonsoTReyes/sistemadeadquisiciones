"use client";
import React, { useState, useEffect, useCallback } from 'react';
import DynamicMenu from "../../../app/dinamicMenu"; // Ajusta ruta
import Pie from '../../../app/pie'; // Ajusta ruta
import TablaDocumentosProveedor from './tablaDocProveedores'; // Ajusta ruta
import GestionDocumentosProveedor from './formularios/altaDocProveedores'; // Ajusta ruta
import { fetchDocumentosPorProveedor } from './formularios/fetchDocumentosProveedores'; // Ajusta ruta
import { DocumentoProveedor } from "./interfaces"; // Ajusta ruta


const DocumentosProveedorPage = () => {
  const [idProveedor, setIdProveedor] = useState<number | null>(null);
  const [tipoProveedor, setTipoProveedor] = useState<string | null>(null);
  const [idUsuarioLogueado, setIdUsuarioLogueado] = useState<number | null>(null); // Estado para el ID del usuario

  const [documentos, setDocumentos] = useState<DocumentoProveedor[]>([]);
  const [loadingPage, setLoadingPage] = useState<boolean>(true); // Loading inicial de la página (para ID/Tipo/Usuario)
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false); // Loading específico para la lista de documentos
  const [errorPage, setErrorPage] = useState<string | null>(null); // Errores al cargar ID/Tipo/Usuario
  const [errorDocs, setErrorDocs] = useState<string | null>(null); // Errores al cargar/actualizar documentos


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
            // O si quieres forzar la capitalización correcta en el estado:
            // providerTypeFound = tipoNormalizado === 'moral' ? 'Moral' : 'Fisica';
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



  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4 md:p-8" style={{ marginTop: '80px' }}>
        <h1 className="text-2xl text-center sm:text-left font-bold mb-6">
          Documentos del Proveedor {idProveedor ? `(ID: ${idProveedor} - ${tipoProveedor || 'Tipo Desconocido'})` : ''}
        </h1>

        {loadingPage && <p>Cargando...</p>}

        {errorPage && !loadingPage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorPage}</span>
            </div>
        )}
                {!errorPage && idProveedor ? (
            <TablaDocumentosProveedor documentos={documentos} isLoading={loadingPage} />
        ) : !idProveedor && !loadingPage ? (
            // Mensaje si no se encontró ID de proveedor y no está cargando
             <p className="text-center text-gray-500 mt-10">No se ha especificado un proveedor.</p>
        ) : null /* Evita mostrar tabla o mensaje de "no docs" mientras carga ID */}

        {/* Renderizar la gestión de documentos solo si tenemos ID y Tipo y no hay error */}
        {!loadingPage && !errorPage && idProveedor && tipoProveedor && (
             <GestionDocumentosProveedor // O la lógica integrada aquí
                idProveedor={idProveedor}
                tipoProveedor={tipoProveedor} // <-- Pasa el tipo
                // ... otras props necesarias (idUsuarioLogueado, documentos, onRefresh, etc.)
                idUsuarioLogueado={idUsuarioLogueado} // Pasa el ID del usuario obtenido
                documentos={documentos}               // Pasa la lista de documentos del estado
                isLoadingDocs={loadingDocs}           // Pasa el estado de carga de la lista de docs
                errorGlobal={errorDocs}               // Pasa los errores específicos de la carga/actualización de docs
                onRefreshDocuments={fetchDocsCallback} // Pasa la función para refrescar la lista
             />
        )}

        {/* Mensaje si falta algo después de cargar */}
        {!loadingPage && !errorPage && (!idProveedor || !tipoProveedor) && (
            <p className="text-center text-gray-500 mt-10">No se ha podido determinar el proveedor o su tipo.</p>
        )}

      </div>
      <Pie />
    </div>
  );
};


export default DocumentosProveedorPage;