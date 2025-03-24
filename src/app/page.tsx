"use client";
//import React, { useState } from "react";
import React from "react";
import Link from "next/link";
import Menu from './menu_principal';
import Pie from './pie';
//import Modal from './modal'; 
//import vehiculo from '../public/images/vehiculo.png';

export default function Home() {
  /*const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
*/
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-between">
      <Menu />

      {/* Contenido principal */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 sm:px-20 relative" style={{marginTop: 150}}>
        <div className="flex items-center justify-center max-w-2xl w-full bg-white rounded-lg shadow-lg relative z-10 overflow-hidden">
        {/*<img
            src={vehiculo.src} // Asegúrate de que la imagen esté en public/images
            alt="Vehículos"
            className="w-1/2 object-cover h-full opacity-50" // Ajusta la opacidad según necesites
          />*/}
          <div className="p-10 flex-1">
            {/* Título del sistema */}
            <h1 className="text-3xl font-bold mb-4 text-blue-700">Sistema de Adquisiciones</h1>
            <p className="text-gray-600 mb-6">
              Bienvenido al sistema de adquisiciones para el municipio de San Juan del Río del estado de Querétaro.
            </p>

            {/* Opciones de inicio */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Link href="/login">
                  <button 
                  className="w-full h-12 text-white rounded-lg hover:bg-blue-600 transition"
                  style={{ backgroundColor: "#faa21b" }}>
                    Iniciar Sesión
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Pie />
    </div>
  );
}
