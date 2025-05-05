// /admin/proveedores/contratos/crear/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Menu from '../../../menu';
import Pie from "../../../pie";
import ContratoServicioForm from '@/componentes/contratos/ContratoServicioForm'; // Ajusta ruta
import ContratoAdquisicionForm from '@/componentes/contratos/ContratoAdquisicionForm'; // Ajusta ruta
import { ContratoInputData } from '@/types/contratoTemplateData'; // Ajusta ruta
// *** IMPORTA LA FUNCIÓN FETCH DE GUARDADO ***
import { createContractFromTemplateData } from '@/fetch/contratosFetch'; // Ajusta ruta

const AdminCrearContratoPage: React.FC = () => {
    const router = useRouter();
    const [tipoContrato, setTipoContrato] = useState<'servicio' | 'adquisicion' | ''>('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (data: ContratoInputData) => {
        setIsSaving(true);
        setError(null);
        console.log("Datos del formulario a enviar:", data);
        try {
            // *** LLAMA A LA FUNCIÓN FETCH REAL ***
            const result = await createContractFromTemplateData(data); // <--- LLAMADA DESCOMENTADA Y REAL
            console.log("Contrato creado exitosamente:", result);
            alert(`Contrato tipo ${data.tipoContrato} creado exitosamente con ID: ${result.id_contrato}`);
            // Redirigir al detalle del nuevo contrato
            router.push(`/adminProveedores/contratos/${result.id_contrato}`);

        } catch (err) {
            console.error("Error al crear contrato:", err);
            setError(`Error al crear: ${(err as Error).message}`);
            // Mantenemos al usuario en el formulario para que vea el error
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (confirm("¿Estás seguro de que deseas cancelar? Se perderán los datos no guardados.")) {
            router.push('/adminProveedores/contratos');
        }
    };
    const formStyles = `
    .input-form { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100; }
    .textarea-form { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100; }
    .select-form { @apply mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100; }
    .btn-primary { @apply px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed; }
    .btn-secondary { @apply px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50; }
    label { @apply block text-sm font-medium text-gray-700; }
    fieldset { @apply mb-4; }
    legend { @apply text-base font-medium text-gray-900; }
 `;
    return (
        // Contenedor General Flexbox
        <div className="flex flex-col min-h-screen">
            <Menu /> {/* <-- MENÚ PRINCIPAL ARRIBA */}

            {/* Contenedor Principal del Contenido */}
            {/* AJUSTA pt-XX según la altura real de tu menú */}
            <main className="flex-grow p-4 md:p-6 pt-20 md:pt-24"> {/* <-- AJUSTES: <main>, flex-grow, pt-XX */}
                {/* Inyecta estilos */}
                <style>{formStyles}</style>

                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h1 className="text-xl font-semibold">Crear Nuevo Contrato (Admin)</h1>
                    <Link href="/adminProveedores/contratos" className="text-sm text-blue-600 hover:underline">
                        ← Volver a la lista
                    </Link>
                </div>

                {/* Selector de Tipo de Contrato */}
                <div className="mb-6">
                    <label htmlFor="tipoContratoSelect" className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccione el Tipo de Contrato a Crear:
                    </label>
                    <select
                        id="tipoContratoSelect"
                        value={tipoContrato}
                        onChange={(e) => setTipoContrato(e.target.value as 'servicio' | 'adquisicion' | '')}
                        className="mt-1 block w-full md:w-1/2 select-form" // Usa la clase definida en formStyles
                        disabled={isSaving}
                    >
                        <option value="" disabled>-- Seleccionar --</option>
                        <option value="servicio">Contrato de Servicio</option>
                        <option value="adquisicion">Contrato de Adquisición</option>
                    </select>
                </div>

                {/* Renderizado Condicional del Formulario */}
                {tipoContrato === 'adquisicion' && (
                    <ContratoAdquisicionForm
                        onSubmit={handleSave}
                        onCancel={handleCancel}
                        isSaving={isSaving}
                        error={error}
                    />
                )}
                {tipoContrato === 'servicio' && (
                    <ContratoServicioForm
                        onSubmit={handleSave}
                        onCancel={handleCancel}
                        isSaving={isSaving}
                        error={error}
                    />
                )}

                {/* Mensaje de Error general del guardado si no se muestra en el form */}
                {error && !isSaving && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                        <strong>Error al guardar:</strong> {error}
                    </div>
                )}

            </main> {/* <-- FIN Contenedor Principal (<main>) */}

            <Pie /> {/* <-- PIE ABAJO */}
        </div> // <-- FIN Contenedor General
    );
};



export default AdminCrearContratoPage;