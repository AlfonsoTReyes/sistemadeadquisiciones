"use client";
import { useEffect, useState } from "react";
import { getOrdenDiaById } from "../../peticiones_api/peticionOrdenDia";
import { getUsers } from "../../peticiones_api/fetchUsuarios";
import { guardarActaSesion } from "../../peticiones_api/peticionActaSesion";
import { fetchAdjudicacionesById, fetchAdjudicacionesByTipoAdq } from "../../peticiones_api/peticionCatalogoAdjudicaciones";

interface ModalActaSesionProps {
  idOrden: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalActaSesion: React.FC<ModalActaSesionProps> = ({ idOrden, onClose, onSuccess }) => {
    const [orden, setOrden] = useState<any>(null);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [horaCierre, setHoraCierre] = useState("");
    const [asuntosGenerales, setAsuntosGenerales] = useState("");
    const [puntos, setPuntos] = useState<string[]>([]);
    const [nuevoPunto, setNuevoPunto] = useState("");
    const [fechaSesion, setFechaSesion] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [idAdjudicacion, setIdAdjudicacion] = useState<number | null>(null);
    const [adjudicacionInfo, setAdjudicacionInfo] = useState<any>(null);
    const [listaAdjudicaciones, setListaAdjudicaciones] = useState<any[]>([]);

    const [base, setBase] = useState<number[]>([]);
    const [invitados, setInvitados] = useState<number[]>([]);
    const [requirente, setRequirente] = useState<number[]>([]);

    useEffect(() => {
        const cargarDatos = async () => {
            const [usuariosData, ordenData] = await Promise.all([
                getUsers(),
                getOrdenDiaById(idOrden)
            ]);
            setUsuarios(usuariosData || []);
            setOrden(ordenData);
            setPuntos(ordenData.puntos_tratar || []);
            setFechaSesion(ordenData.fecha_inicio.split("T")[0]);
            setHoraInicio(ordenData.hora);
            
            const asistentes = ordenData.participantes || [];

            setBase(
                asistentes
                .filter((p: any) => p.tipo_usuario === "base")
                .map((p: any) => p.id_usuario)
            );

            setInvitados(
                asistentes
                .filter((p: any) => p.tipo_usuario === "invitado")
                .map((p: any) => p.id_usuario)
            );

            setRequirente(
                asistentes
                .filter((p: any) => p.tipo_usuario === "requirente")
                .map((p: any) => p.id_usuario)
            );
            const idAdj = ordenData?.id_adjudicacion;
            if (idAdj) {
            setIdAdjudicacion(idAdj);
            const adj = await fetchAdjudicacionesById(idAdj); 
            setAdjudicacionInfo(adj);

            const lista = await fetchAdjudicacionesByTipoAdq(adj.tipo_adquisicion);
            setListaAdjudicaciones(lista);
            }
        };

        cargarDatos();
    }, [idOrden]);

    const handleGuardar = async () => {
        const asistentes = [
        ...base.map(id => ({
            id_usuario: id,
            tipo_asistente: "base",
            firma: null,
            confirmado: false
        })),
        ...invitados.map(id => ({
            id_usuario: id,
            tipo_asistente: "invitado",
            firma: null,
            confirmado: false
        })),
        ...requirente.map(id => ({
            id_usuario: id,
            tipo_asistente: "requirente",
            firma: null,
            confirmado: false
        })),
        ];

        const datos = {
        id_orden_dia: idOrden,
        fecha_sesion: orden.fecha_inicio.split("T")[0],
        hora_inicio: orden.hora,
        hora_cierre: horaCierre,
        puntos_tratados: puntos,
        asuntos_generales: asuntosGenerales,
        estatus: "Pendiente",
        asistentes,
        };

        try {
        console.log("🔹 Datos del acta:", datos);
        await guardarActaSesion(datos);
        onSuccess();
        } catch (error) {
        console.error("❌ Error al guardar el acta:", error);
        alert("No se pudo guardar el acta.");
        }
    };

    if (!orden) return null;

    const renderSelectUsuarios = (
        label: string,
        usuariosIds: number[],
        setUsuariosIds: (ids: number[]) => void
    ) => (
        <>
        <label className="block font-semibold mt-4 mb-1">{label}</label>
        <select
            className="w-full border p-2 rounded"
            onChange={(e) => {
            const id = parseInt(e.target.value);
            if (!usuariosIds.includes(id)) setUsuariosIds([...usuariosIds, id]);
            }}
            defaultValue=""
        >
            <option value="">Selecciona un usuario</option>
            {usuarios.map(u => (
            <option key={u.id_usuario} value={u.id_usuario}>
                {`${u.nombre_u} ${u.nombre_s} - ${u.puesto}`}
            </option>
            ))}
        </select>

        <ul className="mt-1">
            {usuariosIds.map(id => {
            const u = usuarios.find(u => u.id_usuario === id);
            return (
                <li key={id} className="flex justify-between items-center border-b py-1">
                {u ? `${u.nombre_u} ${u.nombre_s} - ${u.puesto}` : `Usuario ${id}`}
                <button
                    onClick={() => setUsuariosIds(usuariosIds.filter(i => i !== id))}
                    className="text-red-500"
                >
                    ✕
                </button>
                </li>
            );
            })}
        </ul>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-md w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Crear Acta de Sesión</h2>

            {/* Fecha y horas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block font-semibold mb-1">Fecha de sesión</label>
                    <input
                    type="date"
                    value={fechaSesion}
                    onChange={(e) => setFechaSesion(e.target.value)}
                    className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Hora de inicio</label>
                    <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Hora de cierre</label>
                    <input
                    type="time"
                    value={horaCierre}
                    onChange={(e) => setHoraCierre(e.target.value)}
                    className="w-full border p-2 rounded"
                    />
                </div>
            </div>


            {/* Asuntos generales */}
            <div className="mt-4">
            <label className="block font-semibold mb-1">Asuntos generales</label>
            <textarea
                className="w-full border p-2 rounded"
                rows={3}
                value={asuntosGenerales}
                onChange={(e) => setAsuntosGenerales(e.target.value)}
            />
            </div>

            {/* Puntos tratados */}
            <div className="mt-4">
            <label className="block font-semibold mb-1">Puntos tratados</label>
            <div className="flex gap-2 mb-2">
                <input
                value={nuevoPunto}
                onChange={(e) => setNuevoPunto(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Nuevo punto"
                />
                <button
                onClick={() => {
                    if (nuevoPunto.trim()) {
                    setPuntos([...puntos, nuevoPunto.trim()]);
                    setNuevoPunto("");
                    }
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded"
                >
                Agregar
                </button>
            </div>
            <ul>
                {puntos.map((p, i) => (
                <li key={i} className="flex justify-between items-center border-b py-1">
                    {p}
                    <button onClick={() => setPuntos(puntos.filter((_, idx) => idx !== i))} className="text-red-500">✕</button>
                </li>
                ))}
            </ul>
            </div>

            {/* Sección asistentes */}
            <hr className="my-4" />
            {renderSelectUsuarios("Asistentes base", base, setBase)}
            {renderSelectUsuarios("Asistentes invitados", invitados, setInvitados)}
            {renderSelectUsuarios("Asistentes área requirente", requirente, setRequirente)}

            {listaAdjudicaciones.length > 0 && (
                <div className="mt-4">
                    <label className="font-semibold block mb-1">Otras adjudicaciones del mismo tipo</label>
                    <select className="w-full border rounded p-2">
                    {listaAdjudicaciones.map((adj) => (
                        <option key={adj.id_tipo_adjudicacion} value={adj.id_tipo_adjudicacion}>
                        {adj.nombre} - ${adj.monto_min} a ${adj.monto_max}
                        </option>
                    ))}
                    </select>
                </div>
            )}


            {/* Botones */}
            <div className="flex justify-end mt-6 gap-4">
            <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancelar
            </button>
            <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded">
                Guardar acta
            </button>
            </div>
        </div>
        </div>
    );
};

export default ModalActaSesion;
