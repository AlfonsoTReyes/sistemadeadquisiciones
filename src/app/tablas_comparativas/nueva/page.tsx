// src/app/admin/tablas-comparativas/nueva/page.tsx
'use client'; // Necesario para sessionStorage y hooks

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormularioTablaComparativa } from '@/componentes/tablas_comparativas/FormularioTablaComparativa'; // Ajusta la ruta
import { CrearTablaComparativaInput, TablaComparativa } from '@/types/tablaComparativa'; // Ajusta la ruta
import { crearTablaComparativaFetch } from '@/fetch/tablasComparativasFetch'; // Ajusta la ruta
import Link from 'next/link';

export default function NuevaTablaComparativaPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (
        data: CrearTablaComparativaInput | Partial<Pick<TablaComparativa, 'nombre' | 'descripcion' | 'estado'>>
    ) => {
        if (!('nombre' in data)) return; // validación mínima de tipo

        // Aquí asumimos que `id_usuario_creador` no viene y lo añadimos
        let userId: number | null = null;
        let validationError: string | null = null;

        if (typeof window !== "undefined") {
            const storedUserId = sessionStorage.getItem('userId');
            if (storedUserId) {
                const parsedId = parseInt(storedUserId, 10);
                if (!isNaN(parsedId)) {
                    userId = parsedId;
                } else {
                    validationError = "El ID de usuario almacenado en la sesión no es un número válido.";
                }
            } else {
                validationError = "No se encontró el ID de usuario en la sesión. Por favor, inicie sesión de nuevo.";
            }
        } else {
            validationError = "Entorno no válido para acceder a sessionStorage.";
        }

        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            console.error("Error de validación de ID de usuario:", validationError);
            return;
        }

        const formData: CrearTablaComparativaInput = {
            nombre: data.nombre!,
            descripcion: data.descripcion || null,
            id_usuario_creador: userId!,
        };

        try {
            const nuevaTabla = await crearTablaComparativaFetch(formData);
            router.push(`/tablas_comparativas/${nuevaTabla.id}`);
        } catch (err: any) {
            console.error("Error al crear tabla:", err);
            setError(err.message || 'Ocurrió un error al crear la tabla.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            {/* // TODO: Aplicar estilos globales o layout */}
            <div className="mb-4">
                <Link href="/tablas_comparativas" className="text-blue-600 hover:underline">
                    ← Volver a la lista
                </Link>
            </div>
            <h1 className="text-2xl font-bold mb-4">Crear Nueva Tabla Comparativa</h1>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">Error: {error}</p>}

            {/* El formulario ahora pasará los datos básicos (nombre, desc) */}
            {/* El id_usuario_creador se añadirá en el handleSubmit */}
            <FormularioTablaComparativa
                onSubmit={handleSubmit} // Pasamos nuestro handler adaptado
                isLoading={isLoading}
            />
        </div>
    );
}