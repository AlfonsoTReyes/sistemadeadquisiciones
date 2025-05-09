"use client";
import React, { useState, useEffect } from "react";
// --- Importa tu función real para obtener usuarios ---
import { getUsers } from '../../peticiones_api/fetchUsuarios'; // Asegúrate que la ruta sea correcta
import { getProveedoresPartidas } from '../../../fetch/concursosFetch'; // Asegúrate que la ruta sea correcta


// 1. Interfaz que describe la estructura REAL que DEVUELVE tu API getUsers
//    Ajusta esto según lo que realmente retorna tu backend.
interface ApiUsuarioResponse {
  id_usuario: number | string;
  nombre_u?: string;         // Nombre(s)
  nombre_s?: string;         // Apellidos
  nombre_completo?: string; // Si la API a veces ya lo manda combinado
  puesto?: string;
  email?: string;
  rol?: string;
  estatus?: string;
  // Agrega cualquier otro campo que tu API devuelva y necesites o quieras ignorar
}

// 2. Interfaz que representa la estructura que NECESITA y USA este COMPONENTE
//    (Generalmente después de mapear/transformar la respuesta de la API)
interface Usuario {
  id_usuario: number | string;
  nombre_completo: string; // Campo esencial para mostrar en selects/listas
  puesto?: string;         // Útil para mostrar contexto
  email?: string;          // Útil para mostrar contexto
}

// Interfaz para los oferentes (ajusta si fetchOferentes es real)
interface Oferente {
  id_proveedor: number | string;
  nombre_o_razon_social: string;
}

// Props del componente
interface ModalDictamenProps {
  idConcurso: number | string;
  onClose: () => void;
  onSuccess: (nuevoDictamen: any) => void;
}



