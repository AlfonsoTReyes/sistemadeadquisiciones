"use client";
import React, { useState } from "react";
import { createFirma } from '../../../peticiones_api/peticionSolicitudes';

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

  const firmarYEnviar = async () => {
    try {
      setLoading(true);
  
      const result = await createFirma({ id_solicitud: idSolicitud });
  
      if (!result.ok) {
        alert(result.message); // muestra el mensaje del backend
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
