// En: componentes/ModalDoc/modalDoc.tsx (o donde lo tengas)

import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Opcional: para un título en el header del modal
}

const ModalDoc: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  // Efecto para manejar la tecla Escape y el scroll del body
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevenir scroll del fondo
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset'; // Restaurar scroll
    }

    return () => {
      document.body.style.overflow = 'unset'; // Asegurar restauración al desmontar
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);


  if (!isOpen) return null;

  return (
    // 1. Overlay principal que cubre toda la pantalla
    <div
      className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      // Opcional: cerrar si se hace clic en el backdrop (fuera del contenido principal)
      // onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" // Mejorar accesibilidad
      aria-modal="true" // Mejorar accesibilidad
      // aria-labelledby={title ? "modal-title" : undefined} // Si tienes título
    >
      {/* 2. Contenedor del contenido del modal */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-down"
        // No es necesario role="dialog" aquí si ya está en el overlay
      >
        {/* 2a. Header del Modal (Fijo dentro del modal) */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b sticky top-0 bg-white z-10">
          {/* Título opcional */}
          {title && (
            <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {/* Espaciador si no hay título pero queremos el botón a la derecha */}
          {!title && <div />}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            aria-label="Cerrar modal"
          >
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span className="sr-only">Cerrar modal</span>
          </button>
        </div>

        {/* 2b. Cuerpo del Modal (Scrollable) */}
        {/* Aquí es donde se renderizará <GestionDocumentosProveedor /> */}
        <div className="overflow-y-auto flex-grow">
          {children}
        </div>

        {/* 2c. Footer del Modal (Opcional) */}
        {/* Si tu `children` (GestionDocumentosProveedor) ya tiene un botón de cierre
            en su propio footer, podrías no necesitar este. */}
        {/* <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b sticky bottom-0 bg-white z-10">
          <button
            onClick={onClose}
            type="button"
            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
          >
            Cerrar
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ModalDoc;