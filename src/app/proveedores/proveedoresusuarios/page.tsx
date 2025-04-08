'use client';

import React from 'react';
import Menu from '../../menu';
import Pie from '../../pie';
import FormularioLoginProveedor from './formularios/FormularioLoginProveedor'; // Adjust path

export default function LoginPageProveedor() {
  return (
    <div>
      <Menu />
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
         <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Portal de Proveedores
            </h1>
         </div>
        <FormularioLoginProveedor />
      </div>
    </div>
    <Pie />
  </div>
  );
}