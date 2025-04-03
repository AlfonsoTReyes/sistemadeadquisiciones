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