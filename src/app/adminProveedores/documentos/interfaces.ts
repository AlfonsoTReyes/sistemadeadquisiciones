export interface DocumentoProveedor {
    id_documento_proveedor: number;
    id_proveedor: number;
    tipo_documento: string;
    nombre_original: string;
    ruta_archivo: string;
    id_usuario: number;
    estatus: string | boolean;
    created_at: string; // O Date
    updated_at: string; // O Date
  }
 export interface ProveedorHeaderData {
    id_proveedor: number;
    rfc?: string | null;
    tipo_proveedor?: 'moral' | 'fisica' | 'desconocido' | string;
    // Añadir nombre/razón social si fetchProveedorDetallesPorIdAdmin lo devuelve
    nombre_o_razon_social?: string | null;
}
export interface ComentarioDocProveedor {
  id_comentario: number;
  id_documento_proveedor: number;
  id_usuario: number;
  comentario: string;
  created_at: string;
  nombre_admin?: string;
  apellidos_admin?: string;
}

// Interfaz para crear un nuevo comentario
export interface CreateComentarioData {
  id_documento_proveedor: number;
  id_usuario_admin: number; // ID del admin que está comentando
  comentario: string;
}