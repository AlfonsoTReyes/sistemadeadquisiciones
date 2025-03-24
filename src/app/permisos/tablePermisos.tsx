'use client';
import React, { useState } from 'react';
import EliminarPermiso from './formularios/eliminar';

interface Permiso {
  id_permiso: number;
  nombre_permiso: string;
  descripcion: string;
  sistema: string;
}

interface TablaPermisosProps {
  permisos: Permiso[];
  onEdit: (id: number) => void;
  fetchPermisos: () => void;
  permissions: string[];
}

const TablaPermisos: React.FC<TablaPermisosProps> = ({ permisos, onEdit, fetchPermisos, permissions }) => {
  const [permisoAEliminar, setPermisoAEliminar] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border mt-4 table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">Id Permiso</th>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Descripción</th>
            <th className="border px-4 py-2">Sistema</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {permisos.map((permiso) => (
            <tr key={permiso.id_permiso}>
              <td className="border px-4 py-2">{permiso.id_permiso}</td>
              <td className="border px-4 py-2">{permiso.nombre_permiso}</td>
              <td className="border px-4 py-2">{permiso.descripcion}</td>
              <td className="border px-4 py-2">{permiso.sistema}</td>
              <td className="border px-4 py-2">
                {/* {permissions.includes('editar_permiso') && ( */}
                  <button onClick={() => onEdit(permiso.id_permiso)} className="text-yellow-500 hover:underline">
                    Editar
                  </button>
                {/* )} */}
                <br />
                {/* {permissions.includes('borrar_permiso') && ( */}
                  <button onClick={() => setPermisoAEliminar(permiso.id_permiso)} className="text-red-500 hover:underline">
                    Eliminar
                  </button>
                {/* )} */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mostrar modal de eliminación solo cuando haya un permiso seleccionado */}
      {permisoAEliminar !== null && (
        <EliminarPermiso
          permisoId={permisoAEliminar}
          onClose={() => setPermisoAEliminar(null)}
          fetchPermisos={fetchPermisos}
        />
      )}
    </div>
  );
};

export default TablaPermisos;
