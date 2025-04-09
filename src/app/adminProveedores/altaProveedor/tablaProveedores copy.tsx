import React from 'react';
// Asegúrate que la ruta a tu interfaz sea correcta
import { ProveedorData } from './interface'; // O donde la tengas definida

interface TablaProps {
  proveedores: ProveedorData[];
  onViewDocuments: (id: number) => void; // <-- DESCOMENTAR esta prop
  onChangeStatus: (id: number, currentStatus: boolean) => void;
  isLoadingStatusChange: { [key: number]: boolean };
}

// Función auxiliar para capitalizar el tipo (sin cambios)
const formatTipoProveedor = (tipo: string | undefined | null): string => {
    if (!tipo) return 'Desconocido';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

const TablaAdministradorProveedores: React.FC<TablaProps> = ({
  proveedores,
  onViewDocuments, // <-- Recibir la prop
  onChangeStatus,
  isLoadingStatusChange
}) => {
  if (!proveedores || proveedores.length === 0) {
    return <p className="text-center text-gray-500 mt-4">No hay proveedores para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg mt-4">
      <table className="w-full text-sm text-left text-gray-500 ">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
          <tr>
            <th scope="col" className="px-6 py-3">
              RFC
            </th>
            <th scope="col" className="px-6 py-3">
              Correo Electrónico
            </th>
            {/* Añadir Columna Teléfono (si la necesitas - asegúrate que 'telefono' exista en ProveedorData) */}
            <th scope="col" className="px-6 py-3">
              Teléfono
            </th>
            <th scope="col" className="px-6 py-3">
              Tipo
            </th>
            <th scope="col" className="px-6 py-3">
              Estatus
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Opciones
            </th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => {
             const isLoading = isLoadingStatusChange[proveedor.id_proveedor] ?? false;
             const tipoProveedorDisplay = formatTipoProveedor(proveedor.tipo_proveedor);

             return (
              <tr key={proveedor.id_proveedor} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {proveedor.rfc}
                </td>
                <td className="px-6 py-4">
                  {proveedor.correo ?? 'N/A'}
                </td>
                 {/* Añadir Celda Teléfono (si la necesitas) */}
                <td className="px-6 py-4">
                  {proveedor.telefono ?? 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {tipoProveedorDisplay}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    proveedor.estatus
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {proveedor.estatus ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  {/* --- BOTÓN DOCUMENTOS HABILITADO --- */}
                  <button
                    onClick={() => onViewDocuments(proveedor.id_proveedor)} // Llama a la función del padre
                    className="font-medium text-blue-600 hover:underline disabled:opacity-50"
                    disabled={isLoading} // Deshabilitar si se está cambiando estado
                    aria-label={`Ver documentos del proveedor ${proveedor.rfc}`}
                    title="Ver Documentos" // Tooltip
                  >
                    Documentos
                  </button>
                  {/* --- FIN BOTÓN DOCUMENTOS --- */}

                  {/* Botón Cambiar Estatus (sin cambios) */}
                  <button
                    onClick={() => onChangeStatus(proveedor.id_proveedor, proveedor.estatus)}
                    className={`font-medium ${
                      proveedor.estatus ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'
                    } disabled:opacity-50`}
                    disabled={isLoading}
                    aria-label={`${proveedor.estatus ? 'Desactivar' : 'Activar'} proveedor ${proveedor.rfc}`}
                  >
                    {isLoading ? 'Cambiando...' : (proveedor.estatus ? 'Desactivar' : 'Activar')}
                  </button>
                </td>
              </tr>
             )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAdministradorProveedores;