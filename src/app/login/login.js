import { useState } from "react";
import { useRouter } from "next/navigation";

const useLoginService = () => {
  const router = useRouter();

  // estados para login tradicional
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // función para obtener los permisos del usuario
  const fetchPermissions = async (idRol) => {
    try {
      const res = await fetch(`/api/permisos?idrol=${idRol}`);

      if (!res.ok) {
        throw new Error("no se pudieron obtener los permisos");
      }

      const data = await res.json();
      console.log(data);
      sessionStorage.setItem("userPermissions", JSON.stringify(data));
      

      console.log("permisos cargados:", data);
    } catch (error) {
      console.error("error al cargar los permisos:", error);
    }
  };


  const getRedirectPath = (sistema) => {
    switch (sistema.toLowerCase()) {
      case "finanzas":
        return "/finanzas";
      case "adquisiciones":
        return "/adquisiciones";
      case "proveedores":
        return "/proveedores";
      case "solicitantes":
        return "/solicitantes";
      default:
        return "/dashboard"; // ruta por defecto si el sistema no está definido
    }
  };

  // autenticación tradicional con email y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("por favor, ingresa tu email y contraseña.");
      return;
    }

    const operacion = `inicio sesión la persona con el correo ${email}`;
    const tabla_afectada = "login";
    const datos_nuevos = "solo inicio sesión al sistema";

    console.log("enviando solicitud a /api/login con:", { email, password, operacion, tabla_afectada, datos_nuevos });

    try {
      const response = await fetch("/api/login", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, operacion, tabla_afectada, datos_nuevos }),
      });

      console.log("respuesta recibida:", response);

      const data = await response.json();
      console.log("datos procesados:", data.usuario);

      if (data.token) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userRole", data.usuario.id_rol.toString());
        sessionStorage.setItem("userEmail", data.usuario.email);
        sessionStorage.setItem("userNombre", data.usuario.nombre);
        sessionStorage.setItem("userId", data.usuario.id_usuario);
        sessionStorage.setItem("userSistema", data.usuario.sistema);
        sessionStorage.setItem("userSecre", data.usuario.id_secretaria);

        // obtener permisos con el rol del usuario
        await fetchPermissions(data.usuario.id_rol.toString());

        // determinar la ruta de redirección
        const redirectPath = getRedirectPath(data.usuario.sistema);
        router.push(redirectPath);
      } else {
        alert("error: " + (data.message || "credenciales incorrectas."));
      }
    } catch (error) {
      console.error("error en login tradicional:", error);
      alert("hubo un problema con el inicio de sesión.");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
  };
};

export default useLoginService;
