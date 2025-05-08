// app/pre_suficiencia/page.tsx
'use client';

import { Suspense } from 'react';
import SolicitudPage from './SolicitudPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <SolicitudPage />
    </Suspense>
  );
}
