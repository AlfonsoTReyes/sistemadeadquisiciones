// src/app/admin/tablas-comparativas/[idTablaComparativa]/page.tsx
'use client'; // Necesario para fetch de datos, estado y edición

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TablaComparativaCompleta, ActualizarTablaInput } from '@/types/tablaComparativa'; // Ajusta ruta
import { ProveedorDetallado } from '@/types/proveedor'; // Ajusta ruta
import { ArticuloCatalogo } from '@/types/catalogoProveedores'; // Ajusta ruta

// Componentes
import { TablaComparativaDisplay } from '@/componentes/tablas_comparativas/TablaComparativaDisplay';
import { SelectorProveedores } from '@/componentes/tablas_comparativas/SelectorProveedores';
import { SelectorProductosServicios } from '@/componentes/tablas_comparativas/SelectorProductosServicios';
import { SeccionObservaciones } from '@/componentes/tablas_comparativas/SeccionObservaciones';
import { SeccionFirmasComentarios } from '@/componentes/tablas_comparativas/SeccionFirmasComentarios';
// Asume que tienes un componente de formulario para editar detalles de items si es necesario
// import { FormularioItemComparativa } from '@/components/tablas_comparativas/FormularioItemComparativa';

// Fetchers
import {
    fetchTablaComparativaDetalle,
    actualizarTablaComparativaFetch,
    // NECESITARÁS MÁS FETCHERS Y API ROUTES PARA OPERACIONES ANIDADAS:
    // agregarProveedorATablaFetch, eliminarProveedorDeTablaFetch,
    // agregarItemAProveedorFetch, actualizarItemFetch, eliminarItemFetch,
    // agregarObservacionFetch, actualizarObservacionFetch, eliminarObservacionFetch,
    // agregarFirmaFetch, agregarComentarioFetch, etc.
} from '@/fetch/tablasComparativasFetch'; // Ajusta ruta

// Placeholder para funciones fetch que faltan
const agregarProveedorATablaFetch = async (data: any) => { console.warn("agregarProveedorATablaFetch no implementado", data); await new Promise(r => setTimeout(r, 500)); return { id: Math.random() * 1000, ...data }; };
const eliminarProveedorDeTablaFetch = async (id: number) => { console.warn("eliminarProveedorDeTablaFetch no implementado", id); await new Promise(r => setTimeout(r, 500)); };
const agregarItemAProveedorFetch = async (data: any) => { console.warn("agregarItemAProveedorFetch no implementado", data); await new Promise(r => setTimeout(r, 500)); return { id: Math.random() * 1000, ...data, subtotal_item: data.cantidad * data.precio_unitario }; };
const eliminarItemFetch = async (id: number) => { console.warn("eliminarItemFetch no implementado", id); await new Promise(r => setTimeout(r, 500)); };
const agregarObservacionFetch = async (data: any) => { console.warn("agregarObservacionFetch no implementado", data); await new Promise(r => setTimeout(r, 500)); return { id: Math.random() * 1000, ...data }; };
const eliminarObservacionFetch = async (id: number) => { console.warn("eliminarObservacionFetch no implementado", id); await new Promise(r => setTimeout(r, 500)); };
const agregarFirmaFetch = async (data: any) => { console.warn("agregarFirmaFetch no implementado", data); await new Promise(r => setTimeout(r, 500)); return { id: Math.random() * 1000, ...data, fecha_firma: new Date().toISOString() }; };
const agregarComentarioFetch = async (data: any) => { console.warn("agregarComentarioFetch no implementado", data); await new Promise(r => setTimeout(r, 500)); return { id: Math.random() * 1000, ...data, fecha_comentario: new Date().toISOString() }; };
// Y así sucesivamente para updates...


