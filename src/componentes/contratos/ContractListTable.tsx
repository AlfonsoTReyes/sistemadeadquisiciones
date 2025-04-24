// src/components/contratos/ContractListTable.tsx
import React from 'react';
import Link from 'next/link';
import { ContratoEnLista } from '@/types/contrato'; // Ajusta la ruta

interface ContractListTableProps {
    contratos: ContratoEnLista[];
    basePath: string;
    showProveedorColumn?: boolean; // Opcional: Para mostrar/ocultar columna proveedor
    isLoading?: boolean; // Opcional: para mostrar estado de carga
    error?: string | null; // Opcional: para mostrar mensaje de error
}

const ContractListTable: React.FC<ContractListTableProps> = ({
    contratos,
    basePath,
    showProveedorColumn = true, // Por defecto visible (para admin)
    isLoading = false,
    error = null,
}) => {

    // Manejo de estados de carga y error
    if (isLoading) {
        return (
            <div className="text-center p-5">
                <p className="text-gray-500">Cargando contratos...</p>
                {/* Podrías añadir un spinner aquí */}
            </div>
        );
    }

    if (error) {
         return (
            <div className="p-3 my-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                <p className="font-bold">Error al cargar contratos:</p>
                <p>{error}</p>
            </div>
         );
    }

    if (!contratos || contratos.length === 0) {
        return <p className="text-gray-500 italic text-center p-5">No se encontraron contratos.</p>;
    }

    // Función para formatear moneda (reutilizable)
    const formatCurrency = (amount: string | null, currency: string | null = 'MXN') => {
        if (amount === null || amount === undefined) return '-';
        const numberAmount = parseFloat(amount);
        if (isNaN(numberAmount)) return '-';
        return numberAmount.toLocaleString('es-MX', { style: 'currency', currency: currency ?? 'MXN' });
    };

     // Función para formatear fecha (reutilizable)
     const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        try {
            // Aseguramos que la fecha se interprete como local si no tiene info de timezone
            // o como UTC si viene en formato ISO completo.
             const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
            return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch (e) {
            console.warn("Error formateando fecha:", dateString, e);
            return '-';
        }
    };


    return (
        <div className="overflow-x-auto border rounded shadow-sm">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Núm. Contrato</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objeto</th>
                        {showProveedorColumn && (
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                        )}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Firma</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {contratos.map((contrato) => (
                        <tr key={contrato.id_contrato} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{contrato.numero_contrato ?? '-'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate" title={contrato.objeto_contrato}>
                                {contrato.objeto_contrato}
                            </td>
                            {showProveedorColumn && (
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                    {contrato.nombre_proveedor_o_razon_social ?? `ID: ${contrato.id_proveedor}`}
                                </td>
                            )}
                             <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(contrato.monto_total, contrato.moneda)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(contrato.fecha_firma)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                <Link href={`${basePath}/${contrato.id_contrato}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                    Ver Detalles
                                </Link>
                                {/* Aquí podrían ir más acciones (botones Editar/Eliminar) pasadas como props si fuera necesario */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContractListTable;