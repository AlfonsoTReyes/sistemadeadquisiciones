"use client";
import React, { useState } from "react";
import { deleteOtroAnexo } from "../../../peticiones_api/peticionSolicitudesDetalle";


interface ModalEliminarDocumentoProps {
  idDoc: number;
  onClose: () => void;
  onDeleted: () => void;
}

const ModalEliminarDocumentoAdicional: React.FC<ModalEliminarDocumentoProps> = ({
  idDoc,
  onClose,
  onDeleted,
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const handleEliminar = async () => {
        setIsDeleting(true);
        setMensaje("");
      
        try {
          const result = await deleteOtroAnexo(idDoc);
          if (result.success) {
            setMensaje("Documento eliminado correctamente.");
            setTimeout(() => {
              onDeleted();
              onClose();
            }, 1000);
          } else {
            setMensaje("No se pudo eliminar el documento.");
          }
        } catch (error) {
          console.error("Error al eliminar:", error);
          setMensaje("Error al eliminar el documento.");
        } finally {
          setIsDeleting(false);
        }
      };


    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
                <h2 className="text-lg font-bold mb-4 text-red-600">¿Eliminar documento?</h2>
                <p className="mb-4">¿Estás seguro de que deseas eliminar el documento?</p>

                {mensaje && (
                <div className="text-sm text-blue-600 font-semibold mb-2">{mensaje}</div>
                )}

                <div className="flex justify-between mt-4">
                <button
                    onClick={handleEliminar}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full mr-2"
                >
                    {isDeleting ? "Eliminando..." : "Sí, eliminar"}
                </button>
                <button
                    onClick={onClose}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition w-full ml-2"
                >
                    Cancelar
                </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEliminarDocumentoAdicional;
