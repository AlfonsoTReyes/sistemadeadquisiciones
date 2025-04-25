// src/lib/contratoTemplateMapper.ts

import { ContratoDetallado } from '@/types/contrato';
// Importamos los tipos de Input para saber qué esperar dentro de template_data
import { ContratoInputData, SuficienciaInput, AreaRequirenteInput } from '@/types/contratoTemplateData';
// Mantenemos la librería de número a letras (o tu alternativa)
import numeroALetras from 'numero-a-letras';

// La interfaz TemplateData sigue igual, define los tags de tu .docx
interface TemplateData {
    TIPO_CONTRATO: string;
    RAZON_SOCIAL_PROVEEDOR: string;
    NOMBRE_PROVEEDOR_PF?: string;
    NUMERO_PROCEDIMIENTO: string;
    NOMBRE_FUNCIONARIO_AREA: string;
    CARGO_FUNCIONARIO_AREA: string;
    // RAZON_SOCIAL_CONTRATADA: string; // Probablemente igual a RAZON_SOCIAL_PROVEEDOR
    NOMBRE_APODERADO: string;
    FECHA_SUFICIENCIA: string;
    NUMERO_SUFICIENCIA: string;
    CUENTA_SUFICIENCIA: string;
    RECURSO_SUFICIENCIA: string;
    ARTICULO_FUNDAMENTO: string; // Quitar opcional si siempre viene del form
    RFC_PROVEEDOR: string;
    DOMICILIO_PROVEEDOR: string;
    // Adquisición
    NOMBRE_CONTRATO_ADQ?: string;
    NUMERO_OFICIO_PETICION?: string;
    FECHA_OFICIO_PETICION?: string;
    FUNCIONARIO_RECIBE_OFICIO?: string; // ¿Viene del template_data o es fijo?
    FUNCIONARIO_DIRIGE_OFICIO?: string; // ¿Viene del template_data o es fijo?
    DESCRIPCION_ADQUISICION: string; // Usaremos objetoPrincipal o descDetallada de template_data
    MONTO_MINIMO_NUMERO?: string;   // Para Adquisición
    MONTO_MINIMO_LETRAS?: string;   // Para Adquisición
    // Comunes
    FECHA_INICIO_CONTRATO: string;
    FECHA_FIN_CONTRATO: string;
    MONTO_TOTAL_NUMERO: string; // Monto principal/máximo
    MONTO_TOTAL_LETRAS: string;
    MONTO_GARANTIA_CUMPLIMIENTO?: string; // Monto numérico
    MONTO_GARANTIA_VICIOS?: string; // Monto numérico
    TEXTO_GARANTIA?: string; // Texto descriptivo opcional de garantía
    CONDICIONES_PAGO?: string; // Texto de condiciones
    FECHA_TERMINACION_DOC: string; // Fecha de elaboración/firma
    NUMERO_HOJAS?: string;
    // ... otros tags ...
}

// --- Funciones Helper (formatDate, formatCurrency, formatCurrencyToWords) ---
// ---   Asegúrate que manejen números además de strings para montos ---
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '_______';
    try {
        const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    } catch (e) { return 'Fecha inválida'; }
};

const formatCurrency = (amount: string | number | null | undefined, currency: string | null = 'MXN'): string => {
    if (amount === null || amount === undefined || amount === '') return '_______';
    const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numberAmount)) return 'Valor inválido';
    return numberAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatCurrencyToWords = (amount: string | number | null | undefined, currency: string | null = 'MXN'): string => {
    if (amount === null || amount === undefined || amount === '') return '_______';
    const numberAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numberAmount)) return 'Valor inválido';
    try {
        const numToLetras = require('numero-a-letras');
        const [integerPart, decimalPart = '00'] = String(numberAmount.toFixed(2)).split('.');
        const currencyName = currency?.toUpperCase() === 'USD' ? 'DÓLARES AMERICANOS' : 'PESOS';
        const letras = numToLetras.NumerosALetras(parseInt(integerPart));
        return `${letras} ${currencyName} ${decimalPart}/100 M.N.`.toUpperCase();
    } catch (e) { /* ... error handling ... */ return 'Error'; }
};
// --- Fin Helpers ---


