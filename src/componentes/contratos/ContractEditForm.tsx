// src/components/contratos/ContractEditForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ContratoDetallado, ContratoUpdateData } from '@/types/contrato';
import { ContratoInputData, SuficienciaInput, AreaRequirenteInput } from '@/types/contratoTemplateData';
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch'; // Asegúrate que la ruta es correcta
import { fetchSolicitudesForSelect } from '@/fetch/solicitudAdquisicionFetch';
import { fetchDictamenesForSelect } from '@/fetch/dictamenComiteFetch';
import { fetchConcursosForSelect } from '@/fetch/concursosFetch';

interface OptionType { id: number; label: string; }

interface ContractEditFormProps {
    initialData: ContratoDetallado;
    onSubmit: (idContrato: number, dataToUpdate: ContratoUpdateData & { template_data?: object }) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
    error?: string | null;
}

const ContractEditForm: React.FC<ContractEditFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSaving = false,
    error = null,
}) => {

    // --- Estados (Inicialización sin cambios) ---
    const td = initialData.template_data ?? {};
    const suf = td.suficiencia as SuficienciaInput | undefined ?? {};
    const areaReq = td.areaRequirente as AreaRequirenteInput | undefined ?? {};
    // ... (todos los useState como los tenías, inicializados con initialData y td) ...
    const [numeroProcedimiento, setNumeroProcedimiento] = useState(td.numeroProcedimiento ?? initialData.numero_contrato ?? ''); // Usa el del template si existe, sino el core
    const [idProveedor, setIdProveedor] = useState(initialData.id_proveedor.toString());
    const [objetoPrincipal, setObjetoPrincipal] = useState(td.objetoPrincipal ?? initialData.objeto_contrato ?? ''); // Usa el del template si existe
    const [descripcionDetallada, setDescripcionDetallada] = useState(td.descripcionDetallada ?? '');
    const [articuloFundamento, setArticuloFundamento] = useState(td.articuloFundamento ?? '');
    const [montoTotal, setMontoTotal] = useState<number | ''>(td.montoTotal ?? (initialData.monto_total ? parseFloat(initialData.monto_total) : '')); // Usa el del template si existe
    const [moneda, setMoneda] = useState(td.moneda ?? initialData.moneda ?? 'MXN'); // Usa el del template si existe
    const [fechaInicio, setFechaInicio] = useState(td.fechaInicio?.split('T')[0] ?? initialData.fecha_inicio?.split('T')[0] ?? ''); // Usa el del template si existe
    const [fechaFin, setFechaFin] = useState(td.fechaFin?.split('T')[0] ?? initialData.fecha_fin?.split('T')[0] ?? ''); // Usa el del template si existe
    const [fechaFirma, setFechaFirma] = useState(td.fechaFirma?.split('T')[0] ?? initialData.fecha_firma?.split('T')[0] ?? ''); // Usa el del template si existe

    const [idConcurso, setIdConcurso] = useState(td.idConcurso?.toString() ?? initialData.id_concurso?.toString() ?? '');
    const [idSolicitud, setIdSolicitud] = useState(td.idSolicitud?.toString() ?? initialData.id_solicitud?.toString() ?? '');
    const [idDictamen, setIdDictamen] = useState(td.idDictamen?.toString() ?? initialData.id_dictamen?.toString() ?? '');

    const [suficienciaFecha, setSuficienciaFecha] = useState(suf.fecha ?? '');
    const [suficienciaNumOficio, setSuficienciaNumOficio] = useState(suf.numeroOficio ?? '');
    const [suficienciaCuenta, setSuficienciaCuenta] = useState(suf.cuenta ?? '');
    const [suficienciaRecurso, setSuficienciaRecurso] = useState(suf.tipoRecurso ?? '');

    const [reqNombre, setReqNombre] = useState(areaReq.nombreFuncionario ?? '');
    const [reqCargo, setReqCargo] = useState(areaReq.cargoFuncionario ?? '');

    const [montoGarantiaCump, setMontoGarantiaCump] = useState<number | ''>(td.montoGarantiaCumplimiento ?? '');
    const [montoGarantiaVicios, setMontoGarantiaVicios] = useState<number | ''>(td.montoGarantiaVicios ?? '');
    const [numeroHojas, setNumeroHojas] = useState<number | ''>(td.numeroHojas ?? '');
    const [condicionesPago, setCondicionesPago] = useState(td.condicionesPago ?? initialData.condiciones_pago ?? '');
    const [garantiasTexto, setGarantiasTexto] = useState(td.garantiasTexto ?? initialData.garantias ?? '');

    // Específicos Adquisición
    const [nombreContratoAdquisicion, setNombreContratoAdquisicion] = useState(td.nombreContratoAdquisicion ?? '');
    const [montoMinimo, setMontoMinimo] = useState<number | ''>(td.montoMinimo ?? '');
    const [oficioPeticionNumero, setOficioPeticionNumero] = useState(td.oficioPeticionNumero ?? '');
    const [oficioPeticionFecha, setOficioPeticionFecha] = useState(td.oficioPeticionFecha?.split('T')[0] ?? '');

    // Tipo de contrato (no editable usualmente, pero necesario para lógica interna)
    const tipoContratoState = td.tipoContrato ?? 'servicio'; // Asume servicio si no está

    // --- Estados y useEffects para Selectores ---
    const [proveedoresOptions, setProveedoresOptions] = useState<OptionType[]>([]);
    const [loadingProveedores, setLoadingProveedores] = useState(true);
    const [proveedoresError, setProveedoresError] = useState<string | null>(null);
    const [solicitudesOptions, setSolicitudesOptions] = useState<OptionType[]>([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [solicitudesError, setSolicitudesError] = useState<string | null>(null);
    const [dictamenesOptions, setDictamenesOptions] = useState<OptionType[]>([]);
    const [loadingDictamenes, setLoadingDictamenes] = useState(true);
    const [dictamenesError, setDictamenesError] = useState<string | null>(null);
    const [concursosOptions, setConcursosOptions] = useState<OptionType[]>([]);
    const [loadingConcursos, setLoadingConcursos] = useState(true);
    const [concursosError, setConcursosError] = useState<string | null>(null);
    // ... otros estados de carga y error para selectores ...

    useEffect(() => {
        const loadProveedores = async () => {
            setLoadingProveedores(true);
            setProveedoresError(null);
            try {
                const options = await fetchProveedoresForSelect();
                setProveedoresOptions(options);
            } catch (err) {
                console.error("Error loading providers for select:", err);
                setProveedoresError("No se pudo cargar la lista de proveedores.");
            } finally {
                setLoadingProveedores(false);
            }
        };
        loadProveedores();
    }, []); // Cargar solo al montar
    useEffect(() => {
        const loadConcursos = async () => {
            setLoadingConcursos(true);
            setConcursosError(null);
            try {
                const options = await fetchConcursosForSelect();
                setConcursosOptions(options);
            } catch (err) {
                console.error("Error loading concursos for select:", err);
                setConcursosError("No se pudo cargar la lista de concursos.");
            } finally {
                setLoadingConcursos(false);
            }
        };
        loadConcursos();
    }, []);
    // *** NUEVO useEffect para cargar Solicitudes ***
    useEffect(() => {
        const loadSolicitudes = async () => {
            setLoadingSolicitudes(true);
            setSolicitudesError(null);
            try {
                const options = await fetchSolicitudesForSelect();
                setSolicitudesOptions(options);
            } catch (err) {
                console.error("Error loading solicitudes for select:", err);
                setSolicitudesError("No se pudo cargar la lista de solicitudes.");
            } finally {
                setLoadingSolicitudes(false);
            }
        };
        loadSolicitudes();
    }, []);
    // *** NUEVO useEffect para cargar Dictámenes ***
    useEffect(() => {
        const loadDictamenes = async () => {
            setLoadingDictamenes(true);
            setDictamenesError(null);
            try {
                const options = await fetchDictamenesForSelect();
                setDictamenesOptions(options);
            } catch (err) {
                console.error("Error loading dictamenes for select:", err);
                setDictamenesError("No se pudo cargar la lista de dictámenes.");
            } finally {
                setLoadingDictamenes(false);
            }
        };
        loadDictamenes();
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { /* ... (lógica sin cambios) ... */ };

    const disableSave = isSaving || loadingProveedores || loadingSolicitudes || loadingDictamenes || loadingConcursos;

    // *** Definición de Clases Tailwind (igual que en los forms de creación) ***
    const fieldsetStyles = "border border-gray-300 p-4 rounded-md shadow-sm mb-6";
    const legendStyles = "text-base font-semibold px-2 -ml-2 text-gray-700";
    const labelStyles = "block text-sm font-medium text-gray-700 mb-1"; // Aumentado peso
    const inputStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const textareaStyles = inputStyles + " min-h-[80px]";
    const selectStyles = inputStyles + " bg-white";
    const buttonPrimaryStyles = "px-5 py-2 rounded text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const buttonSecondaryStyles = "px-5 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";
    const errorTextStyles = "text-xs text-red-600 mt-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-0">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Editar Contrato ({tipoContratoState})</h2>

            {/* --- Sección Proveedor --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Proveedor</legend>
                <div>
                    <label htmlFor="idProveedorEdit" className={labelStyles}>Proveedor *</label>
                    <select id="idProveedorEdit" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required disabled={loadingProveedores || isSaving} className={`${selectStyles} ${proveedoresError ? 'border-red-500' : ''}`}>
                        <option value="" disabled>{loadingProveedores ? 'Cargando...' : (proveedoresError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                    </select>
                    {proveedoresError && <p className={errorTextStyles}>{proveedoresError}</p>}
                     {/* Podrías mostrar info adicional del proveedor aquí si es útil */}
                </div>
            </fieldset>

            {/* --- Sección Específica Adquisición (condicional) --- */}
             {tipoContratoState === 'adquisicion' && (
                 <fieldset className={fieldsetStyles}>
                     <legend className={legendStyles}>Datos Adquisición</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <label htmlFor="nombreContratoAdqEdit" className={labelStyles}>Nombre Contrato (Título) *</label>
                            <input id="nombreContratoAdqEdit" type="text" value={nombreContratoAdquisicion} onChange={e=>setNombreContratoAdquisicion(e.target.value)} required disabled={isSaving} className={inputStyles}/>
                        </div>
                        <div>
                            <label htmlFor="montoMinimoEdit" className={labelStyles}>Monto Mínimo (Opc)</label>
                            <input id="montoMinimoEdit" type="number" step="0.01" value={montoMinimo} onChange={e=>setMontoMinimo(Number(e.target.value))} disabled={isSaving} className={inputStyles}/>
                        </div>
                         <div></div> {/* Placeholder */}
                        <div>
                            <label htmlFor="oficioNumEdit" className={labelStyles}>Núm. Oficio Petición (Opc)</label>
                            <input id="oficioNumEdit" type="text" value={oficioPeticionNumero} onChange={e=>setOficioPeticionNumero(e.target.value)} disabled={isSaving} className={inputStyles}/>
                        </div>
                        <div>
                            <label htmlFor="oficioFechaEdit" className={labelStyles}>Fecha Oficio Petición (Opc)</label>
                            <input id="oficioFechaEdit" type="date" value={oficioPeticionFecha} onChange={e=>setOficioPeticionFecha(e.target.value)} disabled={isSaving} className={inputStyles}/>
                        </div>
                    </div>
                 </fieldset>
             )}

            {/* --- Sección Datos Generales Contrato --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Datos del Contrato</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <div><label htmlFor="numeroProcedimientoEdit" className={labelStyles}>Núm. Procedimiento</label><input id="numeroProcedimientoEdit" type="text" value={numeroProcedimiento} onChange={e => setNumeroProcedimiento(e.target.value)} disabled={isSaving} className={inputStyles} /></div>
                     <div><label htmlFor="articuloFundamentoEdit" className={labelStyles}>Artículo Fundamento</label><input id="articuloFundamentoEdit" type="text" value={articuloFundamento} onChange={e => setArticuloFundamento(e.target.value)} disabled={isSaving} className={inputStyles} /></div>
                     <div className="md:col-span-2"><label htmlFor="objetoPrincipalEdit" className={labelStyles}>Objeto Principal *</label><input id="objetoPrincipalEdit" type="text" value={objetoPrincipal} onChange={e => setObjetoPrincipal(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                     <div className="md:col-span-2"><label htmlFor="descripcionDetalladaEdit" className={labelStyles}>Descripción Detallada</label><textarea id="descripcionDetalladaEdit" value={descripcionDetallada} onChange={e => setDescripcionDetallada(e.target.value)} disabled={isSaving} rows={4} className={textareaStyles} /></div>
                 </div>
            </fieldset>

            {/* --- Sección Vigencia y Monto --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Vigencia y Monto {tipoContratoState==='adquisicion'?'Máximo':'Total'}</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div><label htmlFor="fechaInicioEdit" className={labelStyles}>Fecha Inicio *</label><input id="fechaInicioEdit" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="fechaFinEdit" className={labelStyles}>Fecha Fin *</label><input id="fechaFinEdit" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div className="md:col-span-1 grid grid-cols-2 gap-x-3">
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="montoTotalEdit" className={labelStyles}>Monto {tipoContratoState==='adquisicion'?'Máximo':'Total'} *</label><input id="montoTotalEdit" type="number" step="0.01" value={montoTotal} onChange={e => setMontoTotal(Number(e.target.value))} required disabled={isSaving} className={inputStyles} /></div>
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="monedaEdit" className={labelStyles}>Moneda</label><select id="monedaEdit" value={moneda} onChange={e => setMoneda(e.target.value)} disabled={isSaving} className={selectStyles}><option value="MXN">MXN</option><option value="USD">USD</option></select></div>
                    </div>
                 </div>
            </fieldset>

             {/* --- Sección Suficiencia Presupuestal --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Suficiencia Presupuestal</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <div><label htmlFor="sufFechaEdit" className={labelStyles}>Fecha *</label><input id="sufFechaEdit" type="date" value={suficienciaFecha} onChange={e=>setSuficienciaFecha(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="sufNumOficioEdit" className={labelStyles}>Número Oficio *</label><input id="sufNumOficioEdit" type="text" value={suficienciaNumOficio} onChange={e=>setSuficienciaNumOficio(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="sufCuentaEdit" className={labelStyles}>Cuenta *</label><input id="sufCuentaEdit" type="text" value={suficienciaCuenta} onChange={e=>setSuficienciaCuenta(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="sufRecursoEdit" className={labelStyles}>Tipo Recurso *</label><input id="sufRecursoEdit" type="text" value={suficienciaRecurso} onChange={e=>setSuficienciaRecurso(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

            {/* --- Sección Área Requirente --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Área Requirente</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="reqNombreEdit" className={labelStyles}>Nombre Funcionario *</label><input id="reqNombreEdit" type="text" value={reqNombre} onChange={e=>setReqNombre(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="reqCargoEdit" className={labelStyles}>Cargo Funcionario *</label><input id="reqCargoEdit" type="text" value={reqCargo} onChange={e=>setReqCargo(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             {/* --- Sección Garantías y Cierre --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Garantías y Cierre</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <div><label htmlFor="montoGarantiaCumpEdit" className={labelStyles}>Monto Garantía Cumplimiento (Opc)</label><input id="montoGarantiaCumpEdit" type="number" step="0.01" value={montoGarantiaCump} onChange={e=>setMontoGarantiaCump(Number(e.target.value))} disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="montoGarantiaViciosEdit" className={labelStyles}>Monto Garantía Vicios Ocultos (Opc)</label><input id="montoGarantiaViciosEdit" type="number" step="0.01" value={montoGarantiaVicios} onChange={e=>setMontoGarantiaVicios(Number(e.target.value))} disabled={isSaving} className={inputStyles}/></div>
                     <div className="md:col-span-2"><label htmlFor="garantiasTextoEdit" className={labelStyles}>Texto Adicional Garantías (Opc)</label><textarea id="garantiasTextoEdit" value={garantiasTexto} onChange={e=>setGarantiasTexto(e.target.value)} disabled={isSaving} rows={2} className={textareaStyles}/></div>
                     <div className="md:col-span-2"><label htmlFor="condicionesPagoEdit" className={labelStyles}>Condiciones de Pago (Opc)</label><textarea id="condicionesPagoEdit" value={condicionesPago} onChange={e=>setCondicionesPago(e.target.value)} disabled={isSaving} rows={3} className={textareaStyles}/></div>
                     <div><label htmlFor="fechaFirmaEdit" className={labelStyles}>Fecha Firma/Elaboración</label><input id="fechaFirmaEdit" type="date" value={fechaFirma} onChange={e=>setFechaFirma(e.target.value)} disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="numeroHojasEdit" className={labelStyles}>Número Hojas</label><input id="numeroHojasEdit" type="number" value={numeroHojas} onChange={e=>setNumeroHojas(Number(e.target.value))} disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             {/* --- Selectores Opcionales Relacionados --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>IDs Relacionados (Opcional)</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="idSolicitudForm" className={labelStyles}>Solicitud</label>
                        <select id="idSolicitudForm" value={idSolicitud} onChange={(e) => setIdSolicitud(e.target.value)} disabled={disableSave} className={`${selectStyles} ${solicitudesError ? 'border-red-500' : ''}`}>
                            <option value="">{loadingSolicitudes ? 'Cargando...' : (solicitudesError ? 'Error' : '-- Ninguna --')}</option>
                            {!loadingSolicitudes && !solicitudesError && solicitudesOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                        </select>
                        {solicitudesError && <p className={errorTextStyles}>{solicitudesError}</p>}
                    </div>
                    <div>
                        <label htmlFor="idDictamenForm" className={labelStyles}>Dictamen</label>
                        <select id="idDictamenForm" value={idDictamen} onChange={(e) => setIdDictamen(e.target.value)} disabled={disableSave} className={`${selectStyles} ${dictamenesError ? 'border-red-500' : ''}`}>
                            <option value="">{loadingDictamenes ? 'Cargando...' : (dictamenesError ? 'Error' : '-- Ninguno --')}</option>
                            {!loadingDictamenes && !dictamenesError && dictamenesOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                        </select>
                        {dictamenesError && <p className={errorTextStyles}>{dictamenesError}</p>}
                    </div>
                    <div>
                        <label htmlFor="idConcursoForm" className={labelStyles}>Concurso</label>
                        <select id="idConcursoForm" value={idConcurso} onChange={(e) => setIdConcurso(e.target.value)} disabled={disableSave} className={`${selectStyles} ${concursosError ? 'border-red-500' : ''}`}>
                            <option value="">{loadingConcursos ? 'Cargando...' : (concursosError ? 'Error' : '-- Ninguno --')}</option>
                            {!loadingConcursos && !concursosError && concursosOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                        </select>
                        {concursosError && <p className={errorTextStyles}>{concursosError}</p>}
                    </div>
                </div>
                 </div>
            </fieldset>

            {/* --- Botones --- */}
            <div className="flex justify-end items-center space-x-3 pt-5 mt-6 border-t border-gray-300">
                {error && <p className={`${errorTextStyles} mr-auto`}>{error}</p>}
                <button type="button" onClick={onCancel} disabled={isSaving} className={buttonSecondaryStyles}>Cancelar</button>
                <button type="submit" disabled={disableSave} className={buttonPrimaryStyles}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};
export default ContractEditForm;