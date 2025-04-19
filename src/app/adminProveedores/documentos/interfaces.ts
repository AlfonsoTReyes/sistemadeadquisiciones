export interface DocumentoProveedor {
    id_documento_proveedor: number;
    id_proveedor: number;
    tipo_documento: string;
    nombre_original: string;
    ruta_archivo: string;
    id_usuario: number;
    estatus: string;
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
  id_usuario: number; // ID del usuario que comentó (admin)
  comentario: string;
  created_at: Date; // O string, dependiendo de cómo lo devuelva la librería
  updated_at: Date; // O string
  // Opcional: Datos del admin que comentó (obtenidos con JOIN)
  nombre_admin?: string | null;
  apellidos_admin?: string | null;
  email_admin?: string | null;
}

// Interfaz para crear un nuevo comentario
export interface CreateComentarioData {
  id_documento_proveedor: number;
  id_usuario_admin: number; // ID del admin que está comentando
  comentario: string;
}