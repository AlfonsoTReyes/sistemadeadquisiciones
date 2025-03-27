import React, { useState } from 'react';
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
      estatus: 'pendiente'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

  const handleFileUploadMultiple = async (e: React.ChangeEvent<HTMLInputElement>, seccion: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    const idSolicitud = '123'; // ← pon aquí el id real
    const idUsuario = '1';     // ← el id del usuario actual
  
    for (const file of Array.from(files)) {
      const formDataFile = new FormData();
      formDataFile.append('archivo', file);
      formDataFile.append('seccion', seccion);
      formDataFile.append('id_solicitud', idSolicitud);
      formDataFile.append('id_usuario', idUsuario);
  
      try {
        const res = await fetch('/php/subir_archivo_justificacion.php', {
          method: 'POST',
          body: formDataFile,
        });
  
        const data = await res.json();
        if (!data.success) {
          console.error(`Error al subir ${file.name}`);
        }
      } catch (err) {
        console.error(`Error en subida de ${file.name}`, err);
      }
    }
  
    alert("Todos los archivos se han subido");
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsLoading(true);
  
    try {
      await createJustificacion(formData);
  
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
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'fundamento_legal')}
            />
          </label>

          <label>Uso
            <span className="text-red-500">*</span>
            <input name="uso" className="border border-gray-300 p-2 rounded w-full" value={formData.uso} onChange={handleChange} required />
          </label>

          {/* textareas */}
          <label>Planteamiento
          <span className="text-red-500">*</span>
            <textarea name="planteamiento" className="border border-gray-300 p-2 rounded w-full" value={formData.planteamiento} onChange={handleChange} required />
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'planteamiento')}
            />
          </label>

          <label>Antecedente
            <span className="text-red-500">*</span>
            <textarea name="antecedente" className="border border-gray-300 p-2 rounded w-full" value={formData.antecedente} onChange={handleChange} required />
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'antecedente')}
            />
          </label>

          <label>Necesidad
            <span className="text-red-500">*</span>
            <textarea name="necesidad"className="border border-gray-300 p-2 rounded w-full" value={formData.necesidad} onChange={handleChange} required />
          </label>

          <label>Consecuencias
            <span className="text-red-500">*</span>
            <textarea name="consecuencias" className="border border-gray-300 p-2 rounded w-full" value={formData.consecuencias} onChange={handleChange} required />
          </label>

          <label>Históricos monetarios
            <span className="text-red-500">*</span>
            <textarea name="historicos_monetarios" className="border border-gray-300 p-2 rounded w-full" value={formData.historicos_monetarios} onChange={handleChange} required />
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.doc,.docx"
              onChange={(e) => handleFileUploadMultiple(e, 'historicos_monetarios')}
            />
          </label>

          <label>Marcas específicas (en caso de ser necesario)
            <textarea name="marcas_especificas" className="border border-gray-300 p-2 rounded w-full" value={formData.marcas_especificas} onChange={handleChange} required />
          </label>

          {/* botones */}
          <div className="col-span-1 sm:col-span-2 flex justify-center gap-4 mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default FormularioJustificacion;
