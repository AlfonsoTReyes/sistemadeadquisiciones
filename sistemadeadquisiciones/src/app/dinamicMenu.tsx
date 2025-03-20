

import React, { useEffect, useState } from "react"; // ✅ Asegura la importación de React
import MenuPrincipal from "./menu";
import MenuProveedores from "./proveedores/menu_proveedores";
import MenuAdquisiciones from "./adquisiciones/menu_adquisiciones";
import MenuFinanzas from "./finanzas/menu_finanzas";
import MenuSolicitante from "./solicitantes/menu_solicitante";

const DynamicMenu: React.FC = () => { // ✅ Agrega el tipo explícito
  const [menuComponent, setMenuComponent] = useState<React.ReactNode | null>(null); // ✅ Cambia JSX.Element por React.ReactNode

  useEffect(() => {
    // Obtener el tipo de usuario desde sessionStorage
    const tipoUsuario = sessionStorage.getItem("userSistema");

    // Determinar qué menú mostrar
    if (tipoUsuario === "UNIVERSAL") {
      setMenuComponent(<MenuPrincipal />); // Menú para superadmin
    } else if (tipoUsuario === "PROVEEDORES") {
      setMenuComponent(<MenuProveedores />); // Menú para proveedores
    } else if (tipoUsuario === "ADQUISICIONES") {
      setMenuComponent(<MenuAdquisiciones />); // Menú para adquisiciones
    } else if (tipoUsuario === "FINANZAS") {
      setMenuComponent(<MenuFinanzas />); // Menú para finanzas
    } else if (tipoUsuario === "SOLICITANTES") {
      setMenuComponent(<MenuSolicitante />); // Menú para solicitantes
    } else {
      setMenuComponent(null); // Si no hay un tipo válido, no muestra menú
    }
  }, []);

  return <>{menuComponent}</>;
};

export default DynamicMenu;
