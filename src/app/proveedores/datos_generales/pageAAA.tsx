'use client';
import React from 'react';
import PieP from "../../pie";
import DynamicMenu from "../../dinamicMenu";
import FormularioRegistroProveedor from './formularios/FormularioRegistroProveedor';

export default function PageRegistroProveedor() {
  // --- How to get idUsuario? ---
  // This is a placeholder. In a real app, you'd get this from:
  // 1. Authentication context/provider
  // 2. Session data
  // For now, we'll hardcode it for demonstration. Replace with your actual logic.
  const idUsuarioActual = 1; // EXAMPLE: Replace with actual user ID logic

  const handleRegistroExitoso = (newProviderData: any) => {
      console.log("Registro exitoso:", newProviderData);
      // Optional: Redirect user or show persistent success message
      // Example redirect (needs useRouter from 'next/navigation'):
      // router.push(`/proveedores/detalle/${newProviderData.id_proveedor}`);
  };

  return (
    <div>
      <DynamicMenu /> {/* Carga automáticamente el menú correcto */}
      <div className="min-h-screen p-4 md:p-8 bg-gray-50" style={{ marginTop: 100 }}> {/* Adjusted margin & bg */}
         <div className="max-w-4xl mx-auto"> {/* Limit form width */}
            <FormularioRegistroProveedor
                idUsuario={idUsuarioActual}
                onSuccess={handleRegistroExitoso}
            />
         </div>
      </div>
      <PieP />
    </div>
  );
}
