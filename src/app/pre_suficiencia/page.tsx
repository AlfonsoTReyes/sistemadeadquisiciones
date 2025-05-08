// src/app/pre_suficiencia/page.tsx
import dynamic from 'next/dynamic';

// Suspense wrapper opcional, pero recomendable si haces más loading
const SolicitudPage = dynamic(() => import('./SolicitudPage'), { ssr: false });

export default function Page() {
  return <SolicitudPage />;
}
