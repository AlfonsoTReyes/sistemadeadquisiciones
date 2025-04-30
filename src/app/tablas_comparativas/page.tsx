// src/app/admin/tablas-comparativas/page.tsx
'use client'; // Necesario para useState, useEffect y manejo de eventos como eliminar

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Para redirigir
import { TablaComparativa } from '@/types/tablaComparativa'; // Ajusta la ruta
import { fetchTablasComparativasLista, eliminarTablaComparativaFetch } from '@/fetch/tablasComparativasFetch'; // Ajusta la ruta

export default function ListaTablasComparativasPage() {
    const [tablas, setTablas] = useState<TablaComparativa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const cargarTablas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchTablasComparativasLista();
            setTablas(data);
        } catch (err: any) {
            console.error("Error al cargar tablas:", err);
            setError(err.message || 'Ocurrió un error al cargar las tablas comparativas.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarTablas();
    }, []);

    const handleEliminar = async (id: number) => {
        if (!confirm(`¿Estás seguro de eliminar la tabla comparativa ID ${id}? Esta acción no se puede deshacer.`)) {
            return;
        }
        try {
            await eliminarTablaComparativaFetch(id);
            // Volver a cargar la lista o filtrar localmente
            setTablas(prevTablas => prevTablas.filter(t => t.id !== id));
            // Podrías mostrar un mensaje de éxito aquí
        } catch (err: any) {
            console.error(`Error al eliminar tabla ${id}:`, err);
            setError(err.message || 'No se pudo eliminar la tabla comparativa.');
            // Mostrar mensaje de error al usuario
            alert(`Error al eliminar: ${err.message || 'Error desconocido'}`);
        }
    };

    const handleNavigateToNueva = () => {
        router.push('/tablas_comparativas/nueva');
    };

    return (
        <div className="container mx-auto p-4">
            {/* // TODO: Aplicar estilos globales o layout */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Tablas Comparativas</h1>
                <button
                    onClick={handleNavigateToNueva}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Crear Nueva Tabla
                </button>
            </div>

            {isLoading && <p>Cargando...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!isLoading && !error && (
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tablas.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        No hay tablas comparativas creadas.
                                    </td>
                                </tr>
                            ) : (
                                tablas.map((tabla) => (
                                    <tr key={tabla.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tabla.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tabla.nombre}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tabla.estado}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(tabla.fecha_creacion).toLocaleDateString('es-MX')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Link href={`/tablas_comparativas/${tabla.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                Ver/Editar
                                            </Link>
                                            <button
                                                onClick={() => handleEliminar(tabla.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}