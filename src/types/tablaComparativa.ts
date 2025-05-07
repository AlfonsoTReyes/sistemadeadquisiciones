// src/types/tablaComparativa.ts

/**
 * Define los diferentes estados posibles para una tabla comparativa.
 */
export type EstadoTablaComparativa = 'borrador' | 'en_revision' | 'aprobada' | 'rechazada';

/**
 * Representa una característica técnica de un ítem.
 */
export interface CaracteristicaTecnica {
    numero?: number | string; // Número de orden o identificador
    elemento: string;        // Descripción de la característica
}

// ======================================================================
// Interfaces Base (Reflejan estructura de tablas principales)
// ======================================================================

/**
 * Interfaz base para la tabla principal `tablas_comparativas`.
 */
export interface TablaComparativa {
    id: number;
    nombre: string;
    descripcion: string | null;
    fecha_creacion: Date | string; // Usar Date preferiblemente, string si viene serializado
    fecha_actualizacion: Date | string;
    estado: EstadoTablaComparativa;
    id_usuario_creador: number | null;
}

/**
 * Interfaz base para la tabla `tabla_comparativa_proveedores`,
 * representa el snapshot de datos de un proveedor en una tabla específica.
 */
export interface TablaComparativaProveedorSnapshot {
    id: number;
    id_tabla_comparativa: number;
    id_proveedor: number;
    nombre_empresa_snapshot: string;
    rfc_snapshot: string;
    giro_comercial_snapshot: string | null;
    domicilio_snapshot: string | null;
    telefono_snapshot: string | null;
    correo_electronico_snapshot: string | null;
    pagina_web_snapshot: string | null;
    subtotal_proveedor: number;
    iva_proveedor: number;
    total_proveedor: number;
}

/**
 * Interfaz base para la tabla `tabla_comparativa_items`.
 * Representa un ítem (producto/servicio) cotizado por un proveedor.
 */
export interface TablaComparativaItem {
    id: number;
    id_tabla_comparativa_proveedor: number;
    id_articulo_origen: number | null; // FK opcional a 'articulos_proveedor'
    codigo_partida_origen: string | null; // Código de partida del artículo original
    descripcion_item: string;
    caracteristicas_tecnicas: CaracteristicaTecnica[] | null; // Array de características o null
    udm: string; // Unidad de Medida
    cantidad: number;
    precio_unitario: number;
    subtotal_item: number; // Calculado: cantidad * precio_unitario
}

/**
 * Interfaz base para la tabla `tabla_comparativa_observaciones`.
 */
export interface TablaComparativaObservacion {
    id: number;
    id_tabla_comparativa_proveedor: number;
    descripcion_validacion: string;
    cumple: boolean;
    comentario_adicional: string | null;
}

/**
 * Interfaz base para la tabla `tabla_comparativa_firmas`.
 * Puede incluir opcionalmente el nombre del usuario si se hace JOIN.
 */
export interface TablaComparativaFirma {
    id: number;
    id_tabla_comparativa: number;
    id_usuario: number;
    tipo_firma: string; // Ej: 'Revisión Técnica', 'Aprobación Compras'
    fecha_firma: Date | string;
    comentario_firma: string | null;
    nombre_usuario?: string; // Opcional: Nombre del usuario que firmó
}

/**
 * Interfaz base para la tabla `tabla_comparativa_comentarios`.
 * Puede incluir opcionalmente el nombre del usuario si se hace JOIN.
 */
export interface TablaComparativaComentario {
    id: number;
    id_tabla_comparativa: number;
    id_usuario: number;
    fecha_comentario: Date | string;
    texto_comentario: string;
    nombre_usuario?: string; // Opcional: Nombre del usuario que comentó
}


// ======================================================================
// Interfaces Compuestas (Para estructuras de datos completas)
// ======================================================================

/**
 * Representa a un proveedor dentro de una tabla comparativa específica,
 * incluyendo su snapshot, sus ítems y sus observaciones.
 */
export interface ProveedorEnTabla extends TablaComparativaProveedorSnapshot {
    items: TablaComparativaItem[];
    observaciones: TablaComparativaObservacion[];
}

/**
 * Representa la tabla comparativa completa con todos sus datos relacionados,
 * ideal para mostrar la vista detallada.
 */
export interface TablaComparativaCompleta extends TablaComparativa {
    proveedores: ProveedorEnTabla[];
    firmas: TablaComparativaFirma[];
    comentarios: TablaComparativaComentario[];
}


