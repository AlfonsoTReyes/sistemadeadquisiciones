// --- componentes/proveedores/TablaDocumentosProveedor.tsx ---
import React from 'react';
import { DocumentoProveedor } from './interfaces'; // Asegúrate que la interfaz esté accesible

interface TablaDocumentosProveedorProps {
  documentos: DocumentoProveedor[];
  isLoading: boolean;
}

const TablaDocumentosProveedor: React.FC<TablaDocumentosProveedorProps> = ({ documentos, isLoading }) => {

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-4">
            <div className="loader border-t-4 border-blue-500 rounded-full w-8 h-8 animate-spin mr-2"></div>
            <span>Cargando documentos...</span>
        </div>
    );
  }

  if (!documentos || documentos.length === 0) {
    return <p className="text-gray-500 italic text-center my-4">No hay documentos registrados para este proveedor.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre Original
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo Documento
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Subida
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estatus
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documentos.map((doc) => (
            <tr key={doc.id_documento_proveedor} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                 {/* Asume que la ruta es relativa a /public */}
                 <a href={`/${doc.ruta_archivo}`} target="_blank" rel="noopener noreferrer" title={`Ver ${doc.nombre_original}`}>
                   {doc.nombre_original}
                 </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {doc.tipo_documento}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(doc.created_at).toLocaleDateString()} {/* Ajusta formato si es necesario */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                 {/* Puedes añadir lógica para mostrar colores según el estatus */}
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    doc.estatus === 'aprobado' ? 'bg-green-100 text-green-800' :
                    doc.estatus === 'rechazado' ? 'bg-red-100 text-red-800' :
                    doc.estatus === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800' // Default
                }`}>
                    {doc.estatus || 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaDocumentosProveedor;