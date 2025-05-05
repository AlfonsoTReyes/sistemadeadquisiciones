import React, { useState, useEffect } from 'react';
import { createJustificacion } from '../../peticiones_api/peticionJustificacion';

interface JustificacionFormProps {
  onClose: () => void;
  onSubmit: () => void;
  idSolicitud: number; 

}

const FormularioJustificacion: React.FC<JustificacionFormProps> = ({ onClose, onSubmit, idSolicitud }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [usuario, setUsuario] = useState("");
  const [comentariosArchivos, setComentariosArchivos] = useState<{ [seccion: string]: string }>({});
  const [archivosPorSeccion, setArchivosPorSeccion] = useState<{ [seccion: string]: File[] }>({});
  
  
  const [formData, setFormData] = useState({
      id_solicitud: idSolicitud,
      lugar: 'SAN JUAN DEL RÍO',
      fecha_hora: new Date().toISOString().slice(0, 16), // formato compatible con datetime-local
      no_oficio: '',
      asunto: '',
      nombre_dirigido: 'LCDO. MIGUEL VALENCIA MOLINA ',
      planteamiento: '',
      antecedente: '',
      necesidad: '',
      fundamento_legal: '',
      uso: '',
      consecuencias: '',
      historicos_monetarios: '',
      marcas_especificas: '',
      estatus: 'Pendiente',
      id_usuario: ""
  });

  useEffect(() => {
    const userId = sessionStorage.getItem("userId") || "";
    setUsuario(userId);
    setFormData(prev => ({ ...prev, id_usuario: userId })); // asegúrate que también se guarda en formData
  }, []);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComentarioChange = (e: React.ChangeEvent<HTMLInputElement>, seccion: string) => {
    const { value } = e.target;
    setComentariosArchivos(prev => ({ ...prev, [seccion]: value }));
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

  const eliminarArchivo = (seccion: string, index: number) => {
    setArchivosPorSeccion(prev => {
      const nuevosArchivos = [...(prev[seccion] || [])];
      nuevosArchivos.splice(index, 1);
      return { ...prev, [seccion]: nuevosArchivos };
    });
  };
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsLoading(true);
  
    try {
      const nuevaJustificacion = await createJustificacion(formData);
      const id_justificacion = nuevaJustificacion.id_justificacion;
      for (const seccion in archivosPorSeccion) {
        const archivos = archivosPorSeccion[seccion];
        const comentario = comentariosArchivos[seccion] || "";

        for (const file of archivos) {
          const formDataFile = new FormData();
          formDataFile.append("archivo", file);
          formDataFile.append("seccion", seccion);
          formDataFile.append("id_justificacion", id_justificacion);
          formDataFile.append("id_usuario", usuario);
          formDataFile.append("comentario", comentario);

          try {
            const res = await fetch("/api/justificacion/detalle_justificacion", {
              method: "POST",
              body: formDataFile,
            });

            const data = await res.json();
            if (!data.success) {
              console.error(`Error al subir ${file.name} de la sección ${seccion}`);
            }
          } catch (err) {
            console.error(`Error en subida de ${file.name} sección ${seccion}`, err);
          }
        }
      }

  
      setSuccessMessage("Solicitud registrada correctamente");
      onSubmit(); // refresca desde el componente padre
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg md:max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Generar Justificación</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <label>Lugar
            <span className="text-red-500">*</span>
            <input name="lugar" className="border border-gray-300 p-2 rounded w-full" value={formData.lugar} onChange={handleChange} required />
          </label>

          <label>Fecha y hora
            <span className="text-red-500">*</span>
            <input type="datetime-local" name="fecha_hora" className="border border-gray-300 p-2 rounded w-full" value={formData.fecha_hora} onChange={handleChange} required />
          </label>

          <label>No. de oficio
            <span className="text-red-500">*</span>
            <input name="no_oficio" className="border border-gray-300 p-2 rounded w-full" value={formData.no_oficio} onChange={handleChange} required />
          </label>

          <label>Asunto
            <span className="text-red-500">*</span>
            <input name="asunto" className="border border-gray-300 p-2 rounded w-full" value={formData.asunto} onChange={handleChange} required />
          </label>

          <label>Nombre a quien va dirigido
            <span className="text-red-500">*</span>
            <input readOnly name="nombre_dirigido" className="border border-gray-300 p-2 rounded w-full" value={formData.nombre_dirigido} onChange={handleChange} required />
          </label>

          <label>Fundamento legal
            <span className="text-red-500">*</span>
            <textarea name="fundamento_legal" className="border border-gray-300 p-2 rounded w-full" value={formData.fundamento_legal} onChange={handleChange} required />
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
                      onClick={() => eliminarArchivo('fundamento_legal', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}

          </label>

          <label>
              Uso <span className="text-red-500">*</span>
              <textarea
                name="uso"
                className="border border-gray-300 p-2 rounded w-full"
                value={formData.uso}
                onChange={handleChange}
                required
                rows={4} 
              />
            </label>

          {/* textareas */}
          <label>Planteamiento
          <span className="text-red-500">*</span>
            <textarea name="planteamiento" className="border border-gray-300 p-2 rounded w-full" value={formData.planteamiento} onChange={handleChange} required rows={4} />
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
                      onClick={() => eliminarArchivo('planteamiento', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}

          </label>

          <label>Antecedente
            <span className="text-red-500">*</span>
            <textarea rows={4} name="antecedente" className="border border-gray-300 p-2 rounded w-full" value={formData.antecedente} onChange={handleChange} required />
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
                      onClick={() => eliminarArchivo('antecedente', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label>Necesidad
            <span className="text-red-500">*</span>
            <textarea rows={4} name="necesidad"className="border border-gray-300 p-2 rounded w-full" value={formData.necesidad} onChange={handleChange} required />
          </label>

          <label>Consecuencias
            <span className="text-red-500">*</span>
            <textarea rows={4} name="consecuencias" className="border border-gray-300 p-2 rounded w-full" value={formData.consecuencias} onChange={handleChange} required />
          </label>

          <label>Históricos monetarios
            <textarea rows={4} name="historicos_monetarios" className="border border-gray-300 p-2 rounded w-full" value={formData.historicos_monetarios} onChange={handleChange} />
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
                      onClick={() => eliminarArchivo('historicos_monetarios', index)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>

          <label>Marcas específicas (en caso de ser necesario)
            <textarea name="marcas_especificas" className="border border-gray-300 p-2 rounded w-full" value={formData.marcas_especificas} onChange={handleChange} required />
          </label>

          {/* botones */}
          <div className="col-span-1 sm:col-span-2 flex justify-center gap-4 mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded transition text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>

            <button type="button" onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
              Cancelar
            </button>
          </div>
        </form>
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded relative animate-fade-in-out">
            ✅ {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative animate-fade-in-out">
            ❌ {error}
          </div>
        )}

      </div>
    </div>
  );
};

export default FormularioJustificacion;
