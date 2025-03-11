import { useState } from "react";
import { useRouter } from "next/navigation";

const useLoginService = () => {
  const router = useRouter();

  // Estados para login tradicional
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para login con e-firma
  const [cerFile, setCerFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [firmaPassword, setFirmaPassword] = useState("");

  // Manejo de cambio en input de archivos
  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (type === "cer") setCerFile(file);
      else setKeyFile(file);
    }
  };

  // Autenticación tradicional con email y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    const operacion='Inicio sesión la persona con el correo '+email;
    const tabla_afectada='Login';
    const datos_nuevos='Solo inicio sesión al sistema';
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, operacion, tabla_afectada, datos_nuevos }),
      });

      const data = await response.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error en login tradicional:", error);
      alert("Hubo un problema con el inicio de sesión.");
    }
  };

  // Autenticación con e-firma
  const handleLoginFirma = async (e) => {
    e.preventDefault();

    if (!cerFile || !keyFile || !firmaPassword) {
      alert("Por favor, sube ambos archivos y proporciona la contraseña.");
      return;
    }

    const formData = new FormData();
    formData.append("cer", cerFile);
    formData.append("key", keyFile);
    formData.append("password", firmaPassword);

    try {
      const response = await fetch("/api/efirma", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        alert("Error en e-firma: " + data.message);
      }
    } catch (error) {
      console.error("Error en login con e-firma:", error);
      alert("Hubo un problema con la autenticación.");
    }
  };

  return {
    email, setEmail, password, setPassword,
    cerFile, keyFile, firmaPassword, setFirmaPassword,
    handleLogin, handleFileChange, handleLoginFirma
  };
};

export default useLoginService;
