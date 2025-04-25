// src/lib/contratoTemplateMapper.ts

import { ContratoDetallado } from '@/types/contrato';
// Importa los tipos InputData para saber la estructura dentro de template_data
import { ContratoInputData, SuficienciaInput, AreaRequirenteInput } from '@/types/contratoTemplateData';
// Asegúrate de tener tu librería o método para convertir número a letras
// import numeroALetras from 'numero-a-letras'; // Si usas esta librería

// --- Interfaz TemplateData (Definida según tus tags [Uxx]) ---
// --- Revisa CUIDADOSAMENTE que cada TAG tenga su entrada aquí ---
interface TemplateData {
    // Encabezado y partes
    TIPO_CONTRATO: string;                  // U1
    NOMBRE_CONTRATO?: string;               // U1 (Adquisición - Nombre específico) / U65
    RAZON_SOCIAL_PROVEEDOR: string;         // U4 (Servicio y Adquisición), U16, U19, U25, U56
    // NOMBRE_PROVEEDOR_PF?: string;        // Alternativa si necesitas un tag separado para PF
    NUMERO_PROCEDIMIENTO: string;           // Ej: ADE.MSJR.SER.202502 / ADM.MSJR.MAT.202503, U40, U55, U59, U66
    NOMBRE_FUNCIONARIO_AREA: string;        // U2, U10, U17, U36, U52
    CARGO_FUNCIONARIO_AREA: string;         // U3, U17, U36, U52
    NOMBRE_APODERADO?: string;              // U4, U22, U31, U32, U53 (Si es PM)
    // Antecedentes y Suficiencia
    FECHA_SESION_EXTRAORDINARIA?: string;   // Ejemplo si necesitas fecha de autorización comité
    FECHA_SUFICIENCIA: string;              // U5, U10
    NUMERO_SUFICIENCIA: string;             // U6, U11
    CUENTA_SUFICIENCIA: string;             // U7, U12
    RECURSO_SUFICIENCIA: string;            // U8, U13
    ARTICULO_FUNDAMENTO: string;            // U14, U15
    // Datos Proveedor (obtenidos de contrato.proveedor, mapeados desde template_data si es necesario)
    RFC_PROVEEDOR: string;                  // U24, U38
    DOMICILIO_PROVEEDOR: string;            // U25, U39
    // --- Adquisición: Antecedentes Oficio ---
    NUMERO_OFICIO_PETICION?: string;        // U5
    FECHA_OFICIO_PETICION?: string;         // U6
    FUNCIONARIO_RECIBE_OFICIO?: string;     // U7
    FUNCIONARIO_DIRIGE_OFICIO?: string;     // U8
    // --- Adquisición: Persona Física ---
    INE_OCR_PF?: string;                    // U20
    ACTIVIDAD_ECONOMICA_PF?: string;        // U21
    // RFC_PF?                               // U22 (Ya cubierto por RFC_PROVEEDOR)
    CURP_PF?: string;                       // U23
    DOMICILIO_FISCAL_PF?: string;           // U24
    // --- Adquisición/Servicio: Persona Moral ---
    NUMERO_ESCRITURA_ACTA?: string;         // U17, U26
    FECHA_ESCRITURA_ACTA?: string;          // U18, U27
    LICENCIADO_ACTA?: string;               // U19, U28
    NUMERO_NOTARIA_ACTA?: string;           // U20, U29
    DEMARCACION_NOTARIAL_ACTA?: string;     // U21, U30
    // APODERADO_LEGAL_PM?                  // U22, U31, U32 (Cubierto por NOMBRE_APODERADO)
    NUMERO_ESCRITURA_PODER?: string;        // U33
    FECHA_ESCRITURA_PODER?: string;         // U34
    LICENCIADO_PODER?: string;              // U35
    NUMERO_NOTARIA_PODER?: string;          // U36
    INE_IDMEX_REP_LEGAL?: string;           // U23, U37
    // RFC_PM?                              // U24, U38 (Cubierto por RFC_PROVEEDOR)
    // DOMICILIO_PM?                        // U25, U39 (Cubierto por DOMICILIO_PROVEEDOR)
    // Objeto / Descripción
    DESCRIPCION_OBJETO: string;             // U9, U26, U27, U28, U40, U41, U42
    // Vigencia
    FECHA_INICIO_CONTRATO: string;          // U29, U43
    FECHA_FIN_CONTRATO: string;             // U29, U43
    // Montos
    MONTO_TOTAL_NUMERO: string;             // U30, U45 (Monto principal o Máximo)
    MONTO_TOTAL_LETRAS: string;
    MONTO_MINIMO_NUMERO?: string;           // U44 (Sólo Adquisición)
    MONTO_MINIMO_LETRAS?: string;           // U44 (Sólo Adquisición)
    // Garantías
    MONTO_GARANTIA_CUMPLIMIENTO?: string;   // U32, U46 (Monto numérico)
    MONTO_GARANTIA_VICIOS?: string;         // U33, U47 (Monto numérico)
    TEXTO_GARANTIA?: string;                // Texto descriptivo cláusula garantía
    // Pago
    CONDICIONES_PAGO?: string;              // Texto descriptivo cláusula condiciones
    // CALENDARIO_PAGO?                     // U31 (Parece ser tabla, difícil en Word template simple)
    // Cierre
    NUMERO_HOJAS: string;                   // U34, U48
    FECHA_TERMINACION_DOC: string;          // U35, U49 (Fecha firma/elaboración)
    // ... CUALQUIER OTRO TAG [Uxx] QUE FALTE ...
}

