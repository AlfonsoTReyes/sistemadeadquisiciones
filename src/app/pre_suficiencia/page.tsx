// app/pre_suficiencia/page.tsx
import dynamic from "next/dynamic";

// Cargamos tu componente de cliente sin SSR
const SolicitudPage = dynamic(() => import("./SolicitudPage"), { ssr: false });

export default function Page() {
  return <SolicitudPage />;
}
