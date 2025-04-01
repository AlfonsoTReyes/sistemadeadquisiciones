'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for potential redirects
import PieP from "../../pie";
import DynamicMenu from "../../dinamicMenu";
import FormularioRegistroProveedor from './formularios/FormularioRegistroProveedor';

export default function PageRegistroProveedorDatos() {
  const router = useRouter();
  const [idUsuarioProveedor, setIdUsuarioProveedor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // --- Retrieve the user ID stored during login ---
    const storedUserId = sessionStorage.getItem('proveedorUserId');
    console.log("RegistroDatos Page - Retrieved User ID from session:", storedUserId);

    if (storedUserId) {
      const userIdNum = parseInt(storedUserId, 10);
      if (!isNaN(userIdNum)) {
        setIdUsuarioProveedor(userIdNum);
      } else {
         setError("ID de usuario inválido encontrado. Por favor, inicie sesión de nuevo.");
         // Optionally redirect to login after a delay
         // setTimeout(() => router.push('/proveedores/login'), 3000);
      }
    } else {
      setError("No se encontró ID de usuario. Por favor, inicie sesión.");
      // Redirect to login if no ID is found
      router.push('/proveedores/login');
    }
    setIsLoading(false);
  }, [router]); // Add router to dependency array

  const handleRegistroExitoso = (newProviderData: any) => {
      console.log("Registro de perfil de proveedor exitoso:", newProviderData);
      // Redirect to dashboard after successful registration
      router.push(`/proveedores/dashboard`); // Example redirect
  };

  if (isLoading) {
    return (
         <div>
            <DynamicMenu />
                <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex items-center justify-center" style={{ marginTop: 100 }}>
                    <p>Cargando...</p>
                </div>
            <PieP />
        </div>
    ); // Or a proper loading spinner
  }

   if (error && !idUsuarioProveedor) {
       return (
            <div>
                <DynamicMenu />
                    <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex items-center justify-center" style={{ marginTop: 100 }}>
                        <p className="text-red-600">{error}</p>
                    </div>
                <PieP />
            </div>
       );
   }


  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4 md:p-8 bg-gray-50" style={{ marginTop: 100 }}>
         <div className="max-w-4xl mx-auto">
           {/* Render the form only if we have a valid ID */}
           {idUsuarioProveedor !== null && (
             <FormularioRegistroProveedor
                idUsuarioProveedor={idUsuarioProveedor}
                onSuccess={handleRegistroExitoso}
             />
           )}
           {/* Show error if ID became invalid somehow after initial load */}
           {error && idUsuarioProveedor === null && !isLoading && (
                <p className="text-red-600 text-center mt-4">{error}</p>
           )}
         </div>
      </div>
      <PieP />
    </div>
  );
}
