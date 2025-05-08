// src/app/tablas_comparativas/[idTablaComparativa]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation'; // useRouter removed as it was unused
import Link from 'next/link';
import {
    TablaComparativaCompleta,
    ActualizarTablaInput,
    AgregarProveedorInput,
    AgregarItemInput,
    AgregarObservacionInput,
    AgregarFirmaInput,
    AgregarComentarioInput,
    EstadoTablaComparativa
} from '@/types/tablaComparativa';
import { Proveedor, ProveedorDetallado } from '@/types/proveedor';
import { ArticuloCatalogo } from '@/types/catalogoProveedores';

// Componentes
import { TablaComparativaDisplay } from '@/componentes/tablas_comparativas/TablaComparativaDisplay';
import { SelectorProveedores } from '@/componentes/tablas_comparativas/SelectorProveedores';
import { SelectorProductosServicios } from '@/componentes/tablas_comparativas/SelectorProductosServicios';
import { SeccionObservaciones } from '@/componentes/tablas_comparativas/SeccionObservaciones';
import { SeccionFirmasComentarios } from '@/componentes/tablas_comparativas/SeccionFirmasComentarios';

// Fetchers Principales
import {
    fetchTablaComparativaDetalle,
    actualizarTablaComparativaFetch,
} from '@/fetch/tablasComparativasFetch';

// Fetchers para Operaciones Anidadas
import {
    fetchProveedorDetalladoParaSnapshot,
    agregarProveedorATablaFetch,
    eliminarProveedorDeTablaFetch,
    agregarItemAProveedorFetch,
    eliminarItemFetch,
    agregarObservacionFetch,
    eliminarObservacionFetch,
    agregarFirmaFetch,
    agregarComentarioFetch,
} from '@/fetch/tablasComparativasFetch';

// Helper para obtener ID de usuario
const getUserIdFromSession = (): number | null => {
    if (typeof window !== "undefined") {
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId) {
            const parsedId = parseInt(storedUserId, 10);
            if (!isNaN(parsedId)) return parsedId;
        }
    }
    console.error("No se pudo obtener un ID de usuario válido de sessionStorage.");
    return null;
};

// Helper para construir domicilio
const construirDomicilio = (p: ProveedorDetallado): string | null => {
    const parts = [p.calle, p.numero, p.colonia, p.codigo_postal, p.municipio, p.estado].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
}

