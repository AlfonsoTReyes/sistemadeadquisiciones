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

 // Adjusted Login Handler
 const handleProveedorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    // ... (input validation) ...
    if (!loginUsername || !loginPassword) { setError("..."); return; }
    setLoading(true);
    try {
        // API response now includes hasProfile flag
        const data = await loginProveedor({ usuario: loginUsername, contraseña: loginPassword });

        // Store token and user info
        sessionStorage.setItem("proveedorToken", data.token);
        sessionStorage.setItem("proveedorUserId", data.usuario.id_usuario); // <-- STORE USER ID
        sessionStorage.setItem("proveedorUsername", data.usuario.usuario);
        sessionStorage.setItem("proveedorUserNombre", `${data.usuario.nombre} ${data.usuario.apellido_paterno}${data.usuario.apellido_materno ? ' ' + data.usuario.apellido_materno : ''}`);

        console.log("Proveedor login successful:", data.usuario);
        console.log("Has Profile:", data.hasProfile); // Log the flag

        // --- REDIRECTION LOGIC ---
        if (data.hasProfile) {
            router.push("/proveedores/dashboard"); // EXAMPLE
        } else {
            router.push("/proveedores/datos_generales");
        }
        // --- END REDIRECTION LOGIC ---

    } catch (err: any) { setError(err.message || "Ocurrió un error durante el inicio de sesión."); }
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
        // ... (return existing state and handlers) ...
        loading, error, successMessage, setError, setSuccessMessage,
        // Login
        loginUsername, setLoginUsername, loginPassword, setLoginPassword, handleProveedorLogin,
        // Signup
        signupUsername, setSignupUsername, signupNombre, setSignupNombre, signupApellidoPaterno, setSignupApellidoPaterno, signupApellidoMaterno, setSignupApellidoMaterno, signupCorreo, setSignupCorreo, signupPassword, setSignupPassword, signupConfirmPassword, setSignupConfirmPassword, handleProveedorSignup,

    };
};

export default useProveedorAuth;
// --- END OF FILE src/hooks/useProveedorAuth.ts ---