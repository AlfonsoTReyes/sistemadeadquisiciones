"use client";

import { useEffect, useState } from "react";
import PieP from "../pie";
import DynamicMenu from "../dinamicMenu";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DynamicMenu /> {/* Carga automáticamente el menú correcto */}

      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
          Sistema de Adquisiciones - proveedores
        </h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
          San Juan del Río, Querétaro
        </h2>
      </div>

      <PieP />
    </div>
  );
};

export default Dashboard;
