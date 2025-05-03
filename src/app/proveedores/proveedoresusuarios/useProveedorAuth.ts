// --- START OF FILE src/hooks/useProveedorAuth.ts ---
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Asegúrate que la ruta sea correcta desde la ubicación de este hook
import { loginProveedor, signupProveedor } from '../proveedoresusuarios/formularios/fetchProveedorAuth'; // Adjust path

const useProveedorAuth = () => {
    const router = useRouter();

    // Login State
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Signup State
    const [signupUsername, setSignupUsername] = useState("");
    const [signupNombre, setSignupNombre] = useState("");
    const [signupApellidoPaterno, setSignupApellidoPaterno] = useState("");
    const [signupApellidoMaterno, setSignupApellidoMaterno] = useState("");
    const [signupCorreo, setSignupCorreo] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

    // General State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Login Handler (Ajustado con logging y userEmail)
    const handleProveedorLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!loginUsername || !loginPassword) {
            setError("Por favor, ingresa tu usuario y contraseña.");
            return;
        }
        setLoading(true);
        console.log("useProveedorAuth: Intentando iniciar sesión..."); // Log inicio

        try {
            const data = await loginProveedor({ usuario: loginUsername, contraseña: loginPassword });

            // --- Log para inspeccionar la respuesta de la API ---
            console.log("useProveedorAuth: Respuesta de API recibida:", JSON.stringify(data, null, 2));

            // --- Verificar que la estructura esperada exista ---
            if (!data || !data.usuario || typeof data.usuario.id_usuario === 'undefined' || typeof data.usuario.correo === 'undefined') {
                console.error("useProveedorAuth: La respuesta de la API no tiene la estructura esperada (usuario, id_usuario, correo).");
                throw new Error("Respuesta inesperada del servidor al iniciar sesión.");
            }

            // --- Guardar datos en sessionStorage ---
            console.log("useProveedorAuth: Guardando datos en sessionStorage...");

            sessionStorage.setItem("proveedorToken", data.token);
            // La clave que esperan Dashboard y Menú
            sessionStorage.setItem("proveedorUserId", data.usuario.id_usuario.toString());
            // *** LA CLAVE FALTANTE ***
            sessionStorage.setItem("userEmail", data.usuario.correo); // <-- AÑADIDO: Guardar el email
            // Otras claves (opcionales si no las usan Dashboard/Menú)
            sessionStorage.setItem("proveedorUsername", data.usuario.usuario);
            sessionStorage.setItem("proveedorUserNombre", `${data.usuario.nombre} ${data.usuario.apellido_paterno}${data.usuario.apellido_materno ? ' ' + data.usuario.apellido_materno : ''}`);
            // sessionStorage.setItem("proveedorHasProfile", data.hasProfile.toString()); // Opcional

            // --- Confirmación de guardado (opcional) ---
            console.log("useProveedorAuth: Datos guardados:");
            console.log(` - proveedorUserId: ${sessionStorage.getItem("proveedorUserId")}`);
            console.log(` - userEmail: ${sessionStorage.getItem("userEmail")}`); // Verificar que se guardó

            console.log("useProveedorAuth: Proveedor login successful, user data:", data.usuario);
            console.log("useProveedorAuth: Has Profile:", data.hasProfile);

            // --- Redirección ---
            const targetUrl = data.hasProfile ? "/proveedores/dashboard" : "/proveedores/datos_generales";
            console.log(`useProveedorAuth: Redirigiendo a ${targetUrl}...`);
            router.push(targetUrl);

        } catch (err: any) {
            console.error("useProveedorAuth: Error durante el inicio de sesión:", err); // Log del error
            setError(err.message || "Ocurrió un error durante el inicio de sesión.");
        } finally {
            console.log("useProveedorAuth: Finalizando proceso de login (loading=false).");
            setLoading(false);
        }
    };

    // Signup Handler (Sin cambios necesarios aquí para el problema de login)
    const handleProveedorSignup = async (e: React.FormEvent) => {
        // ... (código existente sin cambios) ...
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!signupUsername || !signupNombre || !signupApellidoPaterno || !signupCorreo || !signupPassword || !signupConfirmPassword) {
            setError("Usuario, nombre, apellido paterno, correo y contraseñas son requeridos.");
            return;
        }
        if (signupPassword !== signupConfirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            const data = await signupProveedor({
                usuario: signupUsername,
                nombre: signupNombre,
                apellidoPaterno: signupApellidoPaterno,
                apellidoMaterno: signupApellidoMaterno, // Incluido
                correo: signupCorreo,
                contraseña: signupPassword
            });
            setSuccessMessage(data.message || "¡Registro exitoso! Ahora puedes iniciar sesión.");
            // Limpiar campos
            setSignupUsername("");
            setSignupNombre("");
            setSignupApellidoPaterno("");
            setSignupApellidoMaterno("");
            setSignupCorreo("");
            setSignupPassword("");
            setSignupConfirmPassword("");

        } catch (err: any) {
            setError(err.message || "Ocurrió un error durante el registro.");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading, error, successMessage, setError, setSuccessMessage,
        // Login
        loginUsername, setLoginUsername, loginPassword, setLoginPassword, handleProveedorLogin,
        // Signup
        signupUsername, setSignupUsername, signupNombre, setSignupNombre, signupApellidoPaterno, setSignupApellidoPaterno, signupApellidoMaterno, setSignupApellidoMaterno, signupCorreo, setSignupCorreo, signupPassword, setSignupPassword, signupConfirmPassword, setSignupConfirmPassword, handleProveedorSignup,
    };
};

export default useProveedorAuth;
// --- END OF FILE ---