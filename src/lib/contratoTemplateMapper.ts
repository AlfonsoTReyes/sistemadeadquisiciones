// src/lib/contratoTemplateMapper.ts

import { ContratoDetallado } from '@/types/contrato';
import { ContratoInputData, SuficienciaInput, AreaRequirenteInput } from '@/types/contratoTemplateData';
// import numeroALetras from 'numero-a-letras';

// --- Interfaz TemplateData (Asegúrate que esta lista sea exhaustiva y coincida con tus DOCX tags) ---
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
    DESCRIPCION_OBJETO: string; // Cubre U9, U26-U28, U40-U42
    FECHA_INICIO_CONTRATO: string;
    FECHA_FIN_CONTRATO: string;
    MONTO_TOTAL_NUMERO: string; // U30, U45
    MONTO_TOTAL_LETRAS: string;
    MONTO_MINIMO_NUMERO?: string; // U44
    MONTO_MINIMO_LETRAS?: string; // U44
    MONTO_GARANTIA_CUMPLIMIENTO?: string; // U32, U46
    MONTO_GARANTIA_VICIOS?: string; // U33, U47
    TEXTO_GARANTIA?: string;
    CONDICIONES_PAGO?: string;
    NUMERO_HOJAS: string; // U34, U48
    FECHA_TERMINACION_DOC: string; // U35, U49
    // --- Añadidos Fijos ---
    SINDICA_MUNICIPAL: string;
    SECRETARIO_ADMIN: string;
    // ... CUALQUIER OTRO TAG REAL de tus plantillas .docx ...
}
// --- Funciones Helper (Asumiendo que existen y funcionan) ---
const formatDate = (dateString: string | null | undefined, format: 'long' | 'short' = 'long'): string => {
    if (!dateString) return '_______';
    try {
        const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
        if (format === 'long') {
            return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        } else {
             return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
        }
    } catch (e) { return 'Fecha inválida'; }
};
const formatCurrency = (amount: string | number | null | undefined, currency: string | null = 'MXN'): string => {
    if (amount === null || amount === undefined || amount === '') return '_______';
    const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numberAmount)) return 'Monto inválido';
    return numberAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const formatCurrencyToWords = (amount: string | number | null | undefined, currency: string | null = 'MXN'): string => {
     if (amount === null || amount === undefined || amount === '') return '_______';
     const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
     if (isNaN(numberAmount)) return 'Monto inválido';
     try {
         const numeroALetras = require('numero-a-letras');
         const [integerPart, decimalPart = '00'] = String(numberAmount.toFixed(2)).split('.');
         const currencyName = currency?.toUpperCase() === 'USD' ? 'DÓLARES AMERICANOS' : 'PESOS';
         const letras = numeroALetras.NumerosALetras(parseInt(integerPart));
         return `${letras} ${currencyName} ${decimalPart}/100 M.N.`.toUpperCase();
     } catch (e) { console.error("Error convirtiendo número a letras:", e); return '(Error en conversión)'; }
};


