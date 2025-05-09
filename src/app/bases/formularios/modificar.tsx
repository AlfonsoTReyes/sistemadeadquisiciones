// Componente: ModificarBases.tsx
"use client";
import React, { useState, useEffect } from "react";
import { fetchSecretarias, getBasesById, updateBases } from '../../peticiones_api/peticionBases'; // Asume que getBasesById y updateBases existen
import { getSolicitudById } from '../../peticiones_api/peticionSolicitudes'; // Mantenido por dependencia original

interface Departamento {
  id_secretaria: number;
  nombre: string;
}

// Define una interfaz para los datos de las bases (ajusta según tu API)
interface BasesData {
  id_bases: number;
  id_concurso: number;
  id_solicitud: number;
  numero_procedimiento: string;
  titulo_contratacion: string;
  descripcion_programa?: string | null;
  id_secretaria_convocante: number;
  id_secretaria_solicitante?: number | null; // Importante para buscar nombre solicitante
  ejercicio_fiscal: number;
  fuente_recurso?: string | null;
  fecha_elaboracion_bases: string; // Formato YYYY-MM-DD
  lugar_actos_predeterminado?: string | null;
  monto_minimo_contrato?: number | null;
  monto_maximo_contrato?: number | null;
  costo_bases_descripcion?: string | null;
  costoBaseUMA?: string | null;
  costo_bases_valor_mn?: number | null;
  plazo_modificacion_bases_dias: number;
  requiere_inscripcion_padron: boolean;
  fecha_limite_inscripcion_padron?: string | null;
  idioma_documentacion: string;
  periodo_vigencia_propuesta_dias: number;
  plazo_maximo_entrega_dias?: number | null;
  plazo_pago_dias: number;
  aplica_anticipo: boolean;
  permite_subcontratacion: boolean;
  contacto_aclaraciones_email?: string | null;
  estatus_bases: string;
  uma:string;
}


interface ModificarBasesProps {
  idBases: number; // ID del registro de bases a modificar
  idSolicitud: number; // Puede ser necesario para contexto o payload de actualización
  onClose: () => void;
  onBasesModified: () => void; // Callback renombrado
}

