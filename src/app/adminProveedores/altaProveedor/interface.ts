export interface DocumentoData {
  id_documento_proveedor: number;
  id_proveedor: number;
  ruta_archivo: string; // ¿Es una URL completa, una ruta relativa, un identificador?
  estatus?: boolean | null; // Estatus del documento si aplica
  created_at: string; // O Date si se transforma
  updates_at?: string | null; // O Date
  nombre_original: string;
  tipo_documento: string; // Ejemplo: 'RFC', 'Acta Constitutiva', 'INE'
  id_usuario?: number | null; // Quién subió
}

export interface ProveedorData {
    id_proveedor: number;
    rfc?: string | null; // Permitir null si la BD puede tenerlo
    correo?: string | null;
    estatus?: boolean | null; // El estatus que se muestra en la tabla/se cambia
    telefono_uno?: string | null; // Campo de la tabla principal 'proveedores'
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido'; // Determinado por JOINs
  
    // Campos que podrían venir de la lista resumida (getAllProveedoresForAdmin)
    razon_social?: string | null; // De proveedores_morales
    nombre_fisica?: string | null; // De personas_fisicas
  
    // Campos COMPLETOS que vienen de getProveedorProfileById para la EDICIÓN
    giro_comercial?: string | null;
    calle?: string | null;
    numero?: string | null;
    colonia?: string | null;
    codigo_postal?: string | null;
    municipio?: string | null;
    estado?: string | null;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    fecha_inscripcion?: string | null;
    fecha_vigencia?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    fecha_solicitud?: string | null;
    id_usuario_proveedor?: number | null;
    estatus_revision?: string | null;
    // **NUEVOS CAMPOS (snake_case como vienen de la API/Servicio)**
    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;
    representantes?: RepresentanteLegalOutput[]; // <--- Array
  
    // Campos específicos completos (asegúrate que los nombres coincidan con getProveedorProfileById)
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    apellido_p_fisica?: string | null; // Nombre completo ya construido arriba
    apellido_m_fisica?: string | null;
    curp?: string | null;
  
     [key: string]: any; // Para flexibilidad
  }
  interface RepresentanteLegalOutput {
    id_morales: number; // El PK de la fila en proveedores_morales
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
    // añadir otros campos si los hubiera
}
  // Interfaz para datos del USUARIO proveedor (mantenida)
export interface UsuarioProveedorData {
     id_usuario: number;
     usuario: string;
     nombre: string;
     apellido_p: string;
     apellido_m: string | null; // Permitir null
     correo: string;
     estatus: boolean; // Asumiendo booleano
     // No incluir contraseña aquí
     [key: string]: any;
   }