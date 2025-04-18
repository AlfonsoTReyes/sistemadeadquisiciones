import React from 'react';
// Asegúrate que la ruta a tu interfaz sea correcta
import { ProveedorData } from './interface'; // O donde la tengas definida

interface TablaProps {
  proveedores: ProveedorData[]; // Usar interfaz específica de lista si es diferente
  onViewDocuments: (idProveedor: number) => void;
  onChangeStatus: (idProveedor: number, currentStatus: boolean) => void; // Estatus general (activo/inactivo)
  onChangeRevisionStatus: (idProveedor: number, nuevoEstatusRevision: string) => void;
  onEditProfile: (idProveedor: number) => void;
  onEditUser: (idProveedor: number) => void;
  isLoadingStatusChange: { [key: number]: boolean }; // Para estatus general
  isLoadingRevisionChange?: { [key: number]: boolean }; // Opcional si no quieres feedback detallado
  isFetchingEditData?: boolean; // Para deshabilitar botones mientras se carga data para modal
}

// Función auxiliar para capitalizar el tipo (sin cambios)
const formatTipoProveedor = (tipo: string | undefined | null): string => {
    if (!tipo) return 'Desconocido';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}
//Función auxiliar para dar formato y color al estatus de revisión ---
const EstatusRevisionBadge: React.FC<{ estatus: string | null | undefined }> = ({ estatus }) => {
  const defaultText = 'No Solicitado';
  const statusText = estatus?.replace(/_/g, ' ') || defaultText;
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let borderColor = 'border-gray-300'; // Opcional: añadir borde

  switch (estatus) {
      case 'PENDIENTE_REVISION':
          bgColor = 'bg-yellow-100';
          textColor = 'text-yellow-800';
          borderColor = 'border-yellow-300';
          break;
      case 'EN_REVISION':
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-800';
          borderColor = 'border-blue-300';
          break;
      case 'APROBADO':
          bgColor = 'bg-green-100';
          textColor = 'text-green-800';
          borderColor = 'border-green-300';
          break;
      case 'RECHAZADO':
          bgColor = 'bg-red-100';
          textColor = 'text-red-800';
          borderColor = 'border-red-300';
          break;
      case 'NO_SOLICITADO':
      default:
           // Usar los colores por defecto
           break;
  }

  return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}>
          {statusText}
      </span>
  );
};

const TablaAdministradorProveedores: React.FC<TablaProps> = ({
  proveedores,
  onViewDocuments,
  onChangeStatus,
  onChangeRevisionStatus, // <-- Recibir nueva prop
  onEditProfile,
  onEditUser,
  isLoadingStatusChange,
  isLoadingRevisionChange = {}, // <-- Recibir nuevo estado (con default)
  isFetchingEditData = false // <-- Recibir estado de carga general modal (con default)
}) => {
  if (!proveedores || proveedores.length === 0) {
    return <p className="text-center text-gray-500 mt-4">No hay proveedores para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg mt-4">
      <table className="w-full text-sm text-left text-gray-500 ">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
        <tr>
            <th scope="col" className="px-6 py-3">RFC</th>
            <th scope="col" className="px-6 py-3">Nombre / Razón Social</th>
            <th scope="col" className="px-6 py-3">Correo</th>
            <th scope="col" className="px-6 py-3">Teléfono</th>
            <th scope="col" className="px-6 py-3">Tipo</th>
            <th scope="col" className="px-6 py-3">Estatus (General)</th>
            <th scope="col" className="px-6 py-3">Estatus Revisión</th>
            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((proveedor) => {
             const isLoadingGeneral = isLoadingStatusChange[proveedor.id_proveedor] ?? false;
             const isLoadingRevision = isLoadingRevisionChange[proveedor.id_proveedor] ?? false;
             const isAnyLoading = isLoadingGeneral || isLoadingRevision || isFetchingEditData;

             return (
              // --- CORRECCIÓN: Sin espacios/saltos extra entre <td> ---
              <tr key={proveedor.id_proveedor} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{proveedor.rfc}</td>
                <td className="px-6 py-4">{proveedor.nombre_display ?? 'N/A'}</td>
                <td className="px-6 py-4">{proveedor.correo ?? 'N/A'}</td>
                <td className="px-6 py-4">{proveedor.telefono ?? 'N/A'}</td>
                <td className="px-6 py-4">{formatTipoProveedor(proveedor.tipo_proveedor)}</td>
                <td className="px-6 py-4">{/* Estatus General Badge */}
                   <span className={`px-2 py-1 rounded text-xs font-medium ${proveedor.estatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                     {proveedor.estatus ? 'Activo' : 'Inactivo'}
                   </span>
                </td>
                <td className="px-6 py-4">{/* Estatus Revisión Badge */}
                    <EstatusRevisionBadge estatus={proveedor.estatus_revision} />
                </td>
                <td className="px-6 py-4 text-center">{/* Celda Acciones */}
                  <div className="flex justify-center items-center space-x-2 flex-wrap gap-y-1">
                      {/* ... Botones (Documentos, Perfil, Usuario, Activar/Desac, Select Revisión) ... */}
                      <button onClick={() => onViewDocuments(proveedor.id_proveedor)} className="text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-xs px-1" disabled={isAnyLoading} title="Ver Documentos">Doc</button>
                      <button onClick={() => onEditProfile(proveedor.id_proveedor)} className="text-indigo-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-xs px-1" disabled={isAnyLoading} title="Editar Perfil Proveedor">Perfil</button>
                      <button onClick={() => onEditUser(proveedor.id_proveedor)} className="text-purple-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-xs px-1" disabled={isAnyLoading} title="Editar Usuario Asociado">Usuario</button>
                      <button onClick={() => onChangeStatus(proveedor.id_proveedor, !!proveedor.estatus)} className={`font-medium ${proveedor.estatus ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'} disabled:opacity-50 disabled:cursor-not-allowed text-xs px-1`} disabled={isAnyLoading} title={proveedor.estatus ? 'Desactivar Proveedor' : 'Activar Proveedor'}>
                           {isLoadingGeneral ? '...' : (proveedor.estatus ? 'Desac' : 'Activar')}
                      </button>
                      <select
                        value={proveedor.estatus_revision || 'NO_SOLICITADO'}
                        onChange={(e) => onChangeRevisionStatus(proveedor.id_proveedor, e.target.value)}
                        disabled={isAnyLoading}
                        className={`text-xs border rounded px-1 py-0.5 focus:ring-1 focus:ring-offset-0 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            proveedor.estatus_revision === 'APROBADO' ? 'bg-green-50 border-green-300 text-green-800' :
                            proveedor.estatus_revision === 'RECHAZADO' ? 'bg-red-50 border-red-300 text-red-800' :
                            proveedor.estatus_revision === 'PENDIENTE_REVISION' || proveedor.estatus_revision === 'EN_REVISION' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
                            'bg-gray-50 border-gray-300 text-gray-600'}`}
                        title="Cambiar Estado de Revisión"
                     >
                          <option value="NO_SOLICITADO">No Solicitado</option>
                          <option value="PENDIENTE_REVISION">Pendiente</option>
                          <option value="EN_REVISION">En Revisión</option>
                          <option value="APROBADO">Aprobado</option>
                          <option value="RECHAZADO">Rechazado</option>
                      </select>
                      {isLoadingRevision && <span className="text-xs text-blue-500 ml-1">...</span>}
                  </div>
                </td>
              </tr>
              // --- FIN CORRECCIÓN TBODY ---
             )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAdministradorProveedores;