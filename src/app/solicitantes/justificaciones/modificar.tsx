import React, { useState, useEffect } from 'react';
import { getJusitificacionById, updateJustificacion } from '../../peticiones_api/peticionJustificacion';

interface ModificarJustificacionProps {
  onClose: () => void;
  onSubmit: () => void;
  idJustificacion: number;
}

const ModificarJustificacion: React.FC<ModificarJustificacionProps> = ({ onClose, onSubmit, idJustificacion }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
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
    estatus: ''
  });
  

  useEffect(() => {
    const fetchJustificacion = async () => {
      setIsLoading(true);
      try {
        const data = await getJusitificacionById(idJustificacion);
        console.log(data);
        if (data) {
          setFormData({
            ...data,
            fecha_hora: new Date(data.fecha_hora).toISOString().slice(0, 16),
          });
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await updateJustificacion(formData);
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
          {/* Inputs y textareas */}
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
          </label>

          <label>Planteamiento <span className="text-red-500">*</span>
            <textarea name="planteamiento" className="border p-2 rounded w-full" value={formData.planteamiento} onChange={handleChange} required />
          </label>

          <label>Antecedente <span className="text-red-500">*</span>
            <textarea name="antecedente" className="border p-2 rounded w-full" value={formData.antecedente} onChange={handleChange} required />
          </label>

          <label>Necesidad <span className="text-red-500">*</span>
            <textarea name="necesidad" className="border p-2 rounded w-full" value={formData.necesidad} onChange={handleChange} required />
          </label>

          <label>Consecuencias <span className="text-red-500">*</span>
            <textarea name="consecuencias" className="border p-2 rounded w-full" value={formData.consecuencias} onChange={handleChange} required />
          </label>

          <label>Históricos monetarios <span className="text-red-500">*</span>
            <textarea name="historicos_monetarios" className="border p-2 rounded w-full" value={formData.historicos_monetarios} onChange={handleChange} required />
          </label>

          <label>Marcas específicas
            <textarea name="marcas_especificas" className="border p-2 rounded w-full" value={formData.marcas_especificas} onChange={handleChange} />
          </label>

          {/* Mensajes */}
          {successMessage && <div className="col-span-2 text-green-600 font-semibold">{successMessage}</div>}
          {error && <div className="col-span-2 text-red-600 font-semibold">{error}</div>}

          {/* Botones */}
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
