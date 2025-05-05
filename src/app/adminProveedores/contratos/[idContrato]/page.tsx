"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Menu from '../../../menu';
import Pie from "../../../pie";
// Importa la función de ACTUALIZACIÓN también
import { fetchContractDetails, updateContractRequest, generateContractWord } from '@/fetch/contratosFetch'; // Ajusta ruta
import { ContratoDetallado, ContratoUpdateData } from '@/types/contrato'; // Ajusta ruta

// Importa los componentes
import ContractDetailView from '@/componentes/contratos/ContractDetailView'; // Ajusta ruta si es necesario
import ContractEditForm from '@/componentes/contratos/ContractEditForm';   // Ajusta ruta si es necesario


const AdminContratoDetailPage: React.FC = () => {
    const params = useParams();
    const [contrato, setContrato] = useState<ContratoDetallado | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [contratoId, setContratoId] = useState<number | null>(null);

    // *** Nuevos Estados para Edición ***
    const [isEditing, setIsEditing] = useState(false); // Controla si está en modo edición
    const [isUpdating, setIsUpdating] = useState(false); // Controla si se está guardando
    const [updateError, setUpdateError] = useState<string | null>(null); // Errores específicos del guardado
    // *** Nuevo estado para generación ***
    const [isGenerating, setIsGenerating] = useState<null | 'servicio' | 'adquisicion'>(null); // Para indicar cuál se está generando
    const [generationError, setGenerationError] = useState<string | null>(null);
    // Efecto para obtener ID de la URL (sin cambios)
    useEffect(() => {
        const idStr = params.idContrato as string;
        if (idStr) {
            const idNum = parseInt(idStr, 10);
            if (!isNaN(idNum)) setContratoId(idNum);
            else { setError("ID inválido."); setIsLoading(false); }
        } else { setError("ID no encontrado."); setIsLoading(false); }
    }, [params]);

    // Efecto para cargar detalles (sin cambios)
    useEffect(() => {
        if (contratoId === null) return;
        const loadDetails = async () => {
            setIsLoading(true); setError(null); setContrato(null);
            try {
                const data = await fetchContractDetails(contratoId);
                setContrato(data);
            } catch (err) {
                setError(`Error al cargar: ${(err as Error).message}`);
            } finally { setIsLoading(false); }
        };
        loadDetails();
    }, [contratoId]);

    // *** Función para manejar el guardado del formulario ***
    const handleSaveEdit = async (idDelContrato: number, datosParaActualizar: ContratoUpdateData & { template_data?: object }) => {
        // Ya no necesitas leer contratoId del estado aquí, viene como argumento
        // if (!contratoId) return;

        setIsUpdating(true);
        setUpdateError(null);
        // *** Loguea ambos argumentos ***
        console.log(`Guardando datos para contrato ID: ${idDelContrato}`, datosParaActualizar);

        try {
            // *** LLAMAR CON LOS DOS ARGUMENTOS RECIBIDOS ***
            const updatedContrato = await updateContractRequest(idDelContrato, datosParaActualizar);
            setContrato(updatedContrato);
            setIsEditing(false);
            alert("Contrato actualizado exitosamente!");
        } catch (err) {
            console.error("Error al guardar contrato:", err);
            setUpdateError(`Error al guardar: ${(err as Error).message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // *** Función para cancelar la edición ***
    const handleCancelEdit = () => {
        setIsEditing(false);
        setUpdateError(null); // Limpiar error al cancelar
    };
    // *** NUEVA FUNCIÓN PARA GENERAR WORD ***
    const handleGenerateWord = async (templateType: 'servicio' | 'adquisicion') => {
        if (!contratoId || isGenerating) return;

        setIsGenerating(templateType); // Marcar cuál se está generando
        setGenerationError(null);
        console.log(`Solicitando generación de Word para contrato ${contratoId}, plantilla: ${templateType}`);

        try {
            // Llama a la función fetch (asegúrate que exista en contratosFetch.ts)
            await generateContractWord(contratoId, templateType);
            // El download lo maneja el fetch, aquí solo limpiamos el estado
        } catch (err) {
            console.error(`Error generando Word (${templateType}):`, err);
            setGenerationError(`Error al generar documento ${templateType}: ${(err as Error).message}`);
        } finally {
            setIsGenerating(null); // Terminar estado de generación
        }
    };
    return (
        // Contenedor General Flexbox
        <div className="flex flex-col min-h-screen">
            <Menu /> {/* <-- MENÚ PRINCIPAL ARRIBA */}

            {/* Contenedor Principal del Contenido */}
            {/* AJUSTA pt-XX según la altura real de tu menú */}
            <main className="flex-grow p-4 md:p-6 pt-20 md:pt-24"> {/* <-- AJUSTES: <main>, flex-grow, pt-XX */}

                <div className="flex justify-between items-center mb-4 pb-3 border-b">
                    <h1 className="text-xl font-semibold">
                        {isEditing ? 'Editar' : 'Detalle de'} Contrato {contratoId ? `(ID: ${contratoId})` : ''} (Admin)
                    </h1>
                    {/* Mostrar Link Volver solo si no está editando */}
                    {!isEditing && (
                        <Link href="/adminProveedores/contratos" className="text-sm text-blue-600 hover:underline">
                            ← Volver a la lista
                        </Link>
                    )}
                </div>

                {/* Mensajes de Carga y Error Global */}
                {isLoading && (<div className="text-center p-4"><p>Cargando...</p></div>)}
                {error && !isLoading && (
                    <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                        <p className="font-bold">{error}</p>
                    </div>
                )}

                {/* Renderizado Condicional: Vista o Formulario */}
                {!isLoading && !error && contrato && (
                    <>
                        {isEditing ? (
                            // Componente de Formulario de Edición
                            <ContractEditForm
                                initialData={contrato}
                                onSubmit={handleSaveEdit}
                                onCancel={handleCancelEdit}
                                isSaving={isUpdating}
                                error={updateError}
                            />
                        ) : (
                            // Vista de Detalles y Botones
                            <>
                                <ContractDetailView contrato={contrato} linkBasePath="/admin" /> {/* Asume que muestra los detalles */}
                                <div className="mt-6 flex flex-wrap justify-end items-center gap-3 border-t pt-4">
                                    {/* Mensaje de error de generación */}
                                    {generationError && <p className="text-sm text-red-600 mr-auto">{generationError}</p>}

                                    {/* --- BOTONES DE GENERACIÓN --- */}
                                    <button
                                        onClick={() => handleGenerateWord('servicio')}
                                        disabled={isGenerating !== null || isEditing} // Deshabilitar si edita
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {isGenerating === 'servicio' ? 'Generando...' : 'Generar Servicio (.docx)'}
                                    </button>
                                    <button
                                        onClick={() => handleGenerateWord('adquisicion')}
                                        disabled={isGenerating !== null || isEditing} // Deshabilitar si edita
                                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-400"
                                    >
                                        {isGenerating === 'adquisicion' ? 'Generando...' : 'Generar Adquisición (.docx)'}
                                    </button>
                                    {/* --- FIN BOTONES GENERACIÓN --- */}

                                    {/* Botón Editar */}
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        disabled={isGenerating !== null || isEditing} // Deshabilitar si ya edita o genera
                                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-400"
                                    >
                                        Editar Datos
                                    </button>
                                    {/* Podría ir un botón de Eliminar aquí */}
                                    {/* <button disabled={isGenerating !== null || isEditing} className="...">Eliminar</button> */}
                                </div>
                            </>
                        )}
                    </>
                )}
                {/* Mostrar si no hay contrato y no está cargando (ej. 404 inicial) */}
                {!isLoading && !error && !contrato && (
                    <p className="text-center text-gray-500 italic">No se encontraron datos para el contrato solicitado.</p>
                )}

            </main> {/* <-- FIN Contenedor Principal (<main>) */}

            <Pie /> {/* <-- PIE ABAJO */}
        </div> // <-- FIN Contenedor General
    );
};

export default AdminContratoDetailPage;