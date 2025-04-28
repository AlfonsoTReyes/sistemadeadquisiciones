"use client";
import { useState, useEffect } from "react";
import { crearConcurso } from "../../peticiones_api/peticionConcurso"; 
import { fetchSolicitudesParaSelect } from "../../peticiones_api/peticionSolicitudes"; 

interface AltaConcursoProps {
  onClose: () => void;
  onCreated: () => void;
}

interface SolicitudOption {
    id_solicitud: number;
    folio: string;
    motivo: string;
  }
  

const AltaConcurso: React.FC<AltaConcursoProps> = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({
        id_solicitud: 0, // ← inicia como número, no como string
        numero_concurso: "",
        nombre_concurso: "",
        tipo_concurso: "",
        estatus_concurso: "pendiente",
        fecha_creacion: "",
        fecha_fin: "",
    });
    
      

    const [solicitudes, setSolicitudes] = useState<SolicitudOption[]>([]);

    useEffect(() => {
        const cargarSolicitudes = async () => {
        try {
            const data = await fetchSolicitudesParaSelect("concurso"); 
            setSolicitudes(data);
            console.log(data);
        } catch (error) {
            console.error("Error al cargar solicitudes:", error);
        }
        };
        cargarSolicitudes();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
          const response = await crearConcurso(form);
          console.log("Concurso creado correctamente:", response);
          onCreated();
          onClose(); // solo si sí se creó
        } catch (error) {
          console.error("Error al crear el concurso:", error);
          alert("❌ Error al crear el concurso. Inténtalo de nuevo.");
          // Aquí no cierras, porque estamos en el catch
        }
    };
      
      

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
            <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4 text-center">Nuevo Concurso</h2>

            {/* Select de Solicitudes */}
            <div className="flex flex-col">
                <label className="font-semibold mb-1">Solicitud relacionada:</label>
                <select
                    required
                    className="w-full border rounded p-2"
                    value={form.id_solicitud}
                    onChange={(e) => setForm({ ...form, id_solicitud: Number(e.target.value) })}
                    >
                    <option value="">-- Selecciona una solicitud --</option>
                    {Array.isArray(solicitudes) && solicitudes.length > 0 ? (
                        solicitudes.map((s) => (
                        <option key={s.id_solicitud} value={s.id_solicitud.toString()}>
                            {s.folio} - {s.motivo}
                        </option>
                        ))
                    ) : (
                        <option disabled>No hay solicitudes disponibles</option>
                    )}
                </select>
            </div>

            <div className="flex flex-col">
                <label className="font-semibold mb-1">Número de Concurso:</label>
                <input
                type="text"
                required
                className="w-full border rounded p-2"
                value={form.numero_concurso}
                onChange={(e) => setForm({ ...form, numero_concurso: e.target.value })}
                />
            </div>

            <div className="flex flex-col">
                <label className="font-semibold mb-1">Nombre del Concurso:</label>
                <input
                type="text"
                required
                className="w-full border rounded p-2"
                value={form.nombre_concurso}
                onChange={(e) => setForm({ ...form, nombre_concurso: e.target.value })}
                />
            </div>

            <div className="flex flex-col">
                <label className="font-semibold mb-1">Tipo de Concurso:</label>
                <input
                type="text"
                className="w-full border rounded p-2"
                value={form.tipo_concurso}
                onChange={(e) => setForm({ ...form, tipo_concurso: e.target.value })}
                />
            </div>

            <div className="flex flex-col">
                <label className="font-semibold mb-1">Fecha de Finalización:</label>
                <input
                    type="datetime-local"
                    className="w-full border rounded p-2"
                    value={form.fecha_fin}
                    onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
                />
            </div>


            {/* Select de Estatus */}
            <div className="flex flex-col">
                <label className="font-semibold mb-1">Estatus del Concurso:</label>
                <select
                required
                className="w-full border rounded p-2"
                value={form.estatus_concurso}
                onChange={(e) => setForm({ ...form, estatus_concurso: e.target.value })}
                >
                <option value="pendiente">Pendiente</option>
                <option value="en proceso">En Proceso</option>
                <option value="finalizado">Finalizado</option>
                </select>
            </div>

            <div className="flex justify-between mt-4">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Guardar
                </button>
                <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Cancelar
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default AltaConcurso;
