// src/components/tablas_comparativas/SeccionFirmasComentarios.tsx
'use client';

import React, { useState } from 'react';
import { TablaComparativaFirma, TablaComparativaComentario, AgregarFirmaInput, AgregarComentarioInput } from '@/types/tablaComparativa';

interface SeccionFirmasComentariosProps {
    firmas: TablaComparativaFirma[];
    comentarios: TablaComparativaComentario[];
    idTablaComparativa: number;
    idUsuarioActual: number; // Necesario para enviar al backend al agregar
    isEditable?: boolean; // Para mostrar o no los forms de agregar
    onAddFirma?: (data: AgregarFirmaInput) => Promise<void>;
    onAddComentario?: (data: AgregarComentarioInput) => Promise<void>;
    // onDeleteFirma/Comentario si fuera necesario
}

// Helper para formatear fecha (ejemplo)
const formatDate = (dateString: string | Date): string => {
    try {
        return new Date(dateString).toLocaleString('es-MX');
    } catch (e) {
        return String(dateString);
    }
};


export const SeccionFirmasComentarios: React.FC<SeccionFirmasComentariosProps> = ({
    firmas = [],
    comentarios = [],
    idTablaComparativa,
    idUsuarioActual,
    isEditable = false,
    onAddFirma,
    onAddComentario,
}) => {
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [tipoFirma, setTipoFirma] = useState(''); // O un valor por defecto si aplica
    const [comentarioFirma, setComentarioFirma] = useState('');
    const [isLoadingComentario, setIsLoadingComentario] = useState(false);
    const [isLoadingFirma, setIsLoadingFirma] = useState(false);

    const handleAddComentarioSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!nuevoComentario.trim() || !onAddComentario) return;

        const data: AgregarComentarioInput = {
            id_tabla_comparativa: idTablaComparativa,
            id_usuario: idUsuarioActual, // // TODO: Asegúrate que este ID sea correcto
            texto_comentario: nuevoComentario,
        };

        setIsLoadingComentario(true);
        try {
            await onAddComentario(data);
            setNuevoComentario(''); // Limpiar form
        } catch (error) {
            console.error("Error adding comentario:", error);
            // // TODO: Mostrar error
        } finally {
            setIsLoadingComentario(false);
        }
    };

    const handleAddFirmaSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!tipoFirma.trim() || !onAddFirma) return; // Validar que se elija un tipo

        const data: AgregarFirmaInput = {
            id_tabla_comparativa: idTablaComparativa,
            id_usuario: idUsuarioActual, // // TODO: Asegúrate que este ID sea correcto
            tipo_firma: tipoFirma,
            comentario_firma: comentarioFirma || null,
        };

        setIsLoadingFirma(true);
        try {
            await onAddFirma(data);
            setTipoFirma(''); // Resetear form
            setComentarioFirma('');
        } catch (error) {
            console.error("Error adding firma:", error);
            // // TODO: Mostrar error
        } finally {
            setIsLoadingFirma(false);
        }
    };


    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* // TODO: Aplicar estilos */}

            {/* Sección Firmas */}
            <div className="p-4 border rounded bg-gray-50">
                <h3 className="text-md font-semibold mb-3">Firmas / Aprobaciones</h3>
                {firmas.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay firmas registradas.</p>
                ) : (
                    <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {firmas.map((firma) => (
                            <li key={firma.id} className="text-xs p-2 border-b">
                                <p><strong>Tipo:</strong> {firma.tipo_firma}</p>
                                <p><strong>Usuario:</strong> {firma.nombre_usuario || `ID ${firma.id_usuario}`}</p>
                                <p><strong>Fecha:</strong> {formatDate(firma.fecha_firma)}</p>
                                {firma.comentario_firma && <p><strong>Comentario:</strong> {firma.comentario_firma}</p>}
                            </li>
                        ))}
                    </ul>
                )}

                {isEditable && onAddFirma && (
                    <form onSubmit={handleAddFirmaSubmit} className="mt-4 space-y-2 border-t pt-3">
                        <h4 className="text-sm font-medium mb-1">Agregar Firma/Acción</h4>
                        {/* // TODO: Usar un <select> con los tipos de firma permitidos */}
                        <div>
                            <label htmlFor={`tipo-firma-${idTablaComparativa}`} className="block text-xs font-medium text-gray-700">Tipo de Acción</label>
                            <input
                                type="text"
                                id={`tipo-firma-${idTablaComparativa}`}
                                placeholder="Ej: Aprobado Compras"
                                value={tipoFirma}
                                onChange={(e) => setTipoFirma(e.target.value)}
                                required
                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                                disabled={isLoadingFirma}
                            />
                        </div>
                        <div>
                            <label htmlFor={`coment-firma-${idTablaComparativa}`} className="block text-xs font-medium text-gray-700">Comentario (Opcional)</label>
                            <textarea
                                id={`coment-firma-${idTablaComparativa}`}
                                value={comentarioFirma}
                                onChange={(e) => setComentarioFirma(e.target.value)}
                                rows={2}
                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                                disabled={isLoadingFirma}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                            disabled={isLoadingFirma}
                        >
                            {isLoadingFirma ? 'Registrando...' : 'Registrar Acción'}
                        </button>
                    </form>
                )}
            </div>

            {/* Sección Comentarios */}
            <div className="p-4 border rounded bg-gray-50">
                <h3 className="text-md font-semibold mb-3">Comentarios Generales</h3>
                {comentarios.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay comentarios.</p>
                ) : (
                    <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {comentarios.map((com) => (
                            <li key={com.id} className="text-xs p-2 border-b">
                                <p className="text-gray-600">{com.texto_comentario}</p>
                                <p className="text-gray-500 mt-1">
                                    - {com.nombre_usuario || `Usuario ID ${com.id_usuario}`} el {formatDate(com.fecha_comentario)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                {isEditable && onAddComentario && (
                    <form onSubmit={handleAddComentarioSubmit} className="mt-4 space-y-2 border-t pt-3">
                        <h4 className="text-sm font-medium mb-1">Agregar Comentario</h4>
                        <div>
                            <label htmlFor={`texto-comentario-${idTablaComparativa}`} className="sr-only">Comentario</label>
                            <textarea
                                id={`texto-comentario-${idTablaComparativa}`}
                                value={nuevoComentario}
                                onChange={(e) => setNuevoComentario(e.target.value)}
                                rows={3}
                                required
                                placeholder="Escribe tu comentario aquí..."
                                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isLoadingComentario}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                            disabled={isLoadingComentario}
                        >
                            {isLoadingComentario ? 'Enviando...' : 'Enviar Comentario'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};