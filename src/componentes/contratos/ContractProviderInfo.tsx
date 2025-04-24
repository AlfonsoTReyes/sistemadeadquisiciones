// src/components/contratos/ContractProviderInfo.tsx
import React from 'react';
import { ProveedorDetallado } from '@/types/proveedor'; // Ajusta la ruta a tus tipos de proveedor

interface ContractProviderInfoProps {
    proveedor: ProveedorDetallado | null | undefined; // Puede ser null si hay error
}

const ContractProviderInfo: React.FC<ContractProviderInfoProps> = ({ proveedor }) => {
    if (!proveedor) {
        return <p className="text-sm text-red-600 italic">Datos del proveedor no disponibles.</p>;
    }

    const nombreCompletoFisica = proveedor.tipo_proveedor === 'fisica'
        ? `${proveedor.nombre_fisica ?? ''} ${proveedor.apellido_p_fisica ?? ''} ${proveedor.apellido_m_fisica ?? ''}`.trim()
        : null;

    return (
        <div className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                <p><strong>ID Proveedor:</strong> {proveedor.id_proveedor}</p>
                <p><strong>RFC:</strong> {proveedor.rfc ?? 'N/A'}</p>

                {/* Mostrar Razón Social o Nombre según el tipo */}
                {proveedor.tipo_proveedor === 'moral' && (
                    <p className="md:col-span-2"><strong>Razón Social:</strong> {proveedor.razon_social ?? 'N/A'}</p>
                )}
                {proveedor.tipo_proveedor === 'fisica' && (
                    <p className="md:col-span-2"><strong>Nombre:</strong> {nombreCompletoFisica || 'N/A'}</p>
                )}
                {/* Mostrar CURP si es física */}
                {proveedor.tipo_proveedor === 'fisica' && (
                    <p><strong>CURP:</strong> {proveedor.curp ?? 'N/A'}</p>
                )}

                <p><strong>Correo:</strong> {proveedor.correo ?? 'N/A'}</p>
                <p><strong>Teléfono Principal:</strong> {proveedor.telefono_uno ?? 'N/A'}</p>
                {proveedor.telefono_dos && <p><strong>Teléfono Secundario:</strong> {proveedor.telefono_dos}</p>}

                <p className="md:col-span-2">
                    <strong>Dirección:</strong> {`${proveedor.calle ?? ''} ${proveedor.numero ?? ''}, Col. ${proveedor.colonia ?? ''}, CP ${proveedor.codigo_postal ?? ''}, ${proveedor.municipio ?? ''}, ${proveedor.estado ?? ''}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim() || 'N/A'}
                </p>
                {/* Puedes añadir más campos relevantes: Giro Comercial, Actividad SAT, etc. */}
                 <p><strong>Giro Comercial:</strong> {proveedor.giro_comercial ?? 'N/A'}</p>
                 <p><strong>Actividad SAT:</strong> {proveedor.actividad_sat ?? 'N/A'}</p>


            </div>

            {/* Mostrar Representantes si es Moral y existen */}
            {proveedor.tipo_proveedor === 'moral' && proveedor.representantes && proveedor.representantes.length > 0 && (
                <div className="pt-3 mt-3 border-t">
                    <h4 className="font-semibold mb-1">Representante(s) Legal(es):</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                        {proveedor.representantes.map((rep) => (
                             <li key={rep.id_morales}>
                                {`${rep.nombre_representante ?? ''} ${rep.apellido_p_representante ?? ''} ${rep.apellido_m_representante ?? ''}`.trim()}
                             </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ContractProviderInfo;