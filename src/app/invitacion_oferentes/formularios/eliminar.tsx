"use client";

import { eliminarInvitacionComite } from "../../peticiones_api/peticionInvitacion";

interface ModalEliminarProps {
  idConcurso: number;
  usuario: { nombre: string; tipo: string; id_usuario: number };
  onClose: () => void;
  onSuccess: () => void;
}

const ModalEliminarInvitacion: React.FC<ModalEliminarProps> = ({ idConcurso, usuario, onClose, onSuccess }) => {
  const handleEliminar = async () => {
    try {
      await eliminarInvitacionComite(usuario.id_usuario, idConcurso);
      onSuccess();
    } catch (error) {
      console.error("Error al eliminar invitación:", error);
      alert("Error al eliminar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <h3 className="text-lg font-bold mb-4">¿Eliminar invitación?</h3>
        <p className="mb-4">
          ¿Estás seguro de que deseas eliminar a  <strong>{usuario.nombre}</strong> ({usuario.tipo}) de esta invitación?
        </p>
        <div className="flex justify-end gap-3">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancelar</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleEliminar}>Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarInvitacion;
