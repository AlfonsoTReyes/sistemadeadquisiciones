"use client";
import React, { useState, useEffect } from "react";
import { createSoliPreSuficiencia } from "../../peticiones_api/peticionPreSuficiencia";
import { getUserById } from "../../peticiones_api/fetchUsuarios";

interface AltaSuficienciaProps {
    onClose: () => void;
    onSubmit: () => void;
    idSolicitud: number; 
    tipo: "Pre-suficiencia" | "Suficiencia";
  }

const AltaSuficiencia: React.FC<AltaSuficienciaProps> = ({ onClose, onSubmit, idSolicitud, tipo  }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [oficio, setOficio] = useState("");
  const [asunto, setAsunto] = useState("");
  const [lugar, setLugar] = useState("San Juan del Río, Querétaro");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [hora, setHora] = useState(new Date().toTimeString().split(" ")[0]);
  const [cuenta, setCuenta] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [idSecretaria, setIdSecretaria] = useState("");
  const [idDependencia, setIdDependencia] = useState("");
  const [idUsuario, setIdUsuario] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

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
        .catch(() => {
          setError("No se pudo obtener la información del usuario.");
        });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "oficio") setOficio(value);
    else if (name === "asunto") setAsunto(value);
    else if (name === "lugar") setLugar(value);
    else if (name === "fecha") setFecha(value);
    else if (name === "hora") setHora(value);
    else if (name === "cuenta") setCuenta(value);
    else if (name === "cantidad") setCantidad(value);
    else if (name === "motivo") setMotivo(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsLoading(true);

    if (!oficio || !asunto || !lugar || !fecha || !hora || !cuenta || !cantidad || !motivo || !idSolicitud) {
      setError("Todos los campos son obligatorios.");
      setIsLoading(false);
      return;
    }


    const suficienciaData = {
      id_secretaria: idSecretaria,
      id_dependencia: idDependencia,
      id_usuario: idUsuario,
      oficio,
      asunto,
      lugar,
      fecha,
      hora,
      cuenta,
      cantidad: parseFloat(cantidad),
      motivo,
      id_solicitud: idSolicitud,
      tipo
    };


    try {
      await createSoliPreSuficiencia(suficienciaData);
      setSuccessMessage("Suficiencia registrada correctamente.");
      onSubmit();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg md:max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        <h1 className="text-lg font-bold mb-4">Alta de Solicitud de Suficiencia {idSolicitud}</h1>

        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Cargando...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-4">
            <div className="mb-4 col-span-2">
                <label>Número de oficio: <span className="text-red-500">*</span></label>
                <input type="text" name="oficio" value={oficio} required className="border p-2 rounded w-full" onChange={handleInputChange} />
            </div>

            <div className="mb-4 col-span-2">
                <label>Asunto: <span className="text-red-500">*</span></label>
                <input type="text" name="asunto" value={asunto} required className="border p-2 rounded w-full" onChange={handleInputChange} />
            </div>

            <div className="mb-4">
                <label>Fecha: <span className="text-red-500">*</span></label>
                <input readOnly type="date" name="fecha" value={fecha} required className="border p-2 rounded w-full" onChange={handleInputChange} />
            </div>

            <div className="mb-4">
                <label>Hora: <span className="text-red-500">*</span></label>
                <input readOnly type="time" name="hora" value={hora} required className="border p-2 rounded w-full" onChange={handleInputChange} />
            </div>

            <div className="mb-4 col-span-2">
                <label>Lugar: <span className="text-red-500">*</span></label>
                <input type="text" name="lugar" value={lugar} required className="border p-2 rounded w-full" onChange={handleInputChange} />
            </div>

            <div className="mb-4">
                <label>Cuenta: <span className="text-red-500">*</span></label>
                <input type="text" name="cuenta" value={cuenta} required className="border p-2 rounded w-full" onChange={handleInputChange} />
            </div>

            <div className="mb-4">
                <label>Cantidad: <span className="text-red-500">*</span></label>
                <input type="number" name="cantidad" value={cantidad} required className="border p-2 rounded w-full" onChange={handleInputChange} />
            </div>

            <div className="mb-4 col-span-2">
                <label>Motivo: <span className="text-red-500">*</span></label>
                <textarea name="motivo" value={motivo} required className="border p-2 rounded w-full h-20" onChange={handleInputChange}></textarea>
            </div>

            {(successMessage || error) && (
                <div className={`p-4 mb-4 border-l-4 ${successMessage ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"}`} role="alert">
                    {successMessage && <p className="font-bold">{successMessage}</p>}
                    {error && <p className="font-bold">{error}</p>}
                </div>
            )}

            <div className="col-span-2 flex justify-between mt-4">
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

export default AltaSuficiencia;
