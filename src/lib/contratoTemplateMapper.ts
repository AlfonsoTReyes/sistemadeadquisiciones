// src/lib/contratoTemplateMapper.ts

import { ContratoDetallado } from '@/types/contrato';
import { ContratoInputData, SuficienciaInput, AreaRequirenteInput } from '@/types/contratoTemplateData';
import numeroALetras from 'numero-a-letras'; // CORREGIDO: Changed to ES6 import

// --- Interfaz TemplateData ---
interface TemplateData {
    TIPO_CONTRATO: string;
    NOMBRE_CONTRATO?: string;
    RAZON_SOCIAL_PROVEEDOR: string;
    NOMBRE_PROVEEDOR_PF?: string;
    NUMERO_PROCEDIMIENTO: string;
    NOMBRE_FUNCIONARIO_AREA: string;
    CARGO_FUNCIONARIO_AREA: string;
    NOMBRE_APODERADO?: string;
    FECHA_SESION_EXTRAORDINARIA?: string;
    FECHA_SUFICIENCIA: string;
    NUMERO_SUFICIENCIA: string;
    CUENTA_SUFICIENCIA: string;
    RECURSO_SUFICIENCIA: string;
    ARTICULO_FUNDAMENTO: string;
    RFC_PROVEEDOR: string;
    DOMICILIO_PROVEEDOR: string;
    NUMERO_OFICIO_PETICION?: string;
    FECHA_OFICIO_PETICION?: string;
    FUNCIONARIO_RECIBE_OFICIO?: string;
    FUNCIONARIO_DIRIGE_OFICIO?: string;
    INE_OCR_PF?: string;
    ACTIVIDAD_ECONOMICA_PF?: string;
    CURP_PF?: string;
    DOMICILIO_FISCAL_PF?: string;
    NUMERO_ESCRITURA_ACTA?: string;
    FECHA_ESCRITURA_ACTA?: string;
    LICENCIADO_ACTA?: string;
    NUMERO_NOTARIA_ACTA?: string;
    DEMARCACION_NOTARIAL_ACTA?: string;
    NUMERO_ESCRITURA_PODER?: string;
    FECHA_ESCRITURA_PODER?: string;
    LICENCIADO_PODER?: string;
    NUMERO_NOTARIA_PODER?: string;
    INE_IDMEX_REP_LEGAL?: string;
    DESCRIPCION_OBJETO: string;
    FECHA_INICIO_CONTRATO: string;
    FECHA_FIN_CONTRATO: string;
    MONTO_TOTAL_NUMERO: string;
    MONTO_TOTAL_LETRAS: string;
    MONTO_MINIMO_NUMERO?: string;
    MONTO_MINIMO_LETRAS?: string;
    MONTO_GARANTIA_CUMPLIMIENTO?: string;
    MONTO_GARANTIA_VICIOS?: string;
    TEXTO_GARANTIA?: string;
    CONDICIONES_PAGO?: string;
    NUMERO_HOJAS: string;
    FECHA_TERMINACION_DOC: string;
    SINDICA_MUNICIPAL: string;
    SECRETARIO_ADMIN: string;
}

// --- Funciones Helper ---
const formatDate = (dateString: string | null | undefined, format: 'long' | 'short' = 'long'): string => {
    if (!dateString) return '_______';
    try {
        // Ensure the date string is treated as UTC if no timezone info is present
        const date = new Date(dateString.includes('T') || dateString.includes('Z') ? dateString : dateString + 'T00:00:00Z');
        if (isNaN(date.getTime())) return 'Fecha inválida'; // Check if date is valid

        if (format === 'long') {
            return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        } else {
             return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
        }
    } catch (e) { return 'Fecha inválida'; }
};

