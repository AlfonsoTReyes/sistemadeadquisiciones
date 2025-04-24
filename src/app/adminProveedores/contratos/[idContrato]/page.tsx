"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// Importa la función de ACTUALIZACIÓN también
import { fetchContractDetails, updateContractRequest } from '@/fetch/contratosFetch'; // Ajusta ruta
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
    const handleSaveEdit = async (updatedData: ContratoUpdateData) => {
        if (!contratoId) return; // Seguridad extra

        setIsUpdating(true);
        setUpdateError(null); // Limpiar error previo
        console.log("Guardando datos:", updatedData);

        try {
            const updatedContrato = await updateContractRequest(contratoId, updatedData);
            setContrato(updatedContrato); // Actualiza el estado con los datos frescos de la API
            setIsEditing(false); // Salir del modo edición
            alert("Contrato actualizado exitosamente!"); // O usar un toast
        } catch (err) {
            console.error("Error al guardar contrato:", err);
            setUpdateError(`Error al guardar: ${(err as Error).message}`);
            // No salir del modo edición para que el usuario corrija
        } finally {
            setIsUpdating(false);
        }
    };

    // *** Función para cancelar la edición ***
    const handleCancelEdit = () => {
        setIsEditing(false);
        setUpdateError(null); // Limpiar error al cancelar
    };

    return (
        <div className="p-4 md:p-6">
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
            {isLoading && ( <div className="text-center p-4"><p>Cargando...</p></div> )}
            {error && !isLoading && (
                <div className="p-3 mb-4 border-l-4 bg-red-100 border-red-500 text-red-700" role="alert">
                    <p className="font-bold">{error}</p>
                </div>
            )}

            {/* Renderizado Condicional: Vista o Formulario */}
            {!isLoading && !error && contrato && (
                <>
                    {isEditing ? (
                        // *** Renderiza el Formulario de Edición ***
                        <ContractEditForm
                            initialData={contrato}
                            onSubmit={handleSaveEdit}
                            onCancel={handleCancelEdit}
                            isSaving={isUpdating}
                            error={updateError}
                        />
                    ) : (
                        // *** Renderiza la Vista de Detalles ***
                        <>
                            <ContractDetailView contrato={contrato} />
                            <div className="mt-6 flex justify-end space-x-3">
                                {/* Botón para ENTRAR en modo edición */}
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Editar Contrato
                                </button>
                                {/* <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar Contrato</button> */}
                            </div>
                        </>
                    )}
                </>
            )}
            {/* Mostrar si no hay contrato y no está cargando (ej. 404 inicial) */}
             {!isLoading && !error && !contrato && (
                 <p className="text-center text-gray-500 italic">No se encontraron datos para el contrato solicitado.</p>
             )}

        </div>
    );
};

export default AdminContratoDetailPage;