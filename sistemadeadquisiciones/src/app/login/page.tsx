"use client";
import Image from "next/image";
import Menu from '../menu_principal';
import Pie from '../pie';
import useLoginService from "./login";
import logoSJR from "../../public/logo_sanjuan.png";
import fondo from "../../public/images/fondoNaranja2.jpg";

const LoginPage = () => {
  const {
    email, setEmail, password, setPassword,
    firmaPassword, setFirmaPassword,
    handleLogin, handleFileChange, handleLoginFirma
  } = useLoginService();

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

            {/* Formulario tradicional */}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block font-medium text-black">Email:</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block font-medium text-black">Contraseña:</label>
                <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" 
                className="w-full text-white p-2 rounded-lg transition"
                style={{ backgroundColor: "#faa21b" }}>
                Iniciar sesión
              </button>
            </form>

            <hr className="my-6 border-gray-300" />

            {/* Formulario de e-firma */}
            <h2 className="text-lg font-semibold text-black text-center">Iniciar sesión con e-firma</h2>
            <form onSubmit={handleLoginFirma}>
              <div className="mb-4">
                <label className="block font-medium text-black">Archivo .cer:</label>
                <input type="file" accept=".cer" className="w-full p-2 border border-gray-300 rounded text-black"
                  onChange={(e) => handleFileChange(e, "cer")}
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-black">Archivo .key:</label>
                <input type="file" accept=".key" className="w-full p-2 border border-gray-300 rounded text-black"
                  onChange={(e) => handleFileChange(e, "key")}
                />
              </div>
              <div className="mb-6">
                <label className="block font-medium text-black">Contraseña de e-firma:</label>
                <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  value={firmaPassword}
                  onChange={(e) => setFirmaPassword(e.target.value)}
                />
              </div>

              <button type="submit" 
                className="w-full text-white p-2 rounded-lg transition"
                style={{ backgroundColor: "#faa21b" }}>
                Iniciar sesión con e-firma
              </button>
            </form>
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

      <br />
      <Pie />
    </div>
  );
};

export default LoginPage;
