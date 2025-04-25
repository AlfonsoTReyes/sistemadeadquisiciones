// src/components/contratos/ContractEditForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ContratoDetallado, ContratoUpdateData } from '@/types/contrato';
import { ContratoInputData, SuficienciaInput, AreaRequirenteInput } from '@/types/contratoTemplateData';
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch';
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

    // --- Inicialización de Estados (leyendo de initialData y initialData.template_data) ---
    const td = initialData.template_data ?? {};
    const suf = td.suficiencia as SuficienciaInput | undefined ?? {};
    const areaReq = td.areaRequirente as AreaRequirenteInput | undefined ?? {};

    // Estados para el formulario (inicializados desde initialData o td)
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


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving) return;

        // Validaciones básicas
        if (!idProveedor) { alert("Proveedor es requerido."); return; }
        if (!objetoPrincipal) { alert("Objeto Principal es requerido."); return; }
        if (montoTotal === '' || isNaN(Number(montoTotal))) { alert("Monto Total/Máximo inválido."); return; }


        // *** Construir el objeto template_data ACTUALIZADO ***
        const updatedTemplateData: Partial<ContratoInputData> = {
            tipoContrato: tipoContratoState,
            idProveedor: parseInt(idProveedor), // Guardamos el ID del proveedor por si acaso
            numeroProcedimiento: numeroProcedimiento || null,
            objetoPrincipal: objetoPrincipal,
            descripcionDetallada: descripcionDetallada,
            articuloFundamento: articuloFundamento,
            montoTotal: montoTotal || 0, // Guardamos el monto principal/máximo
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
            ...(tipoContratoState === 'adquisicion' && {
                nombreContratoAdquisicion: nombreContratoAdquisicion || null,
                montoMinimo: montoMinimo || null,
                oficioPeticionNumero: oficioPeticionNumero || null,
                oficioPeticionFecha: oficioPeticionFecha || null,
            }),
        };

        // *** Construir el objeto dataToUpdate PARA LA API PUT ***
        // Solo incluimos campos CORE que QUEREMOS permitir editar desde aquí
        // Y SIEMPRE incluimos template_data completo
        const dataToUpdate: ContratoUpdateData & { template_data?: object } = {
            // Campos 'core' que sí podrían editarse (comparar con estado inicial)
            numero_contrato: numeroProcedimiento !== (td.numeroProcedimiento ?? initialData.numero_contrato ?? '') ? (numeroProcedimiento || null) : undefined,
            id_proveedor: parseInt(idProveedor) !== initialData.id_proveedor ? parseInt(idProveedor) : undefined, // Permitir cambio?
            objeto_contrato: objetoPrincipal !== (td.objetoPrincipal ?? initialData.objeto_contrato ?? '') ? objetoPrincipal : undefined,
            monto_total: (montoTotal !== '' && parseFloat(montoTotal as string)) !== parseFloat(initialData.monto_total ?? 'NaN') ? String(montoTotal) : undefined,
            moneda: moneda !== (td.moneda ?? initialData.moneda ?? 'MXN') ? moneda : undefined,
            fecha_inicio: fechaInicio !== (td.fechaInicio?.split('T')[0] ?? initialData.fecha_inicio?.split('T')[0] ?? '') ? (fechaInicio || null) : undefined,
            fecha_fin: fechaFin !== (td.fechaFin?.split('T')[0] ?? initialData.fecha_fin?.split('T')[0] ?? '') ? (fechaFin || null) : undefined,
            // IDs relacionados (leer del estado del formulario, comparar con initialData)
            id_solicitud: (idSolicitud ? parseInt(idSolicitud) : null) !== initialData.id_solicitud ? (idSolicitud ? parseInt(idSolicitud) : null) : undefined,
            id_dictamen: (idDictamen ? parseInt(idDictamen) : null) !== initialData.id_dictamen ? (idDictamen ? parseInt(idDictamen) : null) : undefined,
            id_concurso: (idConcurso ? parseInt(idConcurso) : null) !== initialData.id_concurso ? (idConcurso ? parseInt(idConcurso) : null) : undefined,
            // ¿Actualizar condiciones/garantías core también?
            // condiciones_pago: condicionesPago !== (td.condicionesPago ?? initialData.condiciones_pago ?? '') ? (condicionesPago || null) : undefined,
            // garantias: garantiasTexto !== (td.garantiasTexto ?? initialData.garantias ?? '') ? (garantiasTexto || null) : undefined,

            // Enviar SIEMPRE el objeto template_data completo y actualizado
            template_data: updatedTemplateData,
        };

         // Eliminar propiedades undefined para no enviar campos sin cambios
         Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);

         // ¡AQUÍ! Añade un log para ver qué queda en dataToUpdate ANTES de llamar a onSubmit
         console.log("ContractEditForm: dataToUpdate final antes de onSubmit:", dataToUpdate);

         onSubmit(initialData.id_contrato, dataToUpdate);
    };

    // Deshabilitar botón
    const disableSave = isSaving || loadingProveedores || loadingSolicitudes || loadingDictamenes || loadingConcursos;

    // --- Clases reutilizables de Tailwind ---
    const fieldsetStyles = "border border-gray-300 p-4 rounded-md shadow-sm mb-6";
    const legendStyles = "text-lg font-semibold px-2 -ml-2 text-gray-700";
    const labelStyles = "block text-sm font-medium text-gray-600 mb-1";
    const inputStyles = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";
    const textareaStyles = inputStyles + " min-h-[80px]";
    const selectStyles = inputStyles + " bg-white";
    const buttonPrimaryStyles = "px-5 py-2 rounded text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
    const buttonSecondaryStyles = "px-5 py-2 rounded font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2";
    const errorTextStyles = "text-xs text-red-600 mt-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-0">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Editar Contrato ({tipoContratoState})</h2>

            {/* Renderizar secciones usando fieldset y los estilos definidos */}
            {/* Asegúrate de que los 'value' de los inputs/selects/textareas */}
            {/* estén vinculados a los estados correctos (ej: objetoPrincipal, montoTotal, etc.) */}

            {/* Ejemplo: Sección Proveedor */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Proveedor</legend>
                <div>
                    <label htmlFor="idProveedorEdit" className={labelStyles}>Proveedor *</label>
                    <select id="idProveedorEdit" value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required disabled={loadingProveedores || isSaving} className={`${selectStyles} ${proveedoresError ? 'border-red-500' : ''}`}>
                        <option value="" disabled>{loadingProveedores ? 'Cargando...' : (proveedoresError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(o => (<option key={o.id} value={o.id}>{o.label}</option>))}
                    </select>
                    {proveedoresError && <p className={errorTextStyles}>{proveedoresError}</p>}
                </div>
            </fieldset>

            {/* Ejemplo: Sección Específica Adquisición (condicional) */}
            {tipoContratoState === 'adquisicion' && (
                <fieldset className={fieldsetStyles}>
                    <legend className={legendStyles}>Datos Adquisición</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2"><label htmlFor="nombreContratoAdqEdit" className={labelStyles}>Nombre Contrato (Título) *</label><input id="nombreContratoAdqEdit" type="text" value={nombreContratoAdquisicion} onChange={e => setNombreContratoAdquisicion(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                        <div><label htmlFor="montoMinimoEdit" className={labelStyles}>Monto Mínimo (Opc)</label><input id="montoMinimoEdit" type="number" step="0.01" value={montoMinimo} onChange={e => setMontoMinimo(Number(e.target.value))} disabled={isSaving} className={inputStyles} /></div>
                        <div></div> {/* Placeholder */}
                        <div><label htmlFor="oficioNumEdit" className={labelStyles}>Núm. Oficio Petición (Opc)</label><input id="oficioNumEdit" type="text" value={oficioPeticionNumero} onChange={e => setOficioPeticionNumero(e.target.value)} disabled={isSaving} className={inputStyles} /></div>
                        <div><label htmlFor="oficioFechaEdit" className={labelStyles}>Fecha Oficio Petición (Opc)</label><input id="oficioFechaEdit" type="date" value={oficioPeticionFecha} onChange={e => setOficioPeticionFecha(e.target.value)} disabled={isSaving} className={inputStyles} /></div>
                    </div>
                </fieldset>
            )}

            {/* ... Renderiza el resto de las secciones (Datos Contrato, Vigencia/Monto, etc.) */}
            {/*     usando fieldset, legend, label, input/select/textarea con las clases correspondientes */}
            {/*     y vinculando el 'value' a los estados correctos (ej: objetoPrincipal, montoTotal, etc.) */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Datos del Contrato</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Aumenta gap */}
                    <div>
                        <label htmlFor="numeroProcedimiento" className={labelStyles}>Número Procedimiento/Contrato</label>
                        <input type="text" id="numeroProcedimiento" value={numeroProcedimiento} onChange={e => setNumeroProcedimiento(e.target.value)} disabled={isSaving} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="articuloFundamento" className={labelStyles}>Artículo Fundamento</label>
                        <input type="text" id="articuloFundamento" value={articuloFundamento} onChange={e => setArticuloFundamento(e.target.value)} disabled={isSaving} className={inputStyles} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="objetoPrincipal" className={labelStyles}>Objeto Principal *</label>
                        <input type="text" id="objetoPrincipal" value={objetoPrincipal} onChange={e => setObjetoPrincipal(e.target.value)} required disabled={isSaving} className={inputStyles} />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="descripcionDetallada" className={labelStyles}>Descripción Detallada (Cláusulas, etc.) *</label>
                        <textarea id="descripcionDetallada" value={descripcionDetallada} onChange={e => setDescripcionDetallada(e.target.value)} required disabled={isSaving} rows={4} className={textareaStyles} />
                    </div>
                </div>
            </fieldset>
            {/* --- Sección Vigencia y Monto --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Vigencia y Monto</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="fechaInicio" className={labelStyles}>Fecha Inicio *</label>
                        <input type="date" id="fechaInicio" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} required disabled={isSaving} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="fechaFin" className={labelStyles}>Fecha Fin *</label>
                        <input type="date" id="fechaFin" value={fechaFin} onChange={e => setFechaFin(e.target.value)} required disabled={isSaving} className={inputStyles} />
                    </div>
                    {/* Monto y Moneda agrupados */}
                    <div className="md:col-span-1 grid grid-cols-2 gap-x-3">
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="montoTotal" className={labelStyles}>Monto Total *</label>
                            <input type="number" step="0.01" id="montoTotal" value={montoTotal} onChange={e => setMontoTotal(Number(e.target.value))} required disabled={isSaving} className={inputStyles} />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label htmlFor="moneda" className={labelStyles}>Moneda</label>
                            <select id="moneda" value={moneda} onChange={e => setMoneda(e.target.value)} disabled={isSaving} className={selectStyles}>
                                <option value="MXN">MXN</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>
                </div>
            </fieldset>
            {/* ... y así sucesivamente para todas las secciones ... */}
            {/* --- Sección Suficiencia Presupuestal --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Suficiencia Presupuestal</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="suficienciaFecha" className={labelStyles}>Fecha Suficiencia *</label><input type="date" id="suficienciaFecha" value={suficienciaFecha} onChange={e => setSuficienciaFecha(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="suficienciaNumOficio" className={labelStyles}>Número Oficio *</label><input type="text" id="suficienciaNumOficio" value={suficienciaNumOficio} onChange={e => setSuficienciaNumOficio(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="suficienciaCuenta" className={labelStyles}>Cuenta *</label><input type="text" id="suficienciaCuenta" value={suficienciaCuenta} onChange={e => setSuficienciaCuenta(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="suficienciaRecurso" className={labelStyles}>Tipo Recurso *</label><input type="text" id="suficienciaRecurso" value={suficienciaRecurso} onChange={e => setSuficienciaRecurso(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                </div>
            </fieldset>
            {/* --- Sección Área Requirente --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Área Requirente</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Considera usar selects si tienes listas de funcionarios/cargos */}
                    <div><label htmlFor="reqNombre" className={labelStyles}>Nombre Funcionario *</label><input type="text" id="reqNombre" value={reqNombre} onChange={e => setReqNombre(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="reqCargo" className={labelStyles}>Cargo Funcionario *</label><input type="text" id="reqCargo" value={reqCargo} onChange={e => setReqCargo(e.target.value)} required disabled={isSaving} className={inputStyles} /></div>
                </div>
            </fieldset>
            {/* --- Sección Garantías y Cierre --- */}
            <fieldset className={fieldsetStyles}>
                <legend className={legendStyles}>Garantías y Cierre</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div><label htmlFor="montoGarantiaCump" className={labelStyles}>Monto Garantía Cumplimiento (Opc)</label><input type="number" step="0.01" id="montoGarantiaCump" value={montoGarantiaCump} onChange={e => setMontoGarantiaCump(Number(e.target.value))} disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="montoGarantiaVicios" className={labelStyles}>Monto Garantía Vicios Ocultos (Opc)</label><input type="number" step="0.01" id="montoGarantiaVicios" value={montoGarantiaVicios} onChange={e => setMontoGarantiaVicios(Number(e.target.value))} disabled={isSaving} className={inputStyles} /></div>
                    <div className="md:col-span-2"><label htmlFor="garantiasTexto" className={labelStyles}>Texto Adicional Garantías (Opc)</label><textarea id="garantiasTexto" value={garantiasTexto} onChange={e => setGarantiasTexto(e.target.value)} disabled={isSaving} rows={2} className={textareaStyles} /></div>
                    <div className="md:col-span-2"><label htmlFor="condicionesPago" className={labelStyles}>Condiciones de Pago (Opc)</label><textarea id="condicionesPago" value={condicionesPago} onChange={e => setCondicionesPago(e.target.value)} disabled={isSaving} rows={3} className={textareaStyles} /></div>
                    <div><label htmlFor="fechaFirma" className={labelStyles}>Fecha Firma/Elaboración</label><input type="date" id="fechaFirma" value={fechaFirma} onChange={e => setFechaFirma(e.target.value)} disabled={isSaving} className={inputStyles} /></div>
                    <div><label htmlFor="numeroHojas" className={labelStyles}>Número Hojas (Opc)</label><input type="number" id="numeroHojas" value={numeroHojas} onChange={e => setNumeroHojas(Number(e.target.value))} disabled={isSaving} className={inputStyles} /></div>
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


            {/* Botones */}
            <div className="flex justify-end items-center space-x-3 pt-5 mt-6 border-t border-gray-300">
                {error && <p className={errorTextStyles + " mr-auto"}>{error}</p>}
                <button type="button" onClick={onCancel} disabled={isSaving} className={buttonSecondaryStyles}>Cancelar</button>
                <button type="submit" disabled={disableSave} className={buttonPrimaryStyles}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
};
export default ContractEditForm;