const ModificarBases: React.FC<ModificarBasesProps> = ({ idBases, idSolicitud, onClose, onBasesModified }) => {
  const [isLoading, setIsLoading] = useState(true); // Inicia cargando datos
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el envío
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  // Estado para los campos del formulario
  const [numeroProcedimiento, setNumeroProcedimiento] = useState("");
  const [tituloContratacion, setTituloContratacion] = useState("");
  const [descripcionPrograma, setDescripcionPrograma] = useState("");
  const [idDepartamentoConvocante, setIdDepartamentoConvocante] = useState<number | string>("");
  const [idDepartamentoSolicitanteOriginal, setIdDepartamentoSolicitanteOriginal] = useState<number | string>(""); // Guardar ID original
  const [nombreDepartamentoSolicitante, setNombreDepartamentoSolicitante] = useState<string>(""); // Nombre para mostrar
  const [ejercicioFiscal, setEjercicioFiscal] = useState<number>(new Date().getFullYear());
  const [fuenteRecurso, setFuenteRecurso] = useState("Recurso Propio");
  const [fechaElaboracionBases, setFechaElaboracionBases] = useState(""); // Inicia vacío, se carga de la API
  const [lugarActosPredeterminado, setLugarActosPredeterminado] = useState("Sala de juntas del Centro Cívico (Planta Alta), ubicada en Blvd. Paso de los Guzmán #24, Barrio de la Concepción del Municipio de San Juan del Río, Querétaro");
  const [montoMinimoContrato, setMontoMinimoContrato] = useState<string>("");
  const [montoMaximoContrato, setMontoMaximoContrato] = useState<string>("");
  const [costoBasesDescripcion, setCostoBasesDescripcion] = useState("");
  const [costoBaseUMA, setCostoBaseUMA] = useState("");
  const [costoBasesValorMn, setCostoBasesValorMn] = useState<string>("");
  const [plazoModificacionBasesDias, setPlazoModificacionBasesDias] = useState<number>(5);
  const [requiereInscripcionPadron, setRequiereInscripcionPadron] = useState<string>("true");
  const [fechaLimiteInscripcionPadron, setFechaLimiteInscripcionPadron] = useState("Previo a la Junta de Aclaraciones");
  const [idiomaDocumentacion, setIdiomaDocumentacion] = useState("Español");
  const [periodoVigenciaPropuestaDias, setPeriodoVigenciaPropuestaDias] = useState<number>(90);
  const [plazoMaximoEntregaDias, setPlazoMaximoEntregaDias] = useState<string>("");
  const [plazoPagoDias, setPlazoPagoDias] = useState<number>(30);
  const [aplicaAnticipo, setAplicaAnticipo] = useState<string>("false");
  const [permiteSubcontratacion, setPermiteSubcontratacion] = useState<string>("false");
  const [contactoAclaracionesEmail, setContactoAclaracionesEmail] = useState("ba.corre@sanjuandelrio.gob.mx");

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Obtener Secretarías (para los desplegables)
        const secretariasData = await fetchSecretarias();
        if (secretariasData) {
          setDepartamentos(secretariasData);
        } else {
          throw new Error("No se pudieron cargar las secretarías.");
        }

        // 2. Obtener los datos de las Bases a modificar
        const basesData: BasesData = await getBasesById(idBases);
        if (!basesData) {
          throw new Error(`No se encontraron datos para las bases con ID ${idBases}.`);
        }

        // 3. Poblar el formulario con los datos obtenidos
        setNumeroProcedimiento(basesData.numero_procedimiento || "");
        setTituloContratacion(basesData.titulo_contratacion || "");
        setDescripcionPrograma(basesData.descripcion_programa || "");
        setIdDepartamentoConvocante(basesData.id_secretaria_convocante?.toString() || "");
        setEjercicioFiscal(basesData.ejercicio_fiscal || new Date().getFullYear());
        setFuenteRecurso(basesData.fuente_recurso || "Recurso Propio");
        
        setFechaElaboracionBases(basesData.fecha_elaboracion_bases ? basesData.fecha_elaboracion_bases.split("T")[0] : "");
        setLugarActosPredeterminado(basesData.lugar_actos_predeterminado || "Sala de juntas..."); // Usa tu valor por defecto si no viene
        setMontoMinimoContrato(basesData.monto_minimo_contrato?.toString() || "");
        setMontoMaximoContrato(basesData.monto_maximo_contrato?.toString() || "");
        setCostoBasesDescripcion(basesData.costo_bases_descripcion || "");
        setCostoBaseUMA(basesData.uma || "");
        setCostoBasesValorMn(basesData.costo_bases_valor_mn?.toString() || "");
        setPlazoModificacionBasesDias(basesData.plazo_modificacion_bases_dias ?? 5); // Usa ?? para valor por defecto si es null/undefined
        setRequiereInscripcionPadron(basesData.requiere_inscripcion_padron ? "true" : "false");
        setFechaLimiteInscripcionPadron(basesData.fecha_limite_inscripcion_padron || "Previo a la Junta de Aclaraciones");
        setIdiomaDocumentacion(basesData.idioma_documentacion || "Español");
        setPeriodoVigenciaPropuestaDias(basesData.periodo_vigencia_propuesta_dias ?? 90);
        setPlazoMaximoEntregaDias(basesData.plazo_maximo_entrega_dias?.toString() || "");
        setPlazoPagoDias(basesData.plazo_pago_dias ?? 30);
        setAplicaAnticipo(basesData.aplica_anticipo ? "true" : "false");
        setPermiteSubcontratacion(basesData.permite_subcontratacion ? "true" : "false");
        setContactoAclaracionesEmail(basesData.contacto_aclaraciones_email || "ba.corre@sanjuandelrio.gob.mx");

        // 4. Manejar el departamento solicitante (puede requerir lógica adicional)
        //    Opción A: Usar el id_secretaria_solicitante de los datos de las bases
        const idSolicitanteFromBases = basesData.id_secretaria_solicitante;
        if (idSolicitanteFromBases && secretariasData) {
             setIdDepartamentoSolicitanteOriginal(idSolicitanteFromBases.toString()); // Guarda el ID que viene de las bases
             const solicitanteEncontrado = secretariasData.find(
                (dep: Departamento) => dep.id_secretaria === idSolicitanteFromBases
             );
             setNombreDepartamentoSolicitante(solicitanteEncontrado ? solicitanteEncontrado.nombre : "Desconocido");
        } else {
             // Opción B: (Como fallback o si es la lógica deseada) Usar idSolicitud de las props
             //    Esta lógica se mantiene de tu código original. Decide cuál es la correcta.
             console.warn("No se encontró id_secretaria_solicitante en los datos de las bases, intentando con idSolicitud de props.");
             if (idSolicitud && secretariasData) {
                try {
                    const solicitud = await getSolicitudById(idSolicitud);
                    if (solicitud && solicitud.id_secretaria) {
                        setIdDepartamentoSolicitanteOriginal(solicitud.id_secretaria.toString());
                        const solicitanteEncontrado = secretariasData.find(
                            (dep: Departamento) => dep.id_secretaria === solicitud.id_secretaria
                        );
                        setNombreDepartamentoSolicitante(solicitanteEncontrado ? solicitanteEncontrado.nombre : "Desconocido");
                    } else {
                         setNombreDepartamentoSolicitante("No encontrado (Solicitud)");
                    }
                } catch (solicitudError) {
                    console.error("Error cargando solicitud para nombre solicitante:", solicitudError);
                    setNombreDepartamentoSolicitante("Error al cargar");
                }
             } else {
                setNombreDepartamentoSolicitante("No disponible");
             }
        }

        // Podrías cargar datos del Concurso si aún los necesitas mostrar (opcional)
        // if (idConcurso) {
        //   const concurso = await getConcursoById(idConcurso);
        //   // ... usar datos del concurso si es necesario ...
        // }

      } catch (error: any) {
        console.error("Error cargando datos iniciales:", error);
        setError(error.message || "Error al cargar los datos para modificar.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [idBases, idSolicitud]); // Depende de idBases para recargar si cambia

  // --- Manejador genérico de cambios (sin cambios respecto al original) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'select-one') {
        if (name === 'requiereInscripcionPadron') setRequiereInscripcionPadron(value);
        else if (name === 'aplicaAnticipo') setAplicaAnticipo(value);
        else if (name === 'permiteSubcontratacion') setPermiteSubcontratacion(value);
        else if (name === 'idDepartamentoConvocante') setIdDepartamentoConvocante(value);
        // No permitir cambiar el Depto. Solicitante directamente aquí si se muestra como texto
        return;
    }

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
     }
  };

  // --- Manejador del envío ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsSubmitting(true); // Usa el estado de submitting

    // --- Validación básica ---
    if (!numeroProcedimiento || !tituloContratacion || !idDepartamentoConvocante || !fechaElaboracionBases) {
      setError("Los campos marcados con * son obligatorios.");
      setIsSubmitting(false);
      return;
    }

    // --- Crear objeto de datos para la API (ajusta según endpoint de update) ---
    const basesUpdateData = {
      // Incluye los campos que permites modificar
      // Puede que no necesites enviar id_concurso o id_solicitud si no cambian
      // o si el backend los obtiene a través de idBases
      // id_concurso: idConcurso, // Descomenta si es necesario para el update
      // id_solicitud: idSolicitud, // Descomenta si es necesario para el update
      numero_procedimiento: numeroProcedimiento,
      titulo_contratacion: tituloContratacion,
      descripcion_programa: descripcionPrograma || null,
      id_secretaria_convocante: parseInt(idDepartamentoConvocante.toString()),
      // id_secretaria_solicitante: idDepartamentoSolicitanteOriginal ? parseInt(idDepartamentoSolicitanteOriginal.toString()) : null, // Envía el ID original si no es modificable
      ejercicio_fiscal: ejercicioFiscal,
      fuente_recurso: fuenteRecurso || null,
      fecha_elaboracion_bases: fechaElaboracionBases, // Asegúrate que el formato sea el esperado por la API
      lugar_actos_predeterminado: lugarActosPredeterminado || null,
      monto_minimo_contrato: montoMinimoContrato ? parseFloat(montoMinimoContrato) : null,
      monto_maximo_contrato: montoMaximoContrato ? parseFloat(montoMaximoContrato) : null,
      costo_bases_descripcion: costoBasesDescripcion || null,
      costoBaseUMA: costoBaseUMA || null,
      costo_bases_valor_mn: costoBasesValorMn ? parseFloat(costoBasesValorMn) : null,
      plazo_modificacion_bases_dias: plazoModificacionBasesDias,
      requiere_inscripcion_padron: requiereInscripcionPadron === "true",
      fecha_limite_inscripcion_padron: fechaLimiteInscripcionPadron || null,
      idioma_documentacion: idiomaDocumentacion,
      periodo_vigencia_propuesta_dias: periodoVigenciaPropuestaDias,
      plazo_maximo_entrega_dias: plazoMaximoEntregaDias ? parseInt(plazoMaximoEntregaDias) : null,
      plazo_pago_dias: plazoPagoDias,
      aplica_anticipo: aplicaAnticipo === "true",
      permite_subcontratacion: permiteSubcontratacion === "true",
      contacto_aclaraciones_email: contactoAclaracionesEmail || null,
      // No incluir estatus_bases a menos que quieras cambiarlo explícitamente
    };

    // --- Llamada a la API de Actualización ---
    try {
      await updateBases(idBases, basesUpdateData); // Llama a la función de actualización
      setSuccessMessage("Bases modificadas correctamente.");
      onBasesModified(); // Llama al callback del padre
      setTimeout(() => {
        onClose(); // Cierra el modal después de un segundo
      }, 1000);
    } catch (err) {
      setError((err as Error).message || "Ocurrió un error al modificar las bases.");
    } finally {
      setIsSubmitting(false); // Termina el estado de submitting
    }
  };

  // --- Renderizado del Formulario ---
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative">
        <h1 className="text-xl font-bold mb-6 text-center">Modificar Bases (ID: {idBases})</h1>

        {/* Indicador de Carga Inicial */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p className="ml-3">Cargando datos...</p>
          </div>
        )}

        {/* Indicador de Envío */}
        {isSubmitting && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="flex flex-col items-center">
              <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
              <p className="mt-2 text-white">Guardando cambios...</p>
            </div>
          </div>
        )}

        {/* Renderiza el formulario solo si no está cargando inicialmente */}
        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usaremos un grid para organizar mejor */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Columna 1 */}
              <div>
                <label htmlFor="numeroProcedimiento" className="block text-sm font-medium text-gray-700">Núm. Procedimiento: <span className="text-red-500">*</span></label>
                <input readOnly type="text" id="numeroProcedimiento" name="numeroProcedimiento" value={numeroProcedimiento} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="tituloContratacion" className="block text-sm font-medium text-gray-700">Título Contratación: <span className="text-red-500">*</span></label>
                <textarea readOnly id="tituloContratacion" name="tituloContratacion" value={tituloContratacion} onChange={handleInputChange} required rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
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
                <label htmlFor="nombreDepartamentoSolicitante" className="block text-sm font-medium text-gray-700">Depto. Solicitante: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="nombreDepartamentoSolicitante"
                  name="nombreDepartamentoSolicitante"
                  value={nombreDepartamentoSolicitante}
                  readOnly // Hacerlo no editable si el nombre solo se muestra
                  disabled // O deshabilitado para indicar que no se cambia aquí
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-700 focus:outline-none"
                />
                 {/* Podrías añadir un input hidden si necesitas enviar el ID original */}
                 {/* <input type="hidden" name="idDepartamentoSolicitanteOriginal" value={idDepartamentoSolicitanteOriginal} /> */}
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
              <div className="lg:col-span-2">
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
                <label htmlFor="idiomaDocumentacion" className="block text-sm font-medium text-gray-700">Idioma Documentación:</label>
                 <input type="text" id="idiomaDocumentacion" name="idiomaDocumentacion" value={idiomaDocumentacion} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
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
              <button type="submit" disabled={isSubmitting} className={`px-4 py-2 rounded-md text-white ${isSubmitting ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModificarBases;