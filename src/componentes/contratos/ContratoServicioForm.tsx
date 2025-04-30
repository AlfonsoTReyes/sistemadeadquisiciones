// src/components/contratos/ContratoServicioForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { ContratoServicioInputData } from '@/types/contratoTemplateData';
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch'; // Asume que está aquí o ajusta
import { fetchSolicitudesForSelect } from '@/fetch/solicitudAdquisicionFetch';
import { fetchDictamenesForSelect } from '@/fetch/dictamenComiteFetch';
import { fetchConcursosForSelect } from '@/fetch/concursosFetch';

interface OptionType { id: number; label: string; }

interface ContratoServicioFormProps {
    onSubmit: (data: ContratoServicioInputData) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
    error?: string | null;
}

const ContratoServicioForm: React.FC<ContratoServicioFormProps> = ({ onSubmit, onCancel, isSaving, error }) => {
    console.log("Rendering ContratoServicioForm");

    // --- Estados (Mapeados a la plantilla de Servicio) ---
    const [idProveedor, setIdProveedor] = useState(''); // U3, U4, U16 etc. (Seleccionado)
    const [numeroProcedimiento, setNumeroProcedimiento] = useState(''); // U40? o el de encabezado (Ej: ADE.MSJR.SER.202502)
    const [objetoPrincipal, setObjetoPrincipal] = useState(''); // U26, U27, U28 (Nombre/Desc Corta Servicio)
    const [descripcionDetallada, setDescripcionDetallada] = useState(''); // Detalles extra, ANEXO 1?
    const [articuloFundamento, setArticuloFundamento] = useState('Artículo 22 Fracción X'); // U15
    const [montoTotal, setMontoTotal] = useState<number | ''>(''); // U30
    const [moneda, setMoneda] = useState('MXN');
    const [fechaInicio, setFechaInicio] = useState(''); // U29 Inicio Vigencia
    const [fechaFin, setFechaFin] = useState('');     // U29 Fin Vigencia
    const [fechaFirma, setFechaFirma] = useState('');   // U35 Fecha Elaboración/Firma Documento
    const [idConcurso, setIdConcurso] = useState(''); // Opcional
    const [idSolicitud, setIdSolicitud] = useState(''); // Opcional
    const [idDictamen, setIdDictamen] = useState(''); // Opcional
    // Suficiencia (U5-U8 / U11-U14)
    const [suficienciaFecha, setSuficienciaFecha] = useState(''); // U5 / U11
    const [suficienciaNumOficio, setSuficienciaNumOficio] = useState(''); // U6 / U12
    const [suficienciaCuenta, setSuficienciaCuenta] = useState(''); // U7 / U13
    const [suficienciaRecurso, setSuficienciaRecurso] = useState(''); // U8 / U14
    // Área Requirente (U2 / U10 / U36)
    const [reqNombre, setReqNombre] = useState(''); // U2 / U10 / U36 - Nombre
    const [reqCargo, setReqCargo] = useState('');   // U2 / U10 / U36 - Cargo
    // Garantías y Otros (U32, U33, U34)
    const [montoGarantiaCump, setMontoGarantiaCump] = useState<number | ''>(''); // U32
    const [montoGarantiaVicios, setMontoGarantiaVicios] = useState<number | ''>(''); // U33
    const [numeroHojas, setNumeroHojas] = useState<number | ''>(19); // U34 - Default según plantilla
    const [condicionesPago, setCondicionesPago] = useState(''); // Cláusula Octava / U31
    const [garantiasTexto, setGarantiasTexto] = useState(''); // Cláusula Décima Primera

    // --- Estados y useEffects para Selectores (Sin cambios) ---
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
        // Validaciones más específicas para Servicio
        if (!idProveedor) { alert("Seleccione proveedor"); return; }
        if (!objetoPrincipal) { alert("Ingrese el Objeto del Servicio"); return; }
        if (!fechaInicio || !fechaFin) { alert("Ingrese fechas de inicio y fin de vigencia"); return;}
        if (montoTotal === '' || isNaN(Number(montoTotal))) { alert("Ingrese monto total válido"); return; }
        if (!suficienciaFecha || !suficienciaNumOficio || !suficienciaCuenta || !suficienciaRecurso) { alert("Complete todos los datos de Suficiencia Presupuestal."); return; }
        if (!reqNombre || !reqCargo) { alert("Complete los datos del Área Requirente."); return; }
        if (!articuloFundamento) { alert("Ingrese Artículo Fundamento"); return;}
        if (!numeroHojas || isNaN(Number(numeroHojas)) || Number(numeroHojas) <=0) { alert("Ingrese un número de hojas válido"); return;}
        if (!fechaFirma) { alert("Ingrese fecha de firma/elaboración del contrato"); return;}


        const data: ContratoServicioInputData = {
            tipoContrato: 'servicio',
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
        };
        onSubmit(data);
    };

    // --- Clases Tailwind (sin cambios) ---
    const fieldsetStyles = "border border-gray-300 p-4 rounded-md shadow-sm mb-6";
    const legendStyles = "text-base font-semibold px-2 -ml-2 text-gray-700";
    const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
    const inputStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const textareaStyles = inputStyles + " min-h-[80px]";
    const selectStyles = inputStyles + " bg-white";
    const buttonPrimaryStyles = "px-5 py-2 rounded text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const buttonSecondaryStyles = "px-5 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";
    const errorTextStyles = "text-xs text-red-600 mt-1";

    const disableSave = isSaving || loadingProveedores || loadingSolicitudes || loadingDictamenes || loadingConcursos;

    return (
        <form onSubmit={handleSubmit} className="space-y-0">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Nuevo Contrato de Servicio</h2>

            {/* --- Proveedor (U3, U4, U16, U22, U23, U24, U25, U17-U21 implícitos) --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Proveedor</legend>
                <div>
                    <label htmlFor="idProveedorServ" className={labelStyles}>Seleccionar Prestador de Servicio *</label>
                    <select id="idProveedorServ" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required disabled={loadingProveedores || isSaving} className={`${selectStyles} ${proveedoresError ? 'border-red-500' : ''}`}>
                        <option value="" disabled>{loadingProveedores ? 'Cargando...' : (proveedoresError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                    </select>
                    {proveedoresError && <p className={errorTextStyles}>{proveedoresError}</p>}
                    <p className="text-xs text-gray-500 mt-1">La Razón Social, Nombre del Apoderado, RFC, Domicilio, etc., se obtendrán automáticamente.</p>
                </div>
            </fieldset>

            {/* --- Datos Generales Contrato (U1 (Fijo), U26-U28, U15, U40?) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Datos del Contrato</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     {/* U1 es fijo="Servicio" */}
                    <div>
                        <label htmlFor="numeroProcedimientoServ" className={labelStyles}>Núm. Procedimiento (Ej: ADE.MSJR.SER.YYYYXX)</label>
                        <input id="numeroProcedimientoServ" type="text" value={numeroProcedimiento} onChange={e => setNumeroProcedimiento(e.target.value)} placeholder="ADE.MSJR.SER.202502" disabled={isSaving} className={inputStyles} />
                    </div>
                    <div>
                         <label htmlFor="articuloFundamentoServ" className={labelStyles}>Artículo Fundamento Contratación * (U15)</label>
                         <input id="articuloFundamentoServ" type="text" value={articuloFundamento} onChange={e => setArticuloFundamento(e.target.value)} required disabled={isSaving} className={inputStyles} />
                     </div>
                     <div className="md:col-span-2">
                        <label htmlFor="objetoPrincipalServ" className={labelStyles}>Objeto/Descripción del Servicio * (U26-U28)</label>
                        <input id="objetoPrincipalServ" type="text" value={objetoPrincipal} onChange={e => setObjetoPrincipal(e.target.value)} required disabled={isSaving} placeholder="Ej: SERVICIO DE PÓLIZA DE MANTENIMIENTO..." className={inputStyles} />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="descripcionDetalladaServ" className={labelStyles}>Especificaciones/Alcance (Cláusula Segunda / ANEXO 1)</label>
                        <textarea id="descripcionDetalladaServ" value={descripcionDetallada} onChange={e => setDescripcionDetallada(e.target.value)} disabled={isSaving} rows={4} placeholder="Detallar especificaciones técnicas o indicar que se refieren al Anexo 1..." className={textareaStyles} />
                    </div>
                 </div>
             </fieldset>

            {/* --- Vigencia y Monto (U29, U30) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Vigencia y Monto</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div><label htmlFor="fechaInicioServ" className={labelStyles}>Fecha Inicio Vigencia *</label><input id="fechaInicioServ" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="fechaFinServ" className={labelStyles}>Fecha Fin Vigencia *</label><input id="fechaFinServ" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                     <div className="md:col-span-1 grid grid-cols-2 gap-x-3">
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="montoTotalServ" className={labelStyles}>Monto Total *</label><input id="montoTotalServ" type="number" step="0.01" value={montoTotal} onChange={e => setMontoTotal(Number(e.target.value))} required disabled={isSaving} className={inputStyles} /></div>
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="monedaServ" className={labelStyles}>Moneda</label><select id="monedaServ" value={moneda} onChange={e => setMoneda(e.target.value)} disabled={isSaving} className={selectStyles}><option value="MXN">MXN</option><option value="USD">USD</option></select></div>
                     </div>
                 </div>
            </fieldset>

            {/* --- Suficiencia Presupuestal (U5-U8 / U11-U14) --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Suficiencia Presupuestal</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="suficienciaFechaServ" className={labelStyles}>Fecha *</label><input id="suficienciaFechaServ" type="date" value={suficienciaFecha} onChange={e=>setSuficienciaFecha(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaNumOficioServ" className={labelStyles}>Número Oficio *</label><input id="suficienciaNumOficioServ" type="text" value={suficienciaNumOficio} onChange={e=>setSuficienciaNumOficio(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaCuentaServ" className={labelStyles}>Cuenta *</label><input id="suficienciaCuentaServ" type="text" value={suficienciaCuenta} onChange={e=>setSuficienciaCuenta(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaRecursoServ" className={labelStyles}>Tipo Recurso *</label><input id="suficienciaRecursoServ" type="text" value={suficienciaRecurso} onChange={e=>setSuficienciaRecurso(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             {/* --- Área Requirente (U2 / U10 / U36) --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Área Requirente</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="reqNombreServ" className={labelStyles}>Nombre Funcionario *</label><input id="reqNombreServ" type="text" value={reqNombre} onChange={e=>setReqNombre(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="reqCargoServ" className={labelStyles}>Cargo Funcionario *</label><input id="reqCargoServ" type="text" value={reqCargo} onChange={e=>setReqCargo(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

            {/* --- Garantías y Cierre (U32, U33, U34, U35) --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Garantías, Pago y Cierre</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* U32 - Monto Garantía Cumplimiento */}
                    <div><label htmlFor="montoGarantiaCumpServ" className={labelStyles}>Monto Garantía Cumplimiento (Opc)</label><input id="montoGarantiaCumpServ" type="number" step="0.01" value={montoGarantiaCump} onChange={e=>setMontoGarantiaCump(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% Monto Total"/></div>
                    {/* U33 - Monto Garantía Vicios */}
                    <div><label htmlFor="montoGarantiaViciosServ" className={labelStyles}>Monto Garantía Vicios Ocultos (Opc)</label><input id="montoGarantiaViciosServ" type="number" step="0.01" value={montoGarantiaVicios} onChange={e=>setMontoGarantiaVicios(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% Monto Total"/></div>
                    {/* Texto Adicional Garantías */}
                    <div className="md:col-span-2"><label htmlFor="garantiasTextoServ" className={labelStyles}>Texto Adicional Garantías (Cláusula Décima Primera)</label><textarea id="garantiasTextoServ" value={garantiasTexto} onChange={e=>setGarantiasTexto(e.target.value)} disabled={isSaving} rows={3} placeholder="Detallar tipo de garantía (fianza, cheque), forma de presentación, etc." className={textareaStyles}/></div>
                    {/* U31 / Cláusula Octava - Condiciones Pago */}
                    <div className="md:col-span-2"><label htmlFor="condicionesPagoServ" className={labelStyles}>Condiciones de Pago (Cláusula Octava)</label><textarea id="condicionesPagoServ" value={condicionesPago} onChange={e=>setCondicionesPago(e.target.value)} disabled={isSaving} rows={4} placeholder="Describir procedimiento de pago, plazos, documentación requerida (factura, evidencia), o referir a calendario (Anexo 3)..." className={textareaStyles}/></div>
                    {/* U35 - Fecha Firma Documento */}
                    <div><label htmlFor="fechaFirmaServ" className={labelStyles}>Fecha Elaboración/Firma Contrato *</label><input id="fechaFirmaServ" type="date" value={fechaFirma} onChange={e=>setFechaFirma(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    {/* U34 - Número Hojas */}
                    <div><label htmlFor="numeroHojasServ" className={labelStyles}>Número Total de Hojas *</label><input id="numeroHojasServ" type="number" value={numeroHojas} onChange={e=>setNumeroHojas(Number(e.target.value))} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             {/* --- IDs Relacionados (Opcional) --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>IDs Relacionados (Opcional)</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                     {/* Selectores Solicitud, Dictamen, Concurso */}
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
                    {isSaving ? 'Creando...' : 'Crear Contrato Servicio'}
                </button>
            </div>
        </form>
    );
};
export default ContratoServicioForm;