export default function DetalleTablaComparativaPage() {
    const params = useParams();
    // const router = useRouter(); // Comentado porque no se usa
    const idTablaComparativa = parseInt(params.idTablaComparativa as string, 10);

    const [tablaData, setTablaData] = useState<TablaComparativaCompleta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idUsuarioActual, setIdUsuarioActual] = useState<number | null>(null);

    useEffect(() => {
        const userId = getUserIdFromSession();
        setIdUsuarioActual(userId);
        if (!userId && !isLoading) {
            setError("Usuario no autenticado. No se pueden realizar acciones.");
        }
    }, [isLoading]);

    const cargarTabla = useCallback(async () => {
        if (isNaN(idTablaComparativa)) {
            setError("ID de tabla inválido."); setIsLoading(false); return;
        }
        setIsLoading(true); setError(null);
        try {
            const data = await fetchTablaComparativaDetalle(idTablaComparativa);
            setTablaData(data);
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            console.error("Error al cargar detalle tabla:", err);
            if (err instanceof Error) {
                setError(err.message || 'Ocurrió un error al cargar los datos.');
            } else {
                setError('Ocurrió un error desconocido al cargar los datos.');
            }
            setTablaData(null);
        } finally {
            setIsLoading(false);
        }
    }, [idTablaComparativa]);

    useEffect(() => {
        cargarTabla();
    }, [cargarTabla]);

    const handleGuardarHeader = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!tablaData || isSubmitting) return;
        setIsSubmitting(true); setError(null);
        const formData = new FormData(event.currentTarget);
        const dataToUpdate: ActualizarTablaInput = {
            nombre: formData.get('nombre') as string,
            descripcion: formData.get('descripcion') as string || null,
            estado: formData.get('estado') as EstadoTablaComparativa,
        };
        try {
            if (!dataToUpdate.nombre?.trim()) throw new Error("El nombre no puede estar vacío.");
            await actualizarTablaComparativaFetch(idTablaComparativa, dataToUpdate);
            setTablaData(prev => prev ? { ...prev, ...dataToUpdate } : null);
            setIsEditingHeader(false);
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            console.error("Error actualizando cabecera:", err);
            if (err instanceof Error) {
                setError(err.message || "No se pudo actualizar la información.");
            } else {
                setError("No se pudo actualizar la información debido a un error desconocido.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddProveedor = async (proveedorSeleccionado: Proveedor) => {
        if (!tablaData || isSubmitting) return;
        setIsSubmitting(true); setError(null);
        try {
            console.log(`Obteniendo detalles completos para proveedor ID: ${proveedorSeleccionado.id_proveedor}`);
            const proveedorCompleto = await fetchProveedorDetalladoParaSnapshot(proveedorSeleccionado.id_proveedor);
            console.log("Detalles completos obtenidos:", proveedorCompleto);
            if (!proveedorCompleto?.rfc) throw new Error("Datos detallados del proveedor no encontrados o incompletos.");

            const proveedorSnapshotData: AgregarProveedorInput = {
                id_tabla_comparativa: tablaData.id,
                id_proveedor: proveedorCompleto.id_proveedor,
                nombre_empresa_snapshot:
                    proveedorCompleto.razon_social ??
                    (proveedorCompleto.nombre_fisica ? `${proveedorCompleto.nombre_fisica} ${proveedorCompleto.apellido_p_fisica ?? ''} ${proveedorCompleto.apellido_m_fisica ?? ''}`.trim() :
                        'Nombre Desconocido'),
                rfc_snapshot: proveedorCompleto.rfc,
                giro_comercial_snapshot: proveedorCompleto.giro_comercial || null,
                // atencion_de_snapshot: null, // ELIMINADO (no en AgregarProveedorInput)
                domicilio_snapshot: construirDomicilio(proveedorCompleto),
                telefono_snapshot: proveedorCompleto.telefono_uno || null,
                correo_electronico_snapshot: proveedorCompleto.correo || null,
                pagina_web_snapshot: proveedorCompleto.pagina_web || null,
                // condiciones_pago_snapshot: null, // ELIMINADO (no en AgregarProveedorInput)
                // tiempo_entrega_snapshot: null, // ELIMINADO (no en AgregarProveedorInput)
            };

            console.log("Enviando datos para agregar proveedor:", proveedorSnapshotData);
            await agregarProveedorATablaFetch(tablaData.id, proveedorSnapshotData);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            console.error("Error agregando proveedor:", err);
            if (err instanceof Error) {
                setError(err.message || "No se pudo agregar el proveedor.");
            } else {
                setError("No se pudo agregar el proveedor debido a un error desconocido.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveProveedor = async (idTablaComparativaProveedor: number) => {
        if (!tablaData || isSubmitting || !confirm('¿Eliminar este proveedor y todos sus ítems/observaciones de la tabla?')) return;
        setIsSubmitting(true); setError(null);
        try {
            await eliminarProveedorDeTablaFetch(tablaData.id, idTablaComparativaProveedor);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            console.error("Error eliminando proveedor:", err);
            if (err instanceof Error) {
                setError(err.message || "No se pudo eliminar el proveedor.");
            } else {
                setError("No se pudo eliminar el proveedor debido a un error desconocido.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddItem = async (idTablaComparativaProveedor: number, itemOrigen: ArticuloCatalogo) => {
        if (!tablaData || isSubmitting) return;
        const cantidadStr = prompt(`Cantidad para "${itemOrigen.descripcion}":`, '1');
        if (cantidadStr === null) return;
        const cantidad = parseFloat(cantidadStr);
        if (isNaN(cantidad) || cantidad <= 0) { alert("Cantidad inválida."); return; }

        setIsSubmitting(true); setError(null);
        try {
            const data: AgregarItemInput = {
                id_tabla_comparativa_proveedor: idTablaComparativaProveedor,
                id_articulo_origen: itemOrigen.id_articulo,
                codigo_partida_origen: itemOrigen.codigo_partida,
                descripcion_item: itemOrigen.descripcion,
                caracteristicas_tecnicas: null,
                udm: itemOrigen.unidad_medida,
                cantidad: cantidad,
                precio_unitario: itemOrigen.precio_unitario,
            };
            await agregarItemAProveedorFetch(tablaData.id, idTablaComparativaProveedor, data);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            console.error("Error agregando item:", err);
            if (err instanceof Error) {
                setError(err.message || "No se pudo agregar el ítem.");
            } else {
                setError("No se pudo agregar el ítem debido a un error desconocido.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveItem = async (idItem: number) => {
        if (!tablaData || isSubmitting || !confirm('¿Eliminar este ítem?')) return;
        setIsSubmitting(true); setError(null);
        try {
            await eliminarItemFetch(tablaData.id, idItem);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            console.error("Error eliminando item:", err);
            if (err instanceof Error) {
                setError(err.message || "No se pudo eliminar el ítem.");
            } else {
                setError("No se pudo eliminar el ítem debido a un error desconocido.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddObservacionCallback = async (data: AgregarObservacionInput) => {
        if (!tablaData || isSubmitting) throw new Error("Operación no permitida ahora.");
        setIsSubmitting(true); setError(null);
        try {
            await agregarObservacionFetch(tablaData.id, data);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            if (err instanceof Error) {
                setError(err.message || "No se pudo agregar la observación.");
                throw err; // Re-throw para que el componente hijo pueda manejarlo si es necesario
            } else {
                setError("No se pudo agregar la observación debido a un error desconocido.");
                throw new Error("Error desconocido al agregar observación");
            }
        } finally { setIsSubmitting(false); }
    };

    const handleDeleteObservacionCallback = async (idObservacion: number) => {
        if (!tablaData || isSubmitting) throw new Error("Operación no permitida ahora.");
        setIsSubmitting(true); setError(null);
        try {
            await eliminarObservacionFetch(tablaData.id, idObservacion);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            if (err instanceof Error) {
                setError(err.message || "No se pudo eliminar la observación.");
                throw err;
            } else {
                setError("No se pudo eliminar la observación debido a un error desconocido.");
                throw new Error("Error desconocido al eliminar observación");
            }
        } finally { setIsSubmitting(false); }
    };

    const handleAddFirmaCallback = async (data: AgregarFirmaInput) => {
        if (!tablaData || isSubmitting || !idUsuarioActual) throw new Error("Usuario no autenticado o acción no permitida.");
        setIsSubmitting(true); setError(null);
        data.id_usuario = idUsuarioActual;
        try {
            await agregarFirmaFetch(tablaData.id, data);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            if (err instanceof Error) {
                setError(err.message || "No se pudo agregar la firma.");
                throw err;
            } else {
                setError("No se pudo agregar la firma debido a un error desconocido.");
                throw new Error("Error desconocido al agregar firma");
            }
        } finally { setIsSubmitting(false); }
    };

    const handleAddComentarioCallback = async (data: AgregarComentarioInput) => {
        if (!tablaData || isSubmitting || !idUsuarioActual) throw new Error("Usuario no autenticado o acción no permitida.");
        setIsSubmitting(true); setError(null);
        data.id_usuario = idUsuarioActual;
        try {
            await agregarComentarioFetch(tablaData.id, data);
            await cargarTabla();
        } catch (err: unknown) { // CORREGIDO: any -> unknown
            if (err instanceof Error) {
                setError(err.message || "No se pudo agregar el comentario.");
                throw err;
            } else {
                setError("No se pudo agregar el comentario debido a un error desconocido.");
                throw new Error("Error desconocido al agregar comentario");
            }
        } finally { setIsSubmitting(false); }
    };

    if (isLoading) return <p className="container mx-auto p-4">Cargando datos de la tabla...</p>;
    if (error && !tablaData) return <p className="container mx-auto p-4 text-red-500 bg-red-100 border border-red-400 rounded p-3">Error: {error}</p>;
    if (!tablaData) return <p className="container mx-auto p-4">No se encontró la tabla comparativa.</p>;
    if (!idUsuarioActual) return <p className="container mx-auto p-4 text-red-500 bg-red-100 border border-red-400 rounded p-3">Error: Usuario no identificado. No se pueden realizar acciones.</p>;

    const proveedorIdsActuales = tablaData.proveedores.map(p => p.id_proveedor);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <Link href="/tablas_comparativas" className="text-blue-600 hover:underline">
                    ← Volver a la lista
                </Link>
                <button
                    onClick={() => setIsEditingHeader(!isEditingHeader)}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isEditingHeader ? 'Cancelar Edición' : 'Editar Info General'}
                </button>
            </div>

            {isSubmitting && <div className="text-center p-2"><span className="italic text-blue-600">Procesando...</span></div>}
            {error && !isSubmitting && <p className="text-red-500 bg-red-100 p-2 rounded text-sm mb-4">Error: {error}</p>}

            {isEditingHeader ? (
                <form onSubmit={handleGuardarHeader} className="p-4 border rounded bg-gray-100 space-y-3">
                    <h2 className="text-lg font-semibold">Editando Información General</h2>
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium">Nombre</label>
                        <input type="text" name="nombre" id="nombre" defaultValue={tablaData.nombre} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" disabled={isSubmitting} />
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium">Descripción</label>
                        <textarea name="descripcion" id="descripcion" defaultValue={tablaData.descripcion || ''} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" disabled={isSubmitting}></textarea>
                    </div>
                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium">Estado</label>
                        <select name="estado" id="estado" defaultValue={tablaData.estado} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md text-sm" disabled={isSubmitting}>
                            <option value="borrador">Borrador</option>
                            <option value="en_revision">En Revisión</option>
                            <option value="aprobada">Aprobada</option>
                            <option value="rechazada">Rechazada</option>
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <button type="submit" className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button type="button" onClick={() => setIsEditingHeader(false)} className="px-4 py-1 bg-gray-300 text-sm rounded hover:bg-gray-400" disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <div className="border-b pb-2 mb-4">
                    <h1 className="text-2xl font-bold">{tablaData.nombre}</h1>
                    <p className="text-sm text-gray-600">{tablaData.descripcion || 'Sin descripción.'}</p>
                    <p className="text-sm">Estado: <span className="font-semibold">{tablaData.estado}</span></p>
                </div>
            )}

            <div className="my-6 p-4 border rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Añadir Proveedor a la Comparación</h3>
                <SelectorProveedores
                    onSelectProveedor={handleAddProveedor}
                    excludedIds={proveedorIdsActuales}
                />
            </div>

            <TablaComparativaDisplay tabla={tablaData} />

            <div className="space-y-4 mt-6">
                {tablaData.proveedores.map(prov => (
                    <div key={prov.id} className="p-4 border rounded shadow-sm bg-white">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">{prov.nombre_empresa_snapshot}</h3>
                            <button
                                onClick={() => handleRemoveProveedor(prov.id)}
                                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                                disabled={isSubmitting}
                                title="Eliminar este proveedor de la tabla"
                            >
                                Eliminar Proveedor
                            </button>
                        </div>

                        <div className='mb-4'>
                            <SelectorProductosServicios
                                idProveedor={prov.id_proveedor}
                                onSelectItem={(item) => handleAddItem(prov.id, item)}
                                excludedItemIds={prov.items.map(i => i.id_articulo_origen).filter(id => id !== null) as number[]}
                            />
                        </div>

                        <div className="mt-4 mb-4">
                            <h4 className="text-md font-medium mb-2 text-gray-700">Ítems Cotizados</h4>
                            {prov.items.length === 0 ? <p className="text-sm text-gray-500 italic">Sin ítems.</p> : (
                                <ul className="text-sm space-y-1">
                                    {prov.items.map(item => (
                                        <li key={item.id} className="flex justify-between items-center border-b py-1 hover:bg-gray-50 px-1">
                                            <div>
                                                <span className='font-medium'>{item.descripcion_item}</span>
                                                <span className='text-gray-600'> ({item.cantidad} {item.udm} @ {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(item.precio_unitario)})</span>
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 ml-2 disabled:opacity-50"
                                                    disabled={isSubmitting}
                                                    title="Eliminar este ítem"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <SeccionObservaciones
                            observaciones={prov.observaciones}
                            idTablaComparativaProveedor={prov.id}
                            isEditable={!!idUsuarioActual}
                            onAddObservacion={handleAddObservacionCallback}
                            onDeleteObservacion={handleDeleteObservacionCallback}
                        />
                    </div>
                ))}
            </div>

            <SeccionFirmasComentarios
                firmas={tablaData.firmas}
                comentarios={tablaData.comentarios}
                idTablaComparativa={tablaData.id}
                idUsuarioActual={idUsuarioActual!}
                isEditable={!!idUsuarioActual}
                onAddFirma={handleAddFirmaCallback}
                onAddComentario={handleAddComentarioCallback}
            />
        </div>
    );
}