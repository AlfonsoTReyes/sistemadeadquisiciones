// Componente: AltaBases.tsx
"use client";
import React, { useState, useEffect } from "react";
import { createBases, fetchSecretarias } from '../../peticiones_api/peticionBases';
import { getSolicitudById } from '../../peticiones_api/peticionSolicitudes';
import { getConcursoById } from '../../peticiones_api/peticionConcurso';

interface Departamento {
  id_secretaria: number;
  nombre: string;
}

interface AltaBasesProps {
  idConcurso: number;
  idSolicitud: number;
  onClose: () => void;
  onBasesAdded: () => void;
}

const AltaBases: React.FC<AltaBasesProps> = ({ idConcurso, idSolicitud, onClose, onBasesAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [numeroProcedimiento, setNumeroProcedimiento] = useState("");
  const [tituloContratacion, setTituloContratacion] = useState("");
  const [descripcionPrograma, setDescripcionPrograma] = useState("");
  const [idDepartamentoConvocante, setIdDepartamentoConvocante] = useState<number | string>("");
  const [idDepartamentoSolicitante, setIdDepartamentoSolicitante] = useState<number | string>("");
  const [ejercicioFiscal, setEjercicioFiscal] = useState<number>(new Date().getFullYear());
  const [fuenteRecurso, setFuenteRecurso] = useState("Recurso Propio"); // Valor común
  const [fechaElaboracionBases, setFechaElaboracionBases] = useState(new Date().toISOString().split("T")[0]);
  const [lugarActosPredeterminado, setLugarActosPredeterminado] = useState("Sala de juntas del Centro Cívico (Planta Alta), ubicada en Blvd. Paso de los Guzmán #24, Barrio de la Concepción del Municipio de San Juan del Río, Querétaro"); // Valor común
  const [montoMinimoContrato, setMontoMinimoContrato] = useState<string>("");
  const [montoMaximoContrato, setMontoMaximoContrato] = useState<string>("");
  const [costoBasesDescripcion, setCostoBasesDescripcion] = useState("");
  const [costoBaseUMA, setCostoBaseUMA] = useState("");
  const [costoBasesValorMn, setCostoBasesValorMn] = useState<string>("");
  const [plazoModificacionBasesDias, setPlazoModificacionBasesDias] = useState<number>(5);
  const [requiereInscripcionPadron, setRequiereInscripcionPadron] = useState<string>("true"); // 'true' o 'false' como string para el select
  const [fechaLimiteInscripcionPadron, setFechaLimiteInscripcionPadron] = useState("Previo a la Junta de Aclaraciones");
  const [idiomaDocumentacion, setIdiomaDocumentacion] = useState("Español");
  const [periodoVigenciaPropuestaDias, setPeriodoVigenciaPropuestaDias] = useState<number>(90);
  const [plazoMaximoEntregaDias, setPlazoMaximoEntregaDias] = useState<string>("");
  const [plazoPagoDias, setPlazoPagoDias] = useState<number>(30);
  const [aplicaAnticipo, setAplicaAnticipo] = useState<string>("false"); // 'true' o 'false'
  const [permiteSubcontratacion, setPermiteSubcontratacion] = useState<string>("false"); // 'true' o 'false'
  const [contactoAclaracionesEmail, setContactoAclaracionesEmail] = useState("ba.corre@sanjuandelrio.gob.mx"); // Valor común
  const [nombreDepartamentoSolicitante, setNombreDepartamentoSolicitante] = useState<string>("");

  useEffect(() => {
    const fetchSolicitudYConcurso = async () => {
      try {
        let idSolicitanteTemporal = "";
        if (idSolicitud) {
          const solicitud = await getSolicitudById(idSolicitud);
          if (solicitud) {
            idSolicitanteTemporal = solicitud.id_secretaria?.toString() || "";
            setIdDepartamentoSolicitante(solicitud.id_secretaria?.toString() || ""); 
            setNombreDepartamentoSolicitante(solicitud.nombre_secretaria || "");  
          }
        }

        if (idConcurso) {
          const concurso = await getConcursoById(idConcurso);
          if (concurso) {
            setNumeroProcedimiento(concurso.numero_concurso || "");
            setTituloContratacion(concurso.tipo_concurso || ""); // Ajusta si quieres mostrar el tipo de concurso como título
          }
        }


        const secretaria = await fetchSecretarias();
        if (secretaria) {
          setDepartamentos(secretaria);

          const secretariaEncontrada = secretaria.find(
            (dep: Departamento) => dep.id_secretaria.toString() === idSolicitanteTemporal.toString()
          );
        
          if (secretariaEncontrada) {
            setNombreDepartamentoSolicitante(secretariaEncontrada.nombre);
          }
        }
        
      } catch (error) {
        console.error("Error cargando solicitud/concurso:", error);
        setError("Error al cargar datos de la solicitud o concurso.");
      }
    };

    fetchSolicitudYConcurso();
  }, [idSolicitud, idConcurso]);


  // --- Manejador genérico de cambios ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Manejo específico para selects booleanos
    if (type === 'select-one') {
        if (name === 'requiereInscripcionPadron') setRequiereInscripcionPadron(value);
        else if (name === 'aplicaAnticipo') setAplicaAnticipo(value);
        else if (name === 'permiteSubcontratacion') setPermiteSubcontratacion(value);
        else if (name === 'idDepartamentoConvocante') setIdDepartamentoConvocante(value);
        else if (name === 'idDepartamentoSolicitante') setIdDepartamentoSolicitante(value);
        // Añadir más selects si es necesario
        return; // Importante salir para no procesar como texto
    }

    // Manejo para otros inputs
     switch(name) {
        case 'numeroProcedimiento': setNumeroProcedimiento(value); break;
        case 'tituloContratacion': setTituloContratacion(value); break;
        case 'descripcionPrograma': setDescripcionPrograma(value); break;
        case 'ejercicioFiscal': setEjercicioFiscal(Number(value) || new Date().getFullYear()); break;
        case 'fuenteRecurso': setFuenteRecurso(value); break;
        case 'fechaElaboracionBases': setFechaElaboracionBases(value); break;
        case 'lugarActosPredeterminado': setLugarActosPredeterminado(value); break;
        case 'montoMinimoContrato': setMontoMinimoContrato(value); break;
        case 'montoMaximoContrato': setMontoMaximoContrato(value); break;
        case 'costoBasesDescripcion': setCostoBasesDescripcion(value); break;
        case 'costoBaseUMA': setCostoBaseUMA(value); break;
        case 'costoBasesValorMn': setCostoBasesValorMn(value); break;
        case 'plazoModificacionBasesDias': setPlazoModificacionBasesDias(Number(value) || 0); break;
        case 'fechaLimiteInscripcionPadron': setFechaLimiteInscripcionPadron(value); break;
        case 'idiomaDocumentacion': setIdiomaDocumentacion(value); break;
        case 'periodoVigenciaPropuestaDias': setPeriodoVigenciaPropuestaDias(Number(value) || 0); break;
        case 'plazoMaximoEntregaDias': setPlazoMaximoEntregaDias(value); break;
        case 'plazoPagoDias': setPlazoPagoDias(Number(value) || 0); break;
        case 'contactoAclaracionesEmail': setContactoAclaracionesEmail(value); break;
        // Añadir más casos si es necesario
     }
  };


  // --- Manejador del envío ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsLoading(true);

    // --- Validación básica ---
    if (!numeroProcedimiento || !tituloContratacion || !idDepartamentoConvocante || !idDepartamentoSolicitante || !ejercicioFiscal || !fechaElaboracionBases) {
      setError("Los campos marcados con * son obligatorios.");
      setIsLoading(false);
      return;
    }

    // --- Crear objeto de datos para la API ---
    const basesData = {
      id_concurso: idConcurso, // De las props
      id_solicitud: idSolicitud,
      numero_procedimiento: numeroProcedimiento,
      titulo_contratacion: tituloContratacion,
      descripcion_programa: descripcionPrograma || null, // Enviar null si está vacío
      id_secretaria_convocante: parseInt(idDepartamentoConvocante.toString()),
      ejercicio_fiscal: ejercicioFiscal,
      fuente_recurso: fuenteRecurso || null,
      fecha_elaboracion_bases: fechaElaboracionBases,
      lugar_actos_predeterminado: lugarActosPredeterminado || null,
      monto_minimo_contrato: montoMinimoContrato ? parseFloat(montoMinimoContrato) : null,
      monto_maximo_contrato: montoMaximoContrato ? parseFloat(montoMaximoContrato) : null,
      costo_bases_descripcion: costoBasesDescripcion || null,
      costoBaseUMA: costoBaseUMA || null, 
      costo_bases_valor_mn: costoBasesValorMn ? parseFloat(costoBasesValorMn) : null,
      plazo_modificacion_bases_dias: plazoModificacionBasesDias,
      requiere_inscripcion_padron: requiereInscripcionPadron === "true", // Convertir a booleano
      fecha_limite_inscripcion_padron: fechaLimiteInscripcionPadron || null,
      idioma_documentacion: idiomaDocumentacion,
      periodo_vigencia_propuesta_dias: periodoVigenciaPropuestaDias,
      plazo_maximo_entrega_dias: plazoMaximoEntregaDias ? parseInt(plazoMaximoEntregaDias) : null,
      plazo_pago_dias: plazoPagoDias,
      aplica_anticipo: aplicaAnticipo === "true", // Convertir a booleano
      permite_subcontratacion: permiteSubcontratacion === "true", // Convertir a booleano
      contacto_aclaraciones_email: contactoAclaracionesEmail || null,
      estatus_bases: 'BORRADOR', // Estado inicial
    };

    // --- Llamada a la API ---
    try {
      await createBases(basesData); // Llama a tu función API
      setSuccessMessage("Bases creadas correctamente.");
      onBasesAdded(); // Llama al callback del padre
      setTimeout(() => {
        onClose(); // Cierra el modal después de un segundo
      }, 1000);
    } catch (err) {
      setError((err as Error).message || "Ocurrió un error al crear las bases.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderizado del Formulario ---
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
          <h1 className="text-xl font-bold mb-6 text-center">Crear Nuevas Bases</h1>
          
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="mt-2 text-white">Guardando...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Usaremos un grid para organizar mejor */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Columna 1 */}
          <div>
            <label htmlFor="numeroProcedimiento" className="block text-sm font-medium text-gray-700">Núm. Procedimiento: <span className="text-red-500">*</span></label>
            <input type="text" id="numeroProcedimiento" name="numeroProcedimiento" value={numeroProcedimiento} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="tituloContratacion" className="block text-sm font-medium text-gray-700">Título Contratación: <span className="text-red-500">*</span></label>
            <textarea id="tituloContratacion" name="tituloContratacion" value={tituloContratacion} onChange={handleInputChange} required rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
           <div>
            <label htmlFor="idDepartamentoConvocante" className="block text-sm font-medium text-gray-700">Depto. Convocante: <span className="text-red-500">*</span></label>
            <select id="idDepartamentoConvocante" name="idDepartamentoConvocante" value={idDepartamentoConvocante} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">Seleccione...</option>
              {departamentos.map(dep => (
                <option key={dep.id_secretaria} value={dep.id_secretaria}>
                  {dep.nombre}
                </option>
              ))}

            </select>
          </div>
           <div>
            <label htmlFor="idDepartamentoSolicitante" className="block text-sm font-medium text-gray-700">Depto. Solicitante: <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="nombreDepartamentoSolicitante"
              name="nombreDepartamentoSolicitante"
              value={nombreDepartamentoSolicitante}
              readOnly
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-700 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="ejercicioFiscal" className="block text-sm font-medium text-gray-700">Ejercicio Fiscal: <span className="text-red-500">*</span></label>
            <input type="number" id="ejercicioFiscal" name="ejercicioFiscal" value={ejercicioFiscal} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="fuenteRecurso" className="block text-sm font-medium text-gray-700">Fuente Recurso:</label>
            <input type="text" id="fuenteRecurso" name="fuenteRecurso" value={fuenteRecurso} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>

          {/* Columna 2 */}
           <div>
            <label htmlFor="fechaElaboracionBases" className="block text-sm font-medium text-gray-700">Fecha Elaboración: <span className="text-red-500">*</span></label>
            <input type="date" id="fechaElaboracionBases" name="fechaElaboracionBases" value={fechaElaboracionBases} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div className="lg:col-span-2"> {/* Ocupa más espacio si es necesario */}
            <label htmlFor="lugarActosPredeterminado" className="block text-sm font-medium text-gray-700">Lugar Actos Predeterminado:</label>
            <textarea id="lugarActosPredeterminado" name="lugarActosPredeterminado" value={lugarActosPredeterminado} onChange={handleInputChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="montoMinimoContrato" className="block text-sm font-medium text-gray-700">Monto Mínimo Contrato:</label>
            <input type="number" step="0.01" id="montoMinimoContrato" name="montoMinimoContrato" value={montoMinimoContrato} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="montoMaximoContrato" className="block text-sm font-medium text-gray-700">Monto Máximo Contrato:</label>
            <input type="number" step="0.01" id="montoMaximoContrato" name="montoMaximoContrato" value={montoMaximoContrato} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="costoBaseUMA" className="block text-sm font-medium text-gray-700">Costo Bases (UMA):</label>
            <input type="text" id="costoBaseUMA" name="costoBaseUMA" value={costoBaseUMA} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="costoBasesDescripcion" className="block text-sm font-medium text-gray-700">Costo Bases (Desc):</label>
            <input type="text" id="costoBasesDescripcion" name="costoBasesDescripcion" value={costoBasesDescripcion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="costoBasesValorMn" className="block text-sm font-medium text-gray-700">Costo Bases (M.N.):</label>
            <input type="number" step="0.01" id="costoBasesValorMn" name="costoBasesValorMn" value={costoBasesValorMn} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>

          {/* Columna 3 */}
          <div>
            <label htmlFor="plazoModificacionBasesDias" className="block text-sm font-medium text-gray-700">Plazo Modif. Bases (días):</label>
            <input type="number" id="plazoModificacionBasesDias" name="plazoModificacionBasesDias" value={plazoModificacionBasesDias} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
             <label htmlFor="requiereInscripcionPadron" className="block text-sm font-medium text-gray-700">Requiere Padrón Prov:</label>
             <select id="requiereInscripcionPadron" name="requiereInscripcionPadron" value={requiereInscripcionPadron} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
               <option value="true">Sí</option>
               <option value="false">No</option>
             </select>
          </div>
          <div>
            <label htmlFor="fechaLimiteInscripcionPadron" className="block text-sm font-medium text-gray-700">Fecha Límite Padrón:</label>
            <input type="text" id="fechaLimiteInscripcionPadron" name="fechaLimiteInscripcionPadron" value={fechaLimiteInscripcionPadron} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="periodoVigenciaPropuestaDias" className="block text-sm font-medium text-gray-700">Vigencia Propuesta (días):</label>
            <input type="number" id="periodoVigenciaPropuestaDias" name="periodoVigenciaPropuestaDias" value={periodoVigenciaPropuestaDias} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="plazoMaximoEntregaDias" className="block text-sm font-medium text-gray-700">Plazo Máx. Entrega (días):</label>
            <input type="number" id="plazoMaximoEntregaDias" name="plazoMaximoEntregaDias" value={plazoMaximoEntregaDias} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="plazoPagoDias" className="block text-sm font-medium text-gray-700">Plazo Pago (días):</label>
            <input type="number" id="plazoPagoDias" name="plazoPagoDias" value={plazoPagoDias} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
             <label htmlFor="aplicaAnticipo" className="block text-sm font-medium text-gray-700">Aplica Anticipo:</label>
             <select id="aplicaAnticipo" name="aplicaAnticipo" value={aplicaAnticipo} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
               <option value="false">No</option>
               <option value="true">Sí</option>
             </select>
          </div>
           <div>
             <label htmlFor="permiteSubcontratacion" className="block text-sm font-medium text-gray-700">Permite Subcontratación:</label>
             <select id="permiteSubcontratacion" name="permiteSubcontratacion" value={permiteSubcontratacion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
               <option value="false">No</option>
               <option value="true">Sí</option>
             </select>
          </div>
           <div>
            <label htmlFor="contactoAclaracionesEmail" className="block text-sm font-medium text-gray-700">Email Aclaraciones:</label>
            <input type="email" id="contactoAclaracionesEmail" name="contactoAclaracionesEmail" value={contactoAclaracionesEmail} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>

        </div> {/* Fin del grid */}

         {/* Mensajes de éxito o error */}
         {(successMessage || error) && (
          <div className={`p-4 my-4 border-l-4 rounded-md ${successMessage ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700"}`} role="alert">
            {successMessage && <p className="font-bold">{successMessage}</p>}
            {error && <p className="font-bold">{error}</p>}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            Cerrar
          </button>
          <button type="submit" disabled={isLoading} className={`px-4 py-2 rounded-md text-white ${isLoading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`}>
            {isLoading ? "Guardando..." : "Guardar Bases"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AltaBases;