import React, { useState, useEffect } from 'react';
import {
  getJusitificacionById,
  updateJustificacion,
  getJustificacionDetalleBySolicitud,
} from '../../peticiones_api/peticionJustificacion';

interface ModificarJustificacionProps {
  onClose: () => void;
  onSubmit: () => void;
  idJustificacion: number;
}

const ModificarJustificacion: React.FC<ModificarJustificacionProps> = ({ onClose, onSubmit, idJustificacion }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [comentariosArchivos, setComentariosArchivos] = useState<{ [seccion: string]: string }>({});
  const [archivosPorSeccion, setArchivosPorSeccion] = useState<{ [seccion: string]: File[] }>({});
  const [formData, setFormData] = useState({
    id_solicitud: idJustificacion,
    lugar: '',
    fecha_hora: '',
    no_oficio: '',
    asunto: '',
    nombre_dirigido: '',
    planteamiento: '',
    antecedente: '',
    necesidad: '',
    fundamento_legal: '',
    uso: '',
    consecuencias: '',
    historicos_monetarios: '',
    marcas_especificas: '',
    estatus: '',
  });

  useEffect(() => {
    const fetchJustificacion = async () => {
      setIsLoading(true);
      try {
        const data = await getJusitificacionById(idJustificacion);
        const docs = await getJustificacionDetalleBySolicitud(idJustificacion);
        console.log(docs);
        setFormData({
          ...data,
          fecha_hora: new Date(data.fecha_hora).toISOString().slice(0, 16),
        });
        setDocumentos(docs || []);
      } catch (err) {
        setError("Error al cargar la justificación.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJustificacion();
  }, [idJustificacion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const eliminarDocumento = async (idDoc: number) => {
    try {
      await fetch(`/api/justificacion/detalle_justificacion?id=${idDoc}`, {
        method: 'DELETE',
      });
      setDocumentos(prev => prev.filter(doc => doc.id_doc_justificacion !== idDoc));
    } catch (err) {
      alert("Error al eliminar el documento.");
    }
  };

  const handleFileUploadMultiple = (e: React.ChangeEvent<HTMLInputElement>, seccion: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    setArchivosPorSeccion(prev => {
      const prevArchivos = prev[seccion] || [];
      return {
        ...prev,
        [seccion]: [...prevArchivos, ...Array.from(files)],
      };
    });
  };
  
  const eliminarArchivoNuevo = (seccion: string, index: number) => {
    setArchivosPorSeccion(prev => {
      const nuevosArchivos = [...(prev[seccion] || [])];
      nuevosArchivos.splice(index, 1);
      return { ...prev, [seccion]: nuevosArchivos };
    });
  };
  
  const handleComentarioChange = (e: React.ChangeEvent<HTMLInputElement>, seccion: string) => {
    const { value } = e.target;
    setComentariosArchivos(prev => ({ ...prev, [seccion]: value }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await updateJustificacion(formData);

      for (const seccion in archivosPorSeccion) {
        const archivos = archivosPorSeccion[seccion];
        const comentario = comentariosArchivos[seccion] || "";
      
        for (const file of archivos) {
          const formDataFile = new FormData();
          formDataFile.append("archivo", file);
          formDataFile.append("seccion", seccion);
          formDataFile.append("id_justificacion", idJustificacion.toString());
          formDataFile.append("id_usuario", sessionStorage.getItem("userId") || "");
          formDataFile.append("comentario", comentario);
      
          try {
            const res = await fetch("/api/justificacion/detalle_justificacion", {
              method: "POST",
              body: formDataFile,
            });
            const data = await res.json();
            if (!data.success) {
              console.error(`❌ Error al subir ${file.name} (${seccion})`);
            }
          } catch (err) {
            console.error(`❌ Error de red al subir ${file.name} (${seccion})`, err);
          }
        }
      }
      
      setSuccessMessage("Justificación actualizada correctamente.");
      onSubmit();
      setTimeout(onClose, 1000);
    } catch (err) {
      setError("Error al actualizar la justificación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Modificar Justificación</h2>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Cargando...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label>Lugar <span className="text-red-500">*</span>
            <input name="lugar" className="border p-2 rounded w-full" value={formData.lugar} onChange={handleChange} required />
          </label>

          <label>Fecha y hora <span className="text-red-500">*</span>
            <input type="datetime-local" name="fecha_hora" className="border p-2 rounded w-full" value={formData.fecha_hora} onChange={handleChange} required />
          </label>

          <label>No. de oficio <span className="text-red-500">*</span>
            <input name="no_oficio" className="border p-2 rounded w-full" value={formData.no_oficio} onChange={handleChange} required />
          </label>

          <label>Asunto <span className="text-red-500">*</span>
            <input name="asunto" className="border p-2 rounded w-full" value={formData.asunto} onChange={handleChange} required />
          </label>

          <label>Nombre a quien va dirigido
            <input readOnly name="nombre_dirigido" className="border p-2 rounded w-full" value={formData.nombre_dirigido} onChange={handleChange} required />
          </label>

          <label>Uso <span className="text-red-500">*</span>
            <input name="uso" className="border p-2 rounded w-full" value={formData.uso} onChange={handleChange} required />
          </label>

          <label>Fundamento legal <span className="text-red-500">*</span>
            <textarea name="fundamento_legal" className="border p-2 rounded w-full" value={formData.fundamento_legal} onChange={handleChange} required />
            <input
              type="text"
              placeholder="Comentario sobre el archivo"
              className="mt-1 border border-gray-300 p-1 rounded w-full text-sm"
              onChange={(e) => handleComentarioChange(e, 'fundamento_legal')}
              value={comentariosArchivos['fundamento_legal'] || ""}
            />

            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'fundamento_legal')}
            />

            {archivosPorSeccion['fundamento_legal'] && archivosPorSeccion['fundamento_legal'].length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {archivosPorSeccion['fundamento_legal'].map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 p-2 mb-1 rounded">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => eliminarArchivoNuevo('fundamento_legal', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label>Planteamiento <span className="text-red-500">*</span>
            <textarea name="planteamiento" className="border p-2 rounded w-full" value={formData.planteamiento} onChange={handleChange} required />
            <input
              type="text"
              placeholder="Comentario sobre el archivo"
              className="mt-1 border border-gray-300 p-1 rounded w-full text-sm"
              onChange={(e) => handleComentarioChange(e, 'planteamiento')}
              value={comentariosArchivos['planteamiento'] || ""}
            />

            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'planteamiento')}
            />

            {archivosPorSeccion['planteamiento'] && archivosPorSeccion['planteamiento'].length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {archivosPorSeccion['planteamiento'].map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 p-2 mb-1 rounded">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => eliminarArchivoNuevo('planteamiento', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}

          </label>

          <label>Antecedente <span className="text-red-500">*</span>
            <textarea name="antecedente" className="border p-2 rounded w-full" value={formData.antecedente} onChange={handleChange} required />
            <input
              type="text"
              placeholder="Comentario sobre el archivo"
              className="mt-1 border border-gray-300 p-1 rounded w-full text-sm"
              onChange={(e) => handleComentarioChange(e, 'antecedente')}
              value={comentariosArchivos['antecedente'] || ""}
            />

            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'antecedente')}
            />

            {archivosPorSeccion['antecedente'] && archivosPorSeccion['antecedente'].length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {archivosPorSeccion['antecedente'].map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 p-2 mb-1 rounded">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => eliminarArchivoNuevo('antecedente', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label>Necesidad <span className="text-red-500">*</span>
            <textarea name="necesidad" className="border p-2 rounded w-full" value={formData.necesidad} onChange={handleChange} required />
          </label>

          <label>Consecuencias <span className="text-red-500">*</span>
            <textarea name="consecuencias" className="border p-2 rounded w-full" value={formData.consecuencias} onChange={handleChange} required />
          </label>

          <label>Históricos monetarios 
            <textarea name="historicos_monetarios" className="border p-2 rounded w-full" value={formData.historicos_monetarios} onChange={handleChange} />
            <input
              type="text"
              placeholder="Comentario sobre el archivo"
              className="mt-1 border border-gray-300 p-1 rounded w-full text-sm"
              onChange={(e) => handleComentarioChange(e, 'historicos_monetarios')}
              value={comentariosArchivos['historicos_monetarios'] || ""}
            />

            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'historicos_monetarios')}
            />

            {archivosPorSeccion['historicos_monetarios'] && archivosPorSeccion['historicos_monetarios'].length > 0 && (
              <ul className="mt-2 text-sm text-gray-600">
                {archivosPorSeccion['historicos_monetarios'].map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-100 p-2 mb-1 rounded">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => eliminarArchivoNuevo('historicos_monetarios', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label>Marcas específicas
            <textarea name="marcas_especificas" className="border p-2 rounded w-full" value={formData.marcas_especificas} onChange={handleChange} />
          </label>

          {documentos.length > 0 && (
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-2">Documentos actuales</h3>
              {["fundamento_legal", "planteamiento", "antecedente", "historicos_monetarios"].map(seccion => {
                const docsSeccion = documentos.filter(doc => doc.seccion === seccion);
                return docsSeccion.length > 0 ? (
                  <div key={seccion} className="mb-4">
                    <p className="font-medium">{seccion.replace(/_/g, " ").toUpperCase()}:</p>
                    <ul className="list-disc pl-6">
                      {docsSeccion.map(doc => (
                        <li key={doc.id_doc_justificacion} className="flex justify-between items-center">
                           <a
                            href={`/${doc.ruta_archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {doc.nombre_original}
                          </a>
                          <button
                            type="button"
                            onClick={() => eliminarDocumento(doc.id_doc_justificacion)}
                            className="ml-4 text-sm text-red-600 hover:underline"
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {successMessage && <div className="col-span-2 text-green-600 font-semibold">{successMessage}</div>}
          {error && <div className="col-span-2 text-red-600 font-semibold">{error}</div>}

          <div className="col-span-2 flex justify-center gap-4 mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModificarJustificacion;
