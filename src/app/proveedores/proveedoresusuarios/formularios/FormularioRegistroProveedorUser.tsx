// --- START OF FILE src/components/proveedores/auth/FormularioRegistroProveedorUser.tsx ---
'use client';
import React, { useEffect } from 'react'; // Importa useEffect
import { useRouter } from 'next/navigation'; // Importa useRouter
import useProveedorAuth from '../useProveedorAuth'; // Ajusta la ruta

const FormularioRegistroProveedorUser = () => {
    const router = useRouter(); // Inicializa el router
    const {
        signupUsername, setSignupUsername,
        signupNombre, setSignupNombre,
        signupApellidoPaterno, setSignupApellidoPaterno,
        signupApellidoMaterno, setSignupApellidoMaterno,
        signupCorreo, setSignupCorreo,
        signupPassword, setSignupPassword,
        signupConfirmPassword, setSignupConfirmPassword,
        handleProveedorSignup,
        loading, error, successMessage, // Usaremos successMessage para disparar la redirección
        setError, setSuccessMessage
    } = useProveedorAuth();

     // Handler genérico para inputs (sin cambios)
     const handleInputChange = (setter: Function) => (e: React.ChangeEvent<HTMLInputElement>) => {
         setError(null);
         setSuccessMessage(null); // Limpiar mensaje de éxito si el usuario empieza a escribir de nuevo
         setter(e.target.value);
     };

    // --- **NUEVO: useEffect para Redirección** ---
    useEffect(() => {
        // Si hay un mensaje de éxito (indicando registro correcto)...
        if (successMessage) {
            console.log("Registro exitoso detectado:", successMessage);
            // Muestra el mensaje por un momento antes de redirigir
            const timer = setTimeout(() => {
                console.log("Redirigiendo a la página de login...");
                router.push('/proveedores/proveedoresusuarios'); // Redirige a la página de login
            }, 2000); // Espera 2 segundos (2000 ms) - ajusta si lo deseas

            // Limpia el temporizador si el componente se desmonta antes de que se complete
            return () => clearTimeout(timer);
        }
    }, [successMessage, router]); // Ejecuta este efecto cuando successMessage o router cambien
    // --- FIN useEffect ---

    return (
      // El contenedor del formulario no necesita cambios
      <form onSubmit={handleProveedorSignup} className="space-y-4 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-center text-gray-700">Registro Usuario Proveedor</h2>

        {/* Mostrar errores o mensaje de éxito */}
        {/* El mensaje de éxito se mostrará brevemente antes de la redirección */}
        {error && <p className="text-red-500 text-sm text-center p-2 bg-red-50 rounded border border-red-200">{error}</p>}
        {successMessage && <p className="text-green-600 text-sm text-center p-2 bg-green-50 rounded border border-green-200">{successMessage}</p>}

        {/* --- CAMPOS DEL FORMULARIO (sin cambios en su estructura) --- */}
         <div>
          <label htmlFor="signup-usuario" className="block text-sm font-medium text-gray-700">Usuario <span className="text-red-500">*</span></label>
          <input type="text" id="signup-usuario" value={signupUsername} onChange={handleInputChange(setSignupUsername)} required className="mt-1 block w-full input-style" disabled={loading}/> {/* Deshabilitar en carga */}
        </div>
         <div>
          <label htmlFor="signup-nombre" className="block text-sm font-medium text-gray-700">Nombre(s) <span className="text-red-500">*</span></label>
          <input type="text" id="signup-nombre" value={signupNombre} onChange={handleInputChange(setSignupNombre)} required className="mt-1 block w-full input-style" disabled={loading}/>
        </div>
         <div>
          <label htmlFor="signup-apellido-paterno" className="block text-sm font-medium text-gray-700">Apellido Paterno <span className="text-red-500">*</span></label>
          <input type="text" id="signup-apellido-paterno" value={signupApellidoPaterno} onChange={handleInputChange(setSignupApellidoPaterno)} required className="mt-1 block w-full input-style" disabled={loading}/>
        </div>
         <div>
          <label htmlFor="signup-apellido-materno" className="block text-sm font-medium text-gray-700">Apellido Materno</label>
          <input type="text" id="signup-apellido-materno" value={signupApellidoMaterno} onChange={handleInputChange(setSignupApellidoMaterno)} className="mt-1 block w-full input-style" disabled={loading}/>
        </div>
         <div>
          <label htmlFor="signup-correo" className="block text-sm font-medium text-gray-700">Correo Electrónico <span className="text-red-500">*</span></label>
          <input type="email" id="signup-correo" value={signupCorreo} onChange={handleInputChange(setSignupCorreo)} required className="mt-1 block w-full input-style" disabled={loading}/>
        </div>
         <div>
          <label htmlFor="signup-password-proveedor" className="block text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></label>
          <input type="password" id="signup-password-proveedor" value={signupPassword} onChange={handleInputChange(setSignupPassword)} required className="mt-1 block w-full input-style" disabled={loading}/>
        </div>
         <div>
          <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña <span className="text-red-500">*</span></label>
          <input type="password" id="signup-confirm-password" value={signupConfirmPassword} onChange={handleInputChange(setSignupConfirmPassword)} required className="mt-1 block w-full input-style" disabled={loading}/>
        </div>
        {/* --- FIN CAMPOS --- */}

      {/* Botón de envío (sin cambios funcionales) */}
      <button
        type="submit"
        disabled={loading} // Deshabilitar si está cargando
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-150 ${
          loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrando...
            </>
        ) : (
            'Registrar Usuario'
        )}
      </button>
       <p className="text-center text-sm text-gray-600">
           ¿Ya tienes cuenta? <a href="/proveedores/proveedoresusuarios" className="font-medium text-indigo-600 hover:text-indigo-500">Inicia sesión</a>
       </p>
        <style jsx>{`
            .input-style { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .input-style:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 1px #4f46e5; }
            .input-style:disabled { background-color: #f3f4f6; cursor: not-allowed; }
        `}</style>
    </form>
  );
};

export default FormularioRegistroProveedorUser;