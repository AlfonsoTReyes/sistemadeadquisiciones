'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/lib/pago/fetchApi';
import { IniciarPagoPHPResponse } from '@/types/pago';

const TRAMITES_DISPONIBLES = [
    { key: "acuatica", label: "Acuática" },
    { key: "visto_bueno", label: "Visto Bueno" },
    { key: "giro", label: "Giro Comercial" },
    { key: "licencia", label: "Licencia" },
];

const IFRAME_ALLOWED_ORIGINS = [
    "https://u.mitec.com.mx",
    "https://vip.epago.com.mx",
    "https://bc.mitec.com.mx"
];

export default function PaginaPago() {
    const [selectedTramite, setSelectedTramite] = useState<string>(TRAMITES_DISPONIBLES[0].key);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [encryptedData, setEncryptedData] = useState<string | null>(null);
    const [referenciaPago, setReferenciaPago] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handlePagarClick = async () => {
        // ... (lógica fetchApi sin cambios) ...
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

    const handleIframeMessage = useCallback(async (event: MessageEvent) => {
         // ... (validación de origen sin cambios) ...
        if (!IFRAME_ALLOWED_ORIGINS.includes(event.origin)) {
            console.warn("Frontend: Mensaje ignorado de origen no válido:", event.origin);
            return;
        }

        const data = event.data;
        console.log("Frontend: Mensaje recibido del iframe:", data);

        if (data === 'payment_success' || data?.status === 'success' || (typeof data === 'string' && data.includes('success'))) {
             // ... (validación de encryptedData y referenciaPago) ...
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

            // --- Opción A: Llamar al proxy Next.js ---
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
                        console.log("Simulando redirección...");
                        setPaymentUrl(null);
                    }, 5000);
                } else {
                    throw new Error(confirmacionResponse.message || "El servidor no pudo confirmar el registro del pago.");
                }

            } catch (error: any) {
                console.error('Frontend: Error al confirmar pago via proxy:', error);
                setErrorMessage(`Error al registrar la confirmación: ${error.message}. Si el cobro aparece en tu banco, contacta a soporte.`);
                setSuccessMessage(null);
            } finally {
                setIsLoading(false);
            }
            // --- Fin Opción A ---

        } else if (data === 'payment_failed' || data?.status === 'failed' || (typeof data === 'string' && data.includes('fail'))) {
             // ... (manejo de fallo) ...
            setErrorMessage("El pago no se pudo completar en la plataforma o fue cancelado.");
            setPaymentUrl(null);
            setIsLoading(false);
        } else {
            console.warn("Frontend: Mensaje desconocido recibido del iframe:", data);
        }
    }, [encryptedData, referenciaPago]);

    useEffect(() => {
        // ... (listener sin cambios) ...
        window.addEventListener('message', handleIframeMessage);
        return () => {
            window.removeEventListener('message', handleIframeMessage);
        };
    }, [handleIframeMessage]);

    return (
        <div className="container mx-auto p-6 max-w-4xl"> {/* Centrado y padding */}
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Realizar Pago de Trámite</h1>

            <div className="mb-6">
                <label htmlFor="tramite-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona el trámite:
                </label>
                <select
                    id="tramite-select"
                    value={selectedTramite}
                    onChange={(e) => setSelectedTramite(e.target.value)}
                    disabled={isLoading || !!paymentUrl}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100"
                >
                    {TRAMITES_DISPONIBLES.map((tramite) => (
                        <option key={tramite.key} value={tramite.key}>
                            {tramite.label}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handlePagarClick}
                disabled={isLoading || !!paymentUrl}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : null}
                {isLoading ? 'Procesando...' : 'Pagar Trámite'}
            </button>

            {/* --- Mensajes de Estado --- */}
            {errorMessage && (
                <div className="mt-6 p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
                    <strong className="font-bold">Error:</strong> {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="mt-6 p-4 border border-green-300 bg-green-50 text-green-700 rounded-md">
                     <strong className="font-bold">Éxito:</strong> {successMessage}
                </div>
            )}

            {/* --- Iframe de Pago --- */}
            {paymentUrl && !successMessage && (
                <div className="mt-8 border border-gray-300 rounded-lg overflow-hidden shadow-md">
                    <p className="p-3 bg-gray-100 text-sm text-gray-600 border-b border-gray-300">
                        Completa tu pago en la ventana segura. No cierres esta página.
                    </p>
                    <iframe
                        ref={iframeRef}
                        id="payment-iframe"
                        src={paymentUrl}
                        className="w-full border-0" // Ancho completo, sin borde
                        style={{ height: '750px' }} // Altura fija o usa aspect-ratio si prefieres
                        title="Ventana de Pago Seguro"
                        allow="payment *"
                    ></iframe>
                </div>
            )}
        </div>
    );
}