const formatCurrency = (amount: string | number | null | undefined, _currency: string | null = 'MXN'): string => {
    if (amount === null || amount === undefined || amount === '') return '_______';
    const numberAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount; // Handle commas in string amount
    if (isNaN(numberAmount)) return 'Monto inválido';
    return numberAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatCurrencyToWords = (amount: string | number | null | undefined, currency: string | null = 'MXN'): string => {
     if (amount === null || amount === undefined || amount === '') return '_______';
     const numberAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount; // Handle commas
     if (isNaN(numberAmount)) return 'Monto inválido';
     try {
         // numeroALetras is now imported at the top
         const [integerPart, decimalPart = '00'] = String(numberAmount.toFixed(2)).split('.');
         const currencyName = currency?.toUpperCase() === 'USD' ? 'DÓLARES AMERICANOS' : 'PESOS';
         const letras = numeroALetras(parseInt(integerPart)); // Use the imported function
         return `${letras} ${currencyName} ${decimalPart}/100 M.N.`.toUpperCase();
     } catch (e) { console.error("Error convirtiendo número a letras:", e); return '(Error en conversión)'; }
};


export function mapContratoToTemplateData(contrato: ContratoDetallado): TemplateData {
    const td = contrato.template_data ?? {};
    const suf = td.suficiencia as SuficienciaInput | undefined ?? {}; // Cast if necessary
    const areaReq = td.areaRequirente as AreaRequirenteInput | undefined ?? {}; // Cast if necessary
    const tipoPlantilla = td.tipoContrato;

    if (!tipoPlantilla) throw new Error("Tipo de contrato no definido en template_data");

    const proveedor = contrato.proveedor;
    // const esMoral = proveedor?.tipo_proveedor === 'moral'; // Not directly used, can be removed if not needed for logic
    // const esFisica = proveedor?.tipo_proveedor === 'fisica'; // Not directly used

    // --- Preparar datos del proveedor ---
    // CORREGIDO: let -> const
    const razonSocialNombre = proveedor?.nombre_o_razon_social || proveedor?.rfc || 'Proveedor no encontrado';
    const apoderadoNombre = proveedor?.representantes && proveedor.representantes.length > 0
        ? `${proveedor.representantes[0].nombre_representante || ''} ${proveedor.representantes[0].apellido_p_representante || ''} ${proveedor.representantes[0].apellido_m_representante || ''}`.trim()
        : '_________________________';
    const domicilioFiscal = proveedor?.domicilio || '_________________________';
    const ineOcrPf = proveedor?.tipo_proveedor === 'fisica' ? (td.identificacionOficialPf_ocr || '_____________') : 'N/A';
    const actividadPf = proveedor?.tipo_proveedor === 'fisica' ? (proveedor.actividad_sat || '_________________________') : 'N/A';
    const curpPf = proveedor?.tipo_proveedor === 'fisica' ? (proveedor.curp || '__________________') : 'N/A';
    const datosActa = {
        num: proveedor?.tipo_proveedor === 'moral' ? (td.actaConstitutiva_numeroEscritura || '') : 'N/A',
        fecha: proveedor?.tipo_proveedor === 'moral' ? formatDate(td.actaConstitutiva_fechaEscritura, 'long') : 'N/A',
        lic: proveedor?.tipo_proveedor === 'moral' ? (td.actaConstitutiva_notario || '') : 'N/A',
        notaria: proveedor?.tipo_proveedor === 'moral' ? (td.actaConstitutiva_numeroNotaria || '') : 'N/A',
        demarcacion: proveedor?.tipo_proveedor === 'moral' ? (td.actaConstitutiva_demarcacionNotarial || '') : 'N/A',
    };
    const datosPoder = {
        num: proveedor?.tipo_proveedor === 'moral' ? (td.poderNotarial_numeroEscritura || '') : 'N/A',
        fecha: proveedor?.tipo_proveedor === 'moral' ? formatDate(td.poderNotarial_fechaEscritura, 'long') : 'N/A',
        lic: proveedor?.tipo_proveedor === 'moral' ? (td.poderNotarial_notario || '') : 'N/A',
        notaria: proveedor?.tipo_proveedor === 'moral' ? (td.poderNotarial_numeroNotaria || '') : 'N/A',
    };
    const ineRepLegal = proveedor?.tipo_proveedor === 'moral' ? (td.identificacionOficialRepLegal_idmex_ocr || '_________________________') : 'N/A';


    const data: Partial<TemplateData> = {
        TIPO_CONTRATO: tipoPlantilla === 'servicio' ? 'CONTRATO DE PRESTACIÓN DE SERVICIOS' : 'CONTRATO DE ADQUISICIÓN DE BIENES',
        NOMBRE_CONTRATO: td.nombreContratoAdquisicion || td.nombreContratoServicio || contrato.objeto_contrato,
        RAZON_SOCIAL_PROVEEDOR: razonSocialNombre,
        NOMBRE_PROVEEDOR_PF: proveedor?.tipo_proveedor === 'fisica' ? `${proveedor.nombre_fisica || ''} ${proveedor.apellido_p_fisica || ''} ${proveedor.apellido_m_fisica || ''}`.trim() : undefined,
        NUMERO_PROCEDIMIENTO: td.numeroProcedimiento || `PENDIENTE_${contrato.id_contrato}`,
        NOMBRE_FUNCIONARIO_AREA: areaReq.nombreFuncionario || '_________________________',
        CARGO_FUNCIONARIO_AREA: areaReq.cargoFuncionario || '_________________________',
        NOMBRE_APODERADO: apoderadoNombre,
        FECHA_SUFICIENCIA: formatDate(suf.fecha),
        NUMERO_SUFICIENCIA: suf.numeroOficio || '_______',
        CUENTA_SUFICIENCIA: suf.cuenta || '_______',
        RECURSO_SUFICIENCIA: suf.tipoRecurso || '_______',
        ARTICULO_FUNDAMENTO: td.articuloFundamento || '_________________________',
        RFC_PROVEEDOR: proveedor?.rfc || '________________',
        DOMICILIO_PROVEEDOR: domicilioFiscal,
        NUMERO_OFICIO_PETICION: td.oficioPeticionNumero || '_______',
        FECHA_OFICIO_PETICION: formatDate(td.oficioPeticionFecha),
        FUNCIONARIO_RECIBE_OFICIO: areaReq.nombreFuncionarioDirigeOficio || 'Lic. José Miguel Valencia Molina', // Example, adjust
        FUNCIONARIO_DIRIGE_OFICIO: areaReq.nombreFuncionarioFirmaOficio || 'Lic. Ernesto Mora Rico', // Example, adjust
        INE_OCR_PF: ineOcrPf,
        ACTIVIDAD_ECONOMICA_PF: actividadPf,
        CURP_PF: curpPf,
        DOMICILIO_FISCAL_PF: proveedor?.tipo_proveedor === 'fisica' ? domicilioFiscal : 'N/A',
        NUMERO_ESCRITURA_ACTA: datosActa.num,
        FECHA_ESCRITURA_ACTA: datosActa.fecha,
        LICENCIADO_ACTA: datosActa.lic,
        NUMERO_NOTARIA_ACTA: datosActa.notaria,
        DEMARCACION_NOTARIAL_ACTA: datosActa.demarcacion,
        NUMERO_ESCRITURA_PODER: datosPoder.num,
        FECHA_ESCRITURA_PODER: datosPoder.fecha,
        LICENCIADO_PODER: datosPoder.lic,
        NUMERO_NOTARIA_PODER: datosPoder.notaria,
        INE_IDMEX_REP_LEGAL: ineRepLegal,
        DESCRIPCION_OBJETO: td.objetoPrincipal || contrato.objeto_contrato || '_________________________',
        FECHA_INICIO_CONTRATO: formatDate(td.fechaInicio || contrato.fecha_inicio),
        FECHA_FIN_CONTRATO: formatDate(td.fechaFin || contrato.fecha_fin),
        MONTO_TOTAL_NUMERO: formatCurrency(td.montoTotal || contrato.monto_total, td.moneda || contrato.moneda),
        MONTO_TOTAL_LETRAS: formatCurrencyToWords(td.montoTotal || contrato.monto_total, td.moneda || contrato.moneda),
        MONTO_MINIMO_NUMERO: formatCurrency(td.montoMinimo, td.moneda || contrato.moneda),
        MONTO_MINIMO_LETRAS: formatCurrencyToWords(td.montoMinimo, td.moneda || contrato.moneda),
        MONTO_GARANTIA_CUMPLIMIENTO: formatCurrency(td.montoGarantiaCumplimiento, td.moneda || contrato.moneda),
        MONTO_GARANTIA_VICIOS: formatCurrency(td.montoGarantiaVicios, td.moneda || contrato.moneda),
        TEXTO_GARANTIA: td.garantiasTexto || '_________________________',
        CONDICIONES_PAGO: td.condicionesPago || contrato.condiciones_pago || '_________________________',
        NUMERO_HOJAS: td.numeroHojas?.toString() || '_______',
        FECHA_TERMINACION_DOC: formatDate(td.fechaFirma || contrato.fecha_firma),
        SINDICA_MUNICIPAL: 'Lic. Rosalba Ruíz Ramos', // Example fixed value
        SECRETARIO_ADMIN: 'Lic. José Miguel Valencia Molina', // Example fixed value
    };

    const finalData: Partial<TemplateData> = { ...data };

    const allTemplateKeys: Array<keyof TemplateData> = [
        'TIPO_CONTRATO', 'NOMBRE_CONTRATO', 'RAZON_SOCIAL_PROVEEDOR', 'NOMBRE_PROVEEDOR_PF',
        'NUMERO_PROCEDIMIENTO', 'NOMBRE_FUNCIONARIO_AREA', 'CARGO_FUNCIONARIO_AREA',
        'NOMBRE_APODERADO', 'FECHA_SESION_EXTRAORDINARIA', 'FECHA_SUFICIENCIA',
        'NUMERO_SUFICIENCIA', 'CUENTA_SUFICIENCIA', 'RECURSO_SUFICIENCIA',
        'ARTICULO_FUNDAMENTO', 'RFC_PROVEEDOR', 'DOMICILIO_PROVEEDOR',
        'NUMERO_OFICIO_PETICION', 'FECHA_OFICIO_PETICION', 'FUNCIONARIO_RECIBE_OFICIO',
        'FUNCIONARIO_DIRIGE_OFICIO', 'INE_OCR_PF', 'ACTIVIDAD_ECONOMICA_PF', 'CURP_PF',
        'DOMICILIO_FISCAL_PF', 'NUMERO_ESCRITURA_ACTA', 'FECHA_ESCRITURA_ACTA',
        'LICENCIADO_ACTA', 'NUMERO_NOTARIA_ACTA', 'DEMARCACION_NOTARIAL_ACTA',
        'NUMERO_ESCRITURA_PODER', 'FECHA_ESCRITURA_PODER', 'LICENCIADO_PODER',
        'NUMERO_NOTARIA_PODER', 'INE_IDMEX_REP_LEGAL', 'DESCRIPCION_OBJETO',
        'FECHA_INICIO_CONTRATO', 'FECHA_FIN_CONTRATO', 'MONTO_TOTAL_NUMERO',
        'MONTO_TOTAL_LETRAS', 'MONTO_MINIMO_NUMERO', 'MONTO_MINIMO_LETRAS',
        'MONTO_GARANTIA_CUMPLIMIENTO', 'MONTO_GARANTIA_VICIOS', 'TEXTO_GARANTIA',
        'CONDICIONES_PAGO', 'NUMERO_HOJAS', 'FECHA_TERMINACION_DOC',
        'SINDICA_MUNICIPAL', 'SECRETARIO_ADMIN',
    ];

    allTemplateKeys.forEach(key => {
        if (!Object.prototype.hasOwnProperty.call(finalData, key) || finalData[key] === null || finalData[key] === undefined || String(finalData[key]).trim() === '') {
            (finalData as any)[key] = '_______';
        }
    });

    return finalData as TemplateData;
}