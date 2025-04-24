// src/components/contratos/ContractCreateForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ContratoCreateData } from '@/types/contrato';
// Importa la nueva función fetch
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch';
import { fetchSolicitudesForSelect } from '@/fetch/solicitudAdquisicionFetch';
import { fetchDictamenesForSelect } from '@/fetch/dictamenComiteFetch';
import { fetchConcursosForSelect } from '@/fetch/concursosFetch';
interface OptionType { id: number; label: string; } // Tipo para opciones

interface ContractCreateFormProps {
    onSubmit: (newData: ContratoCreateData) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
    error?: string | null;
}

const ContractCreateForm: React.FC<ContractCreateFormProps> = ({ onSubmit, onCancel, isSaving, error }) => {
    // ... (estados existentes para otros campos: numeroContrato, idSolicitud, etc.) ...
    const [numeroContrato, setNumeroContrato] = useState('');
    const [idSolicitud, setIdSolicitud] = useState('');
    const [idDictamen, setIdDictamen] = useState('');
    const [idProveedor, setIdProveedor] = useState(''); // Sigue siendo string para el <select> value
    const [idConcurso, setIdConcurso] = useState('');
    const [objetoContrato, setObjetoContrato] = useState('');
    const [montoTotal, setMontoTotal] = useState('');
    const [moneda, setMoneda] = useState('MXN');
    const [fechaFirma, setFechaFirma] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [condicionesPago, setCondicionesPago] = useState('');
    const [garantias, setGarantias] = useState('');


    // *** ESTADOS PARA EL SELECTOR DE PROVEEDORES ***
    const [proveedoresOptions, setProveedoresOptions] = useState<OptionType[]>([]);
    const [loadingProveedores, setLoadingProveedores] = useState(true);
    const [proveedoresError, setProveedoresError] = useState<string | null>(null);
    // *** ESTADOS PARA SELECT DE SOLICITUDES ***
    const [solicitudesOptions, setSolicitudesOptions] = useState<OptionType[]>([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [solicitudesError, setSolicitudesError] = useState<string | null>(null);
    // *** ESTADOS PARA SELECT DE DICTÁMENES ***
    const [dictamenesOptions, setDictamenesOptions] = useState<OptionType[]>([]);
    const [loadingDictamenes, setLoadingDictamenes] = useState(true);
    const [dictamenesError, setDictamenesError] = useState<string | null>(null);
    // *** ESTADOS PARA SELECT DE CONCURSOS ***
    const [concursosOptions, setConcursosOptions] = useState<OptionType[]>([]);
    const [loadingConcursos, setLoadingConcursos] = useState(true);
    const [concursosError, setConcursosError] = useState<string | null>(null);
    // *** useEffect PARA CARGAR PROVEEDORES ***
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
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving) return;

        // Validación ID Proveedor seleccionado
        if (!idProveedor || isNaN(parseInt(idProveedor, 10))) {
            alert("Debe seleccionar un Proveedor válido.");
            return;
        }

        const newData: ContratoCreateData = {
            id_proveedor: parseInt(idProveedor, 10), // Asegurarse que es número
            objeto_contrato: objetoContrato,
            monto_total: montoTotal,
            // ... resto de los campos (con parseint/null checks como antes) ...
            numero_contrato: numeroContrato || null,
            id_solicitud: idSolicitud ? parseInt(idSolicitud, 10) : null,
            id_dictamen: idDictamen ? parseInt(idDictamen, 10) : null,
            id_concurso: idConcurso ? parseInt(idConcurso, 10) : null,
            moneda: moneda || 'MXN',
            fecha_firma: fechaFirma || null,
            fecha_inicio: fechaInicio || null,
            fecha_fin: fechaFin || null,
            condiciones_pago: condicionesPago || null,
            garantias: garantias || null,
        };
        // ... (otras validaciones como antes) ...
        if (!newData.objeto_contrato) { alert("Objeto requerido."); return; }
        if (!newData.monto_total || isNaN(parseFloat(newData.monto_total))) { alert("Monto inválido."); return; }

        onSubmit(newData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded shadow-sm bg-gray-50">
            {/* ... (Título y otros campos sin cambios) ... */}
            <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">Crear Nuevo Contrato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fila 1 */}
                <div>
                    <label htmlFor="numeroContrato" className="block text-sm font-medium text-gray-700">Número Contrato</label>
                    <input type="text" id="numeroContrato" value={numeroContrato} onChange={(e) => setNumeroContrato(e.target.value)} disabled={isSaving} className="mt-1 block w-full input-form" />
                </div>
                <div>
                    {/* *** SELECTOR DE PROVEEDOR *** */}
                    <label htmlFor="idProveedor" className="block text-sm font-medium text-gray-700">Proveedor *</label>
                    <select
                        id="idProveedor"
                        value={idProveedor} // Vinculado al estado del ID
                        onChange={(e) => setIdProveedor(e.target.value)}
                        required
                        disabled={isSaving || loadingProveedores}
                        className={`mt-1 block w-full select-form ${proveedoresError ? 'border-red-500' : ''}`}
                    >
                        <option value="" disabled>{loadingProveedores ? 'Cargando proveedores...' : (proveedoresError ? 'Error al cargar' : 'Seleccione un proveedor...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label} {/* Muestra el nombre/razón social */}
                            </option>
                        ))}
                    </select>
                    {proveedoresError && <p className="text-xs text-red-500 mt-1">{proveedoresError}</p>}
                    {/* *** FIN SELECTOR *** */}
                </div>
                <div>
                    {/* *** SELECTOR DE SOLICITUD *** */}
                    <label htmlFor="idSolicitud" className="block text-sm font-medium text-gray-700">Solicitud (Opcional)</label>
                    <select
                        id="idSolicitud"
                        value={idSolicitud}
                        onChange={(e) => setIdSolicitud(e.target.value)}
                        disabled={isSaving || loadingSolicitudes}
                        className={`mt-1 block w-full select-form ${solicitudesError ? 'border-red-500' : ''}`}
                    >
                        {/* Opción para permitir selección vacía (NULL) */}
                        <option value="">{loadingSolicitudes ? 'Cargando solicitudes...' : (solicitudesError ? 'Error al cargar' : '-- Ninguna --')}</option>
                        {!loadingSolicitudes && !solicitudesError && solicitudesOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label} {/* Muestra folio - asunto (fecha) */}
                            </option>
                        ))}
                    </select>
                    {solicitudesError && <p className="text-xs text-red-500 mt-1">{solicitudesError}</p>}
                    {/* *** FIN SELECTOR SOLICITUD *** */}
                </div>
                <div>
                    {/* *** SELECTOR DE DICTAMEN *** */}
                    <label htmlFor="idDictamen" className="block text-sm font-medium text-gray-700">Dictamen (Opcional)</label>
                    <select
                        id="idDictamen"
                        value={idDictamen}
                        onChange={(e) => setIdDictamen(e.target.value)}
                        disabled={isSaving || loadingDictamenes} // Deshabilitar si carga CUALQUIER selector
                        className={`mt-1 block w-full select-form ${dictamenesError ? 'border-red-500' : ''}`}
                    >
                        <option value="">{loadingDictamenes ? 'Cargando dictámenes...' : (dictamenesError ? 'Error al cargar' : '-- Ninguno --')}</option>
                        {!loadingDictamenes && !dictamenesError && dictamenesOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label} {/* Muestra ID - (Resultado) - Solicitud: ID - Fecha: ... */}
                            </option>
                        ))}
                    </select>
                    {dictamenesError && <p className="text-xs text-red-500 mt-1">{dictamenesError}</p>}
                    {/* *** FIN SELECTOR DICTAMEN *** */}
                </div>
                <div>
                    {/* *** SELECTOR DE CONCURSO *** */}
                    <label htmlFor="idConcurso" className="block text-sm font-medium text-gray-700">Concurso (Opcional)</label>
                    <select
                        id="idConcurso"
                        value={idConcurso}
                        onChange={(e) => setIdConcurso(e.target.value)}
                        disabled={isSaving || loadingConcursos}
                        className={`mt-1 block w-full select-form ${concursosError ? 'border-red-500' : ''}`}
                    >
                        <option value="">{loadingConcursos ? 'Cargando concursos...' : (concursosError ? 'Error al cargar' : '-- Ninguno --')}</option>
                        {!loadingConcursos && !concursosError && concursosOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label} {/* Muestra Numero - Nombre */}
                            </option>
                        ))}
                    </select>
                    {concursosError && <p className="text-xs text-red-500 mt-1">{concursosError}</p>}
                    {/* *** FIN SELECTOR CONCURSO *** */}
                </div>
                <div></div> {/* Placeholder */}

                {/* Objeto Contrato */}
                <div className="md:col-span-2">
                    <label htmlFor="objetoContrato" className="block text-sm font-medium text-gray-700">Objeto del Contrato *</label>
                    <textarea id="objetoContrato" value={objetoContrato} onChange={(e) => setObjetoContrato(e.target.value)} required disabled={isSaving} rows={3} className="mt-1 block w-full textarea-form" />
                </div>

                {/* Monto y Moneda */}
                <div>
                    <label htmlFor="montoTotal" className="block text-sm font-medium text-gray-700">Monto Total *</label>
                    <input type="number" step="0.01" id="montoTotal" value={montoTotal} onChange={(e) => setMontoTotal(e.target.value)} required disabled={isSaving} className="mt-1 block w-full input-form" />
                </div>
                <div>
                    <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">Moneda</label>
                    <select id="moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)} disabled={isSaving} className="mt-1 block w-full select-form">
                        <option value="MXN">MXN</option>
                        <option value="USD">USD</option>
                    </select>
                </div>

                {/* Fechas */}
                <div>
                    <label htmlFor="fechaFirma" className="block text-sm font-medium text-gray-700">Fecha Firma</label>
                    <input type="date" id="fechaFirma" value={fechaFirma} onChange={(e) => setFechaFirma(e.target.value)} disabled={isSaving} className="mt-1 block w-full input-form" />
                </div>
                <div>
                    <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                    <input type="date" id="fechaInicio" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} disabled={isSaving} className="mt-1 block w-full input-form" />
                </div>
                <div>
                    <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                    <input type="date" id="fechaFin" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={isSaving} className="mt-1 block w-full input-form" />
                </div>
                <div></div> {/* Placeholder */}

                {/* Condiciones y Garantías */}
                <div className="md:col-span-2">
                    <label htmlFor="condicionesPago" className="block text-sm font-medium text-gray-700">Condiciones de Pago</label>
                    <textarea id="condicionesPago" value={condicionesPago} onChange={(e) => setCondicionesPago(e.target.value)} disabled={isSaving} rows={3} className="mt-1 block w-full textarea-form" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="garantias" className="block text-sm font-medium text-gray-700">Garantías</label>
                    <textarea id="garantias" value={garantias} onChange={(e) => setGarantias(e.target.value)} disabled={isSaving} rows={3} className="mt-1 block w-full textarea-form" />
                </div>
            </div>
            {/* ... (Botones de acción) ... */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                {error && <p className="text-sm text-red-600 self-center mr-auto">{error}</p>}
                <button type="button" onClick={onCancel} disabled={isSaving} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50">
                    Cancelar
                </button>
                <button type="submit" disabled={isSaving} className={`px-4 py-2 rounded text-white ${isSaving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}>
                    {isSaving ? 'Guardando...' : 'Crear Contrato'}
                </button>
            </div>

        </form>
    );
};

export default ContractCreateForm;