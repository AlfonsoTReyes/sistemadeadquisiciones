"use client";
import { useState } from "react";
import { createOtroAnexo } from '../../../peticiones_api/peticionSolicitudesDetalle';


interface Props {
  idSolicitud: number;
  onClose: () => void;
  onUploadSuccess: ( ) => void;
}

const FormularioDocumento: React.FC<Props> = ({ idSolicitud, onClose, onUploadSuccess }) => {
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoDocumento || !archivo) return alert("Completa todos los campos");
    const userId = sessionStorage.getItem("userId");

    const formData = new FormData();
    formData.append("tipo_documento", tipoDocumento);
    formData.append("archivo", archivo);
    formData.append("id_solicitud", idSolicitud.toString());
    formData.append("userId", userId ?? '');

    setSubiendo(true);
    try {

      await createOtroAnexo(formData);
      
      setSuccessMessage("Documento registrado correctamente");
      onUploadSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al subir el documento.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Subir Documento Adicional</h2>
      </div>

      <label className="block">
        <span className="font-semibold">Tipo de documento</span>
        <select
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value)}
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="">Selecciona uno</option>
          <option value="dictamen">Dictamen</option>
          <option value="anexo técnico">Anexo Técnico</option>
          <option value="cotización">Cotización</option>
          <option value="otros anexos">Otro</option>
        </select>
      </label>

      <label className="block">
        <span className="font-semibold">Archivo</span>
        <input
          type="file"
          onChange={(e) => setArchivo(e.target.files?.[0] || null)}
          className="mt-1 block w-full border rounded-md p-2"
          accept=".pdf,.jpg,.png,.docx"
        />
      </label>

      {(successMessage || error) && (
        <div className={`p-4 mb-4 border-l-4 ${successMessage ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"}`} role="alert">
          {successMessage && <p className="font-bold">{successMessage}</p>}
          {error && <p className="font-bold">{error}</p>}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={subiendo}
        >
          {subiendo ? "Subiendo..." : "Subir Documento"}
        </button>
      </div>
    </form>
  );
};

export default FormularioDocumento;
