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
    if (storedUserId) {
      const userIdNum = parseInt(storedUserId, 10);
      if (!isNaN(userIdNum)) {
        setUserId(userIdNum);
        // Llamar a fetchProviderData sólo después de establecer el userId
        fetchProviderData(userIdNum);
      } else {
        setError("ID de usuario inválido en sesión.");
        setLoading(false);
      }
    } else {
      setError("Usuario no autenticado. Por favor, inicie sesión.");
      setLoading(false);
      // Considera redirigir al login aquí si es el comportamiento deseado
      // router.push('/ruta/al/login');
    }
    // Quitamos la dependencia de router si no se usa dentro del effect directamente
    // para evitar re-ejecuciones innecesarias si solo cambia el router.
  }, []); // Ejecutar solo una vez al montar para leer sessionStorage

  const fetchProviderData = async (idUsuario: number) => { // Cambiado nombre del parámetro
    setError(null);
    setLoading(true); // Iniciar carga específica de datos del proveedor
    try {
       // Llama a la función fetch usando el id del USUARIO
       const data = await getProveedorForUser(idUsuario);

       if (data && data.id_proveedor && data.tipo_proveedor) {
          setProviderData(data);

          if (typeof window !== "undefined") {
              sessionStorage.setItem('proveedorId', data.id_proveedor.toString());
              sessionStorage.setItem('proveedorTipo', data.tipo_proveedor);
              console.log(`Dashboard: Datos de proveedor cargados y guardados en sessionStorage (ID: ${data.id_proveedor}, Tipo: ${data.tipo_proveedor}).`);
          }

       } else {
           console.warn("Datos del proveedor recibidos incompletos:", data);
           // Limpiar sessionStorage si los datos son incompletos
           if (typeof window !== "undefined") {
               sessionStorage.removeItem('proveedorId');
               sessionStorage.removeItem('proveedorTipo');
           }
           throw new Error('Perfil de proveedor no encontrado, incompleto o sin tipo definido.');
       }
    } catch (err: any) {
       console.error("Error fetching provider data for dashboard:", err);
       // Limpiar sessionStorage en caso de error
       if (typeof window !== "undefined") {
           sessionStorage.removeItem('proveedorId');
           sessionStorage.removeItem('proveedorTipo');
       }
       if (err.message?.includes('Perfil de proveedor no encontrado')) {
           setError('No se encontró un perfil de proveedor asociado. Complete su registro.');
           // No redirigir automáticamente desde aquí, deja que el usuario vea el mensaje.
           // Si es necesario redirigir, hazlo basado en el estado 'error' en el render.
           // router.push('/proveedores/datos_generales');
       } else {
            setError(err.message || 'Error al cargar los datos del proveedor.');
       }
       setProviderData(null); // Limpia datos en caso de error
    } finally {
       setLoading(false); // Termina la carga de datos del proveedor
    }
 };


 const handleManageDocumentsClick = () => {
      if (providerData && providerData.id_proveedor && providerData.tipo_proveedor) {
        sessionStorage.setItem('proveedorId', providerData.id_proveedor.toString());
        sessionStorage.setItem('proveedorTipo', providerData.tipo_proveedor);

        router.push('/proveedores/documentos');
      } else {
        alert("No se pueden gestionar los documentos porque los datos del proveedor no están cargados.");
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