export default function DetalleTablaComparativaPage() {
    const params = useParams();
    const router = useRouter();
    const idTablaComparativa = parseInt(params.idTablaComparativa as string, 10);

    const [tablaData, setTablaData] = useState<TablaComparativaCompleta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingHeader, setIsEditingHeader] = useState(false); // Para editar nombre/desc/estado
    const [isSubmitting, setIsSubmitting] = useState(false); // Para indicar carga en operaciones

    // // TODO: Obtener el ID del usuario actual de la sesión/contexto
    const idUsuarioActual = 8; // Placeholder

    const cargarTabla = useCallback(async () => {
        if (isNaN(idTablaComparativa)) {
            setError("ID de tabla inválido.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchTablaComparativaDetalle(idTablaComparativa);
            setTablaData(data);
        } catch (err: any) {
            console.error("Error al cargar detalle tabla:", err);
            if (err.message.includes('404') || err.message.includes('no encontrada')) {
                 setError(`Tabla comparativa con ID ${idTablaComparativa} no encontrada.`);
            } else {
                 setError(err.message || 'Ocurrió un error al cargar los datos.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [idTablaComparativa]);

    useEffect(() => {
        cargarTabla();
    }, [cargarTabla]);

    // --- Handlers para Actualización de Cabecera ---
    const handleGuardarHeader = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!tablaData) return;
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const dataToUpdate: ActualizarTablaInput = {
            nombre: formData.get('nombre') as string,
            descripcion: formData.get('descripcion') as string || null,
            estado: formData.get('estado') as any, // Cast a any temporalmente
        };

        try {
             // Validación básica
            if (!dataToUpdate.nombre?.trim()) throw new Error("El nombre no puede estar vacío.");

            await actualizarTablaComparativaFetch(idTablaComparativa, dataToUpdate);
            // Actualizar estado local optimísticamente o recargar
            setTablaData(prev => prev ? { ...prev, ...dataToUpdate } : null);
            setIsEditingHeader(false);
            // Mostrar mensaje éxito
        } catch (err: any) {
            console.error("Error actualizando cabecera:", err);
            setError(err.message || "No se pudo actualizar la información.");
             // Mostrar mensaje error
        } finally {
             setIsSubmitting(false);
        }
    };

     // --- Handlers para Operaciones Anidadas (Proveedores, Ítems, etc.) ---
     // ESTAS FUNCIONES NECESITAN SUS PROPIOS API ROUTES Y FETCHERS!

    const handleAddProveedor = async (proveedor: Proveedor) => {
        if (!tablaData) return;
        setIsSubmitting(true); // O un estado de carga específico
        try {
            // Necesitas obtener TODOS los datos snapshot del proveedor ANTES de llamar al fetch
            const proveedorSnapshotData = {
                 id_tabla_comparativa: tablaData.id,
                 id_proveedor: proveedor.id_proveedor,
                 nombre_empresa_snapshot: proveedor.nombre_o_razon_social,
                 rfc_snapshot: proveedor.rfc,
                 // ... completar TODOS los campos _snapshot requeridos por la API/servicio
                 giro_comercial_snapshot: proveedor.giro_comercial,
                 atencion_de_snapshot: proveedor.atencion_de, // Asumiendo que existe en 'Proveedor'
                 domicilio_snapshot: proveedor.domicilio,     // Asumiendo que existe en 'Proveedor'
                 telefono_snapshot: proveedor.telefono_uno,
                 correo_electronico_snapshot: proveedor.correo,
                 pagina_web_snapshot: proveedor.pagina_web,
                 condiciones_pago_snapshot: proveedor.condiciones_pago, // Asumiendo que existe
                 tiempo_entrega_snapshot: proveedor.tiempo_entrega,   // Asumiendo que existe
            };
             // const nuevoRegistroProveedor = await agregarProveedorATablaFetch(proveedorSnapshotData);
             // Recargar la tabla completa para ver el nuevo proveedor
             await cargarTabla();
        } catch (err: any) {
             console.error("Error agregando proveedor:", err);
             setError(err.message || "No se pudo agregar el proveedor.");
        } finally {
             setIsSubmitting(false);
        }
     };

     const handleRemoveProveedor = async (idTablaComparativaProveedor: number) => {
         if (!confirm('¿Eliminar este proveedor y todos sus ítems/observaciones de la tabla?')) return;
         setIsSubmitting(true);
         try {
            // await eliminarProveedorDeTablaFetch(idTablaComparativaProveedor);
            await cargarTabla(); // Recargar
         } catch (err: any) {
             console.error("Error eliminando proveedor:", err);
             setError(err.message || "No se pudo eliminar el proveedor.");
         } finally {
             setIsSubmitting(false);
         }
     };

     const handleAddItem = async (idTablaComparativaProveedor: number, itemOrigen: ArticuloCatalogo) => {
         // // TODO: Podrías abrir un modal/form para pedir Cantidad y ajustar Precio/Características
         const cantidad = parseFloat(prompt(`Cantidad para "${itemOrigen.descripcion}":`, '1') || '1');
         if (isNaN(cantidad) || cantidad <= 0) return;

         setIsSubmitting(true);
         try {
             const data: any = { // Tipar correctamente con AgregarItemInput
                 id_tabla_comparativa_proveedor: idTablaComparativaProveedor,
                 id_articulo_origen: itemOrigen.id_articulo,
                 codigo_partida_origen: itemOrigen.codigo_partida,
                 descripcion_item: itemOrigen.descripcion,
                 caracteristicas_tecnicas: null, // O pedir al usuario
                 udm: itemOrigen.unidad_medida,
                 cantidad: cantidad,
                 precio_unitario: itemOrigen.precio_unitario, // O permitir ajuste
             };
             // await agregarItemAProveedorFetch(data);
             await cargarTabla(); // Recargar
         } catch (err: any) {
             console.error("Error agregando item:", err);
             setError(err.message || "No se pudo agregar el ítem.");
         } finally {
             setIsSubmitting(false);
         }
     };

      const handleRemoveItem = async (idItem: number) => {
         if (!confirm('¿Eliminar este ítem?')) return;
         setIsSubmitting(true);
         try {
            // await eliminarItemFetch(idItem);
            await cargarTabla(); // Recargar
         } catch (err: any) {
             console.error("Error eliminando item:", err);
             setError(err.message || "No se pudo eliminar el ítem.");
         } finally {
             setIsSubmitting(false);
         }
     };

     // ... Implementar handlers para Observaciones, Firmas, Comentarios usando los fetchers correspondientes ...
     const handleAddObservacionCallback = async (data: any) => { // Tipar con AgregarObservacionInput
        setIsSubmitting(true);
         try {
             // await agregarObservacionFetch(data);
             await cargarTabla();
         } finally {
             setIsSubmitting(false);
         }
     };
     const handleDeleteObservacionCallback = async (id: number) => {
         setIsSubmitting(true);
         try {
             // await eliminarObservacionFetch(id);
             await cargarTabla();
         } finally {
             setIsSubmitting(false);
         }
     };
     // ... y así para firmas y comentarios ...


    // --- Renderizado ---
    if (isLoading) return <p className="container mx-auto p-4">Cargando datos de la tabla...</p>;
    if (error) return <p className="container mx-auto p-4 text-red-500">Error: {error}</p>;
    if (!tablaData) return <p className="container mx-auto p-4">No se encontró la tabla comparativa.</p>;

    const proveedorIdsActuales = tablaData.proveedores.map(p => p.id_proveedor);

    return (
        <div className="container mx-auto p-4 space-y-6">
             {/* // TODO: Aplicar estilos */}
             <div className="flex justify-between items-center">
                 <Link href="/tablas_comparativas" className="text-blue-600 hover:underline">
                    ← Volver a la lista
                </Link>
                <button
                    onClick={() => setIsEditingHeader(!isEditingHeader)}
                    className="px-3 py-1 border rounded text-sm"
                 >
                    {isEditingHeader ? 'Cancelar Edición' : 'Editar Info General'}
                </button>
            </div>

            {isSubmitting && <p className="text-blue-500">Procesando...</p>} {/* Indicador global simple */}

             {/* Formulario de Edición de Cabecera (condicional) */}
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
                // Mostrar datos (solo si no se está editando header)
                 <div className="border-b pb-2 mb-4">
                    <h1 className="text-2xl font-bold">{tablaData.nombre}</h1>
                    <p className="text-sm text-gray-600">{tablaData.descripcion || 'Sin descripción.'}</p>
                    <p className="text-sm">Estado: <span className="font-semibold">{tablaData.estado}</span></p>
                 </div>
            )}


            {/* Selector para añadir nuevos proveedores */}
            <div className="my-6 p-4 border rounded bg-gray-50">
                 <h3 className="text-lg font-semibold mb-2">Añadir Proveedor a la Comparación</h3>
                 <SelectorProveedores
                     onSelectProveedor={handleAddProveedor}
                     excludedIds={proveedorIdsActuales}
                 />
            </div>

             {/* Display principal de la tabla comparativa */}
             {/* // TODO: Pasar callbacks para editar/eliminar items si se implementa en TablaComparativaDisplay */}
            <TablaComparativaDisplay tabla={tablaData} />

            {/* Secciones editables por proveedor (Items, Observaciones) */}
            <div className="space-y-4 mt-6">
                 {tablaData.proveedores.map(prov => (
                    <div key={prov.id} className="p-4 border rounded shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">{prov.nombre_empresa_snapshot}</h3>
                             <button
                                onClick={() => handleRemoveProveedor(prov.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                                disabled={isSubmitting}
                            >
                                Eliminar Proveedor de Tabla
                            </button>
                        </div>

                        {/* Selector de Items para este proveedor */}
                        <SelectorProductosServicios
                            idProveedor={prov.id_proveedor} // ID del proveedor maestro
                            onSelectItem={(item) => handleAddItem(prov.id, item)} // prov.id es id_tabla_comparativa_proveedor
                            excludedItemIds={prov.items.map(i => i.id_articulo_origen).filter(id => id !== null) as number[]}
                        />

                         {/* Lista de Items actuales (con opción de eliminar) */}
                        <div className="mt-4">
                             <h4 className="text-md font-medium mb-2">Ítems Cotizados</h4>
                             {prov.items.length === 0 ? <p className="text-sm text-gray-500">Sin ítems.</p> : (
                                 <ul className="text-sm space-y-1">
                                     {prov.items.map(item => (
                                        <li key={item.id} className="flex justify-between items-center border-b py-1">
                                             <span>{item.descripcion_item} ({item.cantidad} {item.udm} @ ${item.precio_unitario.toFixed(2)})</span>
                                             {/* // TODO: Botón para Editar Item */}
                                             <button onClick={() => handleRemoveItem(item.id)} className="text-xs text-red-500 ml-2" disabled={isSubmitting}>Eliminar</button>
                                         </li>
                                    ))}
                                 </ul>
                             )}
                        </div>

                        {/* Sección de Observaciones para este proveedor */}
                         <SeccionObservaciones
                            observaciones={prov.observaciones}
                            idTablaComparativaProveedor={prov.id}
                            isEditable={true} // Asumir editable
                            onAddObservacion={handleAddObservacionCallback}
                            onDeleteObservacion={handleDeleteObservacionCallback}
                            // onUpdateObservacion={handleUpdateObservacionCallback} // TODO
                        />
                    </div>
                ))}
            </div>

             {/* Sección de Firmas y Comentarios (globales para la tabla) */}
             <SeccionFirmasComentarios
                 firmas={tablaData.firmas}
                 comentarios={tablaData.comentarios}
                 idTablaComparativa={tablaData.id}
                 idUsuarioActual={idUsuarioActual} // Pasar ID real
                 isEditable={true} // Asumir editable
                 // onAddFirma={handleAddFirmaCallback} // TODO
                 // onAddComentario={handleAddComentarioCallback} // TODO
             />

        </div>
    );
}