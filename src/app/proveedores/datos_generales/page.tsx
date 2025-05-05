'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for potential redirects
import PieP from "../../pie";
import DynamicMenu from "../../menu_principal";
// Ajusta la ruta si es necesario
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
        console.log("RegistroDatos Page - User ID set:", userIdNum);
      } else {
         setError("ID de usuario inválido encontrado. Por favor, inicie sesión de nuevo.");
         console.error("RegistroDatos Page - Invalid User ID found in session:", storedUserId);
         // Optionally redirect to login after a delay
         // setTimeout(() => router.push('/proveedores/login'), 3000);
      }
    } else {
      setError("No se encontró ID de usuario. Por favor, inicie sesión.");
      console.warn("RegistroDatos Page - No User ID found in session. Redirecting to login.");
      router.push('/proveedores/proveedoresusuarios'); // Redirect immediately if no ID
    }
    setIsLoading(false);
  }, [router]); // Add router to dependency array

  // Callback que se pasa al formulario
  const handleRegistroExitoso = (newProviderData: any) => {
      console.log("RegistroDatos Page: Registro de perfil de proveedor exitoso! Data:", newProviderData);
      // Aquí puedes mostrar un mensaje de éxito breve antes de redirigir
      alert("¡Proveedor registrado exitosamente!"); // O usar un toast/modal
      // Redirigir al dashboard o a donde sea apropiado
      router.push(`/proveedores/dashboard`); // Asumiendo que este es el destino
  };

  if (isLoading) {
    return (
         <div>
            <DynamicMenu />
                <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex items-center justify-center" style={{ marginTop: 'calc(64px + 2rem)' }}> {/* Ajuste para altura del menú */}
                    <p>Cargando datos de usuario...</p> {/* Mensaje más específico */}
                </div>
            <PieP />
        </div>
    );
  }

   // Muestra error si el ID no se pudo obtener o era inválido
   if (error && !idUsuarioProveedor) {
       return (
            <div>
                <DynamicMenu />
                    <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex items-center justify-center text-center" style={{ marginTop: 'calc(64px + 2rem)' }}>
                        <p className="text-red-600">{error}</p>
                    </div>
                <PieP />
            </div>
       );
   }

   // Renderiza el formulario solo si tenemos un ID válido y no estamos cargando
  return (
    <div>
      <DynamicMenu />
      {/* Añadir padding top para compensar el menú fijo */}
      <div className="min-h-screen pt-24 pb-8 px-4 md:px-8 bg-gray-50"> {/* pt-24 asumiendo menú de 6rem + padding */}
         <div className="max-w-4xl mx-auto">
           {idUsuarioProveedor !== null ? (
             <FormularioRegistroProveedor
                idUsuarioProveedor={idUsuarioProveedor}
                onSuccess={handleRegistroExitoso}
             />
           ) : (
             // Este caso no debería ocurrir si la lógica de useEffect/error es correcta,
             // pero es un fallback por si acaso.
             <p className="text-center text-gray-500">Esperando información del usuario...</p>
           )}
         </div>
      </div>
      <PieP />
    </div>
  );
}