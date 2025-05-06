// src/services/notificaciones/notificacionService.ts (o donde definas esto)

export interface NotificacionInput {
    titulo: string;
    mensaje: string;
    tipo?: string; // Opcional, default 'Informativo'
    id_usuario_origen: number; // Quién envía (ID de usuario admin/sistema)
    destino: {
        tipo: 'usuario';
        id: number; // ID del usuario destino (puede ser admin o proveedor)
    } | {
        tipo: 'rol';
        ids: number[]; // Array de IDs de rol destino
    };
    // estatus por defecto es true en la BD
}