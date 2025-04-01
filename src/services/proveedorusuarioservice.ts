import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs'; // Import bcrypt for hashing

// Interface for provider user data (excluding password)
export interface ProveedorUsuario {
    id_usuario: number;
    usuario: string;
    nombre: string;
    // apellido: string; // Removed single apellido
    apellido_p: string; // Added
    apellido_m?: string; // Added (optional)
    correo: string;
    estatus: string;
    created_at: Date;
    updated_at: Date;
}

// Interface for raw DB result including password hash
interface ProveedorUsuarioConHash extends ProveedorUsuario {
    contraseña?: string;
}

// Get provider user by username for login check (Login doesn't need apellido changes)
export const getProveedorUserByUsername = async (username: string): Promise<ProveedorUsuarioConHash | null> => {
    try {
        // Select the new apellido columns
        const result = await sql<ProveedorUsuarioConHash>`
            SELECT id_usuario, usuario, nombre, apellido_p, apellido_m,
                   correo, contraseña, estatus, created_at, updated_at
            FROM usuarios_proveedores
            WHERE correo = ${username};
        `;
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching provider user by username:", error);
        throw new Error('Error al buscar el usuario proveedor.');
    }
};

// Create a new provider user (signup) - Adjusted parameters and INSERT
export const createProveedorUser = async (userData: {
    usuario: string;
    nombre: string;
    // apellido: string; // Removed
    apellidoPaterno: string; // Added
    apellidoMaterno?: string; // Added (optional)
    correo: string;
    contraseña: string;
}): Promise<ProveedorUsuario> => {
    const { usuario, nombre, apellidoPaterno, apellidoMaterno, correo, contraseña } = userData;

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    try {
        // Use new apellido columns in INSERT and RETURNING
        const result = await sql`
            INSERT INTO usuarios_proveedores (
                usuario, nombre, apellido_p, apellido_m, -- Updated columns
                correo, contraseña, estatus, created_at, updated_at
            ) VALUES (
                ${usuario}, ${nombre}, ${apellidoPaterno}, ${apellidoMaterno ?? null}, -- Use ?? null for optional apellidoMaterno
                ${correo}, ${hashedPassword},
                'activo',
                NOW(), NOW()
            )
            RETURNING id_usuario, usuario, nombre, apellido_p, apellido_m, -- Updated RETURNING
                      correo, estatus, created_at, updated_at;
        `;

        return result.rows[0] as ProveedorUsuario;
    } catch (error: any) {
        console.error("Error creating provider user:", error);
        if (error.code === '23505') {
             if (error.constraint === 'usuarios_proveedores_usuario_key') {
                 throw new Error(`El nombre de usuario '${usuario}' ya existe.`);
             }
             if (error.constraint === 'usuarios_proveedores_correo_key') {
                  throw new Error(`El correo electrónico '${correo}' ya está registrado.`);
             }
        }
        throw new Error('Error al registrar el usuario proveedor.');
    }
};

// Optional: Functions to check if username or email already exist before attempting insert
export const checkProveedorUsernameExists = async (username: string): Promise<boolean> => {
    try {
        const result = await sql`SELECT 1 FROM usuarios_proveedores WHERE usuario = ${username} LIMIT 1;`;
        return result.rows.length > 0;
    } catch (error) {
         console.error("Error checking provider username:", error);
         throw new Error('Error al verificar el nombre de usuario.');
    }
};

export const checkProveedorEmailExists = async (correo: string): Promise<boolean> => {
    try {
        const result = await sql`SELECT 1 FROM usuarios_proveedores WHERE correo = ${correo} LIMIT 1;`;
        return result.rows.length > 0;
    } catch (error) {
         console.error("Error checking provider email:", error);
         throw new Error('Error al verificar el correo electrónico.');
    }
};