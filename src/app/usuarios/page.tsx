import { Suspense } from 'react';
import UsuariosPage from './PageUsuarios'; // o './UsuariosClient' según el nombre final

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-6">Cargando usuarios...</div>}>
      <UsuariosPage />
    </Suspense>
  );
}
