// src/types/index.ts

/**
 * @fileoverview Define las interfaces TypeScript utilizadas en la aplicación Next.js
 * para la interacción con el módulo de pago PHP externo y el manejo local de datos.
 */

/**
 * Describe la estructura de la respuesta JSON esperada del endpoint
 * `iniciar_pago.php` del módulo PHP externo cuando se inicia un pago.
 */
export interface IniciarPagoPHPResponse {
  /** Indica si la operación en el PHP fue exitosa en general. */
  success: boolean;
  /** Mensaje descriptivo del resultado (éxito o error) desde el PHP. */
  message: string;
  /**
   * La URL segura del iframe de pago de MIT/Getnet (si success es true).
   * Ejemplo: "https://u.mitec.com.mx/p/i/..."
   * @optional
   */
  paymentUrl?: string;
  /**
   * Los datos de la solicitud original (`<P>...</P>`), cifrados (IV+Ciphertext Base64),
   * devueltos por el PHP. Se necesita para reenviar al webhook PHP en la Opción A
   * o para referencia/depuración.
   * @optional
   */
  encryptedRequestData?: string;
  /**
   * La referencia única de la transacción generada por el módulo PHP.
   * Es crucial para rastrear el pago.
   * Ejemplo: "FACT17460495538693846b6a89cd2c22e"
   * @optional
   */
  reference?: string;
  /**
   * El monto calculado o recuperado por el PHP para este trámite.
   * (Opcional, depende de si se implementó su devolución en iniciar_pago.php).
   * @optional
   */
  monto?: number;
}

/**
 * Describe el cuerpo de la solicitud que el frontend (ej: `app/pago/page.tsx`)
 * envía a la API interna de Next.js (`/api/pagos/confirmar-pago`)
 * después de que el iframe de pago indica éxito (ej: via `postMessage`).
 */
export interface ConfirmarPagoClienteBody {
  /**
   * El valor de `encryptedRequestData` recibido originalmente en la respuesta
   * de `iniciar_pago.php`. Contiene el XML cifrado original.
   */
  encryptedRequestData: string;
  /** La referencia de la transacción, recibida originalmente de `iniciar_pago.php`. */
  reference: string;

  // --- Campos Opcionales ---
  // Se pueden añadir otros datos contextuales que el frontend tenga
  // y que podrían ser útiles si el webhook PHP los procesara (aunque actualmente no lo hace).
  /** ID del usuario/ciudadano en el sistema Next.js (si aplica). @optional */
  // id_ciudadano?: number;
  /** Nombre del cliente (si se capturó en el frontend). @optional */
  // nombre_cliente?: string;
  /** Correo electrónico del cliente (si se capturó). @optional */
  // correo?: string;
}

/**
 * Describe la estructura mínima del cuerpo JSON que la API Proxy de Next.js
 * (`/api/pagos/confirmar-pago`) envía al `webhook.php` real en el servidor externo.
 */
export interface WebhookPHPRequestBody {
  /**
   * Clave que espera el script `webhook.php`. Su valor es el
   * `encryptedRequestData` original que contiene el XML cifrado de confirmación de MIT.
   */
  strResponse: string;
  // Otros campos opcionales podrían añadirse aquí si modificas `webhook.php`
  // para leer más datos del cuerpo JSON además de usar `$_POST`.
}

/**
 * Describe la estructura de la respuesta JSON esperada del endpoint
 * `webhook.php` del módulo PHP externo (cuando es llamado por el proxy Next.js
 * o directamente por MIT).
 */
export interface WebhookPHPResponse {
  /**
   * Estado del procesamiento del webhook reportado por el PHP.
   * Los valores comunes son 'success', 'error', 'rejected'.
   * Podría incluir otros estados personalizados definidos en el PHP.
   */
  status: 'success' | 'error' | 'rejected' | string;
  /** Mensaje descriptivo del resultado del procesamiento del webhook en PHP. */
  message: string;
}

/**
 * Describe la estructura de los datos contenidos en un recibo de pago.
 * Esta interfaz debe coincidir con el JSON que genera la función
 * `generarYGuardarReciboPHP` y que se almacena en la columna `datos_recibo`
 * de la tabla `recibos` en la base de datos del módulo PHP.
 */
