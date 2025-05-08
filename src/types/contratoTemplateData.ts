// src/types/contratoTemplateData.ts

// ================================
// Sub-Estructuras
// ================================

/**
 * Información sobre la suficiencia presupuestal del contrato.
 */
export interface SuficienciaInput {
    fecha: string; // YYYY-MM-DD
    numeroOficio: string;
    cuenta: string;
    tipoRecurso: string;
}

/**
 * Información sobre el área requirente del contrato.
 */
export interface AreaRequirenteInput {
    nombreFuncionario: string;
    cargoFuncionario: string;
    // Si se desea integrar a catálogos:
    id_secretaria?: number;
    id_dependencia?: number;
}

// ================================
// Estructura Base
// ================================

/**
 * Estructura base común a todos los contratos (servicio o adquisición).
 */
export interface ContratoBaseInputData {
    // Identificación del tipo de contrato y proveedor
    tipoContrato: 'servicio' | 'adquisicion';
    idProveedor: number;

    // Información general del contrato
    numeroProcedimiento?: string | null;
    objetoPrincipal: string;
    descripcionDetallada: string;
    articuloFundamento: string;
    montoTotal: number;
    moneda?: string;
    fechaInicio: string; // YYYY-MM-DD
    fechaFin: string; // YYYY-MM-DD
    fechaFirma?: string | null; // Opcional, puede llenarse más adelante

    // Relaciones externas
    idConcurso?: number | null;
    idSolicitud?: number | null;
    idDictamen?: number | null;

    // Datos administrativos proporcionados por el usuario
    suficiencia: SuficienciaInput;
    areaRequirente: AreaRequirenteInput;

    // Garantías (pueden ser nulas si no aplica)
    montoGarantiaCumplimiento?: number | null;
    montoGarantiaVicios?: number | null;
    numeroHojas?: number | null;

    // Exclusivos de tipo adquisición
    nombreContratoAdquisicion?: string | null;
    montoMinimo?: number | null;
    oficioPeticionNumero?: string | null;
    oficioPeticionFecha?: string | null;

    // Información adicional opcional
    condicionesPago?: string | null;
    garantiasTexto?: string | null;
}

// ================================
// Tipos Especializados
// ================================
// src/types/contratoTemplateData.ts
export interface TemplateDataContrato {
  tipoContrato?: 'servicio' | 'adquisicion';
  objetoPrincipal?: string;
  descripcionDetallada?: string;
  articuloFundamento?: string;
  numeroProcedimiento?: string;
  fechaInicio?: string;
  fechaFin?: string;
  moneda?: string;
  montoMinimo?: string;
  montoGarantiaCumplimiento?: string;
  montoGarantiaVicios?: string;
  condicionesPago?: string;
  garantiasTexto?: string;
  numeroHojas?: string;
  fechaFirma?: string;
  oficioPeticionNumero?: string;
  oficioPeticionFecha?: string;
  nombreContratoAdquisicion?: string;

  // Campos compuestos
  suficiencia?: SuficienciaInput;
  areaRequirente?: AreaRequirenteInput;
}

/**
 * Datos requeridos para un contrato de tipo servicio.
 */
export type ContratoServicioInputData = Omit<
    ContratoBaseInputData,
    'nombreContratoAdquisicion' | 'montoMinimo' | 'oficioPeticionNumero' | 'oficioPeticionFecha'
> & {
    tipoContrato: 'servicio';
};

/**
 * Datos requeridos para un contrato de tipo adquisición.
 */
export type ContratoAdquisicionInputData = ContratoBaseInputData & {
    tipoContrato: 'adquisicion';
};

/**
 * Unión de tipos para usar en formularios dinámicos.
 */
export type ContratoInputData = ContratoServicioInputData | ContratoAdquisicionInputData;

/**
 * Tipo parcial para actualizaciones.
 */
type ContratoCoreUpdateData = Partial<Omit<ContratoBaseInputData, 'id_contrato'>>;

export type ContratoUpdateData = ContratoCoreUpdateData & {
    template_data?: Partial<ContratoInputData> | object;
};
