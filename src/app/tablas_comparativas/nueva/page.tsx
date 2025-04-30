// src/app/admin/tablas-comparativas/nueva/page.tsx
'use client'; // Necesario para el formulario y el manejo de estado/navegación

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormularioTablaComparativa } from '@/componentes/tablas_comparativas/FormularioTablaComparativa'; // Ajusta la ruta
import { CrearTablaComparativaInput } from '@/types/tablaComparativa'; // Ajusta la ruta
import { crearTablaComparativaFetch } from '@/fetch/tablasComparativasFetch'; // Ajusta la ruta
import Link from 'next/link';

export default function NuevaTablaComparativaPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (data: CrearTablaComparativaInput) => {
        setIsLoading(true);
        setError(null);
        console.log("Datos a enviar para crear:", data);

        try {
            // // TODO: Obtener el id_usuario_creador real de la sesión/contexto
             data.id_usuario_creador = 7; // Placeholder - ¡Reemplazar!

            const nuevaTabla = await crearTablaComparativaFetch(data);
            console.log("Tabla creada:", nuevaTabla);
            // Redirigir a la página de detalle de la tabla recién creada
            router.push(`/tablas_comparativas/${nuevaTabla.id}`);
            // O redirigir a la lista: router.push('/admin/tablas-comparativas');
            // Podrías mostrar un mensaje de éxito antes de redirigir

        } catch (err: any) {
            console.error("Error al crear tabla:", err);
            setError(err.message || 'Ocurrió un error al crear la tabla.');
            // Mostrar mensaje de error al usuario
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

            {/*
               NOTA: El FormularioTablaComparativa básico solo crea la cabecera.
               Necesitarás lógica adicional aquí o dentro del formulario para
               manejar la adición inicial de proveedores e ítems si quieres
               hacerlo en el mismo paso de creación.
               Actualmente, se crea la tabla vacía y luego se edita.
            */}
            <FormularioTablaComparativa
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}