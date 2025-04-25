// src/components/contratos/ContratoAdquisicionForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { ContratoAdquisicionInputData } from '@/types/contratoTemplateData';
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch';
import { fetchSolicitudesForSelect } from '@/fetch/solicitudAdquisicionFetch';
import { fetchDictamenesForSelect } from '@/fetch/dictamenComiteFetch';
import { fetchConcursosForSelect } from '@/fetch/concursosFetch';

interface OptionType { id: number; label: string; }

interface ContratoAdquisicionFormProps {
    onSubmit: (data: ContratoAdquisicionInputData) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
    error?: string | null;
}

const ContratoAdquisicionForm: React.FC<ContratoAdquisicionFormProps> = ({ onSubmit, onCancel, isSaving, error }) => {
    console.log("Rendering ContratoAdquisicionForm");

    // --- Estados (sin cambios en la definición) ---
    const [idProveedor, setIdProveedor] = useState('');
    const [numeroProcedimiento, setNumeroProcedimiento] = useState(''); // Ej: ADM.MSJR.MAT.202503
    const [objetoPrincipal, setObjetoPrincipal] = useState(''); // Ej: ADQUISICIÓN DE CEMENTO Y PRODUCTOS...
    const [descripcionDetallada, setDescripcionDetallada] = useState('');
    const [articuloFundamento, setArticuloFundamento] = useState('Artículo 20 Fracción III');
    const [montoTotal, setMontoTotal] = useState<number | ''>(''); // Monto Máximo
    const [moneda, setMoneda] = useState('MXN');
    const [fechaInicio, setFechaInicio] = useState(''); // U43
    const [fechaFin, setFechaFin] = useState('');     // U43
    const [fechaFirma, setFechaFirma] = useState('');   // U49 (Fecha de elaboración/firma)
    const [idConcurso, setIdConcurso] = useState('');
    const [idSolicitud, setIdSolicitud] = useState('');
    const [idDictamen, setIdDictamen] = useState('');
    // Suficiencia (U10-U13 / U18)
    const [suficienciaFecha, setSuficienciaFecha] = useState('');
    const [suficienciaNumOficio, setSuficienciaNumOficio] = useState('');
    const [suficienciaCuenta, setSuficienciaCuenta] = useState('');
    const [suficienciaRecurso, setSuficienciaRecurso] = useState('');
    // Área Requirente (U2, U3 / U17 / U52)
    const [reqNombre, setReqNombre] = useState('');
    const [reqCargo, setReqCargo] = useState('');
    // Garantías y Otros (U46, U47, U48)
    const [montoGarantiaCump, setMontoGarantiaCump] = useState<number | ''>('');
    const [montoGarantiaVicios, setMontoGarantiaVicios] = useState<number | ''>('');
    const [numeroHojas, setNumeroHojas] = useState<number | ''>(22); // U48 - Default según plantilla
    const [condicionesPago, setCondicionesPago] = useState(''); // Cláusula Novena
    const [garantiasTexto, setGarantiasTexto] = useState(''); // Cláusula Décima Segunda

    // --- Estados específicos de Adquisición (U1, U5, U6, U9, U44, U54, U55) ---
    const [nombreContratoAdquisicion, setNombreContratoAdquisicion] = useState(''); // U1, U54, U65
    const [montoMinimo, setMontoMinimo] = useState<number | ''>(''); // U44
    const [oficioPeticionNumero, setOficioPeticionNumero] = useState(''); // U5
    const [oficioPeticionFecha, setOficioPeticionFecha] = useState(''); // U6
    // Nota: Funcionario recibe (U7) y dirige (U8) parecen fijos en la plantilla Adq.

    // --- Estados y useEffects para Selectores (Sin cambios en lógica) ---
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


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validaciones Adquisición
        if (!idProveedor) { alert("Seleccione proveedor"); return; }
        if (montoTotal === '' || isNaN(Number(montoTotal))) { alert("Ingrese monto máximo válido"); return; }
        if (!objetoPrincipal) { alert("Ingrese descripción corta/objeto"); return; }
        if (!nombreContratoAdquisicion) { alert("Ingrese el nombre del contrato (para título)"); return; }
        if (!suficienciaFecha || !suficienciaNumOficio || !suficienciaCuenta || !suficienciaRecurso) { alert("Complete todos los datos de Suficiencia Presupuestal."); return; }
        if (!reqNombre || !reqCargo) { alert("Complete los datos del Área Requirente."); return; }
        if (!fechaInicio || !fechaFin) { alert("Ingrese fechas de inicio y fin"); return;}
        if (!numeroHojas) { alert("Ingrese número de hojas"); return;}
        if (!fechaFirma) { alert("Ingrese fecha de firma/elaboración"); return;}


        const data: ContratoAdquisicionInputData = {
            // --- Comunes ---
            tipoContrato: 'adquisicion',
            idProveedor: parseInt(idProveedor),
            numeroProcedimiento: numeroProcedimiento || null,
            objetoPrincipal: objetoPrincipal,
            descripcionDetallada: descripcionDetallada,
            articuloFundamento: articuloFundamento,
            montoTotal: montoTotal as number,
            moneda: moneda,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            fechaFirma: fechaFirma || null,
            idConcurso: idConcurso ? parseInt(idConcurso) : null,
            idSolicitud: idSolicitud ? parseInt(idSolicitud) : null,
            idDictamen: idDictamen ? parseInt(idDictamen) : null,
            suficiencia: { fecha: suficienciaFecha, numeroOficio: suficienciaNumOficio, cuenta: suficienciaCuenta, tipoRecurso: suficienciaRecurso },
            areaRequirente: { nombreFuncionario: reqNombre, cargoFuncionario: reqCargo },
            montoGarantiaCumplimiento: montoGarantiaCump || null,
            montoGarantiaVicios: montoGarantiaVicios || null,
            numeroHojas: numeroHojas || null,
            condicionesPago: condicionesPago || null,
            garantiasTexto: garantiasTexto || null,
            // --- Específicos Adquisición ---
            nombreContratoAdquisicion: nombreContratoAdquisicion || null,
            montoMinimo: montoMinimo || null,
            oficioPeticionNumero: oficioPeticionNumero || null,
            oficioPeticionFecha: oficioPeticionFecha || null,
        };
        onSubmit(data);
    };

    const disableSave = isSaving || loadingProveedores || loadingSolicitudes || loadingDictamenes || loadingConcursos;

    // *** Definición de Clases Tailwind (igual que en ServicioForm) ***
    const fieldsetStyles = "border border-gray-300 p-4 rounded-md shadow-sm mb-6";
    const legendStyles = "text-base font-semibold px-2 -ml-2 text-gray-700";
    const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
    const inputStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const textareaStyles = inputStyles + " min-h-[80px]";
    const selectStyles = inputStyles + " bg-white";
    const buttonPrimaryStyles = "px-5 py-2 rounded text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const buttonSecondaryStyles = "px-5 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";
    const errorTextStyles = "text-xs text-red-600 mt-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-0">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Nuevo Contrato de Adquisición</h2>

             {/* --- Sección Datos Específicos Adquisición (U1, U5, U6, U9, U44, U54, U55) --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Datos Específicos de Adquisición</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label htmlFor="nombreContratoAdquisicion" className={labelStyles}>Nombre del Contrato (para Título) *</label>
                        <input id="nombreContratoAdquisicion" type="text" value={nombreContratoAdquisicion} onChange={e=>setNombreContratoAdquisicion(e.target.value)} required disabled={isSaving} className={inputStyles} placeholder="Ej: ADQUISICIÓN DE CEMENTO Y PRODUCTOS..." />
                    </div>
                    <div>
                        <label htmlFor="montoMinimo" className={labelStyles}>Monto Mínimo (Opc) (U44)</label>
                        <input id="montoMinimo" type="number" step="0.01" value={montoMinimo} onChange={e=>setMontoMinimo(Number(e.target.value))} disabled={isSaving} className={inputStyles}/>
                    </div>
                     <div></div> {/* Placeholder */}
                    <div>
                        <label htmlFor="oficioPeticionNumero" className={labelStyles}>Número Oficio Petición (Opc) (U5)</label>
                        <input id="oficioPeticionNumero" type="text" value={oficioPeticionNumero} onChange={e=>setOficioPeticionNumero(e.target.value)} disabled={isSaving} className={inputStyles}/>
                    </div>
                    <div>
                        <label htmlFor="oficioPeticionFecha" className={labelStyles}>Fecha Oficio Petición (Opc) (U6)</label>
                        <input id="oficioPeticionFecha" type="date" value={oficioPeticionFecha} onChange={e=>setOficioPeticionFecha(e.target.value)} disabled={isSaving} className={inputStyles}/>
                    </div>
                 </div>
             </fieldset>

             {/* --- Secciones Comunes (Proveedor, Datos Contrato, Vigencia/Monto, etc.) --- */}
            {/* Aplicar los mismos fieldset/legend/label/input/select styles que en ServicioForm */}

             <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Proveedor (U4, U19, U53, U56)</legend>
                <div> {/* Añadido div para agrupar label y select/error */}
                    <label htmlFor="idProveedor" className={labelStyles}>Proveedor *</label>
                    <select id="idProveedor" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required disabled={loadingProveedores || isSaving} className={`${selectStyles} ${proveedoresError ? 'border-red-500' : ''}`}>
                        <option value="" disabled>{loadingProveedores ? 'Cargando...' : (proveedoresError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                    </select>
                    {proveedoresError && <p className={errorTextStyles}>{proveedoresError}</p>}
                </div>
             </fieldset>

             <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Datos Generales del Contrato</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="numeroProcedimientoAdq" className={labelStyles}>Núm. Procedimiento (Ej: ADM.MSJR.MAT.YYYYXX) (U55, U59, U60, U66)</label><input id="numeroProcedimientoAdq" type="text" value={numeroProcedimiento} onChange={e => setNumeroProcedimiento(e.target.value)} placeholder="ADM.MSJR.MAT.202503" disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="articuloFundamentoAdq" className={labelStyles}>Artículo Fundamento * (U14)</label><input id="articuloFundamentoAdq" type="text" value={articuloFundamento} onChange={e => setArticuloFundamento(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div className="md:col-span-2"><label htmlFor="objetoPrincipalAdq" className={labelStyles}>Objeto Principal / Descripción Corta * (U9, U40, U41)</label><input id="objetoPrincipalAdq" type="text" value={objetoPrincipal} onChange={e => setObjetoPrincipal(e.target.value)} required disabled={isSaving} placeholder="Ej: ADQUISICIÓN DE CEMENTO..." className={inputStyles} /></div>
                    <div className="md:col-span-2"><label htmlFor="descripcionDetalladaAdq" className={labelStyles}>Descripción Detallada (Opcional) (U42)</label><textarea id="descripcionDetalladaAdq" value={descripcionDetallada} onChange={e => setDescripcionDetallada(e.target.value)} disabled={isSaving} rows={4} placeholder="Detalles adicionales de los bienes, cláusulas..." className={textareaStyles} /></div>
                 </div>
            </fieldset>

            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Vigencia y Monto Máximo (U43, U45)</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                     <div><label htmlFor="fechaInicioAdq" className={labelStyles}>Fecha Inicio *</label><input id="fechaInicioAdq" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                     <div><label htmlFor="fechaFinAdq" className={labelStyles}>Fecha Fin *</label><input id="fechaFinAdq" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                     <div className="md:col-span-1 grid grid-cols-2 gap-x-3">
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="montoTotalAdq" className={labelStyles}>Monto Máximo *</label><input id="montoTotalAdq" type="number" step="0.01" value={montoTotal} onChange={e => setMontoTotal(Number(e.target.value))} required disabled={isSaving} className={inputStyles} /></div>
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="monedaAdq" className={labelStyles}>Moneda</label><select id="monedaAdq" value={moneda} onChange={e => setMoneda(e.target.value)} disabled={isSaving} className={selectStyles}><option value="MXN">MXN</option><option value="USD">USD</option></select></div>
                     </div>
                 </div>
            </fieldset>

             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Suficiencia Presupuestal (U10-U13, U18, U62)</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <div><label htmlFor="suficienciaFechaAdq" className={labelStyles}>Fecha *</label><input id="suficienciaFechaAdq" type="date" value={suficienciaFecha} onChange={e=>setSuficienciaFecha(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="suficienciaNumOficioAdq" className={labelStyles}>Número Oficio *</label><input id="suficienciaNumOficioAdq" type="text" value={suficienciaNumOficio} onChange={e=>setSuficienciaNumOficio(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="suficienciaCuentaAdq" className={labelStyles}>Cuenta *</label><input id="suficienciaCuentaAdq" type="text" value={suficienciaCuenta} onChange={e=>setSuficienciaCuenta(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="suficienciaRecursoAdq" className={labelStyles}>Tipo Recurso *</label><input id="suficienciaRecursoAdq" type="text" value={suficienciaRecurso} onChange={e=>setSuficienciaRecurso(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Área Requirente (U2, U3, U17, U52)</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <div><label htmlFor="reqNombreAdq" className={labelStyles}>Nombre Funcionario *</label><input id="reqNombreAdq" type="text" value={reqNombre} onChange={e=>setReqNombre(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="reqCargoAdq" className={labelStyles}>Cargo Funcionario *</label><input id="reqCargoAdq" type="text" value={reqCargo} onChange={e=>setReqCargo(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Garantías y Cierre (U46, U47, U48, U49)</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="montoGarantiaCumpAdq" className={labelStyles}>Monto Garantía Cumplimiento (Opc)</label><input id="montoGarantiaCumpAdq" type="number" step="0.01" value={montoGarantiaCump} onChange={e=>setMontoGarantiaCump(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% Monto Máximo"/></div>
                    <div><label htmlFor="montoGarantiaViciosAdq" className={labelStyles}>Monto Garantía Vicios Ocultos (Opc)</label><input id="montoGarantiaViciosAdq" type="number" step="0.01" value={montoGarantiaVicios} onChange={e=>setMontoGarantiaVicios(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% Monto Máximo"/></div>
                    <div className="md:col-span-2"><label htmlFor="garantiasTextoAdq" className={labelStyles}>Texto Adicional Garantías (Opc)</label><textarea id="garantiasTextoAdq" value={garantiasTexto} onChange={e=>setGarantiasTexto(e.target.value)} disabled={isSaving} rows={2} className={textareaStyles}/></div>
                    <div className="md:col-span-2"><label htmlFor="condicionesPagoAdq" className={labelStyles}>Condiciones de Pago (Opc)</label><textarea id="condicionesPagoAdq" value={condicionesPago} onChange={e=>setCondicionesPago(e.target.value)} disabled={isSaving} rows={3} className={textareaStyles}/></div>
                    <div><label htmlFor="fechaFirmaAdq" className={labelStyles}>Fecha Firma/Elaboración *</label><input id="fechaFirmaAdq" type="date" value={fechaFirma} onChange={e=>setFechaFirma(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="numeroHojasAdq" className={labelStyles}>Número Hojas *</label><input id="numeroHojasAdq" type="number" value={numeroHojas} onChange={e=>setNumeroHojas(Number(e.target.value))} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>IDs Relacionados (Opcional)</legend>
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
            </fieldset>

            {/* --- Botones --- */}
            <div className="flex justify-end items-center space-x-3 pt-5 mt-6 border-t border-gray-300">
                {error && <p className={`${errorTextStyles} mr-auto`}>{error}</p>}
                <button type="button" onClick={onCancel} disabled={isSaving} className={buttonSecondaryStyles}>Cancelar</button>
                <button type="submit" disabled={disableSave} className={buttonPrimaryStyles}>
                    {isSaving ? 'Creando...' : 'Crear Contrato Adquisición'}
                </button>
            </div>
        </form>
    );
};
export default ContratoAdquisicionForm;