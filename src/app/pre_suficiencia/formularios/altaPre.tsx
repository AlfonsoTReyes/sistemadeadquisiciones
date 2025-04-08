"use client";
import { useState } from "react";
import { createRespuesta } from "../../peticiones_api/peticionPreSuficiencia";

interface Props {
  idSuficiencia: number;
  onClose: () => void;
  onSuccess: () => void;
}

const FormularioDocumento: React.FC<Props> = ({ idSuficiencia, onClose, onSuccess }) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [comentario, setComentario] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = sessionStorage.getItem("userId");

    if (!archivo) {
        alert("Debes seleccionar un archivo");
        return;
    }
      
    if (archivo.type !== "application/pdf") {
        alert("Solo se permite subir archivos PDF.");
        return;
    }
      
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("comentario", comentario);
    formData.append("id_solicitud", idSuficiencia.toString());
    formData.append("userId", userId ?? "");

    setSubiendo(true);
    try {
      await createRespuesta(formData);

      setSuccessMessage("Documento registrado correctamente");
      onSuccess();

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
                <h2 className="text-xl font-bold">Subir Pre suficiencia</h2>
            </div>

            <label className="block">
                <span className="font-semibold">Archivo</span>
                <input
                    type="file"
                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                    className="mt-1 block w-full border rounded-md p-2"
                    accept=".pdf,application/pdf" // ✅ solo PDFs
                />
                </label>


            <label className="block">
                <span className="font-semibold">Comentario</span>
                <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                className="mt-1 block w-full border rounded-md p-2 resize-none"
                placeholder="Escribe un comentario (opcional)"
                />
            </label>

            {(successMessage || error) && (
                <div
                className={`p-4 mb-4 border-l-4 ${
                    successMessage
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-red-100 border-red-500 text-red-700"
                }`}
                role="alert"
                >
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
