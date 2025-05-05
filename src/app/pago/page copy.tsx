'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/lib/pago/fetchApi'; // Asegúrate que la ruta sea correcta
import { IniciarPagoPHPResponse } from '@/types/pago'; // Asegúrate que la ruta sea correcta
import Menu from '@/app/menu_proveedor';
import Pie from "@/app/pie";
// Importa iconos si quieres añadirlos a los mensajes (opcional)
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'; // Necesitarás instalar @heroicons/react: npm install @heroicons/react

const TRAMITES_DISPONIBLES = [
    { key: "Proveedores", label: "Proveedores" }
];

const IFRAME_ALLOWED_ORIGINS = [
    "https://u.mitec.com.mx",
    "https://vip.epago.com.mx",
    "https://bc.mitec.com.mx"
];

export default function PaginaPago() {
    // --- Estados (sin cambios) ---
    const [selectedTramite, setSelectedTramite] = useState<string>(TRAMITES_DISPONIBLES[0].key);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [encryptedData, setEncryptedData] = useState<string | null>(null);
    const [referenciaPago, setReferenciaPago] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // --- Lógica handlePagarClick (sin cambios) ---
    const handlePagarClick = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        setPaymentUrl(null);
        setEncryptedData(null);
        setReferenciaPago(null);

        try {
            console.log(`Frontend: Llamando a /api/pagos/iniciar para trámite: ${selectedTramite}`);
            const response = await fetchApi<IniciarPagoPHPResponse>('/pagos/iniciar', {
                method: 'POST',
                data: { tramite: selectedTramite },
            });

            if (response.success && response.paymentUrl && response.encryptedRequestData && response.reference) {
                console.log("Frontend: URL de pago recibida:", response.paymentUrl);
                console.log("Frontend: Referencia recibida:", response.reference);
                setPaymentUrl(response.paymentUrl);
                setEncryptedData(response.encryptedRequestData);
                setReferenciaPago(response.reference);
            } else {
                throw new Error(response.message || 'Respuesta inválida del servidor al iniciar el pago.');
            }
        } catch (error: any) {
            console.error('Frontend: Error al iniciar pago:', error);
            setErrorMessage(error.message || 'No se pudo iniciar el proceso de pago.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Lógica handleIframeMessage (sin cambios) ---
    const handleIframeMessage = useCallback(async (event: MessageEvent) => {
        if (!IFRAME_ALLOWED_ORIGINS.includes(event.origin)) {
            console.warn("Frontend: Mensaje ignorado de origen no válido:", event.origin);
            return;
        }

        const data = event.data;
        console.log("Frontend: Mensaje recibido del iframe:", data);

        if (data === 'payment_success' || data?.status === 'success' || (typeof data === 'string' && data.includes('success'))) {
            if (!encryptedData || !referenciaPago) {
                console.error("Frontend: Falta encryptedData o referenciaPago al recibir éxito del iframe.");
                setErrorMessage("Error interno (datos faltantes) al procesar éxito del pago.");
                setSuccessMessage(null);
                setIsLoading(false);
                return;
            }

            setSuccessMessage("¡Pago detectado en iframe! Confirmando con el servidor...");
            setIsLoading(true);
            setErrorMessage(null);

            try {
                console.log(`Frontend: Llamando a /api/pagos/confirmar-pago para ref: ${referenciaPago}`);
                const confirmacionResponse = await fetchApi('/pagos/confirmar-pago', {
                    method: 'POST',
                    data: {
                        encryptedRequestData: encryptedData,
                        reference: referenciaPago,
                    },
                });

                console.log("Frontend: Respuesta de confirmación:", confirmacionResponse);

                if (confirmacionResponse.status === 'success') {
                    setSuccessMessage(confirmacionResponse.message || "¡Pago confirmado y registrado exitosamente!");
                    setTimeout(() => {
                        console.log("Simulando cierre de iframe...");
                        setPaymentUrl(null);
                    }, 8000); // Más tiempo para leer
                } else {
                    throw new Error(confirmacionResponse.message || "El servidor no pudo confirmar el registro del pago.");
                }

            } catch (error: any) {
                console.error('Frontend: Error al confirmar pago via proxy:', error);
                setErrorMessage(`Error al registrar la confirmación: ${error.message}. Si el cobro aparece en tu banco, contacta a soporte.`);
                setSuccessMessage(null); // Limpia mensaje de éxito si la confirmación falla
            } finally {
                setIsLoading(false);
            }

        } else if (data === 'payment_failed' || data?.status === 'failed' || (typeof data === 'string' && data.includes('fail'))) {
            setErrorMessage("El pago no se pudo completar en la plataforma o fue cancelado.");
            setPaymentUrl(null); // Cierra el iframe si falla
            setIsLoading(false);
            setSuccessMessage(null); // Asegura limpiar mensaje de éxito previo
        } else {
            console.warn("Frontend: Mensaje desconocido recibido del iframe:", data);
        }
    }, [encryptedData, referenciaPago]);


    // --- useEffect listener (sin cambios) ---
    useEffect(() => {
        window.addEventListener('message', handleIframeMessage);
        return () => {
            window.removeEventListener('message', handleIframeMessage);
        };
    }, [handleIframeMessage]);

    // --- JSX con estilos Tailwind ---
    return (
        // Contenedor principal del componente: Añade fondo, padding, bordes redondeados, sombra
        <div className="flex flex-col min-h-screen">
            <Menu />
            <main className="flex-grow p-4 md:p-6 pt-20 md:pt-24"> {/* <-- AJUSTES: <main>, flex-grow, pt-XX */}

                    {/* Título del componente */}
                    <h1 className="text-2xl font-semibold mb-6 text-gray-900 border-b pb-3">
                        Realizar Pago de Trámite
                    </h1>

                    {/* Sección de selección de trámite */}
                    <div className="mb-6 space-y-2"> {/* Agrupa label y select con espacio */}
                        <label htmlFor="tramite-select" className="block text-sm font-medium text-gray-700">
                            Selecciona el trámite a pagar:
                        </label>
                        <select
                            id="tramite-select"
                            value={selectedTramite}
                            onChange={(e) => setSelectedTramite(e.target.value)}
                            disabled={isLoading || !!paymentUrl}
                            // Clases mejoradas para el select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition duration-150 ease-in-out disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {TRAMITES_DISPONIBLES.map((tramite) => (
                                <option key={tramite.key} value={tramite.key}>
                                    {tramite.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Botón de Pagar */}
                    <button
                        onClick={handlePagarClick}
                        disabled={isLoading || !!paymentUrl}
                        // Clases mejoradas para el botón: tamaño, alineación del spinner, transición
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                        {/* Spinner SVG (sin cambios, pero alineado con 'items-center' en el botón) */}
                        {isLoading && (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {isLoading ? 'Iniciando pago...' : 'Pagar Trámite Seleccionado'}
                    </button>

                    {/* --- Mensajes de Estado con Iconos (Opcional) --- */}
                    <div className="mt-6 space-y-4"> {/* Contenedor para mensajes */}
                        {errorMessage && (
                            <div className="flex items-start p-4 border border-red-300 bg-red-50 text-red-800 rounded-md shadow-sm">
                                <XCircleIcon className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" aria-hidden="true" />
                                <div>
                                    <strong className="font-semibold">Error:</strong> {errorMessage}
                                </div>
                            </div>
                        )}
                        {successMessage && !paymentUrl && ( // Mostrar solo si el iframe ya no está visible
                            <div className="flex items-start p-4 border border-green-300 bg-green-50 text-green-800 rounded-md shadow-sm">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" aria-hidden="true" />
                                <div>
                                    <strong className="font-semibold">Éxito:</strong> {successMessage}
                                </div>
                            </div>
                        )}
                    </div>


                    {/* --- Iframe de Pago --- */}
                    {paymentUrl && ( // Mostrar siempre que haya URL, incluso si hay mensaje de éxito momentáneo
                        <div className="mt-8 border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
                            {/* Encabezado del Iframe */}
                            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-700">
                                    Completa tu pago en la ventana segura
                                </p>
                                {/* Spinner pequeño mientras se confirma */}
                                {isLoading && successMessage && (
                                    <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </div>
                            {/* Iframe */}
                            <iframe
                                ref={iframeRef}
                                id="payment-iframe"
                                src={paymentUrl}
                                className="w-full border-0 block" // Asegura que sea block para evitar espacios extra
                                style={{ height: '750px' }} // Mantener altura o ajustar
                                title="Ventana de Pago Seguro"
                                allow="payment *"
                            ></iframe>
                        </div>
                    )}

            </main> {/* <-- FIN Contenedor Principal (<main>) */}
            <Pie /> {/* <-- PIE ABAJO */}
        </div>
    );
}