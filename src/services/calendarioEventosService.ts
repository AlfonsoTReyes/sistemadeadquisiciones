import { sql } from "@vercel/postgres";

// 🔍 Obtener eventos por id_concurso
export const getEventosByConcurso = async (idConcurso: number) => {
  const result = await sql`
    SELECT 
      id_evento_calendario, id_concurso, acto, fecha_inicio, fecha_fin, 
      hora_inicio, hora_fin, descripcion_adicional, created_at, updated_at
    FROM public.calendario_bases
    WHERE id_concurso = ${idConcurso} AND estatus=true
    ORDER BY fecha_inicio ASC, hora_inicio ASC;
  `;
  return result.rows;
};

export const getEventoById = async (idEvento: number) => {
    const result = await sql`
      SELECT 
        id_evento_calendario, id_concurso, acto, fecha_inicio, fecha_fin, 
        hora_inicio, hora_fin, descripcion_adicional, created_at, updated_at
      FROM public.calendario_bases
      WHERE id_evento_calendario = ${idEvento};
    `;
    return result.rows[0];
  };

// ➕ Crear nuevo evento
export const crearEventoService = async (evento: any) => {
  const {
    id_concurso,
    acto,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    descripcion_adicional
  } = evento;

  await sql`
    INSERT INTO public.calendario_bases (
      id_concurso, acto, fecha_inicio, fecha_fin, 
      hora_inicio, hora_fin, descripcion_adicional, created_at, updated_at
    ) VALUES (
      ${id_concurso},
      ${acto},
      ${fecha_inicio},
      ${fecha_fin || null},
      ${hora_inicio || null},
      ${hora_fin || null},
      ${descripcion_adicional || null},
      NOW(),
      NOW()
    );
  `;
};

// ✏️ Modificar evento
export const modificarEventoService = async (idEvento: number, datos: any) => {
  const {
    acto,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    descripcion_adicional
  } = datos;

  await sql`
    UPDATE public.calendario_bases
    SET 
      acto = ${acto},
      fecha_inicio = ${fecha_inicio},
      fecha_fin = ${fecha_fin || null},
      hora_inicio = ${hora_inicio || null},
      hora_fin = ${hora_fin || null},
      descripcion_adicional = ${descripcion_adicional || null},
      updated_at = NOW()
    WHERE id_evento_calendario = ${idEvento};
  `;
};

// 🗑️ Eliminar evento
export const eliminarEventoService = async (idEvento: number) => {
  await sql`
    UPDATE public.calendario_bases
    SET 
      estatus = 'false',
      updated_at = NOW()
    WHERE id_evento_calendario = ${idEvento};
  `;
};
