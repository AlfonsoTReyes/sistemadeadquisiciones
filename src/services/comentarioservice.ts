import { sql } from "@vercel/postgres";

// ✅ Obtener todos los comentarios
export const getComentarios = async () => {
    try {
        const result = await sql`
        SELECT *
        FROM comentarios_documentos
        ORDER BY created_at DESC;
        `;
        return result.rows;
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        throw error;
    }
};

export const getComentariosById = async (id_comentario: string) => {
    try {
        const result = await sql`
        SELECT *
        FROM comentarios_documentos
        WHERE id_comentario=${id_comentario};
        `;
        return result.rows[0];
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        throw error;
    }
};

// 📚 Obtener comentarios por solicitud/documento/justificación
export const getComentariosbySolicitudDocumento = async (id_origen: number, tipo_origen: string) => {
    try {
        const result = await sql`
            SELECT cd.id_comentario,
                    cd.id_origen,
                    cd.tipo_origen,
                    cd.comentario,
                    cd.respuesta_a,
                    cd.created_at,
                    u.nombre AS nombre_usuario
            FROM comentarios_documentos AS cd
            LEFT JOIN usuarios AS u ON cd.id_usuario = u.id_usuario 
            WHERE cd.id_origen = ${id_origen} AND cd.tipo_origen = ${tipo_origen}
            ORDER BY cd.created_at ASC;
            `;
        return result.rows;
    } catch (error) {
        console.error("Error al obtener comentarios por solicitud/documento:", error);
        throw error;
    }
};

// ✏️ Crear un nuevo comentario
export const createComentario = async (data: {
  id_origen: number;
  tipo_origen: string;
  comentario: string;
  respuesta_a?: number | null;
  id_usuario?: number;
  id_solicitud: number;
}) => {
    try {
        const { id_origen, tipo_origen, comentario, respuesta_a, id_usuario, id_solicitud } = data;

        const result = await sql`
        INSERT INTO comentarios_documentos
        (id_solicitud, id_origen, tipo_origen, comentario, respuesta_a, id_usuario, created_at, updated_at)
        VALUES
        (${id_solicitud}, ${id_origen}, ${tipo_origen}, ${comentario}, ${respuesta_a || null}, ${id_usuario || null}, NOW(), NOW())
        RETURNING *;
        `;
        return result.rows[0]; // Retorna el nuevo comentario insertado
    } catch (error) {
        console.error("Error al crear comentario:", error);
        throw error;
    }
};

// ✏️ Actualizar un comentario existente
export const updateComentario = async (data: {
  id_comentario: number;
  comentario: string;
}) => {
    try {
        const { id_comentario, comentario } = data;

        const result = await sql`
        UPDATE comentarios_documentos
        SET comentario = ${comentario}, updated_at = NOW()
        WHERE id_comentario = ${id_comentario}
        RETURNING *;
        `;
        return result.rows[0]; // Retorna el comentario actualizado
    } catch (error) {
        console.error("Error al actualizar comentario:", error);
        throw error;
    }
};

// ❌ Eliminar un comentario
export const deleteComentario = async (id_comentario: number) => {
    try {
        await sql`
        DELETE FROM comentarios_documentos
        WHERE id_comentario = ${id_comentario};
        `;
        return { message: "Comentario eliminado correctamente." };
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
        throw error;
    }
};
