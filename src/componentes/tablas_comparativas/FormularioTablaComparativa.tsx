// src/components/tablas_comparativas/FormularioTablaComparativa.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TablaComparativaCompleta, CrearTablaComparativaInput, ActualizarTablaInput, EstadoTablaComparativa } from '@/types/tablaComparativa'; // Ajusta la ruta

interface FormularioTablaComparativaProps {
    initialData?: TablaComparativaCompleta; // Para modo edición
    onSubmit: (data: CrearTablaComparativaInput | ActualizarTablaInput) => Promise<void>;
    isLoading?: boolean;
    // Aquí podrías añadir más props para manejar la adición/eliminación de proveedores/items si este form lo orquesta
}

export const FormularioTablaComparativa: React.FC<FormularioTablaComparativaProps> = ({
    initialData,
    onSubmit,
    isLoading = false,
}) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState<EstadoTablaComparativa>('borrador'); // Estado por defecto al crear

    const isEditing = Boolean(initialData);

    useEffect(() => {
        if (isEditing && initialData) {
            setNombre(initialData.nombre || '');
            setDescripcion(initialData.descripcion || '');
            setEstado(initialData.estado || 'borrador');
        }
    }, [initialData, isEditing]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isLoading) return;

        // // TODO: Añadir validación (ej. con Zod) antes de enviar
        // if (!nombre.trim()) {
        //     alert('El nombre es requerido.');
        //     return;
        // }

        const data: CrearTablaComparativaInput | ActualizarTablaInput = isEditing
            ? { nombre, descripcion: descripcion || null, estado } // Actualizar
            : { nombre, descripcion: descripcion || null, id_usuario_creador: null }; // Crear (obtener id_usuario de sesión/contexto)

        // // TODO: Obtener id_usuario_creador real si es necesario para la creación
        // if (!isEditing) {
        //     // data.id_usuario_creador = ... obtener de sesión ...
        // }

        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white shadow">
            {/* // TODO: Aplicar estilos */}
            <h2 className="text-lg font-semibold">{isEditing ? 'Editar Tabla Comparativa' : 'Crear Nueva Tabla Comparativa'}</h2>

            <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción
                </label>
                <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
            </div>

            {isEditing && (
                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                        Estado
                    </label>
                    <select
                        id="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value as EstadoTablaComparativa)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        disabled={isLoading}
                    >
                        <option value="borrador">Borrador</option>
                        <option value="en_revision">En Revisión</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                    </select>
                </div>
            )}

            {/* // TODO: Aquí irían los Selectores de Proveedores e Ítems si este form los maneja */}
            {/* <SelectorProveedores onSelectProveedor={...} /> */}

            <div className="flex justify-end">
                <button
                    type="submit"
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Tabla' : 'Crear Tabla')}
                </button>
            </div>
        </form>
    );
};