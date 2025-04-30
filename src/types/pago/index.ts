// src/types/index.ts

// Respuesta esperada de iniciar_pago.php
export interface IniciarPagoPHPResponse {
    success: boolean;
    message: string;
    paymentUrl?: string;
    encryptedRequestData?: string; // El XML <P> cifrado (IV+Ciphertext Base64)
    reference?: string;
}

// Datos enviados desde el frontend a /api/pagos/confirmar-pago
export interface ConfirmarPagoClienteBody {
    encryptedRequestData: string; // El dato recibido de iniciar_pago.php
    reference: string;
    // Puedes añadir otros datos que quieras pasar al webhook PHP si los necesitas
    // id_ciudadano?: number;
    // nombre_cliente?: string;
    // correo?: string;
}

// Datos enviados desde /api/pagos/confirmar-pago a webhook.php
export interface WebhookPHPRequestBody {
    strResponse: string; // Clave que espera webhook.php
    // Otros datos opcionales que webhook.php pueda leer del JSON
    // id_ciudadano?: number;
    // nombre_cliente?: string;
}

// Respuesta esperada de webhook.php
export interface WebhookPHPResponse {
    status: 'success' | 'error' | 'rejected' | string; // Ajusta según lo que devuelva tu PHP
    message: string;
}

// Datos de un recibo (ejemplo, ajusta según tu JSON real)
export interface ReciboData {
    titulo?: string;
    folioRecibo?: string;
    fechaHora?: string;
    cliente?: { nombre?: string; correo?: string };
    pago?: { referencia?: string; fecha?: string; monto?: number; autorizacion?: string };
    concepto?: { tramite?: string; descripcion?: string };
    emisor?: { nombre?: string; rfc?: string };
    gateway_info?: any;
}

// Estructura para la tabla local de pagos (opcional)
export interface PagoLocal {
    id: number;
    referencia: string;
    tramite: string | null;
    monto: number | null;
    estado: 'pendiente' | 'confirmado' | 'fallido' | 'error_proxy';
    url_pago_mit: string | null;
    request_data_cifrado: string | null; // encryptedRequestData
    fecha_creacion: Date;
    fecha_confirmacion: Date | null;
    pago_id_modulo_php: number | null; // ID de la tabla pagos en PHP
    datos_recibo_json: string | null; // Cache del recibo
}