import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRATION } from '../../../../config/jwtConfig';

import {
    getProveedorUserByUsername,

} from '../../../../services/proveedorusuarioservice';

export async function POST(req: NextRequest) {
    console.log("DEBUG: Hit /api/proveedorusuario/login endpoint");
    try {
        const { usuario, contraseña } = await req.json();

        if (!usuario || !contraseña) {
            // This sends valid JSON back
            return NextResponse.json({ message: 'Usuario y contraseña son requeridos' }, { status: 400 });
        }

        // --- Potential failure point 1: DB Error ---
        console.log(`DEBUG: Searching for user: ${usuario}`);
        const proveedorUser = await getProveedorUserByUsername(usuario);
        console.log(`DEBUG: User found:`, proveedorUser ? 'Yes' : 'No');

        if (!proveedorUser) {
            // This sends valid JSON back
            return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
        }

        // --- Potential failure point 2: Status Check ---
        if (proveedorUser.estatus !== 'activo') {
            // This sends valid JSON back
            return NextResponse.json({ message: "La cuenta del usuario no está activa" }, { status: 403 });
        }

        // --- Potential failure point 3: Password Compare Error ---
        let isPasswordCorrect = false;
        if (proveedorUser.contraseña) { // Ensure hash exists
             isPasswordCorrect = await bcrypt.compare(contraseña, proveedorUser.contraseña);
        }
        if (!isPasswordCorrect) {
            // This sends valid JSON back
            return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });
        }

        // --- Potential failure point 4: JWT Error ---
        const tokenPayload = {
            id: proveedorUser.id_usuario,
            usuario: proveedorUser.usuario,
            nombre: proveedorUser.nombre, // You might want apellido_paterno etc. here too
            apellido_paterno: proveedorUser.apellido_paterno,
            apellido_materno: proveedorUser.apellido_materno,
            tipo: 'proveedor'
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });


        const { contraseña: _, ...userData } = proveedorUser; // Omit password hash

        // If successful, this sends valid JSON back
        return NextResponse.json({ message: "Login exitoso", token, usuario: userData });

    } catch (error: any) {
        // --- THIS is where an unexpected crash often happens ---
        console.error("CRITICAL ERROR en login de proveedor:", error); // Check server logs for this!
        // Send a JSON response even on unexpected errors
        return NextResponse.json({ message: "Error interno del servidor durante el login", error: error.message || 'Unknown error' }, { status: 500 });
    }
}