const ModalDictamen: React.FC<ModalDictamenProps> = ({ idConcurso, onClose, onSuccess }) => {
  // --- Estados del Formulario y Datos ---
  const [form, setForm] = useState({
    lugar_sesion: "SALA DE JUNTAS DEL CENTRO CÍVICO...",
    id_presidente_sesion: "",
    id_secretario_ejecutivo_sesion: "",
    hubo_quorum: true,
    id_oferente_adjudicado: "",
    monto_minimo_contrato_recomendado: "",
    monto_maximo_contrato_recomendado: "",
    partida: "",
    observaciones: "",
    fecha_sesion: new Date().toISOString().split("T")[0],
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // <-- Usa la interfaz del Componente
  const [oferentes, setOferentes] = useState<Oferente[]>([]);
  const [usuarioAsistenteSeleccionadoId, setUsuarioAsistenteSeleccionadoId] = useState<string>("");
  const [asistentesConfirmados, setAsistentesConfirmados] = useState<Usuario[]>([]); // <-- Usa la interfaz del Componente
  const [isLoading, setIsLoading] = useState(false); // Para el estado de envío
  const [isDataLoading, setIsDataLoading] = useState(true); // Para la carga inicial
  const [error, setError] = useState<string | null>(null);
  const [cargoTemporalAsistente, setCargoTemporalAsistente] = useState("");

  // --- Carga de datos inicial ---
  useEffect(() => {
    const cargarDatos = async () => {
      setIsDataLoading(true);
      setError(null);
      try {
        // Llama a las funciones de fetch
        const [usersDataFromApi, oferentesData] = await Promise.all([
          getUsers(),
          getProveedoresPartidas(),
        ]);

        // --- Mapeo de datos de usuarios ---
        const safeUsersData = Array.isArray(usersDataFromApi) ? usersDataFromApi : [];

        // Mapea la respuesta de la API (ApiUsuarioResponse) a la estructura que usa el componente (Usuario)
        const usuariosMapeados: Usuario[] = safeUsersData.map((u: ApiUsuarioResponse): Usuario => ({
            id_usuario: u.id_usuario, // Campo obligatorio
            // Construye 'nombre_completo' si no viene directamente, prioriza el campo directo si existe
            nombre_completo: (u.nombre_completo || `${u.nombre_u || ''} ${u.nombre_s || ''}`).trim(),
            puesto: u.puesto, // Pasa el puesto si existe
            email: u.email,   // Pasa el email si existe
            // Otros campos de ApiUsuarioResponse son ignorados aquí a menos que los añadas a la interfaz Usuario
        }));

        setUsuarios(usuariosMapeados); // Guarda los datos mapeados en el estado
        setOferentes(Array.isArray(oferentesData) ? oferentesData : []); // Asegura que oferentes sea array

      } catch (err) {
        console.error("Error cargando datos (usuarios/oferentes):", err);
        setError("No se pudieron cargar los datos necesarios (usuarios/oferentes). Verifica la conexión o contacta al administrador.");
      } finally {
        setIsDataLoading(false);
      }
    };
    cargarDatos();
  }, []); // Dependencia vacía para ejecutar solo al montar

  // --- Manejador de cambios genérico ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setForm((prev) => ({ ...prev, [name]: checked, }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value, }));
    }
  };

  // --- Funciones para manejar la lista dinámica de asistentes ---
  const agregarAsistente = () => {
     if (!usuarioAsistenteSeleccionadoId) return;
     if (usuarioAsistenteSeleccionadoId === form.id_presidente_sesion || usuarioAsistenteSeleccionadoId === form.id_secretario_ejecutivo_sesion) {
         alert("Este usuario ya fue seleccionado como Presidente o Secretario.");
         return;
     }
    const yaExiste = asistentesConfirmados.some(u => u.id_usuario.toString() === usuarioAsistenteSeleccionadoId);
    if (yaExiste) {
      alert("Este usuario ya ha sido agregado como asistente.");
      return;
    }
    // Busca en el estado 'usuarios' (que ya tiene la estructura correcta 'Usuario')
    const usuarioAAgregar = usuarios.find(u => u.id_usuario.toString() === usuarioAsistenteSeleccionadoId);
    if (usuarioAAgregar) {
      setAsistentesConfirmados(prev => [...prev, usuarioAAgregar]);
      setUsuarioAsistenteSeleccionadoId(""); // Limpia el select
    }
  };

  const eliminarAsistente = (idUsuarioAEliminar: number | string) => {
    setAsistentesConfirmados(prev => prev.filter(u => u.id_usuario.toString() !== idUsuarioAEliminar.toString()));
  };

  // --- Manejador de envío del formulario ---
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    // Validación básica
     if (!form.lugar_sesion || !form.id_presidente_sesion || !form.id_secretario_ejecutivo_sesion || !form.fecha_sesion || !form.id_oferente_adjudicado) {
      setError("Por favor, completa los campos obligatorios (Lugar, Presidente, Secretario, Fecha Sesión, Oferente Adjudicado).");
      setIsLoading(false);
      return;
    }

    // Preparar payload para la tabla 'dictamenes_fallos'
     const dictamenPayload = {
      id_concurso: idConcurso,
      lugar_sesion: form.lugar_sesion,
      id_presidente_sesion: parseInt(form.id_presidente_sesion) || null,
      id_secretario_ejecutivo_sesion: parseInt(form.id_secretario_ejecutivo_sesion) || null,
      hubo_quorum: form.hubo_quorum,
      id_oferente_adjudicado: parseInt(form.id_oferente_adjudicado) || null,
      monto_minimo_contrato_recomendado: form.monto_minimo_contrato_recomendado ? parseFloat(form.monto_minimo_contrato_recomendado) : null,
      monto_maximo_contrato_recomendado: form.monto_maximo_contrato_recomendado ? parseFloat(form.monto_maximo_contrato_recomendado) : null,
      partida: form.partida || null,
      observaciones: form.observaciones || null,
      fecha_sesion: form.fecha_sesion,
      // id_usuario_creador: Debe obtenerse en el backend a partir del usuario autenticado
    };

     // Preparar payload para la tabla 'participantes_fallos'
     const participantesPayload = [];

     // 1. Añadir Presidente (usa el estado 'usuarios' para buscar detalles)
     if (form.id_presidente_sesion) {
         const presidente = usuarios.find(u => u.id_usuario.toString() === form.id_presidente_sesion);
         participantesPayload.push({
             // id_reunion se asignará en el backend
             id_usuario: parseInt(form.id_presidente_sesion),
             es_oferente: false,
             cargo_representacion: presidente?.puesto ? `${presidente.puesto} (Presidente Sesión)` : "Presidente Sesión",
             asistio: true,
             tipo: 'DICTAMEN', // O el tipo adecuado
             firma: false,
         });
     }
     // 2. Añadir Secretario (usa el estado 'usuarios' para buscar detalles)
      if (form.id_secretario_ejecutivo_sesion && form.id_secretario_ejecutivo_sesion !== form.id_presidente_sesion) {
         const secretario = usuarios.find(u => u.id_usuario.toString() === form.id_secretario_ejecutivo_sesion);
         participantesPayload.push({
             id_usuario: parseInt(form.id_secretario_ejecutivo_sesion),
             es_oferente: false,
             cargo_representacion: secretario?.puesto ? `${secretario.puesto} (Secretario Ejecutivo)`: "Secretario Ejecutivo",
             asistio: true,
             tipo: 'DICTAMEN',
             firma: false,
         });
     }
     // 3. Añadir Asistentes Confirmados (usa el estado 'asistentesConfirmados')
     asistentesConfirmados.forEach(asistente => {
         // Doble chequeo por si acaso
         if (asistente.id_usuario.toString() !== form.id_presidente_sesion && asistente.id_usuario.toString() !== form.id_secretario_ejecutivo_sesion) {
             participantesPayload.push({
                 id_usuario: parseInt(asistente.id_usuario.toString()),
                 es_oferente: false,
                 cargo_representacion: asistente.puesto ? `${asistente.puesto} (Asistente)` : "Asistente",
                 asistio: true,
                 tipo: 'DICTAMEN',
                 firma: false,
             });
         }
     });

    // --- Envío a la API ---
    try {
       // ** NECESITAS IMPLEMENTAR ESTE ENDPOINT EN TU BACKEND **
       // Debe aceptar ambos objetos, crear el dictamen, obtener su ID,
       // y luego crear los registros de participantes asociados a ese ID.
       // Idealmente, dentro de una transacción de base de datos.
       const response = await fetch('/api/dictamenes-con-participantes', { // Endpoint de ejemplo
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
             dictamen: dictamenPayload,
             participantes: participantesPayload
         }),
      });

      if (!response.ok) {
        // Intenta obtener un mensaje de error más específico del backend
        let errorMsg = `Error ${response.status} al guardar el dictamen.`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (jsonError) {
            // Si el cuerpo no es JSON válido o está vacío
            errorMsg = `${errorMsg} (No se pudo obtener detalle del error)`;
        }
        throw new Error(errorMsg);
      }

      const nuevoDictamenCreado = await response.json(); // El backend debería devolver el dictamen creado

      onSuccess(nuevoDictamenCreado); // Llama al callback de éxito con la respuesta
      onClose(); // Cierra el modal
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setError(err.message || "Ocurrió un error inesperado al intentar guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filtrado de usuarios para el dropdown de asistentes ---
  const usuariosDisponiblesParaAsistente = usuarios.filter(u =>
      u.id_usuario.toString() !== form.id_presidente_sesion &&
      u.id_usuario.toString() !== form.id_secretario_ejecutivo_sesion &&
      !asistentesConfirmados.some(a => a.id_usuario.toString() === u.id_usuario.toString())
  );


  // --- JSX del Componente ---
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
        <h2 className="text-xl font-bold mb-6 text-center">Crear Nuevo Dictamen</h2>

        {/* Indicador de carga y Mensaje de Error */}
        {isDataLoading && <p className="text-center text-gray-500 py-4">Cargando datos necesarios...</p>}
        {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</p>}

        {/* Formulario */}
        {!isDataLoading && (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

              {/* Columna 1: Datos Generales */}
              <div>
                 <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-800">Datos de la Sesión</h3>
                 <label className="flex flex-col mb-4">
                   <span className="font-medium text-gray-700 mb-1">Lugar: <span className="text-red-500">*</span></span>
                   <textarea name="lugar_sesion" value={form.lugar_sesion} onChange={handleChange} required rows={3} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                 </label>
                 <label className="flex flex-col mb-4">
                   <span className="font-medium text-gray-700 mb-1">Fecha: <span className="text-red-500">*</span></span>
                   <input type="date" name="fecha_sesion" value={form.fecha_sesion} onChange={handleChange} required className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                 </label>
                 <label className="flex items-center space-x-2 mb-4">
                   <input type="checkbox" name="hubo_quorum" checked={form.hubo_quorum} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                   <span className="font-medium text-gray-700">Hubo quórum</span>
                 </label>
                 <label className="flex flex-col mb-4">
                   <span className="font-medium text-gray-700 mb-1">Partida(s):</span>
                   <input name="partida" value={form.partida} onChange={handleChange} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Ej: Única, 1 y 2, etc."/>
                 </label>
                  <label className="flex flex-col">
                   <span className="font-medium text-gray-700 mb-1">Observaciones:</span>
                   <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={4} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                 </label>
              </div>

              {/* Columna 2: Participantes y Montos */}
              <div>
                 <h3 className="text-lg font-semibold mb-3 border-b pb-1 text-gray-800">Participantes y Montos</h3>
                 {/* Selects para Presidente, Secretario, Oferente */}
                 <label className="flex flex-col mb-4">
                   <span className="font-medium text-gray-700 mb-1">Presidente sesión: <span className="text-red-500">*</span></span>
                   <select name="id_presidente_sesion" value={form.id_presidente_sesion} onChange={handleChange} required className="border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                     <option value="">Seleccione...</option>
                     {usuarios.map(user => (<option key={user.id_usuario} value={user.id_usuario}>{user.nombre_completo}</option>))}
                   </select>
                 </label>
                 <label className="flex flex-col mb-4">
                   <span className="font-medium text-gray-700 mb-1">Secretario ejecutivo: <span className="text-red-500">*</span></span>
                   <select name="id_secretario_ejecutivo_sesion" value={form.id_secretario_ejecutivo_sesion} onChange={handleChange} required className="border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                     <option value="">Seleccione...</option>
                     {usuarios.filter(u => u.id_usuario.toString() !== form.id_presidente_sesion).map(user => (<option key={user.id_usuario} value={user.id_usuario}>{user.nombre_completo}</option>))}
                   </select>
                 </label>

                 {/* Sección Dinámica de Asistentes */}
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
                                  <li key={item.id_usuario} className="flex justify-between items-center text-sm py-1 border-b last:border-b-0">
                                     <div>
                                        <span className="font-medium">{item.nombre_completo}</span>
                                        <span className="text-gray-600 block text-xs">({item.puesto})</span> {/* Mostrar cargo */}
                                     </div>
                                     <button type="button" onClick={() => eliminarAsistente(item.id_usuario)} className="text-red-500 hover:text-red-700 text-xs font-medium ml-2 p-1" title="Quitar">
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
                 {/* Fin Sección Dinámica */}

                 {/* Oferente y Montos */}
                 <label className="flex flex-col mb-4">
                   <span className="font-medium text-gray-700 mb-1">Oferente Adjudicado: <span className="text-red-500">*</span></span>
                   <select name="id_oferente_adjudicado" value={form.id_oferente_adjudicado} onChange={handleChange} required className="border border-gray-300 rounded-md shadow-sm p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                     <option value="">Seleccione Oferente...</option>
                     {oferentes.map(oferente => (<option key={oferente.id_proveedor} value={oferente.id_proveedor}>{oferente.nombre_o_razon_social}</option>))}
                   </select>
                 </label>
                 <label className="flex flex-col mb-4">
                   <span className="font-medium text-gray-700 mb-1">Monto mínimo recomendado:</span>
                   <input type="number" step="0.01" name="monto_minimo_contrato_recomendado" value={form.monto_minimo_contrato_recomendado} onChange={handleChange} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                 </label>
                 <label className="flex flex-col">
                   <span className="font-medium text-gray-700 mb-1">Monto máximo recomendado:</span>
                   <input type="number" step="0.01" name="monto_maximo_contrato_recomendado" value={form.monto_maximo_contrato_recomendado} onChange={handleChange} className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"/>
                 </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 mt-8 border-t pt-6">
              <button type="button" onClick={onClose} disabled={isLoading} className="bg-gray-500 text-white px-5 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50">
                Cancelar
              </button>
              <button type="submit" disabled={isLoading || isDataLoading} className={`px-5 py-2 rounded-md text-white ${isLoading || isDataLoading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"}`}>
                {isLoading ? "Guardando..." : "Guardar Dictamen"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalDictamen;