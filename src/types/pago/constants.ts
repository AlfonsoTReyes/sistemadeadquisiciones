/**
 * @fileoverview Define constantes utilizadas en la aplicación Next.js,
 * específicamente los costos asociados a diferentes tipos de trámites.
 */

/**
 * Objeto que mapea las claves internas de los trámites (usadas en URLs, selects, etc.)
 * a su información relevante, como el nombre para mostrar y el costo.
 *
 * **Importante:** Los costos definidos aquí deben mantenerse sincronizados
 * con los definidos en el módulo PHP (`config/config.php` o donde se definan
 * los costos que usa `iniciar_pago.php`) para asegurar consistencia.
 *
 * Este objeto se utiliza en el lado del servidor de Next.js (ej: en la API route
 * `/api/pagos/iniciar`) para obtener el monto correcto que se registrará
 * localmente en la tabla `pagos_locales`.
 *
 * @constant
 * @type {Record<string, { nombre: string, costo: number }>}
 * @property {object} acuatica - Datos del trámite de Acuática.
 * @property {string} acuatica.nombre - Nombre descriptivo del trámite.
 * @property {number} acuatica.costo - Costo numérico del trámite.
 * @property {object} visto_bueno - Datos del trámite de Visto Bueno.
 * @property {string} visto_bueno.nombre - Nombre descriptivo del trámite.
 * @property {number} visto_bueno.costo - Costo numérico del trámite.
 * @property {object} giro - Datos del trámite de Giro Comercial.
 * @property {string} giro.nombre - Nombre descriptivo del trámite.
 * @property {number} giro.costo - Costo numérico del trámite.
 * @property {object} licencia - Datos del trámite de Licencia.
 * @property {string} licencia.nombre - Nombre descriptivo del trámite.
 * @property {number} licencia.costo - Costo numérico del trámite.
 */
export const TRAMITES_COSTOS_NEXT: Record<string, { nombre: string, costo: number }> = {
    "acuatica": { nombre: "Acuática", costo: 1.00 },
    "visto_bueno": { nombre: "Visto Bueno", costo: 100.39 }, // Costo confirmado desde el PHP funcional
    "giro": { nombre: "Giro Comercial", costo: 1.50 },
    "licencia": { nombre: "Licencia", costo: 1.00 },
    "Proveedores": { nombre: "Proveedores", costo: 1.00 },
    // Agrega aquí otros trámites y sus costos si es necesario
};

// Podrías añadir otras constantes aquí si las necesitas, por ejemplo:
// export const ESTADOS_PAGO_LOCAL = ['pendiente', 'confirmado', 'fallido', ...]