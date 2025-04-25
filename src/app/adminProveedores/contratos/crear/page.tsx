// /src/app/admin/proveedores/contratos/crear/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Para redirigir después de crear
import Link from 'next/link';
import ContractCreateForm from '@/componentes/contratos/ContractCreateForm'; // Ajusta ruta
import { createContractRequest } from '@/fetch/contratosFetch'; // Ajusta ruta
import { ContratoCreateData } from '@/types/contrato'; // Ajusta ruta

const AdminCrearContratoPage: React.FC = () => {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateContract = async (newData: ContratoCreateData) => {
        setIsSaving(true);
        setError(null);
        console.log("Creando contrato con datos:", newData);

        try {
            const result = await createContractRequest(newData);
            console.log("Contrato creado exitosamente:", result);
            alert(`Contrato creado exitosamente con ID: ${result.id_contrato}`);
            // Redirigir a la lista o al detalle del nuevo contrato
            router.push('/adminProveedores/contratos'); // Redirige a la lista
            // O redirigir al detalle: router.push(`/admin/proveedores/contratos/${result.id_contrato}`);

        } catch (err) {
            console.error("Error al crear contrato:", err);
            setError(`Error al crear el contrato: ${(err as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/adminProveedores/contratos'); // Volver a la lista al cancelar
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
                 <h1 className="text-xl font-semibold">Crear Nuevo Contrato (Admin)</h1>
                 <Link href="/adminProveedores/contratos" className="text-sm text-blue-600 hover:underline">
                    ← Volver a la lista
                </Link>
            </div>

            <ContractCreateForm
                onSubmit={handleCreateContract}
                onCancel={handleCancel}
                isSaving={isSaving}
                error={error}
            />
        </div>
    );
};

export default AdminCrearContratoPage;