// src/types/contratoTemplateData.ts (NUEVO ARCHIVO)

// Interfaz para los datos de suficiencia que ingresará el admin
export interface SuficienciaInput {
    fecha: string; // YYYY-MM-DD
    numeroOficio: string;
    cuenta: string;
    tipoRecurso: string;
}

// Interfaz para los datos del área requirente que ingresará el admin (o seleccionará)
export interface AreaRequirenteInput {
    nombreFuncionario: string;
    cargoFuncionario: string;
    // Podrías añadir id_secretaria, id_dependencia si se selecciona de una lista
}

// Interfaz base con datos que el admin debe PROPORCIONAR
// (excluye datos que vienen automáticamente del proveedor seleccionado)
interface ContratoBaseInputData {
    // Selección principal
    tipoContrato: 'servicio' | 'adquisicion';
    idProveedor: number; // ID del proveedor seleccionado

    // Datos generales del CONTRATO (no del proveedor)
    numeroProcedimiento?: string | null; // El número tipo ADE.MSJR.XXX.YYYYYY (¿autogenerado o manual?)
    objetoPrincipal: string; // Descripción corta/principal para objeto/nombre
    descripcionDetallada: string; // Descripción larga (Cláusula Primera, etc.)
    articuloFundamento: string;
    montoTotal: number; // Usar número para cálculos
    moneda?: string; // Default MXN
    fechaInicio: string; // YYYY-MM-DD
    fechaFin: string; // YYYY-MM-DD
    fechaFirma?: string | null; // Fecha de elaboración/firma del documento final

    // Datos relacionados (opcionales, seleccionados de listas)
    idConcurso?: number | null;
    idSolicitud?: number | null;
    idDictamen?: number | null;

    // Datos específicos ingresados por admin
    suficiencia: SuficienciaInput;
    areaRequirente: AreaRequirenteInput;
    montoGarantiaCumplimiento?: number | null; // O calcular como % del montoTotal?
    montoGarantiaVicios?: number | null;    // O calcular como % del montoTotal?
    numeroHojas?: number | null; // ¿Manual o calculado?

    // Datos extra SOLO para Adquisición
    nombreContratoAdquisicion?: string | null; // El nombre específico en el título
    montoMinimo?: number | null;
    oficioPeticionNumero?: string | null;
    oficioPeticionFecha?: string | null; // YYYY-MM-DD
    // ¿Nombres de funcionarios fijos o parte del área requirente?
    // funcionarioRecibeOficio?: string;
    // funcionarioDirigeOficio?: string;

    // ¿Condiciones de pago y garantías se capturan aquí o se heredan de la plantilla?
    condicionesPago?: string | null;
    garantiasTexto?: string | null; // Diferente de los montos

}

// Tipos específicos si necesitas validación más estricta
export type ContratoServicioInputData = Omit<ContratoBaseInputData, 'nombreContratoAdquisicion' | 'montoMinimo' | 'oficioPeticionNumero' | 'oficioPeticionFecha'> & { tipoContrato: 'servicio'; };
export type ContratoAdquisicionInputData = ContratoBaseInputData & { tipoContrato: 'adquisicion'; };
type ContratoCoreUpdateData = Partial<Omit<ContratoBaseInputData, 'id_contrato'>>;
export type ContratoUpdateData = ContratoCoreUpdateData & {
    template_data?: Partial<ContratoInputData> | object; // Añadir aquí
};
// Tipo unión para usar en el formulario
export type ContratoInputData = ContratoServicioInputData | ContratoAdquisicionInputData;