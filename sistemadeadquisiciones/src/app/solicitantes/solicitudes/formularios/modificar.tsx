"use client";
import React, { useState, useEffect } from "react";
import { updateSolicitud, getSolicitudById } from "./peticionSolicitudes";
import { getUserById } from "../../../usuarios/formularios/fetchUsuarios";

interface ModificarSolicitudProps {
  onClose: () => void;
  onSolicitudUpdated: () => void;
  idSolicitud: number;
}

const ModificarSolicitud: React.FC<ModificarSolicitudProps> = ({ onClose, onSolicitudUpdated, idSolicitud }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [folio, setFolio] = useState("");
  const [motivo, setMotivo] = useState("");
  const [monto, setMonto] = useState("");
  const [idAdjudicacion, setIdAdjudicacion] = useState("");
  const [secretaria, setSecretaria] = useState("");
  const [nombre, setNombre] = useState("");
  const [dependencia, setDependencia] = useState("");
  const [nomina, setNomina] = useState("");
  const [usuario, setUsuario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Obtener los datos de la solicitud a modificar
  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        setIsLoading(true);
        const solicitudData = await getSolicitudById(idSolicitud);
        if (solicitudData) {
          setFolio(solicitudData.folio);
          setMotivo(solicitudData.motivo);
          setMonto(solicitudData.monto.toString());
          setIdAdjudicacion(solicitudData.tipo_adquisicion.toString());
        }
      } catch (err) {
        console.error("Error al obtener la solicitud:", err);
        setError("No se pudo obtener la información de la solicitud.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitud();
  }, [idSolicitud]);

  // Obtener datos del usuario autenticado
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    if (userId) {
      getUserById(userId)
        .then((userData) => {
          if (userData) {
            setNombre(userData.nombre);
            setSecretaria(userData.nombre_s);
            setDependencia(userData.dependencia);
            setNomina(userData.nomina);
            setUsuario(userData.id_usuario);
          }
        })
        .catch((err) => {
          console.error("Error al obtener datos del usuario:", err);
          setError("No se pudo obtener la información del usuario.");
        });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "folio") setFolio(value);
    else if (name === "motivo") setMotivo(value);
    else if (name === "monto") setMonto(value);
    else if (name === "idAdjudicacion") setIdAdjudicacion(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsLoading(true);

    if (!idSolicitud || !folio || !motivo || !monto || !idAdjudicacion || !secretaria) {
      setError("Todos los campos son obligatorios.");
      setIsLoading(false);
      return;
    }

    const solicitudData = {
      idSolicitud,
      folio,
      motivo,
      monto: parseFloat(monto),
      id_adjudicacion: parseInt(idAdjudicacion),
      secretaria,
      nomina,
      usuario,
    };

    try {
      await updateSolicitud(solicitudData);

      setSuccessMessage("Solicitud actualizada correctamente");
      onSolicitudUpdated();
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
    <div>
      <h1 className="text-lg font-bold mb-4">Modificar solicitud</h1>

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Cargando...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label>Folio: <span className="text-red-500">*</span></label>
            <input type="text" name="folio" value={folio} required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange}/>
          </div>
          <div className="mb-4">
            <label>Motivo: <span className="text-red-500">*</span></label>
            <input type="text" name="motivo" value={motivo} required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange}/>
          </div>
          <div className="mb-4">
            <label>Monto: <span className="text-red-500">*</span></label>
            <input type="number" name="monto" value={monto} required className="border border-gray-300 p-2 rounded w-full" onChange={handleInputChange}/>
          </div>
          <div className="mb-4">
            <label>Tipo de adquisición: <span className="text-red-500">*</span></label>
            <select name="idAdjudicacion" value={idAdjudicacion} onChange={handleInputChange} className="w-full p-2 border rounded" required>
              <option value="">Selecciona adjudicación</option>
              <option value="1">Bienes y servicios</option>
              <option value="2">Obras públicas</option>
            </select>
          </div>
          <div className="mb-4">
            <label>Secretaría:</label>
            <input disabled type="text" value={secretaria} name="secretaria" className="border border-gray-300 p-2 rounded w-full bg-gray-100"/>
          </div>
          <div className="mb-4">
            <label>Nómina:</label>
            <input disabled type="text" value={nomina} name="nomina" className="border border-gray-300 p-2 rounded w-full bg-gray-100"/>
          </div>
        </div>

        {(successMessage || error) && (
          <div className={`p-4 mb-4 border-l-4 ${successMessage ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"}`} role="alert">
            {successMessage && <p className="font-bold">{successMessage}</p>}
            {error && <p className="font-bold">{error}</p>}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button type="submit" disabled={isLoading} className={`w-1/2 p-2 rounded ${isLoading ? "bg-gray-500" : "bg-blue-500"} text-white`}>
            {isLoading ? "Cargando..." : "Guardar Cambios"}
          </button>
          <button type="button" onClick={onClose} className="bg-red-500 text-white p-2 rounded w-1/2 hover:bg-red-600">
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModificarSolicitud;
