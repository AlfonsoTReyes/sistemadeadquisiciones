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

// También necesitarás la interfaz ProveedorData en este archivo o importada
// src/types/Proveedor.ts
export interface ProveedorData {
       id_proveedor: number;
       rfc: string;
       correo: string | null;
       estatus: boolean;
       telefono: string | null;
       tipo_proveedor: 'moral' | 'fisica' | 'desconocido';
   }

export interface UsuarioProveedorData {
    id_usuario: number;
    usuario: string;
    nombre: string;
    apellido_p: string;
    apellido_m: string;
    correo: string;
    estatus: string;
  }