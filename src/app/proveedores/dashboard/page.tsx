// --- START OF FILE src/app/proveedores/dashboard/page.tsx ---
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PieP from "../../pie";
import DynamicMenu from "../../dinamicMenu";
import ProveedorData from './formularios/ProveedorInfo';
import { getProveedorForUser } from './formularios/fetchdashboard'; // Import fetch function

export default function PageProveedorDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('proveedorUserId');
    console.log("Dashboard Page - Retrieved User ID from session:", storedUserId);

    if (storedUserId) {
      const userIdNum = parseInt(storedUserId, 10);
      if (!isNaN(userIdNum)) {
        setUserId(userIdNum);
        // Fetch provider data once we have the user ID
        fetchProviderData(userIdNum);
      } else {
         setError("ID de usuario inválido en sesión.");
         setLoading(false);
         router.push('/proveedores/proveedoresusuarios'); // Optional redirect
      }
    } else {
      setError("Usuario no autenticado.");
      setLoading(false);
      router.push('/proveedores/proveedoresusuarios'); // Redirect if no user ID
    }
  }, [router]); // Add router dependency

  const fetchProviderData = async (id: number) => {
     setError(null); // Clear previous errors
     setLoading(true);
     try {
        const data = await getProveedorForUser(id);
        setProviderData(data);
     } catch (err: any) {
        console.error("Error fetching provider data for dashboard:", err);
        // Handle specific "not found" error vs other errors
        if (err.message?.includes('Perfil de proveedor no encontrado')) {
            setError('No se encontró un perfil de proveedor asociado a su cuenta. Por favor, complete su registro.');
            // Optional: Redirect to registration page if profile truly doesn't exist
            router.push('/proveedores/datos_generales');
        } else {
             setError(err.message || 'Error al cargar los datos del proveedor.');
        }
        setProviderData(null); // Clear data on error
     } finally {
        setLoading(false);
     }
  };

  // Placeholder functions for buttons
  const handleUpdateClick = () => {
      console.log("Update button clicked");
      // Logic to open update modal would go here
      // Example: router.push(`/proveedores/actualizar/${providerData?.id_proveedor}`); // Or open a modal
       alert("Funcionalidad de Actualizar no implementada aún.");
  };

  const handlePdfClick = () => {
       console.log("PDF button clicked");
       // Logic to generate PDF would go here
       alert("Funcionalidad de Generar PDF no implementada aún.");
  };


  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4 md:p-8 bg-gray-50" style={{ marginTop: 100 }}>
         <ProveedorData
            providerData={providerData}
            loading={loading}
            error={error}
            onUpdateClick={handleUpdateClick}
            onPdfClick={handlePdfClick} 
         />
      </div>
      <PieP />
    </div>
  );
}