export interface ReciboData {
  /** Título del recibo (ej: "Recibo de Pago"). @optional */
  titulo?: string;
  /** Folio único generado para este recibo específico. @optional */
  folioRecibo?: string;
  /** Fecha y hora de generación del recibo (preferiblemente en formato ISO 8601). @optional */
  fechaHora?: string;
  /** Información del cliente asociada al pago. @optional */
  cliente?: {
    nombre?: string;
    correo?: string;
    id_ciudadano?: number | null;
  };
  /** Detalles específicos del pago confirmado. @optional */
  pago?: {
    referencia?: string;
    fecha?: string; // Formato 'YYYY-MM-DD'
    hora?: string; // Formato 'HH:MM:SS'
    monto?: number;
    metodo?: string; // Ej: 'Online (Webhook)'
    autorizacion?: string | null; // Código de autorización del banco/MIT
    moneda?: string;
  };
  /** Detalles sobre el concepto o trámite pagado. @optional */
  concepto?: {
    tramite?: string; // Clave o nombre corto del trámite
    descripcion?: string; // Descripción más larga del trámite
  };
  /** Información de la entidad que emite el recibo. @optional */
  emisor?: {
    nombre?: string;
    rfc?: string;
    // Otros datos del emisor si son necesarios
  };
  /** Información adicional proveniente directamente de la respuesta del gateway. @optional */
  gateway_info?: {
    cd_response?: string | null;
    foliocpagos?: string | null;
    nb_merchant?: string | null;
    cc_type?: string | null;
    tp_operation?: string | null;
    // Otros campos relevantes del XML de MIT
  };
}

/**
 * Representa la estructura de un registro en la tabla `pagos_locales`
 * de la base de datos PostgreSQL/NeonDB utilizada por la aplicación Next.js.
 * Esta tabla sirve para rastrear el estado de los pagos iniciados desde Next.js.
 */
export interface PagoLocal {
  /** Identificador único (SERIAL) del registro en la tabla local `pagos_locales`. */
  id: number;
  /** La referencia única de la transacción, generada por el módulo PHP. Debe ser UNIQUE. */
  referencia: string;
  /** Identificador del trámite asociado (ej: "acuatica", "visto_bueno"). */
  tramite: string | null;
  /** Monto del pago asociado al trámite. */
  monto: number | null; // Podría ser string si se prefiere leer así de la BD
  /**
   * Estado del proceso de pago desde la perspectiva de la aplicación Next.js.
   * - `pendiente`: El pago se inició, esperando confirmación.
   * - `proxy_webhook_llamado`: (Opción A) La API de Next.js llamó al webhook PHP.
   * - `confirmado_por_notificacion`: (Opción B o después de Opción A) Se recibió confirmación desde el backend PHP.
   * - `fallido`: Se recibió una notificación indicando que el pago falló.
   * - `error`: Ocurrió un error irrecuperable durante el proceso local.
   */
  estado: 'pendiente' | 'proxy_webhook_llamado' | 'confirmado_por_notificacion' | 'fallido' | 'error';
  /** URL del iframe de pago (`paymentUrl` devuelta por `iniciar_pago.php`). */
  url_pago_mit: string | null;
  /**
   * Los datos cifrados (`encryptedRequestData` devueltos por `iniciar_pago.php`).
   * Se guarda por si se necesita reenviar (Opción A) o para referencia.
   */
  request_data_cifrado: string | null;
  /** Fecha y hora (TIMESTAMPTZ) en que se creó este registro local. */
  fecha_creacion: Date; // El driver pg suele devolver objetos Date
  /** Fecha y hora (TIMESTAMPTZ) de la última actualización de este registro local. */
  fecha_actualizacion: Date; // El driver pg suele devolver objetos Date
  /** Fecha y hora (TIMESTAMPTZ) en que se recibió la confirmación del pago (si aplica). */
  fecha_confirmacion: Date | null; // El driver pg suele devolver objetos Date o null
  /** (Opcional) ID del registro correspondiente en la tabla `pagos` del módulo PHP. Útil para referencias cruzadas. */
  pago_id_modulo_php: number | null;
  /**
   * (Opcional) Caché local del objeto `ReciboData` (como string JSON).
   * Puede usarse para mostrar el recibo sin llamar siempre al PHP.
   */
  datos_recibo_json: string | null; // O podría ser `ReciboData | null` si se parsea/serializa
}