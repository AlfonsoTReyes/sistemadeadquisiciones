// src/components/tablas_comparativas/TablaComparativaDisplay.tsx
'use client';

import React from 'react';
import { TablaComparativaCompleta, ProveedorEnTabla, TablaComparativaItem } from '@/types/tablaComparativa'; // Ajusta la ruta

interface TablaComparativaDisplayProps {
    tabla: TablaComparativaCompleta;
    // Opcional: podrías añadir callbacks si permites acciones desde aquí
    // onEditItem?: (item: TablaComparativaItem) => void;
    // onDeleteItem?: (itemId: number) => void;
    // ...etc
}

// Helper para formatear moneda (ejemplo)
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
};

export const TablaComparativaDisplay: React.FC<TablaComparativaDisplayProps> = ({ tabla }) => {
    if (!tabla) return <p>No hay datos de tabla comparativa para mostrar.</p>;

    const proveedores = tabla.proveedores || [];
    const numeroProveedores = proveedores.length;

    // Preparar cabeceras dinámicas para ítems
    const itemHeaders = ['#', 'Descripción', 'Caract. Técnicas', 'UDM', 'CANT'];
    proveedores.forEach(p => {
        itemHeaders.push(`P.U (${p.nombre_empresa_snapshot.substring(0, 10)}...)`); // Abreviar nombre
        itemHeaders.push(`Subtotal (${p.nombre_empresa_snapshot.substring(0, 10)}...)`);
    });

    // Agrupar ítems por descripción para comparación directa (simplificado)
    // Una lógica más robusta podría agrupar por id_articulo_origen si existe
    const itemsAgrupados: { [descripcion: string]: (TablaComparativaItem | null)[] } = {};

    proveedores.forEach((proveedor, provIndex) => {
        proveedor.items.forEach(item => {
            const key = item.descripcion_item.toLowerCase().trim(); // Clave de agrupación
            if (!itemsAgrupados[key]) {
                itemsAgrupados[key] = Array(numeroProveedores).fill(null); // Inicializa array para cada proveedor
            }
            // Coloca el item en la posición correspondiente a su proveedor
            if (itemsAgrupados[key][provIndex] === null) { // Evita sobrescribir si hay duplicados por proveedor (poco probable)
                 itemsAgrupados[key][provIndex] = item;
            } else {
                // Manejar caso de descripción duplicada para el mismo proveedor si es necesario
                console.warn(`Descripción duplicada encontrada para proveedor ${proveedor.id}: ${key}`);
            }
        });
    });

    // Necesitamos encontrar una 'plantilla' de item para cada fila (descripción, udm, cant)
    // Usaremos el primer item encontrado con esa descripción
    const getTemplateItem = (itemsRow: (TablaComparativaItem | null)[]): Partial<TablaComparativaItem> => {
        const firstValidItem = itemsRow.find(item => item !== null);
        return {
            descripcion_item: firstValidItem?.descripcion_item || 'N/A',
            caracteristicas_tecnicas: firstValidItem?.caracteristicas_tecnicas || null,
            udm: firstValidItem?.udm || 'N/A',
            cantidad: firstValidItem?.cantidad || 0,
        };
    }


    return (
        <div className="tabla-comparativa-container p-4 border rounded shadow-lg bg-white">
            {/* // TODO: Aplicar estilos adecuados (Tailwind, CSS Modules, etc.) */}
            <h2 className="text-xl font-bold mb-4">Cuadro Comparativo: {tabla.nombre}</h2>
            <p className="mb-2">Descripción: {tabla.descripcion || 'N/A'}</p>
            <p className="mb-4">Estado: <span className="font-semibold">{tabla.estado}</span></p>

            {/* --- Sección Información General Proveedores --- */}
            <h3 className="text-lg font-semibold mb-2">Información de Proveedores</h3>
            <div className="overflow-x-auto mb-6">
                <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300 p-2">Característica</th>
                            {proveedores.map((p) => (
                                <th key={p.id} className="border border-gray-300 p-2">{p.nombre_empresa_snapshot}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* // TODO: Mapear las características deseadas del snapshot */}
                        {[
                            { key: 'rfc_snapshot', label: 'RFC' },
                            { key: 'atencion_de_snapshot', label: 'Atención de' },
                            { key: 'domicilio_snapshot', label: 'Domicilio' },
                            { key: 'telefono_snapshot', label: 'Teléfono' },
                            { key: 'correo_electronico_snapshot', label: 'Correo' },
                            { key: 'condiciones_pago_snapshot', label: 'Condic. Pago' },
                            { key: 'tiempo_entrega_snapshot', label: 'Tiempo Entrega' },
                        ].map(({ key, label }) => (
                             <tr key={key}>
                                <td className="border border-gray-300 p-2 font-medium">{label}</td>
                                {proveedores.map((p) => (
                                    <td key={p.id} className="border border-gray-300 p-2">
                                        {(p as any)[key] || '-'} {/* Acceso dinámico */}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {/* --- Sección Comparativa de Items --- */}
             <h3 className="text-lg font-semibold mb-2">Comparativa de Productos/Servicios</h3>
             <div className="overflow-x-auto mb-6">
                 <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            {itemHeaders.map((header, index) => (
                                <th key={index} className="border border-gray-300 p-2 sticky top-0 bg-gray-100">{header}</th>
                            ))}
                            {/* // TODO: Añadir cabeceras para acciones si son necesarias */}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(itemsAgrupados).map(([key, itemsRow], rowIndex) => {
                             const template = getTemplateItem(itemsRow);
                             return (
                                <tr key={key}>
                                    <td className="border border-gray-300 p-2">{rowIndex + 1}</td>
                                    <td className="border border-gray-300 p-2">{template.descripcion_item}</td>
                                    <td className="border border-gray-300 p-2">
                                        {/* // TODO: Formatear características técnicas */}
                                        {template.caracteristicas_tecnicas?.map(c => c.elemento).join(', ') || '-'}
                                    </td>
                                    <td className="border border-gray-300 p-2">{template.udm}</td>
                                    <td className="border border-gray-300 p-2 text-right">{template.cantidad?.toLocaleString() ?? '0'}</td>
                                    {/* Datos por proveedor */}
                                    {itemsRow.map((item, provIndex) => (
                                        <React.Fragment key={`${key}-${provIndex}`}>
                                            <td className="border border-gray-300 p-2 text-right">
                                                {item ? formatCurrency(item.precio_unitario) : '-'}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-right font-medium">
                                                {item ? formatCurrency(item.subtotal_item) : '-'}
                                            </td>
                                        </React.Fragment>
                                    ))}
                                    {/* // TODO: Añadir celdas para acciones si son necesarias */}
                                </tr>
                            );
                        })}
                    </tbody>
                    {/* --- Totales por Proveedor --- */}
                    <tfoot className="bg-gray-100 font-bold">
                        <tr>
                            <td colSpan={5} className="border border-gray-300 p-2 text-right">Subtotal Proveedor</td>
                             {proveedores.map(p => (
                                <td key={`sub-${p.id}`} colSpan={2} className="border border-gray-300 p-2 text-right">
                                     {formatCurrency(p.subtotal_proveedor)}
                                </td>
                            ))}
                        </tr>
                         <tr>
                            <td colSpan={5} className="border border-gray-300 p-2 text-right">IVA Proveedor</td>
                             {proveedores.map(p => (
                                <td key={`iva-${p.id}`} colSpan={2} className="border border-gray-300 p-2 text-right">
                                    {formatCurrency(p.iva_proveedor)}
                                </td>
                            ))}
                        </tr>
                         <tr>
                            <td colSpan={5} className="border border-gray-300 p-2 text-right">Total Proveedor</td>
                             {proveedores.map(p => (
                                <td key={`tot-${p.id}`} colSpan={2} className="border border-gray-300 p-2 text-right">
                                    {formatCurrency(p.total_proveedor)}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                 </table>
             </div>

            {/* // TODO: Integrar SeccionObservaciones (probablemente iterando por proveedor) */}
            {/* // TODO: Integrar SeccionFirmasComentarios */}
             <div className="mt-6">
                 {/* Placeholder para las otras secciones */}
                 <p className="text-gray-500 italic">(Sección de Observaciones, Firmas y Comentarios iría aquí)</p>
             </div>

        </div>
    );
};