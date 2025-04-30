// src/components/contratos/ContratoAdquisicionForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { ContratoAdquisicionInputData } from '@/types/contratoTemplateData';
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch'; // Asume que está aquí o ajusta ruta
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

    // --- Estados para campos (igual que antes) ---
    const [idProveedor, setIdProveedor] = useState('');
    const [numeroProcedimiento, setNumeroProcedimiento] = useState(''); // U55, U59, U66 etc.
    const [objetoPrincipal, setObjetoPrincipal] = useState(''); // U9, U40, U41 (Descripción corta)
    const [descripcionDetallada, setDescripcionDetallada] = useState(''); // U42 (Objeto detallado)
    const [articuloFundamento, setArticuloFundamento] = useState('Artículo 20 Fracción III'); // U14
    const [montoTotal, setMontoTotal] = useState<number | ''>(''); // Monto Máximo (U45)
    const [moneda, setMoneda] = useState('MXN');
    const [fechaInicio, setFechaInicio] = useState(''); // U43
    const [fechaFin, setFechaFin] = useState('');     // U43
    const [fechaFirma, setFechaFirma] = useState('');   // U49 (Fecha elaboración/firma)
    const [idConcurso, setIdConcurso] = useState('');
    const [idSolicitud, setIdSolicitud] = useState('');
    const [idDictamen, setIdDictamen] = useState('');
    // Suficiencia (U10-U13, U18, U62)
    const [suficienciaFecha, setSuficienciaFecha] = useState(''); // U10
    const [suficienciaNumOficio, setSuficienciaNumOficio] = useState(''); // U11
    const [suficienciaCuenta, setSuficienciaCuenta] = useState(''); // U12
    const [suficienciaRecurso, setSuficienciaRecurso] = useState(''); // U13
    // Área Requirente (U2, U3, U17, U52)
    const [reqNombre, setReqNombre] = useState(''); // U2
    const [reqCargo, setReqCargo] = useState(''); // U3
    // Garantías y Otros (U46, U47, U48)
    const [montoGarantiaCump, setMontoGarantiaCump] = useState<number | ''>(''); // U46
    const [montoGarantiaVicios, setMontoGarantiaVicios] = useState<number | ''>(''); // U47
    const [numeroHojas, setNumeroHojas] = useState<number | ''>(22); // U48
    const [condicionesPago, setCondicionesPago] = useState(''); // Cláusula Novena
    const [garantiasTexto, setGarantiasTexto] = useState(''); // Cláusula Décima Segunda

    // --- Estados específicos de Adquisición ---
    const [nombreContratoAdquisicion, setNombreContratoAdquisicion] = useState(''); // U1, U54, U65
    const [montoMinimo, setMontoMinimo] = useState<number | ''>(''); // U44
    const [oficioPeticionNumero, setOficioPeticionNumero] = useState(''); // U5
    const [oficioPeticionFecha, setOficioPeticionFecha] = useState(''); // U6
    // U7 y U8 parecen fijos/derivados, no se piden aquí por ahora.

    // --- Estados y useEffects para Selectores (igual) ---
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
        // Validaciones Adquisición (Más estrictas según plantilla)
        if (!nombreContratoAdquisicion) { alert("Ingrese el Nombre del Contrato (para encabezado)"); return; }
        if (!idProveedor) { alert("Seleccione proveedor"); return; }
        if (!numeroProcedimiento) { alert("Ingrese Número de Procedimiento"); return;}
        if (!reqNombre || !reqCargo) { alert("Complete los datos del Área Requirente."); return; }
        if (!oficioPeticionNumero || !oficioPeticionFecha) { alert("Ingrese los datos del Oficio de Petición."); return;} // Parecen requeridos en plantilla
        if (!objetoPrincipal) { alert("Ingrese la descripción corta de la adquisición"); return; }
        if (!suficienciaFecha || !suficienciaNumOficio || !suficienciaCuenta || !suficienciaRecurso) { alert("Complete todos los datos de Suficiencia Presupuestal."); return; }
        if (!articuloFundamento) { alert("Ingrese Artículo Fundamento"); return;}
        if (!fechaInicio || !fechaFin) { alert("Ingrese fechas de inicio y fin de vigencia"); return;}
        if (montoTotal === '' || isNaN(Number(montoTotal))) { alert("Ingrese monto máximo válido"); return; }
        // Monto mínimo es opcional
        // Garantías son opcionales en el formulario, pero los textos en el contrato pueden ser fijos
        if (!numeroHojas || isNaN(Number(numeroHojas)) || Number(numeroHojas) <=0) { alert("Ingrese un número de hojas válido"); return;}
        if (!fechaFirma) { alert("Ingrese fecha de firma/elaboración del contrato"); return;}


        const data: ContratoAdquisicionInputData = {
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
            nombreContratoAdquisicion: nombreContratoAdquisicion || null,
            montoMinimo: montoMinimo || null,
            oficioPeticionNumero: oficioPeticionNumero || null,
            oficioPeticionFecha: oficioPeticionFecha || null,
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
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Nuevo Contrato de Adquisición</h2>

            {/* --- Título y Procedimiento (U1, U54, U61, U65 | U51, U55, U59, U66) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Identificación del Contrato</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label htmlFor="nombreContratoAdquisicion" className={labelStyles}>Nombre del Contrato (para Título) *</label>
                        <input id="nombreContratoAdquisicion" type="text" value={nombreContratoAdquisicion} onChange={e=>setNombreContratoAdquisicion(e.target.value)} required disabled={isSaving} className={inputStyles} placeholder="Ej: ADQUISICIÓN DE CEMENTO Y PRODUCTOS..."/>
                    </div>
                    <div>
                        <label htmlFor="numeroProcedimientoAdq" className={labelStyles}>Núm. Procedimiento * (Ej: ADM.MSJR.MAT.YYYYXX)</label>
                        <input id="numeroProcedimientoAdq" type="text" value={numeroProcedimiento} onChange={e => setNumeroProcedimiento(e.target.value)} required placeholder="ADM.MSJR.MAT.202503" disabled={isSaving} className={inputStyles} />
                    </div>
                 </div>
             </fieldset>

            {/* --- Proveedor (U4, U19, U21, U53, U56, U60 | Datos PF/PM U20-U24 / U25-U39 ) --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Proveedor</legend>
                <div>
                    <label htmlFor="idProveedorAdq" className={labelStyles}>Seleccionar Proveedor *</label>
                    <select id="idProveedorAdq" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required disabled={loadingProveedores || isSaving} className={`${selectStyles} ${proveedoresError ? 'border-red-500' : ''}`}>
                        <option value="" disabled>{loadingProveedores ? 'Cargando...' : (proveedoresError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                    </select>
                    {proveedoresError && <p className={errorTextStyles}>{proveedoresError}</p>}
                     <p className="text-xs text-gray-500 mt-1">La Razón Social/Nombre, RFC, Domicilio, Datos Constitutivos/Poder (si aplica), etc., se obtendrán automáticamente para el documento.</p>
                </div>
            </fieldset>

            {/* --- Área Requirente y Petición (U2, U3, U17, U52 | U5, U6, U7, U8) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Área Requirente y Petición</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Área Requirente */}
                    <div><label htmlFor="reqNombreAdq" className={labelStyles}>Nombre Funcionario Requirente *</label><input id="reqNombreAdq" type="text" value={reqNombre} onChange={e=>setReqNombre(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="reqCargoAdq" className={labelStyles}>Cargo Funcionario Requirente *</label><input id="reqCargoAdq" type="text" value={reqCargo} onChange={e=>setReqCargo(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     {/* Oficio Petición */}
                     <div><label htmlFor="oficioPeticionNumeroAdq" className={labelStyles}>Número Oficio Petición *</label><input id="oficioPeticionNumeroAdq" type="text" value={oficioPeticionNumero} onChange={e=>setOficioPeticionNumero(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="oficioPeticionFechaAdq" className={labelStyles}>Fecha Oficio Petición *</label><input id="oficioPeticionFechaAdq" type="date" value={oficioPeticionFecha} onChange={e=>setOficioPeticionFecha(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                     {/* U7 y U8 parecen fijos, no se piden en el formulario */}
                 </div>
             </fieldset>

            {/* --- Objeto y Fundamento (U9, U40, U41, U42 | U14) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Objeto y Fundamento</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label htmlFor="objetoPrincipalAdq" className={labelStyles}>Objeto Principal / Descripción Corta *</label>
                        <input id="objetoPrincipalAdq" type="text" value={objetoPrincipal} onChange={e => setObjetoPrincipal(e.target.value)} required disabled={isSaving} placeholder="Ej: ADQUISICIÓN DE CEMENTO..." className={inputStyles} />
                    </div>
                    <div>
                         <label htmlFor="articuloFundamentoAdq" className={labelStyles}>Artículo Fundamento Contratación *</label>
                         <input id="articuloFundamentoAdq" type="text" value={articuloFundamento} onChange={e => setArticuloFundamento(e.target.value)} required disabled={isSaving} className={inputStyles} />
                     </div>
                      <div className="md:col-span-2">
                        <label htmlFor="descripcionDetalladaAdq" className={labelStyles}>Descripción Detallada Bienes (Opcional)</label>
                        <textarea id="descripcionDetalladaAdq" value={descripcionDetallada} onChange={e => setDescripcionDetallada(e.target.value)} disabled={isSaving} rows={4} placeholder="Detalles adicionales de los bienes, especificaciones técnicas, contenido de cláusulas..." className={textareaStyles} />
                    </div>
                 </div>
            </fieldset>

             {/* --- Suficiencia Presupuestal (U10-U13, U18, U62) --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Suficiencia Presupuestal</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="suficienciaFechaAdq" className={labelStyles}>Fecha *</label><input id="suficienciaFechaAdq" type="date" value={suficienciaFecha} onChange={e=>setSuficienciaFecha(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaNumOficioAdq" className={labelStyles}>Número Oficio *</label><input id="suficienciaNumOficioAdq" type="text" value={suficienciaNumOficio} onChange={e=>setSuficienciaNumOficio(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaCuentaAdq" className={labelStyles}>Cuenta *</label><input id="suficienciaCuentaAdq" type="text" value={suficienciaCuenta} onChange={e=>setSuficienciaCuenta(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaRecursoAdq" className={labelStyles}>Tipo Recurso *</label><input id="suficienciaRecursoAdq" type="text" value={suficienciaRecurso} onChange={e=>setSuficienciaRecurso(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                </div>
            </fieldset>


            {/* --- Vigencia y Montos (U43, U44, U45) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Vigencia y Montos</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div><label htmlFor="fechaInicioAdq" className={labelStyles}>Fecha Inicio Vigencia *</label><input id="fechaInicioAdq" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="fechaFinAdq" className={labelStyles}>Fecha Fin Vigencia *</label><input id="fechaFinAdq" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                     <div><label htmlFor="monedaAdq" className={labelStyles}>Moneda</label><select id="monedaAdq" value={moneda} onChange={e => setMoneda(e.target.value)} disabled={isSaving} className={selectStyles}><option value="MXN">MXN</option><option value="USD">USD</option></select></div>
                     <div><label htmlFor="montoMinimoAdq" className={labelStyles}>Monto Mínimo (Opc)</label><input id="montoMinimoAdq" type="number" step="0.01" value={montoMinimo} onChange={e=>setMontoMinimo(Number(e.target.value))} disabled={isSaving} className={inputStyles}/></div>
                     <div><label htmlFor="montoTotalAdq" className={labelStyles}>Monto Máximo *</label><input id="montoTotalAdq" type="number" step="0.01" value={montoTotal} onChange={e => setMontoTotal(Number(e.target.value))} required disabled={isSaving} className={inputStyles} /></div>
                 </div>
            </fieldset>

            {/* --- Garantías y Cierre (U46, U47, U48, U49) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Garantías y Cierre</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="montoGarantiaCumpAdq" className={labelStyles}>Monto Garantía Cumplimiento (Opc)</label><input id="montoGarantiaCumpAdq" type="number" step="0.01" value={montoGarantiaCump} onChange={e=>setMontoGarantiaCump(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% Monto Máximo"/></div>
                    <div><label htmlFor="montoGarantiaViciosAdq" className={labelStyles}>Monto Garantía Vicios Ocultos (Opc)</label><input id="montoGarantiaViciosAdq" type="number" step="0.01" value={montoGarantiaVicios} onChange={e=>setMontoGarantiaVicios(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% Monto Máximo"/></div>
                    <div className="md:col-span-2"><label htmlFor="garantiasTextoAdq" className={labelStyles}>Texto Adicional Garantías (Opc)</label><textarea id="garantiasTextoAdq" value={garantiasTexto} onChange={e=>setGarantiasTexto(e.target.value)} disabled={isSaving} rows={2} className={textareaStyles}/></div>
                    <div className="md:col-span-2"><label htmlFor="condicionesPagoAdq" className={labelStyles}>Condiciones de Pago (Opc)</label><textarea id="condicionesPagoAdq" value={condicionesPago} onChange={e=>setCondicionesPago(e.target.value)} disabled={isSaving} rows={3} placeholder="Describir condiciones o referir a Anexo 3..." className={textareaStyles}/></div>
                    <div><label htmlFor="fechaFirmaAdq" className={labelStyles}>Fecha Firma/Elaboración *</label><input id="fechaFirmaAdq" type="date" value={fechaFirma} onChange={e=>setFechaFirma(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="numeroHojasAdq" className={labelStyles}>Número Hojas *</label><input id="numeroHojasAdq" type="number" value={numeroHojas} onChange={e=>setNumeroHojas(Number(e.target.value))} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             {/* --- IDs Relacionados (Opcional) --- */}
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