// --- START OF FILE src/components/proveedores/auth/FormularioLoginProveedor.tsx ---
'use client';
import React from 'react';
import useProveedorAuth from '../useProveedorAuth'; // Adjust path

const FormularioLoginProveedor = () => {
  const {
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    handleProveedorLogin,
    loading,
    error,
  } = useProveedorAuth();

  return (
    <form onSubmit={handleProveedorLogin} className="space-y-4 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center text-gray-700">Iniciar Sesión Proveedor</h2>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <label htmlFor="login-usuario" className="block text-sm font-medium text-gray-700">
          Correo
        </label>
        <input
          type="text"
          id="login-usuario"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Tu Correo de Usuario"
        />
      </div>
      <div>
        <label htmlFor="login-password-proveedor" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          id="login-password-proveedor"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Tu contraseña"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
      >
        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
      </button>
       {/* Optional Link to Signup */}
       <p className="text-center text-sm text-gray-600">
           ¿No tienes cuenta? <a href="/proveedores/proveedoresusuarios/register" className="font-medium text-indigo-600 hover:text-indigo-500">Regístrate aquí</a>
       </p>
    </form>
  );
};

export default FormularioLoginProveedor;
// --- END OF FILE src/components/proveedores/auth/FormularioLoginProveedor.tsx ---