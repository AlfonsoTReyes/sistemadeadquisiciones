"use client";
import React, { useState, useEffect } from "react";
import { getUserById } from "../../peticiones_api/fetchUsuarios";
import { getSoliPreById, updateSoliPre } from "../../peticiones_api/peticionPreSuficiencia";

interface ModificarPreSuficienciaProps {
  onClose: () => void;
  onUpdate: () => void;
  idSolicitud: number;
}

const ModificarPreSuficiencia: React.FC<ModificarPreSuficienciaProps> = ({ onClose, onUpdate, idSolicitud }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [oficio, setOficio] = useState("");
  const [asunto, setAsunto] = useState("");
  const [lugar, setLugar] = useState("San Juan del Río, Querétaro");
  const [fecha, setFecha] = useState("");
  const [cuenta, setCuenta] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [idSecretaria, setIdSecretaria] = useState("");
  const [idDependencia, setIdDependencia] = useState("");
  const [idUsuario, setIdUsuario] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // cargar datos de la suficiencia
  useEffect(() => {
    const fetchSuficiencia = async () => {
      setIsLoading(true);
      try {
        const data = await getSoliPreById(idSolicitud);
        if (data) {
            setOficio(data.oficio);
            setAsunto(data.asunto);
            setLugar(data.lugar);
            const fechaObj = new Date(data.fecha);
            const fechaLocal = fechaObj.toISOString().split("T")[0]; // yyyy-mm-dd
            setFecha(fechaLocal);
            setCuenta(data.cuenta);
            setCantidad(data.cantidad.toString());
            setMotivo(data.motivo);
        }
      } catch (err) {
        setError("Error al obtener los datos de la suficiencia.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuficiencia();
  }, [idSolicitud]);

  // cargar datos del usuario
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      getUserById(userId)
        .then((userData) => {
          if (userData) {
            setIdSecretaria(userData.id_secretaria);
            setIdDependencia(userData.id_dependencia);
            setIdUsuario(userData.id_usuario);
          }
        })
        .catch(() => setError("No se pudo obtener la información del usuario."));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "oficio": setOficio(value); break;
      case "asunto": setAsunto(value); break;
      case "lugar": setLugar(value); break;
      case "fecha": setFecha(value); break;
      case "cuenta": setCuenta(value); break;
      case "cantidad": setCantidad(value); break;
      case "motivo": setMotivo(value); break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsLoading(true);

    const data = {
        id_suficiencia: idSolicitud,
        id_usuario: idUsuario,
        oficio,
        asunto,
        lugar,
        fecha,
        cuenta,
        cantidad: parseFloat(cantidad),
        motivo
    };

    try {
      await updateSoliPre(data);
      setSuccessMessage("Suficiencia actualizada correctamente.");
      onUpdate();
      setTimeout(onClose, 1000);
    } catch (err) {
      setError("Error al actualizar la suficiencia.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h1 className="text-lg font-bold mb-4">Modificar suficiencia #{idSolicitud}</h1>

        {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                <div className="flex flex-col items-center">
                    <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                    <p className="mt-2 text-white">Cargando...</p>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="mb-4 col-span-2">
            <label htmlFor="oficio" className="block font-medium mb-1">Número de oficio:</label>
            <input type="text" name="oficio" id="oficio" value={oficio} onChange={handleInputChange} className="border p-2 rounded w-full" required />
        </div>

        <div className="mb-4 col-span-2">
        <label htmlFor="asunto" className="block font-medium mb-1">Asunto:</label>
        <input type="text" name="asunto" id="asunto" value={asunto} onChange={handleInputChange} className="border p-2 rounded w-full" required />
        </div>

        <div className="mb-4">
        <label htmlFor="fecha" className="block font-medium mb-1">Fecha:</label>
        <input type="date" name="fecha" id="fecha" value={fecha} onChange={handleInputChange} className="border p-2 rounded w-full" required />
        </div>

        <div className="mb-4 col-span-2">
        <label htmlFor="lugar" className="block font-medium mb-1">Lugar:</label>
        <input type="text" name="lugar" id="lugar" value={lugar} onChange={handleInputChange} className="border p-2 rounded w-full" required />
        </div>

        <div className="mb-4">
        <label htmlFor="cuenta" className="block font-medium mb-1">Cuenta:</label>
        <input type="text" name="cuenta" id="cuenta" value={cuenta} onChange={handleInputChange} className="border p-2 rounded w-full" required />
        </div>

        <div className="mb-4">
        <label htmlFor="cantidad" className="block font-medium mb-1">Cantidad:</label>
        <input type="number" name="cantidad" id="cantidad" value={cantidad} onChange={handleInputChange} className="border p-2 rounded w-full" required />
        </div>

        <div className="mb-4 col-span-2">
        <label htmlFor="motivo" className="block font-medium mb-1">Motivo:</label>
        <textarea name="motivo" id="motivo" value={motivo} onChange={handleInputChange} className="border p-2 rounded w-full h-20" placeholder="Motivo" required></textarea>
        </div>

          {(successMessage || error) && (
            <div className={`col-span-2 p-4 border-l-4 ${successMessage ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"}`}>
              {successMessage || error}
            </div>
          )}

          <div className="col-span-2 flex justify-between mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              Guardar cambios
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

export default ModificarPreSuficiencia;
