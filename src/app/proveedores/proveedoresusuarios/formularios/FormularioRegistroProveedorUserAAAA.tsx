// --- START OF FILE src/components/proveedores/auth/FormularioRegistroProveedorUser.tsx ---
'use client';
import React from 'react';
import useProveedorAuth from '../useProveedorAuth'; // Adjust path

const FormularioRegistroProveedorUser = () => {
  const {
      signupUsername, setSignupUsername,
      signupNombre, setSignupNombre,
      signupApellidoPaterno, setSignupApellidoPaterno,
      signupApellidoMaterno, setSignupApellidoMaterno,
      signupCorreo, setSignupCorreo,
      signupPassword, setSignupPassword,
      signupConfirmPassword, setSignupConfirmPassword,
      handleProveedorSignup,
      loading, error, successMessage,
      setError, setSuccessMessage // Import setters to clear messages
  } = useProveedorAuth();

  // Clear messages when form fields change
   const handleInputChange = (setter: Function) => (e: React.ChangeEvent<HTMLInputElement>) => {
       setError(null);
       setSuccessMessage(null);
       setter(e.target.value);
   };


  return (
    <form onSubmit={handleProveedorSignup} className="space-y-4 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center text-gray-700">Registro Usuario Proveedor</h2>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}

      {/* Input Fields */}
       <div>
        <label htmlFor="signup-usuario" className="block text-sm font-medium text-gray-700">Usuario</label>
        <input type="text" id="signup-usuario" value={signupUsername} onChange={handleInputChange(setSignupUsername)} required className="mt-1 block w-full input-style" />
      </div>
       <div>
        <label htmlFor="signup-nombre" className="block text-sm font-medium text-gray-700">Nombre(s)</label>
        <input type="text" id="signup-nombre" value={signupNombre} onChange={handleInputChange(setSignupNombre)} required className="mt-1 block w-full input-style" />
      </div>
       <div>
        <label htmlFor="signup-apellido-paterno" className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
        <input type="text" id="signup-apellido-paterno" value={signupApellidoPaterno} onChange={handleInputChange(setSignupApellidoPaterno)} required className="mt-1 block w-full input-style" />
      </div>
      <div>
        <label htmlFor="signup-apellido-materno" className="block text-sm font-medium text-gray-700">Apellido Materno</label>
        <input type="text" id="signup-apellido-materno" value={signupApellidoMaterno} onChange={handleInputChange(setSignupApellido)} required className="mt-1 block w-full input-style" />
      </div>
       <div>
        <label htmlFor="signup-correo" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
        <input type="email" id="signup-correo" value={signupCorreo} onChange={handleInputChange(setSignupCorreo)} required className="mt-1 block w-full input-style" />
      </div>
       <div>
        <label htmlFor="signup-password-proveedor" className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input type="password" id="signup-password-proveedor" value={signupPassword} onChange={handleInputChange(setSignupPassword)} required className="mt-1 block w-full input-style" />
      </div>
       <div>
        <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
        <input type="password" id="signup-confirm-password" value={signupConfirmPassword} onChange={handleInputChange(setSignupConfirmPassword)} required className="mt-1 block w-full input-style" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {loading ? 'Registrando...' : 'Registrar Usuario'}
      </button>
       {/* Optional Link to Login */}
       <p className="text-center text-sm text-gray-600">
           ¿Ya tienes cuenta? <a href="/proveedores/proveedoresusuarios" className="font-medium text-indigo-600 hover:text-indigo-500">Inicia sesión</a>
       </p>
        {/* Simple style definition for inputs */}
        <style jsx>{`
            .input-style {
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db; /* gray-300 */
                border-radius: 0.375rem; /* rounded-md */
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            }
            .input-style:focus {
                 outline: none;
                 border-color: #4f46e5; /* focus:border-indigo-500 */
                 box-shadow: 0 0 0 1px #4f46e5; /* focus:ring-indigo-500 */
            }
        `}</style>
    </form>
  );
};

export default FormularioRegistroProveedorUser;
// --- END OF FILE src/components/proveedores/auth/FormularioRegistroProveedorUser.tsx ---