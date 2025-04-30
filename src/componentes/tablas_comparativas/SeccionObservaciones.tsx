// src/components/tablas_comparativas/SeccionObservaciones.tsx
'use client';

import React, { useState } from 'react';
import { TablaComparativaObservacion, AgregarObservacionInput, ActualizarObservacionInput } from '@/types/tablaComparativa';

interface SeccionObservacionesProps {
    observaciones: TablaComparativaObservacion[];
    idTablaComparativaProveedor: number;
    isEditable?: boolean;
    onAddObservacion?: (data: AgregarObservacionInput) => Promise<void>;
    onUpdateObservacion?: (id: number, data: ActualizarObservacionInput) => Promise<void>;
    onDeleteObservacion?: (id: number) => Promise<void>;
}

export const SeccionObservaciones: React.FC<SeccionObservacionesProps> = ({
    observaciones = [],
    idTablaComparativaProveedor,
    isEditable = false,
    onAddObservacion,
    onUpdateObservacion,
    onDeleteObservacion,
}) => {
    // Estado para el formulario de nueva observación (simplificado)
    const [nuevaDescripcion, setNuevaDescripcion] = useState('');
    const [nuevoCumple, setNuevoCumple] = useState(false);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [isAdding, setIsAdding] = useState(false); // Para controlar visibilidad del form
    const [isLoading, setIsLoading] = useState(false);

    const handleAddSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!nuevaDescripcion.trim() || !onAddObservacion) return;

        const data: AgregarObservacionInput = {
            id_tabla_comparativa_proveedor: idTablaComparativaProveedor,
            descripcion_validacion: nuevaDescripcion,
            cumple: nuevoCumple,
            comentario_adicional: nuevoComentario || null,
        };

        setIsLoading(true);
        try {
            await onAddObservacion(data);
            // Limpiar formulario y ocultar
            setNuevaDescripcion('');
            setNuevoCumple(false);
            setNuevoComentario('');
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding observation:", error);
            // // TODO: Mostrar error al usuario
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (onDeleteObservacion && confirm('¿Eliminar esta observación?')) {
            setIsLoading(true); // Podrías tener un loading por item
             try {
                await onDeleteObservacion(id);
            } catch (error) {
                 console.error("Error deleting observation:", error);
                 // // TODO: Mostrar error
            } finally {
                setIsLoading(false);
            }
        }
    };

     // // TODO: Implementar lógica de edición inline o modal para onUpdateObservacion

    return (
        <div className="mt-6 p-4 border rounded bg-gray-50">
            <h3 className="text-md font-semibold mb-3">Observaciones / Validaciones (Proveedor ID en Tabla: {idTablaComparativaProveedor})</h3>
             {/* // TODO: Aplicar estilos */}

            {observaciones.length === 0 && !isAdding && (
                <p className="text-sm text-gray-500">No hay observaciones registradas.</p>
            )}

            <ul className="space-y-2 mb-4">
                {observaciones.map((obs) => (
                    <li key={obs.id} className="text-sm p-2 border-b flex justify-between items-start">
                        <div>
                            <p><strong>Validación:</strong> {obs.descripcion_validacion}</p>
                            <p><strong>Cumple:</strong> {obs.cumple ? 'Sí' : 'No'}</p>
                            {obs.comentario_adicional && <p><strong>Comentario:</strong> {obs.comentario_adicional}</p>}
                        </div>
                        {isEditable && onDeleteObservacion && (
                            <button
                                onClick={() => handleDelete(obs.id)}
                                className="text-red-600 hover:text-red-800 text-xs ml-4"
                                disabled={isLoading}
                            >
                                Eliminar
                            </button>
                        )}
                         {/* // TODO: Botón/lógica de Edición */}
                    </li>
                ))}
            </ul>

            {isEditable && onAddObservacion && !isAdding && (
                <button onClick={() => setIsAdding(true)} className="text-sm text-indigo-600 hover:text-indigo-800">
                    + Agregar Observación
                </button>
            )}

            {isEditable && onAddObservacion && isAdding && (
                <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 border-t pt-4">
                     <h4 className="text-sm font-medium">Nueva Observación</h4>
                     <div>
                         <label htmlFor={`desc-obs-${idTablaComparativaProveedor}`} className="block text-xs font-medium text-gray-700">Descripción Validación</label>
                         <input
                             type="text"
                             id={`desc-obs-${idTablaComparativaProveedor}`}
                             value={nuevaDescripcion}
                             onChange={(e) => setNuevaDescripcion(e.target.value)}
                             required
                             className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                             disabled={isLoading}
                        />
                     </div>
                     <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={`cumple-obs-${idTablaComparativaProveedor}`}
                            checked={nuevoCumple}
                            onChange={(e) => setNuevoCumple(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            disabled={isLoading}
                        />
                         <label htmlFor={`cumple-obs-${idTablaComparativaProveedor}`} className="ml-2 block text-xs font-medium text-gray-700">Cumple</label>
                     </div>
                     <div>
                         <label htmlFor={`coment-obs-${idTablaComparativaProveedor}`} className="block text-xs font-medium text-gray-700">Comentario Adicional</label>
                         <textarea
                             id={`coment-obs-${idTablaComparativaProveedor}`}
                             value={nuevoComentario}
                             onChange={(e) => setNuevoComentario(e.target.value)}
                             rows={2}
                             className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                             disabled={isLoading}
                        />
                     </div>
                     <div className="flex space-x-2">
                         <button
                             type="submit"
                             className="px-3 py-1 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                             disabled={isLoading}
                         >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                         </button>
                         <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        >
                             Cancelar
                        </button>
                     </div>
                 </form>
            )}
        </div>
    );
};