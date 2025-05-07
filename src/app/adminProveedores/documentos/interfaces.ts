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
  rfc: string;
  tipo_proveedor: string; // <--- Este campo debe existir
  nombre_o_razon_social: string; // <--- Este campo también
}
export interface ComentarioDocProveedor {
  id_comentario: number;
  comentario: string;
  id_documento_proveedor: number;
  id_usuario_admin: number;
  nombre_admin?: string;
  apellidos_admin?: string;
  created_at: string; // o Date si haces conversión
}

// Interfaz para crear un nuevo comentario
export interface CreateComentarioData {
  id_documento_proveedor: number;
  id_usuario_admin: number; // ID del admin que está comentando
  comentario: string;
}