// src/components/tablas_comparativas/TablaComparativaDisplay.tsx
'use client';

import React from 'react';
import { TablaComparativaCompleta, ProveedorEnTabla, TablaComparativaItem, CaracteristicaTecnica } from '@/types/tablaComparativa'; // Ajusta la ruta

interface TablaComparativaDisplayProps {
    tabla: TablaComparativaCompleta;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

// Helper para mostrar características técnicas
const formatCaracteristicas = (caracteristicas: CaracteristicaTecnica[] | null): string => {
    if (!caracteristicas || caracteristicas.length === 0) return '-';
    return caracteristicas.map(c => c.elemento).join('; '); // Unir con punto y coma, por ejemplo
};

export const TablaComparativaDisplay: React.FC<TablaComparativaDisplayProps> = ({ tabla }) => {
    // ... (lógica de agrupación de ítems sin cambios) ...
    if (!tabla) return <p>No hay datos de tabla comparativa para mostrar.</p>;

    const proveedores = tabla.proveedores || [];
    const numeroProveedores = proveedores.length;

    const itemHeaders = ['#', 'Descripción', 'Caract. Técnicas', 'UDM', 'CANT'];
    proveedores.forEach(p => {
        itemHeaders.push(`P.U (${p.nombre_empresa_snapshot.substring(0, 10)}...)`);
        itemHeaders.push(`Subtotal (${p.nombre_empresa_snapshot.substring(0, 10)}...)`);
    });

    const itemsAgrupados: { [descripcion: string]: (TablaComparativaItem | null)[] } = {};
    proveedores.forEach((proveedor, provIndex) => {
        proveedor.items.forEach(item => {
            const key = item.descripcion_item.toLowerCase().trim();
            if (!itemsAgrupados[key]) {
                itemsAgrupados[key] = Array(numeroProveedores).fill(null);
            }
            if (itemsAgrupados[key][provIndex] === null) {
                itemsAgrupados[key][provIndex] = item;
            } else {
                console.warn(`Descripción duplicada encontrada para proveedor ${proveedor.id}: ${key}`);
            }
        });
    });

    const getTemplateItem = (itemsRow: (TablaComparativaItem | null)[]): Partial<TablaComparativaItem> => {
        const firstValidItem = itemsRow.find(item => item !== null);
        return {
            descripcion_item: firstValidItem?.descripcion_item || 'N/A',
            caracteristicas_tecnicas: firstValidItem?.caracteristicas_tecnicas || null,
            udm: firstValidItem?.udm || 'N/A',
            cantidad: firstValidItem?.cantidad || 0,
        };
    }

    // --- Definir qué campos del snapshot mostrar ---
    // *** CAMBIO: Eliminar los campos no deseados ***
    const camposSnapshotAMostrar = [
        { key: 'rfc_snapshot', label: 'RFC' },
        { key: 'giro_comercial_snapshot', label: 'Giro Comercial' }, // Añadido si es relevante
        // { key: 'atencion_de_snapshot', label: 'Atención de' }, // <-- ELIMINADO
        { key: 'domicilio_snapshot', label: 'Domicilio' },
        { key: 'telefono_snapshot', label: 'Teléfono' },
        { key: 'correo_electronico_snapshot', label: 'Correo' },
        { key: 'pagina_web_snapshot', label: 'Web' }, // Añadido si es relevante
        // { key: 'condiciones_pago_snapshot', label: 'Condic. Pago' }, // <-- ELIMINADO
        // { key: 'tiempo_entrega_snapshot', label: 'Tiempo Entrega' }, // <-- ELIMINADO
    ];


    return (
        <div className="tabla-comparativa-container p-4 border rounded shadow-lg bg-white">
            {/* Cabecera Tabla */}
            <h2 className="text-xl font-bold mb-4 text-gray-800">Cuadro Comparativo: {tabla.nombre}</h2>
            <p className="mb-2 text-sm text-gray-600">Descripción: {tabla.descripcion || 'N/A'}</p>
            <p className="mb-4 text-sm">Estado: <span className="font-semibold">{tabla.estado}</span></p>

            {/* --- Sección Información General Proveedores (ACTUALIZADA) --- */}
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Información de Proveedores</h3>
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Característica</th>
                            {proveedores.map((p) => (
                                <th key={p.id} className="border border-gray-300 p-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{p.nombre_empresa_snapshot}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {/* *** CAMBIO: Iterar sobre la lista definida arriba *** */}
                        {camposSnapshotAMostrar.map(({ key, label }) => (
                            <tr key={key} className="hover:bg-gray-50">
                                <td className="border border-gray-300 p-2 font-medium text-gray-600">{label}</td>
                                {proveedores.map((p) => (
                                    <td key={p.id} className="border border-gray-300 p-2 text-gray-700">
                                        {/* Usar 'as any' es una solución rápida, idealmente el tipo ProveedorEnTabla debería ser más estricto */}
                                        {(p as any)[key] || '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- Sección Comparativa de Items (ACTUALIZADA para formato caract.)--- */}
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Comparativa de Productos/Servicios</h3>
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            {itemHeaders.map((header, index) => (
                                <th key={index} className="border border-gray-300 p-2 sticky top-0 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {Object.entries(itemsAgrupados).map(([key, itemsRow], rowIndex) => {
                            const template = getTemplateItem(itemsRow);
                            return (
                                <tr key={key} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 p-2 text-center">{rowIndex + 1}</td>
                                    <td className="border border-gray-300 p-2">{template.descripcion_item}</td>
                                    <td className="border border-gray-300 p-2 text-xs text-gray-600">
                                        {/* *** CAMBIO: Usar helper para formatear *** */}
                                        {formatCaracteristicas(template.caracteristicas_tecnicas)}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">{template.udm}</td>
                                    <td className="border border-gray-300 p-2 text-right">{template.cantidad?.toLocaleString() ?? '0'}</td>
                                    {/* Datos por proveedor */}
                                    {itemsRow.map((item, provIndex) => (
                                        <React.Fragment key={`${key}-${provIndex}`}>
                                            <td className="border border-gray-300 p-2 text-right">
                                                {item ? formatCurrency(item.precio_unitario) : '-'}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-right font-medium bg-gray-50"> {/* Resaltar subtotal */}
                                                {item ? formatCurrency(item.subtotal_item) : '-'}
                                            </td>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                    {/* --- Totales por Proveedor --- */}
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td colSpan={5} className="border border-gray-300 p-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal Proveedor</td>
                            {proveedores.map(p => (
                                <td key={`sub-${p.id}`} colSpan={2} className="border border-gray-300 p-2 text-right">
                                    {formatCurrency(p.subtotal_proveedor)}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan={5} className="border border-gray-300 p-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">IVA Proveedor</td>
                            {proveedores.map(p => (
                                <td key={`iva-${p.id}`} colSpan={2} className="border border-gray-300 p-2 text-right">
                                    {formatCurrency(p.iva_proveedor)}
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan={5} className="border border-gray-300 p-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Proveedor</td>
                            {proveedores.map(p => (
                                <td key={`tot-${p.id}`} colSpan={2} className="border border-gray-300 p-2 text-right">
                                    {formatCurrency(p.total_proveedor)}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Placeholder para las otras secciones (sin cambios) */}
            <div className="mt-6">
                <p className="text-gray-500 italic text-sm">(Sección de Observaciones, Firmas y Comentarios se renderizan por separado)</p>
            </div>

        </div>
    );
};