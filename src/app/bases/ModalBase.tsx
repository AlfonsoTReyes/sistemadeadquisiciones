// Componente: ModalBases.tsx
"use client";
import { useState, useEffect } from "react";
import clsx from "clsx";
import AltaBases from "./formularios/alta";
import ModificarBases from "./formularios/modificar";
import { getBasesByConcurso, fetchSecretarias } from '../peticiones_api/peticionBases';
import ModalEstatusConcurso from "./formularios/estatus";


interface ModalBasesProps {
  idConcurso: number;
  idSolicitud: number;
  onClose: () => void;
  onBasesUpdated: () => void;
}

const ModalBases: React.FC<ModalBasesProps> = ({ idConcurso, idSolicitud, onClose, onBasesUpdated }) => {
  const [basesExistentes, setBasesExistentes] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [mostrarModalEstatus, setMostrarModalEstatus] = useState(false);
  const [nuevoEstatus, setNuevoEstatus] = useState<string>(basesExistentes?.estatus_bases || "");
  

  const renderEstatus = (estatus: string) => {
    const statusClass = clsx(
      "inline-block px-3 py-1 rounded-full text-sm font-semibold",
      {
        "bg-green-100 text-green-700": ["Publicado", "Terminado"].includes(estatus),
        "bg-red-100 text-red-700": ["Pendiente", "Sin publicar", "Borrador"].includes(estatus),
        "bg-gray-100 text-gray-700": !["Publicado", "Terminado", "Pendiente", "Sin publicar", "Borrador"].includes(estatus),
      }
    );
  
    return <span className={statusClass}>{estatus}</span>;
  };
  

  const fetchBases = async () => {
    try {
      const data = await getBasesByConcurso(idConcurso);
      setBasesExistentes(data || null);
    } catch (error) {
      console.error("Error cargando bases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [basesData, secretariasData] = await Promise.all([
          getBasesByConcurso(idConcurso),
          fetchSecretarias()
        ]);
  
        setBasesExistentes(basesData || null);
        setSecretarias(secretariasData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAll();
  }, [idConcurso]);
  

  const handleModificar = () => {
    setIsEditing(true);
  };

//   const handleGenerarPdf = () => {
//     if (basesExistentes) {
//       generarPdfBases(basesExistentes); // 🔥 Función que debes tener para PDF
//     }
//   };

  const handleActualizarBases = () => {
    fetchBases();
    setIsEditing(false);
    onBasesUpdated(); // Actualizamos concursos si es necesario
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-8 rounded shadow-lg">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
        >
          ✖️
        </button>

        {/* Si está en modo editar */}
        {!basesExistentes ? (
          // Si no hay bases, renderizar AltaBases
          <AltaBases
            idConcurso={idConcurso}
            idSolicitud={idSolicitud}
            onClose={onClose}
            onBasesAdded={handleActualizarBases}
          />
        ) : isEditing ? (
          // Si hay bases y estamos editando, renderizar ModificacionBases
          <ModificarBases
            idBases={basesExistentes.id_bases}
            idSolicitud={idSolicitud}
            onClose={onClose}
            onBasesModified={handleActualizarBases}
          />

        ) : (
          <>
            {/* Mostrar datos de bases existentes */}
            <h1 className="text-2xl font-bold mb-4 text-center">Bases Existentes</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 bg-white p-6 rounded-lg shadow border border-gray-200">

              <div className="col-span-full">
                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Información General</h2>
              </div>

              <div><span className="text-gray-500 font-medium">Número Procedimiento:</span> <p>{basesExistentes.numero_procedimiento}</p></div>
              <div><span className="text-gray-500 font-medium">Título Contratación:</span> <p>{basesExistentes.titulo_contratacion}</p></div>
              <div><span className="text-gray-500 font-medium">Departamento Convocante:</span> <p>{secretarias.find(sec => sec.id_secretaria === basesExistentes.id_secretaria_convocante)?.nombre || "Desconocido"}</p></div>
              <div><span className="text-gray-500 font-medium">Departamento Solicitante:</span> <p>{secretarias.find(sec => sec.id_secretaria === basesExistentes.id_secretaria_solicitante)?.nombre || "Desconocido"}</p></div>
              <div><span className="text-gray-500 font-medium">Descripción del Programa:</span> <p>{basesExistentes.descripcion_programa}</p></div>
              <div><span className="text-gray-500 font-medium">Ejercicio Fiscal:</span> <p>{basesExistentes.ejercicio_fiscal}</p></div>
              <div><span className="text-gray-500 font-medium">Fuente de Recurso:</span> <p>{basesExistentes.fuente_recurso}</p></div>
              <div><span className="text-gray-500 font-medium">Fecha Elaboración:</span> <p>{basesExistentes.fecha_elaboracion_bases}</p></div>
              <div><span className="text-gray-500 font-medium">Lugar Actos:</span> <p>{basesExistentes.lugar_actos_predeterminado}</p></div>
              <div><span className="text-gray-500 font-medium">Monto Mínimo Contrato:</span> <p>${basesExistentes.monto_minimo_contrato?.toLocaleString()}</p></div>
              <div><span className="text-gray-500 font-medium">Monto Máximo Contrato:</span> <p>${basesExistentes.monto_maximo_contrato?.toLocaleString()}</p></div>
              <div><span className="text-gray-500 font-medium">Costo Bases:</span> <p>{basesExistentes.costo_bases_descripcion} (${basesExistentes.costo_bases_valor_mn})</p></div>
              <div><span className="text-gray-500 font-medium">Requiere Inscripción al Padrón:</span> <p>{basesExistentes.requiere_inscripcion_padron ? "Sí" : "No"}</p></div>
              <div><span className="text-gray-500 font-medium">Fecha Límite Inscripción:</span> <p>{basesExistentes.fecha_limite_inscripcion_padron}</p></div>
              <div><span className="text-gray-500 font-medium">Idioma Documentación:</span> <p>{basesExistentes.idioma_documentacion}</p></div>
              <div><span className="text-gray-500 font-medium">Vigencia Propuesta:</span> <p>{basesExistentes.periodo_vigencia_propuesta_dias} días</p></div>
              <div><span className="text-gray-500 font-medium">Plazo Máximo de Entrega:</span> <p>{basesExistentes.plazo_maximo_entrega_dias} días</p></div>
              <div><span className="text-gray-500 font-medium">Plazo de Pago:</span> <p>{basesExistentes.plazo_pago_dias} días</p></div>
              <div><span className="text-gray-500 font-medium">Aplica Anticipo:</span> <p>{basesExistentes.aplica_anticipo ? "Sí" : "No"}</p></div>
              <div><span className="text-gray-500 font-medium">Permite Subcontratación:</span> <p>{basesExistentes.permite_subcontratacion ? "Sí" : "No"}</p></div>
              <div><span className="text-gray-500 font-medium">Contacto Aclaraciones:</span> <p>{basesExistentes.contacto_aclaraciones_email}</p></div>
              <div><span className="text-gray-500 font-medium">Estatus:</span> <p>{renderEstatus(basesExistentes.estatus_bases)}</p></div>
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <button
                onClick={handleModificar}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Modificar Bases
              </button>

              <button
                onClick={() => setMostrarModalEstatus(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Cambiar Estatus
              </button>


              <button
                
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Generar PDF
              </button>
            </div>
          </>
        )}

      </div>
      {mostrarModalEstatus && (
        <ModalEstatusConcurso
          idBases={basesExistentes.id_bases}
          estatusActual={basesExistentes.estatus_bases}
          onClose={() => setMostrarModalEstatus(false)}
          onUpdated={handleActualizarBases}
        />
      )}

    </div>
  );
};

export default ModalBases;
