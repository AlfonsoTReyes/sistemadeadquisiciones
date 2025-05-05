"use client";
import React, { useState, useEffect } from "react";
import { getUsers } from '../../peticiones_api/fetchUsuarios'; // Asegúrate que la ruta sea correcta

// --- Interfaces ---
interface ApiUsuarioResponse {
  id_usuario: number | string;
  nombre_u?: string;
  nombre_s?: string;
  nombre_completo?: string;
  puesto?: string; // Cargo general del usuario
  email?: string;
  rol?: string;
  estatus?: string;
}
interface Usuario {
  id_usuario: number | string;
  nombre_completo: string;
  puesto?: string; // Cargo general
  email?: string;
}
interface Oferente {
  id_proveedor: number | string;
  razon_social: string;
}
interface ModalFalloProps {
  idDictamen: number | string;
  onClose: () => void;
  onSuccess: (nuevoFallo: any) => void;
}

// --- Tipo para la lista de asistentes confirmados ---
interface AsistenteConfirmado {
  usuario: Usuario;
  cargo: string; // Cargo específico para esta sesión
}

// --- Funciones Fetch (Simulada para oferentes) ---
const fetchOferentes = async (): Promise<Oferente[]> => {
  console.log("Simulando fetchOferentes...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return [ /* ... lista de oferentes ... */ ];
};

const ModalFallo: React.FC<ModalFalloProps> = ({ idDictamen, onClose, onSuccess }) => {
  // --- Estados del Formulario ---
  const [form, setForm] = useState({
    fecha_fallo: new Date().toISOString().split("T")[0],
    id_oferente_adjudicado: "",
    monto_subtotal_adjudicado: "",
    monto_iva_adjudicado: "",
    monto_total_adjudicado: "",
    numero_partidas_adjudicadas: "",
    observaciones: "",
  });

  // --- Estados para Datos y UI ---
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [oferentes, setOferentes] = useState<Oferente[]>([]);
  const [usuarioAsistenteSeleccionadoId, setUsuarioAsistenteSeleccionadoId] = useState<string>("");
  const [cargoTemporalAsistente, setCargoTemporalAsistente] = useState<string>(""); // <-- Nuevo estado para el cargo temporal
  const [asistentesConfirmados, setAsistentesConfirmados] = useState<AsistenteConfirmado[]>([]); // <-- Usa la nueva interfaz

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Carga de datos inicial ---
  useEffect(() => {
    const cargarDatos = async () => {
      // ... (lógica de carga y mapeo de usuarios igual que antes) ...
       setIsDataLoading(true);
      setError(null);
      try {
        const [usersDataFromApi, oferentesData] = await Promise.all([
          getUsers(),
          fetchOferentes(),
        ]);
        const safeUsersData = Array.isArray(usersDataFromApi) ? usersDataFromApi : [];
        const usuariosMapeados: Usuario[] = safeUsersData.map((u: ApiUsuarioResponse): Usuario => ({
            id_usuario: u.id_usuario,
            nombre_completo: (u.nombre_completo || `${u.nombre_u || ''} ${u.nombre_s || ''}`).trim(),
            puesto: u.puesto,
            email: u.email,
        }));
        setUsuarios(usuariosMapeados);
        setOferentes(Array.isArray(oferentesData) ? oferentesData : []);
      } catch (err) {
        console.error("Error cargando datos (usuarios/oferentes):", err);
        setError("No se pudieron cargar los datos necesarios (usuarios/oferentes).");
      } finally {
        setIsDataLoading(false);
      }
    };
    cargarDatos();
  }, []);

   // --- Efecto para pre-rellenar el cargo temporal cuando se selecciona un usuario ---
   useEffect(() => {
       if (usuarioAsistenteSeleccionadoId) {
           const user = usuarios.find(u => u.id_usuario.toString() === usuarioAsistenteSeleccionadoId);
           setCargoTemporalAsistente(user?.puesto || ""); // Usa el puesto general como default
       } else {
           setCargoTemporalAsistente(""); // Limpia si no hay selección
       }
   }, [usuarioAsistenteSeleccionadoId, usuarios]);

  // --- Manejador de cambios genérico ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Funciones para manejar la lista dinámica de asistentes (Modificada) ---
  const agregarAsistente = () => {
     // Validar que se haya seleccionado un usuario y escrito un cargo
     if (!usuarioAsistenteSeleccionadoId || !cargoTemporalAsistente.trim()) {
        alert("Por favor, selecciona un usuario y especifica su cargo para esta sesión.");
        return;
     };

    // Verificar si ya está en la lista
    const yaExiste = asistentesConfirmados.some(a => a.usuario.id_usuario.toString() === usuarioAsistenteSeleccionadoId);
    if (yaExiste) {
      alert("Este usuario ya ha sido agregado como asistente.");
      return;
    }

    const usuarioAAgregar = usuarios.find(u => u.id_usuario.toString() === usuarioAsistenteSeleccionadoId);

    if (usuarioAAgregar) {
      // Agrega el objeto con el usuario y el cargo específico
      setAsistentesConfirmados(prev => [
          ...prev,
          { usuario: usuarioAAgregar, cargo: cargoTemporalAsistente.trim() }
      ]);
      // Limpiar campos después de agregar
      setUsuarioAsistenteSeleccionadoId("");
      setCargoTemporalAsistente("");
    }
  };

  const eliminarAsistente = (idUsuarioAEliminar: number | string) => {
    // Filtra usando el id dentro del objeto 'usuario'
    setAsistentesConfirmados(prev => prev.filter(a => a.usuario.id_usuario.toString() !== idUsuarioAEliminar.toString()));
  };

  // --- Manejador de envío del formulario (Modificado) ---
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    // Validación
    if (!form.fecha_fallo || !form.id_oferente_adjudicado || !form.monto_total_adjudicado) {
       setError("Por favor, completa los campos obligatorios (Fecha, Oferente, Monto Total).");
       setIsLoading(false);
       return;
    }
     if (asistentesConfirmados.length === 0) {
       setError("Debes agregar al menos un participante a la sesión del fallo.");
       setIsLoading(false);
       return;
     }

    // Payload para 'fallos' (sin cambios)
     const falloPayload = {
       id_dictamen: idDictamen,
       fecha_fallo: form.fecha_fallo,
       id_oferente_adjudicado: parseInt(form.id_oferente_adjudicado) || null,
       monto_subtotal_adjudicado: form.monto_subtotal_adjudicado ? parseFloat(form.monto_subtotal_adjudicado) : null,
       monto_iva_adjudicado: form.monto_iva_adjudicado ? parseFloat(form.monto_iva_adjudicado) : null,
       monto_total_adjudicado: form.monto_total_adjudicado ? parseFloat(form.monto_total_adjudicado) : null,
       numero_partidas_adjudicadas: form.numero_partidas_adjudicadas ? parseInt(form.numero_partidas_adjudicadas) : null,
       observaciones: form.observaciones || null,
     };

    // Payload para 'participantes_fallos' (Modificado para usar el cargo guardado)
    const participantesPayload = asistentesConfirmados.map(item => ({
        id_usuario: parseInt(item.usuario.id_usuario.toString()),
        es_oferente: false,
        cargo_representacion: item.cargo, // <-- Usa el cargo específico guardado
        asistio: true,
        tipo: 'FALLO',
        firma: false,
    }));

    console.log("Enviando Fallo:", falloPayload);
    console.log("Enviando Participantes Fallo:", participantesPayload);

    // Envío a la API
    try {
      const response = await fetch('/api/fallos-con-participantes', { // Endpoint de ejemplo
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fallo: falloPayload,
            participantes: participantesPayload
        }),
      });
      // ... (manejo de respuesta y errores igual que antes) ...
      if (!response.ok) {
        let errorMsg = `Error ${response.status} al guardar el fallo.`;
        try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; }
        catch (jsonError) { errorMsg = `${errorMsg} (No se pudo obtener detalle del error)`; }
        throw new Error(errorMsg);
      }
      const nuevoFalloCreado = await response.json();
      onSuccess(nuevoFalloCreado);
      onClose();
    } catch (err: any) {
      console.error("Error al guardar fallo:", err);
      setError(err.message || "Ocurrió un error inesperado al intentar guardar el fallo.");
    } finally {
      setIsLoading(false);
    }
  };

   // Filtra usuarios para el dropdown (ahora filtra por el id dentro del objeto usuario)
   const usuariosDisponiblesParaAsistente = usuarios.filter(u =>
       !asistentesConfirmados.some(a => a.usuario.id_usuario.toString() === u.id_usuario.toString())
   );

  // --- JSX del Componente (Modificado) ---
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative">
        <h2 className="text-xl font-bold mb-6 text-center">Crear Nuevo Fallo</h2>

        {isDataLoading && <p className="text-center text-gray-500 py-4">Cargando datos...</p>}
        {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}

        {!isDataLoading && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

              {/* Columna 1: Datos del Fallo */}
              <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-800">Datos del Fallo</h3>
                 {/* ... (campos fecha, oferente, montos, partidas igual que antes) ... */}
                  <label className="flex flex-col mb-4">
                    <span className="font-medium text-gray-700 mb-1">Fecha del Fallo: <span className="text-red-500">*</span></span>
                    <input type="date" name="fecha_fallo" value={form.fecha_fallo} onChange={handleChange} required className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                  </label>
                  <label className="flex flex-col mb-4">
                    <span className="font-medium text-gray-700 mb-1">Oferente Adjudicado: <span className="text-red-500">*</span></span>
                    <select name="id_oferente_adjudicado" value={form.id_oferente_adjudicado} onChange={handleChange} required className="border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="">Seleccione Oferente...</option>
                      {oferentes.map(oferente => (<option key={oferente.id_proveedor} value={oferente.id_proveedor}>{oferente.razon_social}</option>))}
                    </select>
                  </label>
                  <label className="flex flex-col mb-4">
                    <span className="font-medium text-gray-700 mb-1">Monto Subtotal:</span>
                    <input type="number" step="0.01" name="monto_subtotal_adjudicado" value={form.monto_subtotal_adjudicado} placeholder="Ej: 873424.38" onChange={handleChange} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                  </label>
                  <label className="flex flex-col mb-4">
                    <span className="font-medium text-gray-700 mb-1">Monto IVA:</span>
                    <input type="number" step="0.01" name="monto_iva_adjudicado" value={form.monto_iva_adjudicado} placeholder="Ej: 139747.90" onChange={handleChange} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                  </label>
                  <label className="flex flex-col mb-4">
                    <span className="font-medium text-gray-700 mb-1">Monto Total: <span className="text-red-500">*</span></span>
                    <input type="number" step="0.01" name="monto_total_adjudicado" value={form.monto_total_adjudicado} placeholder="Ej: 1013172.28" onChange={handleChange} required className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                  </label>
                  <label className="flex flex-col">
                    <span className="font-medium text-gray-700 mb-1">No. Partidas Adjudicadas:</span>
                    <input type="number" name="numero_partidas_adjudicadas" value={form.numero_partidas_adjudicadas} placeholder="Ej: 66" onChange={handleChange} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                  </label>
              </div>

              {/* Columna 2: Participantes y Observaciones */}
              <div>
                 <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-800">Participantes de la Sesión</h3>
                 {/* --- Sección Dinámica de Asistentes MODIFICADA --- */}
                 <div className="mb-4 border rounded p-3 bg-gray-50">
                     <label className="font-medium text-gray-700 mb-1 block">Agregar Participante: <span className="text-red-500">*</span></label>
                     {/* Selector de Usuario */}
                     <select
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                        value={usuarioAsistenteSeleccionadoId}
                        onChange={(e) => setUsuarioAsistenteSeleccionadoId(e.target.value)}
                        disabled={isDataLoading}
                     >
                       <option value="">-- Selecciona Usuario --</option>
                       {usuariosDisponiblesParaAsistente.map(user => (
                         <option key={user.id_usuario} value={user.id_usuario}>
                           {user.nombre_completo} {user.puesto ? `(${user.puesto})` : ''}
                         </option>
                       ))}
                     </select>
                     {/* Input para el Cargo Específico */}
                      <label className="flex flex-col mb-2">
                          <span className="text-sm font-medium text-gray-600 mb-1">Cargo en esta sesión:</span>
                          <input
                             type="text"
                             value={cargoTemporalAsistente}
                             onChange={(e) => setCargoTemporalAsistente(e.target.value)}
                             placeholder="Ej: Vocal del Comité, Rep. Área Requirente, Invitado OIC"
                             className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                             disabled={!usuarioAsistenteSeleccionadoId} // Habilitar solo si hay usuario seleccionado
                          />
                      </label>
                     {/* Botón Agregar */}
                     <button
                        type="button"
                        onClick={agregarAsistente}
                        disabled={!usuarioAsistenteSeleccionadoId || !cargoTemporalAsistente.trim() || isDataLoading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                     >
                       Agregar Participante a la Lista
                     </button>

                     {/* Lista de Asistentes Confirmados */}
                     {asistentesConfirmados.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-600 mb-1">Participantes Agregados:</p>
                            <ul className="list-none space-y-1 max-h-40 overflow-y-auto border rounded p-2 bg-white">
                               {asistentesConfirmados.map((item) => (
                                  <li key={item.usuario.id_usuario} className="flex justify-between items-center text-sm py-1 border-b last:border-b-0">
                                     <div>
                                        <span className="font-medium">{item.usuario.nombre_completo}</span>
                                        <span className="text-gray-600 block text-xs">({item.cargo})</span> {/* Mostrar cargo */}
                                     </div>
                                     <button type="button" onClick={() => eliminarAsistente(item.usuario.id_usuario)} className="text-red-500 hover:text-red-700 text-xs font-medium ml-2 p-1" title="Quitar">
                                        ✕
                                     </button>
                                  </li>
                               ))}
                            </ul>
                        </div>
                     )}
                 </div>
                 {/* --- Fin Sección Dinámica --- */}

                  <label className="flex flex-col mt-5">
                   <span className="font-medium text-gray-700 mb-1">Observaciones:</span>
                   <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={5} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                 </label>
              </div>

            </div> {/* Fin del grid */}

            {/* Botones */}
            <div className="flex justify-end gap-4 mt-8 border-t pt-6">
              <button type="button" onClick={onClose} disabled={isLoading} className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isLoading || isDataLoading} className={`px-5 py-2 rounded-md text-white ${isLoading || isDataLoading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"}`}>
                {isLoading ? "Guardando..." : "Guardar Fallo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalFallo;