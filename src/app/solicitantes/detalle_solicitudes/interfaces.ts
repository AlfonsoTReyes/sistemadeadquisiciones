export interface Solicitud {
    id_solicitud: number;
    nomina_solicitante: string;
    secretaria: string;
    motivo: string;
    fecha_solicitud: string;
    estatus: string;
    folio: string;
    id_usuario: number;
    monto: number;
    nombre_secretaria: string;
}

export interface Justificacion {
    id_justificacion: number;
    id_solicitud: number;
    lugar: string;
    fecha_hora: string;
    no_oficio: string;
    asunto: string;
    nombre_dirigido: string;
    planteamiento: string;
    antecedente: string;
    necesidad: string;
    fundamento_legal: string;
    uso: string;
    consecuencias: string;
    historicos_monetarios: string;
    marcas_especificas: string;
    estatus: string;
}

export interface TechoPresupuestal {
    id_suficiencia: number;
    id_solicitud: number;
    id_usuario: number;
    monto_aprobado: number;
    oficio: string;
    id_documento: number;
    contendio: string;
    firma_digital_finanzas: string;
    fecha_contestacion: string;
    estatus: string;
    comentario: string;
    created_at: string;
    updated_at: string;
}

export interface TechoPresupuestalRespuesta {
    id_documento_suficiencia: number;
    id_suficiencia: number;
    nombre_original: string;
    ruta_archivo: string;
    nombre_usuario: string;
    tipo: string;
    created_at: string;
    updated_at: string;
    fecha_respuesta: string;
}

export interface DocumentosAdicionales {
    id_doc_solicitud: number;
    id_usuario: number;
    id_solicitud: number;
    tipo_documento: string;
    nombre_original: string;
    ruta_archivo: string;
    estatus: string;
    created_at: string;
    updated_at: string;
}

export interface DetallesSolicitud {
    solicitud: Solicitud | null;
    justificacion: Justificacion | null;
    techoPresupuestal: TechoPresupuestal | null;
    techoPresupuestalRespuesta: TechoPresupuestalRespuesta | null;

    documentos_adicionales: DocumentosAdicionales[] | null;
}