export function mapContratoToTemplateData(contrato: ContratoDetallado): TemplateData {
    // *** LEER DATOS PRIMERO DE template_data ***
    const td = contrato.template_data ?? {}; // Objeto vacío como fallback
    const suf = td.suficiencia as SuficienciaInput | undefined ?? {};
    const areaReq = td.areaRequirente as AreaRequirenteInput | undefined ?? {};
    const tipoPlantilla = td.tipoContrato ?? 'servicio'; // Asume servicio si no se especificó

    // *** OBTENER DATOS DEL PROVEEDOR (igual que antes) ***
    const proveedor = contrato.proveedor;
    const esMoral = proveedor?.tipo_proveedor === 'moral';
    const esFisica = proveedor?.tipo_proveedor === 'fisica';
    let razonSocialNombre = '_________________________';
    let apoderadoNombre = '_________________________';
    // ... (lógica para obtener razonSocialNombre y apoderadoNombre del proveedor) ...
     if (esMoral) { razonSocialNombre = proveedor?.razon_social ?? 'N/A'; const rep = proveedor?.representantes?.[0]; apoderadoNombre = rep ? `${rep.nombre_representante ?? ''} ${rep.apellido_p_representante ?? ''} ${rep.apellido_m_representante ?? ''}`.trim() : 'N/A'; } else if (esFisica) { razonSocialNombre = `${proveedor.nombre_fisica ?? ''} ${proveedor.apellido_p_fisica ?? ''} ${proveedor.apellido_m_fisica ?? ''}`.trim() || 'N/A'; apoderadoNombre = razonSocialNombre; }
     const domicilio = `${proveedor?.calle ?? ''} ${proveedor?.numero ?? ''}, COL. ${proveedor?.colonia ?? ''}, ${proveedor?.municipio ?? ''}, ${proveedor?.estado ?? ''}, C.P. ${proveedor?.codigo_postal ?? ''}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim() || 'N/A';


    // *** MAPEO A LOS TAGS DE LA PLANTILLA ***
    const data: TemplateData = {
        // --- Usar datos de template_data SIEMPRE que sea posible ---
        TIPO_CONTRATO: tipoPlantilla === 'servicio' ? 'CONTRATO DE SERVICIO DE' : 'CONTRATO DE ADQUISICIÓN DE',
        RAZON_SOCIAL_PROVEEDOR: razonSocialNombre, // Viene del proveedor
        NOMBRE_PROVEEDOR_PF: esFisica ? razonSocialNombre : undefined, // Viene del proveedor
        NUMERO_PROCEDIMIENTO: td.numeroProcedimiento ?? contrato.numero_contrato ?? `PENDIENTE_${contrato.id_contrato}`, // Prioriza template
        NOMBRE_FUNCIONARIO_AREA: areaReq.nombreFuncionario ?? 'Funcionario no especificado',
        CARGO_FUNCIONARIO_AREA: areaReq.cargoFuncionario ?? 'Cargo no especificado',
        // RAZON_SOCIAL_CONTRATADA: razonSocialNombre, // Ya está en RAZON_SOCIAL_PROVEEDOR
        NOMBRE_APODERADO: apoderadoNombre, // Viene del proveedor/representantes
        FECHA_SUFICIENCIA: formatDate(suf.fecha),
        NUMERO_SUFICIENCIA: suf.numeroOficio ?? '_______',
        CUENTA_SUFICIENCIA: suf.cuenta ?? '_______',
        RECURSO_SUFICIENCIA: suf.tipoRecurso ?? '_______',
        ARTICULO_FUNDAMENTO: td.articuloFundamento ?? 'Artículo/Fracción no especificados',
        RFC_PROVEEDOR: proveedor?.rfc ?? 'RFC NO DISPONIBLE', // Viene del proveedor
        DOMICILIO_PROVEEDOR: domicilio, // Viene del proveedor
        // Usar objetoPrincipal o descDetallada de template_data como descripción principal
        DESCRIPCION_ADQUISICION: td.objetoPrincipal ?? contrato.objeto_contrato ?? 'OBJETO NO DEFINIDO',
        FECHA_INICIO_CONTRATO: formatDate(td.fechaInicio),
        FECHA_FIN_CONTRATO: formatDate(td.fechaFin),
        // Usa el monto del template_data (que debería coincidir con el core monto_total)
        MONTO_TOTAL_NUMERO: formatCurrency(td.montoTotal, td.moneda),
        MONTO_TOTAL_LETRAS: formatCurrencyToWords(td.montoTotal, td.moneda),
        // Usa las garantías del template_data
        MONTO_GARANTIA_CUMPLIMIENTO: formatCurrency(td.montoGarantiaCumplimiento, td.moneda),
        MONTO_GARANTIA_VICIOS: formatCurrency(td.montoGarantiaVicios, td.moneda),
        TEXTO_GARANTIA: td.garantiasTexto ?? undefined, // Opcional
        CONDICIONES_PAGO: td.condicionesPago ?? undefined, // Opcional
        FECHA_TERMINACION_DOC: formatDate(td.fechaFirma), // Fecha de elaboración/firma
        NUMERO_HOJAS: td.numeroHojas?.toString() ?? '___',

        // --- Específicos de Adquisición (leer de template_data) ---
        NOMBRE_CONTRATO_ADQ: td.nombreContratoAdquisicion ?? undefined, // Opcional
        NUMERO_OFICIO_PETICION: td.oficioPeticionNumero ?? undefined, // Opcional
        FECHA_OFICIO_PETICION: formatDate(td.oficioPeticionFecha), // Opcional
        MONTO_MINIMO_NUMERO: formatCurrency(td.montoMinimo, td.moneda), // Opcional
        MONTO_MINIMO_LETRAS: formatCurrencyToWords(td.montoMinimo, td.moneda), // Opcional

        // --- ¿Funcionarios fijos o del área requirente? Asumamos del área requirente ---
        FUNCIONARIO_RECIBE_OFICIO: 'Lic. José Miguel Valencia Molina', // ¿O debería ser areaReq.x?
        FUNCIONARIO_DIRIGE_OFICIO: areaReq.nombreFuncionario ?? 'Funcionario no especificado', // Ejemplo si dirige el mismo que requiere

        // Asegúrate de mapear CUALQUIER otro tag [Uxx] que falte aquí, leyéndolo de 'td'
    };

    // Limpia valores undefined para que docxtemplater use el nullGetter
    Object.keys(data).forEach(key => {
        if (data[key as keyof TemplateData] === undefined) {
            delete data[key as keyof TemplateData];
        }
    });

    return data as TemplateData; // Asegura el tipo de retorno
}