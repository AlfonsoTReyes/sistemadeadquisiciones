import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRATION } from '../../../../config/jwtConfig';

import {getProveedorUserByUsername} from '../../../../services/proveedorusuarioservice';
import {checkProveedorProfileExists } from '../../../../services/proveedoresservice';


export async function POST(req: NextRequest) {
    try {
        const { usuario, contraseña } = await req.json();

        if (!usuario || !contraseña) {
            return NextResponse.json({ message: 'Usuario y contraseña son requeridos' }, { status: 400 });
        }

        const proveedorUser = await getProveedorUserByUsername(usuario);
        // ... (User not found check) ...
        if (!proveedorUser) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
        // ... (Status check) ...
        if (proveedorUser.estatus !== 'activo') return NextResponse.json({ message: "La cuenta del usuario no está activa" }, { status: 403 });
        // ... (Password check) ...
        let isPasswordCorrect = false;
        if (proveedorUser.contraseña) isPasswordCorrect = await bcrypt.compare(contraseña, proveedorUser.contraseña);
        if (!isPasswordCorrect) return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });

        // --- ADD PROFILE CHECK ---
        const userId = proveedorUser.id_usuario;
        const hasProfile = await checkProveedorProfileExists(userId);
        // --- END PROFILE CHECK ---

        // Generate JWT - Include profile status
        const tokenPayload = {
            id: userId,
            usuario: proveedorUser.usuario,
            nombre: proveedorUser.nombre,
            apellido_paterno: proveedorUser.apellido_paterno,
            apellido_materno: proveedorUser.apellido_materno,
            tipo: 'proveedor',
            hasProfile: hasProfile // Include flag in token
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        const { contraseña: _, ...userData } = proveedorUser;

        // Login successful - Include profile status in response body too
        return NextResponse.json({
            message: "Login exitoso",
            token,
            usuario: userData,
            hasProfile: hasProfile // Include flag in response
        });

    } catch (error: any) {
        console.error("CRITICAL ERROR en login de proveedor:", error);
        return NextResponse.json({ message: "Error interno del servidor durante el login", error: error.message || 'Unknown error' }, { status: 500 });
    }
}