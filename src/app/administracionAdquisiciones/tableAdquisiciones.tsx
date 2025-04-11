'use client';
import { useState } from 'react';
import ModificarTipoAdjudicacion from './formularios/modificacion';

interface Tipo {
  id_tipo_adjudicacion: number;
  nombre: string;
  descripcion: string;
  monto_min: number;
  monto_max: number;
  tipo_adquisicion: string;
  estatus: boolean;
  created_at: string;
  updated_at: string;
}

interface TablaProps {
  datos: Tipo[];
  onActualizar: () => void;
}

const TablaAdjudicaciones: React.FC<TablaProps> = ({ datos, onActualizar }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);

  const openEditModal = (id: number) => {
    setIdSeleccionado(id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setIdSeleccionado(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border mt-4 table-auto">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Descripción</th>
            <th className="border px-4 py-2">Monto Mínimo</th>
            <th className="border px-4 py-2">Monto Máximo</th>
            <th className="border px-4 py-2">Tipo</th>
            <th className="border px-4 py-2">Estatus</th>
            <th className="border px-4 py-2">Última actualización</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((item) => (
            <tr key={item.id_tipo_adjudicacion}>
              <td className="border px-4 py-2">{item.nombre}</td>
              <td className="border px-4 py-2">{item.descripcion}</td>
              <td className="border px-4 py-2">${item.monto_min}</td>
              <td className="border px-4 py-2">${item.monto_max}</td>
              <td className="border px-4 py-2">{item.tipo_adquisicion}</td>
              <td className="border px-4 py-2">{item.estatus}</td>
              <td className="border px-4 py-2">{new Date(item.updated_at).toLocaleString()}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openEditModal(item.id_tipo_adjudicacion)}
                  className="text-yellow-700 hover:underline"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditModalOpen && idSeleccionado !== null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ModificarTipoAdjudicacion id={idSeleccionado} onClose={closeEditModal} onGuardado={onActualizar} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaAdjudicaciones;
