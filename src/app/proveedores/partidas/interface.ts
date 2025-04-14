export interface CatalogoPartida {
    codigo: string;
    descripcion: string;
}

export interface ProveedorPartidaSeleccionada {
    codigo_partida: string;
    descripcion: string;
}
export interface SelectOption {
    value: string; // codigo_partida
    label: string; // "codigo - descripcion"
}