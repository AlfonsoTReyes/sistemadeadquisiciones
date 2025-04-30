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
    id: number; // ID del registro en tabla_comparativa_proveedores
    id_tabla_comparativa: number;
    id_proveedor: number; // ID del proveedor en la tabla maestra 'proveedores'
    nombre_empresa_snapshot: string;
    rfc_snapshot: string;
    giro_comercial_snapshot: string | null;
    atencion_de_snapshot: string | null;
    domicilio_snapshot: string | null;
    telefono_snapshot: string | null;
    correo_electronico_snapshot: string | null;
    pagina_web_snapshot: string | null;
    condiciones_pago_snapshot: string | null;
    tiempo_entrega_snapshot: string | null;
    // Totales calculados para este proveedor EN esta tabla
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
    descripcion?: string | null; // Descripción es opcional al crear
    id_usuario_creador: number | null; // Puede ser nulo si no se requiere rastrear creador
}

/**
 * Datos que se pueden actualizar en una tabla comparativa existente.
 * Usamos Partial para indicar que todos los campos son opcionales.
 */
export type ActualizarTablaInput = Partial<Pick<TablaComparativa, 'nombre' | 'descripcion' | 'estado'>>;

/**
 * Datos necesarios para agregar un proveedor existente a una tabla.
 * Requiere todos los campos snapshot ya que se "congelan" en este punto.
 */
export interface AgregarProveedorInput extends Omit<TablaComparativaProveedorSnapshot, 'id' | 'subtotal_proveedor' | 'iva_proveedor' | 'total_proveedor'> {
    // Hereda id_tabla_comparativa, id_proveedor y todos los *_snapshot
}

/**
 * Datos necesarios para agregar un nuevo ítem a un proveedor en la tabla.
 * El subtotal se calculará en el servicio.
 */
export interface AgregarItemInput extends Omit<TablaComparativaItem, 'id' | 'subtotal_item'> {
    // Hereda todos los campos excepto id y subtotal_item
    // id_articulo_origen y codigo_partida_origen son opcionales
    id_articulo_origen?: number | null;
    codigo_partida_origen?: string | null;
    caracteristicas_tecnicas?: CaracteristicaTecnica[] | null; // Opcional al agregar
}

/**
 * Datos que se pueden actualizar en un ítem existente.
 */
export type ActualizarItemInput = Partial<Pick<TablaComparativaItem,
    'descripcion_item' | 'caracteristicas_tecnicas' | 'udm' | 'cantidad' | 'precio_unitario'
    // Normalmente no se actualizan las referencias de origen:
    // | 'id_articulo_origen' | 'codigo_partida_origen'
>>;

/**
 * Datos necesarios para agregar una nueva observación/validación.
 */
export interface AgregarObservacionInput extends Omit<TablaComparativaObservacion, 'id'> {
    // Hereda todos los campos excepto id
    comentario_adicional?: string | null; // Opcional al agregar
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
    // Hereda id_tabla_comparativa, id_usuario, tipo_firma
    comentario_firma?: string | null; // Opcional al agregar
}

/**
 * Datos necesarios para agregar un nuevo comentario.
 */
export interface AgregarComentarioInput extends Omit<TablaComparativaComentario, 'id' | 'fecha_comentario' | 'nombre_usuario'> {
    // Hereda id_tabla_comparativa, id_usuario, texto_comentario
}


// ======================================================================
// Tipos Intermedios para Filas de Base de Datos (`DbRow`)
// Útiles para manejar conversiones de tipos (ej. NUMERIC a string)
// que ocurren al leer desde node-postgres/@vercel/postgres.
// ======================================================================

/**
 * Representa la fila cruda de tabla_comparativa_proveedores como podría
 * ser leída desde la base de datos (ej. totales como string).
 */
export interface ProveedorSnapshotDbRow extends Omit<TablaComparativaProveedorSnapshot, 'subtotal_proveedor' | 'iva_proveedor' | 'total_proveedor'> {
    subtotal_proveedor: string; // NUMERIC a menudo viene como string
    iva_proveedor: string;      // NUMERIC a menudo viene como string
    total_proveedor: string;    // NUMERIC a menudo viene como string
}

/**
 * Representa la fila cruda de tabla_comparativa_items.
 */
export interface ItemDbRow extends Omit<TablaComparativaItem, 'cantidad' | 'precio_unitario' | 'subtotal_item' | 'caracteristicas_tecnicas' | 'id_articulo_origen'> {
    cantidad: string;           // NUMERIC a menudo viene como string
    precio_unitario: string;    // NUMERIC a menudo viene como string
    subtotal_item: string;      // NUMERIC a menudo viene como string
    caracteristicas_tecnicas: any; // JSONB puede venir como string u objeto parseado, 'any' es flexible aquí
    id_articulo_origen: number | string | null; // FK puede venir como string o number
}

/**
 * Representa la fila cruda de tabla_comparativa_observaciones.
 * (A menudo no requiere conversión significativa, pero se define por consistencia)
 */
export interface ObservacionDbRow extends TablaComparativaObservacion {
    // Podría necesitar conversión si 'cumple' (BOOLEAN) no viene como boolean
}

/**
 * Representa la fila cruda de tabla_comparativa_firmas.
 */
export interface FirmaDbRow extends Omit<TablaComparativaFirma, 'fecha_firma' | 'id_usuario'> {
    fecha_firma: string;        // TIMESTAMPTZ puede venir como string
    id_usuario: number | string;// FK puede venir como string o number
}

/**
 * Representa la fila cruda de tabla_comparativa_comentarios.
 */
export interface ComentarioDbRow extends Omit<TablaComparativaComentario, 'fecha_comentario' | 'id_usuario'> {
    fecha_comentario: string;    // TIMESTAMPTZ puede venir como string
    id_usuario: number | string; // FK puede venir como string o number
}

// Podrías añadir otros tipos auxiliares si fueran necesarios.