"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Menu from '../menu_principal';
import Pie from '../pie';
import Modal from "../modal";
import logoSJR from "../../public/logo_sanjuan.png";
import fondo from "../../public/images/fondoNaranja2.jpg";

const LoginPage = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard"); // Redirigir directamente sin validación
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      <Menu />
<br />
      <main className="flex items-center justify-center flex-1">
        <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Sección de formulario */}
          <div className="w-1/2 p-8">
            <div className="flex items-center justify-left mb-6">
              <Image src={logoSJR} alt="Logo" width={150} height={40} priority />
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block font-medium" htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-6">
                <label className="block font-medium" htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <button type="submit" 
                className="w-full text-white p-2 rounded-lg transition"
                style={{ backgroundColor: "#faa21b" }}>
                Iniciar sesión
              </button>
            </form>

            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 text-white p-2 rounded-lg transition"
              style={{ backgroundColor: "#faa21b" }}>
              Reconocimiento facial
            </button>
          </div>

          {/* Sección de imagen */}
          <div className="w-1/2 relative">
            <Image
              src={fondo}
              alt="Fondo"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        </div>
      </main>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} />
      )}

      <br />

      <Pie />
    </div>
  );
};

export default LoginPage;
