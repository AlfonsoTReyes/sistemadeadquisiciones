// src/components/contratos/ContractEditForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ContratoDetallado, ContratoUpdateData } from '@/types/contrato';
import { fetchProveedoresForSelect } from '@/fetch/contratosFetch';
import { fetchSolicitudesForSelect } from '@/fetch/solicitudAdquisicionFetch';
import { fetchDictamenesForSelect } from '@/fetch/dictamenComiteFetch';
import { fetchConcursosForSelect } from '@/fetch/concursosFetch';


interface ContractEditFormProps {
    initialData: ContratoDetallado;
    onSubmit: (updatedData: ContratoUpdateData) => Promise<void>; // Función para manejar el guardado
    onCancel: () => void; // Función para cancelar
    isSaving?: boolean; // Para deshabilitar mientras guarda
    error?: string | null; // Para mostrar errores de guardado
}
interface OptionType { id: number; label: string; } // Tipo para opciones
const ContractEditForm: React.FC<ContractEditFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSaving = false,
    error = null,
}) => {
    // Estado local para cada campo del formulario
    // Inicializar con los datos actuales del contrato
    const [numeroContrato, setNumeroContrato] = useState(initialData.numero_contrato ?? '');
    const [idSolicitud, setIdSolicitud] = useState(initialData.id_solicitud?.toString() ?? '');
    const [idDictamen, setIdDictamen] = useState(initialData.id_dictamen?.toString() ?? '');
    // ¡OJO! Cambiar id_proveedor puede tener implicaciones. Asegúrate si es permitido.
    const [idProveedor, setIdProveedor] = useState(initialData.id_proveedor.toString());
    const [idConcurso, setIdConcurso] = useState(initialData.id_concurso?.toString() ?? '');
    const [objetoContrato, setObjetoContrato] = useState(initialData.objeto_contrato ?? '');
    const [montoTotal, setMontoTotal] = useState(initialData.monto_total ?? '');
    const [moneda, setMoneda] = useState(initialData.moneda ?? 'MXN');
    // Formato YYYY-MM-DD para input type="date"
    const [fechaFirma, setFechaFirma] = useState(initialData.fecha_firma?.split('T')[0] ?? '');
    const [fechaInicio, setFechaInicio] = useState(initialData.fecha_inicio?.split('T')[0] ?? '');
    const [fechaFin, setFechaFin] = useState(initialData.fecha_fin?.split('T')[0] ?? '');
    const [condicionesPago, setCondicionesPago] = useState(initialData.condiciones_pago ?? '');
    const [garantias, setGarantias] = useState(initialData.garantias ?? '');
    const [proveedoresOptions, setProveedoresOptions] = useState<OptionType[]>([]);
    const [loadingProveedores, setLoadingProveedores] = useState(true);
    const [proveedoresError, setProveedoresError] = useState<string | null>(null);
    // *** NUEVOS ESTADOS PARA SELECT DE SOLICITUDES ***
    const [solicitudesOptions, setSolicitudesOptions] = useState<OptionType[]>([]);
    const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
    const [solicitudesError, setSolicitudesError] = useState<string | null>(null);
    // *** NUEVOS ESTADOS PARA SELECT DE DICTÁMENES ***
    const [dictamenesOptions, setDictamenesOptions] = useState<OptionType[]>([]);
    const [loadingDictamenes, setLoadingDictamenes] = useState(true);
    const [dictamenesError, setDictamenesError] = useState<string | null>(null);
    // *** ESTADOS PARA SELECT DE CONCURSOS ***
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

        // Construir el objeto con los datos actualizados
        // Incluir solo los campos que deben ser actualizables
        const updatedData: ContratoUpdateData = {
            numero_contrato: numeroContrato || null, // Permitir null si se borra
            id_solicitud: idSolicitud ? parseInt(idSolicitud, 10) : null,
            id_dictamen: idDictamen ? parseInt(idDictamen, 10) : null,
            id_proveedor: parseInt(idProveedor, 10), // Asegurarse que siempre sea número (NOT NULL)
            id_concurso: idConcurso ? parseInt(idConcurso, 10) : null,
            objeto_contrato: objetoContrato, // NOT NULL
            monto_total: montoTotal, // NOT NULL (mantener como string)
            moneda: moneda || 'MXN', // Default si se deja vacío
            fecha_firma: fechaFirma || null,
            fecha_inicio: fechaInicio || null,
            fecha_fin: fechaFin || null,
            condiciones_pago: condicionesPago || null,
            garantias: garantias || null,
        };

        // Validar campos requeridos antes de enviar (ejemplo básico)
        if (!updatedData.id_proveedor || !updatedData.objeto_contrato || !updatedData.monto_total) {
            alert("Los campos ID Proveedor, Objeto del Contrato y Monto Total son requeridos.");
            return;
        }
        // Validar monto
        if (isNaN(parseFloat(updatedData.monto_total))) {
            alert("El Monto Total debe ser un número válido.");
            return;
        }

        onSubmit(updatedData); // Llama a la función pasada por props
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded shadow-sm bg-gray-50">
            <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">Editar Contrato</h2>

            {/* Campos del Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fila 1 */}
                <div>
                    <label htmlFor="numeroContrato" className="block text-sm font-medium text-gray-700">Número Contrato</label>
                    <input type="text" id="numeroContrato" value={numeroContrato} onChange={(e) => setNumeroContrato(e.target.value)} disabled={isSaving} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>
                <div>
                    {/* *** SELECTOR DE PROVEEDOR (igual que en CreateForm) *** */}
                    <label htmlFor="idProveedor" className="block text-sm font-medium text-gray-700">Proveedor *</label>
                    <select
                        id="idProveedor"
                        value={idProveedor} // Vinculado al estado del ID
                        onChange={(e) => setIdProveedor(e.target.value)}
                        required
                        disabled={isSaving || loadingProveedores}
                        className={`mt-1 block w-full select-form ${proveedoresError ? 'border-red-500' : ''}`}
                    >
                        {/* La opción inicial seleccionada será la que coincida con idProveedor del estado */}
                        <option value="" disabled>{loadingProveedores ? 'Cargando...' : (proveedoresError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingProveedores && !proveedoresError && proveedoresOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {proveedoresError && <p className="text-xs text-red-500 mt-1">{proveedoresError}</p>}
                </div>

                {/* Fila 2 */}
                <div>
                    {/* *** SELECTOR DE SOLICITUD (igual que en CreateForm) *** */}
                    <label htmlFor="idSolicitud" className="block text-sm font-medium text-gray-700">Solicitud</label>
                    <select
                        id="idSolicitud"
                        value={idProveedor} // Vinculado al estado del ID
                        onChange={(e) => setIdSolicitud(e.target.value)}
                        required
                        disabled={isSaving || loadingSolicitudes}
                        className={`mt-1 block w-full select-form ${solicitudesError ? 'border-red-500' : ''}`}
                    >
                        <option value="" disabled>{loadingSolicitudes ? 'Cargando...' : (solicitudesError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingSolicitudes && !solicitudesError && solicitudesOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {solicitudesError && <p className="text-xs text-red-500 mt-1">{solicitudesError}</p>}
                </div>
                <div>
                    {/* *** SELECTOR DE DICTAMEN (igual que en CreateForm) *** */}
                    <label htmlFor="idDictamen" className="block text-sm font-medium text-gray-700">Dictamen</label>
                    <select
                        id="idDictamen"
                        value={idDictamen} // Vinculado al estado del ID
                        onChange={(e) => setIdDictamen(e.target.value)}
                        required
                        disabled={isSaving || loadingDictamenes}
                        className={`mt-1 block w-full select-form ${dictamenesError ? 'border-red-500' : ''}`}
                    >
                        <option value="" disabled>{loadingDictamenes ? 'Cargando...' : (dictamenesError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingDictamenes && !dictamenesError && dictamenesOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {dictamenesError && <p className="text-xs text-red-500 mt-1">{dictamenesError}</p>}
                </div>

                {/* Fila 3 */}
                <div>
                    {/* *** SELECTOR DE CONCURSO (igual que en CreateForm) *** */}
                    <label htmlFor="idConcurso" className="block text-sm font-medium text-gray-700">Concurso</label>
                    <select
                        id="idConcurso"
                        value={idConcurso} // Vinculado al estado del ID
                        onChange={(e) => setIdConcurso(e.target.value)}
                        required
                        disabled={isSaving || loadingConcursos}
                        className={`mt-1 block w-full select-form ${concursosError ? 'border-red-500' : ''}`}
                    >
                        <option value="" disabled>{loadingConcursos ? 'Cargando...' : (concursosError ? 'Error' : 'Seleccione...')}</option>
                        {!loadingConcursos && !concursosError && concursosOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {loadingConcursos && <p className="text-xs text-red-500 mt-1">{concursosError}</p>}
                </div>
                <div></div> {/* Placeholder para alinear */}

                {/* Objeto Contrato */}
                <div className="md:col-span-2">
                    <label htmlFor="objetoContrato" className="block text-sm font-medium text-gray-700">Objeto del Contrato *</label>
                    <textarea id="objetoContrato" value={objetoContrato} onChange={(e) => setObjetoContrato(e.target.value)} required disabled={isSaving} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>

                {/* Monto y Moneda */}
                <div>
                    <label htmlFor="montoTotal" className="block text-sm font-medium text-gray-700">Monto Total *</label>
                    <input type="number" step="0.01" id="montoTotal" value={montoTotal} onChange={(e) => setMontoTotal(e.target.value)} required disabled={isSaving} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>
                <div>
                    <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">Moneda</label>
                    <select id="moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)} disabled={isSaving} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100">
                        <option value="MXN">MXN</option>
                        <option value="USD">USD</option>
                        {/* Añadir otras monedas si es necesario */}
                    </select>
                </div>

                {/* Fechas */}
                <div>
                    <label htmlFor="fechaFirma" className="block text-sm font-medium text-gray-700">Fecha Firma</label>
                    <input type="date" id="fechaFirma" value={fechaFirma} onChange={(e) => setFechaFirma(e.target.value)} disabled={isSaving} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>
                <div>
                    <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
                    <input type="date" id="fechaInicio" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} disabled={isSaving} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>
                <div>
                    <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">Fecha Fin</label>
                    <input type="date" id="fechaFin" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={isSaving} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>

                {/* Condiciones y Garantías */}
                <div className="md:col-span-2">
                    <label htmlFor="condicionesPago" className="block text-sm font-medium text-gray-700">Condiciones de Pago</label>
                    <textarea id="condicionesPago" value={condicionesPago} onChange={(e) => setCondicionesPago(e.target.value)} disabled={isSaving} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="garantias" className="block text-sm font-medium text-gray-700">Garantías</label>
                    <textarea id="garantias" value={garantias} onChange={(e) => setGarantias(e.target.value)} disabled={isSaving} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100" />
                </div>

            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                {error && <p className="text-sm text-red-600 self-center mr-auto">{error}</p>}
                <button type="button" onClick={onCancel} disabled={isSaving} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50">
                    Cancelar
                </button>
                <button type="submit" disabled={isSaving} className={`px-4 py-2 rounded text-white ${isSaving ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-50`}>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

        </form>
    );
};

export default ContractEditForm;