import React, { useState } from 'react';

interface JustificacionFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const FormularioJustificacion: React.FC<JustificacionFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
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
    estatus: 'pendiente'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
            <input name="nombre_dirigido" className="border border-gray-300 p-2 rounded w-full" value={formData.nombre_dirigido} onChange={handleChange} required />
          </label>

          <label>Fundamento legal
            <span className="text-red-500">*</span>
            <input name="fundamento_legal" className="border border-gray-300 p-2 rounded w-full" value={formData.fundamento_legal} onChange={handleChange} required />
          </label>

          <label>Uso
            <span className="text-red-500">*</span>
            <input name="uso" className="border border-gray-300 p-2 rounded w-full" value={formData.uso} onChange={handleChange} required />
          </label>

          <label>
            <span className="font-semibold mb-1">Estatus</span>
            <input name="estatus" className="border border-gray-300 p-2 rounded w-full" value={formData.estatus} disabled />
          </label>

          {/* textareas */}
          <label>
            <span className="font-semibold mb-1">Planteamiento</span>
            <textarea name="planteamiento" className="border border-gray-300 p-2 rounded w-full" value={formData.planteamiento} onChange={handleChange} required />
          </label>

          <label>
            <span className="font-semibold mb-1">Antecedente</span>
            <textarea name="antecedente" className="border border-gray-300 p-2 rounded w-full" value={formData.antecedente} onChange={handleChange} required />
          </label>

          <label>
            <span className="font-semibold mb-1">Necesidad</span>
            <textarea name="necesidad"className="border border-gray-300 p-2 rounded w-full" value={formData.necesidad} onChange={handleChange} required />
          </label>

          <label>
            <span className="font-semibold mb-1">Consecuencias</span>
            <textarea name="consecuencias" className="border border-gray-300 p-2 rounded w-full" value={formData.consecuencias} onChange={handleChange} required />
          </label>

          <label>
            <span>Históricos monetarios</span>
            <textarea name="historicos_monetarios" className="border border-gray-300 p-2 rounded w-full" value={formData.historicos_monetarios} onChange={handleChange} required />
          </label>

          <label>
            <span className="font-semibold mb-1">Marcas específicas</span>
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
