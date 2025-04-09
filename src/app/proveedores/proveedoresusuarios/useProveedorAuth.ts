// --- START OF FILE src/hooks/useProveedorAuth.ts (Adjusted for Apellidos) ---
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

    // --- fetchPermissions REMOVED from here ---
    // It seems specific to the traditional login flow with idRol

    // Login Handler (como lo tienes)
    const handleProveedorLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!loginUsername || !loginPassword) {
             setError("Por favor, ingresa tu usuario y contraseña.");
             return;
        }
        setLoading(true);
        try {
            const data = await loginProveedor({ usuario: loginUsername, contraseña: loginPassword });

            // Store provider-specific data
            sessionStorage.setItem("proveedorToken", data.token);
            sessionStorage.setItem("proveedorUserId", data.usuario.id_usuario.toString()); // Convertir a string si es necesario
            sessionStorage.setItem("proveedorUsername", data.usuario.usuario);
            sessionStorage.setItem("proveedorUserNombre", `${data.usuario.nombre} ${data.usuario.apellido_paterno}${data.usuario.apellido_materno ? ' ' + data.usuario.apellido_materno : ''}`);
            // Opcional: Almacenar el estado del perfil si se usa a menudo
            // sessionStorage.setItem("proveedorHasProfile", data.hasProfile.toString());

            console.log("Proveedor login successful:", data.usuario);
            console.log("Has Profile:", data.hasProfile);

            // Redirection Logic
            if (data.hasProfile) {
                router.push("/proveedores/dashboard"); // Ruta para proveedores con perfil
            } else {
                router.push("/proveedores/datos_generales"); // Ruta para completar perfil
            }

        } catch (err: any) {
             setError(err.message || "Ocurrió un error durante el inicio de sesión.");
        } finally {
             setLoading(false);
        }
    };

    // Signup Handler (como lo tienes)
    const handleProveedorSignup = async (e: React.FormEvent) => {
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
                apellidoMaterno: signupApellidoMaterno,
                correo: signupCorreo,
                contraseña: signupPassword
            });
            setSuccessMessage(data.message || "¡Registro exitoso! Ahora puedes iniciar sesión.");
             // Clear form fields
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