"use client";
import { useEffect, useState } from "react";
import {
  fetchJustificacionBySolicitud,
  createComentario,
} from "../peticiones_api/peticionComentarioDocumentos"; // Importamos las peticiones

interface Comentario {
  id_comentario: number;
  comentario: string;
  id_usuario: number;
  nombre_usuario: string;
  respuesta_a: number | null;
  created_at: string;
}

interface ModalComentariosProps {
  idOrigen: number;
  tipoOrigen: string;
  idSol: number;
  onClose: () => void;
}

const ModalComentarios: React.FC<ModalComentariosProps> = ({
  idOrigen,
  tipoOrigen,
  idSol,
  onClose,
}) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState<string>("");
  const [respuestaA, setRespuestaA] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchComentarios = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchJustificacionBySolicitud(idOrigen, tipoOrigen);
        setComentarios(data);
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
        setErrorMessage(
          "Error al obtener los comentarios. Inténtalo más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComentarios();
  }, [idOrigen, tipoOrigen]);

  // 🔥 Enviar nuevo comentario o respuesta
  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      alert("El comentario no puede estar vacío");
      return;
    }

    // Obtener el ID del usuario desde sessionStorage
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("No se encontró el usuario. Por favor, inicia sesión.");
      return;
    }

    // Convierte el id del usuario a número
    const idUsuario = parseInt(userId);

    // Enviar comentario usando la API
    const nuevoComentarioEnviado = await createComentario(
      idOrigen,
      tipoOrigen,
      nuevoComentario,
      respuestaA,
      idUsuario,
      idSol
    );

    if (!nuevoComentarioEnviado) {
      alert("Error al enviar comentario.");
      return;
    }

    // Actualizar la lista de comentarios
    setComentarios((prev) => [...prev, nuevoComentarioEnviado]);
    setNuevoComentario("");
    setRespuestaA(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-700">
          📝 Comentarios
        </h2>

        {/* Loader para mostrar mientras carga */}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Cargando comentarios...</p>
          </div>
        )}

        {/* Mostrar mensaje de error si falla la carga */}
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        {/* Lista de comentarios */}
        <div className="max-h-96 overflow-y-auto space-y-4 mb-4">
          {!isLoading && !errorMessage && comentarios.length === 0 && (
            <p className="text-gray-500 text-center">No hay comentarios disponibles.</p>
          )}

          {!isLoading &&
            comentarios.map((c) => (
              <div
                key={c.id_comentario}
                className={`p-4 rounded-lg ${
                  c.respuesta_a
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-gray-100"
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {c.nombre_usuario}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-2 text-gray-800">{c.comentario}</p>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setRespuestaA(c.id_comentario)}
                    className="text-blue-500 text-xs hover:text-blue-700"
                  >
                    ↪️ Responder
                  </button>
                  {c.respuesta_a && (
                    <span className="text-xs text-gray-400">Respuesta</span>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Campo para nuevo comentario */}
        <div className="mb-4">
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder={
              respuestaA
                ? "Respondiendo a un comentario..."
                : "Escribe un nuevo comentario..."
            }
            className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <div className="flex justify-between items-center">
            {respuestaA && (
              <button
                onClick={() => setRespuestaA(null)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                ❌ Cancelar respuesta
              </button>
            )}
            <button
              onClick={enviarComentario}
              className="bg-blue-500 text-white py-2 px-6 rounded-xl shadow-md hover:bg-blue-600 transition duration-300"
            >
              ➡️ Enviar
            </button>
          </div>
        </div>

        {/* Botón para cerrar modal */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white py-2 px-6 rounded-xl hover:bg-gray-500 transition duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalComentarios;
