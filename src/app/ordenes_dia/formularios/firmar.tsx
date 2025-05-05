"use client";
import React, { useState } from "react";
import { createFirma } from '../../peticiones_api/peticionSolicitudes';

interface ModalFirmaEnvioProps {
  idSolicitud: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalFirmaEnvio: React.FC<ModalFirmaEnvioProps> = ({
  idSolicitud,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const firmarYEnviar = async () => {
    try {
      setLoading(true);
  
      const result = await createFirma({ id_solicitud: idSolicitud });
  
      if (!result.ok) {
        setErrorMessage(result.message); // Muestra mensaje visual
        setTimeout(() => setErrorMessage(null), 5000); // Oculta después de 5 segundos
        return;
      }
      
  
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl text-center">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between animate-fade-in-out">
            <div className="flex items-center">
              <svg className="fill-current w-5 h-5 mr-2 text-red-500" viewBox="0 0 20 20">
                <path d="M10 15a1 1 0 01-.707-.293l-6-6a1 1 0 011.414-1.414L10 12.586l5.293-5.293a1 1 0 111.414 1.414l-6 6A1 1 0 0110 15z"/>
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="ml-2 text-red-700 hover:text-red-900 font-bold">X</button>
          </div>
        )}
        <h2 className="text-xl font-bold mb-4 text-gray-800">¿Estás seguro?</h2>
        <p className="text-sm text-gray-700 mb-6">
          Estas seguro de firmar y enviar. Una vez firmado y enviado no podrás hacer cambios en tu solicitud, al menos de que sea rechazada o soliciten un cambio.
          <br /><br />
          Se firmará tu solicitud, tu justificación y otros documentos que anexes en esta solicitud.
        </p>

        <div className="flex justify-center gap-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            onClick={firmarYEnviar}
            disabled={loading}
          >
            {loading ? "Firmando..." : "Firmar y enviar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFirmaEnvio;
