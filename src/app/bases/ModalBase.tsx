// Componente: ModalBases.tsx
"use client";
import { useState, useEffect } from "react";
import AltaBases from "./formularios/alta";
import ModificarBases from "./formularios/modificar";
import { getBasesByConcurso, fetchSecretarias } from '../peticiones_api/peticionBases';

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

            <div className="space-y-2">
              <p><strong>Número Procedimiento:</strong> {basesExistentes.numero_procedimiento}</p>
              <p><strong>Título Contratación:</strong> {basesExistentes.titulo_contratacion}</p>
              <p>
                <strong>Departamento Convocante:</strong>{" "}
                {
                  secretarias.find(sec => sec.id_secretaria === basesExistentes.id_secretaria_convocante)?.nombre || 
                  "Desconocido"
                }
              </p>
              <p>
                <strong>Departamento Solicitante:</strong>{" "}
                {
                  secretarias.find(sec => sec.id_secretaria === basesExistentes.id_secretaria_solicitante)?.nombre || 
                  "Desconocido"
                }
              </p>
              <p><strong>Descripción del Programa:</strong> {basesExistentes.descripcion_programa}</p>
              <p><strong>Ejercicio Fiscal:</strong> {basesExistentes.ejercicio_fiscal}</p>
              <p><strong>Fuente de Recurso:</strong> {basesExistentes.fuente_recurso}</p>
              <p><strong>Fecha Elaboración:</strong> {basesExistentes.fecha_elaboracion_bases}</p>
              <p><strong>Lugar Actos:</strong> {basesExistentes.lugar_actos_predeterminado}</p>
              <p><strong>Monto Mínimo Contrato:</strong> ${basesExistentes.monto_minimo_contrato?.toLocaleString()}</p>
              <p><strong>Monto Máximo Contrato:</strong> ${basesExistentes.monto_maximo_contrato?.toLocaleString()}</p>
              <p><strong>Costo Bases:</strong> {basesExistentes.costo_bases_descripcion} (${basesExistentes.costo_bases_valor_mn})</p>
              <p><strong>Requiere Inscripción al Padrón:</strong> {basesExistentes.requiere_inscripcion_padron ? 'Sí' : 'No'}</p>
              <p><strong>Fecha Límite Inscripción:</strong> {basesExistentes.fecha_limite_inscripcion_padron}</p>
              <p><strong>Idioma Documentación:</strong> {basesExistentes.idioma_documentacion}</p>
              <p><strong>Vigencia Propuesta:</strong> {basesExistentes.periodo_vigencia_propuesta_dias} días</p>
              <p><strong>Plazo Máximo de Entrega:</strong> {basesExistentes.plazo_maximo_entrega_dias} días</p>
              <p><strong>Plazo de Pago:</strong> {basesExistentes.plazo_pago_dias} días</p>
              <p><strong>Aplica Anticipo:</strong> {basesExistentes.aplica_anticipo ? 'Sí' : 'No'}</p>
              <p><strong>Permite Subcontratación:</strong> {basesExistentes.permite_subcontratacion ? 'Sí' : 'No'}</p>
              <p><strong>Contacto Aclaraciones:</strong> {basesExistentes.contacto_aclaraciones_email}</p>
              <p><strong>Estatus:</strong> {basesExistentes.estatus_bases}</p>
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
                onClick={() => alert("Aquí abrirías el modal para cambiar estatus")}
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
    </div>
  );
};

export default ModalBases;
