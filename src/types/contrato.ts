// src/types/contrato.ts

// Importa la interfaz detallada del proveedor si está en otro archivo
// Asume que tienes una interfaz ProveedorDetallado definida en algún lugar
// como se discutió en el servicio de proveedores
import { ProveedorDetallado } from '../services/proveedoresservice'; // Ajusta la ruta si es necesario

/**
 * Interfaz base que representa la estructura directa de la tabla 'contratos'.
 * Usada como base para otras interfaces.
 */
interface ContratoBase {
    readonly id_contrato: number; // Generalmente no se modifica directamente
    numero_contrato: string | null;
    id_solicitud: number | null;
    id_dictamen: number | null;
    id_proveedor: number; // Es NOT NULL en la tabla
    id_concurso: number | null;
    objeto_contrato: string; // Es NOT NULL en la tabla
    monto_total: string; // Usar string para NUMERIC para evitar problemas de precisión
    moneda: string | null;
    fecha_firma: string | null; // Formato YYYY-MM-DD
    fecha_inicio: string | null; // Formato YYYY-MM-DD
    fecha_fin: string | null; // Formato YYYY-MM-DD
    condiciones_pago: string | null;
    garantias: string | null;
    // Podrías añadir campos de auditoría si los tuvieras (created_at, updated_at)
}

/**
 * Datos necesarios para CREAR un nuevo contrato.
 * Excluye 'id_contrato' (generado por DB).
 * Define como requeridos los campos NOT NULL y lógicamente esenciales.
 */
export interface ContratoCreateData {
    numero_contrato?: string | null; // Opcional si se puede generar/omitir al crear
    id_solicitud?: number | null;
    id_dictamen?: number | null;
    id_proveedor: number; // Requerido para asociar el contrato
    id_concurso?: number | null;
    objeto_contrato: string; // Requerido lógicamente
    monto_total: string; // Requerido lógicamente (tipo string para numeric)
    moneda?: string | null; // Default 'MXN' en DB, puede ser opcional aquí
    fecha_firma?: string | null; // Formato YYYY-MM-DD
    fecha_inicio?: string | null; // Formato YYYY-MM-DD
    fecha_fin?: string | null; // Formato YYYY-MM-DD
    condiciones_pago?: string | null;
    garantias?: string | null;
}

/**
 * Datos permitidos para ACTUALIZAR un contrato existente.
 * Todos los campos son opcionales, ya que una actualización puede modificar
 * solo uno o varios campos. 'id_contrato' no se incluye aquí,
 * se usa para identificar qué contrato actualizar.
 */
export type ContratoUpdateData = Partial<Omit<ContratoBase, 'id_contrato'>>;
// Alternativamente, definir explícitamente todos como opcionales:
/*
export interface ContratoUpdateData {
    numero_contrato?: string | null;
    id_solicitud?: number | null;
    id_dictamen?: number | null;
    id_proveedor?: number; // Permitir cambiar proveedor? Revisar lógica de negocio
    id_concurso?: number | null;
    objeto_contrato?: string;
    monto_total?: string; // tipo string para numeric
    moneda?: string | null;
    fecha_firma?: string | null; // Formato YYYY-MM-DD
    fecha_inicio?: string | null; // Formato YYYY-MM-DD
    fecha_fin?: string | null; // Formato YYYY-MM-DD
    condiciones_pago?: string | null;
    garantias?: string | null;
}
*/


/**
 * Interfaz para representar un contrato en una lista (vista resumida).
 * Incluye campos clave del contrato y el nombre/razón social del proveedor.
 */
export interface ContratoEnLista {
    id_contrato: number;
    numero_contrato: string | null;
    objeto_contrato: string; // Podría ser un resumen o completo
    monto_total: string; // tipo string para numeric
    moneda: string | null;
    fecha_firma: string | null; // Formato YYYY-MM-DD
    fecha_inicio: string | null; // Formato YYYY-MM-DD
    fecha_fin: string | null; // Formato YYYY-MM-DD
    id_proveedor: number;
    nombre_proveedor_o_razon_social: string | null; // Obtenido del JOIN
    // Puedes añadir otros campos si son útiles en la lista (e.g., estatus si existiera)
}

/**
 * Interfaz para representar los detalles COMPLETOS de un contrato.
 * Incluye todos los campos de ContratoBase y la información detallada del proveedor.
 */
export interface ContratoDetallado extends ContratoBase {
    proveedor: ProveedorDetallado; // Objeto anidado con detalles del proveedor (físico/moral)
    // Campos descriptivos obtenidos de los JOINs (ajusta nombres según tu DB)
    numero_solicitud?: string | null; // Ejemplo
    resultado_dictamen?: string | null; // Ejemplo
    numero_concurso?: string | null;
    nombre_concurso?: string | null;

    // Campos de display combinados o fallbacks (opcional, definidos en el servicio)
    solicitud_display?: string | null;
    dictamen_display?: string | null;
    concurso_display?: string | null;
}

// Asegúrate de tener la interfaz ProveedorDetallado definida en `src/types/proveedor.ts`
// Ejemplo de cómo podría lucir (basado en tu servicio anterior):
/*
// En src/types/proveedor.ts (o donde corresponda)
export interface ProveedorBase {
     id_proveedor: number;
     rfc?: string | null;
     // ... otros campos comunes ...
     tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
     [key: string]: any; // Para flexibilidad si es necesario
}
export interface PersonaFisicaData {
     nombre_fisica?: string | null;
     apellido_p_fisica?: string | null;
     apellido_m_fisica?: string | null;
     curp?: string | null;
}
export interface ProveedorMoralData {
     razon_social?: string | null;
     representantes?: RepresentanteLegalOutput[]; // Array de representantes
}
// Interfaz para un representante devuelto
export interface RepresentanteLegalOutput {
    id_morales: number;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
}

// Tipo combinado que usa el servicio para devolver detalles
export type ProveedorDetallado = ProveedorBase & Partial<PersonaFisicaData> & Partial<ProveedorMoralData>;
*/