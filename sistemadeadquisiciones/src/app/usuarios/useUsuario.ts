import { useState } from 'react';

interface Usuario {
    id_usuario: number;
    nombre_u: string;
    apellidos:string;
    email: string;
    nomina: string;
    password: string;
    rol: string;
    estatus: boolean;
    nombre_s: string;
    nombre_d: string;
    puesto:string;
    sistema:string;
}

const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const email = sessionStorage.getItem('userEmail') || '';

    // Función para obtener los usuarios
    const fetchUsuarios = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/usuarios');
            if (!response.ok) throw new Error('Error al obtener usuarios');
            const data = await response.json();
            setUsuarios(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar usuarios
    const eliminarUsuario = async () => {
        if (confirmDeleteId === null) return;
        try {
            const res = await fetch(`/api/usuarios?id_usuario=${confirmDeleteId}&eliminar=true&email=${email}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar usuario');
            await fetchUsuarios(); // Refresca la lista después de eliminar
        } catch (error) {
            console.error(error);
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return { usuarios, loading, error, fetchUsuarios, eliminarUsuario, confirmDeleteId, setConfirmDeleteId };
};

export default useUsuarios;
