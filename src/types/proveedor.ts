// ./src/types/proveedor.ts

// Interfaz básica para selectores o listas simples
export interface Proveedor {
    id_proveedor: number;
    nombre_o_razon_social: string; // Asumiendo que la API del selector devuelve este campo combinado
    rfc: string;
    // Podrías añadir tipo_proveedor si fuera útil para el selector, pero no es estrictamente necesario aquí
    // tipo_proveedor?: 'fisica' | 'moral';
}

export interface ProveedorDetallado {
    id_proveedor: number;
    rfc?: string;
    giro_comercial?: string;
    correo?: string;
    camara_comercial?: string | null;
    numero_registro_camara?: string | null;
    numero_registro_imss?: string | null;
    fecha_inscripcion?: string | null; // Considera usar Date si parseas
    fecha_vigencia?: string | null;   // Considera usar Date si parseas
    estatus?: boolean;
    created_at?: string | null; // Considera usar Date si parseas
    updated_at?: string | null; // Considera usar Date si parseas
    fecha_solicitud?: string | null; // Considera usar Date si parseas
    calle?: string;
    numero?: string;
    colonia?: string;
    codigo_postal?: string;
    municipio?: string;
    estado?: string;
    telefono_uno?: string;
    telefono_dos?: string | null;
    pagina_web?: string | null;
    id_usuario_proveedor?: number | null;
    actividad_sat?: string | null;
    proveedor_eventos?: boolean | null;
    estatus_revision?: string | null;
    razon_social?: string | null; // Moral
    nombre_representante?: string | null; // Moral
    apellido_p_representante?: string | null; // Moral
    apellido_m_representante?: string | null; // Moral
    nombre_fisica?: string | null; // Fisica
    apellido_p_fisica?: string | null; // Fisica
    apellido_m_fisica?: string | null; // Fisica
    curp?: string | null; // Fisica
    tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
    representantes?: RepresentanteLegalOutput[]; // Usamos una interfaz Output

    // Corregido: Reemplazado 'any' con 'unknown' para mayor seguridad de tipos
    [key: string]: unknown;
}

interface RepresentanteLegalOutput {
    id_morales: number; // PK de la fila en proveedores_morales
    nombre_representante?: string | null;
    apellido_p_representante?: string | null;
    apellido_m_representante?: string | null;
}