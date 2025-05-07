import { useEffect, useState } from "react";
import { fetchDocsPreSuficiencia, deleteDocumento} from "../peticiones_api/peticionPreSuficiencia";
import ModalEliminarDocumento from "./formularios/eliminar";

interface Documento {
  id_documento_suficiencia: number;
  nombre_original: string;
  comentario: string;
  ruta_archivo: string;
}

interface Props {
  idSuficiencia: number;
  onClose: () => void;
}

const ModalDocumentos: React.FC<Props> = ({ idSuficiencia, onClose }) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [docAEliminar, setDocAEliminar] = useState<Documento | null>(null);

  const cargarDocumentos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetchDocsPreSuficiencia(idSuficiencia);
      setDocumentos(res);
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudieron cargar los documentos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDocumentos();
  }, [idSuficiencia]);

  const confirmarEliminar = async () => {
    if (!docAEliminar) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await deleteDocumento(docAEliminar.id_documento_suficiencia);
      setDocumentos((prev) =>
        prev.filter((doc) => doc.id_documento_suficiencia !== docAEliminar.id_documento_suficiencia)
      );

      setDocAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar el documento.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Cargando documentos...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Documentos adjuntos</h2>
              <button onClick={onClose} className="text-red-500 font-bold">X</button>
            </div>

            {error ? (
              <div className="text-red-600 text-center py-4 font-semibold">{error}</div>
            ) : (
              <table className="w-full table-auto border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Comentario</th>
                    <th className="px-4 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">No hay documentos adjuntos.</td>
                    </tr>
                  ) : (
                    documentos.map((doc) => (
                      <tr key={doc.id_documento_suficiencia}>
                        <td className="border px-4 py-2">{doc.nombre_original}</td>
                        <td className="border px-4 py-2">{doc.comentario}</td>
                        <td className="border px-4 py-2 text-center space-x-2">
                          <a
                            href={`${doc.ruta_archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Visualizar
                          </a>
                          <button
                            onClick={() => setDocAEliminar(doc)}
                            className="text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {docAEliminar && (
        <ModalEliminarDocumento
          nombreDocumento={docAEliminar.nombre_original}
          onCancel={() => setDocAEliminar(null)}
          onConfirm={confirmarEliminar}
        />
      )}
    </>
  );
};

export default ModalDocumentos;
