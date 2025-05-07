// src/types/contrato.ts

// Importa la interfaz detallada del proveedor si está en otro archivo
// Asume que tienes una interfaz ProveedorDetallado definida en algún lugar
// como se discutió en el servicio de proveedores
import { ProveedorDetallado } from '../services/proveedoresservice'; // Ajusta la ruta si es necesario
import { ContratoInputData } from './contratoTemplateData'; // Ajusta ruta
/**
 * Interfaz base que representa la estructura directa de la tabla 'contratos'.
 * Usada como base para otras interfaces.
 */
interface ContratoBase {
    readonly id_contrato: number;
    numero_contrato: string | null;
    id_solicitud: number | null; // ID se mantiene, el display vendrá de template_data
    id_dictamen: number | null;  // ID se mantiene
    id_proveedor: number;
    id_concurso: number | null;   // ID se mantiene
    objeto_contrato: string;     // Este podría ser el "objetoPrincipal"
    monto_total: string;         // Monto principal/máximo
    moneda: string | null;
    fecha_firma: string | null;  // Fecha de firma del *documento final* (distinta a la de elaboración)
    fecha_inicio: string | null;
    fecha_fin: string | null;
    condiciones_pago: string | null; // Podrían estar en template_data también
    garantias: string | null;        // Podrían estar en template_data también
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
export type ContratoUpdateData = Partial<Omit<ContratoBase, 'id_contrato'>>; // Update sobre campos core
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
// Interfaz para la lista (ContratoEnLista) probablemente no necesita cambios drásticos,
// a menos que quieras mostrar el 'tipoContrato' o algún dato clave del template_data.
export interface ContratoEnLista {
    id_contrato: number;
    numero_contrato: string | null;
    objeto_contrato: string;
    monto_total: string;
    moneda: string | null;
    fecha_firma: string | null;
    id_proveedor: number;
    nombre_proveedor_o_razon_social: string | null;
    // Opcional: añadir tipo
    tipo_contrato?: string | null;
}
/**
 * Interfaz para representar los detalles COMPLETOS de un contrato.
 * Incluye todos los campos de ContratoBase y la información detallada del proveedor.
 */
export interface ContratoDetallado extends ContratoBase {
    proveedor: ProveedorDetallado;
    // El campo JSONB parseado. Usamos Partial porque no todos los campos
    // de ContratoInputData aplican siempre (ej. Adquisición vs Servicio)
    // y algunos podrían ser opcionales.
    template_data?: Partial<ContratoInputData> & { tipoContrato: 'servicio' | 'adquisicion' }; // Asegura tipoContrato

    // Mantenemos los campos _display si el servicio los sigue generando (opcional)
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