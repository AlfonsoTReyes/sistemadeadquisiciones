"use client"; // Necesario para hooks como useState, useEffect

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchContracts } from '@/fetch/contratosFetch'; // Ajusta la ruta si es necesario
import { ContratoEnLista } from '@/types/contrato'; // Ajusta la ruta si es necesario

// Componente Placeholder para la tabla (desarrollar más adelante)
interface ContractListTableProps {
    contratos: ContratoEnLista[];
    basePath: string; // Para construir links (admin/proveedor)
}
const ContractListTable: React.FC<ContractListTableProps> = ({ contratos, basePath }) => {
    if (!contratos.length) {
        return <p className="text-gray-500 italic">No se encontraron contratos.</p>;
    }

    return (
        <div className="overflow-x-auto border rounded shadow-sm">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Núm. Contrato</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objeto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Firma</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {contratos.map((contrato) => (
                        <tr key={contrato.id_contrato}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{contrato.numero_contrato ?? '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate" title={contrato.objeto_contrato}>
                                {contrato.objeto_contrato}
                            </td>
                             <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{contrato.nombre_proveedor_o_razon_social ?? `ID: ${contrato.id_proveedor}`}</td>
                             <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                {contrato.monto_total ? parseFloat(contrato.monto_total).toLocaleString('es-MX', { style: 'currency', currency: contrato.moneda ?? 'MXN' }) : '-'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {contrato.fecha_firma ? new Date(contrato.fecha_firma + 'T00:00:00').toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                <Link href={`${basePath}/${contrato.id_contrato}`} className="text-blue-600 hover:text-blue-800">
                                    Ver Detalles
                                </Link>
                                {/* Aquí podrían ir botones de Editar/Eliminar para Admin */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- Componente Principal de la Página Admin ---
const AdminContratosListPage: React.FC = () => {
    const [contratos, setContratos] = useState<ContratoEnLista[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadContracts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // El admin obtiene todos los contratos (no pasa idProveedor)
                const data = await fetchContracts();
                setContratos(data);
            } catch (err) {
                console.error("Error al cargar contratos (Admin):", err);
                setError(`Error al cargar contratos: ${(err as Error).message}`);
                setContratos([]); // Limpiar en caso de error
            } finally {
                setIsLoading(false);
            }
        };

        loadContracts();
    }, []); // Se ejecuta solo una vez al montar

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h1 className="text-xl font-semibold">Gestión de Contratos (Admin)</h1>
                {/* --- BOTÓN AÑADIDO --- */}
                <Link href="/adminProveedores/contratos/crear">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        + Crear Nuevo Contrato
                    </button>
                </Link>
                 {/* --- FIN BOTÓN AÑADIDO --- */}
            </div>

            {/* Mensajes de Carga y Error */}
            {isLoading && (
                <div className="text-center p-4">
                    <p>Cargando lista de contratos...</p>
                    {/* Podrías añadir un spinner aquí */}
                </div>
            )}
            {error && (
                <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {/* Tabla de Contratos */}
            {!isLoading && !error && (
                <ContractListTable contratos={contratos} basePath="/adminProveedores/contratos" />
            )}
        </div>
    );
};

export default AdminContratosListPage;