// ======================================================================
// Interfaces de Entrada (Input/DTO para operaciones CRUD)
// ======================================================================

/**
 * Datos necesarios para crear una nueva tabla comparativa.
 */
export interface CrearTablaComparativaInput {
    nombre: string;
    descripcion?: string | null;
    id_usuario_creador: number | null;
}

/**
 * Datos que se pueden actualizar en una tabla comparativa existente.
 */
export type ActualizarTablaInput = Partial<Pick<TablaComparativa, 'nombre' | 'descripcion' | 'estado'>>;

/**
 * Datos necesarios para agregar un proveedor existente a una tabla.
 */
export type AgregarProveedorInput = Omit<TablaComparativaProveedorSnapshot,
    'id' | 'subtotal_proveedor' | 'iva_proveedor' | 'total_proveedor'
>;

/**
 * Datos necesarios para agregar un nuevo ítem a un proveedor en la tabla.
 */
export interface AgregarItemInput extends Omit<TablaComparativaItem, 'id' | 'subtotal_item'> {
    id_articulo_origen?: number | null;
    codigo_partida_origen?: string | null;
    caracteristicas_tecnicas?: CaracteristicaTecnica[] | null;
}

/**
 * Datos que se pueden actualizar en un ítem existente.
 */
export type ActualizarItemInput = Partial<Pick<TablaComparativaItem,
    'descripcion_item' | 'caracteristicas_tecnicas' | 'udm' | 'cantidad' | 'precio_unitario'
>>;

/**
 * Datos necesarios para agregar una nueva observación/validación.
 */
export interface AgregarObservacionInput extends Omit<TablaComparativaObservacion, 'id'> {
    comentario_adicional?: string | null;
}

/**
 * Datos que se pueden actualizar en una observación existente.
 */
export type ActualizarObservacionInput = Partial<Pick<TablaComparativaObservacion,
    'descripcion_validacion' | 'cumple' | 'comentario_adicional'
>>;

/**
 * Datos necesarios para agregar una nueva firma.
 */
export interface AgregarFirmaInput extends Omit<TablaComparativaFirma, 'id' | 'fecha_firma' | 'nombre_usuario'> {
    comentario_firma?: string | null;
}

/**
 * Datos necesarios para agregar un nuevo comentario.
 * CORREGIDO: Convertido a type alias para evitar @typescript-eslint/no-empty-object-type
 */
export type AgregarComentarioInput = Omit<TablaComparativaComentario, 'id' | 'fecha_comentario' | 'nombre_usuario'>;
// Ya no se necesita el comentario "Hereda..." porque el tipo Omit ya lo implica.


// ======================================================================
// Tipos Intermedios para Filas de Base de Datos (`DbRow`)
// ======================================================================

/**
 * Representa la fila cruda de tabla_comparativa_proveedores como podría
 * ser leída desde la base de datos (ej. totales como string).
 */
export type ProveedorSnapshotDbRow = Omit<TablaComparativaProveedorSnapshot, 'subtotal_proveedor' | 'iva_proveedor' | 'total_proveedor'> & {
    subtotal_proveedor: string;
    iva_proveedor: string;
    total_proveedor: string;
};

/**
 * Representa la fila cruda de tabla_comparativa_items.
 */
export type ItemDbRow = Omit<TablaComparativaItem, 'cantidad' | 'precio_unitario' | 'subtotal_item' | 'caracteristicas_tecnicas' | 'id_articulo_origen'> & {
    cantidad: string;
    precio_unitario: string;
    subtotal_item: string;
    caracteristicas_tecnicas: string | CaracteristicaTecnica[] | null;
    id_articulo_origen: number | string | null;
};

/**
 * Representa la fila cruda de tabla_comparativa_observaciones.
 */
export type ObservacionDbRow = Omit<TablaComparativaObservacion, 'cumple'> & {
    cumple: boolean | string;
};

/**
 * Representa la fila cruda de tabla_comparativa_firmas.
 */
export type FirmaDbRow = Omit<TablaComparativaFirma, 'fecha_firma' | 'id_usuario'> & {
    fecha_firma: string;
    id_usuario: number | string;
};

/**
 * Representa la fila cruda de tabla_comparativa_comentarios.
 */
export type ComentarioDbRow = Omit<TablaComparativaComentario, 'fecha_comentario' | 'id_usuario'> & {
    fecha_comentario: string;
    id_usuario: number | string;
};