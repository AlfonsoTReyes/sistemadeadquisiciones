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
export interface ProveedorCompletoData {
    id_proveedor: number;
    rfc?: string | null;
    giro_comercial?: string | null;
    correo?: string | null;
    calle?: string | null;
    numero?: string | null;
    colonia?: string | null;
    codigo_postal?: string | null;
    municipio?: string | null;
    estado?: string | null;
    telefono_uno?: string | null;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    fecha_inscripcion?: string | null;
    fecha_vigencia?: string | null;
    estatus?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    fecha_solicitud?: string | null;
    id_usuario_proveedor?: number | null;
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';

    // **NUEVOS CAMPOS**
    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;

    // Morales
    razon_social?: string | null;
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;

    // Físicas
    nombre_fisica?: string | null;
    apellido_p_fisica?: string | null;
    apellido_m_fisica?: string | null;
    curp?: string | null;

    // ... otros campos que puedan existir ...
     [key: string]: any;
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