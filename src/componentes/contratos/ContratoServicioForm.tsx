// src/components/contratos/ContratoServicioForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { ContratoServicioInputData } from '@/types/contratoTemplateData';
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch';
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

    // --- Estados (Mismos que antes, representan ContratoServicioInputData) ---
    const [idProveedor, setIdProveedor] = useState('');
    const [numeroProcedimiento, setNumeroProcedimiento] = useState(''); // Ej: ADE.MSJR.SER.202502
    const [objetoPrincipal, setObjetoPrincipal] = useState(''); // Corresponde a U26/U27/U28
    const [descripcionDetallada, setDescripcionDetallada] = useState(''); // Para cláusulas o detalles extra
    const [articuloFundamento, setArticuloFundamento] = useState('Artículo 22 Fracción X'); // U15
    const [montoTotal, setMontoTotal] = useState<number | ''>(''); // U30
    const [moneda, setMoneda] = useState('MXN');
    const [fechaInicio, setFechaInicio] = useState(''); // U29
    const [fechaFin, setFechaFin] = useState('');     // U29
    const [fechaFirma, setFechaFirma] = useState('');   // U35 (Fecha elaboración/firma documento)
    const [idConcurso, setIdConcurso] = useState('');
    const [idSolicitud, setIdSolicitud] = useState('');
    const [idDictamen, setIdDictamen] = useState('');
    // Suficiencia (U5-U8 / U11-U14)
    const [suficienciaFecha, setSuficienciaFecha] = useState('');
    const [suficienciaNumOficio, setSuficienciaNumOficio] = useState('');
    const [suficienciaCuenta, setSuficienciaCuenta] = useState('');
    const [suficienciaRecurso, setSuficienciaRecurso] = useState('');
    // Área Requirente (U2 / U10 / U36)
    const [reqNombre, setReqNombre] = useState('');
    const [reqCargo, setReqCargo] = useState('');
    // Garantías y Otros (U32, U33, U34)
    const [montoGarantiaCump, setMontoGarantiaCump] = useState<number | ''>('');
    const [montoGarantiaVicios, setMontoGarantiaVicios] = useState<number | ''>('');
    const [numeroHojas, setNumeroHojas] = useState<number | ''>(19); // U34 - Default según plantilla
    const [condicionesPago, setCondicionesPago] = useState(''); // Cláusula Octava
    const [garantiasTexto, setGarantiasTexto] = useState(''); // Cláusula Décima Primera

    // --- Estados y useEffects para Selectores (Sin cambios en la lógica) ---
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
        if (!idProveedor) { alert("Seleccione proveedor"); return; }
        if (montoTotal === '' || isNaN(Number(montoTotal))) { alert("Ingrese monto total válido"); return; }
        if (!objetoPrincipal) { alert("Ingrese el objeto principal del servicio"); return; }
        if (!fechaInicio || !fechaFin) { alert("Ingrese fechas de inicio y fin"); return;}
        if (!suficienciaFecha || !suficienciaNumOficio || !suficienciaCuenta || !suficienciaRecurso) { alert("Complete todos los datos de Suficiencia Presupuestal."); return; }
        if (!reqNombre || !reqCargo) { alert("Complete los datos del Área Requirente."); return; }


        const data: ContratoServicioInputData = {
            tipoContrato: 'servicio',
            idProveedor: parseInt(idProveedor),
            numeroProcedimiento: numeroProcedimiento || null,
            objetoPrincipal: objetoPrincipal,
            descripcionDetallada: descripcionDetallada, // Asegúrate que este campo se use si es necesario
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
    const legendStyles = "text-base font-semibold px-2 -ml-2 text-gray-700"; // Ajustado tamaño
    const labelStyles = "block text-sm font-medium text-gray-700 mb-1"; // Aumentado peso y cambiado color
    const inputStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const textareaStyles = inputStyles + " min-h-[80px]";
    const selectStyles = inputStyles + " bg-white";
    const buttonPrimaryStyles = "px-5 py-2 rounded text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const buttonSecondaryStyles = "px-5 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";
    const errorTextStyles = "text-xs text-red-600 mt-1";

    const disableSave = isSaving || loadingProveedores || loadingSolicitudes || loadingDictamenes || loadingConcursos;


    return (
        <form onSubmit={handleSubmit} className="space-y-0"> {/* Sin espacio entre fieldsets */}
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Nuevo Contrato de Servicio</h2>

            {/* --- Proveedor (U3, U4, U16, U22, U23, U24, U25, U17-U21 implícitos) --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Proveedor</legend>
                <div>
                    <label htmlFor="idProveedor" className={labelStyles}>Seleccionar Proveedor *</label>
                    <select id="idProveedor" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required disabled={loadingProveedores || isSaving} className={`${selectStyles} ${proveedoresError ? 'border-red-500' : ''}`}>
                        <option value="" disabled>{loadingProveedores ? 'Cargando...' : (proveedoresError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                    </select>
                    {proveedoresError && <p className={errorTextStyles}>{proveedoresError}</p>}
                    <p className="text-xs text-gray-500 mt-1">La Razón Social, Nombre del Apoderado, RFC, Domicilio, etc., se obtendrán automáticamente al generar el documento.</p>
                </div>
            </fieldset>

             {/* --- Datos Generales Contrato --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Datos del Contrato</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                         <label htmlFor="numeroProcedimiento" className={labelStyles}>Núm. Procedimiento (Ej: ADE.MSJR.SER.YYYYXX)</label>
                         <input type="text" id="numeroProcedimiento" value={numeroProcedimiento} onChange={e => setNumeroProcedimiento(e.target.value)} placeholder="ADE.MSJR.SER.202502" disabled={isSaving} className={inputStyles} />
                    </div>
                     <div>
                         <label htmlFor="articuloFundamento" className={labelStyles}>Artículo Fundamento Contratación * (U15)</label>
                         <input type="text" id="articuloFundamento" value={articuloFundamento} onChange={e => setArticuloFundamento(e.target.value)} required disabled={isSaving} className={inputStyles} />
                     </div>
                     <div className="md:col-span-2">
                        <label htmlFor="objetoPrincipal" className={labelStyles}>Objeto Principal / Descripción Corta * (U26, U27, U28)</label>
                        <input type="text" id="objetoPrincipal" value={objetoPrincipal} onChange={e => setObjetoPrincipal(e.target.value)} required disabled={isSaving} placeholder="Ej: SERVICIO DE PÓLIZA DE MANTENIMIENTO..." className={inputStyles} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcionDetallada" className={labelStyles}>Descripción Detallada / Alcance (Opcional)</label>
                        <textarea id="descripcionDetallada" value={descripcionDetallada} onChange={e => setDescripcionDetallada(e.target.value)} disabled={isSaving} rows={4} placeholder="Detalles adicionales, especificaciones o contenido para cláusulas..." className={textareaStyles} />
                    </div>
                 </div>
             </fieldset>


            {/* --- Vigencia y Monto (U29, U30) --- */}
            <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Vigencia y Monto</legend>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div><label htmlFor="fechaInicio" className={labelStyles}>Fecha Inicio *</label><input type="date" id="fechaInicio" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="fechaFin" className={labelStyles}>Fecha Fin *</label><input type="date" id="fechaFin" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                     <div className="md:col-span-1 grid grid-cols-2 gap-x-3">
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="montoTotal" className={labelStyles}>Monto Total *</label><input type="number" step="0.01" id="montoTotal" value={montoTotal} onChange={e => setMontoTotal(Number(e.target.value))} required disabled={isSaving} className={inputStyles} /></div>
                        <div className="col-span-2 sm:col-span-1"><label htmlFor="moneda" className={labelStyles}>Moneda</label><select id="moneda" value={moneda} onChange={e => setMoneda(e.target.value)} disabled={isSaving} className={selectStyles}><option value="MXN">MXN</option><option value="USD">USD</option></select></div>
                     </div>
                 </div>
            </fieldset>

            {/* --- Suficiencia Presupuestal (U5-U8 / U11-U14) --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Suficiencia Presupuestal</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="suficienciaFecha" className={labelStyles}>Fecha *</label><input type="date" id="suficienciaFecha" value={suficienciaFecha} onChange={e=>setSuficienciaFecha(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaNumOficio" className={labelStyles}>Número Oficio *</label><input type="text" id="suficienciaNumOficio" value={suficienciaNumOficio} onChange={e=>setSuficienciaNumOficio(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaCuenta" className={labelStyles}>Cuenta *</label><input type="text" id="suficienciaCuenta" value={suficienciaCuenta} onChange={e=>setSuficienciaCuenta(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="suficienciaRecurso" className={labelStyles}>Tipo Recurso *</label><input type="text" id="suficienciaRecurso" value={suficienciaRecurso} onChange={e=>setSuficienciaRecurso(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

             {/* --- Área Requirente (U2 / U10 / U36) --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Área Requirente</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="reqNombre" className={labelStyles}>Nombre Funcionario *</label><input type="text" id="reqNombre" value={reqNombre} onChange={e=>setReqNombre(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="reqCargo" className={labelStyles}>Cargo Funcionario *</label><input type="text" id="reqCargo" value={reqCargo} onChange={e=>setReqCargo(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

            {/* --- Garantías y Cierre (U32, U33, U34, U35) --- */}
             <fieldset className={fieldsetStyles}>
                 <legend className={legendStyles}>Garantías y Cierre</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="montoGarantiaCump" className={labelStyles}>Monto Garantía Cumplimiento (Opc)</label><input type="number" step="0.01" id="montoGarantiaCump" value={montoGarantiaCump} onChange={e=>setMontoGarantiaCump(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% del Monto Total"/></div>
                    <div><label htmlFor="montoGarantiaVicios" className={labelStyles}>Monto Garantía Vicios Ocultos (Opc)</label><input type="number" step="0.01" id="montoGarantiaVicios" value={montoGarantiaVicios} onChange={e=>setMontoGarantiaVicios(Number(e.target.value))} disabled={isSaving} className={inputStyles} placeholder="Ej: 10% del Monto Total"/></div>
                    <div className="md:col-span-2"><label htmlFor="garantiasTexto" className={labelStyles}>Texto Adicional Garantías (Opc)</label><textarea id="garantiasTexto" value={garantiasTexto} onChange={e=>setGarantiasTexto(e.target.value)} disabled={isSaving} rows={2} placeholder="Detalles adicionales sobre las garantías..." className={textareaStyles}/></div>
                    <div className="md:col-span-2"><label htmlFor="condicionesPago" className={labelStyles}>Condiciones de Pago (Opc)</label><textarea id="condicionesPago" value={condicionesPago} onChange={e=>setCondicionesPago(e.target.value)} disabled={isSaving} rows={3} placeholder="Describir condiciones o referir a calendario de pago (Anexo 3)..." className={textareaStyles}/></div>
                    <div><label htmlFor="fechaFirma" className={labelStyles}>Fecha Firma/Elaboración *</label><input type="date" id="fechaFirma" value={fechaFirma} onChange={e=>setFechaFirma(e.target.value)} required disabled={isSaving} className={inputStyles}/></div>
                    <div><label htmlFor="numeroHojas" className={labelStyles}>Número Hojas *</label><input type="number" id="numeroHojas" value={numeroHojas} onChange={e=>setNumeroHojas(Number(e.target.value))} required disabled={isSaving} className={inputStyles}/></div>
                 </div>
            </fieldset>

            {/* --- Selectores Opcionales Relacionados --- */}
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
                    {isSaving ? 'Creando...' : 'Crear Contrato Servicio'}
                </button>
            </div>
        </form>
    );
};
export default ContratoServicioForm;