"use client";

import { useState } from "react";

interface ModalCambiarEstatusOrdenProps {
  idOrden: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalCambiarEstatusOrden: React.FC<ModalCambiarEstatusOrdenProps> = ({
  idOrden,
  onClose,
  onSuccess,
}) => {
  const [estatus, setEstatus] = useState<"Terminado" | "Cancelado" | "Pendiente">("Cancelado");

  const handleGuardar = async () => {
    const payload = {
      id_orden_dia: idOrden,
      estatus,
    };

    try {
      const res = await fetch("/api/ordendia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("Estatus actualizado correctamente");
        onSuccess();
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert("Error al actualizar estatus");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-6 text-center">Cambiar Estatus</h2>

        <label className="block font-semibold mb-2">Nuevo estatus:</label>
        <select
          value={estatus}
          onChange={(e) => setEstatus(e.target.value as "Terminado" | "Cancelado" | "Pendiente")}
          className="w-full border rounded p-2 mb-6"
        >
          <option value="Terminado">Terminado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Pendiente">Pendiente</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>

          <button
            onClick={handleGuardar}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambiarEstatusOrden;
