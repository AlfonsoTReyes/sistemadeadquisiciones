// src/app/proveedores/articulos/formularios/ModalArticulo.tsx
import React, { useState, useEffect } from 'react';
import { ArticuloProveedor, ArticuloFormData } from '../interface'; // Ajusta ruta

interface ModalArticuloProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: ArticuloFormData & { id_proveedor: number, id_articulo?: number }) => Promise<void>; // onSubmit recibe datos + IDs
    initialData?: ArticuloProveedor | null;
    isLoading: boolean;
    error: string | null;
    idProveedor: number | null;
}

const ModalArticulo: React.FC<ModalArticuloProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
    error: apiError,
    idProveedor,
}) => {
    const formInitialState: ArticuloFormData = {
        descripcion: '',
        unidad_medida: '',
        stock: '',
        precio_unitario: '',
        estatus: true, // Por defecto activo al crear
    };

    const [form, setForm] = useState<ArticuloFormData>(formInitialState);
    const [internalError, setInternalError] = useState(''); // Errores de validación del formulario

    const isEditing = Boolean(initialData && initialData.id_articulo);

    // Efecto para llenar el formulario al editar o resetear al abrir para crear
    useEffect(() => {
        if (isOpen) {
            if (isEditing && initialData) {
                console.log("Modal: Populating form for editing article ID:", initialData.id_articulo);
                setForm({
                    descripcion: initialData.descripcion || '',
                    unidad_medida: initialData.unidad_medida || '',
                    stock: String(initialData.stock ?? ''), // Convertir a string para el input
                    precio_unitario: String(initialData.precio_unitario ?? ''), // Convertir a string
                    estatus: initialData.estatus ?? true,
                });
            } else {
                console.log("Modal: Resetting form for new article.");
                setForm(formInitialState); // Resetear para nuevo artículo
            }
            setInternalError(''); // Limpiar errores internos al abrir/cambiar modo
        }
    }, [isOpen, isEditing, initialData]); // Depender de isOpen y initialData

    // Handler genérico para cambios en los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Manejar checkbox de estatus
        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
             setForm(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
             // Validar que stock y precio unitario solo acepten números y un punto decimal
             if (name === 'stock' || name === 'precio_unitario') {
                 // Permite números, un punto decimal, y opcionalmente un signo negativo al inicio (aunque el precio no debería ser negativo)
                 // Remueve caracteres no permitidos
                 const numericValue = value.replace(/[^0-9.]/g, '');
                 // Asegura que solo haya un punto decimal
                 const parts = numericValue.split('.');
                 const formattedValue = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : numericValue;

                 setForm(prev => ({ ...prev, [name]: formattedValue }));

             } else {
                  setForm(prev => ({ ...prev, [name]: value }));
             }

        }
    };

    // Handler para enviar el formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInternalError('');

        // Validaciones básicas
        if (!form.descripcion.trim()) {
            setInternalError("La descripción es obligatoria."); return;
        }
        if (!form.unidad_medida.trim()) {
            setInternalError("La unidad de medida es obligatoria."); return;
        }
        if (form.stock.trim() === '' || isNaN(parseFloat(form.stock)) || parseFloat(form.stock) < 0) {
            setInternalError("El stock es obligatorio y debe ser un número no negativo."); return;
        }
         if (form.precio_unitario.trim() === '' || isNaN(parseFloat(form.precio_unitario)) || parseFloat(form.precio_unitario) < 0) {
            setInternalError("El precio unitario es obligatorio y debe ser un número no negativo."); return;
        }
         if (!isEditing && !idProveedor) {
             setInternalError("Error interno: Falta el ID del proveedor."); return;
         }

        // Prepara el payload para enviar a la función onSubmit de la página
        const payload = {
            ...form,
            // Convierte stock y precio a número antes de enviar
            stock: parseFloat(form.stock),
            precio_unitario: parseFloat(form.precio_unitario),
            // Añade el id_proveedor (necesario para crear y para actualizar en el backend)
            id_proveedor: initialData?.id_proveedor ?? idProveedor,
            // Añade el id_articulo solo si estamos editando
            ...(isEditing && { id_articulo: initialData?.id_articulo })
        };

        // Asegurarse que id_proveedor existe en el payload final
        if (!payload.id_proveedor) {
             setInternalError("Error fatal: No se pudo determinar el ID del proveedor.");
             return;
        }

        console.log("Modal: Enviando payload:", payload);
        await onSubmit(payload); // Llama a handleSaveArticulo en page.tsx
    };

    if (!isOpen) {
        return null; // No renderizar nada si el modal no está abierto
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
            <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white"> {/* Ancho aumentado */}
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

                {/* Mostrar errores (internos o de API) */}
                {(internalError || apiError) && (
                    <div className="my-3 p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
                        <strong>Error:</strong> {internalError || apiError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* --- Campos del Formulario --- */}
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción / Características Técnicas</label>
                        <textarea
                            id="descripcion" name="descripcion" rows={4}
                            value={form.descripcion} onChange={handleChange} required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="unidad_medida" className="block text-sm font-medium text-gray-700">Unidad de Medida (UDM)</label>
                            <input
                                type="text" name="unidad_medida" id="unidad_medida" value={form.unidad_medida} onChange={handleChange} required placeholder="Ej: Pieza, Kg, Servicio, Caja..."
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Disponible</label>
                            <input
                                type="text" // Usar text para permitir validación manual de números/decimales
                                inputMode="decimal" // Sugiere teclado numérico en móviles
                                name="stock" id="stock" value={form.stock} onChange={handleChange} required placeholder="Ej: 100"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="precio_unitario" className="block text-sm font-medium text-gray-700">Precio Unitario ($)</label>
                            <input
                                type="text" // Usar text para validación manual
                                inputMode="decimal"
                                name="precio_unitario" id="precio_unitario" value={form.precio_unitario} onChange={handleChange} required placeholder="Ej: 150.75"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="estatus" className="block text-sm font-medium text-gray-700">Estatus</label>
                             <div className="mt-2 flex items-center">
                                <input
                                    id="estatus"
                                    name="estatus"
                                    type="checkbox"
                                    checked={form.estatus}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-600">{form.estatus ? 'Activo' : 'Inactivo'}</span>
                             </div>
                        </div>
                    </div>

                    {/* --- Botones --- */}
                    <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !!internalError}
                            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium ${isLoading || internalError ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Artículo' : 'Agregar Artículo')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalArticulo;