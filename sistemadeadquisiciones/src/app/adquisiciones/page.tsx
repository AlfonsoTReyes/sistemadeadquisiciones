"use client";

import { useEffect, useState } from "react";
import Menu from "./menu_adquisiciones";
import PieP from "../pie";


const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Menu /> {/* Menú de navegación */}

        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
            Sistema de Adquisiciones
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
            San Juan del Río, Querétaro
          </h2>
        </div>

      <PieP /> {/* Pie de página */}
    </div>
  );
};

export default MainPage;
function setError(message: string) {
  throw new Error("Function not implemented.");
}

