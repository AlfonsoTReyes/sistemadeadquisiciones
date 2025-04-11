import React, { useState } from "react";
import { createAdjudicaciones } from "../../peticiones_api/peticionCatalogoAdjudicaciones";

interface AltaTipoAdjudicacionProps {
  onClose: () => void;
  onGuardado: () => void;
}

const AltaTipoAdjudicacion: React.FC<AltaTipoAdjudicacionProps> = ({ onClose, onGuardado }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [montoMin, setMontoMin] = useState('');
  const [montoMax, setMontoMax] = useState('');
  const [tipoAdquisicion, setTipoAdquisicion] = useState('');
  const [estatus, setEstatus] = useState('activo');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setIsLoading(true);

    const data = {
      nombre,
      descripcion,
      monto_min: parseFloat(montoMin),
      monto_max: parseFloat(montoMax),
      tipo_adquisicion: tipoAdquisicion,
      estatus
    };

    try {
      await createAdjudicaciones(data);
      setSuccessMessage("Alta exitosa");
      onGuardado();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError("Error al registrar tipo de adjudicación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Alta de Tipo de Adjudicación</h1>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Cargando...</p>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            required
            className="border border-gray-300 p-2 rounded w-full"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label>Descripción:</label>
          <input
            type="text"
            name="descripcion"
            required
            className="border border-gray-300 p-2 rounded w-full"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div>
          <label>Monto mínimo:</label>
          <input
            type="number"
            name="monto_min"
            required
            className="border border-gray-300 p-2 rounded w-full"
            value={montoMin}
            onChange={(e) => setMontoMin(e.target.value)}
          />
        </div>
        <div>
          <label>Monto máximo:</label>
          <input
            type="number"
            name="monto_max"
            required
            className="border border-gray-300 p-2 rounded w-full"
            value={montoMax}
            onChange={(e) => setMontoMax(e.target.value)}
          />
        </div>
        <div>
          <label>Tipo de adquisición:</label>
          <select
            name="tipo_adquisicion"
            required
            className="border border-gray-300 p-2 rounded w-full"
            value={tipoAdquisicion}
            onChange={(e) => setTipoAdquisicion(e.target.value)}
          >
            <option value="">Selecciona</option>
            <option value="Bienes y servicios">Bienes y servicios</option>
            <option value="Obras públicas">Obras públicas</option>
          </select>
        </div>
        <div>
          <label>Estatus:</label>
          <select
            name="estatus"
            required
            className="border border-gray-300 p-2 rounded w-full"
            value={estatus}
            onChange={(e) => setEstatus(e.target.value)}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {(successMessage || error) && (
          <div className={`col-span-2 p-4 border-l-4 ${successMessage ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
            {successMessage && <p className="font-bold">{successMessage}</p>}
            {error && <p className="font-bold">{error}</p>}
          </div>
        )}

        <div className="col-span-2 flex justify-between mt-4">
          <button type="submit" className="w-1/2 p-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" onClick={onClose} className="w-1/2 p-2 rounded bg-red-500 text-white hover:bg-red-600">
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AltaTipoAdjudicacion;
