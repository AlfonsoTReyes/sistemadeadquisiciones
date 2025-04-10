import { useState, useEffect } from "react";
import ModalComentarios from "../comentarios_documentos/modal";
import ModalConfirmacion from "./formularios/cambiarEstatus";
import ModalRespuesta from "./formularios/altaPre";
import ModalDocumentos from "./listaDocRespuesta";

interface Suficiencia {
  id_suficiencia: number;
  oficio: string;
  asunto: string;
  lugar: string;
  fecha: string;
  hora: string;
  cuenta: string;
  cantidad: number;
  motivo: string;
  created_at: string;
  updated_at: string;
  id_solicitud: number;
  estatus: string;
  tipo: string;
  nombre_secretaria: string;
  nombre_usuario: string;
  nombre_dependencia: string;
}

const TablaPreSuficiencia: React.FC<{ 
        datos: Suficiencia[];
        onPreSufi: () => Promise<void>; 
    }> = ({ datos, onPreSufi}) => {
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
        const [tipoOrigenComentario, setTipoOrigenComentario] = useState<string>("");
        const [idOrigenComentario, setIdOrigenComentario] = useState<number | null>(null);
        const [id_sol, setSol] = useState<number | null>(null);
        const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
        const [estatusDoc, setDocEstatus] = useState<number | null>(null);
        const [tipoOrigenModal, setTipoOrigenModal] = useState<string>("");
        const [filtroEstatus, setFiltroEstatus] = useState<string>("Todos");
        const [paginaActual, setPaginaActual] = useState(1);
        const [isRespuestaModalOpen, setIsRespuestaModalOpen] = useState(false);
        const [idSuficienciaSeleccionada, setIdSuficienciaSeleccionada] = useState<number | null>(null);
        const [isModalDocsOpen, setIsModalDocsOpen] = useState(false);
        const [idDocsSuficiencia, setIdDocsSuficiencia] = useState<number | null>(null);
        const [permisos, setPermisos] = useState<string[]>([]);


        const registrosPorPagina = 10;

        const indexUltimoRegistro = paginaActual * registrosPorPagina;
        const indexPrimerRegistro = indexUltimoRegistro - registrosPorPagina;
        const datosFiltrados = datos.filter((dato) =>
            filtroEstatus === "Todos" ? true : dato.estatus === filtroEstatus
        );
        const datosPaginados = datosFiltrados.slice(indexPrimerRegistro, indexUltimoRegistro);
        const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);

        const cambiarPagina = (pagina: number) => {
            setPaginaActual(pagina);
        };

        const abrirModalDocs = (id: number) => {
            setIdDocsSuficiencia(id);
            setIsModalDocsOpen(true);
        };
          
        const cerrarModalDocs = () => {
            setIsModalDocsOpen(false);
            setIdDocsSuficiencia(null);
        };

        const abrirModalRespuesta = (id: number) => {
            setIdSuficienciaSeleccionada(id);
            setIsRespuestaModalOpen(true);
        };
          
        const cerrarModalRespuesta = () => {
            setIdSuficienciaSeleccionada(null);
            setIsRespuestaModalOpen(false);
        };          


        const openCommentsModal = (id: number, tipo: string, sol:number) => {
            setIdOrigenComentario(id);
            setTipoOrigenComentario(tipo);
            setSol(sol);
            setIsCommentsModalOpen(true);
        };
      
    const closeCommentsModal = () => {
        setIdOrigenComentario(null);
        setTipoOrigenComentario("");
        setIsCommentsModalOpen(false);
    };

    const abrirModalConfirmacion = (idDoc: number, tipoOrigen: string) => {
        setDocEstatus(idDoc);
        setTipoOrigenModal(tipoOrigen);
        setIsConfirmModalOpen(true);
    };
      
      // Cerrar modal sin hacer cambios
    const cerrarModalConfirmacion = () => {
        setIsConfirmModalOpen(false);
        setDocEstatus(null);
        setTipoOrigenModal("");
    };

    useEffect(() => {
        const storedPermisos = sessionStorage.getItem("userPermissions");
        if (storedPermisos) {
            setPermisos(JSON.parse(storedPermisos));
        }
        }, []);
    type TipoPDF = "solicitud" | "justificacion" | "presupuesto";

    const generarPDF = async (id: number, tipo: TipoPDF) => {
        try {
          if (tipo === "solicitud") {
            const { default: generarPDFSolicitud } = await import("../PDF/solicitud");
            await generarPDFSolicitud(id);
          } else if (tipo === "justificacion") {
            const { default: generarPDFJustificacion } = await import("../PDF/justificacion");
            await generarPDFJustificacion(id);
          } else if (tipo === "presupuesto") {
              const { default: generarPDFPreSuficiencia } = await import("../PDF/solicitudTecho");
              await generarPDFPreSuficiencia(id);
            }
        } catch (error) {
          console.error("error al generar el pdf:", error);
          alert("ocurrió un error al generar el pdf.");
        }
      };

    return (
        <div className="overflow-x-auto">
            <div className="mb-4">
                <label className="font-semibold mr-2">Filtrar por estatus:</label>
                <select
                    value={filtroEstatus}
                    onChange={(e) => setFiltroEstatus(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="Todos">Todos</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Rechazada">Rechazada</option>
                    <option value="Enviado para atender">Enviado para atender</option>
                    <option value="Atendido">Atendido</option>
                    {/* Agrega aquí más estatus según tu sistema */}
                </select>
            </div>

            <table className="min-w-full border mt-4 table-auto">
                <thead className="bg-yellow-600 text-white">
                    <tr>
                        <th className="px-4 py-2 text-left">Secretaría</th>
                        <th className="px-4 py-2 text-left">Oficio</th>
                        <th className="px-4 py-2 text-left">Asunto</th>
                        <th className="px-4 py-2 text-left">Fecha y hora</th>
                        <th className="px-4 py-2 text-left">Usuario</th>
                        <th className="px-4 py-2 text-left">Tipo</th>
                        <th className="px-4 py-2 text-left">Estatus</th>
                        <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datosPaginados.map((dato) => (
                        <tr key={dato.id_suficiencia}>
                            <td className="border px-4 py-2">{dato.nombre_secretaria} - {dato.nombre_dependencia}</td>
                            <td className="border px-4 py-2">{dato.oficio}</td>
                            <td className="border px-4 py-2">{dato.asunto}</td>
                            <td className="border px-4 py-2">{new Date(dato.fecha).toLocaleString()}</td>
                            <td className="border px-4 py-2">{dato.nombre_usuario}</td>
                            <td className="border px-4 py-2">{dato.tipo}</td>
                            <td className="border px-4 py-2">{dato.estatus}</td>
                            <td className="border px-4 py-2 text-center space-y-2">
                            {permisos.includes('ver_respuesta_suficiencia_fin') && (
                            <button
                                onClick={() => abrirModalDocs(dato.id_suficiencia)}
                                className="text-indigo-800 hover:underline"
                                >
                                Ver documentos
                            </button>
                            )}
                            {permisos.includes('adjuntar_respuesta_suficiencia_fin') && (

                            <button
                                onClick={() => abrirModalRespuesta(dato.id_suficiencia)}
                                className="text-blue-800 hover:underline"
                                >
                                Adjuntar respuesta
                            </button>
                            )}

                            <br></br>
                            {permisos.includes('cambiar_estatus_suficiencia_adquisicion') && (
                            <button
                                onClick={() =>
                                    abrirModalConfirmacion(dato.id_suficiencia, "aquisicion")
                                }
                                className="text-green-800 hover:underline"
                                >
                                Actualizar estatus
                            </button>
                            )}
                            <br></br>
                            {permisos.includes('generar_pdf_sufiencia_adquisicion') && (
                            <button
                                onClick={() => generarPDF(dato.id_suficiencia, "presupuesto")}
                                className="text-red-800 hover:underline"
                                >
                                Generar pdf
                            </button>
                            )}
                            <br></br>
                            {permisos.includes('ver_comentarios_suficiencia_adquisicion') && (
                            <button
                                key={dato.id_suficiencia}
                                onClick={() => openCommentsModal(dato.id_suficiencia, "adquisicion", dato.id_suficiencia)}
                                className="text-purple-800 hover:underline"
                            >
                                Ver Comentarios
                            </button>
                            )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 flex justify-center items-center space-x-2">
                <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Anterior
                </button>

                {Array.from({ length: totalPaginas }, (_, index) => (
                    <button
                    key={index + 1}
                    onClick={() => cambiarPagina(index + 1)}
                    className={`px-3 py-1 rounded ${
                        paginaActual === index + 1 ? 'bg-yellow-600 text-white' : 'bg-gray-200'
                    }`}
                    >
                    {index + 1}
                    </button>
                ))}

                <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>


            {isCommentsModalOpen && idOrigenComentario !== null && id_sol !== null && (
                <ModalComentarios
                    idSol={id_sol}
                    idOrigen={idOrigenComentario}
                    tipoOrigen={tipoOrigenComentario}
                    onClose={closeCommentsModal}
                />
            )}
            
            {isConfirmModalOpen && estatusDoc !== null && tipoOrigenModal !== null && (
                <ModalConfirmacion
                    idDoc={estatusDoc}
                    tipoOrigen={tipoOrigenModal}
                    onClose={cerrarModalConfirmacion}
                    onUpdateSuccess={onPreSufi}
                />
            )}
            {isRespuestaModalOpen && idSuficienciaSeleccionada !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-4">
                    <ModalRespuesta
                        idSuficiencia={idSuficienciaSeleccionada}
                        onClose={cerrarModalRespuesta}
                        onSuccess={onPreSufi}
                    />
                    </div>
                </div>
            )}

            {isModalDocsOpen && idDocsSuficiencia !== null && (
                <ModalDocumentos 
                    idSuficiencia={idDocsSuficiencia} 
                    onClose={cerrarModalDocs}
                />
            )}



        </div>
    );
};

export default TablaPreSuficiencia;
