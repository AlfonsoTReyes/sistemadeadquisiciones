// src/app/admin/tablas-comparativas/nueva/page.tsx
'use client'; // Necesario para sessionStorage y hooks

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

    const handleSubmit = async (formData: CrearTablaComparativaInput) => {
        setIsLoading(true);
        setError(null);

        let userId: number | null = null;
        let validationError: string | null = null;

        // 1. Leer el ID del usuario desde sessionStorage DENTRO del handler
        if (typeof window !== "undefined") {
            const storedUserId = sessionStorage.getItem('userId'); // Usa la clave correcta que guardaste al iniciar sesión
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

        // 2. Si hubo error al leer/validar el ID, detener el proceso
        if (validationError) {
            setError(validationError);
            setIsLoading(false);
            console.error("Error de validación de ID de usuario:", validationError);
            return;
        }

        // 3. Asignar el ID de usuario leído y validado
        //    (Aseguramos que userId no es null por la validación anterior)
        const dataToSend: CrearTablaComparativaInput = {
            ...formData,
            id_usuario_creador: userId!, // Usamos '!' porque ya validamos que no es null
        };

        console.log("Datos a enviar para crear:", dataToSend);

        // 4. Intentar crear la tabla
        try {
            const nuevaTabla = await crearTablaComparativaFetch(dataToSend);
            console.log("Tabla creada:", nuevaTabla);
            // Redirigir a la página de detalle de la tabla recién creada
            router.push(`/tablas_comparativas/${nuevaTabla.id}`);

        } catch (err: any) {
            console.error("Error al crear tabla:", err);
            // Verificar si el error es por la FK (aunque ya validamos el ID, podría no existir en la DB por alguna razón)
            if (err.message && err.message.includes('violates foreign key constraint')) {
                setError("Error de base de datos: El usuario especificado no existe o no se pudo crear la relación. Verifique la consola del servidor.");
            } else {
                setError(err.message || 'Ocurrió un error al crear la tabla.');
            }
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