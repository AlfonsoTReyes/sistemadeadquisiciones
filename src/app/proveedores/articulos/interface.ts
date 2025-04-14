export interface ArticuloProveedor {
    id_articulo: number;
    id_proveedor: number;
    descripcion: string;
    unidad_medida: string;
    stock: number;
    precio_unitario: number;
    estatus: boolean;
    created_at: string | Date;
    updated_at: string | Date;
}

// Interfaz para los datos del formulario en el modal
export interface ArticuloFormData {
    descripcion: string;
    unidad_medida: string;
    stock: string;
    precio_unitario: string;
    estatus: boolean;
}

export interface CatalogoPartidaFiltro {
    codigo: string;
    descripcion: string;
}