// --- START OF FILE src/app/proveedores/dashboard/page.tsx ---
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PieP from "../../pie";
import DynamicMenu from "../../menu_principal";
import ProveedorData from './formularios/ProveedorInfo';
import { getProveedorForUser } from './formularios/fetchdashboard'; // Import fetch function

export default function PageProveedorDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [providerData, setProviderData] = useState<{ id_proveedor: number, tipo_proveedor: string, [key: string]: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('proveedorUserId');
    // console.log("Dashboard Page - Retrieved User ID from session:", storedUserId); // Debug

    if (storedUserId) {
      const userIdNum = parseInt(storedUserId, 10);
      if (!isNaN(userIdNum)) {
        setUserId(userIdNum);
        fetchProviderData(userIdNum); // Llama a fetch aquí si está bien
      } else {
        setError("ID de usuario inválido en sesión.");
        setLoading(false);
      }
    } else {
      setError("Usuario no autenticado. Por favor, inicie sesión.");
      setLoading(false);
      router.push('/proveedores/proveedoresusuarios');
    }
  }, [router]); // Dependencia correcta

  const fetchProviderData = async (id: number) => {
    setError(null);
    setLoading(true);
    try {
       const data = await getProveedorForUser(id);
       // --- VALIDACIÓN MÁS ESTRICTA ---
       // Verifica que existan datos, ID y TIPO de proveedor
       if (data && data.id_proveedor && data.tipo_proveedor) {
          setProviderData(data);
       } else {
           console.warn("Datos del proveedor incompletos:", data); // Log para depurar
           throw new Error('Perfil de proveedor no encontrado, incompleto o sin tipo definido.');
       }
       // --- FIN VALIDACIÓN ---
    } catch (err: any) {
       console.error("Error fetching provider data for dashboard:", err);
       if (err.message?.includes('Perfil de proveedor no encontrado')) {
           setError('No se encontró un perfil de proveedor asociado. Complete su registro.');
           router.push('/proveedores/datos_generales');
       } else {
            // Muestra el error específico o uno genérico
            setError(err.message || 'Error al cargar los datos del proveedor.');
       }
       setProviderData(null); // Limpia datos en caso de error
    } finally {
       setLoading(false);
    }
 };

    // --- FUNCIÓN PARA EL BOTÓN DE GESTIONAR DOCUMENTOS ---
    const handleManageDocumentsClick = () => {
      // --- VERIFICAR ID Y TIPO ---
      if (providerData && providerData.id_proveedor && providerData.tipo_proveedor) {
        const providerId = providerData.id_proveedor.toString();
        const providerType = providerData.tipo_proveedor; // Ya debería ser string ('Moral' o 'Fisica')

        console.log(`Navigating to documents for provider ID: ${providerId}, Type: ${providerType}`); // Debug

        // 1. Guarda el ID del PROVEEDOR en sessionStorage
        sessionStorage.setItem('proveedorId', providerId);

        // 2. Guarda el TIPO del PROVEEDOR en sessionStorage
        sessionStorage.setItem('proveedorTipo', providerType); // Usa una clave distinta

        // 3. Navega a la página de gestión de documentos
        router.push('/proveedores/documentos'); // <-- Asegúrate que esta ruta sea correcta

      } else {
        console.error("No provider ID or type available to manage documents. Data:", providerData); // Log extendido
        setError("No se puede acceder a la gestión de documentos: faltan datos del proveedor (ID o Tipo).");
        alert("No se pueden gestionar los documentos porque no se cargaron los datos del proveedor correctamente (falta ID o Tipo)."); // Alert para el usuario
      }
    };

  return (
    <div>
      <DynamicMenu />
      <div className="min-h-screen p-4 md:p-8 bg-gray-50" style={{ marginTop: 100 }}>
         <ProveedorData
            providerData={providerData}
            loading={loading}
            error={error}
            //onPdfClick={handlePdfClick} 
            onManageDocumentsClick={handleManageDocumentsClick}
         />
      </div>
      <PieP />
    </div>
  );
}