export function mapContratoToTemplateData(contrato: ContratoDetallado): TemplateData {
    const td = contrato.template_data ?? {};
    const suf = td.suficiencia as SuficienciaInput | undefined ?? {};
    const areaReq = td.areaRequirente as AreaRequirenteInput | undefined ?? {};
    const tipoPlantilla = td.tipoContrato;

    if (!tipoPlantilla) throw new Error("Tipo de contrato no definido en template_data");

    const proveedor = contrato.proveedor;
    const esMoral = proveedor?.tipo_proveedor === 'moral';
    const esFisica = proveedor?.tipo_proveedor === 'fisica';

    // --- Preparar datos del proveedor (igual que antes) ---
    let razonSocialNombre = proveedor?.rfc ?? 'Proveedor no encontrado';
    let apoderadoNombre = '';
    let domicilioFiscal = '_________________________';
    let ineOcrPf = '_____________';
    let actividadPf = '_________________________';
    let curpPf = '__________________';
    let datosActa = { num: '', fecha: '', lic: '', notaria: '', demarcacion: '' };
    let datosPoder = { num: '', fecha: '', lic: '', notaria: '' };
    let ineRepLegal = '_________________________';

    // --- Mapeo Inicial (igual que antes) ---
    const data: Partial<TemplateData> = {
        // Encabezado y partes
        TIPO_CONTRATO: tipoPlantilla === 'servicio' ? 'CONTRATO DE SERVICIO DE' : 'CONTRATO DE ADQUISICIÓN DE',
        NOMBRE_CONTRATO: td.nombreContratoAdquisicion, // U1(Adq)
        RAZON_SOCIAL_PROVEEDOR: razonSocialNombre, // U4(Adq), U3(Srv), etc.
        NUMERO_PROCEDIMIENTO: td.numeroProcedimiento ?? `PENDIENTE_${contrato.id_contrato}`, // U40(Srv), U55(Adq), etc.
        NOMBRE_FUNCIONARIO_AREA: areaReq.nombreFuncionario, // U2(Srv), U17(Adq), etc.
        CARGO_FUNCIONARIO_AREA: areaReq.cargoFuncionario, // U3(Srv), U17(Adq), etc.
        NOMBRE_APODERADO: apoderadoNombre, // U4(Srv), U31/U32(Adq), etc.

        // Antecedentes y Suficiencia
        // FECHA_SESION_EXTRAORDINARIA: formatDate(td.fechaSesion), // Ejemplo si lo añades
        FECHA_SUFICIENCIA: formatDate(suf.fecha), // U5(Srv), U10(Adq)
        NUMERO_SUFICIENCIA: suf.numeroOficio, // U6(Srv), U11(Adq)
        CUENTA_SUFICIENCIA: suf.cuenta, // U7(Srv), U12(Adq)
        RECURSO_SUFICIENCIA: suf.tipoRecurso, // U8(Srv), U13(Adq)
        ARTICULO_FUNDAMENTO: td.articuloFundamento, // U14(Adq), U15(Srv)

        // Datos Proveedor (del objeto 'proveedor')
        RFC_PROVEEDOR: proveedor?.rfc, // U24(Srv), U38(Adq)
        DOMICILIO_PROVEEDOR: domicilioFiscal, // U25(Srv), U39(Adq) / U24(PF Adq)
        INE_OCR_PF: ineOcrPf, // U20(Adq)
        ACTIVIDAD_ECONOMICA_PF: actividadPf, // U21(Adq)
        CURP_PF: curpPf, // U23(Adq)
        NUMERO_ESCRITURA_ACTA: datosActa.num, // U17(Srv), U26(Adq)
        FECHA_ESCRITURA_ACTA: datosActa.fecha, // U18(Srv), U27(Adq)
        LICENCIADO_ACTA: datosActa.lic, // U19(Srv), U28(Adq)
        NUMERO_NOTARIA_ACTA: datosActa.notaria, // U20(Srv), U29(Adq)
        DEMARCACION_NOTARIAL_ACTA: datosActa.demarcacion, // U21(Srv), U30(Adq)
        NUMERO_ESCRITURA_PODER: datosPoder.num, // U33(Adq)
        FECHA_ESCRITURA_PODER: datosPoder.fecha, // U34(Adq)
        LICENCIADO_PODER: datosPoder.lic, // U35(Adq)
        NUMERO_NOTARIA_PODER: datosPoder.notaria, // U36(Adq)
        INE_IDMEX_REP_LEGAL: ineRepLegal, // U23(Srv), U37(Adq)

        // Adquisición: Oficio (de template_data)
        NUMERO_OFICIO_PETICION: td.oficioPeticionNumero, // U5(Adq)
        FECHA_OFICIO_PETICION: formatDate(td.oficioPeticionFecha), // U6(Adq)
        FUNCIONARIO_RECIBE_OFICIO: 'Lic. José Miguel Valencia Molina', // U7(Adq) - ¿Fijo o de areaReq?
        FUNCIONARIO_DIRIGE_OFICIO: 'Lic. Ernesto Mora Rico', // U8(Adq) - ¿Fijo o de areaReq?

        // Objeto / Descripción (de template_data)
        DESCRIPCION_OBJETO: td.objetoPrincipal, // U9(Adq), U26-U28(Srv), U40-U42(Adq)

        // Vigencia (de template_data)
        FECHA_INICIO_CONTRATO: formatDate(td.fechaInicio), // U29(Srv), U43(Adq)
        FECHA_FIN_CONTRATO: formatDate(td.fechaFin), // U29(Srv), U43(Adq)

        // Montos (de template_data)
        MONTO_TOTAL_NUMERO: formatCurrency(td.montoTotal, td.moneda), // U30(Srv), U45(Adq)
        MONTO_TOTAL_LETRAS: formatCurrencyToWords(td.montoTotal, td.moneda),
        MONTO_MINIMO_NUMERO: formatCurrency(td.montoMinimo, td.moneda), // U44(Adq)
        MONTO_MINIMO_LETRAS: formatCurrencyToWords(td.montoMinimo, td.moneda), // U44(Adq)

        // Garantías (de template_data)
        MONTO_GARANTIA_CUMPLIMIENTO: formatCurrency(td.montoGarantiaCumplimiento, td.moneda), // U32(Srv), U46(Adq)
        MONTO_GARANTIA_VICIOS: formatCurrency(td.montoGarantiaVicios, td.moneda), // U33(Srv), U47(Adq)
        TEXTO_GARANTIA: td.garantiasTexto,

        // Pago (de template_data)
        CONDICIONES_PAGO: td.condicionesPago, // U31?(Srv)

        // Cierre (de template_data)
        NUMERO_HOJAS: td.numeroHojas?.toString(), // U34(Srv), U48(Adq)
        FECHA_TERMINACION_DOC: formatDate(td.fechaFirma), // U35(Srv), U49(Adq)

        // --- Fijos Municipio (Ejemplos, verifica si necesitas tags para estos) ---
        SINDICA_MUNICIPAL: 'Lic. Rosalba Ruíz Ramos',
        SECRETARIO_ADMIN: 'Lic. José Miguel Valencia Molina',

    };

    // --- Rellenar Placeholders ---
    const finalData = { ...data }; // Copia inicial

    // *** LISTA EXPANDIDA Y EXPLÍCITA DE TODAS LAS CLAVES ***
    const allTemplateKeys: Array<keyof TemplateData> = [
        'TIPO_CONTRATO',
        'NOMBRE_CONTRATO',
        'RAZON_SOCIAL_PROVEEDOR',
        'NOMBRE_PROVEEDOR_PF',
        'NUMERO_PROCEDIMIENTO',
        'NOMBRE_FUNCIONARIO_AREA',
        'CARGO_FUNCIONARIO_AREA',
        'NOMBRE_APODERADO',
        'FECHA_SESION_EXTRAORDINARIA', // Si lo usas
        'FECHA_SUFICIENCIA',
        'NUMERO_SUFICIENCIA',
        'CUENTA_SUFICIENCIA',
        'RECURSO_SUFICIENCIA',
        'ARTICULO_FUNDAMENTO',
        'RFC_PROVEEDOR',
        'DOMICILIO_PROVEEDOR',
        'NUMERO_OFICIO_PETICION',
        'FECHA_OFICIO_PETICION',
        'FUNCIONARIO_RECIBE_OFICIO',
        'FUNCIONARIO_DIRIGE_OFICIO',
        'INE_OCR_PF',
        'ACTIVIDAD_ECONOMICA_PF',
        'CURP_PF',
        'DOMICILIO_FISCAL_PF', // ¿Duplicado de DOMICILIO_PROVEEDOR? Decide cuál usar
        'NUMERO_ESCRITURA_ACTA',
        'FECHA_ESCRITURA_ACTA',
        'LICENCIADO_ACTA',
        'NUMERO_NOTARIA_ACTA',
        'DEMARCACION_NOTARIAL_ACTA',
        'NUMERO_ESCRITURA_PODER',
        'FECHA_ESCRITURA_PODER',
        'LICENCIADO_PODER',
        'NUMERO_NOTARIA_PODER',
        'INE_IDMEX_REP_LEGAL',
        'DESCRIPCION_OBJETO',
        'FECHA_INICIO_CONTRATO',
        'FECHA_FIN_CONTRATO',
        'MONTO_TOTAL_NUMERO',
        'MONTO_TOTAL_LETRAS',
        'MONTO_MINIMO_NUMERO',
        'MONTO_MINIMO_LETRAS',
        'MONTO_GARANTIA_CUMPLIMIENTO',
        'MONTO_GARANTIA_VICIOS',
        'TEXTO_GARANTIA',
        'CONDICIONES_PAGO',
        'NUMERO_HOJAS',
        'FECHA_TERMINACION_DOC',
        'SINDICA_MUNICIPAL', // Fijo
        'SECRETARIO_ADMIN', // Fijo
        // *** ¡¡AÑADE AQUÍ CUALQUIER OTRA CLAVE/TAG QUE USES EN TUS .DOCX!! ***
    ];
    // *** FIN LISTA EXPANDIDA ***

    // Bucle para asegurar que todas las claves tengan un valor (placeholder si es necesario)
    allTemplateKeys.forEach(key => {
        // Comprueba si la clave existe en finalData y si su valor es null, undefined o ''
        if (!Object.prototype.hasOwnProperty.call(finalData, key) || finalData[key] === null || finalData[key] === undefined || finalData[key] === '') {
            // Asigna un placeholder o string vacío
            finalData[key] = '_______' as any; // Placeholder genérico
        }
    });

    // Forzar tipo final
    return finalData as TemplateData;
}