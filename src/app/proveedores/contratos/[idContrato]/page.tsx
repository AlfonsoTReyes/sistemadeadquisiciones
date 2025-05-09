"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchContractDetails } from '@/fetch/contratosFetch'; // Ajusta ruta
import { ContratoDetallado } from '@/types/contrato'; // Ajusta ruta
import { fetchProveedorByUserId } from '@/fetch/contratosFetch'; // Ajusta ruta // TODO: Asegúrate que esté en el fetch correcto
import { ProveedorDetallado } from '@/types/proveedor'; // Ajusta ruta

// *** USA LA VERSIÓN IMPORTADA DEL COMPONENTE ***
import ContractDetailView from '@/componentes/contratos/ContractDetailView'; // <-- ASEGÚRATE QUE ESTA RUTA SEA CORRECTA



// --- Componente Principal de la Página de Detalle (Proveedor) ---
const ProveedorContratoDetailPage: React.FC = () => {
    const params = useParams();
    const [contrato, setContrato] = useState<ContratoDetallado | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [idContratoUrl, setIdContratoUrl] = useState<number | null>(null);
    const [proveedorUserId, setProveedorUserId] = useState<number | null>(null);
    const [proveedorIdVerificado, setProveedorIdVerificado] = useState<number | null>(null);
    const [accesoPermitido, setAccesoPermitido] = useState(false);

    // ... (useEffect 1, 2, 3, 4 sin cambios) ...
    // 1. Extraer ID del contrato de la URL
    useEffect(() => {
        const idStr = params.idContrato as string;
        if (idStr) {
            const idNum = parseInt(idStr, 10);
            if (!isNaN(idNum)) {
                setIdContratoUrl(idNum);
            } else {
                setError("El ID del contrato en la URL no es válido.");
                setIsLoading(false);
            }
        } else {
             setError("No se encontró el ID del contrato en la URL.");
             setIsLoading(false);
        }
    }, [params]);

    // 2. Obtener ID del USUARIO desde sessionStorage
    useEffect(() => {
        const userIdString = sessionStorage.getItem("proveedorUserId");
        if (userIdString) {
            const userIdNum = parseInt(userIdString, 10);
            if (!isNaN(userIdNum)) {
                setProveedorUserId(userIdNum);
            } else {
                setError("Error: ID de usuario inválido en la sesión.");
                 // No detener carga aquí, necesitamos ambos IDs para continuar
            }
        } else {
            setError("Error: No se encontró ID de usuario en la sesión.");
             // No detener carga aquí
        }
    }, []); // Se ejecuta solo una vez

    // 3. Obtener el ID del PROVEEDOR asociado al USUARIO logueado
    useEffect(() => {
        // Ejecutar solo si tenemos el ID de usuario y no hay error fatal previo
        if (proveedorUserId === null || (error && !error.includes("ID de contrato")) ) { // Solo continuar si el error no es del ID de contrato
             if (error) setIsLoading(false); // Detener si hubo error al leer userId
             return;
        }

        const loadProveedorId = async () => {
             if (!error) setIsLoading(true); // Poner en carga si no hubo error antes
             setError(null); // Limpiar errores
             try {
                const profile = await fetchProveedorByUserId(proveedorUserId as number);
                if (profile && profile.id_proveedor != null) {
                    setProveedorIdVerificado(profile.id_proveedor); // Guarda el ID de PROVEEDOR correcto
                } else {
                    setError("Error: No se encontró un perfil de proveedor asociado a su usuario.");
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("DetailPage: Error fetching provider profile:", err);
                setError(`Error al obtener información del proveedor: ${(err as Error).message}`);
                setIsLoading(false);
            }
        };

        loadProveedorId();
    }, [proveedorUserId, error]); // Depende del ID de usuario

    // 4. Cargar detalles del contrato y VERIFICAR PROPIEDAD usando el ID de PROVEEDOR verificado
    useEffect(() => {
        // Ejecutar solo si tenemos ID del contrato, ID del proveedor verificado y no hay error fatal
        if (idContratoUrl === null || proveedorIdVerificado === null || error !== null) {
            if (error) setIsLoading(false); // Detener si hubo error obteniendo proveedorId
            return;
        }

        const loadAndVerifyDetails = async () => {
            if (!error) setIsLoading(true); // Poner en carga
            setError(null);
            setContrato(null);
            setAccesoPermitido(false); // Resetear

            // *** Mensaje de Log Corregido ***

            try {
                const data = await fetchContractDetails(idContratoUrl);

                // *** ¡VERIFICACIÓN EN CLIENTE CON EL ID CORRECTO! ***
                if (data.id_proveedor !== proveedorIdVerificado) { // Compara ID del contrato vs ID del proveedor verificado
                    console.warn(`DetailPage: Acceso denegado: Contrato ${idContratoUrl} pertenece a ${data.id_proveedor}, usuario logueado es proveedor ${proveedorIdVerificado}`);
                    setError("Acceso denegado. Este contrato no le pertenece.");
                    // Guardamos el contrato por si se quiere mostrar un mensaje, pero marcamos acceso como no permitido
                    setContrato(data);
                    setAccesoPermitido(false);
                } else {
                    // Si la verificación pasa
                    setContrato(data);
                    setAccesoPermitido(true); // Permitir acceso
                }

            } catch (err) {
                console.error(`DetailPage: Error al cargar/verificar detalles (Contrato ID ${idContratoUrl}, Proveedor ID ${proveedorIdVerificado}):`, err);
                setError(`Error al cargar detalles: ${(err as Error).message}`);
                setContrato(null); // Asegurar que no se muestren datos viejos/inválidos
            } finally {
                setIsLoading(false); // Termina la carga aquí
            }
        };

        loadAndVerifyDetails();
    }, [idContratoUrl, proveedorIdVerificado, error]); // Depende de ambos IDs y del estado de error


    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                 <h1 className="text-xl font-semibold">Detalle de Mi Contrato {idContratoUrl ? `(ID: ${idContratoUrl})` : ''}</h1>
                 <Link href="/proveedores/contratos" className="text-sm text-blue-600 hover:underline"> {/* <-- Asegúrate que esta ruta sea correcta */}
                    ← Volver a Mis Contratos
                </Link>
            </div>

            {/* Mensajes de Carga y Error (sin cambios) */}
            {isLoading && (
                <div className="text-center p-4">
                    <p>Cargando detalles...</p>
                </div>
            )}
            {error && !isLoading && (
                <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {/* Vista de Detalles - AHORA USA EL COMPONENTE IMPORTADO */}
            {!isLoading && !error && contrato && accesoPermitido && (
                // Pasar la ruta base para proveedores si quieres enlaces correctos dentro
                <ContractDetailView contrato={contrato} linkBasePath="/proveedores" />
            )}

             {/* Mensaje de acceso denegado (sin cambios) */}

             {/* Mensaje específico si se cargó el contrato pero el acceso fue denegado */}
             {!isLoading && !error && contrato && !accesoPermitido && (
                 <div className="p-3 mb-4 border-l-4 bg-yellow-100 border-yellow-500 text-yellow-700" role="alert">
                    <p className="font-bold">Acceso denegado. Este contrato no le pertenece.</p>
                 </div>
            )}

        </div>
    );
};

export default ProveedorContratoDetailPage;