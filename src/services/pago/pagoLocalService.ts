// src/services/pagoLocalService.ts

import { sql } from '@vercel/postgres';
// Asegúrate que la ruta de importación sea correcta para tus tipos
import { PagoLocal } from '@/types/pago';

// --- Funciones del Servicio ---

/**
 * Registra un intento de pago en la tabla local de Next.js (PostgreSQL/NeonDB).
 * Se llama justo después de obtener una respuesta exitosa (con URL) del módulo PHP.
 * @param referencia La referencia única generada para la transacción.
 * @param tramite El identificador del trámite.
 * @param monto El monto del trámite.
 * @param urlPagoMit La URL del iframe de pago recibida de MIT (via PHP).
 * @param requestDataCifrado El dato cifrado (IV+Ciphertext Base64) devuelto por PHP.
 * @returns {Promise<number | null>} El ID del registro insertado o null en caso de error.
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
            console.log(`SERVICE: Intento de pago local registrado con ID: ${insertedId}`);
        } else {
            console.log(`SERVICE: Referencia ${referencia} ya existía o inserción falló. Buscando ID existente.`);
            const existing = await obtenerIdPagoLocalPorReferencia(referencia);
             if (existing) {
                console.log(`SERVICE: ID existente encontrado: ${existing}`);
                return existing;
             } else {
                 console.warn(`SERVICE: No se pudo insertar ni encontrar ID existente para referencia ${referencia}`);
                 return null;
             }
        }
        return insertedId;
    } catch (error: any) {
        console.error(`SERVICE ERROR in registrarIntentoPago (ref: ${referencia}):`, error);
        return null;
    }
};

/**
 * Marca un pago local como 'proxy_webhook_llamado'.
 * Se llama desde la API /api/pagos/confirmar-pago después de llamar exitosamente al webhook.php.
 * @param referencia La referencia única de la transacción.
 * @returns {Promise<boolean>} True si la actualización fue exitosa (o no necesaria), false en caso de error.
 */
export const marcarProxyWebhookLlamado = async (referencia: string): Promise<boolean> => {
     console.log(`SERVICE: Marcando proxy_webhook_llamado para referencia: ${referencia}`);
     try {
        const result = await sql`
            UPDATE pagos_locales
            SET estado = 'proxy_webhook_llamado', fecha_actualizacion = NOW()
            WHERE referencia = ${referencia} AND estado = 'pendiente';
        `;
        console.log(`SERVICE: Resultado de UPDATE para proxy_webhook_llamado (ref ${referencia}): ${result.rowCount} filas afectadas.`);
        return true;
     } catch (error: any) {
        console.error(`SERVICE ERROR in marcarProxyWebhookLlamado (ref ${referencia}):`, error);
        return false;
     }
};

/**
 * Obtiene los detalles de un pago local por su referencia.
 * @param referencia La referencia única de la transacción.
 * @returns {Promise<PagoLocal | null>} El objeto PagoLocal o null si no se encuentra o hay error.
 */
export const obtenerPagoLocalPorReferencia = async (referencia: string): Promise<PagoLocal | null> => {
     console.log(`SERVICE: Obteniendo pago local para referencia: ${referencia}`);
     try {
        const result = await sql<PagoLocal>`
            SELECT * FROM pagos_locales WHERE referencia = ${referencia} LIMIT 1;
        `;
        if (result.rowCount === 0) {
            console.log(`SERVICE: Pago local no encontrado para referencia: ${referencia}`);
            return null;
        }
        console.log(`SERVICE: Pago local encontrado para referencia: ${referencia}`);
        return result.rows[0];
     } catch (error: any) {
        console.error(`SERVICE ERROR in obtenerPagoLocalPorReferencia (ref ${referencia}):`, error);
        return null;
     }
};

/**
 * Obtiene el ID de un pago local por su referencia.
 * Función auxiliar para registrarIntentoPago.
 * @param referencia La referencia única de la transacción.
 * @returns {Promise<number | null>} El ID del pago o null si no se encuentra.
 */
const obtenerIdPagoLocalPorReferencia = async (referencia: string): Promise<number | null> => {
    try {
       const result = await sql<{ id: number }>`
           SELECT id FROM pagos_locales WHERE referencia = ${referencia} LIMIT 1;
       `;
       return result.rows[0]?.id ?? null;
    } catch (error: any) {
       console.error(`SERVICE ERROR in obtenerIdPagoLocalPorReferencia (ref ${referencia}):`, error);
       return null;
    }
};

// --- ¡¡FUNCIÓN AÑADIDA!! ---
/**
 * Obtiene una lista de los últimos pagos locales registrados.
 * Usado por la página del dashboard.
 * @param {number} [limit=50] - Número máximo de registros a devolver.
 * @returns {Promise<PagoLocal[]>} Un array de objetos PagoLocal.
 */
export const getAllPagosLocales = async (limit: number = 50): Promise<PagoLocal[]> => {
    console.log(`SERVICE: Obteniendo los últimos ${limit} pagos locales.`);
     try {
        // Validar y sanear el límite para evitar SQL injection (aunque sql`` lo maneja)
        const safeLimit = Math.max(1, Math.min(1000, Math.floor(limit))); // Limitar entre 1 y 1000

        const result = await sql<PagoLocal>`
            SELECT * FROM pagos_locales
            ORDER BY fecha_creacion DESC
            LIMIT ${safeLimit};
        `;
        console.log(`SERVICE: Encontrados ${result.rowCount} pagos locales.`);
        return result.rows;
     } catch (error: any) {
        console.error(`SERVICE ERROR in getAllPagosLocales:`, error);
         // Devolver array vacío en lugar de lanzar error a la página
        return [];
        // Opcional: throw new Error(`Error al obtener pagos locales: ${error.message}`);
     }
};


// --- Funciones Adicionales Comentadas (sin cambios) ---
/*
export const marcarPagoConfirmadoExternamente = async (...) => { ... };
export const guardarReciboLocal = async (...) => { ... };
*/