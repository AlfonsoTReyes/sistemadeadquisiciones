// src/lib/contratoTemplateMapper.ts (o un nombre similar)

import { ContratoDetallado } from '@/types/contrato';
// Podrías necesitar una librería para convertir números a letras
import numeroALetras from 'numero-a-letras';

interface TemplateData {
    // Tags de ejemplo (¡DEBEN COINCIDIR CON TU PLANTILLA!)
    TIPO_CONTRATO: string;
    RAZON_SOCIAL_PROVEEDOR: string;
    NOMBRE_PROVEEDOR_PF?: string; // Si es persona física
    NUMERO_PROCEDIMIENTO: string; // Ej: ADE.MSJR.SER.202502
    NOMBRE_FUNCIONARIO_AREA: string;
    CARGO_FUNCIONARIO_AREA: string;
    RAZON_SOCIAL_CONTRATADA: string; // Repetido? O es el nombre corto?
    NOMBRE_APODERADO: string;
    FECHA_SUFICIENCIA: string;
    NUMERO_SUFICIENCIA: string;
    CUENTA_SUFICIENCIA: string;
    RECURSO_SUFICIENCIA: string;
    ARTICULO_FUNDAMENTO?: string; // Ej: "22 fracción X"
    RFC_PROVEEDOR: string;
    DOMICILIO_PROVEEDOR: string;
    // --- Campos de ejemplo de la segunda plantilla ---
    NOMBRE_CONTRATO_ADQ?: string; // El nombre específico de la adquisición
    NUMERO_OFICIO_PETICION?: string;
    FECHA_OFICIO_PETICION?: string;
    FUNCIONARIO_RECIBE_OFICIO?: string; // Nombre
    FUNCIONARIO_DIRIGE_OFICIO?: string; // Nombre
    DESCRIPCION_ADQUISICION: string;
    // --- Campos comunes ---
    FECHA_INICIO_CONTRATO: string;
    FECHA_FIN_CONTRATO: string;
    MONTO_TOTAL_NUMERO: string; // Formateado como moneda
    MONTO_TOTAL_LETRAS: string; // ¡Requiere librería!
    MONTO_GARANTIA_CUMPLIMIENTO?: string;
    MONTO_GARANTIA_VICIOS?: string;
    FECHA_TERMINACION_DOC: string; // Fecha en la que se firma el doc
    NUMERO_HOJAS?: string;
    // ... Agrega TODOS los tags que uses en TUS plantillas ...
}

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


