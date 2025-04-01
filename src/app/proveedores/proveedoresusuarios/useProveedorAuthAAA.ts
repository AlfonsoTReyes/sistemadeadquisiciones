// --- START OF FILE src/hooks/useProveedorAuth.ts (Adjusted for Apellidos) ---
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginProveedor, signupProveedor } from '../proveedoresusuarios/formularios/fetchProveedorAuth'; // Adjust path

const useProveedorAuth = () => {
    const router = useRouter();

    // Login State (remains the same)
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Signup State - Adjusted for separate apellidos
    const [signupUsername, setSignupUsername] = useState("");
    const [signupNombre, setSignupNombre] = useState("");
    // const [signupApellido, setSignupApellido] = useState(""); // Removed
    const [signupApellidoPaterno, setSignupApellidoPaterno] = useState(""); // Added
    const [signupApellidoMaterno, setSignupApellidoMaterno] = useState(""); // Added
    const [signupCorreo, setSignupCorreo] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

    // General State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Login Handler (remains the same, but uses updated user info from API)
    const handleProveedorLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        if (!loginUsername || !loginPassword) { setError("..."); return; }
        setLoading(true);
        try {
            const data = await loginProveedor({ usuario: loginUsername, contraseña: loginPassword });
            sessionStorage.setItem("proveedorToken", data.token);
            sessionStorage.setItem("proveedorUserId", data.usuario.id_usuario);
            sessionStorage.setItem("proveedorUsername", data.usuario.usuario);
            // Combine name parts correctly based on returned data
            sessionStorage.setItem("proveedorUserNombre", `${data.usuario.nombre} ${data.usuario.apellido_paterno}${data.usuario.apellido_materno ? ' ' + data.usuario.apellido_materno : ''}`);
            router.push("/proveedores/datos_generales");
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    // Signup Handler - Adjusted validation and data sent
    const handleProveedorSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Adjusted validation check
        if (!signupUsername || !signupNombre || !signupApellidoPaterno || !signupCorreo || !signupPassword || !signupConfirmPassword) {
             setError("Usuario, nombre, apellido paterno, correo y contraseñas son requeridos.");
             return;
        }
        if (signupPassword !== signupConfirmPassword) { setError("Las contraseñas no coinciden."); return; }

        setLoading(true);
        try {
            // Pass the correct fields to signupProveedor
            const data = await signupProveedor({
                usuario: signupUsername,
                nombre: signupNombre,
                apellidoPaterno: signupApellidoPaterno,
                apellidoMaterno: signupApellidoMaterno, // Pass materno (will be null if empty)
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

        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    return {
        // Login
        loginUsername, setLoginUsername,
        loginPassword, setLoginPassword,
        handleProveedorLogin,
        // Signup - Expose new state setters
        signupUsername, setSignupUsername,
        signupNombre, setSignupNombre,
        signupApellidoPaterno, setSignupApellidoPaterno,
        signupApellidoMaterno, setSignupApellidoMaterno,
        signupCorreo, setSignupCorreo,
        signupPassword, setSignupPassword,
        signupConfirmPassword, setSignupConfirmPassword,
        handleProveedorSignup,
        // Common
        loading, error, successMessage,
        setError, setSuccessMessage,
    };
};

export default useProveedorAuth;
// --- END OF FILE src/hooks/useProveedorAuth.ts ---