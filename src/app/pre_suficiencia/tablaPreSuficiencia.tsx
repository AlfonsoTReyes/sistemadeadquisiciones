import { useState } from "react";
import ModalComentarios from "../comentarios_documentos/modal";
import ModalConfirmacion from "./formularios/cambiarEstatus";

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
            <table className="min-w-full border mt-4 table-auto">
                <thead className="bg-yellow-600 text-white">
                    <tr>
                        <th className="px-4 py-2 text-left">Secretaría</th>
                        <th className="px-4 py-2 text-left">Oficio</th>
                        <th className="px-4 py-2 text-left">Asunto</th>
                        <th className="px-4 py-2 text-left">Fecha y hora</th>
                        <th className="px-4 py-2 text-left">Usuario</th>
                        <th className="px-4 py-2 text-left">Estatus</th>

                        <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datos.map((dato) => (
                        <tr key={dato.id_suficiencia}>
                            <td className="border px-4 py-2">{dato.nombre_secretaria} - {dato.nombre_dependencia}</td>
                            <td className="border px-4 py-2">{dato.oficio}</td>
                            <td className="border px-4 py-2">{dato.asunto}</td>
                            <td className="border px-4 py-2">{new Date(dato.fecha).toLocaleString()}</td>
                            <td className="border px-4 py-2">{dato.nombre_usuario}</td>
                            <td className="border px-4 py-2">{dato.estatus}</td>
                            <td className="border px-4 py-2 text-center space-y-2">
                            <button className="text-blue-800 hover:underline">
                                Adjuntar respuesta
                            </button>
                            <br></br>
                            <button
                                onClick={() =>
                                    abrirModalConfirmacion(dato.id_suficiencia, "suficiencia")
                                }
                                className="text-green-800 hover:underline"
                                >
                                Actualizar estatus
                            </button>
                            <br></br>
                            <button
                                onClick={() => generarPDF(dato.id_suficiencia, "presupuesto")}
                                className="text-red-800 hover:underline"
                                >
                                Generar pdf
                            </button>
                            <br></br>
                            <button
                                key={dato.id_suficiencia}
                                onClick={() => openCommentsModal(dato.id_suficiencia, "adquisicion", dato.id_suficiencia)}
                                className="text-purple-800 hover:underline"
                            >
                                Ver Comentarios
                            </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
        </div>
    );
};

export default TablaPreSuficiencia;
