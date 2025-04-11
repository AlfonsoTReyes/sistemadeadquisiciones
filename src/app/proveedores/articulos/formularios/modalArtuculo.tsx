// src/app/proveedores/articulos/formularios/ModalArticulo.tsx
import React, { useState, useEffect } from 'react';
import { ArticuloProveedor, ArticuloFormData, CatalogoPartidaFiltro } from '../interface'; // Ajusta ruta e importa CatalogoPartidaFiltro

interface ModalArticuloProps {
    isOpen: boolean;
    onClose: () => void;
    // Ajusta la firma de onSubmit para reflejar que codigo_partida viene del form
    onSubmit: (formData: ArticuloFormData & { codigo_partida: string; id_proveedor: number; id_articulo?: number }) => Promise<void>;
    initialData?: ArticuloProveedor | null;
    isLoading: boolean;
    error: string | null;
    idProveedor: number | null;
    partidasDisponibles: CatalogoPartidaFiltro[]; // <-- NUEVA PROP: Lista de partidas para el select
}

// Actualiza la interfaz del formulario para incluir codigo_partida
interface ModalFormData extends ArticuloFormData {
    codigo_partida: string;
}


const ModalArticulo: React.FC<ModalArticuloProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
    error: apiError,
    idProveedor,
    partidasDisponibles, // <-- Recibir la prop
}) => {
    // Estado inicial del formulario ahora incluye codigo_partida
    const formInitialState: ModalFormData = {
        codigo_partida: '', // <-- Añadido
        descripcion: '',
        unidad_medida: '',
        stock: '',
        precio_unitario: '',
        estatus: true,
    };

    const [form, setForm] = useState<ModalFormData>(formInitialState);
    const [internalError, setInternalError] = useState('');

    const isEditing = Boolean(initialData && initialData.id_articulo);

    // Efecto para llenar/resetear el formulario
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                console.log("Modal: Populating form for editing article ID:", initialData.id_articulo, "with partida:", initialData.codigo_partida);
                setForm({
                    codigo_partida: initialData.codigo_partida || '', // <-- Establecer partida al editar
                    descripcion: initialData.descripcion || '',
                    unidad_medida: initialData.unidad_medida || '',
                    stock: String(initialData.stock ?? ''),
                    precio_unitario: String(initialData.precio_unitario ?? ''),
                    estatus: initialData.estatus ?? true,
                });
            } else {
                console.log("Modal: Resetting form for new article.");
                setForm(formInitialState); // Resetear para nuevo artículo
            }
            setInternalError('');
        }
    }, [isOpen, isEditing, initialData]); // No añadir formInitialState aquí para evitar bucles

    // Handler genérico para cambios (funciona para select también)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
             setForm(prev => ({ ...prev, [name]: e.target.checked }));
        } else if (name === 'stock' || name === 'precio_unitario') {
            // Validación numérica como antes
            const numericValue = value.replace(/[^0-9.]/g, '');
            const parts = numericValue.split('.');
            const formattedValue = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : numericValue;
            setForm(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            // Actualiza otros campos (incluyendo codigo_partida del select)
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handler para enviar el formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInternalError('');

        // --- Validaciones Actualizadas ---
        if (!form.codigo_partida) { // <-- Validar que se seleccionó una partida
             setInternalError("Debe seleccionar una partida presupuestaria."); return;
        }
        if (!form.descripcion.trim()) { setInternalError("La descripción es obligatoria."); return; }
        if (!form.unidad_medida.trim()) { setInternalError("La unidad de medida es obligatoria."); return; }
        if (form.stock.trim() === '' || isNaN(parseFloat(form.stock)) || parseFloat(form.stock) < 0) {
            setInternalError("El stock es obligatorio y debe ser un número no negativo."); return;
        }
         if (form.precio_unitario.trim() === '' || isNaN(parseFloat(form.precio_unitario)) || parseFloat(form.precio_unitario) < 0) {
            setInternalError("El precio unitario es obligatorio y debe ser un número no negativo."); return;
        }
         if (!isEditing && !idProveedor) { setInternalError("Error interno: Falta ID proveedor."); return; }
        // -------------------------------

        // Prepara el payload
        const payload = {
            // Incluye codigo_partida del estado del formulario
            codigo_partida: form.codigo_partida,
            descripcion: form.descripcion,
            unidad_medida: form.unidad_medida,
            estatus: form.estatus,
            // Convierte stock y precio a número
            stock: parseFloat(form.stock),
            precio_unitario: parseFloat(form.precio_unitario),
            // Añade IDs
            id_proveedor: initialData?.id_proveedor ?? idProveedor!, // Usar ! si estamos seguros que idProveedor no será null aquí
            ...(isEditing && { id_articulo: initialData?.id_articulo })
        };

        // Verifica que id_proveedor se asignó correctamente
        if (!payload.id_proveedor) {
             setInternalError("Error fatal: No se pudo determinar el ID del proveedor.");
             return;
        }

        console.log("Modal: Enviando payload:", payload);
        // Llama a onSubmit (handleSaveArticulo en page.tsx) con el payload completo
        await onSubmit(payload);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
            <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    aria-label="Cerrar modal"
                    disabled={isLoading}
                >
                    ×
                </button>
                <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                    {isEditing ? 'Editar Artículo' : 'Agregar Nuevo Artículo'}
                </h3>

                {(internalError || apiError) && (
                    <div className="my-3 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                        <strong>Error:</strong> {internalError || apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">

                    {/* --- NUEVO: Selector de Partida --- */}
                    <div>
                        <label htmlFor="codigo_partida" className="block text-sm font-medium text-gray-700">Partida Presupuestaria *</label>
                        <select
                            id="codigo_partida"
                            name="codigo_partida"
                            value={form.codigo_partida}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                            disabled={isLoading || !partidasDisponibles || partidasDisponibles.length === 0} // Deshabilitar si carga o no hay partidas
                        >
                            <option value="" disabled>-- Seleccione una partida --</option>
                            {partidasDisponibles && partidasDisponibles.length > 0 ? (
                                partidasDisponibles.map((partida) => (
                                    <option key={partida.codigo} value={partida.codigo}>
                                        {partida.codigo} - {partida.descripcion}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Cargando partidas...</option> // O mensaje de error si falla la carga
                            )}
                        </select>
                         {(!partidasDisponibles || partidasDisponibles.length === 0) && !isLoading && (
                            <p className="text-xs text-red-500 mt-1">No se pudo cargar el catálogo de partidas.</p>
                         )}
                    </div>
                    {/* --- FIN Selector de Partida --- */}


                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción / Características Técnicas *</label>
                        <textarea
                            id="descripcion" name="descripcion" rows={3} // Reducido a 3 filas
                            value={form.descripcion} onChange={handleChange} required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Cambiado a 3 columnas */}
                        <div>
                            <label htmlFor="unidad_medida" className="block text-sm font-medium text-gray-700">UDM *</label>
                            <input
                                type="text" name="unidad_medida" id="unidad_medida" value={form.unidad_medida} onChange={handleChange} required placeholder="Ej: Pieza, Kg..."
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock *</label>
                            <input
                                type="text" inputMode="decimal"
                                name="stock" id="stock" value={form.stock} onChange={handleChange} required placeholder="Ej: 100"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="precio_unitario" className="block text-sm font-medium text-gray-700">Precio Unitario ($) *</label>
                            <input
                                type="text" inputMode="decimal"
                                name="precio_unitario" id="precio_unitario" value={form.precio_unitario} onChange={handleChange} required placeholder="Ej: 150.75"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                disabled={isLoading}
                            />
                        </div>

                    </div>
                     {/* Checkbox de Estatus movido fuera del grid */}
                     <div className="flex items-center">
                            <input
                                id="estatus" name="estatus" type="checkbox"
                                checked={form.estatus} onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                disabled={isLoading}
                            />
                            <label htmlFor="estatus" className="ml-2 block text-sm font-medium text-gray-900">
                                Artículo Activo
                            </label>
                    </div>

                    {/* --- Botones --- */}
                    <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-6">
                        <button
                            type="button" onClick={onClose} disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm font-medium"
                        > Cancelar </button>
                        <button
                            type="submit" disabled={isLoading || !!internalError}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium ${isLoading || internalError ? 'opacity-50 cursor-not-allowed' : ''}`}
                        > {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Artículo' : 'Agregar Artículo')} </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalArticulo;