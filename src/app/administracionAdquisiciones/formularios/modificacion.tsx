import React, { useState, useEffect } from 'react';
import { fetchAdjudicacionesById, updateAdjudicaciones } from '../../peticiones_api/peticionCatalogoAdjudicaciones';

interface Props {
  id: number;
  onClose: () => void;
  onGuardado: () => void;
}

const ModificarTipoAdjudicacion: React.FC<Props> = ({ id, onClose, onGuardado }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [tipoAdquisicion, setTipoAdquisicion] = useState('');
  const [estatus, setEstatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAdjudicacionesById(id);
        setNombre(data.nombre);
        setDescripcion(data.descripcion);
        setMontoMin(data.monto_min.toString());
        setMontoMax(data.monto_max.toString());
        setTipoAdquisicion(data.tipo_adquisicion);
        setEstatus(data.estatus);
      } catch (err) {
        setError('Error al obtener los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    const data = {
      id_tipo_adjudicacion: id,
      nombre,
      descripcion,
      monto_min: parseFloat(montoMin),
      monto_max: parseFloat(montoMax),
      tipo_adquisicion: tipoAdquisicion,
      estatus
    };

    try {
      await updateAdjudicaciones(data);
      setSuccessMessage("Modificación exitosa");
      onGuardado();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError("Error al modificar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4 text-center">Modificar Tipo de Adjudicación</h2>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Cargando...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label>Descripción:</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label>Monto mínimo:</label>
              <input
                type="number"
                value={montoMin}
                onChange={(e) => setMontoMin(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label>Monto máximo:</label>
              <input
                type="number"
                value={montoMax}
                onChange={(e) => setMontoMax(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label>Tipo de adquisición:</label>
              <select
                value={tipoAdquisicion}
                onChange={(e) => setTipoAdquisicion(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Selecciona</option>
                <option value="Bienes y servicios">Bienes y servicios</option>
                <option value="Obras públicas">Obras públicas</option>
              </select>
            </div>
            <div>
              <label>Estatus:</label>
              <select
                value={estatus}
                onChange={(e) => setEstatus(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {(successMessage || error) && (
            <div className={`p-4 mb-4 border-l-4 ${successMessage ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`} role="alert">
              {successMessage && <p className="font-bold">{successMessage}</p>}
              {error && <p className="font-bold">{error}</p>}
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-1/2 p-2 rounded ${isLoading ? 'bg-gray-500' : 'bg-blue-500'} text-white`}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 p-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModificarTipoAdjudicacion;
