export interface ArticuloCatalogo {
  id_articulo: number;
  nombre_articulo: string;
  descripcion_articulo?: string;
  unidad_medida?: string; // opcional si lo usarás
  precio_unitario?: number; // opcional si lo usarás
  codigo_partida?: string; // opcional si deseas saber de qué partida viene
}

// --- Partida con sus artículos ---
export interface PartidaConArticulos {
  codigo_partida: string;
  descripcion_partida: string;
  articulos: ArticuloCatalogo[];
}

// --- Proveedor en el catálogo ---
export interface ProveedorCatalogo {
  id_proveedor: number; // ← usamos siempre número para consistencia
  nombre_empresa: string;
  rfc: string;
  nombre_o_razon_social: string;
  giro_comercial: string;
  correo: string;
  partidas_asignadas: PartidaConArticulos[];
}

// --- Filtro de partidas para dropdown ---
export interface CatalogoPartidaFiltro {
  codigo: string;
  descripcion: string;
}