export function mapContratoToTemplateData(contrato: ContratoDetallado, tipoPlantilla: 'servicio' | 'adquisicion'): TemplateData {
    const proveedor = contrato.proveedor;
    const esMoral = proveedor?.tipo_proveedor === 'moral';
    const esFisica = proveedor?.tipo_proveedor === 'fisica';

    // Construye nombre/razón social y apoderado
    let razonSocialNombre = '_________________________';
    let apoderadoNombre = '_________________________';
    if (esMoral) {
        razonSocialNombre = proveedor?.razon_social ?? 'RAZÓN SOCIAL NO DISPONIBLE';
        // Asume el primer representante como apoderado (ajusta si es necesario)
        const rep = proveedor?.representantes?.[0];
        apoderadoNombre = rep ? `${rep.nombre_representante ?? ''} ${rep.apellido_p_representante ?? ''} ${rep.apellido_m_representante ?? ''}`.trim() : 'APODERADO NO DISPONIBLE';
    } else if (esFisica) {
        razonSocialNombre = `${proveedor.nombre_fisica ?? ''} ${proveedor.apellido_p_fisica ?? ''} ${proveedor.apellido_m_fisica ?? ''}`.trim() || 'NOMBRE NO DISPONIBLE';
        apoderadoNombre = razonSocialNombre; // Persona física se representa a sí misma
    }

    // Construye domicilio
    const domicilio = `${proveedor?.calle ?? ''} ${proveedor?.numero ?? ''}, COL. ${proveedor?.colonia ?? ''}, ${proveedor?.municipio ?? ''}, ${proveedor?.estado ?? ''}, C.P. ${proveedor?.codigo_postal ?? ''}`.replace(/,\s*,/g, ',').replace(/^\s*,\s*|\s*,\s*$/g, '').trim() || 'DOMICILIO NO DISPONIBLE';

    // Mapea los datos a los tags de la plantilla
    const data: TemplateData = {
        // --- Datos Comunes ---
        TIPO_CONTRATO: tipoPlantilla === 'servicio' ? 'CONTRATO DE SERVICIO DE' : 'CONTRATO DE ADQUISICIÓN DE',
        RAZON_SOCIAL_PROVEEDOR: razonSocialNombre,
        // Si necesitas diferenciar explícitamente para PF en plantilla:
        // NOMBRE_PROVEEDOR_PF: esFisica ? razonSocialNombre : undefined,
        // Ajusta esto al número real del procedimiento/contrato
        NUMERO_PROCEDIMIENTO: contrato.numero_contrato ?? `PENDIENTE_${contrato.id_contrato}`,
        RFC_PROVEEDOR: proveedor?.rfc ?? 'RFC NO DISPONIBLE',
        DOMICILIO_PROVEEDOR: domicilio,
        DESCRIPCION_ADQUISICION: contrato.objeto_contrato ?? 'OBJETO NO DEFINIDO', // Usar el objeto del contrato
        FECHA_INICIO_CONTRATO: formatDate(contrato.fecha_inicio),
        FECHA_FIN_CONTRATO: formatDate(contrato.fecha_fin),
        MONTO_TOTAL_NUMERO: formatCurrency(contrato.monto_total, contrato.moneda),
        MONTO_TOTAL_LETRAS: formatCurrencyToWords(contrato.monto_total, contrato.moneda),
        FECHA_TERMINACION_DOC: formatDate(new Date().toISOString()), // Fecha actual para la firma del doc generado
         // --- Datos específicos plantilla SERVICIO (ejemplos basados en OCR) ---
        NOMBRE_FUNCIONARIO_AREA: 'Mtro. en D.P.A. Orlando Chávez Landaverde', // Hardcoded o buscar dinámicamente?
        CARGO_FUNCIONARIO_AREA: 'Secretario de Seguridad Pública Municipal', // Hardcoded o buscar?
        RAZON_SOCIAL_CONTRATADA: razonSocialNombre, // O usar proveedor.razon_social directamente si es moral?
        NOMBRE_APODERADO: apoderadoNombre,
        // Datos Suficiencia (estos deberían venir del backend, no hardcoded)
        FECHA_SUFICIENCIA: '28 de febrero de 2025', // <- OBTENER DE DB/CONTRATO si es posible
        NUMERO_SUFICIENCIA: 'DP5.TP/OF. 2025000274', // <- OBTENER DE DB/CONTRATO
        CUENTA_SUFICIENCIA: '5135000400', // <- OBTENER DE DB/CONTRATO
        RECURSO_SUFICIENCIA: 'FT2025, Fortamun 2025', // <- OBTENER DE DB/CONTRATO
        // Datos Garantías (calcular basado en monto)
        MONTO_GARANTIA_CUMPLIMIENTO: formatCurrency(String(parseFloat(contrato.monto_total ?? '0') * 0.10), contrato.moneda),
        MONTO_GARANTIA_VICIOS: formatCurrency(String(parseFloat(contrato.monto_total ?? '0') * 0.10), contrato.moneda),
        // --- Datos específicos plantilla ADQUISICIÓN (ejemplos) ---
        NOMBRE_CONTRATO_ADQ: contrato.objeto_contrato, // O un campo específico si lo tienes
        // ... mapea el resto de los UXX de tus plantillas ...
         // Asegúrate de que todas las claves en TemplateData tengan un valor (aunque sea 'N/A' o '')
         ARTICULO_FUNDAMENTO: '22 fracción X', // Ejemplo
         NUMERO_OFICIO_PETICION: '______',
         FECHA_OFICIO_PETICION: '______',
         FUNCIONARIO_RECIBE_OFICIO: 'Lic. José Miguel Valencia Molina', // Hardcoded?
         FUNCIONARIO_DIRIGE_OFICIO: 'Lic. Ernesto Mora Rico', // Hardcoded?
         NUMERO_HOJAS: '19', // O calcular?

    };

    // Puedes añadir lógica condicional para llenar campos específicos de cada tipo de plantilla
    if (tipoPlantilla === 'servicio') {
        // data.CAMPO_SOLO_SERVICIO = 'Valor Servicio';
    } else {
        // data.CAMPO_SOLO_ADQUISICION = 'Valor Adquisición';
    }


    return data;
}