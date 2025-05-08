// src/app/catalogos/proveedores/interface.ts

// Artículo como se muestra en el catálogo público
export interface ArticuloCatalogo {
  id_articulo: number; // o string, según el backend
  codigo_partida: string;
  descripcion: string;
  unidad_medida: string;
  precio_unitario: number;
}

// Partida asociada a un proveedor
export interface PartidaProveedorCatalogo {
    codigo_partida: string;
    descripcion: string;
}

// Información completa del proveedor para mostrar en el catálogo
export interface ProveedorCatalogo {
    id_proveedor: number;
    rfc: string;
    nombre_o_razon_social: string; // Nombre o Razón Social combinados
    giro_comercial: string | null;
    correo: string | null;
    telefono_uno: string | null;
    pagina_web: string | null;
    // Puedes añadir más campos de 'proveedores' si quieres mostrarlos
    partidas: PartidaProveedorCatalogo[];
    articulos: ArticuloCatalogo[];
}

// Para el dropdown de filtro
export interface CatalogoPartidaFiltro {
    codigo: string;
    descripcion: string;
}