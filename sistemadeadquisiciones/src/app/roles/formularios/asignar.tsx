import React, { useState, useEffect, useRef } from "react";
import { fetchPermisos, fetchPermisosRol, updatePermisosRol } from "./fetchRoles";

interface AsignarRolProps {
  rolId: number;
  onClose: () => void;
  onRolAsignar: () => void;
}

interface Permiso {
  id_permiso: number;
  nombre: string;
  estatus: boolean;
}

const AsignarPermiso: React.FC<AsignarRolProps> = ({ rolId, onClose, onRolAsignar }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<{ [key: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const previousPermisos = useRef<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataPermisos = await fetchPermisos();
        setPermisos(dataPermisos);

        const permisosRol = await fetchPermisosRol(rolId);
        const permisosInit = dataPermisos.reduce((acc: { [key: number]: boolean }, permiso: Permiso) => {
          const permisoAsignado = permisosRol.find((perm: { id_permiso: number }) => perm.id_permiso === permiso.id_permiso);
          acc[permiso.id_permiso] = permisoAsignado ? permisoAsignado.estatus : false;
          return acc;
        }, {});

        setPermisosSeleccionados(permisosInit);
        previousPermisos.current = permisosInit;
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchData();
  }, [rolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (Object.values(permisosSeleccionados).every((value) => value === false)) {
      setError("Debe seleccionar al menos un permiso");
      setIsLoading(false);
      return;
    }

    try {
      const permisosAActualizar = Object.entries(permisosSeleccionados)
        .map(([id_permiso, asignado]) => {
          if (asignado !== previousPermisos.current[Number(id_permiso)]) {
            return { id_permiso: Number(id_permiso), estatus: asignado };
          }
          return null;
        })
        .filter(Boolean);

      if (permisosAActualizar.length > 0) {
        await updatePermisosRol(rolId, permisosAActualizar);
        setSuccessMessage("Asignación exitosa");
        onRolAsignar();
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRadioChange = (id: number, value: boolean) => {
    setPermisosSeleccionados((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4 text-center">Asignar Permisos</h2>
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Cargando...</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Permiso</th>
                <th>Sí</th>
                <th>No</th>
              </tr>
            </thead>
            <tbody>
              {permisos.map((permiso) => (
                <tr key={permiso.id_permiso} className="permiso-row">
                  <td>{permiso.nombre}</td>
                  <td>
                    <input
                      type="radio"
                      name={`permiso-${permiso.id_permiso}`}
                      checked={permisosSeleccionados[permiso.id_permiso] === true}
                      onChange={() => handleRadioChange(permiso.id_permiso, true)}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`permiso-${permiso.id_permiso}`}
                      checked={permisosSeleccionados[permiso.id_permiso] === false}
                      onChange={() => handleRadioChange(permiso.id_permiso, false)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {successMessage && <p className="text-green-500">{successMessage}</p>}
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between mt-4">
            <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded w-1/2">
              {isLoading ? "Cargando..." : "Guardar"}
            </button>
            <button type="button" onClick={onClose} className="bg-red-500 text-white p-2 rounded w-1/2">
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AsignarPermiso;
