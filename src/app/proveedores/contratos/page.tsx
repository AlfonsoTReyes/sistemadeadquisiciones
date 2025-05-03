"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchContracts } from '@/fetch/contratosFetch'; // Ajusta la ruta
import { ContratoEnLista } from '@/types/contrato'; // Ajusta la ruta
// Importa la función fetch correcta y el tipo necesario
import { fetchProveedorByUserId } from '@/fetch/contratosFetch'; // <-- Usa la función que busca por User ID (Ajusta ruta)
import { ProveedorDetallado } from '@/types/proveedor'; // <-- AJUSTA RUTA si es necesario
import DynamicMenu from "../../menu_proveedor";
import PieP from "../../pie";

// --- Componente Tabla (reutilizado o importado) ---
interface ContractListTableProps {
    contratos: ContratoEnLista[];
    basePath: string;
    isLoading?: boolean;
    error?: string | null;
}
const ContractListTable: React.FC<ContractListTableProps> = ({ contratos, basePath, isLoading, error }) => {
    // ... (código de la tabla como en respuestas anteriores, oculta columna proveedor) ...
    if (isLoading) {
        return <div className="text-center p-5"><p className="text-gray-500">Cargando contratos...</p></div>;
    }
    if (error) {
        return <div className="p-3 my-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert"><p className="font-bold">Error:</p><p>{error}</p></div>;
    }
    if (!contratos || contratos.length === 0) {
        return <p className="text-gray-500 italic text-center p-5">No tienes contratos registrados actualmente.</p>;
    }
    const formatCurrency = (amount: string | null, currency: string | null = 'MXN') => {
        if (amount === null || amount === undefined) return 'N/A';
        const numberAmount = parseFloat(amount);
        if (isNaN(numberAmount)) return 'Valor inválido';
        return numberAmount.toLocaleString('es-MX', { style: 'currency', currency: currency ?? 'MXN' });
    };
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        // Asegura que la fecha se interprete correctamente (ej: UTC si viene sin timezone)
        return new Date(dateString + 'T00:00:00Z').toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    };
    return (
        <div className="overflow-x-auto border rounded shadow-sm">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Núm. Contrato</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objeto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Firma</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {contratos.map((contrato) => (
                        <tr key={contrato.id_contrato} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{contrato.numero_contrato ?? '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate" title={contrato.objeto_contrato}>{contrato.objeto_contrato}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(contrato.monto_total, contrato.moneda)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{formatDate(contrato.fecha_firma)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                <Link href={`${basePath}/${contrato.id_contrato}`} className="text-blue-600 hover:text-blue-800 hover:underline">Ver Detalles</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
// --- Fin Tabla ---


// --- Componente Principal de la Página Proveedor ---
const ProveedorContratosListPage: React.FC = () => {
    const [contratos, setContratos] = useState<ContratoEnLista[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Estado de carga general
    const [error, setError] = useState<string | null>(null);
    const [proveedorUserId, setProveedorUserId] = useState<number | null>(null);
    const [proveedorId, setProveedorId] = useState<number | null>(null); // Para guardar el ID del proveedor una vez obtenido

    // 1. Obtener ID del USUARIO desde sessionStorage
    useEffect(() => {
        setIsLoading(true); // Iniciar carga
        setError(null); // Limpiar errores previos
        const userIdString = sessionStorage.getItem("proveedorUserId"); // <-- Lee el ID de USUARIO
        console.log("ContractsPage: Reading 'proveedorUserId' from sessionStorage:", userIdString);
        if (userIdString) {
            const userIdNum = parseInt(userIdString, 10);
            if (!isNaN(userIdNum)) {
                setProveedorUserId(userIdNum); // Guarda el ID del USUARIO
                console.log("ContractsPage: proveedorUserId set to:", userIdNum);
            } else {
                setError("Error: ID de usuario inválido en la sesión.");
                setIsLoading(false); // Detener si el ID no es válido
            }
        } else {
            setError("Error: No se encontró ID de usuario en la sesión. Por favor, inicie sesión.");
            setIsLoading(false); // Detener si no hay ID
        }
    }, []);

    // 2. Obtener ID del Proveedor USANDO el ID de usuario
    useEffect(() => {
        if (proveedorUserId === null) {
            // Si no hay ID de usuario (o hubo error al leerlo), no continuar
            if (error) setIsLoading(false); // Asegurarse que no quede cargando si hubo error antes
            return;
        }

        const loadProveedorId = async () => {
            // Asegurarse que sigue cargando si llegamos aquí sin error previo
            if (!error) setIsLoading(true);
            setError(null); // Limpiar por si acaso
            console.log(`ContractsPage: Attempting to fetch provider profile for user ID: ${proveedorUserId}`);
            try {
                // Llama a la función fetch que usa el parámetro correcto (?id_usuario_proveedor=...)
                const profile = await fetchProveedorByUserId(proveedorUserId);
                if (profile && profile.id_proveedor != null) {
                    setProveedorId(profile.id_proveedor); // Guarda el ID del PROVEEDOR
                    console.log("ContractsPage: Provider ID obtained:", profile.id_proveedor);
                } else {
                    setError("Error: No se encontró un perfil de proveedor asociado a su usuario.");
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("ContractsPage: Error fetching provider profile:", err);
                setError(`Error al obtener información del proveedor: ${(err as Error).message}`);
                setIsLoading(false);
            }
            // No ponemos setIsLoading(false) aquí, dejamos que el siguiente efecto lo haga al cargar contratos
        };

        loadProveedorId();
    }, [proveedorUserId, error]); // Depende del ID de usuario y del estado de error

    // 3. Cargar contratos una vez que se tiene el ID del proveedor
    useEffect(() => {
        // Ejecutar solo si tenemos el ID del proveedor y no hubo error previo
        if (proveedorId === null || error !== null) {
            if (error) setIsLoading(false); // Detener carga si hubo error obteniendo el ID
            return;
        }

        const loadContracts = async () => {
            if (!error) setIsLoading(true); // Asegurar estado de carga
            setError(null);
            console.log(`ContractsPage: Fetching contracts for provider ID: ${proveedorId}`);
            try {
                // Pasar el ID del proveedor obtenido a la función fetch
                const data = await fetchContracts(proveedorId as number);
                setContratos(data);
                console.log(`ContractsPage: ${data.length} contracts loaded.`);
            } catch (err) {
                console.error(`ContractsPage: Error fetching contracts for provider ID ${proveedorId}:`, err);
                setError(`Error al cargar sus contratos: ${(err as Error).message}`);
                setContratos([]);
            } finally {
                setIsLoading(false); // Termina la carga aquí
            }
        };

        loadContracts();
    }, [proveedorId, error]); // Depende del ID del PROVEEDOR y del estado de error

    return (
        // Contenedor general de la página
        <div className="flex flex-col min-h-screen">
            <DynamicMenu />

            <main className="flex-grow p-4 md:p-6 pt-20 md:pt-24">
                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h1 className="text-xl font-semibold">Mis Contratos</h1>
                    {/* Podrías añadir un botón aquí si es necesario */}
                </div>

                {isLoading && (
                    <div className="text-center p-4">
                        <p>Cargando información...</p>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                {/* Tabla de Contratos */}
                {!isLoading && !error && (
                    <ContractListTable
                        contratos={contratos}
                        basePath="/proveedores/contratos"
                    />
                )}
            </main> {/* Fin del contenedor principal del contenido */}

            <PieP /> {/* <--- PIE DE PÁGINA INSERTADO AQUÍ ABAJO */}
        </div> // Fin del contenedor general
    );
};

export default ProveedorContratosListPage;