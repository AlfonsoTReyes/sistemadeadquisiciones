// src/services/pagoLocalService.ts

/**
 * @fileoverview Servicio para interactuar con la tabla `pagos_locales`
 * en la base de datos PostgreSQL/NeonDB de la aplicación Next.js.
 * Maneja el registro y actualización del estado de los pagos iniciados
 * desde esta aplicación.
 */

import { sql } from '@vercel/postgres';
// Ajusta la ruta si tu interfaz está en otro lugar
import { PagoLocal } from '@/types/pago';

// --- Funciones del Servicio ---

/**
 * Registra un intento de inicio de pago en la tabla local `pagos_locales`.
 * Esta función se llama después de obtener una respuesta exitosa del módulo PHP
 * que indica que el proceso de pago con el proveedor ha comenzado.
 * Guarda la referencia y los datos necesarios para rastrear el pago localmente.
 * Utiliza ON CONFLICT para evitar errores si se intenta registrar la misma referencia dos veces.
 *
 * @async
 * @function registrarIntentoPago
 * @param {string} referencia - La referencia única de la transacción, generada por el módulo PHP.
 * @param {string | null} tramite - El identificador o nombre del trámite asociado al pago.
 * @param {number | null} monto - El monto del pago.
 * @param {string} urlPagoMit - La URL del iframe de pago devuelta por el módulo PHP.
 * @param {string} requestDataCifrado - Los datos cifrados originales (IV+Ciphertext Base64) que se enviaron a MIT (devueltos por el módulo PHP).
 * @returns {Promise<number | null>} El ID del registro insertado/existente en `pagos_locales` o null si ocurre un error de base de datos.
 */
export const registrarIntentoPago = async (
    referencia: string,
    tramite: string | null,
    monto: number | null,
    urlPagoMit: string,
    requestDataCifrado: string
): Promise<number | null> => {
    console.log(`SERVICE: Registrando intento de pago local para referencia: ${referencia}`);
    try {
        // Inserta el nuevo registro o no hace nada si la referencia ya existe
        const result = await sql<{ id: number }>`
            INSERT INTO pagos_locales
                (referencia, tramite, monto, estado, url_pago_mit, request_data_cifrado, fecha_creacion, fecha_actualizacion)
            VALUES
                (${referencia}, ${tramite}, ${monto}, 'pendiente', ${urlPagoMit}, ${requestDataCifrado}, NOW(), NOW())
            ON CONFLICT (referencia) DO NOTHING
            RETURNING id;
        `;
        const insertedId = result.rows[0]?.id ?? null;

        if (insertedId) {
            // Si se insertó un nuevo registro, devuelve su ID
            console.log(`SERVICE: Intento de pago local registrado con ID: ${insertedId}`);
            return insertedId;
        } else {
            // Si no se insertó (conflicto), busca el ID del registro existente
            console.log(`SERVICE: Referencia ${referencia} ya existía o inserción omitida. Buscando ID existente.`);
            const existingId = await obtenerIdPagoLocalPorReferencia(referencia);
            if (existingId) {
                console.log(`SERVICE: ID existente encontrado: ${existingId}`);
                return existingId; // Devuelve el ID existente
            } else {
                // Caso raro: hubo conflicto pero no se encuentra. Loguear.
                console.warn(`SERVICE: No se pudo insertar ni encontrar ID existente para referencia ${referencia}`);
                return null;
            }
        }
    } catch (error: any) {
        console.error(`SERVICE ERROR in registrarIntentoPago (ref: ${referencia}):`, error);
        return null; // Indica fallo
    }
};

/**
 * Marca un pago local como 'proxy_webhook_llamado'.
 * Esta función es específica para la **Opción A** del flujo de confirmación,
 * donde la API de Next.js llama al webhook PHP. Indica que la llamada proxy se realizó.
 * Actualiza el estado solo si estaba 'pendiente'.
 *
 * @async
 * @function marcarProxyWebhookLlamado
 * @param {string} referencia - La referencia única de la transacción.
 * @returns {Promise<boolean>} True si la consulta UPDATE se ejecutó sin errores SQL, false en caso contrario.
 *          No garantiza que se hayan afectado filas (podría no estar 'pendiente').
 */
