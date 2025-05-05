"use client";

import { useState, useEffect } from "react";
import {
  updateInvitacionComite,
  getInvitacionByConcurso
} from "../../peticiones_api/peticionInvitacion";

interface ModalInvitacionComiteProps {
  idConcurso: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalInvitacionComite: React.FC<ModalInvitacionComiteProps> = ({
  idConcurso,
  onClose,
  onSuccess,
}) => {
  const [numeroOficio, setNumeroOficio] = useState("DAQ/");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const data = await getInvitacionByConcurso(idConcurso);
      if (data?.yaFueEnviado && data.numero_oficio) {
        setNumeroOficio(data.numero_oficio);
      }
      setLoading(false);
    };
    cargar();
  }, [idConcurso]);

  const handleGuardar = async () => {
    if (!numeroOficio.trim()) {
      alert("Falta el número de oficio.");
      return;
    }

    try {
      await updateInvitacionComite(idConcurso, { numero_oficio: numeroOficio });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al actualizar invitación:", err);
      alert("Ocurrió un error al guardar.");
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Modificar invitación a comité</h2>

        <label className="block font-semibold">Número de oficio</label>
        <input
          type="text"
          className="w-full border p-2 rounded mb-6"
          value={numeroOficio}
          onChange={(e) => setNumeroOficio(e.target.value)}
        />

        <div className="flex justify-end gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleGuardar}
          >
            Guardar cambios
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInvitacionComite;
