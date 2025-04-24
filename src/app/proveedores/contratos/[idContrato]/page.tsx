"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchContractDetails } from '@/fetch/contratosFetch'; // Ajusta ruta
import { ContratoDetallado } from '@/types/contrato'; // Ajusta ruta
// Necesitamos buscar el perfil del proveedor también aquí
import { fetchProveedorByUserId } from '@/fetch/contratosFetch'; // Ajusta ruta
import { ProveedorDetallado } from '@/types/proveedor'; // Ajusta ruta

// --- Componente Vista Detalles (sin cambios necesarios) ---
// import ContractDetailView from '@/components/contratos/ContractDetailView';
interface ContractDetailViewProps { contrato: ContratoDetallado; }
const ContractDetailView: React.FC<ContractDetailViewProps> = ({ contrato }) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        // Asegura que la fecha se interprete correctamente (ej: UTC si viene sin timezone)
        return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    };

     // Función auxiliar para formatear moneda
    const formatCurrency = (amount: string | null, currency: string | null = 'MXN') => {
        if (amount === null || amount === undefined) return 'N/A';
        const numberAmount = parseFloat(amount);
        if (isNaN(numberAmount)) return 'Valor inválido';
        return numberAmount.toLocaleString('es-MX', { style: 'currency', currency: currency ?? 'MXN' });
    };

    return (
        <div className="space-y-4 p-4 border rounded shadow-sm bg-white">
            {/* Datos Generales del Contrato */}
            <h2 className="text-lg font-semibold border-b pb-2">Detalles del Contrato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                <p><strong>Número Contrato:</strong> {contrato.numero_contrato ?? 'N/A'}</p>
                <p><strong>ID Contrato:</strong> {contrato.id_contrato}</p>
                {/* Puedes ocultar IDs internos si no son relevantes para el proveedor */}
                {/* <p><strong>ID Solicitud:</strong> {contrato.id_solicitud ?? 'N/A'}</p> */}
                {/* <p><strong>ID Dictamen:</strong> {contrato.id_dictamen ?? 'N/A'}</p> */}
                <p><strong>ID Concurso:</strong> {contrato.id_concurso ?? 'N/A'}</p>
            </div>
            <p className="mt-2"><strong>Objeto del Contrato:</strong></p>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 border rounded">{contrato.objeto_contrato}</p>

             {/* Fechas y Monto */}
            <h3 className="text-md font-semibold pt-3 border-t mt-4">Vigencia y Monto</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                <p><strong>Fecha Firma:</strong> {formatDate(contrato.fecha_firma)}</p>
                <p><strong>Fecha Inicio:</strong> {formatDate(contrato.fecha_inicio)}</p>
                <p><strong>Fecha Fin:</strong> {formatDate(contrato.fecha_fin)}</p>
                <p className="md:col-span-2"><strong>Monto Total:</strong> {formatCurrency(contrato.monto_total, contrato.moneda)} ({contrato.moneda ?? 'MXN'})</p>
             </div>

             {/* Condiciones y Garantías */}
             {contrato.condiciones_pago && (
                <>
                    <h3 className="text-md font-semibold pt-3 border-t mt-4">Condiciones de Pago</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 border rounded">{contrato.condiciones_pago}</p>
                </>
            )}
             {contrato.garantias && (
                <>
                    <h3 className="text-md font-semibold pt-3 border-t mt-4">Garantías</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 border rounded">{contrato.garantias}</p>
                </>
            )}


            {/* Datos del Proveedor (Opcional mostrarlo aquí, ya que es el mismo usuario) */}
            {/* <h2 className="text-lg font-semibold pt-3 border-t mt-6">Mis Datos Registrados</h2> */}
            {/* ... (Podrías mostrar un resumen de sus propios datos si quieres) ... */}

        </div>
    );
};
// --- Fin Vista Detalles ---


// --- Componente Principal de la Página de Detalle (Proveedor) ---
const ProveedorContratoDetailPage: React.FC = () => {
    const params = useParams();
    const [contrato, setContrato] = useState<ContratoDetallado | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Carga general
    const [error, setError] = useState<string | null>(null);
    const [idContratoUrl, setIdContratoUrl] = useState<number | null>(null);
    const [proveedorUserId, setProveedorUserId] = useState<number | null>(null); // ID del USUARIO logueado
    const [proveedorIdVerificado, setProveedorIdVerificado] = useState<number | null>(null); // ID del PROVEEDOR asociado (verificado)
    const [accesoPermitido, setAccesoPermitido] = useState(false); // Control final

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
             console.log(`DetailPage: Attempting to fetch provider profile for user ID: ${proveedorUserId}`);
             try {
                const profile = await fetchProveedorByUserId(proveedorUserId as number);
                if (profile && profile.id_proveedor != null) {
                    setProveedorIdVerificado(profile.id_proveedor); // Guarda el ID de PROVEEDOR correcto
                    console.log(`DetailPage: Verified Provider ID obtained: ${profile.id_proveedor}`);
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
            console.log(`DetailPage: Cargando detalles contrato ${idContratoUrl} para proveedor verificado ${proveedorIdVerificado}`);

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
                    console.log(`DetailPage: Acceso verificado para contrato ${idContratoUrl}`);
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
                 <Link href="/proveedores/contratos" className="text-sm text-blue-600 hover:underline">
                    ← Volver a Mis Contratos
                </Link>
            </div>

            {/* Mensajes de Carga y Error */}
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

            {/* Vista de Detalles (Solo si no está cargando, no hay error Y el acceso fue permitido) */}
            {!isLoading && !error && contrato && accesoPermitido && (
                <ContractDetailView contrato={contrato} />
            )}

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