export const marcarProxyWebhookLlamado = async (referencia: string): Promise<boolean> => {
    console.log(`SERVICE: Marcando proxy_webhook_llamado para referencia: ${referencia}`);
    try {
        // Actualiza el estado a 'proxy_webhook_llamado' si está 'pendiente'
        const result = await sql`
            UPDATE pagos_locales
            SET estado = 'proxy_webhook_llamado', fecha_actualizacion = NOW()
            WHERE referencia = ${referencia} AND estado = 'pendiente';
        `;
        console.log(`SERVICE: Resultado de UPDATE para proxy_webhook_llamado (ref ${referencia}): ${result.rowCount} filas afectadas.`);
        return true; // La consulta se ejecutó sin error SQL
    } catch (error: any) {
        console.error(`SERVICE ERROR in marcarProxyWebhookLlamado (ref ${referencia}):`, error);
        return false;
    }
};

/**
 * Obtiene los detalles completos de un registro de pago local por su referencia.
 *
 * @async
 * @function obtenerPagoLocalPorReferencia
 * @param {string} referencia - La referencia única de la transacción a buscar.
 * @returns {Promise<PagoLocal | null>} Un objeto `PagoLocal` si se encuentra, o `null` si no existe o hay un error de BD.
 */
export const obtenerPagoLocalPorReferencia = async (referencia: string): Promise<PagoLocal | null> => {
    console.log(`SERVICE: Obteniendo pago local para referencia: ${referencia}`);
    try {
        // Selecciona el registro basado en la referencia
        const result = await sql<PagoLocal>`
            SELECT * FROM pagos_locales WHERE referencia = ${referencia} LIMIT 1;
        `;
        if (result.rowCount === 0) {
            console.log(`SERVICE: Pago local no encontrado para referencia: ${referencia}`);
            return null;
        }
        console.log(`SERVICE: Pago local encontrado para referencia: ${referencia}`);
        // Devuelve la primera (y única) fila encontrada
        return result.rows[0];
    } catch (error: any) {
        console.error(`SERVICE ERROR in obtenerPagoLocalPorReferencia (ref ${referencia}):`, error);
        return null; // Indica fallo
    }
};

/**
 * Obtiene el ID interno (`id`) de un pago local basado en su referencia.
 * Es una función auxiliar utilizada internamente por `registrarIntentoPago`.
 * No está pensada para ser exportada o usada directamente por las API Routes.
 *
 * @async
 * @function obtenerIdPagoLocalPorReferencia
 * @param {string} referencia - La referencia única de la transacción.
 * @returns {Promise<number | null>} El ID numérico del pago o null si no se encuentra o hay error.
 * @internal
 */
const obtenerIdPagoLocalPorReferencia = async (referencia: string): Promise<number | null> => {
    try {
        // Selecciona solo el ID para eficiencia
        const result = await sql<{ id: number }>`
           SELECT id FROM pagos_locales WHERE referencia = ${referencia} LIMIT 1;
       `;
        // Devuelve el ID de la primera fila, o null si no hay filas
        return result.rows[0]?.id ?? null;
    } catch (error: any) {
        console.error(`SERVICE ERROR in obtenerIdPagoLocalPorReferencia (ref ${referencia}):`, error);
        return null; // Indica fallo
    }
};

/**
 * Obtiene una lista de los últimos registros de pagos locales, ordenados
 * por fecha de creación descendente. Utilizado por el dashboard de pagos.
 *
 * @async
 * @function getAllPagosLocales
 * @param {number} [limit=50] - Número máximo de registros a devolver. Se aplica un límite interno seguro.
 * @returns {Promise<PagoLocal[]>} Un array de objetos `PagoLocal`. Devuelve un array vacío en caso de error.
 */
export const getAllPagosLocales = async (limit: number = 50): Promise<PagoLocal[]> => {
    console.log(`SERVICE: Obteniendo los últimos ${limit} pagos locales.`);
    try {
        // Limitar el valor de 'limit' para seguridad y rendimiento
        const safeLimit = Math.max(1, Math.min(1000, Math.floor(limit)));
        // Obtener los registros ordenados por fecha más reciente
        const result = await sql<PagoLocal>`
            SELECT * FROM pagos_locales
            ORDER BY fecha_creacion DESC
            LIMIT ${safeLimit};
        `;
        console.log(`SERVICE: Encontrados ${result.rowCount} pagos locales.`);
        // Devuelve las filas encontradas
        return result.rows;
    } catch (error: any) {
        console.error(`SERVICE ERROR in getAllPagosLocales:`, error);
        return []; // Devuelve array vacío para evitar romper la UI en caso de error
    }
};