// --- Funciones Helper (asumiendo que ya existen y manejan null/undefined/number) ---
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '_______'; // Placeholder para fechas vacías
    try {
        const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00Z');
        // Formato "DD de Month de YYYY"
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    } catch (e) { return 'Fecha inválida'; }
};

const formatCurrency = (amount: string | null, currency: string | null = 'MXN'): string => {
     if (amount === null || amount === undefined) return '_______';
     const numberAmount = parseFloat(amount);
     if (isNaN(numberAmount)) return 'Valor inválido';
     // Devuelve solo el número formateado para la plantilla
     return numberAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- *** CONVERSIÓN A LETRAS (REQUIERE INSTALAR LIBRERÍA 'numero-a-letras') *** ---
// --- ***       O USA TU PROPIA LÓGICA O UNA ALTERNATIVA           *** ---
const formatCurrencyToWords = (amount: string | null, currency: string | null = 'MXN'): string => {
     if (amount === null || amount === undefined) return '_______';
     const numberAmount = parseFloat(amount);
     if (isNaN(numberAmount)) return 'Valor inválido';
     try {
          // Ejemplo usando 'numero-a-letras' (instálala: npm i numero-a-letras)
          const numeroALetras = require('numero-a-letras'); // O usa import si tu config lo permite
          const [integerPart, decimalPart = '00'] = String(numberAmount.toFixed(2)).split('.');
          const currencyName = currency?.toUpperCase() === 'USD' ? 'DÓLARES AMERICANOS' : 'PESOS';
          const letras = numeroALetras.NumerosALetras(parseInt(integerPart));
          return `${letras} ${currencyName} ${decimalPart}/100 M.N.`.toUpperCase();
     } catch (e) {
         console.error("Error convirtiendo número a letras (¿librería instalada?):", e);
         return `(${formatCurrency(amount, currency)} - Error en conversión a letras)`; // Fallback
     }
};
// --- Fin Helpers ---


export function mapContratoToTemplateData(contrato: ContratoDetallado): TemplateData {
    const td = contrato.template_data ?? {}; // Datos del formulario (template_data JSONB)
    const suf = td.suficiencia as SuficienciaInput | undefined ?? {};
    const areaReq = td.areaRequirente as AreaRequirenteInput | undefined ?? {};
    const tipoPlantilla = td.tipoContrato; // 'servicio' o 'adquisicion'

    if (!tipoPlantilla) {
        throw new Error("Tipo de contrato no definido en template_data");
    }

    const proveedor = contrato.proveedor; // Datos del proveedor (tabla proveedores, físicas, morales)
    const esMoral = proveedor?.tipo_proveedor === 'moral';
    const esFisica = proveedor?.tipo_proveedor === 'fisica';

    // --- Preparar datos del proveedor ---
    let razonSocialNombre = proveedor?.rfc ?? 'Proveedor no encontrado'; // Fallback inicial
    let apoderadoNombre = '';
    let datosActa = { num: '____', fecha: '____', lic: '____', notaria: '____', demarcacion: '____' };
    let datosPoder = { num: '____', fecha: '____', lic: '____', notaria: '____' };
    let ineRepLegal = '_________________________';
    let domicilioFiscal = '_________________________';
    let ocrPF = '_____________';
    let actividadPF = '_________________________';
    let curpPF = '__________________';

    if (esMoral) {
        razonSocialNombre = proveedor.razon_social ?? 'RAZÓN SOCIAL N/A';
        // Aquí necesitas lógica para obtener los datos del Acta y Poder si están en `proveedor`
        // Esto depende de cómo `getProveedorById` llena el objeto `ProveedorDetallado`
        // Ejemplo (si estuvieran directamente en el objeto proveedor):
        // datosActa.num = proveedor.acta_numero ?? '____';
        // datosActa.fecha = formatDate(proveedor.acta_fecha);
        // ... etc ...
        // datosPoder.num = proveedor.poder_numero ?? '____';
        // ... etc ...
        const rep = proveedor.representantes?.[0]; // Asume el primero
        if (rep) {
             apoderadoNombre = `${rep.nombre_representante ?? ''} ${rep.apellido_p_representante ?? ''} ${rep.apellido_m_representante ?? ''}`.trim();
             // ineRepLegal = proveedor.representante_ine ?? 'INE NO PROPORCIONADO'; // Si tuvieras este dato
        }
        domicilioFiscal = `${proveedor.calle ?? ''} ${proveedor.numero ?? ''}, COL. ${proveedor.colonia ?? ''}, ${proveedor.municipio ?? ''}, ${proveedor.estado ?? ''}, C.P. ${proveedor.codigo_postal ?? ''}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim() || 'DOMICILIO NO DISPONIBLE';

    } else if (esFisica) {
        razonSocialNombre = `${proveedor.nombre_fisica ?? ''} ${proveedor.apellido_p_fisica ?? ''} ${proveedor.apellido_m_fisica ?? ''}`.trim() || 'NOMBRE NO DISPONIBLE';
        apoderadoNombre = razonSocialNombre; // Se representa a sí mismo
        domicilioFiscal = `${proveedor.calle ?? ''} ${proveedor.numero ?? ''}, COL. ${proveedor.colonia ?? ''}, ${proveedor.municipio ?? ''}, ${proveedor.estado ?? ''}, C.P. ${proveedor.codigo_postal ?? ''}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim() || 'DOMICILIO NO DISPONIBLE';
         // Datos específicos de PF (asume que están en el objeto proveedor)
         // ocrPF = proveedor.ocr_ine ?? '_____________';
         // actividadPF = proveedor.actividad_economica ?? '_________________________';
         curpPF = proveedor.curp ?? '__________________';
    }

    // --- Mapeo Final a los TAGS ---
    const data: Partial<TemplateData> = { // Usar Partial temporalmente
        // Encabezado y Partes
        TIPO_CONTRATO: tipoPlantilla === 'servicio' ? 'CONTRATO DE SERVICIO DE' : 'CONTRATO DE ADQUISICIÓN DE',
        NOMBRE_CONTRATO: td.nombreContratoAdquisicion, // Solo para Adquisición
        RAZON_SOCIAL_PROVEEDOR: razonSocialNombre,
        NUMERO_PROCEDIMIENTO: td.numeroProcedimiento ?? `PENDIENTE_${contrato.id_contrato}`,
        NOMBRE_FUNCIONARIO_AREA: areaReq.nombreFuncionario,
        CARGO_FUNCIONARIO_AREA: areaReq.cargoFuncionario,
        NOMBRE_APODERADO: apoderadoNombre,
        // Suficiencia
        FECHA_SUFICIENCIA: formatDate(suf.fecha),
        NUMERO_SUFICIENCIA: suf.numeroOficio,
        CUENTA_SUFICIENCIA: suf.cuenta,
        RECURSO_SUFICIENCIA: suf.tipoRecurso,
        // Fundamento y Datos Proveedor
        ARTICULO_FUNDAMENTO: td.articuloFundamento,
        RFC_PROVEEDOR: proveedor?.rfc,
        DOMICILIO_PROVEEDOR: domicilioFiscal, // Domicilio fiscal o general? Ajustar
        // Adquisición: Oficio
        NUMERO_OFICIO_PETICION: td.oficioPeticionNumero,
        FECHA_OFICIO_PETICION: formatDate(td.oficioPeticionFecha),
        // Asumiendo fijos por ahora, ajustar si vienen del formulario/área requirente
        FUNCIONARIO_RECIBE_OFICIO: 'Lic. José Miguel Valencia Molina',
        FUNCIONARIO_DIRIGE_OFICIO: 'Lic. Ernesto Mora Rico', // ¿O usar areaReq.nombreFuncionario?
        // Adquisición: PF
        INE_OCR_PF: ocrPF, // Necesita venir del proveedor
        ACTIVIDAD_ECONOMICA_PF: actividadPF, // Necesita venir del proveedor
        CURP_PF: curpPF, // Viene del proveedor (asegurado)
        // Servicio/Adquisición: PM
/**
        NUMERO_ESCRITURA_ACTA: datosActa.num, // Necesita venir del proveedor
        FECHA_ESCRITURA_ACTA: datosActa.fecha, // Necesita venir del proveedor
        LICENCIADO_ACTA: datosActa.lic, // Necesita venir del proveedor
        NUMERO_NOTARIA_ACTA: datosActa.notaria, // Necesita venir del proveedor
        DEMARCACION_NOTARIAL_ACTA: datosActa.demarcacion, // Necesita venir del proveedor
        NUMERO_ESCRITURA_PODER: datosPoder.num, // Necesita venir del proveedor
        FECHA_ESCRITURA_PODER: datosPoder.fecha, // Necesita venir del proveedor
        LICENCIADO_PODER: datosPoder.lic, // Necesita venir del proveedor
        NUMERO_NOTARIA_PODER: datosPoder.notaria, // Necesita venir del proveedor
        INE_IDMEX_REP_LEGAL: ineRepLegal, // Necesita venir del proveedor
        // Objeto
        DESCRIPCION_OBJETO: td.objetoPrincipal, // Usar el del formulario
        */
        NUMERO_ESCRITURA_ACTA: '_', // Necesita venir del proveedor
        FECHA_ESCRITURA_ACTA: '_', // Necesita venir del proveedor
        LICENCIADO_ACTA: '_', // Necesita venir del proveedor
        NUMERO_NOTARIA_ACTA: '_', // Necesita venir del proveedor
        DEMARCACION_NOTARIAL_ACTA: '_', // Necesita venir del proveedor
        NUMERO_ESCRITURA_PODER: '_', // Necesita venir del proveedor
        FECHA_ESCRITURA_PODER: '_', // Necesita venir del proveedor
        LICENCIADO_PODER: '_', // Necesita venir del proveedor
        NUMERO_NOTARIA_PODER: '_', // Necesita venir del proveedor
        INE_IDMEX_REP_LEGAL: '_', // Necesita venir del proveedor
        // Objeto
        DESCRIPCION_OBJETO: td.objetoPrincipal, // Usar el del formulario
        // Vigencia
        FECHA_INICIO_CONTRATO: formatDate(td.fechaInicio),
        FECHA_FIN_CONTRATO: formatDate(td.fechaFin),
        // Montos
        MONTO_TOTAL_NUMERO: formatCurrency(td.montoTotal, td.moneda), // Usa el del formulario
        MONTO_TOTAL_LETRAS: formatCurrencyToWords(td.montoTotal, td.moneda), // Usa el del formulario
        MONTO_MINIMO_NUMERO: formatCurrency(td.montoMinimo, td.moneda), // Solo Adq
        MONTO_MINIMO_LETRAS: formatCurrencyToWords(td.montoMinimo, td.moneda), // Solo Adq
        // Garantías
        MONTO_GARANTIA_CUMPLIMIENTO: formatCurrency(td.montoGarantiaCumplimiento, td.moneda),
        MONTO_GARANTIA_VICIOS: formatCurrency(td.montoGarantiaVicios, td.moneda),
        TEXTO_GARANTIA: td.garantiasTexto,
        // Pago
        CONDICIONES_PAGO: td.condicionesPago,
        // Cierre
        NUMERO_HOJAS: td.numeroHojas?.toString(),
        FECHA_TERMINACION_DOC: formatDate(td.fechaFirma),
    };

    // Rellenar campos faltantes con placeholders para evitar errores de tag no encontrado
    const finalData: TemplateData = { ...data } as TemplateData; // Inicia con los mapeados
    const allKeys = Object.keys(finalData) as Array<keyof TemplateData>; // Claves de la interfaz
    allKeys.forEach(key => {
         if (finalData[key] === null || finalData[key] === undefined || finalData[key] === '') {
             // Asigna un placeholder o string vacío según prefieras
             finalData[key] = '_______' as any; // Placeholder genérico
         }
    });

    // Forzar tipo al final después de asegurar que todas las claves existen (o tienen placeholder)
    return finalData;
}