// src/app/adminProveedores/altaproveedor/tablaProveedores.tsx
// (CON LÓGICA MEJORADA PARA MOSTRAR NOMBRE COMPLETO)

import React from 'react';
// Asegúrate que la ruta a tu interfaz sea correcta
import { ProveedorData } from './interface'; // O donde la tengas definida

interface TablaProps {
  proveedores: ProveedorData[];
  onViewDocuments: (idProveedor: number) => void;
  onChangeStatus: (idProveedor: number, currentStatus: boolean) => void;
  onChangeRevisionStatus: (idProveedor: number, nuevoEstatusRevision: string) => void;
  onEditProfile: (idProveedor: number) => void;
  onEditUser: (idProveedor: number) => void;
  isLoadingStatusChange: { [key: number]: boolean };
  isLoadingRevisionChange?: { [key: number]: boolean };
  isFetchingEditData?: boolean;
}

const formatTipoProveedor = (tipo: string | undefined | null): string => {
  if (!tipo) return 'Desconocido';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

const EstatusRevisionBadge: React.FC<{ estatus: string | null | undefined }> = ({ estatus }) => {
  const defaultText = 'No Solicitado';
  const statusText = estatus?.replace(/_/g, ' ') || defaultText;
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let borderColor = 'border-gray-300';

  switch (estatus) {
    case 'PENDIENTE_REVISION':
      bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; borderColor = 'border-yellow-300'; break;
    case 'EN_REVISION':
    case 'PENDIENTE_PAGO':
      bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; borderColor = 'border-blue-300'; break;
    case 'APROBADO':
      bgColor = 'bg-green-100'; textColor = 'text-green-800'; borderColor = 'border-green-300'; break;
      case 'REVALIDAR':
        bgColor = 'bg-blue-100'; textColor = 'text-green-800'; borderColor = 'border-green-300'; break;
    case 'RECHAZADO':
      bgColor = 'bg-red-100'; textColor = 'text-red-800'; borderColor = 'border-red-300'; break;
    case 'NO_SOLICITADO':
    default:
      break;
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}>
      {statusText}
    </span>
  );
};

// *** NUEVA FUNCIÓN AUXILIAR PARA OBTENER EL NOMBRE COMPLETO DEL PROVEEDOR ***
const getNombreCompletoProveedor = (proveedor: ProveedorData): string => {
    if (proveedor.tipo_proveedor === 'moral') {
        return proveedor.razon_social || 'Razón Social N/A';
    }
    if (proveedor.tipo_proveedor === 'fisica') {
        const nombre = proveedor.nombre_fisica || '';
        const apellidoP = proveedor.apellido_p_fisica || '';
        const apellidoM = proveedor.apellido_m_fisica || '';
        const nombreCompleto = `${nombre} ${apellidoP} ${apellidoM}`.trim();
        return nombreCompleto || 'Nombre Persona Física N/A';
    }
    // Fallback si el tipo no es moral ni fisica, o si los campos específicos no están
    // Podrías usar proveedor.nombre_display aquí si aún existe y tiene sentido
    return proveedor.nombre_display || 'Nombre Desconocido';
};


const TablaAdministradorProveedores: React.FC<TablaProps> = ({
  proveedores,
  onViewDocuments,
  onChangeStatus,
  onChangeRevisionStatus,
  onEditProfile,
  onEditUser,
  isLoadingStatusChange,
  isLoadingRevisionChange = {},
  isFetchingEditData = false
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
            console.log("Datos del proveedor para tabla:", JSON.stringify(proveedor, null, 2));
            const isLoadingGeneral = isLoadingStatusChange[proveedor.id_proveedor] ?? false;
            const isLoadingRevision = isLoadingRevisionChange[proveedor.id_proveedor] ?? false;
            const isAnyLoading = isLoadingGeneral || isLoadingRevision || isFetchingEditData;

            const nombreCompleto = getNombreCompletoProveedor(proveedor);

            return (
              <tr key={proveedor.id_proveedor} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{proveedor.rfc || 'N/A'}</td>
                <td className="px-6 py-4">{nombreCompleto}</td>
                <td className="px-6 py-4">{proveedor.correo ?? 'N/A'}</td>
                <td className="px-6 py-4">{proveedor.telefono ?? 'N/A'}</td> 
                <td className="px-6 py-4">{formatTipoProveedor(proveedor.tipo_proveedor)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${proveedor.estatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {proveedor.estatus ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <EstatusRevisionBadge estatus={proveedor.estatus_revision} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center space-x-2 flex-wrap gap-y-1">
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
                      className={`text-xs border rounded px-1 py-0.5 focus:ring-1 focus:ring-offset-0 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${proveedor.estatus_revision === 'APROBADO' ? 'bg-green-50 border-green-300 text-green-800' :
                          proveedor.estatus_revision === 'RECHAZADO' ? 'bg-red-50 border-red-300 text-red-800' :
                            proveedor.estatus_revision === 'PENDIENTE_REVISION'|| proveedor.estatus_revision === 'PENDIENTE_PAGO'|| proveedor.estatus_revision === 'REVALIDAR' || proveedor.estatus_revision === 'EN_REVISION' ? 'bg-yellow-50 border-yellow-300 text-yellow-800' :
                              'bg-gray-50 border-gray-300 text-gray-600'}`}
                      title="Cambiar Estado de Revisión"
                    >
                      <option value="NO_SOLICITADO">No Solicitado</option>
                      <option value="PENDIENTE_REVISION">Pendiente</option>
                      <option value="EN_REVISION">En Revisión</option>
                      <option value="PENDIENTE_PAGO">Proceder a Pago</option>
                      <option value="APROBADO">Aprobado</option>
                      <option value="RECHAZADO">Rechazado</option>
                      <option value="REVALIDAR">Revalidar</option>
                    </select>
                    {isLoadingRevision && <span className="text-xs text-blue-500 ml-1">...</span>}
                  </div>
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