/**
 * Actualiza el estado de un pago en la tabla local `pagos_locales` basado en la
 * notificación recibida desde el webhook PHP externo (Opción B o como parte de Opción A).
 * Establece el estado final ('confirmado_por_notificacion' o 'fallido'),
 * la fecha de confirmación y guarda datos adicionales opcionales.
 *
 * @async
 * @function marcarPagoConfirmadoExternamente
 * @param {string} referencia - La referencia única de la transacción a actualizar.
 * @param {string} estadoConfirmacion - El estado reportado por el módulo PHP (ej: 'Pagado', 'Rechazado', 'Confirmado (Webhook)'). Se mapeará a un estado local.
 * @param {number | null} [pagoIdModuloPHP] - (Opcional) El ID del registro correspondiente en la tabla `pagos` del módulo PHP.
 * @param {string | null} [datosReciboJson] - (Opcional) El string JSON del recibo generado por PHP, para caché local (requiere columna JSONB `datos_recibo_json`).
 * @returns {Promise<boolean>} True si la consulta UPDATE se ejecutó sin errores SQL, false en caso contrario.
 */
export const marcarPagoConfirmadoExternamente = async (
    referencia: string,
    estadoConfirmacion: string,
    pagoIdModuloPHP?: number | null,
    datosReciboJson?: string | null
): Promise<boolean> => {
    // Mapear estado recibido del PHP a estados locales
    let estadoLocal: PagoLocal['estado'];
    if (estadoConfirmacion === 'Confirmado (Webhook)' || estadoConfirmacion === 'Pagado' || estadoConfirmacion === 'success' || estadoConfirmacion === 'approved') {
        estadoLocal = 'confirmado_por_notificacion';
    } else {
        estadoLocal = 'fallido'; // Marcar como fallido si no es un estado de éxito conocido
    }

    console.log(`SERVICE: Marcando pago como '${estadoLocal}' desde notificación externa para ref: ${referencia}`);
    try {
        // Ejecutar la actualización en la base de datos local
        const result = await sql`
            UPDATE pagos_locales
            SET
                estado = ${estadoLocal},
                -- Establecer fecha_confirmacion solo si el estado es confirmado
                fecha_confirmacion = CASE WHEN ${estadoLocal} = 'confirmado_por_notificacion' THEN NOW() ELSE fecha_confirmacion END,
                fecha_actualizacion = NOW(),
                pago_id_modulo_php = ${pagoIdModuloPHP ?? null}, -- Usar null si no se proporciona
                -- Actualizar caché del recibo si se proporciona y la columna existe/es JSONB
                datos_recibo_json = ${datosReciboJson ? datosReciboJson : null}::jsonb
            WHERE referencia = ${referencia};
              -- Podrías añadir una condición WHERE para solo actualizar ciertos estados previos:
              -- AND estado IN ('pendiente', 'proxy_webhook_llamado')
        `;
        console.log(`SERVICE: Resultado de UPDATE para notificación externa (ref ${referencia}): ${result.rowCount} filas afectadas.`);
        // Devuelve true incluso si no se afectaron filas (ej: ya estaba actualizado)
        // Indica que la operación SQL no lanzó excepción.
        return true;
    } catch (error: any) {
        console.error(`SERVICE ERROR in marcarPagoConfirmadoExternamente (ref ${referencia}):`, error);
        return false; // Indica fallo en la operación SQL
    }
};


// --- Funciones Potenciales Futuras (Comentadas) ---
/*
 * Guarda el contenido JSON de un recibo (obtenido del módulo PHP)
 * en la caché local de la tabla `pagos_locales`.
 * @param {string} referencia - La referencia del pago.
 * @param {string} datosReciboJson - El string JSON del recibo.
 * @returns {Promise<boolean>} True si la actualización fue exitosa (al menos 1 fila afectada).
export const guardarReciboLocal = async (
    referencia: string,
    datosReciboJson: string
): Promise<boolean> => {
    console.log(`SERVICE: Guardando caché de recibo local para ref: ${referencia}`);
    try {
        const result = await sql`
            UPDATE pagos_locales
            SET datos_recibo_json = ${datosReciboJson}::jsonb, fecha_actualizacion = NOW()
            WHERE referencia = ${referencia};
        `;
        console.log(`SERVICE: Resultado de UPDATE para guardar recibo (ref ${referencia}): ${result.rowCount} filas afectadas.`);
        return result.rowCount > 0; // Devuelve true solo si afectó alguna fila
    } catch (error: any) {
        console.error(`SERVICE ERROR in guardarReciboLocal (ref ${referencia}):`, error);
        return false;
    }
}
*/